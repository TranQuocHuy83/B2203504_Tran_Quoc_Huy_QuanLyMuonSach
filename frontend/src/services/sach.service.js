import api from "../api/api.service";

export const getAllSach = () => api.get("/sach");
export const getSachByName = (ten) =>
  api.get(`/sach/name/${encodeURIComponent(ten)}`);
// Lấy sách theo mã
export const getSachByMasach = (masach) => {
  return api.get(`/sach/masach/${masach}`).then((res) => res.data); //dùng trực tiếp nên return
};

// Tìm sách theo từ khóa
export const searchSach = (kw) =>
  api.get(`/sach/search/${encodeURIComponent(kw)}`);

export const createSach = (data) => api.post("/sach", data);
export const updateSach = (id, data) => api.put(`/sach/${id}`, data);
export const deleteSach = (id) => api.delete(`/sach/${id}`);

export function uploadSachImage(masach, file) {
  const formData = new FormData();
  formData.append("image", file);

  return api.post(`/uploads/sach/${masach}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
export function updateSachImage(masach, imageUrl) {
  return api.put(`/sach/${masach}/image`, { IMAGE_URL: imageUrl });
}
