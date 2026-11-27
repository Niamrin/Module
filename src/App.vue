<script>
import { ref, computed, watch, provide, nextTick } from "vue";
import {
  types,
  make,
  demo,
  normalize,
  questionErrors,
  exportFile,
} from "./model.js";
import ModuleView from "./components/ModuleView.vue";
import ModuleSettings from "./components/ModuleSettings.vue";
import BlockCanvas from "./components/BlockCanvas.vue";
import { walkBlocks, childLists, visibleTree } from "./block-tree.js";
import Field from "./components/Field.vue";
export default {
  components: { ModuleSettings, ModuleView, BlockCanvas, Field },
  setup() {
    const KEY = "course-builder-vue3-v1",
      seed = JSON.parse(document.getElementById("seed")?.textContent || "null"),
      student = !!seed?.student;
    let initial;
    try {
      initial = normalize(
        seed?.course ||
          JSON.parse(
            localStorage.getItem(KEY) ||
              localStorage.getItem("course-builder-v1") ||
              "null",
          ) ||
          demo(),
      );
    } catch {
      initial = normalize(demo());
    }
    const course = ref(initial),
      selected = ref(initial.blocks[0]?.id || null),
      mode = ref(student ? "preview" : "edit"),
      editing = ref(null),
      drag = ref(null),
      over = ref(null),
      message = ref(""),
      saveOK = ref(true),
      importFile = ref(null),
      previewKey = ref(0);
    let timer;
    const entries = computed(
      () =>
        new Map(
          Array.from(walkBlocks(course.value.blocks), (entry) => [
            entry.block.id,
            entry,
          ]),
        ),
    );
    const current = computed(() => entries.value.get(selected.value)?.block),
      visible = computed(() => course.value.blocks.filter((b) => !b.hidden));
    const groups = Object.entries(types).reduce((a, [k, v]) => {
      (a[v[2]] ??= []).push({ type: k, title: v[0], glyph: v[1] });
      return a;
    }, {});
    function notify(t) {
      message.value = t;
      clearTimeout(timer);
      timer = setTimeout(() => (message.value = ""), 3200);
    }
    function save(manual = false) {
      if (student) return;
      try {
        localStorage.setItem(KEY, JSON.stringify(course.value));
        saveOK.value = true;
        if (manual) notify("Курс сохранён в этом браузере.");
      } catch {
        saveOK.value = false;
        if (manual)
          notify("Хранилище заполнено или недоступно. Скачайте JSON.");
      }
    }
    watch(course, () => save(), { deep: true });
    async function select(id, scroll = false) {
      selected.value = id;
      editing.value = id;
      if (scroll) {
        await nextTick();
        if (id || matchMedia("(max-width:800px)").matches)
          document
            .getElementById(id ? "block-" + id : "inspectorPane")
            ?.scrollIntoView({ behavior: "smooth" });
      }
    }
    async function add(type, list = course.value.blocks, at = list.length) {
      let b = make(type);
      list.splice(at, 0, b);
      select(b.id);
      await nextTick();
      document
        .getElementById("block-" + b.id)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    function action(id, a) {
      let bs = entries.value.get(id)?.list || [],
        i = bs.findIndex((b) => b.id === id);
      if (i < 0) return;
      let b = bs[i];
      if (a === "up" && i > 0) [bs[i - 1], bs[i]] = [b, bs[i - 1]];
      if (a === "down" && i < bs.length - 1)
        [bs[i + 1], bs[i]] = [b, bs[i + 1]];
      if (a === "hide") b.hidden = !b.hidden;
      if (a === "copy") {
        let c = normalize(
          {
            blocks: [b],
          },
          new Set(),
          true,
        ).blocks[0];
        bs.splice(i + 1, 0, c);
        select(c.id);
      }
      if (a === "delete" && confirm("Удалить модуль?")) {
        const parent = entries.value.get(id)?.parents.at(-1);
        const affected = editPath.value.includes(id) || selected.value === id;
        bs.splice(i, 1);
        if (affected)
          select(bs[Math.min(i, bs.length - 1)]?.id || parent?.id || null);
      }
    }
    function dragStart(event, kind, value) {
      drag.value = { kind, value };
      event.dataTransfer.effectAllowed = kind === "new" ? "copy" : "move";
      event.dataTransfer.setData("text/plain", value);
    }
    function dragEnd() {
      drag.value = null;
      over.value = null;
    }
    function insertionIndex(event, canvas) {
      const cards = canvas.querySelectorAll(":scope > .block");
      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        if (event.clientY < rect.top + rect.height / 2) return i;
      }
      return cards.length;
    }
    function dragOver(
      event,
      list = course.value.blocks,
      canvas = document.getElementById("canvas"),
    ) {
      if (!drag.value) return;
      event.preventDefault();
      event.dataTransfer.dropEffect =
        drag.value.kind === "new" ? "copy" : "move";
      over.value = { list, at: insertionIndex(event, canvas) };
    }
    function drop(
      event,
      list = course.value.blocks,
      canvas = document.getElementById("canvas"),
    ) {
      if (!drag.value) return;
      event.preventDefault();
      const { kind, value } = drag.value;
      const at = insertionIndex(event, canvas);
      dragEnd();
      if (kind === "new") {
        add(value, list, at);
        return;
      }
      const source = entries.value.get(value);
      if (!source) return;
      for (const { block } of walkBlocks([source.block])) {
        if (childLists(block).includes(list)) return;
      }
      const from = source.list.indexOf(source.block);
      source.list.splice(from, 1);
      list.splice(
        source.list === list && from < at ? at - 1 : at,
        0,
        source.block,
      );
      select(source.block.id);
    }
    const editPath = computed(() => {
      const entry = entries.value.get(editing.value);
      return entry ? [...entry.parents, entry.block].map((b) => b.id) : [];
    });
    function finishEdit(id) {
      editing.value = entries.value.get(id)?.parents.at(-1)?.id || null;
      selected.value = editing.value || id;
    }
    provide("courseCanvas", {
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
    });
    function toggle() {
      mode.value = mode.value === "edit" ? "preview" : "edit";
      previewKey.value++;
      window.scrollTo(0, 0);
    }
    function replace(c) {
      editing.value = null;
      course.value = c;
      selected.value = c.blocks[0]?.id || null;
      previewKey.value++;
      mode.value = "edit";
    }
    function newCourse(example = false) {
      if (confirm("Заменить текущий курс? Сохраните JSON, если он нужен."))
        replace(
          example
            ? normalize(demo())
            : { version: 1, title: "Новый курс", description: "", blocks: [] },
        );
    }
    async function importJSON(e) {
      let file = e.target.files?.[0];
      if (!file) return;
      try {
        let c = normalize(JSON.parse(await file.text()));
        if (confirm("Заменить текущий курс импортированным?")) {
          replace(c);
          notify("Курс импортирован.");
        }
      } catch {
        notify("Не удалось импортировать JSON: проверьте формат.");
      } finally {
        e.target.value = "";
      }
    }
    const filename = () =>
      course.value.title
        .trim()
        .replace(/[^\p{L}\p{N}_ -]/gu, "")
        .slice(0, 80) || "course";
    function exportJSON() {
      exportFile(
        JSON.stringify(course.value, null, 2),
        filename() + ".json",
        "application/json;charset=utf-8",
      );
    }
    async function exportHTML() {
      const exported = visibleTree(course.value.blocks);
      const bad = Array.from(walkBlocks(exported), (entry) => entry.block).find(
        (b) =>
          b.type === "quiz" &&
          (!b.data.questions.length ||
            b.data.questions.some((q) => questionErrors(q).length)),
      );
      if (bad) {
        mode.value = "edit";
        select(bad.id, true);
        notify("Исправьте настройки видимых вопросов перед экспортом.");
        return;
      }
      try {
        let html = window.__COURSE_SOURCE__;
        if (!html) {
          const response = await fetch(
            new URL("course_builder_vue3.html", document.baseURI),
          );
          if (!response.ok) throw Error();
          html = await response.text();
        }
        const data = JSON.stringify({
          student: true,
          course: { ...course.value, blocks: exported },
        }).replace(/</g, "\\u003c");
        html = html.replace(
          /(<script id="seed" type="application\/json">)[\s\S]*?(<\/script>)/,
          (_, a, b) => a + data + b,
        );
        exportFile(html, filename() + ".html", "text/html;charset=utf-8");
        notify("HTML для обучающегося экспортирован.");
      } catch {
        notify(
          "Шаблон экспорта недоступен. Используйте автономную версию или запустите сборку проекта.",
        );
      }
    }
    if (!student) save();
    return {
      course,
      student,
      selected,
      mode,
      editing,
      drag,
      dragOver,
      over,
      message,
      saveOK,
      importFile,
      previewKey,
      current,
      visible,
      groups,
      types,
      notify,
      save,
      select,
      add,
      action,
      dragStart,
      dragEnd,
      drop,
      toggle,
      newCourse,
      importJSON,
      exportJSON,
      exportHTML,
    };
  },
};
</script>

<template>
  <header v-if="!student" class="top">
    <div class="brand">
      <div class="logo">▤</div>
      <div>
        <strong>Конструктор курса</strong
        ><small>Vue 3 · Редактор учебных материалов</small>
      </div>
    </div>
    <div class="actions">
      <span class="status">{{
        saveOK ? "Сохранено локально" : "Не сохранено"
      }}</span
      ><button @click="importFile.click()">Импорт</button
      ><button @click="exportJSON">JSON ↓</button
      ><button @click="exportHTML">HTML ↓</button
      ><button @click="toggle">
        {{ mode === "edit" ? "▷ Предпросмотр" : "← Редактор" }}</button
      ><button class="primary" @click="save(true)">Сохранить</button>
    </div>
  </header>
  <div v-if="mode === 'edit'" class="layout">
    <aside class="palette">
      <div class="sticky">
        <template v-for="(items, g) in groups" :key="g"
          ><div class="section-label">{{ g }}</div>
          <button
            v-for="item in items"
            :key="item.type"
            class="palette-btn"
            draggable="true"
            @dragstart="dragStart($event, 'new', item.type)"
            @dragend="dragEnd"
            @click="add(item.type)"
          >
            <span class="glyph">{{ item.glyph }}</span
            >{{ item.title }}<span class="plus">＋</span>
          </button></template
        >
        <p class="palette-note">
          Перетащите модуль на полотно или нажмите, чтобы добавить в конец.
        </p>
      </div>
    </aside>
    <main
      class="workspace"
      @dragover="dragOver"
      @drop="drop"
      @dragleave="
        !$event.currentTarget.contains($event.relatedTarget) && (over = null)
      "
    >
      <div class="workspace-inner">
        <div class="course-head">
          <div class="eyebrow">Учебная страница · черновик</div>
          <h1>{{ course.title }}</h1>
          <p>{{ course.description }}</p>
        </div>
        <div class="workspace-bar">
          <span
            >Модули: {{ course.blocks.length }} · Видимые:
            {{ visible.length }}</span
          ><button class="ghost small" @click="select(null, true)">
            ⚙ Настройки курса
          </button>
        </div>
        <BlockCanvas id="canvas" :blocks="course.blocks" />
        <button class="add-bottom" @click="add('text')">
          ＋ Добавить текстовый модуль
        </button>
      </div>
    </main>
    <aside id="inspectorPane" class="inspector">
      <div class="sticky">
        <ModuleSettings
          v-if="current"
          :block="current"
          @settings="select(null)"
        /><template v-else
          ><div class="eyebrow">Параметры страницы</div>
          <h2 style="margin-top: 8px">Настройки курса</h2>
          <Field label="Название курса" v-model="course.title" /><Field
            label="Описание"
            kind="textarea"
            v-model="course.description"
          />
          <div class="divider"></div>
          <button class="wide" @click="newCourse()">＋ Новый пустой курс</button
          ><button
            class="wide"
            style="margin-top: 8px"
            @click="newCourse(true)"
          >
            Восстановить пример
          </button></template
        >
      </div>
    </aside>
  </div>
  <main v-else class="lesson">
    <div class="lesson-head">
      <div class="eyebrow">
        Учебный курс{{ student ? "" : " · Предпросмотр" }}
      </div>
      <h1>{{ course.title }}</h1>
      <p>{{ course.description }}</p>
    </div>
    <article
      v-for="b in visible"
      :key="b.id + '-' + previewKey"
      class="lesson-content"
    >
      <ModuleView :block="b" :interactive="true" :student="student" />
    </article>
  </main>
  <input
    v-if="!student"
    ref="importFile"
    type="file"
    accept="application/json,.json"
    hidden
    @change="importJSON"
  />
  <div v-if="message" class="toast" role="status">{{ message }}</div>
</template>
