<template>
  <div>
    <!-- 🟩 Banner full màn hình -->
    <div class="bannersach">
      <img
        src="D:\Huy IT\CT449- PTUD Web\Project\QuanLyMuonSach\frontend\pictures\banner01.jpg"
        alt="Banner Sách"
        class="banner-img"
      />
      <div class="overlay"></div>
      <div class="banner-text">
        <h2>Quản Lý Sách</h2>
        <p>Thêm, sửa, xóa và tra cứu sách trong hệ thống</p>
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
          @keyup.enter="searchBook"
          type="text"
          placeholder="Nhập tên sách để tìm kiếm ... "
          class="form-control form-control-sm"
          style="
            font-size: 1rem;
            border-radius: 50px;
            width: 700px;
            border: 1.5px solid #000000fb;
          "
        />

        <!-- Nút thêm -->
        <button class="btn btn-primary btn-sm" @click="openCreate">
          <i class="fa-solid fa-plus"></i> Thêm sách
        </button>

        <!-- Nút làm mới -->
        <button class="btn btn-secondary btn-sm" @click="load">
          <i class="fa-solid fa-rotate-right"></i> Làm mới
        </button>
      </div>

      <!-- 🟢 Form thêm / sửa -->
      <div v-if="showForm" class="mt-3 card p-3">
        <h5 class="text-center">
          {{ editing ? "Sửa sách" : "Thêm sách" }}
        </h5>
        <ItemForm
          :initial="formInitial"
          :labels="labels"
          :nxbs="nxbList"
          :isSachForm="true"
          @save="save"
          @cancel="closeForm"
        />
      </div>

      <!-- 🟢 Bảng danh sách -->
      <TableList
        :headers="['Mã sách', 'Tên sách', 'Tác giả', 'Đơn giá', 'Số quyển']"
        :keys="['MASACH', 'TENSACH', 'TACGIA', 'DONGIA', 'SOQUYEN']"
        :rows="books"
        type="sach"
        @edit="onEdit"
        @delete="onDelete"
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
              <h5 class="modal-title">Chi tiết sách</h5>
              <button
                type="button"
                class="btn-close"
                @click="closeDetail"
              ></button>
            </div>
            <div class="modal-body d-flex gap-3" style="flex-wrap: nowrap">
              <!-- Cột trái: Thông tin sách -->
              <div
                class="flex-fill text-center border p-3"
                style="min-width: 300px"
              >
                <h4>
                  <strong style="color: #007bff">{{
                    currentBook.TENSACH
                  }}</strong>
                </h4>

                <!-- Ảnh sách -->
                <div class="text-center mb-2" style="padding-top: 20px">
                  <img
                    :src="previewImage || defaultImage"
                    alt="currentBook.TENSACH"
                    class="book-image"
                  />
                </div>

                <!-- ICON CÂY BÚT -->
                <div class="text-center mt-2">
                  <button
                    class="btn btn-warning btn-sm"
                    @click="showImageTools = !showImageTools"
                  >
                    <i class="fa-solid fa-pen"></i> Chỉnh sửa ảnh
                  </button>
                </div>

                <!-- KHỐI UPLOAD + LƯU (chỉ hiện khi mở) -->
                <div v-if="showImageTools" class="mt-2">
                  <!-- Upload ảnh -->
                  <input
                    type="file"
                    accept="image/*"
                    @change="onImageSelect"
                    class="form-control form-control-sm mb-2"
                    style="min-width: 300px"
                  />

                  <!-- Lưu -->
                  <button
                    class="btn btn-primary btn-sm"
                    @click="uploadImageToBE"
                  >
                    <i class="fa-solid fa-upload"></i> Lưu ảnh
                  </button>
                </div>
              </div>

              <!-- Cột phải: Thông tin nhà xuất bản -->
              <div class="flex-fill border p-3" style="min-width: 200px">
                <h4>Thông tin sách</h4>
                <p></p>
                <p><b>Mã sách:</b> {{ currentBook.MASACH }}</p>
                <p><b>Tên sách:</b> {{ currentBook.TENSACH }}</p>
                <p><b>Tác giả:</b> {{ currentBook.TACGIA }}</p>
                <p>
                  <b>Đơn giá:</b> {{ currentBook.DONGIA?.toLocaleString() }}₫
                </p>
                <p>
                  <b>Số quyển còn lại:</b>
                  {{ currentBook.SOQUYEN }}&nbsp;&nbsp;&nbsp;&nbsp;
                  <b>Đang mượn:</b>
                  {{ currentBook.dangMuon }}
                </p>
                <p><b>Năm xuất bản:</b> {{ currentBook.NAMXUATBAN }}</p>
                <hr />
                <h4>Thông tin nhà xuất bản</h4>
                <p></p>
                <p><b>Mã NXB:</b> {{ currentBook.MANXB }}</p>
                <p><b>Tên NXB:</b> {{ currentBook.TENNXB }}</p>
                <p><b>Địa chỉ NXB:</b> {{ currentBook.DIACHI }}</p>
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
  getAllSach,
  createSach,
  updateSach,
  deleteSach,
  getSachByName,
  uploadSachImage,
  updateSachImage,
} from "../services/sach.service";
import { getAllNhaXuatBan } from "../services/nhaxuatban.service";
import { getBorrowCount } from "../services/theodoimuonsach.service";
import defaultBook from "../assets/book.png"; // import đúng từ src/assets
export default {
  components: { TableList, ItemForm },
  setup() {
    // trong setup()
    const showImageTools = ref(false);

    const selectedFile = ref(null);
    const previewImage = ref("");

    const defaultImage = defaultBook;

    const books = ref([]);
    const showForm = ref(false);
    const editing = ref(false);
    const formInitial = ref({});
    const searchText = ref("");

    // Chọn ảnh
    const onImageSelect = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      selectedFile.value = file;
      previewImage.value = URL.createObjectURL(file);
      console.log("Selected file for upload:", file);
    };

    // Upload lên BE
    const uploadImageToBE = async () => {
      if (!currentBook.value.MASACH) {
        return alert("Bạn phải lưu sách trước khi upload ảnh!");
      }
      if (!selectedFile.value) {
        return alert("Chưa chọn file!");
      }

      try {
        console.log("Uploading file for", currentBook.value.MASACH);
        const res = await uploadSachImage(
          currentBook.value.MASACH,
          selectedFile.value
        );
        console.log("upload response:", res.data);

        const url = res.data.url; // ví dụ "/uploads/sach/S001.png"

        // ⬅ Gọi API lưu IMAGE_URL vào DB
        // cập nhật DB
        const upd = await updateSachImage(currentBook.value.MASACH, url);
        console.log("update DB response:", upd.data);

        // đặt preview thành absolute URL
        currentBook.value.IMAGE_URL = url;
        previewImage.value = `http://localhost:5000${url}`;

        alert("Upload & lưu ảnh thành công!");

        await load(); // load lại list sách
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload thất bại");
      }
    };

    const labels = {
      //dành cho form
      MASACH: "Mã sách",
      TENSACH: "Tên sách",
      TACGIA: "Tác giả",
      DONGIA: "Đơn giá",
      SOQUYEN: "Số quyển",
      NAMXUATBAN: "Năm xuất bản",
      MANXB: "Nhà xuất bản",
    };

    const message = ref("");
    const messageType = ref("success");

    const nxbList = ref([]);

    // ⚙️ Biến điều khiển modal xem chi tiết
    const showDetailModal = ref(false);
    const currentBook = ref({});

    // 🟢 Load toàn bộ sách
    const load = async () => {
      try {
        searchText.value = "";
        const res = await getAllSach();
        // 🧩 Sắp xếp ngay khi tải
        books.value = sortByCode(res.data, "MASACH");
        formInitial.value = {
          MASACH: "",
          TENSACH: "",
          TACGIA: "",
          DONGIA: 0,
          SOQUYEN: "",
          IMAGE_URL: "",
          NAMXUATBAN: "",
          MANXB: "",
        }; // 🧼 Xóa trắng form
      } catch (err) {
        message.value = "Lỗi khi tải sách!";
        messageType.value = "error";
      }
    };
    onMounted(async () => {
      try {
        await load();
        const r = await getAllNhaXuatBan();
        nxbList.value = r.data;
      } catch (err) {
        console.error("Lỗi khi tải NXB:", err);
      }
    });

    // 🟢 Tìm kiếm theo tên sách
    const searchBook = async () => {
      if (!searchText.value.trim()) {
        await load(); // Nếu rỗng thì load lại toàn bộ sách
        return;
      }
      try {
        const res = await getSachByName(searchText.value);
        books.value = res.data; //Vue nhận dữ liệu và cập nhật bảng
      } catch (err) {
        if (err.response?.status === 404) alert("Không tìm thấy sách phù hợp!");
        else alert("Lỗi khi tìm kiếm sách!");
      }
    };
    // 🟢 Mở form tạo
    const openCreate = () => {
      editing.value = false;
      formInitial.value = {
        MASACH: "",
        TENSACH: "",
        TACGIA: "",
        DONGIA: 0,
        SOQUYEN: "",
        NAMXUATBAN: "",
        MANXB: "",
      };
      showForm.value = true;
    };
    // 🟢 Mở form sửa
    const onEdit = (row) => {
      editing.value = true;
      const { MASACH, TENSACH, TACGIA, DONGIA, SOQUYEN, NAMXUATBAN, MANXB } =
        row;

      formInitial.value = {
        MASACH,
        TENSACH,
        TACGIA,
        DONGIA,
        SOQUYEN,
        NAMXUATBAN,
        MANXB: typeof MANXB === "object" ? MANXB.MANXB || MANXB._id : MANXB,
      };

      showForm.value = true;
    };
    // 🗑 Xóa sách
    const onDelete = async (row) => {
      if (!confirm("Xóa sách?")) return;
      try {
        await deleteSach(row._id);
        message.value = "Xóa thành công";
        messageType.value = "success";
        await load();
      } catch (err) {
        message.value = err.response?.data?.message || "Xóa thất bại";
        messageType.value = "error";
      }
    };
    // 💾 Lưu sách (tạo hoặc cập nhật)
    const save = async (data) => {
      try {
        if (editing.value) {
          // 📝 Cập nhật sách theo MASACH (không phải _id)
          await updateSach(data.MASACH, data);
          message.value = "Cập nhật sách thành công";
        } else {
          await createSach(data);
          message.value = "Thêm sách mới thành công";
        }

        messageType.value = "success";
        showForm.value = false; // ẩn form
        // Hiển thị modal chi tiết ngay sau khi lưu
        currentBook.value = { ...data }; // dùng data vừa lưu
        // Nếu muốn hiển thị tên NXB và địa chỉ
        const nxb = nxbList.value.find((x) => x.MANXB === data.MANXB);
        currentBook.value.TENNXB = nxb?.TENNXB || "";
        currentBook.value.DIACHI = nxb?.DIACHI || "";

        // 🔥 Lấy lại sách từ DB để có IMAGE_URL chính xác
        const refreshed = await getSachByName(data.TENSACH);
        const book = refreshed.data[0]; // lấy đúng sách vừa tạo/sửa

        currentBook.value = {
          ...book,
          TENNXB: nxb?.TENNXB || "",
          DIACHI: nxb?.DIACHI || "",
        };

        // 🔥 Ảnh thật trong DB
        previewImage.value = book.IMAGE_URL
          ? `http://localhost:5000${book.IMAGE_URL}`
          : defaultImage;

        showDetailModal.value = true;
      } catch (err) {
        // Nếu backend trả lỗi "Mã sách đã tồn tại"
        if (err.response?.data?.message) {
          alert(err.response.data.message);
        } else {
          alert("Có lỗi xảy ra khi lưu dữ liệu!");
        }
      }
    };

    const closeForm = () => (showForm.value = false);
    //sắp xếp
    function sortByCode(arr, field) {
      return arr.sort((a, b) => {
        const numA = parseInt(a[field].match(/\d+$/)?.[0] || 0);
        const numB = parseInt(b[field].match(/\d+$/)?.[0] || 0);
        return numA - numB;
      });
    }
    // 👁 Xem chi tiết sách
    const onView = async (row) => {
      const nxb = nxbList.value.find((x) => x.MANXB === row.MANXB);
      currentBook.value = {
        ...row,
        TENNXB: nxb?.TENNXB || "",
        DIACHI: nxb?.DIACHI || "",
        // nếu BE trả về ảnh, dùng luôn
        IMAGE_URL: row.IMAGE_URL || null,
      };
      // 🚀 Gọi API lấy số lượng đang mượn
      try {
        const res = await getBorrowCount(row.MASACH);
        currentBook.value.dangMuon = res.data.dangMuon;
      } catch (e) {
        currentBook.value.dangMuon = 0;
      }

      // Nếu có ảnh của cuốn này thì dùng, không thì ảnh mặc định
      previewImage.value = currentBook.value.IMAGE_URL
        ? `http://localhost:5000${currentBook.value.IMAGE_URL}`
        : defaultImage;

      console.log("onView previewImage:", previewImage.value);
      showDetailModal.value = true;
    };

    const closeDetail = async () => {
      showDetailModal.value = false;
      showImageTools.value = false;

      await load(); // load lại danh sách sách sau khi xem chi tiết
    };

    return {
      books,
      showImageTools,
      showForm,
      editing,
      formInitial,
      labels,
      message,
      messageType,
      searchText,
      searchBook,
      load,
      openCreate,
      onEdit,
      onDelete,
      save,
      closeForm,
      nxbList,
      showDetailModal,
      currentBook,
      onView,
      closeDetail,
      previewImage,
      defaultImage,
      selectedFile,
      uploadImageToBE,
      onImageSelect,
      updateSachImage,
    };
  },
};
</script>

<style scoped>
.book-image {
  width: 150px;
  height: 200px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
}

input[type="file"] {
  max-width: 180px;
  margin: 0 auto;
}

.bannersach {
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
.modal-dialog p {
  margin: 4px 0px; /* giảm khoảng cách giữa các dòng */
  font-size: 0.95rem; /* chữ hơi nhỏ hơn */
}
.modal-header {
  padding: 0.5rem 0.5rem;
}
.modal-footer {
  padding: 6px 12px !important; /* giảm chiều cao */
}

.book-image {
  width: 150px; /* chiều ngang */
  height: 200px; /* chiều cao (3x4) */
  object-fit: cover; /* đảm bảo không méo ảnh */
  border-radius: 6px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
