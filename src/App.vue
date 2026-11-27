<script>
import { ref, computed, watch, shallowRef, provide, nextTick } from "vue";
import {
  types,
  uid,
  make,
  demo,
  normalize,
  questionErrors,
  exportFile,
} from "./model.js";
import { handoffCourse } from "./handoff-course.js";
import CourseLesson from "./components/CourseLesson.vue";
import { renderStudentPage } from "./export-student.js";
import ModuleSettings from "./components/ModuleSettings.vue";
import SlideEditor from "./components/SlideEditor.vue";
import BlockCanvas from "./components/BlockCanvas.vue";
import { walkBlocks, childLists, visibleTree } from "./block-tree.js";
import { useCourseHistory } from "./course-history.js";
import Field from "./components/Field.vue";
export default {
  components: { SlideEditor, ModuleSettings, CourseLesson, BlockCanvas, Field },
  setup() {
    const exampleMode =
      new URLSearchParams(location.search).get("example") === "handoff";
    const KEY = exampleMode
        ? "course-builder-handoff-v1"
        : "course-builder-vue3-v1",
      seed = JSON.parse(document.getElementById("seed")?.textContent || "null"),
      student = !!seed?.student;
    let initial;
    try {
      initial = normalize(
        seed?.course ||
          JSON.parse(
            localStorage.getItem(KEY) ||
              (!exampleMode && localStorage.getItem("course-builder-v1")) ||
              "null",
          ) ||
          (exampleMode ? handoffCourse() : demo()),
      );
    } catch {
      initial = normalize(exampleMode ? handoffCourse() : demo());
    }
    const course = ref(initial),
      selected = ref(initial.blocks[0]?.id || null),
      mode = ref(student || exampleMode ? "preview" : "edit"),
      editing = ref(null),
      drag = ref(null),
      over = shallowRef(null),
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
    const slideId = ref(null);
    const activeSlide = computed(() =>
      course.value.format === "presentation"
        ? course.value.slides.find((s) => s.id === slideId.value) ||
          course.value.slides[0]
        : null,
    );
    const canvasBlocks = computed(() =>
      activeSlide.value
        ? course.value.blocks.filter((b) => b.slideId === activeSlide.value.id)
        : course.value.blocks,
    );
    function chooseSlide(id) {
      slideId.value = id;
      selected.value = null;
      editing.value = null;
    }
    function slideAction(action) {
      const draft = course.value,
        slides = draft.slides,
        slide = activeSlide.value;
      const at = slides.indexOf(slide);
      if (
        action === "delete" &&
        !confirm("Удалить слайд вместе со всеми его модулями?")
      )
        return;
      const labels = {
        add: "Добавление",
        copy: "Дублирование",
        earlier: "Перестановка",
        later: "Перестановка",
        delete: "Удаление",
      };
      history.describe(labels[action] + " слайда");
      if (action === "add" || action === "copy") {
        const next = {
          id: uid(),
          title: action === "copy" ? slide.title + " (копия)" : "Новый слайд",
        };
        if (action === "copy") {
          const copies = normalize(
            { blocks: canvasBlocks.value },
            new Set(),
            true,
          ).blocks;
          for (const block of copies) {
            block.slideId = next.id;
            draft.blocks.push(block);
          }
        }
        slides.splice(at + 1, 0, next);
        chooseSlide(next.id);
      } else if (action === "delete") {
        draft.blocks = draft.blocks.filter((b) => b.slideId !== slide.id);
        slides.splice(at, 1);
        if (!slides.length) slides.push({ id: uid(), title: "Новый слайд" });
        chooseSlide(slides[Math.min(at, slides.length - 1)].id);
      } else {
        const dest = at + (action === "earlier" ? -1 : 1);
        if (dest >= 0 && dest < slides.length)
          slides.splice(dest, 0, slides.splice(at, 1)[0]);
      }
      orderBySlide();
    }
    function orderBySlide() {
      const draft = course.value;
      const order = new Map(draft.slides.map((s, i) => [s.id, i]));
      draft.blocks.sort(
        (a, b) => (order.get(a.slideId) ?? 0) - (order.get(b.slideId) ?? 0),
      );
    }
    function transferSlide(id, blockId) {
      const payload = blockId ? { kind: "move", value: blockId } : drag.value;
      if (!payload) return;
      dragEnd();
      if (payload.kind === "new") {
        chooseSlide(id);
        add(payload.value);
        return;
      }
      const source = entries.value.get(payload.value);
      if (
        !source ||
        (source.list === course.value.blocks && source.block.slideId === id)
      )
        return;
      history.describe("Перенос модуля на другой слайд");
      source.list.splice(source.list.indexOf(source.block), 1);
      source.block.slideId = id;
      course.value.blocks.push(source.block);
      orderBySlide();
      select(source.block.id);
    }
    function targetPosition(list, at) {
      if (!activeSlide.value || list !== canvasBlocks.value)
        return { list, at };
      const all = course.value.blocks;
      const index = list[at]
        ? all.indexOf(list[at])
        : list.length
          ? all.indexOf(list.at(-1)) + 1
          : all.length;
      return { list: all, at: index };
    }
    const historyOpen = ref(false);
    const history = useCourseHistory(
      course,
      !student,
      () => mode.value === "edit",
      () => {
        if (!entries.value.has(editing.value)) editing.value = null;
        if (!entries.value.has(selected.value)) selected.value = editing.value;
        const entry = entries.value.get(selected.value);
        if (entry && activeSlide.value)
          slideId.value = (entry.parents[0] || entry.block).slideId;
        dragEnd();
      },
    );
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
      const entry = entries.value.get(id);
      if (entry && activeSlide.value)
        slideId.value = (entry.parents[0] || entry.block).slideId;
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
    async function add(type, list = canvasBlocks.value, at = list.length) {
      history.describe("Добавление модуля · " + types[type][0]);
      ({ list, at } = targetPosition(list, at));
      let b = make(type);
      if (list === course.value.blocks && course.value.slides?.length)
        b.slideId =
          activeSlide.value?.id ||
          (list[at] || list[at - 1])?.slideId ||
          course.value.slides[0].id;
      list.splice(at, 0, b);
      if (activeSlide.value && list === course.value.blocks) orderBySlide();
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
      const names = {
        up: "Перемещение",
        down: "Перемещение",
        hide: "Видимость",
        copy: "Дублирование",
        delete: "Удаление",
      };
      history.describe(names[a] + " · " + types[b.type][0]);
      if (a === "up" || a === "down") {
        const siblings = bs === course.value.blocks ? canvasBlocks.value : bs;
        const neighbor = siblings[siblings.indexOf(b) + (a === "up" ? -1 : 1)];
        if (neighbor) {
          const j = bs.indexOf(neighbor);
          if (
            bs === course.value.blocks &&
            !activeSlide.value &&
            course.value.slides?.length
          )
            [b.slideId, neighbor.slideId] = [neighbor.slideId, b.slideId];
          [bs[i], bs[j]] = [neighbor, b];
        }
      }
      if (a === "hide") b.hidden = !b.hidden;
      if (a === "copy") {
        let c = normalize(
          {
            blocks: [b],
          },
          new Set(),
          true,
        ).blocks[0];
        if (b.slideId) c.slideId = b.slideId;
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
      list = canvasBlocks.value,
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
      list = canvasBlocks.value,
      canvas = document.getElementById("canvas"),
    ) {
      if (!drag.value) return;
      event.preventDefault();
      const { kind, value } = drag.value;
      let at = insertionIndex(event, canvas);
      dragEnd();
      if (kind === "new") {
        add(value, list, at);
        return;
      }
      ({ list, at } = targetPosition(list, at));
      const source = entries.value.get(value);
      if (!source) return;
      for (const { block } of walkBlocks([source.block])) {
        if (childLists(block).includes(list)) return;
      }
      const from = source.list.indexOf(source.block);
      history.describe("Перенос модуля · " + types[source.block.type][0]);
      if (
        list === course.value.blocks &&
        !activeSlide.value &&
        course.value.slides?.length
      ) {
        source.block.slideId =
          (list[at] || list[at - 1])?.slideId || course.value.slides[0].id;
      }
      source.list.splice(from, 1);
      list.splice(
        source.list === list && from < at ? at - 1 : at,
        0,
        source.block,
      );
      if (list === course.value.blocks && activeSlide.value) {
        source.block.slideId = activeSlide.value.id;
        orderBySlide();
      }
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
      activeSlide,
      course,
      transferSlide,
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
    function setFormat(format) {
      const draft = course.value;
      if (format === "presentation" && !draft.slides?.length) {
        const slide = { id: uid(), title: "Начало курса" };
        draft.slides = [slide];
        draft.blocks.forEach((block) => (block.slideId = slide.id));
      }
      if (draft.slides?.length) orderBySlide();
      draft.format = format;
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
          history.describe("Импорт курса");
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
        const html = await renderStudentPage({
          ...course.value,
          blocks: exported,
        });
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
      ...history,
      historyOpen,
      activeSlide,
      canvasBlocks,
      chooseSlide,
      slideAction,
      transferSlide,
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
      setFormat,
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
      <div v-if="mode === 'edit'" class="history-controls">
        <button
          :disabled="!canUndo"
          title="Отменить (Ctrl/⌘ + Z)"
          @click="restore(cursor - 1)"
        >
          ↶ Отменить
        </button>
        <button
          :disabled="!canRedo"
          title="Повторить (Ctrl/⌘ + Shift + Z)"
          @click="restore(cursor + 1)"
        >
          ↷ Повторить
        </button>
        <button
          :aria-expanded="historyOpen"
          aria-controls="course-history"
          @click="historyOpen = !historyOpen"
        >
          История
        </button>
        <section
          v-if="historyOpen"
          id="course-history"
          class="history-panel"
          aria-label="История изменений"
        >
          <div class="settings-bar">
            <strong>История изменений</strong
            ><button aria-label="Закрыть историю" @click="historyOpen = false">
              ×
            </button>
          </div>
          <ol reversed>
            <li v-for="step in revisions" :key="step.index">
              <button
                :aria-current="cursor === step.index ? 'step' : undefined"
                @click="restore(step.index)"
              >
                <time>{{
                  new Date(step.time).toLocaleTimeString("ru", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}</time>
                {{ step.label }}
              </button>
            </li>
          </ol>
        </section>
      </div>
      <span class="status">{{
        saveOK ? "Сохранено локально" : "Не сохранено"
      }}</span
      ><button @click="importFile.click()">Импорт</button
      ><button @click="exportJSON">JSON ↓</button
      ><button
        title="Скачать страницу ученика одним HTML-файлом"
        @click="exportHTML"
      >
        HTML ↓</button
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
        <SlideEditor
          v-if="activeSlide"
          :slides="course.slides"
          :active="activeSlide"
          :dragging="!!drag"
          @select="chooseSlide"
          @action="slideAction"
          @transfer="transferSlide"
        />
        <BlockCanvas id="canvas" :blocks="canvasBlocks" />
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
          <label class="field"
            ><span class="field-label">Формат просмотра</span>
            <select
              :value="course.format || 'page'"
              @change="setFormat($event.target.value)"
            >
              <option value="page">Страница</option>
              <option value="presentation">Презентация</option>
            </select>
          </label>
          <a
            class="example-link"
            href="?example=handoff"
            target="_blank"
            rel="noopener"
            >Посмотреть пример на 4 слайда ↗</a
          >
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
  <CourseLesson v-else :key="previewKey" :course="course" :student="student" />
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
