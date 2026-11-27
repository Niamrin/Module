<script setup>
import { modules } from "./modules/index.js";
defineProps({ block: Object, interactive: Boolean, student: Boolean });
</script>

<template>
  <component
    :is="modules[block.type].view"
    :data="block.data"
    :block-id="block.id"
    :interactive="interactive"
    :student="student"
  />
</template>
