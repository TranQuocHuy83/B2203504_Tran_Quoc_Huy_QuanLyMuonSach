import api from "../api/api.service";

// ✅ Lấy toàn bộ độc giả
export const getAllDocGia = () => api.get("/docgia");

// ✅ Tìm độc giả theo tên (đúng route backend: /docgia/name/:ten)
export const getDGByName = (ten) =>
  api.get(`/docgia/name/${encodeURIComponent(ten)}`);

// ✅ Tạo mới độc giả
export const createDocGia = (data) => api.post("/docgia", data);

// ✅ Cập nhật độc giả theo mã độc giả (MADOCGIA)
export const updateDocGia = (MADOCGIA, data) =>
  api.put(`/docgia/${MADOCGIA}`, data);

// ✅ Xóa độc giả theo mã độc giả (MADOCGIA)
export const deleteDocGia = (MADOCGIA) => api.delete(`/docgia/${MADOCGIA}`);
