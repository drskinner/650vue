<template>
  <div class="status-panel">
    <img class="flags" src="@/assets/status_flags.png">
    <img class="light" :src="require(`@/assets/led_${bits[0]}.png`)">
    <img class="light" :src="require(`@/assets/led_${bits[1]}.png`)">
    <img class="light" :src="require(`@/assets/led_${bits[2]}.png`)">
    <img class="light" :src="require(`@/assets/led_${bits[3]}.png`)">
    <img class="light" :src="require(`@/assets/led_${bits[4]}.png`)">
    <img class="light" :src="require(`@/assets/led_${bits[5]}.png`)">
    <img class="light" :src="require(`@/assets/led_${bits[6]}.png`)">
    <img class="light" :src="require(`@/assets/led_${bits[7]}.png`)">
  </div>
</template>

<script>
export default {
  computed: {
    bits() {
      return this.$store.state.cpu.sr.toString(2).padStart(8, '0');
    },
  }
}
</script>

<style scoped>
  div {
    width: 480px;
    margin: auto;
    background-color: #241f21;
  }

  span {
    width: 12.5%;
    display: inline-block;
  }

  img.flags {
    width: 100%;
  }

  img.light {
    width: 12.5%;
  }
</style>