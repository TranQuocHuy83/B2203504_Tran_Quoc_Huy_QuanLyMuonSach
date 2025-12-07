const NHAXUATBAN = require("../models/NhaXuatBan");

// LẤY TOÀN BỘ NHÀ XUẤT BẢN

exports.getAll = async (req, res) => {
  try {
    const nxb = await NHAXUATBAN.find({ isDeleted: false });
    res.json(nxb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// THÊM MỚI NHÀ XUẤT BẢN

exports.create = async (req, res) => {
  try {
    const newNXB = new NHAXUATBAN(req.body);
    const saved = await newNXB.save();
    res.status(201).json(saved);
  } catch (err) {
    //Lỗi trùng mã MANXB
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Mã Nhà Xuất Bản đã tồn tại.",
      });
    }

    res.status(400).json({ message: err.message });
  }
};

// Hàm bỏ dấu tiếng Việt
function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// LẤY NHÀ XUẤT BẢN THEO TÊN (CÓ XỬ LÝ KHÔNG DẤU & HOA THƯỜNG)

exports.getByName = async (req, res) => {
  try {
    const inputName = req.params.ten.trim();
    const normalizedInput = removeVietnameseTones(inputName);

    // Lấy tất cả NXB ra, rồi lọc theo tên không dấu
    const allNXB = await NHAXUATBAN.find({ isDeleted: false });
    const matchedNXB = allNXB.filter((nxb) => {
      const normalizedNXB = removeVietnameseTones(nxb.TENNXB);
      return normalizedNXB.includes(normalizedInput);
    });

    if (matchedNXB.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy nhà xuất bản phù hợp" });
    }

    res.status(200).json(matchedNXB);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CẬP NHẬT NXB THEO MANXB
exports.update = async (req, res) => {
  try {
    const updated = await NHAXUATBAN.findOneAndUpdate(
      { MANXB: req.params.MANXB },
      req.body,
      { new: true }
    );
    if (!updated)
      return res
        .status(404)
        .json({ message: "Không tìm thấy NXB để cập nhật" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// XÓA  NXB THEO MANXB
exports.remove = async (req, res) => {
  try {
    const deleted = await NHAXUATBAN.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true }, // đánh dấu đã xóa
      { new: true } // trả về document đã cập nhật
    );

    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy NXB để xóa" });

    res.json({ message: "Đã xóa NXB (soft delete)", deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
