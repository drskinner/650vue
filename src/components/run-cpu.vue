<template>
  <div>
    <h2>CONTROL</h2>
    Cycles: {{ cycles }}
    <!-- TODO: Contextually disable buttons -->
    <button @click="run">RUN</button>
    <button @click="step">STEP</button>
    <button @click="stop">STOP</button>
    <button @click="reset">RESET</button>
    Running: {{ this.$store.state.isRunning }}
  </div>
</template>

<script>
import store from '@/store/index'
import { mapState } from 'vuex';

export default {
  data() {
    return {
      cycles: 0,
      timer: null,
      // running: false
    }
  },
  watch: {
    isRunning: function (newValue, oldValue) {
      if (newValue === true && oldValue === false) {
        this.run();
      }
    }
  },
  computed: mapState(['isRunning']),
  methods: {
    run() {
      store.commit('setIsRunning', true);
      if (!this.timer) {
        this.timer = setInterval(() => this.step(), 10);
      }
    },
    step() {
      store.commit('incrementPc');
      this.cycles++;
    },
    stop() {
      store.commit('setIsRunning', false);
      clearInterval(this.timer);
      this.timer = null;
    },
    reset() {
      store.dispatch('resetCpu');
    }
  }
}
</script>