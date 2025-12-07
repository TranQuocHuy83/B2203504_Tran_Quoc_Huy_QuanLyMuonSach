const express = require("express");
const router = express.Router();
const controller = require("../controllers/DocGiaController");
const auth = require("../middlewares/auth");

// Các route công khai
router.get("/", controller.getAll);
router.get("/name/:ten", controller.getByName);
router.post("/", controller.create);
router.post("/login", controller.login);
router.get("/madocgia/:MADOCGIA", controller.getById);

// Các route cần xác thực JWT
router.put("/:MADOCGIA", auth, controller.update);
router.put("/:MADOCGIA/change-password", auth, controller.changePassword);
router.delete("/:MADOCGIA", auth, controller.delete);

module.exports = router;
