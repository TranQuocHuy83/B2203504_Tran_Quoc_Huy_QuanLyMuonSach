const mongoose = require("mongoose");

const NhanVienSchema = new mongoose.Schema(
  {
    MSNV: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    HoTenNV: { type: String, required: true },
    ChucVu: { type: String, default: "Nhân viên thư viện" },
    DiaChi: { type: String, required: true },
    SoDienThoai: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NhanVien", NhanVienSchema);
