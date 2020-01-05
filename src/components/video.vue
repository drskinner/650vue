<template>
  <div>
    <pre v-html="display"></pre>
  </div>
</template>

<script>
import store from '@/store/index'
import { mapState } from 'vuex';

export default {
  name: 'Video',
  data() {
    return {
      display: []
    }
  },
  created() {
    this.refresh();
  },
  computed: {
    output() { // No longer used
      return this.display.join("\n");

    },
    ...mapState(['videoChecksum'])
  },
  watch: {
    videoChecksum: function (newValue, oldValue) {
      if (newValue != oldValue) {
        this.refresh();
      }
    }
  },
  methods: {
    asciiToChar(value) {
      return (value < 32) ? ' ' : String.fromCharCode(value);
    },
    refresh() {
      let lines = [];
      for (let i = 0; i < 20; i += 1) {
        let line = '';
        for (let j = 0; j < 50; j += 1) {
          line += this.asciiToChar(store.state.ram[0x1000 + (i * 50) + j]);
        }
        lines.push(line);
      }
      this.display = lines.join("\n");
    }
  }
}
</script>

<style scoped>
  div {
    margin-top: 10px;
    padding: 5px 0 5px 0;
  }

  pre {
    margin: auto;
    text-align: left;
    font-family: monospace, sans-serif;
    font-size: 100%;
    width: 480px;
    padding: 3px 4px 0 4px;
    background-color: black;
    color: lime;
  }
  </style>