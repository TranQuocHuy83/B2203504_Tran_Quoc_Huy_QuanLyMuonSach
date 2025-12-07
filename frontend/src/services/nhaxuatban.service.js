import api from "../api/api.service";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getAllNhaXuatBan = () =>
  api.get("/nhaxuatban", { headers: getAuthHeader() });

export const getNhaXuatBanByName = (ten) =>
  api.get(`/nhaxuatban/name/${ten}`, { headers: getAuthHeader() });

export const createNhaXuatBan = (data) =>
  api.post("/nhaxuatban", data, { headers: getAuthHeader() });

export const updateNhaXuatBan = (MANXB, data) =>
  api.put(`/nhaxuatban/${MANXB}`, data, { headers: getAuthHeader() });

export const deleteNhaXuatBan = (id) =>
  api.delete(`/nhaxuatban/${id}`, { headers: getAuthHeader() });
