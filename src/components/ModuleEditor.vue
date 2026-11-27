<script>
import { computed } from "vue";
import { uid, make, types, safeMedia, questionErrors } from "../model.js";
import Field from "./Field.vue";
import RichField from "./RichField.vue";
import MediaField from "./MediaField.vue";
import SubCard from "./SubCard.vue";
export default {
  components: { Field, RichField, MediaField, SubCard },
  props: ["block"],
  emits: ["settings", "copy", "delete", "notify"],
  setup(props) {
    const d = computed(() => props.block.data);
    function addPoint(e) {
      let x = 50,
        y = 50;
      if (e) {
        const r = e.currentTarget.getBoundingClientRect();
        x = Math.round(((e.clientX - r.left) / r.width) * 100);
        y = Math.round(((e.clientY - r.top) / r.height) * 100);
      }
      d.value.points.push({ id: uid(), x, y, title: "Новая точка", body: "" });
    }
    function setCorrect(q, o) {
      if (q.type === "single")
        q.data.options.forEach((v) => (v.correct = v.id === o.id));
      else o.correct = !o.correct;
    }
    return {
      d,
      make,
      types,
      safeMedia,
      questionErrors,
      addPoint,
      setCorrect,
      uid,
    };
  },
};
</script>

<template>
  <div class="settings-bar">
    <span class="eyebrow">Настройки модуля</span
    ><button class="small ghost" @click="$emit('settings')">⚙ Курс</button>
  </div>
  <h2 style="margin-top: 8px">{{ types[block.type][0] }}</h2>
  <p class="muted">Изменения автоматически сохраняются в браузере.</p>
  <RichField v-if="block.type === 'text'" label="Содержимое" v-model="d.body" />
  <template v-else-if="block.type === 'image'"
    ><MediaField v-model="d.src" @notify="$emit('notify', $event)" /><Field
      label="Альтернативный текст"
      v-model="d.alt" /><Field label="Подпись" v-model="d.caption" /><Field
      label="Ширина изображения, %"
      kind="number"
      :min="25"
      :max="100"
      v-model="d.width"
  /></template>
  <template v-else-if="block.type === 'carousel'"
    ><SubCard
      v-for="(s, i) in d.slides"
      :key="i"
      :title="'Слайд ' + (i + 1)"
      @remove="d.slides.splice(i, 1)"
      ><MediaField v-model="s.src" @notify="$emit('notify', $event)" /><Field
        label="Подпись"
        v-model="s.caption" /><Field
        label="Альтернативный текст"
        v-model="s.alt" /></SubCard
    ><button
      class="wide"
      @click="d.slides.push({ src: '', caption: '', alt: '' })"
    >
      ＋ Добавить слайд
    </button></template
  >
  <template v-else-if="block.type === 'mapping'"
    ><MediaField v-model="d.src" @notify="$emit('notify', $event)" /><Field
      label="Альтернативный текст"
      v-model="d.alt"
    /><Field label="Подпись" v-model="d.caption" />
    <div v-if="safeMedia(d.src)" class="field">
      <div class="field-label">Кликните по картинке для добавления точки</div>
      <div class="mapbox clickmap" @click="addPoint($event)">
        <img :src="safeMedia(d.src)" alt="Карта точек" /><span
          v-for="(p, i) in d.points"
          :key="p.id"
          class="hotspot"
          :style="{ left: p.x + '%', top: p.y + '%' }"
          >{{ i + 1 }}</span
        >
      </div>
    </div>
    <SubCard
      v-for="(p, i) in d.points"
      :key="p.id"
      :title="'Точка ' + (i + 1)"
      @remove="d.points.splice(i, 1)"
      ><Field label="Название" v-model="p.title" /><RichField
        label="Пояснение"
        v-model="p.body" />
      <div class="row">
        <Field label="X, %" kind="number" v-model="p.x" /><Field
          label="Y, %"
          kind="number"
          v-model="p.y"
        /></div></SubCard
    ><button class="wide" @click="addPoint()">
      ＋ Добавить точку
    </button></template
  >
  <template v-else-if="block.type === 'list'"
    ><label class="checkline"
      ><input type="checkbox" v-model="d.ordered" />Нумерованный список</label
    ><SubCard
      v-for="(_, i) in d.items"
      :key="i"
      :title="'Пункт ' + (i + 1)"
      @remove="d.items.splice(i, 1)"
      ><Field label="Текст" kind="textarea" v-model="d.items[i]" /></SubCard
    ><button class="wide" @click="d.items.push('Новый пункт')">
      ＋ Добавить пункт
    </button></template
  >
  <template v-else-if="block.type === 'tabs'"
    ><SubCard
      v-for="(t, i) in d.tabs"
      :key="i"
      :title="'Вкладка ' + (i + 1)"
      @remove="d.tabs.splice(i, 1)"
      ><Field label="Название" v-model="t.title" /><RichField
        label="Содержимое"
        v-model="t.body" /></SubCard
    ><button
      class="wide"
      @click="d.tabs.push({ title: 'Новая вкладка', body: '' })"
    >
      ＋ Добавить вкладку
    </button></template
  >
  <template v-else-if="block.type === 'video'"
    ><MediaField
      kind="video"
      v-model="d.src"
      @notify="$emit('notify', $event)" /><Field
      label="Подпись"
      v-model="d.caption"
  /></template>
  <template v-else-if="block.type === 'spoiler'"
    ><Field label="Заголовок" v-model="d.title" /><RichField
      label="Скрытый текст"
      v-model="d.body"
    /><label class="checkline"
      ><input type="checkbox" v-model="d.open" />Раскрыт по умолчанию</label
    ></template
  >
  <template v-else-if="block.type === 'quiz'">
    <Field label="Название теста" v-model="d.title" />
    <Field
      label="Число попыток (0 — без ограничений)"
      kind="number"
      :max="9999"
      v-model="d.attempts"
    />
    <Field
      label="Время в минутах (0 — без таймера)"
      kind="number"
      :max="9999"
      v-model="d.minutes"
    />
    <Field
      label="Проходной балл, %"
      kind="number"
      :max="100"
      v-model="d.threshold"
    />
    <SubCard
      v-for="(q, n) in d.questions"
      :key="q.id"
      :title="'Вопрос ' + (n + 1)"
      @remove="d.questions.splice(n, 1)"
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
    ><button class="wide" @click="d.questions.push(make('single'))">
      ＋ Добавить вопрос
    </button></template
  >
  <div class="inspector-foot">
    <button @click="$emit('copy')">⧉ Дублировать</button
    ><button class="danger" @click="$emit('delete')">Удалить</button>
  </div>
</template>
