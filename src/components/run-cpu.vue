<template>
  <div>
    <h2>CONTROL</h2>
    Cycles: {{ cycles }}
    <!-- TODO: Contextually disable buttons -->
    <button @click="run">RUN</button>
    <button @click="step">STEP</button>
    <button @click="stop">STOP</button>
    <button @click="reset">RESET</button>
  </div>
</template>

<script>
import store from '@/store/index'

export default {
  data() {
    return {
      cycles: 0,
      timer: null
    }
  },
  methods: {
    run() {
      if (!this.timer) {
        this.timer = setInterval(() => this.step(), 10);
      }
    },
    step() {
      store.commit('incrementPc');
      this.cycles++;
    },
    stop() {
      clearInterval(this.timer);
      this.timer = null;
    },
    reset() {
      store.dispatch('resetCpu');
    }
  }
}
</script>