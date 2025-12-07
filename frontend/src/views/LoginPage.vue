<template>
  <div class="login-page">
    <!-- 🟩 Banner nền -->
    <div class="banner-login">
      <img
        src="../assets/banner01.jpg"
        alt="Banner Đăng nhập"
        class="banner-img"
      />
      <div class="overlay"></div>
    </div>

    <!-- 🟦 Hiển thị từng modal -->
    <div v-if="!showLoginForm && !showRegisterForm">
      <!-- Nếu đã đăng nhập, show UserModal -->
      <UserModal v-if="user" :user="user" @logout="logout" />

      <!-- Nếu chưa đăng nhập, show IntroCard -->
      <IntroCard
        v-else
        :user="null"
        @show-login="showLoginForm = true"
        @show-register="showRegisterForm = true"
        @logout="logout"
      />
    </div>

    <LoginForm
      v-else-if="showLoginForm"
      @back="resetForms"
      @login-success="onLoginSuccess"
    />

    <RegisterForm
      v-else-if="showRegisterForm"
      @back="resetForms"
      @register-success="
        showLoginForm = true;
        showRegisterForm = false;
      "
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import IntroCard from "@/components/IntroCard.vue";
import LoginForm from "@/components/LoginForm.vue";
import RegisterForm from "@/components/RegisterForm.vue";
//import AccountForm from "@/components/AccountForm.vue";
import UserModal from "@/components/UserModal.vue";

const router = useRouter();
const user = ref(null);
const showLoginForm = ref(false);
const showRegisterForm = ref(false);

// Khi tải lại trang, lấy user từ localStorage
onMounted(() => {
  try {
    const savedUser = localStorage.getItem("user");
    user.value = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    console.error("Lỗi parse user:", e);
    user.value = null;
    localStorage.removeItem("user");
  }
});

// Khi đăng nhập thành công
const onLoginSuccess = (data) => {
  // lưu token + user vào localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  // 🔥 BẮN EVENT ra toàn FE để cập nhật Navbar
  window.dispatchEvent(new Event("roleChanged"));

  user.value = data.user;

  // chuyển về trang chủ
  router.push("/");
};

// Đăng xuất
const logout = () => {
  localStorage.clear();
  user.value = null;
};

// Quay lại
const resetForms = () => {
  showLoginForm.value = false;
  showRegisterForm.value = false;
};
</script>

<style scoped>
/* Giữ nguyên toàn bộ style từ file gốc */
.login-page {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
.banner-login {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.4);
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}
</style>
