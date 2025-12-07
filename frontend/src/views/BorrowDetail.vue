<template>
  <div class="container mt-3">
    <!-- 🔙 Mũi tên quay lại -->
    <div class="back-btn" @click="goBack">
      <i class="fa-solid fa-arrow-left"></i> Trở về
    </div>

    <div class="detail-box">
      <!-- 🟩 Cột trái: Ảnh sách -->
      <div class="left">
        <img
          :src="previewImage || defaultImage"
          class="book-img"
          alt="Book Image"
        />
      </div>

      <!-- 🟦 Cột phải: Thông tin phiếu mượn -->
      <div class="right">
        <h2 class="book-title">Chi tiết mượn sách</h2>
        &nbsp;
        <p><b>Mã sách:</b> {{ borrowRecord?.MASACH || "-" }}</p>
        <p><b>Tên sách:</b> {{ borrowRecord?.book?.TENSACH || "-" }}</p>
        <p><b>Tác giả:</b> {{ borrowRecord?.book?.TACGIA || "-" }}</p>
        <p>
          <b>Ngày mượn:</b>
          {{ borrowRecord?.NGAYMUON ? formatDate(borrowRecord.NGAYMUON) : "-" }}
        </p>
        <p>
          <b>Hạn trả:</b>
          {{ borrowRecord?.HANTRA ? formatDate(borrowRecord.HANTRA) : "-" }}
        </p>
        <p>
          <b>Ngày trả:</b>
          <span v-if="borrowRecord?.NGAYTRA">
            {{ formatDate(borrowRecord.NGAYTRA) }}
          </span>
          <span v-else> Bạn chưa trả sách </span>
        </p>
        <p>
          <b>Trạng thái: </b>
          <span :class="statusColor(borrowRecord?.TRANGTHAI)">
            {{ getStatusText(borrowRecord?.TRANGTHAI) }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getTheoDoiById } from "../services/theodoimuonsach.service";
import { getAllSach } from "../services/sach.service";
import defaultBook from "../assets/book.png";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const borrowId = route.params.id; // id phiếu mượn từ route

    const borrowRecord = ref({});
    const previewImage = ref("");
    const defaultImage = defaultBook;

    const goBack = () => router.push("/lichsu"); // quay lại trang lịch sử

    const formatDate = (d) => (d ? new Date(d).toLocaleString() : "-");

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
        ? "text-danger"
        : s === "borrowed" || s === "dangmuon"
        ? "text-warning"
        : s === "returned" || s === "datra"
        ? "text-success"
        : "text-secondary";

    onMounted(async () => {
      try {
        // 🔹 Lấy phiếu mượn theo id
        const res = await getTheoDoiById(borrowId); // trả về 1 phiếu mượn
        borrowRecord.value = res.data;

        // 🔹 Lấy thông tin sách
        const booksRes = await getAllSach();
        const book = booksRes.data.find(
          (b) => b.MASACH === borrowRecord.value.MASACH
        );
        borrowRecord.value.book = book;

        // 🔹 Ảnh sách
        previewImage.value = book?.IMAGE_URL
          ? `http://localhost:5000${book.IMAGE_URL}`
          : defaultImage;
      } catch (err) {
        console.error(err);
        alert("Không tải được chi tiết phiếu mượn!");
      }
    });

    return {
      borrowRecord,
      previewImage,
      defaultImage,
      goBack,
      formatDate,
      getStatusText,
      statusColor,
    };
  },
};
</script>

<style scoped>
.detail-box {
  display: flex;
  width: 90vw;
  max-width: 1200px;
  gap: 10px;
  padding: 20px;
  margin: 0 auto;
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
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: #007bff;
  width: fit-content;
}
</style>
