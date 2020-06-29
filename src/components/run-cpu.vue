<template>
  <div>
    Running: {{ this.isRunning }}
    <!-- TODO: Contextually disable buttons -->
    <button class="control-button" @click="run">RUN</button>
    <button class="control-button" @click="step">STEP</button>
    <button class="control-button" @click="stop">STOP</button>
    <button class="control-button" @click="reset">RESET</button>
    <input ref="keyboard" class="keyboard" maxlength="0" v-on:keydown="keyMonitor">
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import { execute } from "@/mixins/execute.js";

export default {
  mixins: [execute],
  data() {
    return {
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
    ...mapActions(['processKey', 'refreshVideo', 'resetCpu']),
    ...mapMutations(['setIsRunning']),
    run() {
      this.irq = false;
      this.nmi = false;
      this.setIsRunning(true);
      this.$refs.keyboard.focus();

      this.tick();
    },
    stop() {
      this.setIsRunning(false);
      this.nmi = true;
      this.refreshVideo();
    },
    reset() {
      this.resetCpu();
    },
    keyMonitor: function(event) {
      this.processKey(event.key);
    }
  }
}
</script>

<style scoped>
.control-button {
  border: none;
  background: url('~@/assets/button.png') no-repeat top left;
  width: 58px;
  height: 58px;
  font-weight: bold;
}

.keyboard {
  border: none;
  cursor: none;
  background: url('~@/assets/keyboard.png') no-repeat top center;
  width: 58px;
  height: 58px;
  margin-left: 29px;
}

.keyboard:focus {
  cursor: none;
  color: transparent;
  background: url('~@/assets/keyboard_focus.png') no-repeat top center;
}
</style>
