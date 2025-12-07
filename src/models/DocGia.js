const mongoose = require("mongoose");

const DocGiaSchema = new mongoose.Schema(
  {
    MADOCGIA: { type: String, required: true, unique: true },
    PASSWORD: { type: String, required: true },
    HOTENDG: { type: String, required: true },
    NGAYSINH: { type: Date, required: true },
    PHAI: {
      type: String,
      required: true,
      enum: ["Nam", "Nữ", "Khác"],
      default: "Nam",
    },
    DIACHI: { type: String, required: true },
    DIENTHOAI: { type: String },
    EMAIL: { type: String },
    isDeleted: { type: Boolean, default: false }, //XÓA MỀM
  },

  { timestamps: true } // tự động lưu thời gian TẠO và CẬP NHẬT
);

module.exports = mongoose.model("DocGia", DocGiaSchema);
