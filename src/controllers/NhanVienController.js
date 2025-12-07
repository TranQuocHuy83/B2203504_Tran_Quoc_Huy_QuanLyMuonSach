const NhanVien = require("../models/NhanVien");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ------------------------------------------- Lấy tất cả nhân viên
exports.getAll = async (req, res) => {
  try {
    const nhanviens = await NhanVien.find();
    res.json(nhanviens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// -------------------------------------------- Đăng ký nhân viên mới
exports.register = async (req, res) => {
  try {
    const { MSNV, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai } = req.body;

    // Kiểm tra các trường bắt buộc
    const requiredFields = {
      MSNV,
      HoTenNV,
      Password,
      DiaChi,
      SoDienThoai,
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value)
        return res.status(400).json({ message: `Thiếu thông tin: ${key}` });
    }

    // Kiểm tra trùng mã nhân viên
    const existingNV = await NhanVien.findOne({ MSNV });
    if (existingNV) {
      return res.status(400).json({ message: "Mã số nhân viên đã tồn tại!" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    // Tạo nhân viên mới
    const nhanVien = new NhanVien({
      MSNV,
      HoTenNV,
      Password: hashedPassword,
      ChucVu: ChucVu || "Nhân viên thư viện",
      DiaChi,
      SoDienThoai,
    });

    await nhanVien.save();
    res
      .status(201)
      .json({ message: "Đăng ký tài khoản nhân viên thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//-------------------------------------------- Đăng nhập nhân viên
exports.login = async (req, res) => {
  try {
    const { MSNV, Password } = req.body;

    // Tìm nhân viên theo mã số
    const user = await NhanVien.findOne({ MSNV });
    if (!user) {
      return res.status(400).json({ message: "Sai thông tin đăng nhập!" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai thông tin đăng nhập!" });
    }

    // Tạo payload cho token
    const payload = {
      id: user._id,
      MSNV: user.MSNV,
      HoTenNV: user.HoTenNV,
      ChucVu: user.ChucVu,
    };

    // Ký JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        MSNV: user.MSNV,
        HoTenNV: user.HoTenNV,
        ChucVu: user.ChucVu,
        DiaChi: user.DiaChi,
        SoDienThoai: user.SoDienThoai,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ----------------------------------------------- Cập nhật nhân viên theo mã nhân viên
exports.update = async (req, res) => {
  try {
    const updated = await NhanVien.findOneAndUpdate(
      { MSNV: req.params.MSNV },
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
//-------------------------------------------- Đổi mật khẩu nhân viên
exports.changePassword = async (req, res) => {
  try {
    const { MSNV } = req.params; // lấy mã số nhân viên từ URL
    const { oldPassword, newPassword } = req.body;

    // Kiểm tra đầu vào
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới." });
    }

    // Tìm nhân viên trong DB
    const nhanVien = await NhanVien.findOne({ MSNV });
    if (!nhanVien) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên." });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, nhanVien.Password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không chính xác." });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới
    nhanVien.Password = hashedPassword;
    await nhanVien.save();

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
