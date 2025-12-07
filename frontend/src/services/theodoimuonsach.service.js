import api from "../api/api.service";
// 🔹 Lấy tất cả bản ghi mượn trả
export const getAllTheoDoi = () => api.get("/theodoimuonsach");

// 🔹 Lọc bản ghi theo mã độc giả
export const getTheoDoiByMaDocGia = (madocgia) =>
  api.get(`/theodoimuonsach/docgia/${madocgia}`);

// 🔹 Lọc bản ghi theo mã sách
export const getTheoDoiByMaSach = (masach) =>
  api.get(`/theodoimuonsach/sach/${masach}`);

// 🔹 Đăng ký mượn sách (pending)
export const dangKyMuonSach = (data) =>
  api.post("/theodoimuonsach/request", data);

// 🔹 Xác nhận đã lấy sách → borrowed
export const xacNhanMuonSach = (id) =>
  api.put(`/theodoimuonsach/confirm/${id}`);

// 🔹 Hủy đăng ký pending
export const huyDangKySach = (id) =>
  api.delete(`/theodoimuonsach/cancel/${id}`);

// 🔹 Thêm hàm này:
export const getTheoDoiById = (id) => api.get(`/theodoimuonsach/${id}`);

// 🔹 Trả sách → returned
export const traSach = (id) => api.put(`/theodoimuonsach/tra/${id}`);

// 🔹 Xóa bản ghi
export const deleteTheoDoi = (id) => api.delete(`/theodoimuonsach/${id}`);

// 🔹 Lấy số lượng sách đang mượn theo MASACH
export const getBorrowCount = (masach) =>
  api.get(`/theodoimuonsach/count/${masach}`);
