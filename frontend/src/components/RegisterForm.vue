<template>
  <div class="login-modal">
    <div class="login-card shadow-lg p-4">
      <h3 class="text-center mb-3 fw-bold text-primary">Đăng Ký Độc Giả</h3>
      <p class="text-center text-muted mb-4">
        Tạo tài khoản để mượn - trả sách dễ dàng
      </p>

      <form @submit.prevent="onSubmitRegister">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Mã độc giả</label>
            <input
              v-model="docGia.maDocGia"
              class="form-control"
              placeholder="VD: DG001"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Mật khẩu</label>
            <input
              v-model="docGia.password"
              type="password"
              class="form-control"
              placeholder="Nhập mật khẩu của bạn"
              required
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Họ và tên</label>
            <input v-model="docGia.hoTen" class="form-control" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">Ngày sinh</label>
            <input
              v-model="docGia.ngaySinh"
              type="date"
              class="form-control"
              required
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Giới tính</label>
            <select v-model="docGia.gioiTinh" class="form-control" required>
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Địa chỉ</label>
            <input v-model="docGia.diaChi" class="form-control" required />
          </div>
        </div>

        <div v-if="registerError" class="alert alert-danger py-2 small mt-3">
          {{ registerError }}
        </div>
        <div v-if="registerSuccess" class="alert alert-success py-2 small mt-3">
          {{ registerSuccess }}
        </div>

        <button class="btn btn-primary w-100 mt-3" type="submit">
          <i class="bi bi-person-check"></i> Đăng ký
        </button>
        <button
          class="btn btn-link w-100 mt-2 text-secondary text-decoration-none"
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

const emit = defineEmits(["back", "register-success"]);

const docGia = ref({
  maDocGia: "",
  password: "",
  hoTen: "",
  ngaySinh: "",
  gioiTinh: "",
  diaChi: "",
});
const registerError = ref("");
const registerSuccess = ref("");

const onSubmitRegister = async () => {
  registerError.value = "";
  registerSuccess.value = "";

  try {
    const payload = {
      MADOCGIA: docGia.value.maDocGia || "",
      PASSWORD: docGia.value.password,
      HOTENDG: docGia.value.hoTen,
      NGAYSINH: docGia.value.ngaySinh,
      PHAI: docGia.value.gioiTinh,
      DIACHI: docGia.value.diaChi,
    };
    const res = await axios.post("http://localhost:5000/api/docgia", payload);
    registerSuccess.value =
      "🎉 Đăng ký thành công! Đang chuyển sang trang đăng nhập...";
    setTimeout(() => {
      emit("register-success");
    }, 2000); // tăng từ 1500 lên 2000ms = 2 giây
  } catch (err) {
    registerError.value = err.response?.data?.message || "Đăng ký thất bại!";
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
  max-width: 500px;
  width: 100%;
}
</style>
