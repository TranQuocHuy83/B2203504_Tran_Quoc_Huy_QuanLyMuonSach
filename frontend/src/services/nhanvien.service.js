import api from "../api/api.service";

// ==============================
// 📌 LẤY TẤT CẢ NHÂN VIÊN
// ==============================
export const getAllNhanVien = () => api.get("/nhanvien");

// ==============================
// 📌 ĐĂNG KÝ NHÂN VIÊN
// ==============================
export const registerNhanVien = (data) => api.post("/nhanvien/register", data);

// ==============================
// 📌 ĐĂNG NHẬP NHÂN VIÊN
// ==============================
export const loginNhanVien = (data) => api.post("/nhanvien/login", data);

// ==============================
// 📌 LẤY THÔNG TIN TÀI KHOẢN HIỆN TẠI (cần JWT)
// ==============================
export const getCurrentNhanVien = () => api.get("/nhanvien/me"); // header Authorization đã cấu hình trong api.service

// ==============================
// 📌 CẬP NHẬT NHÂN VIÊN THEO MSNV (cần token)
// ==============================
export const updateNhanVien = (MSNV, data) =>
  api.put(`/nhanvien/${MSNV}`, data);

// ==============================
// 📌 ĐỔI MẬT KHẨU NHÂN VIÊN (cần token)
// ==============================
export const changePasswordNhanVien = (MSNV, data) =>
  api.put(`/nhanvien/${MSNV}/change-password`, data);
