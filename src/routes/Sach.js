const express = require("express");
const router = express.Router();
const controller = require("../controllers/SachController");
const auth = require("../middlewares/auth");
const Sach = require("../models/Sach"); // ← BẮT BUỘC PHẢI CÓ

// Lấy tất cả sách (ai cũng xem được)
router.get("/", controller.getAll);

// TÌM KIẾM TỔNG HỢP (Tên → Tác giả → NXB)
router.get("/search/:kw", controller.searchBook);

// Thêm sách (chỉ nhân viên/admin đã đăng nhập mới được thêm)
router.post("/", auth, controller.create);

// Lấy thông tin sách theo tên
router.get("/name/:ten", controller.getByName);

router.get("/author/:tacgia", controller.getByAuthor);
router.get("/nxb/:tennxb", controller.getByNXB);

// Lấy thông tin sách theo mã
router.get("/masach/:masach", controller.getByMasach);

// Cập nhật sách theo MASACH (phải đăng nhập)
router.put("/:MASACH", auth, controller.update);

// Xóa sách (phải đăng nhập)
router.delete("/:id", auth, controller.remove);

// UPDATE URL ẢNH VÀO DATABASE
router.put("/:masach/image", async (req, res) => {
  try {
    const updated = await Sach.findOneAndUpdate(
      { MASACH: req.params.masach },
      { IMAGE_URL: req.body.IMAGE_URL },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy sách" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
