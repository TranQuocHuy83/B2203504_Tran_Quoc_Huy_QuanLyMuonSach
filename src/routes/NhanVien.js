const express = require("express");
const router = express.Router();
const controller = require("../controllers/NhanVienController");
const auth = require("../middlewares/auth");

// Lấy tất cả nhân viên
router.get("/", controller.getAll);

// register (chỉ dev/seed thôi - khi deploy chọn giới hạn)
router.post("/register", controller.register);

// login
router.post("/login", controller.login);

// protected route ví dụ: lấy thông tin tài khoản hiện tại
router.get("/me", auth, async (req, res) => {
  res.json({ user: req.user });
});
// Cập nhật nhân viên theo mã số
router.put("/:MSNV", auth, controller.update);
//doimatkhau
router.put("/:MSNV/change-password", auth, controller.changePassword);

module.exports = router;
