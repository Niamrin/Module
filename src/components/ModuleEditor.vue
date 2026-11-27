<script setup>
import { modules } from "./modules/index.js";
import { types } from "../model.js";
defineProps({ block: Object });
defineEmits(["settings", "copy", "delete", "notify"]);
</script>

<template>
  <div class="settings-bar">
    <span class="eyebrow">Настройки модуля</span
    ><button class="small ghost" @click="$emit('settings')">⚙ Курс</button>
  </div>
  <h2 style="margin-top: 8px">{{ types[block.type][0] }}</h2>
  <p class="muted">Изменения автоматически сохраняются в браузере.</p>
  <component
    :is="modules[block.type].editor"
    :data="block.data"
    @notify="$emit('notify', $event)"
  />
  <div class="inspector-foot">
    <button @click="$emit('copy')">⧉ Дублировать</button
    ><button class="danger" @click="$emit('delete')">Удалить</button>
  </div>
</template>
