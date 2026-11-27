<script setup>
import SubCard from "../../SubCard.vue";
import Field from "../../Field.vue";
import MediaField from "../../MediaField.vue";
import RichField from "../../RichField.vue";
import { uid, safeMedia } from "../../../model.js";
const props = defineProps({ data: Object });
defineEmits(["notify"]);
function addPoint(e) {
  let x = 50,
    y = 50;
  if (e) {
    const r = e.currentTarget.getBoundingClientRect();
    x = Math.round(((e.clientX - r.left) / r.width) * 100);
    y = Math.round(((e.clientY - r.top) / r.height) * 100);
  }
  props.data.points.push({ id: uid(), x, y, title: "Новая точка", body: "" });
}
</script>

<template>
  <MediaField v-model="data.src" @notify="$emit('notify', $event)" /><Field
    label="Альтернативный текст"
    v-model="data.alt"
  /><Field label="Подпись" v-model="data.caption" />
  <div v-if="safeMedia(data.src)" class="field">
    <div class="field-label">Кликните по картинке для добавления точки</div>
    <div class="mapbox clickmap" @click="addPoint($event)">
      <img :src="safeMedia(data.src)" alt="Карта точек" /><span
        v-for="(p, i) in data.points"
        :key="p.id"
        class="hotspot"
        :style="{ left: p.x + '%', top: p.y + '%' }"
        >{{ i + 1 }}</span
      >
    </div>
  </div>
  <SubCard
    v-for="(p, i) in data.points"
    :key="p.id"
    :title="'Точка ' + (i + 1)"
    @remove="data.points.splice(i, 1)"
    ><Field label="Название" v-model="p.title" /><RichField
      label="Пояснение"
      v-model="p.body" />
    <div class="row">
      <Field label="X, %" kind="number" v-model="p.x" /><Field
        label="Y, %"
        kind="number"
        v-model="p.y"
      /></div></SubCard
  ><button class="wide" @click="addPoint()">＋ Добавить точку</button>
</template>
