<template>
  <div class="login-modal">
    <div class="login-card shadow-lg">
      <h3 class="text-center mb-3 fw-bold text-primary">Đăng Nhập</h3>
      <p class="text-center text-muted mb-4">Hệ Thống Quản Lý Mượn Sách</p>

      <form @submit.prevent="onSubmitLogin">
        <div class="mb-3">
          <label class="form-label">Tên đăng nhập</label>
          <input
            v-model="maSo"
            class="form-control"
            placeholder="Nhập tên đăng nhập của bạn"
            required
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Mật khẩu</label>
          <input
            type="password"
            v-model="password"
            class="form-control"
            placeholder="Nhập mật khẩu của bạn"
            required
          />
        </div>

        <div v-if="error" class="alert alert-danger py-2 small">
          {{ error }}
        </div>

        <button class="btn btn-primary w-100 mt-2" type="submit">
          <i class="bi bi-box-arrow-in-right"></i> Đăng nhập
        </button>

        <button
          class="btn btn-link w-100 mt-2 text-secondary"
          type="button"
          @click="$emit('back')"
        >
          ← Quay lại
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const emit = defineEmits(["back", "login-success"]);
const maSo = ref("");
const password = ref("");
const error = ref("");

const onSubmitLogin = async () => {
  error.value = "";
  try {
    let res;
    if (maSo.value.toUpperCase().startsWith("NV")) {
      res = await axios.post("http://localhost:5000/api/nhanvien/login", {
        MSNV: maSo.value,
        Password: password.value,
      });
      localStorage.setItem("role", "nhanvien");
    } else if (maSo.value.toUpperCase().startsWith("DG")) {
      res = await axios.post("http://localhost:5000/api/docgia/login", {
        MADOCGIA: maSo.value,
        PASSWORD: password.value,
      });
      localStorage.setItem("role", "docgia");
    } else {
      error.value = "Tên đăng nhập không hợp lệ (phải bắt đầu bằng NV hoặc DG)";
      return;
    }

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    emit("login-success", res.data); //👉 Sửa lại thành như này
  } catch (err) {
    error.value = err.response?.data?.message || "Đăng nhập thất bại!";
  }
};
</script>

<style scoped>
.login-modal {
  position: relative;
  z-index: 10;
  height: 100%;
  padding-top: 55px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 15px;
  padding: 40px 50px;
  width: 100%;
  max-width: 450px;
  animation: fadeIn 0.8s ease;
}
.btn-link {
  text-decoration: none !important;
}
/* Hiệu ứng xuất hiện */
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
