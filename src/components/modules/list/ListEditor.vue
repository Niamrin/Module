<script setup>
import SubCard from "../../SubCard.vue";
import Field from "../../Field.vue";
defineProps({ data: Object });
defineEmits(["notify"]);
</script>

<template>
  <label class="checkline"
    ><input type="checkbox" v-model="data.ordered" />Нумерованный список</label
  ><SubCard
    v-for="(_, i) in data.items"
    :key="i"
    :title="'Пункт ' + (i + 1)"
    @remove="data.items.splice(i, 1)"
    ><Field label="Текст" kind="textarea" v-model="data.items[i]" /></SubCard
  ><button class="wide" @click="data.items.push('Новый пункт')">
    ＋ Добавить пункт
  </button>
</template>
