<script setup>
import SubCard from "../../SubCard.vue";
import Field from "../../Field.vue";
import { make, uid, questionErrors } from "../../../model.js";
defineProps({ data: Object });
defineEmits(["notify"]);
function setCorrect(q, o) {
  if (q.type === "single")
    q.data.options.forEach((v) => (v.correct = v.id === o.id));
  else o.correct = !o.correct;
}
</script>

<template>
  <Field label="Название теста" v-model="data.title" />
  <Field
    label="Число попыток (0 — без ограничений)"
    kind="number"
    :max="9999"
    v-model="data.attempts"
  />
  <Field
    label="Время в минутах (0 — без таймера)"
    kind="number"
    :max="9999"
    v-model="data.minutes"
  />
  <Field
    label="Проходной балл, %"
    kind="number"
    :max="100"
    v-model="data.threshold"
  />
  <SubCard
    v-for="(q, n) in data.questions"
    :key="q.id"
    :title="'Вопрос ' + (n + 1)"
    @remove="data.questions.splice(n, 1)"
  >
    <label class="field"
      >Вид вопроса<select
        v-model="q.type"
        @change="
          q.type === 'single' &&
          q.data.options.forEach((o, i) => (o.correct = i === 0))
        "
      >
        <option value="single">Один ответ</option>
        <option value="multiple">Несколько ответов</option>
      </select></label
    >
    <Field label="Вопрос" kind="textarea" v-model="q.data.question" /><SubCard
      v-for="(o, i) in q.data.options"
      :key="o.id"
      :title="'Вариант ' + (i + 1)"
      @remove="q.data.options.splice(i, 1)"
      ><Field label="Текст" v-model="o.text" /><label class="checkline"
        ><input
          :type="q.type === 'single' ? 'radio' : 'checkbox'"
          :name="q.id"
          :checked="o.correct"
          @change="setCorrect(q, o)"
        />Правильный ответ</label
      ></SubCard
    ><button
      class="wide"
      @click="
        q.data.options.push({
          id: uid(),
          text: 'Новый вариант',
          correct: false,
        })
      "
    >
      ＋ Добавить вариант</button
    ><Field
      label="Пояснение после верного ответа"
      kind="textarea"
      v-model="q.data.explanation"
    />
    <div class="feedback" :class="questionErrors(q).length ? 'bad' : 'good'">
      {{ questionErrors(q).join(" ") || "Вопрос настроен корректно." }}
    </div> </SubCard
  ><button class="wide" @click="data.questions.push(make('single'))">
    ＋ Добавить вопрос
  </button>
</template>
