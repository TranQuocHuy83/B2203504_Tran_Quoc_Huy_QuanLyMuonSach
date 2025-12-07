<template>
  <div class="home-page">
    <!-- Banner có hiệu ứng slide ngang -->
    <section class="banner-container position-relative">
      <!-- Ảnh banner trượt ngang -->
      <div class="banner-slide-wrapper">
        <transition name="slide-left" mode="out-in">
          <div
            v-if="banners.length"
            :key="currentBanner"
            class="banner-slide position-absolute"
            :style="{ backgroundImage: `url(${banners[currentBanner]})` }"
          ></div>
        </transition>
      </div>

      <!-- Lớp phủ mờ tối -->
      <div class="overlay"></div>

      <!-- Chữ cố định (không bị ảnh hưởng bởi hiệu ứng ảnh) -->
      <div class="banner-text text-white text-center">
        <h1 class="fw-bold display-4">Hệ Thống Quản Lý Mượn Sách</h1>
        <p class="lead">
          Khám phá kho tri thức – Mượn sách dễ dàng, nhanh chóng!
        </p>
      </div>

      <!-- Indicator -->
      <div class="indicators">
        <span
          v-for="(img, index) in banners"
          :key="index"
          :class="['dot', { active: index === currentBanner }]"
          @click="goToSlide(index)"
        ></span>
      </div>
    </section>

    <section class="container py-5">
      <h2 class="text-center mb-4">Tất cả sách</h2>

      <div class="row justify-content-center">
        <div
          class="col-md-3 mb-4"
          v-for="book in books"
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
                display: block;
                margin: 0 auto;
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
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

import defaultBook from "../assets/book.png";
import { getAllSach } from "../services/sach.service"; // <-- gọi API thật

const router = useRouter();

const goToDetail = (masach) => {
  router.push(`/sach/${masach}`);
};

// Ảnh banner (giữ nguyên cấu trúc, chỉ chỉnh đường dẫn cho hợp lệ)
const banners = [
  new URL("../assets/banner03.jpg", import.meta.url).href,
  new URL("../assets/banner02.jpg", import.meta.url).href,
  new URL("../assets/banner01.jpg", import.meta.url).href,
];

const currentBanner = ref(0);
let interval = null;

const nextBanner = () => {
  currentBanner.value = (currentBanner.value + 1) % banners.length;
};

onMounted(() => {
  interval = setInterval(nextBanner, 4000); // 4s/lần
});
onUnmounted(() => clearInterval(interval));

const goToSlide = (index) => (currentBanner.value = index);

// ---- LẤY DỮ LIỆU TỪ API ----
const books = ref([]);

onMounted(async () => {
  try {
    const res = await getAllSach();
    books.value = res.data
      .sort((a, b) => a.MASACH.localeCompare(b.MASACH)) // sắp xếp theo MASACH
      .map((b) => ({
        ...b,
        image: b.IMAGE_URL
          ? `http://localhost:5000${b.IMAGE_URL}`
          : defaultBook,
      }));
  } catch (err) {
    console.error("Lỗi khi tải sách:", err);
  }
});
</script>

<style scoped>
.banner-container {
  position: relative;
  width: 100%;
  height: 70vh;
  overflow: hidden;
  border-radius: 0px;
}

/* Slide wrapper */
.banner-slide-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* Ảnh banner */
.banner-slide {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

/* Lớp phủ đen nhẹ */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
}

/* Hiệu ứng trượt sang trái */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s ease;
}
.slide-left-enter-from {
  transform: translateX(100%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* Text cố định */
.banner-text {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  transform: translate(-50%, -50%);
}

/* Chấm tròn điều hướng */
.indicators {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 3;
}

.dot {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
}
.dot.active {
  background: white;
  transform: scale(1.2);
}

/* Hiệu ứng hover card */
.hover-scale {
  transition: transform 0.3s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}
.icon-spacing {
  margin-bottom: 10px;
}
</style>
