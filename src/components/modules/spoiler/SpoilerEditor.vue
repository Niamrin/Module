<script setup>
import Field from "../../Field.vue";
import RichField from "../../RichField.vue";
defineProps({ data: Object });
defineEmits(["notify"]);
</script>

<template>
  <Field label="Заголовок" v-model="data.title" /><RichField
    label="Скрытый текст"
    v-model="data.body"
  />
</template>
