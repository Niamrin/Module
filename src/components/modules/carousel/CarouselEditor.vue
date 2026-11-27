<script setup>
import SubCard from "../../SubCard.vue";
import Field from "../../Field.vue";
import MediaField from "../../MediaField.vue";
defineProps({ data: Object });
defineEmits(["notify"]);
</script>

<template>
  <SubCard
    v-for="(s, i) in data.slides"
    :key="i"
    :title="'Слайд ' + (i + 1)"
    @remove="data.slides.splice(i, 1)"
    ><MediaField v-model="s.src" @notify="$emit('notify', $event)" /><Field
      label="Подпись"
      v-model="s.caption" /><Field
      label="Альтернативный текст"
      v-model="s.alt" /></SubCard
  ><button
    class="wide"
    @click="data.slides.push({ src: '', caption: '', alt: '' })"
  >
    ＋ Добавить слайд
  </button>
</template>
