<script setup>
import ModuleView from "../../ModuleView.vue";
import { rich } from "../../../model.js";
defineProps({
  blockId: String,
  student: Boolean,
  interactive: Boolean,
  data: Object,
});
</script>

<template>
  <details class="spoiler" :open="data.open">
    <summary>{{ data.title || "Примечание" }}</summary>
    <div v-html="rich(data.body)"></div>
    <div
      class="nested-content"
      v-for="child in data.blocks.filter((b) => !b.hidden)"
      :key="child.id"
    >
      <ModuleView
        :block="child"
        :interactive="interactive"
        :student="student"
      />
    </div>
  </details>
</template>
