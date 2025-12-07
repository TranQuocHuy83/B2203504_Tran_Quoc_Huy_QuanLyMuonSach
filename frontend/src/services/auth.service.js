// src/services/auth.service.js
import api from "../api/api.service";

export const login = async (MSNV, Password) => {
  const res = await api.post("/nhanvien/login", { MSNV, Password });
  // backend trả { token, user }
  if (res.data?.token) {
    localStorage.setItem("jwt_token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }
  return res.data;
};

export const logout = () => {
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};
