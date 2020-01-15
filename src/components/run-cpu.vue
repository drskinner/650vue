<template>
  <div>
    Cycles: {{ runCycles }}
    <!-- TODO: Contextually disable buttons -->
    <button @click="run">RUN</button>
    <button @click="step">STEP</button>
    <button @click="stop">STOP</button>
    <button @click="reset">RESET</button>
    Running: {{ this.isRunning }}
  </div>
</template>

<script>
import store from '@/store/index'
import { mapState, mapGetters } from 'vuex';
import { execute } from "@/mixins/execute.js";

export default {
  mixins: [execute],
  data() {
    return {
      runCycles: 0,
      penaltyCycles: 0,
      timer: null,
      irq: false,
      nmi: false
    }
  },
  watch: {
    isRunning: function (newValue, oldValue) {
      if (newValue === true && oldValue === false) {
        this.run();
      }
    }
  },
  computed: {
    ...mapState(['isRunning', 'cpu', 'ram']),
    ...mapGetters(['flagStatus'])
  },
  methods: {
    run() {
      this.runCycles = 0;
      this.irq = false;
      this.nmi = false;
      store.commit('setIsRunning', true);
      if (!this.timer) {
        this.timer = setInterval(() => this.tick(), 10);
      }
    },
    stop() {
      store.commit('setIsRunning', false);
      clearInterval(this.timer);
      this.timer = null;
      store.dispatch('refreshVideo');
    },
    reset() {
      this.runCycles = 0;
      store.dispatch('resetCpu');
    }
  }
}
</script>

<style scoped>
button {
  border: none;
  background: url('../assets/button.png') no-repeat top left;
  width: 58px;
  height: 58px;
  font-weight: bold;
}
</style>
