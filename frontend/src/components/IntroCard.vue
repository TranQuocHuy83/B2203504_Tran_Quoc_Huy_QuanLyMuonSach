<template>
  <div class="intro-modal">
    <div class="intro-card shadow-lg text-center">
      <h2 class="fw-bold text-primary">Quản Lý Mượn Sách</h2>
      <p v-if="!user" class="text-muted mt-2">
        Bắt đầu hành trình đọc sách của bạn – đăng nhập ngay!
      </p>

      <!-- 🧍 Nếu chưa đăng nhập -->
      <div v-if="!user" class="mt-4 d-flex justify-content-center gap-3">
        <button
          class="btn btn-outline-primary px-4"
          @click="$emit('show-register')"
        >
          <i class="bi bi-person-plus"></i> Đăng ký
        </button>
        <button class="btn btn-primary px-4" @click="$emit('show-login')">
          <i class="bi bi-box-arrow-in-right"></i> Đăng nhập
        </button>
      </div>

      <!-- ✅ Nếu đã đăng nhập -->
      <UserModal v-else :user="user" @logout="$emit('logout')" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ user: Object });
const emit = defineEmits(["show-login", "show-register", "logout"]);
</script>

<style scoped>
.intro-modal {
  position: relative;
  z-index: 10;
  padding-top: 200px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.intro-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 15px;
  padding: 40px 50px;
  max-width: 500px;
  width: 100%;
  animation: fadeIn 0.8s ease;
}
.btn-outline-primary,
.btn-primary {
  font-weight: 500;
  border-width: 1.5px;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
