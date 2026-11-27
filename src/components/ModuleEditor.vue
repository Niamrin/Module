<script setup>
import { modules } from "./modules/index.js";
defineProps({ block: Object });
defineEmits(["notify"]);
</script>

<template>
  <component
    :is="modules[block.type].editor"
    :data="block.data"
    @notify="$emit('notify', $event)"
  />
</template>
