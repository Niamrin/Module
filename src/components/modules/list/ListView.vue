<script setup>
import { inline } from "../../../model.js";
defineProps({
  blockId: String,
  student: Boolean,
  interactive: Boolean,
  data: Object,
});
</script>

<template>
  <div class="rich">
    <component :is="data.ordered ? 'ol' : 'ul'"
      ><li v-for="(item, i) in data.items" :key="i" v-html="inline(item)"></li
    ></component>
  </div>
</template>
