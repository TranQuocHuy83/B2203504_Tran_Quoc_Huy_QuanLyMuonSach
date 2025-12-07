// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/NHAXUATBAN", require("./routes/NhaXuatBan"));
app.use("/api/sach", require("./routes/Sach"));
app.use("/api/nhanvien", require("./routes/NhanVien"));
app.use("/api/theodoimuonsach", require("./routes/TheoDoiMuonSach"));
app.use("/api/docgia", require("./routes/DocGia"));

app.get("/", (req, res) => res.send("Quan Ly Muon Sach API is running"));

// 📌 Cho phép FE truy cập ảnh upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 📌 Routes upload
app.use("/api/uploads", require("./routes/upload"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
