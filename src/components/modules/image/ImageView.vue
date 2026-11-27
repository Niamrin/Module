<script setup>
import MediaImage from "../../MediaImage.vue";
defineProps({
  blockId: String,
  student: Boolean,
  interactive: Boolean,
  data: Object,
});
</script>

<template>
  <figure>
    <div
      class="media-wrap"
      :style="{ width: data.width + '%', margin: 'auto' }"
    >
      <MediaImage :src="data.src" :alt="data.alt" />
    </div>
    <div v-if="data.caption" class="caption">{{ data.caption }}</div>
  </figure>
</template>
