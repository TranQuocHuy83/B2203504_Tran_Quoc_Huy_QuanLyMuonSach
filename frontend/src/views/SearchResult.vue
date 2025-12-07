<template>
  <div class="search-page">
    <!-- 🔥 Banner full màn hình -->
    <div class="search-banner d-flex align-items-center justify-content-center">
      <h1 class="search-banner-title">Kết quả tìm kiếm</h1>
    </div>

    <!-- Nội dung -->
    <section class="container mt-4 pt-3">
      <h2 class="text-center mb-3">Từ khóa: "{{ query }}"</h2>

      <p class="text-center text-muted mb-4">
        Tổng: <b>{{ result.count }}</b>
      </p>

      <div v-if="result.count === 0" class="alert alert-warning text-center">
        Không tìm thấy kết quả nào!
      </div>

      <div v-else class="row justify-content-center">
        <div
          class="col-md-3 mb-4"
          v-for="book in displayBooks"
          :key="book.MASACH"
          @click="goToDetail(book.MASACH)"
        >
          <div class="card h-100 shadow-sm hover-scale">
            <img
              :src="book.image"
              class="card-img-top"
              :alt="book.TENSACH"
              style="
                height: 300px;
                width: 210px;
                object-fit: cover;
                margin: auto;
              "
            />
            <div class="card-body text-center">
              <h5 class="card-title">{{ book.TENSACH }}</h5>
              <p class="text-muted small">{{ book.TACGIA }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import defaultBook from "../assets/book.png";

const router = useRouter();
const route = useRoute();

const query = ref(route.query.q);

const result = ref({
  type: "",
  count: 0,
  data: [],
});

const displayBooks = ref([]);

function loadResult() {
  const saved = localStorage.getItem("searchResult");
  if (saved) {
    result.value = JSON.parse(saved);

    displayBooks.value = result.value.data.map((b) => ({
      ...b,
      image: b.IMAGE_URL ? `http://localhost:5000${b.IMAGE_URL}` : defaultBook,
    }));
  }
}

onMounted(loadResult);

// 🔥 Quan trọng: Watch để load lại kết quả khi query thay đổi
watch(
  () => route.query.q,
  (newQ) => {
    query.value = newQ;
    loadResult(); // load lại localStorage
  }
);

const goToDetail = (masach) => {
  router.push(`/sach/${masach}`);
};
</script>

<style scoped>
.search-banner {
  width: 100%;
  height: 120px; /* giống Home */
  background: url("../assets/banner03.jpg") center/cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Lớp làm tối ảnh để chữ nổi bật */
.search-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.search-banner-title {
  position: relative;
  color: white;
  font-size: 3rem;
  margin-top: 55px;
  font-weight: 500;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.6);
}

.hover-scale {
  transition: transform 0.3s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}
</style>
