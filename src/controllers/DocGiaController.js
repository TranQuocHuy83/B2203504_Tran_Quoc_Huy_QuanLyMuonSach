const DocGia = require("../models/DocGia");
const bcrypt = require("bcryptjs"); // băm mật khẩu
const jwt = require("jsonwebtoken"); // xác thực

// LẤY TOÀN BỘ ĐỘC GIẢ
exports.getAll = async (req, res) => {
  //Đây là hàm controller dạng async, cho phép dùng await
  // exports.getAll = ... cách xuất hàm để controller có thể được dùng bên ngoài.
  try {
    const dg = await DocGia.find({ isDeleted: false });
    res.json(dg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hàm bỏ dấu tiếng Việt
function removeVietnameseTones(str) {
  return str
    .normalize("NFD") //tách dấu để dễ xóa
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d") // tách riêng vì ko thuộc hệ dấu Unicode
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// LẤY ĐỘC GIẢ THEO TÊN (CÓ XỬ LÝ KHÔNG DẤU & HOA THƯỜNG)

exports.getByName = async (req, res) => {
  try {
    const inputName = req.params.ten.trim();
    const normalizedInput = removeVietnameseTones(inputName);

    // Lấy tất cả độc giả ra, rồi lọc theo tên không dấu
    const allDocGia = await DocGia.find({ isDeleted: false });
    const matchedDocGia = allDocGia.filter((dg) => {
      const normalizedDocGia = removeVietnameseTones(dg.HOTENDG);
      return normalizedDocGia.includes(normalizedInput);
    });

    if (matchedDocGia.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy độc giả phù hợp" });
    }

    res.status(200).json(matchedDocGia);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ĐĂNG KÍ ĐỘC GIẢ (có mã hóa mật khẩu + kiểm tra định dạng MADOCGIA)
exports.create = async (req, res) => {
  try {
    const {
      MADOCGIA,
      HOTENDG,
      NGAYSINH,
      PHAI,
      DIACHI,
      DIENTHOAI,
      EMAIL,
      PASSWORD,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!MADOCGIA || !HOTENDG || !NGAYSINH || !PHAI || !DIACHI || !PASSWORD) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    // Kiểm tra định dạng MADOCGIA: phải bắt đầu bằng 'DG' + 3 chữ số
    const dgRegex = /^DG\d{3}$/;
    if (!dgRegex.test(MADOCGIA)) {
      return res.status(400).json({
        message: "Mã độc giả phải có định dạng hợp lệ, ví dụ: DG001, DG002...",
      });
    }

    // Kiểm tra trùng mã độc giả
    const existed = await DocGia.findOne({ MADOCGIA });
    if (existed) {
      return res.status(400).json({ message: "Mã độc giả đã tồn tại!" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // Chuyển NGAYSINH sang kiểu Date
    const parsedDate = new Date(NGAYSINH);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: "Ngày sinh không hợp lệ!" });
    }

    // Tạo độc giả mới
    const newDocGia = new DocGia({
      MADOCGIA,
      HOTENDG,
      NGAYSINH: parsedDate,
      PHAI,
      DIACHI,
      DIENTHOAI,
      EMAIL,
      PASSWORD: hashedPassword,
    });

    await newDocGia.save();

    res.status(201).json({
      message: "Đăng ký thành công!",
      newDocGia,
    });
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ message: "Lỗi khi đăng ký độc giả: " + err.message });
  }
};

// ĐĂNG NHẬP ĐỘC GIẢ
exports.login = async (req, res) => {
  try {
    const { MADOCGIA, PASSWORD } = req.body;

    // Tìm độc giả theo mã
    const user = await DocGia.findOne({ MADOCGIA });
    if (!user)
      return res.status(400).json({ message: "Sai thông tin đăng nhập!" });

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(PASSWORD, user.PASSWORD);
    if (!isMatch)
      return res.status(400).json({ message: "Sai thông tin đăng nhập!" });

    // Payload JWT
    const payload = {
      id: user._id,
      MADOCGIA: user.MADOCGIA,
      HOTENDG: user.HOTENDG,
    };

    // Tạo JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        MADOCGIA: user.MADOCGIA,
        HOTENDG: user.HOTENDG,
        NGAYSINH: user.NGAYSINH,
        PHAI: user.PHAI,
        DIACHI: user.DIACHI,
        DIENTHOAI: user.DIENTHOAI,
        EMAIL: user.EMAIL,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CẬP NHẬT ĐỘC GIẢ THEO MÃ ĐỘC GIẢ
exports.update = async (req, res) => {
  try {
    const updated = await DocGia.findOneAndUpdate(
      { MADOCGIA: req.params.MADOCGIA },
      req.body,
      { new: true } // trả về dữ liệu mới sau khi update
    );
    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy độc giả" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// XÓA ĐỘC GIẢ THEO MÃ ĐỘC GIẢ
exports.delete = async (req, res) => {
  try {
    const deleted = await DocGia.findOneAndUpdate(
      { MADOCGIA: req.params.MADOCGIA },
      { isDeleted: true },
      { new: true }
    );

    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy độc giả" });

    res.json({ message: "Đã xóa độc giả (soft delete)", deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LẤY ĐỘC GIẢ THEO MÃ ĐỘC GIẢ
exports.getById = async (req, res) => {
  try {
    const { MADOCGIA } = req.params;

    const docGia = await DocGia.findOne({
      MADOCGIA,
      isDeleted: false, // không lấy các record đã bị xóa mềm
    });

    if (!docGia) {
      return res.status(404).json({ message: "Không tìm thấy độc giả!" });
    }

    res.json(docGia);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ĐỔI MẬT KHẨU ĐỘC GIẢ
exports.changePassword = async (req, res) => {
  try {
    const { MADOCGIA } = req.params;
    const { oldPassword, newPassword } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới." });
    }

    // Tìm độc giả trong CSDL
    const docGia = await DocGia.findOne({ MADOCGIA });
    if (!docGia) {
      return res.status(404).json({ message: "Không tìm thấy độc giả." });
    }

    // Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await bcrypt.compare(oldPassword, docGia.PASSWORD);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không chính xác." });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật lại mật khẩu trong database
    docGia.PASSWORD = hashedPassword;
    await docGia.save();

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
