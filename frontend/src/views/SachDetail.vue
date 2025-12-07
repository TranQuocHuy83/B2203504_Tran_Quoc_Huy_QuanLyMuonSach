<template>
  <div class="container mt-3">
    <!-- 🔙 Mũi tên quay lại -->
    <div class="back-btn" @click="goBack">
      <i class="fa-solid fa-arrow-left"></i> Trở về
    </div>

    <div class="detail-box">
      <!-- 🟩 Cột trái -->
      <div class="left">
        <img
          :src="previewImage || defaultImage"
          class="book-img"
          alt="Book Image"
        />
      </div>

      <!-- 🟦 Cột phải -->
      <div class="right">
        <h2 class="book-title" style="color: #e80a0aff">{{ book.TENSACH }}</h2>
        &nbsp
        <p><b>Mã sách:</b> {{ book.MASACH }}</p>
        <p><b>Tác giả:</b> {{ book.TACGIA }}</p>
        <p><b>Đơn giá:</b> {{ book.DONGIA?.toLocaleString() }} ₫</p>
        <p><b>Số quyển còn lại:</b> {{ book.SOQUYEN }}</p>
        <p><b>Nhà xuất bản:</b> {{ book.TENNXB }}</p>
        <p><b>Năm xuất bản:</b> {{ book.NAMXUATBAN }}</p>
        <p><b>Số lượt mượn:</b> {{ book.dangMuon }}</p>
        &nbsp
        <p></p>
        <button class="btn btn-success borrow-btn" @click="borrowBook">
          <i class="fa-solid fa-book"></i> Đăng ký mượn
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getSachByMasach } from "../services/sach.service";
import { getBorrowCount } from "../services/theodoimuonsach.service";
import { dangKyMuonSach } from "../services/theodoimuonsach.service";

import defaultBook from "../assets/book.png";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const masach = route.params.masach;

    const book = ref({});
    const previewImage = ref("");
    const defaultImage = defaultBook;

    const goBack = () => router.push("/");
    //lấy thông tin đăng nhập
    const user = JSON.parse(localStorage.getItem("user"));
    const madocgia = user?.MADOCGIA || null;

    //const borrowBook = () => alert("Chức năng đăng ký mượn sẽ xử lý sau!");
    const borrowBook = async () => {
      try {
        // Lấy thông tin tài khoản đã đăng nhập
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.MADOCGIA) {
          return alert("Bạn cần đăng nhập tài khoản độc giả để mượn sách!");
        }

        const data = {
          MADOCGIA: user.MADOCGIA, // tự lấy từ tài khoản
          MASACH: book.value.MASACH, // lấy từ sách hiện tại
        };

        // Gọi API đăng ký mượn
        await dangKyMuonSach(data);

        alert("Đăng ký mượn thành công!");

        // Chuyển về trang theo dõi mượn trả
        router.push("/theodoi");
      } catch (err) {
        console.error(err);
        alert(err?.response?.data?.message || "Đăng ký mượn thất bại!");
      }
    };

    onMounted(async () => {
      try {
        // 🔹 Lấy sách theo MASACH
        const res = await getSachByMasach(masach);
        book.value = res; // backend trả về sách + thông tin NXB

        // 🔹 Lấy số lượng đang mượn
        const borrowRes = await getBorrowCount(masach);
        book.value.dangMuon = borrowRes.data.dangMuon;

        // 🔹 Xử lý ảnh
        previewImage.value = book.value.IMAGE_URL
          ? `http://localhost:5000${book.value.IMAGE_URL}`
          : defaultImage;
      } catch (err) {
        console.error(err);
        alert("Không tải được chi tiết sách!");
      }
    });

    return { book, previewImage, defaultImage, goBack, borrowBook };
  },
};
</script>

<style scoped>
.detail-box {
  display: flex;
  width: 90vw; /* chiếm 90% viewport */
  max-width: 1200px; /* hoặc bất cứ kích thước tối đa nào */
  gap: 10px;
  padding: 20px;
  margin: 0 auto; /* canh giữa */
  border-radius: 12px;
  background: #ffffff;
}

.book-title {
  font-size: 1.6rem;
  font-weight: bold;
}

.left {
  width: 40%;
  text-align: center;
}

.book-img {
  width: 250px;
  height: 350px;
  object-fit: cover;
  border-radius: 12px;
  border: 3px solid transparent;
  padding: 3px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
  /* animation nghiêng liên tục */
  animation: sway 3s infinite ease-in-out;
  transform-origin: center bottom;
}

@keyframes sway {
  0% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
  100% {
    transform: rotate(-5deg);
  }
}

.book-img:hover {
  transform: scale(1.08); /* zoom khi hover */
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.35);
  animation-play-state: paused; /* dừng sway khi hover */
}

.right {
  flex: 1;
  padding: 10px;
}

.right p {
  margin: 6px 0;
  font-size: 1rem;
}

.back-btn {
  cursor: pointer;
  font-size: 1.1 rem;
  margin-bottom: 5px;
  color: #007bff;
  width: fit-content;
}
.borrow-btn {
  font-size: 1rem; /* chữ nhỏ hơn */
  padding: 6px 12px; /* giảm chiều cao và rộng */
}
</style>
