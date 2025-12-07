<template>
  <div>
    <!-- 🟩 Banner full màn hình -->
    <div class="banner-theodoi">
      <img
        src="D:\Huy IT\CT449- PTUD Web\Project\QuanLyMuonSach\frontend\pictures\banner01.jpg"
        alt="Banner Theo dõi mượn trả"
        class="banner-img"
      />
      <div class="overlay"></div>
      <div class="banner-text">
        <h2>Theo dõi Mượn / Trả</h2>
        <p>Quản lý mượn và trả sách của độc giả</p>
      </div>
    </div>

    <!-- 🟦 Nội dung chính -->
    <div class="container mt-3">
      <!-- Bộ lọc + tìm kiếm + nút mượn -->
      <div class="d-flex align-items-center mb-2 gap-2 flex-wrap">
        <!-- Bộ lọc -->
        <div style="position: relative; width: 220px">
          <i
            class="fa-solid fa-filter"
            style="
              position: absolute;
              top: 50%;
              left: 12px;
              transform: translateY(-50%);
              color: #555;
              font-size: 14px;
              z-index: 2;
            "
          ></i>
          <select
            v-model="filterType"
            class="form-select form-select-sm"
            style="width: 100%; border-radius: 50px; padding-left: 32px"
          >
            <option value="MADOCGIA">Tìm theo Mã độc giả</option>
            <option value="MASACH">Tìm theo Mã sách</option>
          </select>
        </div>

        <!-- Ô tìm kiếm -->
        <input
          v-model="searchValue"
          type="text"
          :placeholder="searchPlaceholder"
          class="form-control form-control-sm"
          style="
            font-size: 1rem;
            border-radius: 50px;
            width: 500px;
            border: 1.5px solid #000000fb;
          "
        />

        <!-- Nút tìm kiếm -->
        <button class="btn btn-success btn-sm" @click="searchRecord">
          <i class="fa-solid fa-magnifying-glass"></i> Tìm
        </button>

        <!-- Nút làm mới -->
        <button class="btn btn-secondary btn-sm" @click="resetFilter">
          <i class="fa-solid fa-rotate-right"></i> Làm mới
        </button>

        <!-- Nút mượn sách -->
        <button class="btn btn-primary btn-sm ms-auto" @click="openMuon">
          <i class="fa-solid fa-plus"></i> Thêm phiếu mượn
        </button>
      </div>

      <!-- 🟢 Form mượn sách -->
      <div v-if="showMuonForm" class="mt-3 card p-3">
        <h5>Mượn sách</h5>
        <ItemForm
          :initial="muonInitial"
          :labels="labels"
          @save="muonSave"
          @cancel="closeMuon"
        />
      </div>

      <!-- 🟢 Bảng danh sách mượn/trả -->
      <TableList
        :headers="[
          'Mã độc giả',
          'Mã sách',
          'Ngày mượn',
          'Hạn trả',
          'Ngày trả',
          'Trạng thái',
        ]"
        :keys="[
          'MADOCGIA',
          'MASACH',
          'NGAYMUON',
          'HANTRA',
          'NGAYTRA',
          'TRANGTHAI',
        ]"
        :rows="list"
        type="muon/tra"
        :showActions="true"
        :statusClass="statusColor"
        @edit="onEdit"
        @delete="onDelete"
        @view="onView"
        @xacnhan="onXacNhanMuon"
        @huy="onHuyDangKy"
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
              <h5 class="modal-title">Chi tiết phiếu mượn</h5>
              <button
                type="button"
                class="btn-close"
                @click="closeDetail"
              ></button>
            </div>
            <div class="modal-body d-flex gap-3 flex-wrap">
              <!-- Cột trái: Thông tin độc giả và sách -->
              <div class="flex-fill border p-3" style="min-width: 200px">
                <h4>Thông tin Độc Giả</h4>
                <hr />
                <p><b>Mã độc giả:</b> {{ currentDocgia?.MADOCGIA || "-" }}</p>
                <p><b>Tên độc giả:</b> {{ currentDocgia?.HOTENDG || "-" }}</p>
                <p><b>Email:</b> {{ currentDocgia?.EMAIL || "-" }}</p>

                <hr />
                <h4>Thông tin Sách</h4>
                <hr />
                <p>
                  <b>Mã sách:</b>
                  {{ currentBook?.MASACH || selectedRecord.MASACH }}
                </p>
                <p><b>Tên sách:</b> {{ currentBook?.TENSACH || "-" }}</p>
              </div>

              <!-- Cột phải: Thông tin mượn - trả -->
              <div class="flex-fill border p-3" style="min-width: 200px">
                <h4>Thông tin mượn - trả</h4>
                <hr />
                <p><b>Ngày mượn:</b> {{ selectedRecord.NGAYMUON }}</p>
                <p><b>Hạn trả:</b> {{ selectedRecord.HANTRA }}</p>
                <p><b>Ngày trả:</b> {{ selectedRecord.NGAYTRA }}</p>
                <p>
                  <b>Trạng thái: </b>
                  <span :class="statusColor(selectedRecord.TRANGTHAI)">
                    {{
                      selectedRecord.TRANGTHAI === "pending"
                        ? "Chờ lấy sách"
                        : selectedRecord.TRANGTHAI === "borrowed" ||
                          selectedRecord.TRANGTHAI === "dangmuon"
                        ? "Đã lấy sách"
                        : selectedRecord.TRANGTHAI === "cancelled"
                        ? "Đã hủy lấy"
                        : selectedRecord.TRANGTHAI === "returned" ||
                          selectedRecord.TRANGTHAI === "datra"
                        ? "Đã trả sách"
                        : "-"
                    }}
                  </span>
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
import { ref, onMounted, computed } from "vue";
import TableList from "../components/TableList.vue";
import ItemForm from "../components/ItemForm.vue";
import {
  getAllTheoDoi,
  dangKyMuonSach,
  xacNhanMuonSach,
  huyDangKySach,
  traSach,
  deleteTheoDoi,
  getTheoDoiByMaDocGia,
  getTheoDoiByMaSach,
} from "../services/theodoimuonsach.service";
import { getAllDocGia } from "../services/docgia.service";
import { getAllSach } from "../services/sach.service";

export default {
  components: { TableList, ItemForm },
  setup() {
    const filterType = ref("MADOCGIA");
    const searchValue = ref("");
    const searchPlaceholder = computed(() =>
      filterType.value === "MADOCGIA"
        ? "Nhập mã độc giả cần tìm..."
        : "Nhập mã sách cần tìm..."
    );

    const list = ref([]);
    const allDocGia = ref([]);
    const allSach = ref([]);

    const statusColor = (s) =>
      s === "pending"
        ? "text-danger"
        : s === "borrowed" || s === "dangmuon"
        ? "text-warning"
        : s === "returned" || s === "datra"
        ? "text-success"
        : "text-secondary";

    const showMuonForm = ref(false);
    const showDetailModal = ref(false);
    const selectedRecord = ref({});
    const currentDocgia = ref(null);
    const currentBook = ref(null);

    const muonInitial = ref({ MADOCGIA: "", MASACH: "" });
    const labels = { MADOCGIA: "Mã độc giả", MASACH: "Mã sách" };

    const load = async () => {
      try {
        const [td, dg, s] = await Promise.all([
          getAllTheoDoi(),
          getAllDocGia(),
          getAllSach(),
        ]);

        list.value = td.data.map((item) => ({
          ...item,
          NGAYMUON: formatDate(item.NGAYMUON),
          HANTRA: formatDate(item.HANTRA),
          NGAYTRA: formatDate(item.NGAYTRA),
        }));

        allDocGia.value = dg.data;
        allSach.value = s.data;
      } catch (err) {
        console.error(err);
        alert("Không thể tải dữ liệu!");
      }
    };

    onMounted(load);

    const searchRecord = async () => {
      const keyword = searchValue.value.trim();

      if (!keyword) {
        return load();
      }

      try {
        const response =
          filterType.value === "MADOCGIA"
            ? await getTheoDoiByMaDocGia(keyword)
            : await getTheoDoiByMaSach(keyword);

        const data = response.data;

        if (!data || data.length === 0) {
          alert("Không tìm thấy kết quả phù hợp!");
        }

        list.value = data;
      } catch (err) {
        // Nếu backend trả về mã 404 → không có dữ liệu
        if (err?.response?.status === 404) {
          alert("Không tìm thấy kết quả phù hợp!");
          list.value = [];
          return;
        }

        // Các lỗi khác
        console.error(err);
        alert("Lỗi tìm kiếm!");
      }
    };

    const resetFilter = () => {
      searchValue.value = "";
      load();
    };

    const openMuon = () => {
      muonInitial.value = { MADOCGIA: "", MASACH: "" };
      showMuonForm.value = true;
    };

    const muonSave = async (data) => {
      try {
        await dangKyMuonSach(data);
        showMuonForm.value = false;
        await load();
      } catch (err) {
        alert(err?.response?.data?.message || "Không thể mượn sách!");
      }
    };

    const onEdit = async (row) => {
      if (row.TRANGTHAI === "returned" || row.TRANGTHAI === "cancelled")
        return alert("Không thể thao tác với phiếu này!");
      if (confirm("Xác nhận trả sách?")) {
        try {
          await traSach(row._id);
          await load();
        } catch (err) {
          alert(err?.response?.data?.message || "Trả sách thất bại!");
        }
      }
    };

    const onDelete = async (row) => {
      if (!confirm("Xóa bản ghi này?")) return;
      await deleteTheoDoi(row._id);
      await load();
    };

    const onView = (row) => {
      selectedRecord.value = row;
      showDetailModal.value = true;

      currentDocgia.value =
        allDocGia.value.find((d) => d.MADOCGIA === row.MADOCGIA) || null;
      currentBook.value =
        allSach.value.find((s) => s.MASACH === row.MASACH) || null;
    };

    const closeDetail = () => {
      showDetailModal.value = false;
      currentDocgia.value = null;
      currentBook.value = null;
    };

    const closeMuon = () => (showMuonForm.value = false);

    const onXacNhanMuon = async (row) => {
      if (row.TRANGTHAI !== "pending") return;
      try {
        await xacNhanMuonSach(row._id);
        await load();
      } catch (err) {
        alert("Không thể xác nhận mượn!");
      }
    };

    const onHuyDangKy = async (row) => {
      if (row.TRANGTHAI !== "pending") return;
      try {
        await huyDangKySach(row._id);
        await load();
      } catch (err) {
        alert("Không thể hủy đăng ký!");
      }
    };

    const formatDate = (d) => (d ? new Date(d).toLocaleString() : "-");

    return {
      list,
      showMuonForm,
      showDetailModal,
      selectedRecord,
      currentDocgia,
      currentBook,
      muonInitial,
      labels,
      openMuon,
      muonSave,
      closeMuon,
      onEdit,
      onDelete,
      onView,
      closeDetail,
      filterType,
      searchValue,
      searchPlaceholder,
      searchRecord,
      resetFilter,
      onXacNhanMuon,
      onHuyDangKy,
      statusColor,
    };
  },
};
</script>

<style scoped>
.banner-theodoi {
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
  filter: brightness(0.8);
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
