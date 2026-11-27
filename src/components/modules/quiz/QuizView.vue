<script>
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { questionErrors, correct } from "../../../model.js";
export default {
  props: {
    data: Object,
    blockId: String,
    interactive: Boolean,
    student: Boolean,
  },
  setup(props) {
    const quiz = computed(() => props.data);
    const storageKey = "course-quiz:" + location.pathname + ":" + props.blockId;
    const attempt = ref({
      number: 0,
      phase: "ready",
      deadline: 0,
      answers: [],
    });
    const storageWarning = ref(false);
    if (props.student) {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (
          saved &&
          Number.isInteger(saved.number) &&
          Array.isArray(saved.answers) &&
          ["running", "done"].includes(saved.phase)
        )
          attempt.value = saved;
      } catch {
        storageWarning.value = true;
      }
    }
    const now = ref(Date.now());
    const remaining = computed(() =>
      Math.max(0, Math.ceil((attempt.value.deadline - now.value) / 1000)),
    );
    const allowed = computed(
      () => !quiz.value.attempts || attempt.value.number < quiz.value.attempts,
    );
    const valid = computed(
      () =>
        quiz.value.questions.length &&
        quiz.value.questions.every((q) => !questionErrors(q).length),
    );
    function tick() {
      now.value = Date.now();
      if (
        attempt.value.phase === "running" &&
        attempt.value.deadline &&
        !remaining.value
      )
        attempt.value.phase = "done";
    }
    let timer;
    watch(
      attempt,
      (state) => {
        if (props.student) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(state));
          } catch {
            storageWarning.value = true;
          }
        }
      },
      { deep: true, flush: "sync" },
    );
    watch(
      () => attempt.value.phase,
      (phase) => {
        clearInterval(timer);
        if (phase === "running" && attempt.value.deadline) {
          timer = setInterval(tick, 500);
          tick();
        }
      },
      { immediate: true },
    );
    onBeforeUnmount(() => clearInterval(timer));
    function start() {
      if (!allowed.value || !valid.value || attempt.value.phase === "running")
        return;
      now.value = Date.now();
      attempt.value = {
        number: attempt.value.number + 1,
        phase: "running",
        deadline: quiz.value.minutes
          ? now.value + quiz.value.minutes * 60000
          : 0,
        answers: quiz.value.questions.map(() => []),
      };
    }
    function answer(n, index, checked) {
      tick();
      if (attempt.value.phase !== "running") return;
      const values = attempt.value.answers[n];
      attempt.value.answers[n] =
        quiz.value.questions[n].type === "single"
          ? [index]
          : checked
            ? [...new Set([...values, index])]
            : values.filter((i) => i !== index);
    }
    function scored(q, n) {
      const ids = (attempt.value.answers[n] || []).map(
        (i) => q.data.options[i]?.id,
      );
      return correct(q, { answers: ids });
    }
    const score = computed(() => quiz.value.questions.filter(scored).length);
    const percent = computed(
      () => (100 * score.value) / quiz.value.questions.length,
    );
    return {
      quiz,
      attempt,
      remaining,
      allowed,
      valid,
      start,
      answer,
      scored,
      score,
      percent,
      storageWarning,
    };
  },
};
</script>

<template>
  <section class="question">
    <div class="question-tag">Тест</div>
    <h3>{{ quiz.title }}</h3>
    <p>
      Вопросов: {{ quiz.questions.length }} · Попыток:
      {{ quiz.attempts || "без ограничений" }} ·
      {{ quiz.minutes ? quiz.minutes + " мин" : "Без таймера" }} · Для зачёта:
      {{ quiz.threshold }}%
    </p>
    <p v-if="!valid" class="feedback neutral">
      Добавьте хотя бы один вопрос и проверьте варианты ответов.
    </p>
    <template v-if="interactive">
      <p v-if="storageWarning" class="feedback neutral">
        Браузер не может сохранить попытку после закрытия страницы.
      </p>
      <template v-if="attempt.phase === 'running'">
        <p>
          Попытка {{ attempt.number }}
          <strong v-if="attempt.deadline"
            >· Осталось {{ Math.floor(remaining / 60) }}:{{
              String(remaining % 60).padStart(2, "0")
            }}</strong
          >
        </p>
        <fieldset
          v-for="(q, n) in quiz.questions"
          :key="q.id"
          class="quiz-question"
        >
          <legend>{{ n + 1 }}. {{ q.data.question }}</legend>
          <small>{{
            q.type === "single"
              ? "Выберите один ответ"
              : "Выберите все правильные ответы"
          }}</small>
          <label v-for="(o, i) in q.data.options" :key="o.id" class="option"
            ><input
              :type="q.type === 'single' ? 'radio' : 'checkbox'"
              :name="blockId + '-' + n"
              :checked="attempt.answers[n]?.includes(i)"
              @change="answer(n, i, $event.target.checked)"
            />{{ o.text }}</label
          >
        </fieldset>
        <button class="primary" @click="attempt.phase = 'done'">
          Завершить тест
        </button>
      </template>
      <template v-else>
        <div
          v-if="attempt.phase === 'done'"
          class="feedback"
          :class="percent >= quiz.threshold ? 'good' : 'bad'"
          role="status"
        >
          <strong>{{
            percent >= quiz.threshold ? "Тест пройден" : "Тест не пройден"
          }}</strong>
          <p>
            Попытка {{ attempt.number }} · Верно {{ score }} из
            {{ quiz.questions.length }} ({{ Number(percent.toFixed(2)) }}%)
          </p>
          <p v-for="(q, n) in quiz.questions" :key="q.id">
            {{ n + 1 }}. {{ q.data.question }} —
            {{ scored(q, n) ? "верно" : "неверно" }}.
            {{ scored(q, n) ? q.data.explanation : "" }}
          </p>
        </div>
        <button
          v-if="allowed"
          class="primary"
          :disabled="!valid"
          @click="start"
        >
          {{ attempt.number ? "Пройти ещё раз" : "Начать тест" }}
        </button>
        <p v-else>Попытки закончились.</p>
      </template>
    </template>
  </section>
</template>
