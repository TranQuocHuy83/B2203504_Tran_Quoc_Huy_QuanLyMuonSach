<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-gradient fixed-top shadow">
    <div class="container-fluid">
      <!-- Logo / Tên hệ thống -->
      <a class="navbar-brand fw-bold fs-5 text-warning" href="/">
        Quản Lý Mượn Sách
      </a>

      <!-- Nút toggle (hiện trên mobile) -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Menu chính -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <!-- Luôn thấy -->
          <li class="nav-item">
            <router-link to="/" class="nav-link">Trang chủ</router-link>
          </li>
          <li
            class="nav-item d-flex align-items-center"
            v-if="role !== 'nhanvien'"
            style="width: 300px; margin: 0 15px"
          >
            <input
              v-model="searchQuery"
              @keyup.enter="searchBook"
              type="text"
              class="form-control form-control-sm"
              placeholder="Tìm sách, tác giả, nhà xuất bản..."
            />
          </li>

          <!-- ❗ Nhân viên mới thấy -->
          <template v-if="role === 'nhanvien'">
            <li class="nav-item">
              <router-link to="/nhaxuatban" class="nav-link"
                >Nhà xuất bản</router-link
              >
            </li>

            <li class="nav-item">
              <router-link to="/sach" class="nav-link">Sách</router-link>
            </li>

            <li class="nav-item">
              <router-link to="/theodoimuonsach" class="nav-link">
                Theo dõi mượn sách
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/docgia" class="nav-link">Độc giả</router-link>
            </li>
          </template>

          <!-- Luôn thấy -->
          <!-- Nếu đã login: hiển thị icon + tên, nhưng click vẫn đi login -->
          <!-- Nếu đã login -->
          <li class="nav-item dropdown" v-if="user">
            <!-- Chỉ dropdown với độc giả -->
            <template v-if="role !== 'nhanvien'">
              <li class="nav-item dropdown" v-if="user && role !== 'nhanvien'">
                <!-- Avatar: CLICK = mở dropdown -->
                <a
                  class="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  id="userMenu"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="bi bi-person-circle me-1 fs-5"></i>
                  <span>{{ user.HOTENDG || "Người dùng" }}</span>
                </a>

                <!-- Dropdown -->
                <ul
                  class="dropdown-menu dropdown-menu-end"
                  aria-labelledby="userMenu"
                >
                  <li>
                    <router-link to="/lichsu" class="dropdown-item">
                      <i class="bi bi-clock-history me-1"></i> Lịch sử mượn sách
                    </router-link>
                  </li>

                  <li>
                    <router-link to="/login" class="dropdown-item">
                      <i class="bi bi-person me-1"></i> Tài khoản
                    </router-link>
                  </li>
                </ul>
              </li>
            </template>

            <!-- Nhân viên: bình thường, click vẫn login -->
            <template v-else>
              <router-link
                to="/login"
                class="nav-link d-flex align-items-center"
              >
                <i class="bi bi-person-circle me-1 fs-5"></i>
                <span>{{ user.HoTenNV || "Người dùng" }}</span>
              </router-link>
            </template>
          </li>

          <!-- Nếu chưa đăng nhập -->
          <li class="nav-item" v-else>
            <router-link to="/login" class="nav-link">Đăng nhập</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { searchSach } from "../services/sach.service";

const router = useRouter();

// 🔹 Fix searchQuery
const searchQuery = ref("");
const showDropdown = ref(false);

const role = ref(localStorage.getItem("role") || "guest");
const user = ref(JSON.parse(localStorage.getItem("user")) || null);

const handleScroll = () => {
  const navbar = document.querySelector("nav.navbar");
  if (window.scrollY > 50) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");
};

const searchBook = async () => {
  const kw = searchQuery.value.trim();
  if (!kw) return;

  try {
    const res = await searchSach(kw);

    // Lưu kết quả cho trang kết quả tìm kiếm
    localStorage.setItem("searchResult", JSON.stringify(res.data));

    // Chuyển đến trang kết quả
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`);
  } catch (err) {
    alert("Không tìm thấy kết quả!");
  }
};

// 🔥Lắng nghe thay đổi role/user
const onAuthChanged = () => {
  role.value = localStorage.getItem("role") || "guest";
  user.value = JSON.parse(localStorage.getItem("user")) || null;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("roleChanged", onAuthChanged); // 🔥
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("roleChanged", onAuthChanged); // 🔥
});

// Logout
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("roleChanged")); // cập nhật Navbar
  router.push("/");
};
</script>

<style scoped>
/* 🔹 Gradient nền cho navbar */
.bg-gradient {
  background: linear-gradient(90deg, #212529, #343a40, #212529);
}

/* 🔹 Khi cuộn xuống: nền đậm hơn + bóng sáng vàng */
nav.navbar.scrolled {
  background-color: #000 !important;
  box-shadow: 0 3px 15px rgba(255, 193, 7, 0.3);
}

/* 🔹 Highlight trang hiện tại */
.nav-link.router-link-exact-active {
  color: #ffc107 !important;
  font-weight: bold;
  border-bottom: 2px solid #ffc107;
}

/* 🔹 Hiệu ứng hover */
.nav-link:hover {
  color: #ffc107 !important;
  transition: 0.2s;
}

/* 🔹 Logo */
.navbar-brand {
  letter-spacing: 0.5px;
}
</style>
