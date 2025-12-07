<template>
  <div class="container mt-4">
    <!-- 🔙 Mũi tên quay lại -->
    <div class="back-btn" @click="goBack">
      <i class="fa-solid fa-arrow-left"></i> Trở về
    </div>
    <h2 class="text-center text-dark fw-bold" style="margin-bottom: 50px">
      Lịch sử mượn sách
    </h2>

    <!-- Nếu chưa đăng nhập -->
    <div v-if="!madocgia" class="alert alert-warning">
      Bạn cần đăng nhập để xem lịch sử mượn sách.
    </div>

    <!-- Danh sách sách -->
    <div v-if="borrowList.length" class="row g-3">
      <div class="col-md-4" v-for="item in borrowList" :key="item._id">
        <div class="card shadow-sm h-100">
          <!-- Ảnh sách -->
          <img
            :src="getImage(item.book?.IMAGE_URL)"
            class="card-img-top book-img"
            alt="Book Image"
          />

          <div class="card-body">
            <!-- Tên sách -->
            <h5 class="card-title">
              {{ item.book?.TENSACH }}
            </h5>

            <!-- Ngày mượn -->
            <p>
              <b>Ngày mượn: </b>
              <span v-if="item.TRANGTHAI === 'pending'">
                Bạn chưa đến lấy sách
              </span>
              <span v-else>
                {{ formatDate(item.NGAYMUON) }}
              </span>
            </p>

            <!-- Trạng thái -->
            <p>
              <b>Trạng thái: </b>
              <span :class="statusColor(item.TRANGTHAI)">
                {{ getStatusText(item.TRANGTHAI) }}
              </span>
            </p>

            <!-- Nút -->
            <div class="d-flex gap-2 mt-3">
              <button
                class="btn btn-primary btn-sm flex-fill"
                @click="viewDetail(item._id)"
              >
                Xem chi tiết
              </button>

              <button
                class="btn btn-danger btn-sm flex-fill"
                v-if="item.TRANGTHAI === 'pending'"
                @click="cancelBorrow(item._id)"
              >
                Hủy đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-info mt-3">
      Bạn chưa mượn quyển sách nào.
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// Services giống TheoDoiMuonSach.vue
import {
  getAllTheoDoi,
  huyDangKySach,
} from "../services/theodoimuonsach.service";
import { getAllSach } from "../services/sach.service";

import defaultBook from "../assets/book.png";

export default {
  setup() {
    const router = useRouter();

    const user = JSON.parse(localStorage.getItem("user"));
    const madocgia = user?.MADOCGIA || null;
    const goBack = () => router.push("/");

    const borrowList = ref([]);
    const allBooks = ref([]);

    const loadData = async () => {
      if (!madocgia) return;

      const [theodois, books] = await Promise.all([
        getAllTheoDoi(),
        getAllSach(),
      ]);

      allBooks.value = books.data;

      // Lọc theo MADOCGIA
      borrowList.value = theodois.data
        .filter((item) => item.MADOCGIA === madocgia)
        .map((item) => ({
          ...item,
          book: allBooks.value.find((b) => b.MASACH === item.MASACH),
        }));
    };

    const viewDetail = (borrowId) => {
      router.push(`/borrow-detail/${borrowId}`);
    };

    const cancelBorrow = async (id) => {
      if (!confirm("Bạn có chắc muốn hủy đăng ký mượn sách?")) return;

      await huyDangKySach(id);
      alert("Hủy đăng ký thành công!");
      loadData();
    };

    const getImage = (url) => {
      return url ? `http://localhost:5000${url}` : defaultBook;
    };

    const formatDate = (d) => {
      return d ? new Date(d).toLocaleString() : "-";
    };

    const getStatusText = (s) =>
      s === "pending"
        ? "Chờ lấy sách"
        : s === "borrowed" || s === "dangmuon"
        ? "Đã lấy sách"
        : s === "cancelled"
        ? "Đã hủy"
        : s === "returned" || s === "datra"
        ? "Đã trả"
        : "-";

    const statusColor = (s) =>
      s === "pending"
        ? "text-danger" // 🔶 Chờ lấy sách → màu đỏ (Bootstrap)
        : s === "borrowed" || s === "dangmuon"
        ? "text-warning" // ✅ Đã lấy sách → màu vàng
        : s === "returned" || s === "datra"
        ? "text-success" // 🔵 Đã trả → màu xanh lá
        : "text-secondary"; // ❌ Đã hủy → màu xám

    onMounted(loadData);

    return {
      madocgia,
      borrowList,
      viewDetail,
      cancelBorrow,
      getImage,
      formatDate,
      statusColor,
      getStatusText,
      goBack,
    };
  },
};
</script>

<style scoped>
/* Container */
.container {
  max-width: 900px;
}

/* Card chỉnh đẹp hơn */
.card {
  border-radius: 12px;
  transition: 0.2s;
}
.card-body p {
  font-size: 15px;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.15);
}

/* Ảnh */
.book-img {
  height: 300px;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
}

/* Tên sách */
.card-title {
  font-weight: bold;
  font-size: 1.05rem;
  text-align: center;
}

/* Khoảng cách đoạn text */
.card-body p {
  margin-bottom: 8px;
}

/* Nút quay lại */
.back-btn {
  cursor: pointer;
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #007bff;
  font-weight: 500;
}
</style>
