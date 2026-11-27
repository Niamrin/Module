<script setup>
import { ref } from "vue";
const props = defineProps({ slides: Array, active: Object, dragging: Boolean });
const emit = defineEmits(["select", "action", "transfer"]);
const target = ref(null);
function hover(event, id) {
  if (!props.dragging) return;
  event.preventDefault();
  target.value = id;
}
function accept(event, id) {
  target.value = null;
  if (!props.dragging) return;
  event.preventDefault();
  emit("transfer", id);
}
</script>
<template>
  <section class="slide-tools" aria-label="Управление слайдами">
    <div class="slide-tools-head">
      <strong>Слайды</strong
      ><button @click="$emit('action', 'add')">＋ Слайд</button>
    </div>
    <div class="slide-picker" aria-label="Выбрать слайд">
      <button
        v-for="(slide, i) in slides"
        :key="slide.id"
        :aria-pressed="active.id === slide.id"
        :class="{ 'drop-active': dragging && target === slide.id }"
        @click="$emit('select', slide.id)"
        @dragover.stop="hover($event, slide.id)"
        @dragleave="target = null"
        @drop.stop="accept($event, slide.id)"
      >
        {{ i + 1 }} · {{ slide.title || "Без названия" }}
      </button>
    </div>
    <label class="field"
      ><span class="field-label">Название слайда</span>
      <input
        type="text"
        v-model="active.title"
        @blur="active.title = active.title.trim() || 'Без названия'"
      />
    </label>
    <div class="slide-commands">
      <button
        :disabled="active === slides[0]"
        @click="$emit('action', 'earlier')"
      >
        ← Раньше
      </button>
      <button
        :disabled="active === slides.at(-1)"
        @click="$emit('action', 'later')"
      >
        Позже →
      </button>
      <button @click="$emit('action', 'copy')">Дублировать слайд</button>
      <button class="danger" @click="$emit('action', 'delete')">
        Удалить слайд
      </button>
    </div>
  </section>
</template>
