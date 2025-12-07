<template>
  <div class="home-page">
    <!-- Thanh header -->
    <!-- Banner có hiệu ứng slide ngang liên tục -->
    <section class="banner-container position-relative">
      <div
        class="banner-track"
        :style="{
          transform: `translateX(-${(currentBanner + 1) * 100}%)`,
          transition: isTransitioning ? 'transform 1s ease-in-out' : 'none',
        }"
        @transitionend="handleTransitionEnd"
      >
        <!-- Clone slide cuối -->
        <div
          class="banner-slide position-relative"
          :style="{ backgroundImage: `url(${banners[banners.length - 1]})` }"
        >
          <div class="overlay"></div>
        </div>

        <!-- Slide thật -->
        <div
          v-for="(img, index) in banners"
          :key="index"
          class="banner-slide position-relative"
          :style="{ backgroundImage: `url(${img})` }"
        >
          <div class="overlay"></div>
        </div>

        <!-- Clone slide đầu -->
        <div
          class="banner-slide position-relative"
          :style="{ backgroundImage: `url(${banners[0]})` }"
        >
          <div class="overlay"></div>
        </div>
      </div>

      <!-- ✅ CHỮ ĐẶT NGOÀI VÒNG LẶP -->
      <div class="banner-text text-white text-center">
        <h1 class="fw-bold display-4">Hệ Thống Quản Lý Mượn Sách</h1>
        <p class="lead">
          Khám phá kho tri thức – Mượn sách dễ dàng, nhanh chóng!
        </p>
        <button class="btn btn-light btn-lg mt-3" @click="goToBorrow">
          <i class="bi bi-book-half"></i> Mượn sách ngay
        </button>
      </div>

      <!-- Nút điều hướng -->
      <button class="btn-prev" @click="prevBanner">‹</button>
      <button class="btn-next" @click="nextBanner">›</button>

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

    <!-- Danh sách sách nổi bật -->
    <section class="container py-5">
      <h2 class="text-center mb-4">📖 Sách Nổi Bật</h2>
      <div class="row justify-content-center">
        <div class="col-md-3 mb-4" v-for="book in featuredBooks" :key="book.id">
          <div class="card h-100 shadow-sm hover-scale">
            <img
              :src="book.image"
              class="card-img-top"
              :alt="book.title"
              :style="book.style"
            />
            <div class="card-body text-center">
              <h5 class="card-title">{{ book.title }}</h5>
              <p class="text-muted small">{{ book.author }}</p>
              <button class="btn btn-primary btn-sm" @click="goToBorrow">
                <i class="bi bi-cart-plus icon-spacing"></i> Mượn sách
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import AppHeader from "../components/AppHeader.vue";
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const goToBorrow = () => router.push("/theodoimuonsach");

// Ảnh banner
const banners = [
  new URL(
    "D:\\Huy IT\\CT449- PTUD Web\\Project\\QuanLyMuonSach\\frontend\\pictures\\banner01.jpg",
    import.meta.url
  ).href,
  new URL(
    "D:\\Huy IT\\CT449- PTUD Web\\Project\\QuanLyMuonSach\\frontend\\pictures\\banner02.jpg",
    import.meta.url
  ).href,
  new URL(
    "D:\\Huy IT\\CT449- PTUD Web\\Project\\QuanLyMuonSach\\frontend\\pictures\\banner03.jpg",
    import.meta.url
  ).href,
];

const currentBanner = ref(0);
const isTransitioning = ref(true);
let interval = null;

// ---- CHUYỂN ẢNH ----
const nextBanner = () => {
  if (!isTransitioning.value) return;
  currentBanner.value++;
};

const prevBanner = () => {
  if (!isTransitioning.value) return;
  currentBanner.value--;
};

// ---- NHẢY VỀ ẢNH THẬT KHI ĐI QUA CLONE ---- [Clone_C] [A] [B] [C] [Clone_A]
import { nextTick } from "vue";

const handleTransitionEnd = async () => {
  const lastIndex = banners.length - 1;

  // Nếu đang ở clone cuối (Clone_A) => nhảy không animation về 0 (A)
  if (currentBanner.value === banners.length) {
    // tắt transition
    isTransitioning.value = false;

    // đợi Vue cập nhật thuộc tính transition=none trước khi thay index
    await nextTick();

    // nhảy về slide thật (0) — transform sẽ áp dụng không animation
    currentBanner.value = 0;

    // đợi DOM apply transform
    await nextTick();

    // bật lại transition (sau 30ms nhỏ để an toàn)
    setTimeout(() => {
      isTransitioning.value = true;
    }, 30);

    return;
  }

  // Nếu đang ở clone đầu (Clone_C) => nhảy về lastIndex (C)
  if (currentBanner.value < 0) {
    isTransitioning.value = false;
    await nextTick();
    currentBanner.value = lastIndex;
    await nextTick();
    setTimeout(() => {
      isTransitioning.value = true;
    }, 30);
    return;
  }

  // Bình thường: đảm bảo transition đang bật
  isTransitioning.value = true;
};

// ---- AUTOPLAY ----
const startAutoSlide = () => {
  stopAutoSlide();
  interval = setInterval(nextBanner, 3000);
};
const stopAutoSlide = () => {
  if (interval) clearInterval(interval);
};

// ---- GỌI KHI MOUNT ----
onMounted(() => {
  startAutoSlide();

  const banner = document.querySelector(".banner-container");
  banner.addEventListener("mouseenter", stopAutoSlide);
  banner.addEventListener("mouseleave", startAutoSlide);
});

onUnmounted(() => {
  stopAutoSlide();
});

// ---- CHUYỂN TỚI SLIDE CỤ THỂ (indicator click) ----
const goToSlide = (index) => {
  currentBanner.value = index;
};

// ---- DANH SÁCH SÁCH ----
const featuredBooks = [
  {
    id: 1,
    title: "Dế Mèn Phiêu Lưu Ký",
    author: "Tô Hoài",
    image: new URL("../assets/dmplk.png", import.meta.url).href,
    style:
      "width:210px; height:300px; object-fit:cover; display:block; margin:0 auto;",
  },
  {
    id: 2,
    title: "Làng",
    author: "Kim Lân",
    image: new URL("../assets/lang.jpg", import.meta.url).href,
    style:
      "width:210px; height:300px; object-fit:cover; display:block; margin:0 auto;",
  },
  {
    id: 3,
    title: "Trí khôn của ta đây",
    author: "Nguyễn Đổng Chi",
    image: new URL("../assets/tkctd.png", import.meta.url).href,
    style:
      "width:210px; height:300px; object-fit:cover; display:block; margin:0 auto;",
  },
  {
    id: 4,
    title: "Sự tích Hồ Gươm",
    author: "Nguyễn Huy Tưởng",
    image: new URL("../assets/sthg.jpg", import.meta.url).href,
    style:
      "width:210px; height:300px; object-fit:cover; display:block; margin:0 auto;",
  },
  {
    id: 5,
    title: "Người con gái Nam Xương",
    author: "Nguyễn Dữ",
    image: new URL("../assets/tncgnx.png", import.meta.url).href,
    style:
      "width:210px; height:300px; object-fit:cover; display:block; margin:0 auto;",
  },
  {
    id: 6,
    title: "Chuyện cũ Hà Nội",
    author: "Tô Hoài",
    image: new URL("../assets/tchn.jpg", import.meta.url).href,
    style:
      "width:210px; height:300px; object-fit:cover; display:block; margin:0 auto;",
  },
  {
    id: 7,
    title: "Sự tích Trầu Cau",
    author: "Phạm Hổ",
    image: new URL("../assets/sttc.png", import.meta.url).href,
    style:
      "width:210px; height:300px; object-fit:cover; display:block; margin:0 auto;",
  },
  {
    id: 8,
    title: "Cây tre trăm đốt",
    author: "Nguyễn Đổng Chi",
    image: new URL("../assets/cttd.jpg", import.meta.url).href,
    style:
      "width:210px; height:300px; object-fit:cover; display:block; margin:0 auto;",
  },
];
</script>

<style scoped>
.banner-container {
  position: relative;
  width: 100%;
  height: 70vh;
  overflow: hidden;
}

.banner-track {
  display: flex;
  width: 100%;
  height: 100%;
  /* chuyển transition control bằng inline style động (không cần ở đây) */
  will-change: transform;
  backface-visibility: hidden;
}

.banner-slide {
  flex: 0 0 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  -webkit-backface-visibility: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

.banner-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.banner-text .btn {
  pointer-events: auto;
}

/* Nút điều hướng */
.btn-prev,
.btn-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  font-size: 2rem;
  padding: 0 10px;
  cursor: pointer;
  transition: background 0.25s;
  z-index: 10;
}
.btn-prev:hover,
.btn-next:hover {
  background: rgba(0, 0, 0, 0.6);
}
.btn-prev {
  left: 10px;
}
.btn-next {
  right: 10px;
}

/* Indicator (chấm tròn) */
.indicators {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
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

/* Card hiệu ứng */
.hover-scale {
  transition: transform 0.3s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}
.card-img-top {
  height: 250px;
  object-fit: cover;
}
.icon-spacing {
  margin-bottom: 10px;
}
</style>
