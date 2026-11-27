<script setup>
import { inject } from "vue";
import { types } from "../model.js";
import ModuleView from "./ModuleView.vue";
import ModuleEditor from "./ModuleEditor.vue";
defineProps({ blocks: Array, nested: Boolean });
const {
  selected,
  editPath,
  drag,
  over,
  add,
  select,
  finishEdit,
  action,
  notify,
  dragStart,
  dragEnd,
  dragOver,
  drop,
} = inject("courseCanvas");
</script>
<template>
  <div
    class="block-canvas"
    @dragover.stop="dragOver($event, blocks, $event.currentTarget)"
    @drop.stop="drop($event, blocks, $event.currentTarget)"
  >
    <article
      v-for="(b, i) in blocks"
      :key="b.id"
      :id="'block-' + b.id"
      class="block"
      :class="{
        selected: selected === b.id,
        'hidden-block': b.hidden,
        'insert-before': over?.list === blocks && over.at === i,
        'insert-after':
          over?.list === blocks &&
          over.at === blocks.length &&
          i === over.at - 1,
      }"
    >
      <div class="block-bar" @click="select(b.id, true)">
        <span
          class="handle"
          draggable="true"
          @dragstart="dragStart($event, 'move', b.id)"
          @dragend="dragEnd"
          >⠿</span
        ><span class="name"
          >{{ String(i + 1).padStart(2, "0") }} · {{ types[b.type][0]
          }}{{ b.hidden ? " · скрыт" : "" }}</span
        >
        <div class="actions">
          <button
            class="small ghost edit-toggle"
            :aria-expanded="editPath.includes(b.id)"
            @click.stop="
              editPath.includes(b.id) ? finishEdit(b.id) : select(b.id)
            "
          >
            {{ editPath.includes(b.id) ? "Готово" : "Изменить" }}</button
          ><button
            class="icon ghost"
            title="Выше"
            :disabled="i === 0"
            @click.stop="action(b.id, 'up')"
          >
            ↑</button
          ><button
            class="icon ghost"
            title="Ниже"
            :disabled="i === blocks.length - 1"
            @click.stop="action(b.id, 'down')"
          >
            ↓</button
          ><button
            class="icon ghost"
            title="Скрыть / показать"
            @click.stop="action(b.id, 'hide')"
          >
            {{ b.hidden ? "◉" : "◌" }}</button
          ><button
            class="icon ghost"
            title="Дублировать"
            @click.stop="action(b.id, 'copy')"
          >
            ⧉</button
          ><button
            class="small ghost danger"
            title="Удалить"
            @click.stop="action(b.id, 'delete')"
          >
            Удалить
          </button>
        </div>
      </div>
      <div class="block-content">
        <ModuleEditor
          v-if="editPath.includes(b.id)"
          :block="b"
          @notify="notify"
        />
        <ModuleView v-else :block="b" :interactive="false" />
      </div>
    </article>
    <div
      v-if="!blocks.length"
      class="empty"
      :class="{ 'drop-active': drag && over?.list === blocks && over.at === 0 }"
    >
      Перетащите модуль из палитры сюда.
    </div>
    <label v-if="nested" class="nested-add"
      >Добавить модуль
      <select
        aria-label="Добавить вложенный модуль"
        value=""
        @change="
          add($event.target.value, blocks);
          $event.target.value = '';
        "
      >
        <option value="" disabled>Выберите тип</option>
        <option v-for="(type, key) in types" :key="key" :value="key">
          {{ type[0] }}
        </option>
      </select>
    </label>
  </div>
</template>
