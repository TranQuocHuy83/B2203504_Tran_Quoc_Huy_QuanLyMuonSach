<template>
  <div id="app">
    <AppHeader v-if="showHeader" />
    <router-view />
    <!--<Chatbot />-->
    <Footer />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router"; // <-- cần import
import AppHeader from "./components/AppHeader.vue";
import Footer from "./components/Footer.vue";
import Chatbot from "./components/Chatbot.vue";
// Chỉ hiển thị header khi không phải trang SachDetail
const route = useRoute(); // <-- khai báo route
const showHeader = computed(
  () =>
    route.name !== "sachDetail" &&
    route.name !== "LichSuMuonSach" &&
    route.name !== "BorrowDetail"
);
</script>

<style>
body {
  background-color: #f8f9fa;
  font-family: "Segoe UI", sans-serif;
}
</style>
