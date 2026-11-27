<script setup>
import { editors } from "./modules/index.js";
defineProps({ block: Object });
defineEmits(["notify"]);
</script>

<template>
  <component
    :is="editors[block.type]"
    :data="block.data"
    @notify="$emit('notify', $event)"
  />
</template>
