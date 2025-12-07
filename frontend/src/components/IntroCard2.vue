<template>
  <div class="intro-modal">
    <div class="intro-card shadow-lg text-center">
      <h2 class="fw-bold text-primary">Quản Lý Mượn Sách</h2>

      <!-- Nếu chưa đăng nhập -->
      <p v-if="!user" class="text-muted mt-2">
        Bắt đầu hành trình đọc sách của bạn – đăng nhập ngay!
      </p>

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

      <!-- Nếu đã đăng nhập -->
      <div v-else class="user-box mt-4 shadow-sm p-3 rounded">
        <div
          class="d-flex align-items-center justify-content-center gap-2 mb-2"
        >
          <i class="bi bi-person-circle fs-4 text-primary"></i>
          <span class="fw-semibold fs-5">
            {{ user.HoTenNV || user.HOTENDG }}
          </span>
          <button class="btn-logout btn-sm ms-3" @click="$emit('logout')">
            <i class="bi bi-box-arrow-right"></i> Đăng xuất
          </button>
        </div>

        <!-- Thông tin tài khoản -->
        <div class="account-info text-start mt-3 border-top pt-3">
          <!-- 🧑 Nếu là nhân viên -->
          <template v-if="user.MSNV">
            <p><b>Mã nhân viên:</b> {{ user.MSNV }}</p>
            <p><b>Họ tên:</b> {{ user.HoTenNV }}</p>
            <p><b>Chức vụ:</b> {{ user.ChucVu }}</p>

            <!-- Chỉ cho chỉnh sửa 2 trường -->
            <div class="form-group mb-2">
              <label><b>Địa chỉ:</b></label>
              <input
                v-model="editable.DiaChi"
                class="form-control form-control-sm"
                placeholder="Nhập địa chỉ mới"
              />
            </div>
            <div class="form-group mb-2">
              <label><b>Số điện thoại:</b></label>
              <input
                v-model="editable.SoDienThoai"
                class="form-control form-control-sm"
                placeholder="Nhập số điện thoại mới"
              />
            </div>
          </template>

          <!-- 📚 Nếu là độc giả -->
          <template v-else>
            <p><b>Mã độc giả:</b> {{ user.MADOCGIA }}</p>
            <p><b>Họ tên:</b> {{ user.HOTENDG }}</p>
            <p><b>Ngày sinh:</b> {{ formatDate(user.NGAYSINH) }}</p>
            <p><b>Giới tính:</b> {{ user.PHAI }}</p>
            <p><b>Địa chỉ:</b> {{ user.DIACHI }}</p>

            <!-- Chỉ cho chỉnh sửa 2 trường -->
            <div class="form-group mb-2">
              <label><b>Số điện thoại:</b></label>
              <input
                v-model="editable.DIENTHOAI"
                class="form-control form-control-sm"
                placeholder="Nhập số điện thoại mới"
              />
            </div>
            <div class="form-group mb-2">
              <label><b>Email:</b></label>
              <input
                v-model="editable.EMAIL"
                class="form-control form-control-sm"
                placeholder="Nhập email mới"
              />
            </div>
          </template>

          <!-- 🟦 Nút chức năng -->
          <div class="d-flex justify-content-between mt-3">
            <button
              class="btn btn-outline-success btn-sm"
              @click="updateAccount"
            >
              <i class="bi bi-save"></i> Cập nhật
            </button>
            <button
              class="btn btn-outline-warning btn-sm"
              @click="changePassword"
            >
              <i class="bi bi-key"></i> Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({ user: Object });
const emit = defineEmits(["show-login", "show-register", "logout"]);

const editable = reactive({
  DiaChi: "",
  SoDienThoai: "",
  DIENTHOAI: "",
  EMAIL: "",
});

watch(
  () => props.user,
  (u) => {
    if (u?.MSNV) {
      editable.DiaChi = u.DiaChi || "";
      editable.SoDienThoai = u.SoDienThoai || "";
    } else if (u?.MADOCGIA) {
      editable.DIENTHOAI = u.DIENTHOAI || "";
      editable.EMAIL = u.EMAIL || "";
    }
  },
  { immediate: true }
);

const getToken = () => localStorage.getItem("jwt_token");

// 🟩 Cập nhật tài khoản
const updateAccount = async () => {
  if (!props.user) return;
  const token = getToken();
  if (!token) {
    alert("Vui lòng đăng nhập trước khi cập nhật!");
    return;
  }

  let url = "";
  let payload = {};

  if (props.user.MSNV) {
    url = `http://localhost:5000/api/nhanvien/${props.user.MSNV}`;
    payload = {
      DiaChi: editable.DiaChi,
      SoDienThoai: editable.SoDienThoai,
    };
  } else if (props.user.MADOCGIA) {
    url = `http://localhost:5000/api/docgia/${props.user.MADOCGIA}`;
    payload = {
      DIENTHOAI: editable.DIENTHOAI,
      EMAIL: editable.EMAIL,
    };
  }

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Cập nhật thất bại!");

    alert("✅ Cập nhật thành công!");
    console.log("Thông tin mới:", data);
  } catch (err) {
    alert("❌ " + err.message);
  }
};

// 🟨 Đổi mật khẩu
const changePassword = async () => {
  if (!props.user) return;

  const token = getToken();
  if (!token) {
    alert("Vui lòng đăng nhập trước!");
    return;
  }

  const oldPass = prompt("Nhập mật khẩu cũ:");
  const newPass = prompt("Nhập mật khẩu mới:");
  if (!oldPass || !newPass) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  let url = "";
  if (props.user.MSNV)
    url = `http://localhost:5000/api/nhanvien/change-password/${props.user.MSNV}`;
  else if (props.user.MADOCGIA)
    url = `http://localhost:5000/api/docgia/change-password/${props.user.MADOCGIA}`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại!");

    alert("🔐 Đổi mật khẩu thành công!");
  } catch (err) {
    alert("❌ " + err.message);
  }
};

const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN");
</script>

<style scoped>
.intro-modal {
  position: relative;
  z-index: 10;
  padding-top: 10px;
  display: flex;
  justify-content: center;
  align-items: start;
}
.intro-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 15px;
  padding: 35px 45px;
  max-width: 550px;
  width: 100%;
  animation: fadeIn 0.8s ease;
}
.user-box {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  padding: 20px;
}
.btn-logout {
  border: none;
  background: #0d6efd;
  color: white;
  border-radius: 8px;
  font-weight: 500;
  padding: 5px 10px;
  transition: 0.3s;
}
.btn-logout:hover {
  background: #0b5ed7;
}
.account-info p {
  margin-bottom: 6px;
}
</style>
