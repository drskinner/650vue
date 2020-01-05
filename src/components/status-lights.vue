<template>
  <div class="status-panel">
    <img class="flags" src="@/assets/status_flags.png">
    <span class="light-box">
      <img class="light" :src="require(`@/assets/led_${bits[0]}.png`)">
    </span>
    <span class="light-box">
      <img class="light" :src="require(`@/assets/led_${bits[1]}.png`)">
    </span>
    <span class="light-box">
      <img class="light" :src="require(`@/assets/led_${bits[2]}.png`)">
    </span>
    <span class="light-box">
      <img class="light" :src="require(`@/assets/led_${bits[3]}.png`)">
    </span>
    <span class="light-box">
      <img class="light" :src="require(`@/assets/led_${bits[4]}.png`)">
    </span>
    <span class="light-box">
      <img class="light" :src="require(`@/assets/led_${bits[5]}.png`)">
    </span>
    <span class="light-box">
      <img class="light" :src="require(`@/assets/led_${bits[6]}.png`)">
    </span>
    <span class="light-box">
      <img class="light" :src="require(`@/assets/led_${bits[7]}.png`)">
    </span>
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
    width: 488px;
    margin: auto;
    background-color: #241f21;
  }

  img.flags {
    width: 100%;
    height: 24px;
  }

  span.light-box {
    width: 12.5%;
    display: inline-block;
  }

  img.light {
    width: 45px;
    height: 48px;
  }
</style>
