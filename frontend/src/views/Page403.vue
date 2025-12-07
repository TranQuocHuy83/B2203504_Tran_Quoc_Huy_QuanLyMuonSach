<template>
  <div class="forbidden-container">
    <div class="forbidden-card">
      <h1 class="text-danger">🚫 403 - Không có quyền truy cập</h1>
      <p></p>
      <p>Bạn không đủ quyền để vào trang này.</p>
      <router-link to="/" class="btn btn-primary mt-3">
        Quay lại trang chủ
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.forbidden-container {
  height: 100vh; /* full màn hình */
  display: flex;
  justify-content: center; /* căn giữa ngang */
  align-items: center; /* căn giữa dọc */
  background-color: #f8f9fa;
}

.forbidden-card {
  background: white;
  padding: 80px 80px;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 1000px; /* tăng độ rộng */
  max-width: 90%;
}
</style>
