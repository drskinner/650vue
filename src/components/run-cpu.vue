<template>
  <div>
    Cycles: {{ cycles }}
    <!-- TODO: Contextually disable buttons -->
    <button @click="run">RUN</button>
    <button @click="step">STEP</button>
    <button @click="stop">STOP</button>
  </div>
</template>

<script>
//import store from '@/store/index'

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
      this.$store.commit('incrementPc');
      this.cycles++;
    },
    stop() {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
</script>