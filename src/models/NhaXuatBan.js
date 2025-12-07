const mongoose = require("mongoose");

const NHAXUATBANSchema = new mongoose.Schema(
  {
    MANXB: { type: String, required: true, unique: true },
    TENNXB: { type: String, required: true },
    DIACHI: { type: String },
    isDeleted: { type: Boolean, default: false }, //XÓA MỀM
  },
  { timestamps: true }
);

module.exports = mongoose.model("NHAXUATBAN", NHAXUATBANSchema);
