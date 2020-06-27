<template>
  <div>
    Cycles: {{ runCycles }}
    <!-- TODO: Contextually disable buttons -->
    <button class="control-button" @click="run">RUN</button>
    <button class="control-button" @click="step">STEP</button>
    <button class="control-button" @click="stop">STOP</button>
    <button class="control-button" @click="reset">RESET</button>
    Running: {{ this.isRunning }}
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
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
  computed: {
    ...mapState(['cpu', 'isRunning', 'ram']),
    ...mapGetters(['flagStatus'])
  },
  watch: {
    isRunning: function (newValue, oldValue) {
      if (newValue === true && oldValue === false) {
        this.run();
      }
    }
  },
  methods: {
    ...mapActions(['refreshVideo', 'resetCpu']),
    ...mapMutations(['setIsRunning']),
    run() {
      this.runCycles = 0;
      this.irq = false;
      this.nmi = false;
      this.setIsRunning(true);

      this.tick();
    },
    stop() {
      this.setIsRunning(false);
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
.control-button {
  border: none;
  background: url('../assets/button.png') no-repeat top left;
  width: 58px;
  height: 58px;
  font-weight: bold;
}
</style>
