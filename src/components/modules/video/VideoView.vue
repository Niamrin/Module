<script setup>
import { safeMedia, embed } from "../../../model.js";
defineProps({
  blockId: String,
  student: Boolean,
  data: Object,
  interactive: Boolean,
});
</script>

<template>
  <figure>
    <div v-if="!safeMedia(data.src, 'video')" class="placeholder">
      Видео пока не добавлено
    </div>
    <div v-else-if="!interactive" class="placeholder">
      Видео — откройте предпросмотр
    </div>
    <iframe
      v-else-if="embed(data.src)"
      class="video"
      :src="embed(data.src)"
      title="Учебное видео"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe
    ><video
      v-else
      class="video"
      controls
      preload="metadata"
      :src="safeMedia(data.src, 'video')"
    ></video>
    <div v-if="data.caption" class="caption">{{ data.caption }}</div>
  </figure>
</template>
