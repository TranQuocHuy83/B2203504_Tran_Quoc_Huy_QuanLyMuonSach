const mongoose = require("mongoose");

const TheoDoiMuonSach = require("../models/TheoDoiMuonSach");
const Sach = require("../models/Sach");
const DocGia = require("../models/DocGia");

const TheoDoiMuonSachController = {
  // --------------------------- Lấy tất cả bản ghi
  getAll: async (req, res) => {
    try {
      const list = await TheoDoiMuonSach.find({ isDeleted: false });
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // --------------------------- Lấy theo mã độc giả
  getByMaDocGia: async (req, res) => {
    try {
      const { madocgia } = req.params;
      const list = await TheoDoiMuonSach.find({
        MADOCGIA: madocgia,
        isDeleted: false,
      });

      if (!list.length)
        return res
          .status(404)
          .json({ message: "Không có bản ghi cho độc giả này" });

      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // --------------------------- Lấy theo mã sách
  getByMaSach: async (req, res) => {
    try {
      const { masach } = req.params;
      const list = await TheoDoiMuonSach.find({
        MASACH: masach,
        isDeleted: false,
      });

      if (!list.length)
        return res
          .status(404)
          .json({ message: "Không có bản ghi cho sách này" });

      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  // --------------------------- Lấy theo ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await TheoDoiMuonSach.findById(id);
      if (!record)
        return res.status(404).json({ message: "Không tìm thấy bản ghi" });
      res.json(record);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // ======================================================================
  // 🟢 1) ĐĂNG KÝ MƯỢN → pending (KHÔNG trừ số lượng sách)
  // ======================================================================
  dangKyMuon: async (req, res) => {
    try {
      const { MADOCGIA, MASACH } = req.body;

      const docgia = await DocGia.findOne({ MADOCGIA });
      if (!docgia)
        return res.status(404).json({ message: "Không tìm thấy độc giả" });

      const sach = await Sach.findOne({ MASACH });
      if (!sach)
        return res.status(404).json({ message: "Không tìm thấy sách" });

      if (sach.SOQUYEN <= 0)
        return res.status(400).json({ message: "Sách đã hết" });

      // Kiểm tra đã có pending chưa
      const tonTai = await TheoDoiMuonSach.findOne({
        MADOCGIA,
        MASACH,
        TRANGTHAI: "pending",
      });

      if (tonTai)
        return res
          .status(400)
          .json({ message: "Bạn đã đăng ký mượn sách này!" });

      // 🔥  Kiểm tra đang mượn cuốn này chưa trả
      const dangMuon = await TheoDoiMuonSach.findOne({
        MADOCGIA,
        MASACH,
        TRANGTHAI: "borrowed",
      });

      if (dangMuon) {
        return res.status(400).json({
          message: "Bạn đang mượn cuốn sách này nhưng chưa trả!",
        });
      }

      const newRecord = new TheoDoiMuonSach({
        MADOCGIA,
        MASACH,
        TRANGTHAI: "pending",
      });

      await newRecord.save();

      res.json({ message: "Đăng ký mượn thành công", record: newRecord });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // ======================================================================
  // 🔵 2) XÁC NHẬN ĐÃ LẤY SÁCH → borrowed (LÚC NÀY mới trừ sách)
  // ======================================================================
  xacNhanMuon: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await TheoDoiMuonSach.findById(id);

      if (!record)
        return res.status(404).json({ message: "Không tìm thấy bản ghi" });
      if (record.TRANGTHAI !== "pending")
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });

      const sach = await Sach.findOne({ MASACH: record.MASACH });
      if (!sach)
        return res.status(404).json({ message: "Không tìm thấy sách" });

      if (sach.SOQUYEN <= 0)
        return res.status(400).json({ message: "Sách đã hết" });

      // cập nhật trạng thái
      record.TRANGTHAI = "borrowed";
      record.NGAYMUON = new Date();

      // vẫn GIỮ NGÀY TRẢ DỰ KIẾN (14 ngày – 17:00) ⬇
      const ngay = record.NGAYMUON;
      record.HANTRA = new Date(
        ngay.getFullYear(),
        ngay.getMonth(),
        ngay.getDate() + 14,
        17,
        0,
        0,
        0
      );

      await record.save();

      // TRỪ SÁCH
      sach.SOQUYEN -= 1;
      await sach.save();

      res.json({ message: "Xác nhận cho mượn thành công", record });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // ======================================================================
  // 🔴 3) HỦY ĐĂNG KÝ → cancelled (chỉ khi pending, KHÔNG tác động số lượng sách)
  // ======================================================================
  huyDangKy: async (req, res) => {
    try {
      const { id } = req.params;

      const record = await TheoDoiMuonSach.findById(id);
      if (!record)
        return res.status(404).json({ message: "Không tìm thấy bản ghi" });

      if (record.TRANGTHAI !== "pending")
        return res
          .status(400)
          .json({ message: "Không thể hủy vì sách đã được mượn" });

      record.TRANGTHAI = "cancelled";
      await record.save();

      res.json({ message: "Đã hủy đăng ký mượn" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // ======================================================================
  // 🟡 4) TRẢ SÁCH → returned (CỘNG sách lại)
  // ======================================================================
  traSach: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "ID không hợp lệ" });

      const record = await TheoDoiMuonSach.findById(id);
      if (!record)
        return res.status(404).json({ message: "Không tìm thấy bản ghi" });

      if (record.TRANGTHAI !== "borrowed")
        return res.status(400).json({ message: "Sách chưa được mượn" });

      // cập nhật
      record.NGAYTRA = new Date();
      record.TRANGTHAI = "returned";
      await record.save();

      // cộng sách lại
      const sach = await Sach.findOne({ MASACH: record.MASACH });
      if (sach) {
        sach.SOQUYEN += 1;
        await sach.save();
      }

      res.json({ message: "Trả sách thành công", record });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // ----------------------------------------------------------------------
  // Đếm số sách đang mượn
  // ----------------------------------------------------------------------
  countBorrowedByMaSach: async (req, res) => {
    try {
      const { masach } = req.params;

      const count = await TheoDoiMuonSach.countDocuments({
        MASACH: masach,
        TRANGTHAI: { $in: ["dangmuon", "borrowed"] },
      });

      res.json({ MASACH: masach, dangMuon: count });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  // XÓA BẢN GHI
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      // Kiểm tra id hợp lệ
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "ID không hợp lệ" });

      // Xóa mềm: chỉ đánh dấu isDeleted = true
      const record = await TheoDoiMuonSach.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true } // trả về bản ghi đã cập nhật
      );

      if (!record)
        return res.status(404).json({ message: "Không tìm thấy bản ghi" });

      res.json({ message: "Đã xóa bản ghi (soft delete)", record });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = TheoDoiMuonSachController;
