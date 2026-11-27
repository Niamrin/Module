<script>
export default {
  props: {
    label: String,
    modelValue: [String, Number],
    kind: { type: String, default: "text" },
    min: Number,
    max: Number,
  },
  emits: ["update:modelValue"],
};
</script>

<template>
  <label class="field"
    ><span class="field-label">{{ label }}</span
    ><textarea
      v-if="kind === 'textarea'"
      :value="modelValue"
      rows="4"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea
    ><input
      v-else
      :type="kind"
      :min="min"
      :max="max"
      :value="modelValue"
      @input="
        $emit(
          'update:modelValue',
          kind === 'number'
            ? Math.max(
                min ?? 0,
                Math.min(max ?? 100, Number($event.target.value) || 0),
              )
            : $event.target.value,
        )
      "
  /></label>
</template>
