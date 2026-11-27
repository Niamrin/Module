<script>
import QuizView from "./QuizView.vue";
import { computed, ref, watch } from "vue";
import { inline, rich, safeMedia, embed } from "../model.js";
import MediaImage from "./MediaImage.vue";
export default {
  components: { MediaImage, QuizView },
  props: { block: Object, interactive: Boolean, student: Boolean },
  setup(props) {
    const d = computed(() => props.block.data),
      index = ref(0),
      point = ref(null);
    const slide = computed(
      () =>
        d.value.slides?.[
          Math.min(index.value, Math.max(0, d.value.slides.length - 1))
        ],
    );
    const tabIndex = computed(() =>
      Math.min(index.value, Math.max(0, (d.value.tabs?.length || 1) - 1)),
    );
    const activePoint = computed(() =>
      d.value.points?.find((p) => p.id === point.value),
    );
    watch(
      () => props.block.data,
      () => {
        index.value = 0;
        point.value = null;
      },
      { deep: true },
    );
    return {
      d,
      index,
      point,
      slide,
      tabIndex,
      activePoint,
      inline,
      rich,
      safeMedia,
      embed,
    };
  },
};
</script>

<template>
  <div v-if="block.type === 'text'" v-html="rich(d.body)"></div>
  <figure v-else-if="block.type === 'image'">
    <div class="media-wrap" :style="{ width: d.width + '%', margin: 'auto' }">
      <MediaImage :src="d.src" :alt="d.alt" />
    </div>
    <div v-if="d.caption" class="caption">{{ d.caption }}</div>
  </figure>
  <figure v-else-if="block.type === 'carousel'">
    <template v-if="slide"
      ><div class="media-wrap">
        <MediaImage :src="slide.src" :alt="slide.alt" />
      </div>
      <div v-if="slide.caption" class="caption">{{ slide.caption }}</div>
      <div class="carousel-controls">
        <button
          class="icon"
          aria-label="Предыдущий слайд"
          :disabled="index === 0"
          @click="index--"
        >
          ‹
        </button>
        <div class="dots">
          <button
            v-for="(_, i) in d.slides"
            :key="i"
            class="dot"
            :class="{ active: index === i }"
            :aria-label="'Слайд ' + (i + 1)"
            @click="index = i"
          ></button>
        </div>
        <span class="muted">{{ index + 1 }} / {{ d.slides.length }}</span
        ><button
          class="icon"
          aria-label="Следующий слайд"
          :disabled="index >= d.slides.length - 1"
          @click="index++"
        >
          ›
        </button>
      </div></template
    >
    <div v-else class="placeholder">Добавьте слайды</div>
  </figure>
  <figure v-else-if="block.type === 'mapping'">
    <div class="media-wrap">
      <div v-if="safeMedia(d.src)" class="mapbox">
        <img :src="safeMedia(d.src)" :alt="d.alt" /><button
          v-for="(p, i) in d.points"
          :key="p.id"
          class="hotspot"
          :class="{ active: point === p.id }"
          :style="{ left: p.x + '%', top: p.y + '%' }"
          :aria-label="p.title || 'Точка ' + (i + 1)"
          @click="point = point === p.id ? null : p.id"
        >
          {{ i + 1 }}
        </button>
      </div>
      <div v-else class="placeholder">Добавьте изображение</div>
    </div>
    <div v-if="d.caption" class="caption">{{ d.caption }}</div>
    <div v-if="activePoint" class="map-detail">
      <strong>{{ activePoint.title }}</strong>
      <div v-html="rich(activePoint.body)"></div>
    </div>
  </figure>
  <div v-else-if="block.type === 'list'" class="rich">
    <component :is="d.ordered ? 'ol' : 'ul'"
      ><li v-for="(item, i) in d.items" :key="i" v-html="inline(item)"></li
    ></component>
  </div>
  <div v-else-if="block.type === 'tabs'">
    <template v-if="d.tabs.length"
      ><div class="tabs" role="tablist">
        <button
          v-for="(t, i) in d.tabs"
          :key="i"
          role="tab"
          :aria-selected="tabIndex === i"
          :class="{ active: tabIndex === i }"
          @click="index = i"
        >
          {{ t.title || "Вкладка " + (i + 1) }}
        </button>
      </div>
      <div role="tabpanel" v-html="rich(d.tabs[tabIndex].body)"></div
    ></template>
    <div v-else class="placeholder">Добавьте вкладки</div>
  </div>
  <figure v-else-if="block.type === 'video'">
    <div v-if="!safeMedia(d.src, 'video')" class="placeholder">
      Видео пока не добавлено
    </div>
    <div v-else-if="!interactive" class="placeholder">
      Видео — откройте предпросмотр
    </div>
    <iframe
      v-else-if="embed(d.src)"
      class="video"
      :src="embed(d.src)"
      title="Учебное видео"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe
    ><video
      v-else
      class="video"
      controls
      preload="metadata"
      :src="safeMedia(d.src, 'video')"
    ></video>
    <div v-if="d.caption" class="caption">{{ d.caption }}</div>
  </figure>
  <details v-else-if="block.type === 'spoiler'" class="spoiler" :open="d.open">
    <summary>{{ d.title || "Примечание" }}</summary>
    <div v-html="rich(d.body)"></div>
  </details>
  <QuizView
    v-else-if="block.type === 'quiz'"
    :block="block"
    :interactive="interactive"
    :student="student"
  />
</template>
