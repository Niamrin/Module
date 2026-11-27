<script setup>
import { computed, nextTick, ref } from "vue";
import ModuleView from "./ModuleView.vue";
const props = defineProps({ course: Object, student: Boolean });
const index = ref(0);
const furthest = ref(0);
const finished = ref(false);
const heading = ref(null);
const pageBlocks = computed(() => props.course.blocks.filter((b) => !b.hidden));
const slides = computed(() => {
  const sections =
    props.course.slides?.map((slide) => ({ ...slide, blocks: [] })) || [];
  if (!sections.length)
    sections.push({ id: "first", title: "Начало курса", blocks: [] });
  const byId = new Map(sections.map((slide) => [slide.id, slide]));
  for (const block of pageBlocks.value)
    (byId.get(block.slideId) || sections[0]).blocks.push(block);
  return sections;
});
const readingOrder = computed(() =>
  props.course.slides?.length
    ? slides.value.flatMap((slide) => slide.blocks)
    : pageBlocks.value,
);
async function go(to) {
  finished.value = to === slides.value.length;
  index.value = Math.min(to, slides.value.length - 1);
  furthest.value = Math.max(index.value, furthest.value);
  await nextTick();
  heading.value?.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
</script>
<template>
  <main v-if="course.format === 'presentation'" class="slide-reader lesson">
    <header class="slide-header">
      <span>{{ course.title }}</span>
      <span
        >{{ student ? "" : "Предпросмотр · " }}{{ index + 1 }} из
        {{ slides.length }}</span
      >
    </header>
    <progress
      :value="index + 1"
      :max="slides.length"
      aria-label="Положение в презентации"
    ></progress>
    <h1 ref="heading" tabindex="-1">
      {{ finished ? "Просмотр завершён" : slides[index].title }}
    </h1>
    <p v-if="finished">Вы просмотрели все слайды курса «{{ course.title }}».</p>
    <section
      v-for="(slide, i) in slides"
      :key="slide.id"
      v-show="!finished && i === index"
      :aria-label="slide.title"
    >
      <template v-if="i <= furthest"
        ><article v-for="b in slide.blocks" :key="b.id" class="lesson-content">
          <ModuleView
            :block="b"
            :interactive="true"
            :student="student"
          /></article
      ></template>
    </section>
    <nav class="slide-nav" aria-label="Навигация по слайдам">
      <button
        :disabled="!finished && index === 0"
        @click="go(finished ? index : index - 1)"
      >
        ← Назад
      </button>
      <button v-if="!finished" class="primary" @click="go(index + 1)">
        {{ index + 1 === slides.length ? "Завершить просмотр" : "Далее →" }}
      </button>
      <button v-else @click="go(0)">К началу</button>
    </nav>
  </main>
  <main v-else class="lesson">
    <div class="lesson-head">
      <div class="eyebrow">
        Учебный курс{{ student ? "" : " · Предпросмотр" }}
      </div>
      <h1>{{ course.title }}</h1>
      <p>{{ course.description }}</p>
    </div>
    <article v-for="b in readingOrder" :key="b.id" class="lesson-content">
      <ModuleView :block="b" :interactive="true" :student="student" />
    </article>
  </main>
</template>
