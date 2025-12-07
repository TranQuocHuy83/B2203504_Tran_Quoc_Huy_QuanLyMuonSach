// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import SachList from "../views/SachList.vue";
import DocGiaList from "../views/DocGiaList.vue";
import NhaXuatBanList from "../views/NhaXuatBanList.vue";
import TheoDoiMuonSachList from "../views/TheoDoiMuonSachList.vue";
import Login from "../views/LoginPage.vue";
import Page403 from "../views/Page403.vue";
import SachDetail from "../views/SachDetail.vue";

const routes = [
  { path: "/", name: "home", component: Home },

  // ❗ Chỉ nhân viên mới vào được
  { path: "/sach", component: SachList, meta: { role: "nhanvien" } },
  { path: "/docgia", component: DocGiaList, meta: { role: "nhanvien" } },
  {
    path: "/nhaxuatban",
    component: NhaXuatBanList,
    meta: { role: "nhanvien" },
  },
  {
    path: "/theodoimuonsach",
    component: TheoDoiMuonSachList,
    meta: { role: "nhanvien" },
  },

  { path: "/login", component: Login },
  { path: "/403", component: Page403 },

  { path: "/sach/:masach", name: "sachDetail", component: SachDetail },
  {
    path: "/lichsu",
    name: "LichSuMuonSach",
    component: () => import("../views/HistoryBorrow.vue"),
  },
  {
    path: "/borrow-detail/:id",
    name: "BorrowDetail",
    component: () => import("../views/BorrowDetail.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../views/SearchResult.vue"),
  },
  // catch all đặt cuối cùng
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard phân quyền
router.beforeEach((to, from, next) => {
  const token =
    localStorage.getItem("jwt_token") || localStorage.getItem("token");
  const role = localStorage.getItem("role") || "guest";

  // Chặn route yêu cầu quyền
  if (to.meta.role) {
    if (role !== to.meta.role) {
      return next("/403");
    }
  }

  next();
});

export default router;
