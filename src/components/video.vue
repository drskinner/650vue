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
    output() {
            console.log(this.display);
      return this.display.join("\n");

    },
    ...mapState(['videoChecksum'])
  },
  watch: {
    videoChecksum: function (newValue, oldValue) {
      console.log(newValue, oldValue);
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
      for (let i = 0; i < 16; i += 1) {
        let line = '';
        for (let j = 0; j < 40; j += 1) {
          line += this.asciiToChar(store.state.ram[0x1000 + (i * 40) + j]);
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
    text-align: left;
    padding-bottom: 0;
  }

  pre {
    font-family: monospace, sans-serif;
    font-size: 100%;
    width: 390px;
    padding: 3px 0 0 5px;
    background-color: black;
    color: lime;
  }
  </style>