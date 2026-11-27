<script setup>
import BlockCanvas from "../../BlockCanvas.vue";
import { uid } from "../../../model.js";
import SubCard from "../../SubCard.vue";
import Field from "../../Field.vue";
import RichField from "../../RichField.vue";
defineProps({ data: Object });
defineEmits(["notify"]);
</script>

<template>
  <SubCard
    v-for="(t, i) in data.tabs"
    :key="t.id"
    :title="'Вкладка ' + (i + 1)"
    @remove="data.tabs.splice(i, 1)"
    ><Field label="Название" v-model="t.title" /><RichField
      label="Содержимое"
      v-model="t.body" /><BlockCanvas nested :blocks="t.blocks" /></SubCard
  ><button
    class="wide"
    @click="
      data.tabs.push({
        id: uid(),
        title: 'Новая вкладка',
        body: '',
        blocks: [],
      })
    "
  >
    ＋ Добавить вкладку
  </button>
</template>
