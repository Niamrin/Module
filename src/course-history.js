import { computed, onBeforeUnmount, ref, shallowReactive, watch } from "vue";

const maxEntries = 51; // Current state plus 50 undo steps.
const maxCharacters = 8 * 1024 * 1024;

export function useCourseHistory(course, enabled, isEditing, afterRestore) {
  const entries = shallowReactive([]);
  const cursor = ref(0);
  const canUndo = computed(() => cursor.value > 0);
  const canRedo = computed(() => cursor.value < entries.length - 1);
  const revisions = computed(() =>
    entries.map(({ label, time }, index) => ({ label, time, index })).reverse(),
  );
  let field = null;
  let previousField = null;
  let lastTyped = 0;
  let label = "";
  if (enabled) entries.push(snapshot("Открытие курса"));

  function snapshot(label) {
    return { label, time: Date.now(), data: JSON.stringify(course.value) };
  }

  function boundary() {
    field = previousField = null;
    label = "";
  }
  function describe(action) {
    boundary();
    label = action;
  }
  function input(event) {
    const target = event.target.closest(
      'textarea, input:not([type]), input[type="text"], input[type="url"], [contenteditable="true"]',
    );
    if (target) {
      field = target;
      label =
        target.getAttribute("aria-label") ||
        target
          .closest(".field")
          ?.querySelector(".field-label")
          ?.textContent.trim() ||
        "Текст";
    }
  }
  function click(event) {
    const button = event.target.closest("button");
    if (button)
      describe(
        button.title ||
          button.getAttribute("aria-label") ||
          button.textContent.trim(),
      );
  }
  function record() {
    const state = snapshot(label || "Изменение настроек");
    if (entries[cursor.value].data === state.data) return;
    entries.splice(cursor.value + 1);
    if (
      field &&
      field === previousField &&
      state.time - lastTyped < 900 &&
      cursor.value > 0
    ) {
      entries[cursor.value] = state;
    } else {
      entries.push(state);
      cursor.value++;
    }
    previousField = field;
    lastTyped = state.time;
    field = null;
    label = "";
    let characters = entries.reduce((sum, entry) => sum + entry.data.length, 0);
    while (
      entries.length > 2 &&
      (entries.length > maxEntries || characters > maxCharacters)
    ) {
      characters -= entries.shift().data.length;
      cursor.value--;
    }
  }
  if (enabled) watch(course, record, { deep: true });

  function restore(index) {
    if (
      !enabled ||
      !isEditing() ||
      index < 0 ||
      index >= entries.length ||
      index === cursor.value
    )
      return;
    boundary();
    cursor.value = index;
    course.value = JSON.parse(entries[index].data);
    afterRestore();
  }
  function shortcut(event) {
    if (
      !isEditing() ||
      event.altKey ||
      event.isComposing ||
      !(event.ctrlKey || event.metaKey)
    )
      return;
    const redo =
      event.code === "KeyY" || (event.code === "KeyZ" && event.shiftKey);
    if (!redo && event.code !== "KeyZ") return;
    event.preventDefault();
    event.stopPropagation();
    restore(cursor.value + (redo ? 1 : -1));
  }
  if (enabled) {
    const listeners = {
      beforeinput: input,
      input,
      pointerdown: boundary,
      focusin: boundary,
      click,
      keydown: shortcut,
    };
    for (const [name, handler] of Object.entries(listeners))
      document.addEventListener(name, handler, true);
    onBeforeUnmount(() => {
      for (const [name, handler] of Object.entries(listeners))
        document.removeEventListener(name, handler, true);
    });
  }
  return { cursor, revisions, canUndo, canRedo, restore, describe };
}
