<script setup>
import Field from "../../Field.vue";
import MediaField from "../../MediaField.vue";
defineProps({ data: Object });
defineEmits(["notify"]);
</script>

<template>
  <MediaField v-model="data.src" @notify="$emit('notify', $event)" /><Field
    label="Альтернативный текст"
    v-model="data.alt"
  /><Field label="Подпись" v-model="data.caption" /><Field
    label="Ширина изображения, %"
    kind="number"
    :min="25"
    :max="100"
    v-model="data.width"
  />
</template>
