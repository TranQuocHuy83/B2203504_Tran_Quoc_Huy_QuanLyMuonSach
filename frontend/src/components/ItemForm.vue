<template>
  <form @submit.prevent="submit">
    <div v-for="(val, field) in model" :key="field" class="mb-2">
      <label :for="field" class="form-label">
        {{ labels[field] || field }}
      </label>

      <!-- 🟢 Nếu là form Sách và là trường MANXB thì hiển thị dropdown -->
      <select
        v-if="isSachForm && field === 'MANXB'"
        v-model="model.MANXB"
        class="form-select"
        required
      >
        <option value="">-- Chọn nhà xuất bản --</option>
        <option v-for="nxb in nxbs" :key="nxb.MANXB" :value="nxb.MANXB">
          {{ nxb.TENNXB }}
        </option>
      </select>

      <!-- 💰 Nếu là trường DONGIA thì hiển thị đơn vị VNĐ -->
      <div v-else-if="field === 'DONGIA'" class="input-group">
        <input
          v-model.number="model.DONGIA"
          type="number"
          min="5000"
          step="5000"
          class="form-control"
          placeholder="Nhập đơn giá (tối thiểu 5.000 VNĐ)"
          required
        />
        <span class="input-group-text">VNĐ</span>
      </div>
      <!-- 🟢 Nếu là ngày sinh -->
      <input
        v-else-if="field === 'NGAYSINH'"
        v-model="model.NGAYSINH"
        type="date"
        class="form-control"
        required
      />
      <!-- 🟡 Các trường khác hiển thị input bình thường -->
      <input
        v-else
        v-model="model[field]"
        :id="field"
        class="form-control"
        :placeholder="'Nhập ' + (labels[field] || field).toLowerCase()"
      />
    </div>

    <button type="submit" class="btn btn-success btn-sm">
      <i class="fa-solid fa-check"></i> Lưu
    </button>
    <button
      type="button"
      class="btn btn-secondary btn-sm ms-2"
      @click="$emit('cancel')"
    >
      <i class="fa-solid fa-xmark me-1"></i> Hủy
    </button>
  </form>
</template>

<script>
export default {
  name: "ItemForm",
  props: {
    initial: { type: Object, default: () => ({}) },
    labels: { type: Object, default: () => ({}) },
    nxbs: Array,
    isSachForm: { type: Boolean, default: false },
  },
  data() {
    return { model: { ...this.initial } };
  },
  methods: {
    submit() {
      this.$emit("save", this.model);
    },
  },
  watch: {
    initial(newVal) {
      this.model = { ...newVal };

      // ✅ Nếu có trường ngày sinh thì cắt bỏ phần T...Z
      if (this.model.NGAYSINH) {
        this.model.NGAYSINH = this.model.NGAYSINH.split("T")[0];
      }
    },
  },
};
</script>

<style scoped>
.form-label {
  font-weight: 500;
  color: #333;
}
.form-control::placeholder {
  color: #aaa;
}
.input-group-text {
  background: #f8f9fa;
  border-left: none;
  font-weight: 500;
}
</style>
