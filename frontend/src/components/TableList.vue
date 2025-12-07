<template>
  <div class="table-container">
    <table class="table table-striped">
      <thead>
        <tr>
          <th style="width: 60px; text-align: center">STT</th>
          <th v-for="h in headers" :key="h">{{ h }}</th>
          <th
            v-if="showActions"
            :style="{
              textAlign: 'center',
            }"
          >
            Hành động
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="row._id">
          <!-- STT -->
          <td style="text-align: center">{{ index + 1 }}</td>

          <!-- Dữ liệu nếu không phải trạng thái -->
          <td v-for="key in keys" :key="key">
            <span v-if="key !== 'TRANGTHAI'">
              {{ row[key] }}
            </span>

            <!-- Nếu là TRANGTHAI thì chỉ hiển thị chữ -->
            <span v-else :class="statusClass ? statusClass(row[key]) : ''">
              {{
                row[key] === "pending"
                  ? "Chờ lấy sách"
                  : row[key] === "borrowed" || row[key] === "dangmuon"
                  ? "Đã lấy sách"
                  : row[key] === "cancelled"
                  ? "Đã hủy lấy"
                  : row[key] === "returned" || row[key] === "datra"
                  ? "Đã trả sách"
                  : "-"
              }}
            </span>
          </td>

          <!-- Hành động -->
          <td
            v-if="showActions"
            :style="{
              textAlign: 'center',
            }"
          >
            <div class="d-flex gap-1 justify-content-end">
              <!-- Bảng muon/tra -->
              <template v-if="type === 'muon/tra'">
                <button
                  v-if="row.TRANGTHAI === 'pending'"
                  class="btn btn-sm btn-primary"
                  @click="$emit('xacnhan', row)"
                >
                  Xác nhận lấy sách
                </button>

                <button
                  v-if="
                    row.TRANGTHAI === 'borrowed' || row.TRANGTHAI === 'dangmuon'
                  "
                  class="btn btn-sm btn-primary"
                  @click="$emit('edit', row)"
                >
                  Xác nhận trả sách
                </button>

                <button
                  class="btn btn-sm btn-danger"
                  @click="$emit('delete', row)"
                >
                  Xóa
                </button>

                <button
                  class="btn btn-sm me-1 btn-light"
                  @click="$emit('view', row)"
                >
                  <i class="fa-solid fa-eye"></i>
                </button>
              </template>

              <!-- Giữ nguyên logic các bảng khác -->
              <template v-if="type !== 'muon/tra'">
                <button
                  v-if="type !== 'docgia'"
                  class="btn btn-sm btn-primary me-1"
                  @click="$emit('edit', row)"
                >
                  Cập nhật
                </button>
                <button
                  v-if="type !== 'docgia'"
                  class="btn btn-sm btn-danger me-1"
                  @click="$emit('delete', row)"
                >
                  Xóa
                </button>

                <div class="d-flex justify-content-center w-100">
                  <button
                    v-if="type === 'sach' || type === 'docgia'"
                    class="btn btn-sm me-1 btn-light"
                    @click="$emit('view', row)"
                  >
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </div>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "TableList",
  props: {
    headers: { type: Array, default: () => [] },
    keys: { type: Array, default: () => [] },
    rows: { type: Array, default: () => [] },
    showActions: { type: Boolean, default: true },
    statusClass: { type: Function, default: null }, // ← thêm đây
    type: { type: String, default: "" },
  },
};
</script>

<style scoped>
.table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
}
.table thead th {
  position: sticky;
  top: 0;
  background: #f8f9fa;
  z-index: 1;
}
.table th,
.table td {
  white-space: nowrap;
}

/* Các trạng thái cũ giữ nguyên */
.status-btn {
  border: none;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: not-allowed;
}
.status-dangmuon {
  background-color: #f1c40f;
  color: #000;
}
.status-datra {
  background-color: #2ecc71;
  color: #000;
}
</style>
