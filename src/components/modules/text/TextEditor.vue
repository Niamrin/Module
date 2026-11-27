<script setup>
import RichField from "../../RichField.vue";
defineProps({ data: Object });
defineEmits(["notify"]);
</script>

<template>
  <RichField label="Содержимое" v-model="data.body" />
</template>
