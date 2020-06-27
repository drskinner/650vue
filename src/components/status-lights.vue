<template>
  <div class="status-panel">
    <img class="flags" src="@/assets/status_flags.png">
    <span v-for="n in 8" :key="n" class="light-box">
      <img class="light" :src="require(`@/assets/led_${bits[n - 1]}.png`)">
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['cpu']),
    bits() {
      return this.cpu.sr.toString(2).padStart(8, '0');
    },
  }
}
</script>

<style scoped>
.status-panel {
  width: 488px;
  margin: auto;
  background-color: #241f21;
}

.flags {
  width: 100%;
  height: 24px;
}

.light-box {
  width: 12.5%;
  display: inline-block;
}

.light {
  width: 45px;
  height: 48px;
}
</style>
