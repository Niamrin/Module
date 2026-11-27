<script setup>
import { computed, ref, watch } from "vue";
import { rich } from "../../../model.js";
const props = defineProps({
  blockId: String,
  student: Boolean,
  interactive: Boolean,
  data: Object,
});
const index = ref(0);
const tabIndex = computed(() =>
  Math.min(index.value, Math.max(0, props.data.tabs.length - 1)),
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
      <div role="tabpanel" v-html="rich(data.tabs[tabIndex].body)"></div
    ></template>
    <div v-else class="placeholder">Добавьте вкладки</div>
  </div>
</template>
