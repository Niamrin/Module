<script>
export default {
  props: { modelValue: String, kind: { type: String, default: "image" } },
  emits: ["update:modelValue", "notify"],
  setup(props, { emit }) {
    function upload(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith(props.kind + "/")) {
        emit("notify", "Выберите файл подходящего типа.");
        return;
      }
      if (file.size > 30 * 1024 * 1024) {
        emit("notify", "Файл больше 30 МБ. Используйте ссылку.");
        return;
      }
      const r = new FileReader();
      r.onload = () => emit("update:modelValue", String(r.result));
      r.onerror = () => emit("notify", "Не удалось прочитать файл.");
      r.readAsDataURL(file);
    }
    return { upload };
  },
};
</script>

<template>
  <div class="field">
    <label class="field-label">{{
      kind === "image" ? "Ссылка на изображение" : "Ссылка на видео"
    }}</label
    ><input
      type="text"
      :value="modelValue?.startsWith('data:') ? '' : modelValue"
      placeholder="https://…"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="modelValue?.startsWith('data:')" class="help">
      Файл встроен в курс.
    </p>
    <input
      type="file"
      :accept="kind === 'image' ? 'image/*' : 'video/*'"
      @change="upload"
    /><button
      v-if="modelValue"
      class="small"
      @click="$emit('update:modelValue', '')"
    >
      Очистить источник
    </button>
  </div>
</template>
