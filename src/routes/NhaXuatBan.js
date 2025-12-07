const express = require("express");
const router = express.Router();
const controller = require("../controllers/NhaXuatBanController");
const auth = require("../middlewares/auth");

// Public: danh sách
router.get("/", controller.getAll);

// Protected: tạo/sửa/xóa (cần auth)
router.post("/", auth, controller.create);
router.get("/name/:ten", controller.getByName);
router.put("/:MANXB", auth, controller.update);
router.delete("/:id", auth, controller.remove);

module.exports = router;
