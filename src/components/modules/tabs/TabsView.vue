<script setup>
import ModuleView from "../../ModuleView.vue";
import { computed, ref, watch } from "vue";
import { rich } from "../../../model.js";
const props = defineProps({
  blockId: String,
  student: Boolean,
  interactive: Boolean,
  data: Object,
});
const index = ref(0);
const visited = ref(new Set());
const tabIndex = computed(() =>
  Math.min(index.value, Math.max(0, props.data.tabs.length - 1)),
);
watch(
  () => props.data.tabs[tabIndex.value]?.id,
  (id) => {
    if (id) visited.value.add(id);
  },
  { immediate: true },
);
watch(
  () => props.data,
  () => {
    index.value = 0;
  },
  { deep: true },
);
</script>

<template>
  <div>
    <template v-if="data.tabs.length"
      ><div class="tabs" role="tablist">
        <button
          v-for="(t, i) in data.tabs"
          :key="i"
          role="tab"
          :aria-selected="tabIndex === i"
          :class="{ active: tabIndex === i }"
          @click="index = i"
        >
          {{ t.title || "Вкладка " + (i + 1) }}
        </button>
      </div>
      <div
        v-for="(tab, i) in data.tabs"
        :key="tab.id"
        v-show="i === tabIndex"
        role="tabpanel"
      >
        <template v-if="visited.has(tab.id)"
          ><div v-html="rich(tab.body)"></div>
          <div
            class="nested-content"
            v-for="child in tab.blocks.filter((b) => !b.hidden)"
            :key="child.id"
          >
            <ModuleView
              :block="child"
              :interactive="interactive"
              :student="student"
            /></div
        ></template></div
    ></template>
    <div v-else class="placeholder">Добавьте вкладки</div>
  </div>
</template>
