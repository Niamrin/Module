<script setup>
import { rich } from "../../../model.js";
defineProps({
  blockId: String,
  student: Boolean,
  interactive: Boolean,
  data: Object,
});
</script>

<template>
  <details class="spoiler" :open="data.open">
    <summary>{{ data.title || "Примечание" }}</summary>
    <div v-html="rich(data.body)"></div>
  </details>
</template>
