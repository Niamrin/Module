<script>
export default { props: ["title"], emits: ["remove"] };
</script>

<template>
  <div class="subcard">
    <div class="subhead">
      <span>{{ title }}</span
      ><button class="small danger" @click="$emit('remove')">Удалить</button>
    </div>
    <slot />
  </div>
</template>
