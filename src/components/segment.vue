<template>
  <span>
    <span v-if="this.size === 'word'">
      <img class="digit" :src="require(`@/assets/digit_${hex[0]}.png`)">
      <img class="digit" :src="require(`@/assets/digit_${hex[1]}.png`)">
    </span>
    <span>
      <img class="digit" :src="require(`@/assets/digit_${hex[2]}.png`)">
      <img class="digit" :src="require(`@/assets/digit_${hex[3]}.png`)">
    </span>
  </span>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0
    },
    size: {
      type: String,
      default: 'byte'
    }
  },
  computed: {
    hex() {
      return this.value.toString(16).padStart(4, '0');
    }
  }
}
</script>

<style scoped>
.digit {
  height: 76px;
}
</style>