<script setup>
import { inject, ref, watch } from "vue";
import { types } from "../model.js";
import ModuleView from "./ModuleView.vue";
import ModuleEditor from "./ModuleEditor.vue";
defineProps({ blocks: Array, nested: Boolean });
const {
  activeSlide,
  course,
  transferSlide,
  selected,
  pick,
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
const menuFor = ref(null);
watch(selected, () => {
  menuFor.value = null;
});
function runAction(id, command) {
  menuFor.value = null;
  action(id, command);
}
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
      @click.stop="pick(b.id)"
      :class="{
        selected: selected === b.id,
        editing: editPath.includes(b.id) && selected === b.id,
        'hidden-block': b.hidden,
        'insert-before': over?.list === blocks && over.at === i,
        'insert-after':
          over?.list === blocks &&
          over.at === blocks.length &&
          i === over.at - 1,
      }"
    >
      <div class="block-bar">
        <span
          v-if="selected === b.id"
          class="handle"
          draggable="true"
          title="Перетащить модуль"
          @dragstart="dragStart($event, 'move', b.id)"
          @dragend="dragEnd"
          >⠿</span
        >
        <button
          class="card-name"
          type="button"
          :aria-pressed="selected === b.id"
          @click.stop="pick(b.id)"
        >
          <span class="card-index">{{ String(i + 1).padStart(2, "0") }}</span>
          {{ types[b.type][0] }}{{ b.hidden ? " · скрыт" : "" }}
        </button>
        <div v-if="selected === b.id" class="actions card-actions">
          <button
            class="small edit-toggle"
            :aria-expanded="editPath.includes(b.id)"
            @click.stop="
              editPath.includes(b.id) ? finishEdit(b.id) : select(b.id)
            "
          >
            {{ editPath.includes(b.id) ? "Готово" : "Изменить" }}
          </button>
          <button
            class="small ghost danger"
            title="Удалить"
            @click.stop="action(b.id, 'delete')"
          >
            Удалить
          </button>
          <div
            class="card-more"
            @focusout="
              !$event.currentTarget.contains($event.relatedTarget) &&
              (menuFor = null)
            "
            @keydown.esc.stop="
              menuFor = null;
              $event.currentTarget.querySelector('button').focus();
            "
          >
            <button
              class="small ghost"
              :aria-expanded="menuFor === b.id"
              @click.stop="menuFor = menuFor === b.id ? null : b.id"
            >
              Ещё ▾
            </button>
            <div
              v-if="menuFor === b.id"
              class="card-menu"
              aria-label="Действия с модулем"
            >
              <button :disabled="i === 0" @click.stop="runAction(b.id, 'up')">
                Переместить выше
              </button>
              <button
                :disabled="i === blocks.length - 1"
                @click.stop="runAction(b.id, 'down')"
              >
                Переместить ниже
              </button>
              <button @click.stop="runAction(b.id, 'copy')">Дублировать</button>
              <button @click.stop="runAction(b.id, 'hide')">
                {{ b.hidden ? "Показать в уроке" : "Скрыть в уроке" }}
              </button>
              <label v-if="activeSlide && course.slides.length > 1"
                >На другой слайд
                <select
                  aria-label="Перенести модуль на слайд"
                  value=""
                  @click.stop
                  @change.stop="
                    menuFor = null;
                    transferSlide($event.target.value, b.id);
                  "
                >
                  <option value="" disabled>Выберите слайд</option>
                  <option
                    v-for="(s, n) in course.slides"
                    :key="s.id"
                    :value="s.id"
                    :disabled="s.id === activeSlide.id"
                  >
                    {{ n + 1 }} · {{ s.title }}
                  </option>
                </select>
              </label>
            </div>
          </div>
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
