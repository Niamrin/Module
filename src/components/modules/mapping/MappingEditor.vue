<script setup>
import { computed, ref } from "vue";
import SubCard from "../../SubCard.vue";
import Field from "../../Field.vue";
import MediaField from "../../MediaField.vue";
import RichField from "../../RichField.vue";
import { uid, safeMedia } from "../../../model.js";
import { areaStyle, clamp, geometry, minAreaSize } from "./geometry.js";

const props = defineProps({ data: Object });
defineEmits(["notify"]);
const map = ref(null);
const selectedId = ref(props.data.points[0]?.id);
const selected = computed(() =>
  props.data.points.find((p) => p.id === selectedId.value),
);
const drag = ref(null);
const resizeArea = computed(() => drag.value?.draft ?? selected.value);

function add(shape, x = 50, y = 50) {
  const rect = shape === "rect";
  const item = {
    id: uid(),
    ...geometry({ shape, x: rect ? x - 10 : x, y: rect ? y - 7.5 : y }),
    title: rect ? "Новая область" : "Новая точка",
    body: "",
  };
  props.data.points.push(item);
  selectedId.value = item.id;
}

function addAt(event) {
  const box = map.value.getBoundingClientRect();
  add(
    "point",
    Math.round((100 * (event.clientX - box.left)) / box.width),
    Math.round((100 * (event.clientY - box.top)) / box.height),
  );
}

function remove() {
  const items = props.data.points;
  const index = items.findIndex((p) => p.id === selectedId.value);
  if (index < 0) return;
  items.splice(index, 1);
  selectedId.value = items[Math.min(index, items.length - 1)]?.id;
}

function start(event, item, resize = false) {
  if (!event.isPrimary || event.button !== 0 || drag.value) return;
  selectedId.value = item.id;
  event.currentTarget.setPointerCapture(event.pointerId);
  drag.value = {
    id: item.id,
    pointer: event.pointerId,
    resize,
    origin: geometry(item),
    clientX: event.clientX,
    clientY: event.clientY,
    draft: geometry(item),
  };
}
function move(event) {
  const state = drag.value;
  if (!state || state.pointer !== event.pointerId) return;
  const box = map.value.getBoundingClientRect();
  const dx = Math.round((100 * (event.clientX - state.clientX)) / box.width);
  const dy = Math.round((100 * (event.clientY - state.clientY)) / box.height);
  const origin = state.origin;
  state.draft = state.resize
    ? {
        ...origin,
        width: clamp(origin.width + dx, minAreaSize, 100 - origin.x),
        height: clamp(origin.height + dy, minAreaSize, 100 - origin.y),
      }
    : geometry({ ...origin, x: origin.x + dx, y: origin.y + dy });
}
function finish(event) {
  if (drag.value?.pointer !== event.pointerId) return;
  move(event);
  Object.assign(selected.value, drag.value.draft);
  drag.value = null;
}
function adjust(prop, value) {
  const item = selected.value;
  if (prop === "width") value = clamp(value, minAreaSize, 100 - item.x);
  if (prop === "height") value = clamp(value, minAreaSize, 100 - item.y);
  Object.assign(item, geometry({ ...item, [prop]: value }));
}
</script>

<template>
  <MediaField v-model="data.src" @notify="$emit('notify', $event)" />
  <Field label="Альтернативный текст" v-model="data.alt" />
  <Field label="Подпись" v-model="data.caption" />
  <div v-if="safeMedia(data.src)" class="field">
    <p class="help">
      Щёлкните по изображению, чтобы поставить точку. Перетаскивайте метки для
      перемещения, а угол области — для изменения размера.
    </p>
    <div
      ref="map"
      class="mapbox map-editor"
      @pointermove="move"
      @pointerup="finish"
      @lostpointercapture="drag = null"
      @pointercancel="drag = null"
    >
      <img
        :src="safeMedia(data.src)"
        :alt="data.alt || 'Карта областей'"
        draggable="false"
        @click="addAt"
      />
      <button
        v-for="(p, i) in data.points"
        :key="p.id"
        type="button"
        class="hotspot"
        :class="{
          active: selectedId === p.id,
          'map-region': p.shape === 'rect',
        }"
        :style="areaStyle(drag?.id === p.id ? drag.draft : p)"
        :aria-label="p.title || 'Метка ' + (i + 1)"
        :aria-pressed="selectedId === p.id"
        @click="selectedId = p.id"
        @pointerdown="start($event, p)"
      >
        {{ i + 1 }}
      </button>
      <button
        v-if="selected?.shape === 'rect'"
        type="button"
        class="map-resize"
        title="Изменить размер области"
        :style="{
          left: resizeArea.x + resizeArea.width + '%',
          top: resizeArea.y + resizeArea.height + '%',
        }"
        @pointerdown="start($event, selected, true)"
        @click="
          $event.detail === 0 &&
          $refs.widthInput?.$el.querySelector('input')?.focus()
        "
      >
        ↘
      </button>
    </div>
  </div>
  <div class="map-actions">
    <button @click="add('point')">＋ Точка</button>
    <button @click="add('rect')">＋ Прямоугольная область</button>
  </div>
  <label v-if="data.points.length" class="field"
    ><span class="field-label">Выбранная метка</span>
    <select v-model="selectedId">
      <option v-for="(p, i) in data.points" :key="p.id" :value="p.id">
        {{ i + 1 }} · {{ p.title || "Без названия" }}
      </option>
    </select>
  </label>
  <SubCard
    v-if="selected"
    :key="selected.id"
    :title="selected.shape === 'rect' ? 'Прямоугольная область' : 'Точка'"
    @remove="remove"
  >
    <Field label="Название" v-model="selected.title" />
    <RichField label="Пояснение" v-model="selected.body" />
    <div class="row">
      <Field
        label="X, %"
        kind="number"
        :model-value="selected.x"
        :max="100 - (selected.width || 0)"
        @update:model-value="adjust('x', $event)"
      />
      <Field
        label="Y, %"
        kind="number"
        :model-value="selected.y"
        :max="100 - (selected.height || 0)"
        @update:model-value="adjust('y', $event)"
      />
    </div>
    <div v-if="selected.shape === 'rect'" class="row">
      <Field
        ref="widthInput"
        label="Ширина, %"
        kind="number"
        :min="minAreaSize"
        :max="100 - selected.x"
        :model-value="selected.width"
        @update:model-value="adjust('width', $event)"
      />
      <Field
        label="Высота, %"
        kind="number"
        :min="minAreaSize"
        :max="100 - selected.y"
        :model-value="selected.height"
        @update:model-value="adjust('height', $event)"
      />
    </div>
  </SubCard>
</template>
