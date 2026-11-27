<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { rich, encodeRich } from "../model.js";

const props = defineProps({ label: String, modelValue: String });
const emit = defineEmits(["update:modelValue"]);
const host = ref(null);
const heading = ref(0);
const active = ref({});
let editor;
let lastValue;

const tools = [
  { name: "bold", label: "Полужирный", text: "Ж", command: "toggleBold" },
  { name: "italic", label: "Курсив", text: "К", command: "toggleItalic" },
  { name: "underline", label: "Подчёркивание", text: "Ч", command: "toggleUnderline" },
  { name: "highlight", label: "Маркер", text: "Маркер", command: "toggleHighlight" },
  { name: "bulletList", label: "Маркированный список", text: "• Список", command: "toggleBulletList" },
  { name: "orderedList", label: "Нумерованный список", text: "1. Список", command: "toggleOrderedList" },
];

function updateToolbar(instance) {
  heading.value = instance.getAttributes("heading").level || 0;
  active.value = Object.fromEntries(tools.map(tool => [tool.name, instance.isActive(tool.name)]));
}

function setHeading(level) {
  const chain = editor.chain().focus();
  if (level) chain.setHeading({ level }).run();
  else chain.setParagraph().run();
}

onMounted(() => {
  lastValue = props.modelValue;
  editor = new Editor({
    element: host.value,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        blockquote: false, code: false, codeBlock: false, horizontalRule: false,
        link: false, strike: false, trailingNode: false,
      }),
      Highlight,
    ],
    content: rich(props.modelValue),
    editorProps: { attributes: {
      class: "rich writing-area", role: "textbox", "aria-multiline": "true",
      "aria-label": props.label,
    } },
    onTransaction: ({editor}) => updateToolbar(editor),
    onUpdate: ({editor}) => {
      lastValue = encodeRich(editor.getHTML());
      emit("update:modelValue", lastValue);
    },
  });
  updateToolbar(editor);
});

watch(() => props.modelValue, value => {
  if (editor && value !== lastValue) {
    lastValue = value;
    editor.commands.setContent(rich(value), { emitUpdate: false });
  }
});
onBeforeUnmount(() => editor?.destroy());
</script>

<template>
  <div class="field">
    <span class="field-label">{{ label }}</span>
    <div class="writing-frame">
      <div class="writing-tools" role="group" aria-label="Форматирование текста">
        <select aria-label="Стиль абзаца" :value="heading" @change="setHeading(Number($event.target.value))">
          <option :value="0">Абзац</option>
          <option v-for="n in 4" :key="n" :value="n">Заголовок {{ n }}</option>
        </select>
        <button v-for="tool in tools" :key="tool.name" type="button"
          :class="'format-' + tool.name" :title="tool.label" :aria-label="tool.label"
          :aria-pressed="active[tool.name] || false" @mousedown.prevent
          @click="editor.chain().focus()[tool.command]().run()">{{ tool.text }}</button>
      </div>
      <div ref="host"></div>
    </div>
  </div>
</template>
