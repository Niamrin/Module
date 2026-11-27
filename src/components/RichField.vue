<script>
import { ref, nextTick } from "vue";
export default {
  props: ["label", "modelValue"],
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const area = ref(null);
    async function format(marker) {
      const el = area.value,
        start = el.selectionStart,
        end = el.selectionEnd,
        val = props.modelValue || "",
        heading = marker.startsWith("#"),
        a = heading ? val.lastIndexOf("\n", start - 1) + 1 : start,
        selected = val.slice(a, end),
        replacement = heading ? marker + selected : marker + selected + marker;
      emit("update:modelValue", val.slice(0, a) + replacement + val.slice(end));
      await nextTick();
      el.focus();
      el.setSelectionRange(
        a + marker.length,
        a + marker.length + selected.length,
      );
    }
    return {
      area,
      format,
      tools: [
        ["H1", "# "],
        ["H2", "## "],
        ["H3", "### "],
        ["H4", "#### "],
        ["Ж", "**"],
        ["К", "*"],
        ["Ч", "__"],
        ["Выделить", "=="],
      ],
    };
  },
};
</script>

<template>
  <div class="field">
    <div class="field-label">{{ label }}</div>
    <div class="toolbar">
      <button
        v-for="t in tools"
        :key="t[0]"
        @mousedown.prevent
        @click="format(t[1])"
      >
        {{ t[0] }}
      </button>
    </div>
    <textarea
      ref="area"
      class="editor-content"
      rows="8"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <p class="help">Выделите текст и нажмите кнопку форматирования.</p>
  </div>
</template>
