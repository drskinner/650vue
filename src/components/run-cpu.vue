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
import { mapState, mapGetters, mapActions } from 'vuex';
import { execute } from "@/mixins/execute.js";

export default {
  mixins: [execute],
  data() {
    return {
      runCycles: 0,
      penaltyCycles: 0,
      irq: false,
      nmi: false,
      requestReference: null
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
    ...mapActions(['refreshVideo', 'resetCpu']),
    run() {
      this.runCycles = 0;
      this.irq = false;
      this.nmi = false;
      store.commit('setIsRunning', true);

      this.tick();
    },
    stop() {
      store.commit('setIsRunning', false);
      this.nmi = true;
      this.refreshVideo();
    },
    reset() {
      this.runCycles = 0;
      this.resetCpu();
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
