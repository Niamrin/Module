<script>
import { safeMedia } from "../model.js";
export default { props: ["src", "alt"], setup: () => ({ safeMedia }) };
</script>

<template>
  <img
    v-if="safeMedia(src)"
    class="media"
    :src="safeMedia(src)"
    :alt="alt || ''"
    loading="lazy"
  />
  <div v-else class="placeholder">Добавьте изображение в настройках модуля</div>
</template>
