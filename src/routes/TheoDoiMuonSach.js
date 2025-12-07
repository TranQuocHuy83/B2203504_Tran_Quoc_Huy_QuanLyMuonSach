const express = require("express");
const router = express.Router();
const controller = require("../controllers/TheoDoiMuonSachController");
const auth = require("../middlewares/auth");

// --------------------------- Lấy tất cả bản ghi mượn trả
router.get("/", auth, controller.getAll);

// --------------------------- Lọc bản ghi theo từng loại mã
router.get("/:id", auth, controller.getById);
router.get("/docgia/:madocgia", auth, controller.getByMaDocGia);
router.get("/sach/:masach", auth, controller.getByMaSach);

// --------------------------- 1) Đăng ký mượn → pending (không trừ sách)
router.post("/request", auth, controller.dangKyMuon);

// --------------------------- 2) Xác nhận đã lấy sách → borrowed (trừ sách)
router.put("/confirm/:id", auth, controller.xacNhanMuon);

// --------------------------- 3) Hủy đăng ký → cancelled (chỉ pending mới hủy)
router.delete("/cancel/:id", auth, controller.huyDangKy);

// --------------------------- 4) Trả sách → returned (cộng sách lại)
router.put("/tra/:id", auth, controller.traSach);

// --------------------------- Xóa bản ghi (ít dùng)
router.delete("/:id", auth, controller.delete);

// --------------------------- Đếm số sách đang mượn theo mã sách
router.get("/count/:masach", controller.countBorrowedByMaSach);

module.exports = router;
