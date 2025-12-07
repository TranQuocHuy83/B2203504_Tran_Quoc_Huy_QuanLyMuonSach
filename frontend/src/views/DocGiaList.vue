<template>
  <div>
    <!-- 🟩 Banner full màn hình -->
    <div class="banner-docgia">
      <img
        src="D:\Huy IT\CT449- PTUD Web\Project\QuanLyMuonSach\frontend\pictures\banner01.jpg"
        alt="Banner Độc giả"
        class="banner-img"
      />
      <div class="overlay"></div>
      <div class="banner-text">
        <h2>Quản Lý Độc Giả</h2>
        <p>Quản lý thông tin độc giả trong hệ thống</p>
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
          @keyup.enter="searchDocGia"
          type="text"
          placeholder="Nhập tên độc giả để tìm kiếm ... "
          class="form-control form-control-sm"
          style="
            font-size: 1rem;
            border-radius: 50px;
            width: 900px;
            border: 1.5px solid #000000fb;
          "
        />

        <!-- Nút thêm -->
        <button class="btn btn-primary btn-sm" @click="openCreate">
          <i class="fa-solid fa-plus"></i> Thêm độc giả
        </button>

        <!-- Nút làm mới -->
        <button class="btn btn-secondary btn-sm" @click="load">
          <i class="fa-solid fa-rotate-right"></i> Làm mới
        </button>
      </div>
      <!-- 🟢🟢🟢 -FROM-->
      <div v-if="showForm" class="mt-3 card p-3">
        <h5 class="text-center">
          {{ editing ? "Sửa độc giả" : "Thêm độc giả" }}
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
        :headers="[
          'Mã độc giả',
          'Họ tên',
          'Ngày sinh',
          'Giới tính',
          'Địa chỉ',
          'Điện thoại',
          'Email',
        ]"
        :keys="[
          'MADOCGIA',
          'HOTENDG',
          'NGAYSINH',
          'PHAI',
          'DIACHI',
          'DIENTHOAI',
          'EMAIL',
        ]"
        type="docgia"
        :rows="list"
        @view="onView"
      />
      <!-- 🔍 Modal xem chi tiết -->
      <div
        v-if="showDetailModal"
        class="modal fade show"
        style="display: block; background: rgba(0, 0, 0, 0.4)"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Chi tiết độc giả</h5>
              <button
                type="button"
                class="btn-close"
                @click="closeDetail"
              ></button>
            </div>
            <div class="modal-body d-flex gap-3" style="flex-wrap: nowrap">
              <div class="flex-fill border p-3" style="min-width: 200px">
                <h4>Thông tin độc giả</h4>
                <p></p>
                <p><b>Mã độc giả:</b> {{ currentDocGia.MADOCGIA }}</p>
                <p><b>Họ tên:</b> {{ currentDocGia.HOTENDG }}</p>
                <p><b>Ngày sinh:</b> {{ currentDocGia.NGAYSINH }}</p>
                <p><b>Giới tính:</b> {{ currentDocGia.PHAI }}</p>
                <p><b>Điện thoại:</b> {{ currentDocGia.DIENTHOAI }}</p>
                <p><b>Email:</b> {{ currentDocGia.EMAIL }}</p>
                <p>
                  <b>Ngày tạo:</b> {{ formatDate(currentDocGia.createdAt) }}
                </p>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeDetail">
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import TableList from "../components/TableList.vue";
import ItemForm from "../components/ItemForm.vue";
import {
  getAllDocGia,
  getDGByName,
  createDocGia,
  updateDocGia,
  deleteDocGia,
} from "../services/docgia.service";

export default {
  components: { TableList, ItemForm },
  setup() {
    const list = ref([]);
    const showForm = ref(false);
    const editing = ref(false);
    const formInitial = ref({});
    const searchText = ref("");
    // ⚙️ Biến điều khiển modal xem chi tiết
    const showDetailModal = ref(false);
    const currentDocGia = ref({});

    const labels = {
      //dành cho form
      MADOCGIA: "Mã độc giả",
      HOTENDG: "Họ tên",
      NGAYSINH: "Ngày sinh",
      PHAI: "Giới tính",
      DIACHI: "Địa chỉ",
      DIENTHOAI: "Điện thoại",
      EMAIL: "Email",
    };
    const load = async () => {
      searchText.value = ""; // 🧹 Xóa nội dung ô tìm kiếm
      formInitial.value = {
        MADOCGIA: "",
        HOTENDG: "",
        NGAYSINH: "",
        PHAI: "",
        DIACHI: "",
        DIENTHOAI: "",
        EMAIL: "",
      }; // 🧼 Xóa trắng form
      const res = await getAllDocGia();
      list.value = res.data
        .map((dg) => ({
          ...dg,
          NGAYSINH: new Date(dg.NGAYSINH).toLocaleDateString("vi-VN"),
        }))
        .sort((a, b) => {
          const numA = parseInt(a.MADOCGIA.slice(-3));
          const numB = parseInt(b.MADOCGIA.slice(-3));
          return numA - numB;
        });
    };
    onMounted(load);

    // 🟢 Tìm kiếm theo tên
    const searchDocGia = async () => {
      if (!searchText.value.trim()) {
        await load();
        return;
      }
      try {
        const res = await getDGByName(searchText.value);
        list.value = res.data
          .map((dg) => ({
            ...dg,
            NGAYSINH: new Date(dg.NGAYSINH).toLocaleDateString("vi-VN"),
          }))
          .sort((a, b) => {
            const numA = parseInt(a.MADOCGIA.slice(-3));
            const numB = parseInt(b.MADOCGIA.slice(-3));
            return numA - numB;
          });
      } catch (err) {
        if (err.response?.status === 404)
          alert("Không tìm thấy độc giả phù hợp!");
        else alert("Lỗi khi tìm kiếm độc giả!");
      }
    };
    // 👁 Xem chi tiết ĐỘC GIẢ
    const onView = (row) => {
      currentDocGia.value = { ...row };
      showDetailModal.value = true;
    };
    const closeDetail = () => {
      showDetailModal.value = false;
      currentDocGia.value = {};
    };

    const openCreate = () => {
      editing.value = false;
      formInitial.value = {
        MADOCGIA: "",
        HOTENDG: "",
        NGAYSINH: "",
        PHAI: "Nam",
        DIACHI: "",
        DIENTHOAI: "",
        PASSWORD: "123456",
        EMAIL: "",
      };
      showForm.value = true;
    };
    const onEdit = (row) => {
      editing.value = true;
      const { MADOCGIA, HOTENDG, NGAYSINH, PHAI, DIACHI, DIENTHOAI, EMAIL } =
        row;

      let dateStr = NGAYSINH;

      // 👉 Nếu ngày có dạng dd/mm/yyyy thì chuyển sang yyyy-mm-dd
      if (dateStr && dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      // 👉 Nếu hợp lệ thì chuyển sang dạng chuẩn cho input[type="date"]
      let formattedDate = "";
      if (dateStr && !isNaN(new Date(dateStr))) {
        formattedDate = new Date(dateStr).toISOString().split("T")[0];
      }

      formInitial.value = {
        MADOCGIA,
        HOTENDG,
        NGAYSINH: formattedDate,
        PHAI,
        DIACHI,
        DIENTHOAI,
        EMAIL,
      };

      showForm.value = true;
    };

    const onDelete = async (row) => {
      if (!confirm("Xóa độc giả?")) return;
      await deleteDocGia(row.MADOCGIA);
      await load();
    };
    const save = async (data) => {
      // ✅ Giữ đúng định dạng YYYY-MM-DD, không tạo Date mới
      if (data.NGAYSINH) {
        // Bỏ phần T...Z nếu người dùng chọn từ input date
        data.NGAYSINH = data.NGAYSINH.split("T")[0];
      }

      try {
        if (editing.value) {
          await updateDocGia(data.MADOCGIA, data);
        } else {
          await createDocGia(data);
        }

        showForm.value = false;
        await load();
      } catch (err) {
        // Nếu backend trả lỗi "Mã độc giả đã tồn tại!"
        if (err.response?.data?.message) {
          alert(err.response.data.message);
        } else {
          alert("Có lỗi xảy ra khi lưu dữ liệu!");
        }
      }
    };

    const closeForm = () => (showForm.value = false);
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return {
      list,
      load,
      openCreate,
      onEdit,
      onDelete,
      showForm,
      formInitial,
      save,
      labels,
      editing,
      closeForm,
      searchText,
      searchDocGia,
      showDetailModal,
      onView,
      closeDetail,
      currentDocGia,
      formatDate,
    };
  },
};
</script>

<style scoped>
.banner-docgia {
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  overflow: hidden;
  border-radius: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.banner-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  filter: brightness(0.8); /* mờ nhẹ */
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

.banner-text {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  text-align: center;
  z-index: 2;
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
