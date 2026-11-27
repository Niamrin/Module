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
  <div v-html="rich(data.body)"></div>
</template>
