const mongoose = require("mongoose");

const TheoDoiMuonSachSchema = new mongoose.Schema(
  {
    // Mã độc giả (liên kết tới DocGia.MADOCGIA)
    MADOCGIA: {
      type: String,
      required: true,
      ref: "DocGia", // ref vẫn giữ để có thể populate theo mã nếu cần
    },

    // Mã sách (liên kết tới Sach.MASACH)
    MASACH: {
      type: String,
      required: true,
      ref: "Sach",
    },

    //Ngày mượn & ngày trả
    NGAYMUON: { type: Date, default: Date.now },
    HANTRA: {
      type: Date,
      default: function () {
        const ngayMuon = this.NGAYMUON ? new Date(this.NGAYMUON) : new Date();

        // cộng 14 ngày
        const hanTra = new Date(
          ngayMuon.getFullYear(),
          ngayMuon.getMonth(),
          ngayMuon.getDate() + 14,
          17,
          0,
          0,
          0 // giờ 17:00
        );

        return hanTra;
      },
    },
    NGAYTRA: { type: Date },

    // 🔹 Trạng thái (đã trả hay chưa)
    TRANGTHAI: {
      type: String,
      enum: ["pending", "borrowed", "returned", "cancelled"],
      // 🟢 1. Đăng ký → trạng thái: pending - Không trừ số lượng (CHỜ LẤY SÁCH)
      // 🔵 2. Xác nhận lấy → borrowed - Trừ SOQUYEN (ĐÃ LẤY SÁCH)
      // 🔴 3. Hủy khi pending → cancelled - SOQUYEN += 1 (ĐÃ HỦY ĐĂNG KÝ SÁCH)
      // 🟡 4. Trả sách khi borrowed → returned - SOQUYEN += 1 (ĐÃ TRẢ SACH)
      default: "pending",
    },
    isDeleted: { type: Boolean, default: false }, //XÓA MỀM
  },
  { timestamps: true }
);

module.exports = mongoose.model("TheoDoiMuonSach", TheoDoiMuonSachSchema);
