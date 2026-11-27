<script setup>
import Field from "./Field.vue";
import { types } from "../model.js";
defineProps({ block: Object });
defineEmits(["settings"]);
</script>
<template>
  <div class="settings-bar">
    <span class="eyebrow">Настройки модуля</span
    ><button class="small ghost" @click="$emit('settings')">⚙ Курс</button>
  </div>
  <h2 style="margin-top: 8px">{{ types[block.type][0] }}</h2>
  <label class="checkline"
    ><input type="checkbox" v-model="block.hidden" />Скрыть в учебной
    странице</label
  >
  <template v-if="block.type === 'image'"
    ><Field
      label="Ширина изображения, %"
      kind="number"
      :min="25"
      :max="100"
      v-model="block.data.width"
  /></template>
  <template v-if="block.type === 'quiz'"
    ><Field
      label="Число попыток (0 — без ограничений)"
      kind="number"
      :max="9999"
      v-model="block.data.attempts" />
    <Field
      label="Время в минутах (0 — без таймера)"
      kind="number"
      :max="9999"
      v-model="block.data.minutes" />
    <Field
      label="Проходной балл, %"
      kind="number"
      :max="100"
      v-model="block.data.threshold"
  /></template>
  <template v-if="block.type === 'list'"
    ><label class="checkline"
      ><input type="checkbox" v-model="block.data.ordered" />Нумерованный
      список</label
    ></template
  >
  <template v-if="block.type === 'spoiler'"
    ><label class="checkline"
      ><input type="checkbox" v-model="block.data.open" />Раскрыт по
      умолчанию</label
    ></template
  >
</template>
