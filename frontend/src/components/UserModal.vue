<template>
  <div
    class="user-modal"
    :style="{ paddingTop: showPassword ? '70px' : '120px' }"
  >
    <div
      class="user-card shadow-lg text-center"
      :style="{ maxWidth: showPassword ? '550px' : '450px' }"
    >
      <div class="d-flex align-items-center gap-2 mb-3 justify-content-center">
        <i class="bi bi-person-circle fs-1 text-primary"></i>
        <span class="fw-semibold fs-4">{{ user.HoTenNV || user.HOTENDG }}</span>
      </div>
      <!--Form đổi mật khẩu -->
      <AccountForm
        v-if="showPassword"
        :user="user"
        mode="password"
        @close="showPassword = false"
      />
      <!-- Thông tin chi tiết -->
      <div v-if="!showPassword && isNhanVien" class="mb-3 text-start">
        <p><strong>Mã nhân viên:</strong> {{ user.MSNV }}</p>
        <p><strong>Họ tên:</strong> {{ user.HoTenNV }}</p>
        <p><strong>Chức vụ:</strong> {{ user.ChucVu }}</p>

        <!-- Địa chỉ -->
        <p class="d-flex align-items-center justify-content-between">
          <span>
            <strong>Địa chỉ: </strong>
            <span v-if="!editDiaChi">{{ user.DiaChi }}</span>
            <input
              v-else
              v-model="editValue"
              class="form-control form-control-sm"
              @keyup.enter="saveField('DiaChi')"
            />
          </span>
          <button class="btn btn-link btn-sm p-0" @click="toggleEdit('DiaChi')">
            <i class="bi bi-pencil"></i>
          </button>
        </p>

        <!-- Số điện thoại -->
        <p class="d-flex align-items-center justify-content-between">
          <span>
            <strong>Số điện thoại: </strong>
            <span v-if="!editSDT">{{ user.SoDienThoai }}</span>
            <input
              v-else
              v-model="editValue"
              class="form-control form-control-sm"
              @keyup.enter="saveField('SDT')"
            />
          </span>
          <button class="btn btn-link btn-sm p-0" @click="toggleEdit('SDT')">
            <i class="bi bi-pencil"></i>
          </button>
        </p>
      </div>

      <div v-if="!showPassword && !isNhanVien" class="mb-3 text-start">
        <p><strong>Mã độc giả:</strong> {{ user.MADOCGIA }}</p>
        <p><strong>Họ tên:</strong> {{ user.HOTENDG }}</p>
        <p><strong>Ngày sinh:</strong> {{ formatDate(user.NGAYSINH) }}</p>
        <p><strong>Giới tính:</strong> {{ user.PHAI }}</p>
        <p><strong>Địa chỉ:</strong> {{ user.DIACHI }}</p>

        <!-- Số điện thoại -->
        <p class="d-flex align-items-center justify-content-between">
          <span>
            <strong>Số điện thoại: </strong>
            <span v-if="!editSDT">{{ user.DIENTHOAI }}</span>
            <input
              v-else
              v-model="editValue"
              class="form-control form-control-sm"
              @keyup.enter="saveField('SDT')"
            />
          </span>
          <button class="btn btn-link btn-sm p-0" @click="toggleEdit('SDT')">
            <i class="bi bi-pencil"></i>
          </button>
        </p>

        <!-- Email -->
        <p class="d-flex align-items-center justify-content-between">
          <span>
            <strong>Email: </strong>
            <span v-if="!editEmail">{{ user.EMAIL }}</span>
            <input
              v-else
              v-model="editValue"
              class="form-control form-control-sm"
              @keyup.enter="saveField('Email')"
            />
          </span>
          <button class="btn btn-link btn-sm p-0" @click="toggleEdit('Email')">
            <i class="bi bi-pencil"></i>
          </button>
        </p>
      </div>
      <!-- Nút đổi mật khẩu + đăng xuất -->
      <div class="d-flex flex-column gap-2 w-75 mx-auto">
        <button
          class="btn btn-outline-warning btn-sm"
          @click="showPassword = true"
        >
          <i class="bi bi-key"></i> Đổi mật khẩu
        </button>
        <button class="btn-logout btn-sm" @click="$emit('logout')">
          <i class="bi bi-box-arrow-right"></i> Đăng xuất
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import AccountForm from "@/components/AccountForm.vue";

const props = defineProps({ user: Object });
const emit = defineEmits(["logout"]);

const showPassword = ref(false);
const isNhanVien = computed(() => !!props.user?.MSNV);

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
// Edit states
const editDiaChi = ref(false);
const editSDT = ref(false);
const editEmail = ref(false);
const editValue = ref("");
// Toggle chỉnh sửa + lưu khi nhấn lần 2
const toggleEdit = async (field) => {
  const isEditing =
    (field === "DiaChi" && editDiaChi.value) ||
    (field === "SDT" && editSDT.value) ||
    (field === "Email" && editEmail.value);

  if (isEditing) {
    await saveField(field);
    // 🟢 Sau khi lưu, tắt trạng thái edit
    if (field === "DiaChi") editDiaChi.value = false;
    if (field === "SDT") editSDT.value = false;
    if (field === "Email") editEmail.value = false;
  } else {
    // 🔵 Bật input lên
    if (field === "DiaChi") {
      editValue.value = props.user.DiaChi;
      editDiaChi.value = true;
    }
    if (field === "SDT") {
      editValue.value = isNhanVien.value
        ? props.user.SoDienThoai
        : props.user.DIENTHOAI;
      editSDT.value = true;
    }
    if (field === "Email") {
      editValue.value = props.user.EMAIL;
      editEmail.value = true;
    }
  }
};

// 🟢 Hàm lưu thông tin thực tế
const saveField = async (field) => {
  try {
    let url = "";
    let payload = {};

    if (isNhanVien.value) {
      url = `http://localhost:5000/api/nhanvien/${props.user.MSNV}`;
      if (field === "DiaChi") payload = { DiaChi: editValue.value };
      if (field === "SDT") payload = { SoDienThoai: editValue.value };
    } else {
      url = `http://localhost:5000/api/docgia/${props.user.MADOCGIA}`;
      if (field === "SDT") payload = { DIENTHOAI: editValue.value };
      if (field === "Email") payload = { EMAIL: editValue.value };
    }

    const token = localStorage.getItem("token");
    const res = await axios.put(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Cập nhật giao diện
    if (field === "DiaChi") {
      props.user.DiaChi = editValue.value;
      editDiaChi.value = false;
    }
    if (field === "SDT") {
      if (isNhanVien.value) props.user.SoDienThoai = editValue.value;
      else props.user.DIENTHOAI = editValue.value;
      editSDT.value = false;
    }
    if (field === "Email") {
      props.user.EMAIL = editValue.value;
      editEmail.value = false;
    }

    // 🟢 Cập nhật localStorage luôn để khi F5 không bị cache cũ
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    Object.assign(currentUser, props.user);
    localStorage.setItem("user", JSON.stringify(currentUser));

    alert("✅ Cập nhật thành công!");
  } catch (err) {
    console.error(err);
    alert("❌ Cập nhật thất bại!");
  }
};
</script>

<style scoped>
.user-modal {
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 15px;
  padding: 10px 30px;
  width: 100%;
  animation: fadeIn 0.8s ease;
}
.user-card p {
  margin: 4px 0px; /* giảm khoảng cách giữa các dòng */
  font-size: 0.95rem; /* chữ hơi nhỏ hơn */
}

.btn-logout {
  border: none;
  background: #0d6efd;
  color: white;
  border-radius: 3px;
  font-weight: 500;
  padding: 8px 12px;
  display: inline-flex;
  justify-content: center;
  gap: 12px;
}
.btn-logout:hover {
  background: #0b5ed7;
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
