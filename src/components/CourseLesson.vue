<script setup>
import ModuleView from "./ModuleView.vue";
defineProps({ course: Object, student: Boolean });
</script>

<template>
  <main class="lesson">
    <div class="lesson-head">
      <div class="eyebrow">
        Учебный курс{{ student ? "" : " · Предпросмотр" }}
      </div>
      <h1>{{ course.title }}</h1>
      <p>{{ course.description }}</p>
    </div>
    <article
      v-for="b in course.blocks.filter(block => !block.hidden)"
      :key="b.id"
      class="lesson-content"
    >
      <ModuleView :block="b" :interactive="true" :student="student" />
    </article>
  </main>
</template>
