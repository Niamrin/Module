<script setup>
import SubCard from "../../SubCard.vue";
import Field from "../../Field.vue";
import RichField from "../../RichField.vue";
defineProps({ data: Object });
defineEmits(["notify"]);
</script>

<template>
  <SubCard
    v-for="(t, i) in data.tabs"
    :key="i"
    :title="'Вкладка ' + (i + 1)"
    @remove="data.tabs.splice(i, 1)"
    ><Field label="Название" v-model="t.title" /><RichField
      label="Содержимое"
      v-model="t.body" /></SubCard
  ><button
    class="wide"
    @click="data.tabs.push({ title: 'Новая вкладка', body: '' })"
  >
    ＋ Добавить вкладку
  </button>
</template>
