<script setup>
import Field from "../../Field.vue";
import MediaField from "../../MediaField.vue";
defineProps({ data: Object });
defineEmits(["notify"]);
</script>

<template>
  <MediaField
    kind="video"
    v-model="data.src"
    @notify="$emit('notify', $event)"
  /><Field label="Подпись" v-model="data.caption" />
</template>
