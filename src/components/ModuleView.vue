<script setup>
import { views } from "./modules/views.js";
defineProps({ block: Object, interactive: Boolean, student: Boolean });
</script>

<template>
  <component
    :is="views[block.type]"
    :data="block.data"
    :block-id="block.id"
    :interactive="interactive"
    :student="student"
  />
</template>
