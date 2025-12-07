<template>
  <div>
    <!-- 🟩 Banner full màn hình -->
    <div class="bannernxb">
      <img
        src="D:\Huy IT\CT449- PTUD Web\Project\QuanLyMuonSach\frontend\pictures\banner01.jpg"
        alt="Banner Nhà Xuất Bản"
        class="banner-img"
      />
      <div class="overlay"></div>
      <!-- 🔹 thêm dòng này -->
      <div class="banner-text">
        <h2>Quản Lý Nhà Xuất Bản</h2>
        <p>Quản lý danh sách nhà xuất bản trong hệ thống</p>
      </div>
    </div>

    <!-- 🟦 Phần nội dung có container -->
    <div class="container">
      <h3 class="mt-2"></h3>
      <!-- 🔹 Hàng chứa ô tìm kiếm + nút -->
      <div class="d-flex align-items-center mb-2 gap-2">
        <!-- Ô tìm kiếm -->
        <input
          v-model="searchText"
          @keyup.enter="searchNXB"
          type="text"
          placeholder="Nhập tên nhà xuất bản để tìm kiếm ... "
          class="form-control form-control-sm"
          style="
            font-size: 1rem;
            border-radius: 50px;
            width: 850px;
            border: 1.5px solid #000000fb;
          "
        />

        <!-- Nút thêm -->
        <button class="btn btn-primary btn-sm" @click="openCreate">
          <i class="fa-solid fa-plus"></i> Thêm nhà xuất bản
        </button>

        <!-- Nút làm mới -->
        <button class="btn btn-secondary btn-sm" @click="load">
          <i class="fa-solid fa-rotate-right"></i> Làm mới
        </button>
      </div>
      <!-- 🟢🟢🟢 -FROM-->
      <div v-if="showForm" class="mt-3 card p-3">
        <h5 class="text-center">
          {{ editing ? "Cập nhật nhà xuất bản" : "Thêm nhà xuất bản" }}
        </h5>
        <ItemForm
          :initial="formInitial"
          :labels="labels"
          :isSachForm="false"
          @save="save"
          @cancel="closeForm"
        />
      </div>
      <!-- 🟢🟢🟢 -TABLE-->
      <TableList
        :headers="['Mã nhà xuất bản', 'Tên nhà xuất bản', 'Địa chỉ']"
        :keys="['MANXB', 'TENNXB', 'DIACHI']"
        :rows="list"
        @edit="onEdit"
        @delete="onDelete"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import TableList from "../components/TableList.vue";
import ItemForm from "../components/ItemForm.vue";
import {
  getAllNhaXuatBan,
  createNhaXuatBan,
  updateNhaXuatBan,
  deleteNhaXuatBan,
  getNhaXuatBanByName,
} from "../services/nhaxuatban.service";

export default {
  components: { TableList, ItemForm },
  setup() {
    const list = ref([]);
    const showForm = ref(false);
    const editing = ref(false);
    const formInitial = ref({});
    const searchText = ref("");

    const labels = {
      //dành cho form
      MANXB: "Mã nhà xuất bản",
      TENNXB: "Tên nhà xuất bản",
      DIACHI: "Địa chỉ",
    };

    const load = async () => {
      searchText.value = ""; // 🧹 Xóa nội dung ô tìm kiếm
      formInitial.value = { MANXB: "", TENNXB: "", DIACHI: "" }; // 🧼 Xóa trắng form

      const res = await getAllNhaXuatBan(); // 🔁 Load toàn bộ danh sách
      list.value = res.data.sort((a, b) => {
        // Lấy 3 ký tự cuối của mã (ví dụ: 'NXB005' -> 5)
        const numA = parseInt(a.MANXB.slice(-3));
        const numB = parseInt(b.MANXB.slice(-3));
        return numA - numB;
      });
    };

    onMounted(load);

    // 🟢 Tìm kiếm theo tên
    const searchNXB = async () => {
      if (!searchText.value.trim()) {
        await load();
        return;
      }
      try {
        const res = await getNhaXuatBanByName(searchText.value);
        list.value = res.data;
      } catch (err) {
        if (err.response?.status === 404)
          alert("Không tìm thấy nhà xuất bản phù hợp!");
        else alert("Lỗi khi tìm kiếm NXB!");
      }
    };

    const openCreate = () => {
      editing.value = false;
      formInitial.value = { MANXB: "", TENNXB: "", DIACHI: "" };
      showForm.value = true;
    };
    const onEdit = (row) => {
      editing.value = true;
      const { MANXB, TENNXB, DIACHI } = row;
      formInitial.value = { MANXB, TENNXB, DIACHI };
      showForm.value = true;
    };
    const onDelete = async (row) => {
      if (!confirm("Xóa NXB?")) return;
      await deleteNhaXuatBan(row._id);
      await load();
    };

    const save = async (data) => {
      try {
        if (editing.value) {
          await updateNhaXuatBan(data.MANXB, data);
        } else {
          await createNhaXuatBan(data);
        }

        showForm.value = false;
        await load();
      } catch (err) {
        // 🟥 Nếu backend trả lỗi "Mã Nhà Xuất Bản đã tồn tại"
        if (err.response?.data?.message) {
          alert(err.response.data.message);
        } else {
          alert("Có lỗi xảy ra khi lưu dữ liệu!");
        }
      }
    };

    const closeForm = () => (showForm.value = false);

    return {
      list,
      load,
      openCreate,
      onEdit,
      onDelete,
      showForm,
      formInitial,
      save,
      editing,
      closeForm,
      searchText,
      searchNXB,
      labels, // 👈 thêm dòng này
    };
  },
};
</script>

<style scoped>
.bannernxb {
  position: relative;
  width: 100vw; /* full màn hình */
  margin-left: calc(-50vw + 50%); /* bỏ giới hạn container */
  overflow: hidden;
  border-radius: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.banner-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  filter: brightness(0.8);
  /* margin-top: 70px;  tránh bị header đè */
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45); /* giống Home */
  z-index: 1;
}

.banner-text {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  text-align: center;
  z-index: 2; /* nằm trên overlay */
}

.banner-text h2 {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.banner-text p {
  font-size: 1rem;
}
.container {
  max-width: 100%;
}
</style>
