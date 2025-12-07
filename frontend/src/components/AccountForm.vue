<template>
  <div class="account-form mt-4 shadow-sm p-3 rounded">
    <h5 class="fw-bold mb-3 text-primary text-center">
      {{ mode === "edit" ? "Chỉnh sửa tài khoản" : "Đổi mật khẩu" }}
    </h5>

    <!-- 🟦 Form chỉnh sửa thông tin -->
    <form v-if="mode === 'edit'" @submit.prevent="updateAccount">
      <div v-if="isNhanVien">
        <div class="mb-3">
          <label class="form-label">Địa chỉ</label>
          <input
            v-model="form.DiaChi"
            class="form-control"
            placeholder="Nhập địa chỉ mới"
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Số điện thoại</label>
          <input
            v-model="form.SoDienThoai"
            class="form-control"
            placeholder="Nhập số điện thoại mới"
          />
        </div>
      </div>

      <div v-else>
        <div class="mb-3">
          <label class="form-label">Số điện thoại</label>
          <input
            v-model="form.DIENTHOAI"
            class="form-control"
            placeholder="Nhập số điện thoại mới"
          />
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input
            v-model="form.EMAIL"
            type="email"
            class="form-control"
            placeholder="Nhập email mới"
          />
        </div>
      </div>

      <div v-if="message" class="alert alert-success small py-2">
        {{ message }}
      </div>

      <button class="btn btn-primary w-100 mt-2" type="submit">
        <i class="bi bi-save"></i> Lưu thay đổi
      </button>
      <button
        class="btn btn-link w-100 mt-2 text-secondary"
        type="button"
        @click="$emit('close')"
      >
        ← Quay lại
      </button>
    </form>

    <!-- 🟨 Form đổi mật khẩu -->
    <form v-else @submit.prevent="changePassword">
      <div class="mb-3 d-flex align-items-center">
        <label class="form-label me-2 text-start" style="flex: 0 0 200px"
          ><strong>Mật khẩu hiện tại</strong></label
        >
        <input
          type="password"
          v-model="oldPass"
          class="form-control flex-grow-1"
          placeholder="Nhập mật hiện tại của bạn"
          required
        />
      </div>

      <div class="mb-3 d-flex align-items-center">
        <label class="form-label me-2 text-start" style="flex: 0 0 200px"
          ><strong>Mật khẩu mới</strong></label
        >
        <input
          type="password"
          v-model="newPass"
          class="form-control flex-grow-1"
          placeholder="Nhập mật khẩu mới"
          required
        />
      </div>

      <div class="mb-3 d-flex align-items-center">
        <label class="form-label me-2 text-start" style="flex: 0 0 200px"
          ><strong>Nhập lại mật khẩu mới</strong></label
        >
        <input
          type="password"
          v-model="confirmPass"
          class="form-control flex-grow-1"
          placeholder="Nhập lại mật khẩu mới"
          required
        />
      </div>

      <div v-if="error" class="alert alert-danger small py-2">{{ error }}</div>
      <div v-if="message" class="alert alert-success small py-2">
        {{ message }}
      </div>

      <button v-if="!message" class="btn btn-warning w-100 mt-2" type="submit">
        <i class="bi bi-key"></i> Đổi mật khẩu
      </button>
      <button
        class="btn btn-link w-100 mt-2 text-secondary"
        type="button"
        @click="$emit('close')"
      >
        ← Quay lại
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";

const props = defineProps({
  user: Object,
  mode: String, // "edit" hoặc "password"
});
const emit = defineEmits(["close"]);

const isNhanVien = computed(() => !!props.user?.MSNV);
const message = ref("");
const error = ref("");

// Form dữ liệu
const form = ref({
  DiaChi: props.user?.DiaChi || "",
  SoDienThoai: props.user?.SoDienThoai || "",
  DIENTHOAI: props.user?.DIENTHOAI || "",
  EMAIL: props.user?.EMAIL || "",
});

// Mật khẩu
const oldPass = ref("");
const newPass = ref("");
const confirmPass = ref("");

// Cập nhật tài khoản
const updateAccount = async () => {
  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const url =
      role === "nhanvien"
        ? `http://localhost:5000/api/nhanvien/${props.user.MSNV}`
        : `http://localhost:5000/api/docgia/${props.user.MADOCGIA}`;

    const data =
      role === "nhanvien"
        ? { DiaChi: form.value.DiaChi, SoDienThoai: form.value.SoDienThoai }
        : { DIENTHOAI: form.value.DIENTHOAI, EMAIL: form.value.EMAIL };

    await axios.put(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    message.value = "✅ Cập nhật thông tin thành công!";
  } catch (err) {
    error.value = err.response?.data?.message || "❌ Cập nhật thất bại!";
  }
};

// Đổi mật khẩu
const changePassword = async () => {
  error.value = "";
  message.value = "";
  if (newPass.value !== confirmPass.value) {
    error.value = "Mật khẩu mới không khớp!";
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const url =
      role === "nhanvien"
        ? `http://localhost:5000/api/nhanvien/${props.user.MSNV}/change-password`
        : `http://localhost:5000/api/docgia/${props.user.MADOCGIA}/change-password`;

    await axios.put(
      url,
      {
        oldPassword: oldPass.value,
        newPassword: newPass.value,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    message.value = "🔑 Đổi mật khẩu thành công!";
    oldPass.value = newPass.value = confirmPass.value = "";
  } catch (err) {
    error.value = err.response?.data?.message || "❌ Đổi mật khẩu thất bại!";
  }
};
</script>

<style scoped>
.account-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  max-width: 500px; /* giới hạn chiều rộng */
  width: 100%;
  padding: 10px 15px; /* padding nhỏ hơn */
  font-size: 0.9rem; /* chữ nhỏ hơn */
  border-radius: 15px;
}

.account-form h5 {
  font-size: 1.1rem;
}

.account-form .form-label {
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.account-form input {
  font-size: 0.9rem;
  padding: 4px 6px;
  height: 30px;
}

.account-form button {
  font-size: 0.9rem;
  padding: 4px 1px;
}
.btn-link {
  text-decoration: none !important;
}
</style>
