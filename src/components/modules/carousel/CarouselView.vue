<script setup>
import MediaImage from "../../MediaImage.vue";
import { computed, ref, watch } from "vue";
const props = defineProps({
  blockId: String,
  student: Boolean,
  interactive: Boolean,
  data: Object,
});
const index = ref(0);
const slide = computed(() => props.data.slides[index.value]);
watch(
  () => props.data,
  () => {
    index.value = 0;
  },
  { deep: true },
);
</script>

<template>
  <figure>
    <template v-if="slide"
      ><div class="media-wrap">
        <MediaImage :src="slide.src" :alt="slide.alt" />
      </div>
      <div v-if="slide.caption" class="caption">{{ slide.caption }}</div>
      <div class="carousel-controls">
        <button
          class="icon"
          aria-label="Предыдущий слайд"
          :disabled="index === 0"
          @click="index--"
        >
          ‹
        </button>
        <div class="dots">
          <button
            v-for="(_, i) in data.slides"
            :key="i"
            class="dot"
            :class="{ active: index === i }"
            :aria-label="'Слайд ' + (i + 1)"
            @click="index = i"
          ></button>
        </div>
        <span class="muted">{{ index + 1 }} / {{ data.slides.length }}</span
        ><button
          class="icon"
          aria-label="Следующий слайд"
          :disabled="index >= data.slides.length - 1"
          @click="index++"
        >
          ›
        </button>
      </div></template
    >
    <div v-else class="placeholder">Добавьте слайды</div>
  </figure>
</template>
