const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// folder uploads trong /src/uploads/sach
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads", "sach"));
  },
  filename: function (req, file, cb) {
    cb(null, req.params.masach + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/sach/:masach", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const url = `/uploads/sach/${req.file.filename}`;

  res.json({ url });
});

module.exports = router;
