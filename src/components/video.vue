<template>
  <div class="video-container">
    <pre class="video-content" v-html="display"></pre>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Video',
  data() {
    return {
      display: []
    }
  },
  computed: {
    ...mapState(['isRunning', 'ram', 'videoFrame'])
  },
  watch: {
    videoFrame: function (newValue, oldValue) {
      // Only update every other frame when running. (30Hz)
      // If we're not running, we don't care what frame we're on.
      if ((newValue != oldValue && newValue % 2) || this.isRunning) {
        this.refresh();
      }
    }
  },
  created() {
    this.refresh();
  },
  methods: {
    asciiToChar(value) {
      if (value == 0x3c) {
        return '&lt;'; // need to escape this character!
      } else {
        return (value < 32) ? ' ' : String.fromCharCode(value);
      }
    },
    refresh() {
      let lines = [];
      for (let i = 0; i < 20; i += 1) {
        let line = '';
        for (let j = 0; j < 50; j += 1) {
          line += this.asciiToChar(this.ram[0x1000 + (i * 50) + j]);
        }
        lines.push(line);
      }
      this.display = lines.join("\n");
    }
  }
}
</script>

<style scoped>
.video-container {
  margin-top: 10px;
  padding: 5px 0 5px 0;
}

.video-content {
  margin: auto;
  text-align: left;
  font-family: monospace, sans-serif;
  line-height: 1;
  font-size: 100%;
  width: 480px;
  padding: 3px 4px 0 4px;
  background-color: black;
  color: lime;
}
</style>