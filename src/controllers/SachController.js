// src/controllers/Sach.js
const Sach = require("../models/Sach");
const NHAXUATBAN = require("../models/NhaXuatBan");
//  Hàm bỏ dấu tiếng Việt (an toàn khi str là undefined/null)
function removeVietnameseTones(str) {
  if (typeof str !== "string") return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// LẤY TẤT CẢ SÁCH
exports.getAll = async (req, res) => {
  try {
    const books = await Sach.find({ isDeleted: false });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= TÌM LẦN LƯỢT TỪNG TIÊU CHÍ =================
exports.searchBook = async (req, res) => {
  try {
    const kwRaw = (req.params.kw || "").trim();
    const cleanKw = removeVietnameseTones(kwRaw);

    // Lấy toàn bộ sách chưa xóa
    const books = await Sach.find({ isDeleted: false });

    // Nếu không có từ khóa -> trả về toàn bộ sách (không tìm)
    if (!cleanKw) {
      return res.json({
        type: "all",
        count: books.length,
        data: books,
      });
    }

    // ================== 1) TÌM THEO TÊN SÁCH ==================
    let result = books.filter((b) =>
      removeVietnameseTones(b.TENSACH || "").includes(cleanKw)
    );

    if (result.length > 0) {
      return res.json({
        type: "name",
        count: result.length,
        data: result,
      });
    }

    // ================== 2) TÌM THEO TÁC GIẢ ==================
    result = books.filter((b) =>
      removeVietnameseTones(b.TACGIA || "").includes(cleanKw)
    );

    if (result.length > 0) {
      return res.json({
        type: "author",
        count: result.length,
        data: result,
      });
    }

    // ================== 3) TÌM THEO NHÀ XUẤT BẢN ==================
    const allNXB = await NHAXUATBAN.find({ isDeleted: false });
    const matchedNXB = allNXB.filter((nxb) =>
      removeVietnameseTones(nxb.TENNXB || "").includes(cleanKw)
    );
    if (matchedNXB.length > 0) {
      const codes = matchedNXB.map((n) => n.MANXB);
      const resultNXB = books.filter((b) => codes.includes(b.MANXB));

      return res.json({
        type: "publisher",
        count: resultNXB.length,
        data: resultNXB,
      });
    }

    // ================== 4) KHÔNG TÌM THẤY ==================
    return res.status(404).json({ message: "Không tìm thấy kết quả!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// THÊM SÁCH MỚI
exports.create = async (req, res) => {
  try {
    const { MASACH, TENSACH, TACGIA, DONGIA, SOQUYEN, NAMXUATBAN, MANXB } =
      req.body;

    // Kiểm tra trùng mã sách
    const existing = await Sach.findOne({ MASACH });
    if (existing)
      return res.status(400).json({ message: "Mã sách đã tồn tại" });

    // Kiểm tra NXB có tồn tại không (theo MANXB)
    const nxb = await NHAXUATBAN.findOne({ MANXB });
    if (!nxb)
      return res.status(400).json({ message: "Nhà xuất bản không tồn tại" });

    // Tạo sách mới
    const newSach = new Sach({
      MASACH,
      TENSACH,
      TACGIA,
      DONGIA,
      SOQUYEN,
      NAMXUATBAN,
      MANXB, // chỉ lưu mã
    });

    const saved = await newSach.save();

    // Nếu muốn trả thêm thông tin NXB đầy đủ:
    const nxbInfo = await NHAXUATBAN.findOne({ MANXB });
    res.status(201).json({ ...saved.toObject(), NXB: nxbInfo });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// LẤY SÁCH THEO TÊN (KHÔNG DẤU, KHÔNG PHÂN BIỆT HOA/THƯỜNG)
exports.getByName = async (req, res) => {
  try {
    const inputName = req.params.ten.trim();
    const normalizedInput = removeVietnameseTones(inputName);

    // Lấy tất cả sách
    const allBooks = await Sach.find({ isDeleted: false });

    // Lọc danh sách theo tên đã loại dấu
    const matchedBooks = allBooks.filter((book) =>
      removeVietnameseTones(book.TENSACH || "").includes(normalizedInput)
    );

    if (matchedBooks.length === 0)
      return res.status(404).json({ message: "Không tìm thấy sách phù hợp" });

    res.status(200).json(matchedBooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TÌM SÁCH THEO TÊN TÁC GIẢ (KHÔNG DẤU)
exports.getByAuthor = async (req, res) => {
  try {
    const inputAuthor = req.params.tacgia.trim();
    const normalizedInput = removeVietnameseTones(inputAuthor);

    // Lấy tất cả sách chưa bị xóa
    const allBooks = await Sach.find({ isDeleted: false });

    // Lọc theo tên tác giả
    const matchedBooks = allBooks.filter((book) =>
      removeVietnameseTones(book.TACGIA || "").includes(normalizedInput)
    );

    if (matchedBooks.length === 0)
      return res
        .status(404)
        .json({ message: "Không tìm thấy sách theo tác giả đã cho" });

    res.status(200).json(matchedBooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TÌM SÁCH THEO TÊN NXB (KHÔNG DẤU)
exports.getByNXB = async (req, res) => {
  try {
    const inputNXB = req.params.tennxb.trim();
    const normalizedInput = removeVietnameseTones(inputNXB);

    // Lấy toàn bộ NXB chưa bị xóa
    const allNXB = await NHAXUATBAN.find({ isDeleted: false });

    // Tìm NXB có tên khớp
    const matchedNXB = allNXB.filter((nxb) =>
      removeVietnameseTones(nxb.TENNXB || "").includes(normalizedInput)
    );

    if (!matchedNXB.length)
      return res
        .status(404)
        .json({ message: "Không tìm thấy nhà xuất bản phù hợp" });

    // Lấy danh sách MANXB
    const publisherCodes = matchedNXB.map((nxb) => nxb.MANXB);

    // Tìm toàn bộ sách thuộc các NXB đó
    const books = await Sach.find({
      MANXB: { $in: publisherCodes },
      isDeleted: false,
    });

    if (!books.length)
      return res.status(404).json({
        message: "Không có sách nào của nhà xuất bản này",
      });

    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CẬP NHẬT SÁCH
exports.update = async (req, res) => {
  try {
    const { MANXB } = req.body;

    // Nếu có MANXB thì kiểm tra xem NXB có tồn tại không
    if (MANXB) {
      const nxb = await NHAXUATBAN.findOne({ MANXB });
      if (!nxb)
        return res.status(400).json({ message: "Nhà xuất bản không tồn tại" });
    }

    // Cập nhật sách theo MASACH (không dùng _id)
    const updated = await Sach.findOneAndUpdate(
      { MASACH: req.params.MASACH, isDeleted: false },
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy sách" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// XÓA SÁCH
exports.remove = async (req, res) => {
  try {
    const deleted = await Sach.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true }, // đánh dấu đã xóa
      { new: true } // trả về document đã cập nhật
    );

    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy sách" });
    res.json({ message: "Đã xóa sách thành công (soft delete)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LẤY SÁCH THEO MÃ (MASACH)

exports.getByMasach = async (req, res) => {
  try {
    const masach = req.params.masach.trim();

    // Lấy sách theo MASACH
    const book = await Sach.findOne({ MASACH: masach, isDeleted: false });
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

    // Lấy thông tin NXB
    const nxb = await NHAXUATBAN.findOne({ MANXB: book.MANXB });

    res.status(200).json({
      ...book.toObject(),
      TENNXB: nxb?.TENNXB || "",
      DIACHI: nxb?.DIACHI || "",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
