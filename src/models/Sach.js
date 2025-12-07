// src/models/Sach.js
const mongoose = require("mongoose");

const SachSchema = new mongoose.Schema(
  {
    MASACH: { type: String, required: true, unique: true },
    TENSACH: { type: String, required: true },
    TACGIA: { type: String, required: true }, // Tác giả
    DONGIA: { type: Number, default: 0, min: 0 },
    SOQUYEN: { type: Number, default: 1, min: 0 },
    NAMXUATBAN: { type: Number },
    IMAGE_URL: { type: String },
    MANXB: { type: String, required: true },
    TRANGTHAI: {
      type: String,
      enum: ["available", "borrowed"],
      default: "available",
    },
    isDeleted: { type: Boolean, default: false }, //XÓA MỀM
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sach", SachSchema);
