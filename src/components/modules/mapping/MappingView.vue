<script setup>
import { computed, ref, watch } from "vue";
import { rich, safeMedia } from "../../../model.js";
const props = defineProps({
  blockId: String,
  student: Boolean,
  interactive: Boolean,
  data: Object,
});
const point = ref(null);
const activePoint = computed(() =>
  props.data.points.find((p) => p.id === point.value),
);
watch(
  () => props.data,
  () => {
    point.value = null;
  },
  { deep: true },
);
</script>

<template>
  <figure>
    <div class="media-wrap">
      <div v-if="safeMedia(data.src)" class="mapbox">
        <img :src="safeMedia(data.src)" :alt="data.alt" /><button
          v-for="(p, i) in data.points"
          :key="p.id"
          class="hotspot"
          :class="{ active: point === p.id }"
          :style="{ left: p.x + '%', top: p.y + '%' }"
          :aria-label="p.title || 'Точка ' + (i + 1)"
          @click="point = point === p.id ? null : p.id"
        >
          {{ i + 1 }}
        </button>
      </div>
      <div v-else class="placeholder">Добавьте изображение</div>
    </div>
    <div v-if="data.caption" class="caption">{{ data.caption }}</div>
    <div v-if="activePoint" class="map-detail">
      <strong>{{ activePoint.title }}</strong>
      <div v-html="rich(activePoint.body)"></div>
    </div>
  </figure>
</template>
