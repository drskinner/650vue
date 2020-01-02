<template>
  <div>
    <h2>TERMINAL</h2>
    <pre v-html="output"></pre>
    <input id="command" v-model="command" maxlength="40" />
    <button @click="send">SEND</button>
  </div>
</template>

<script>
import store from '@/store/index'
import { mapState } from 'vuex';

export default {
  name: 'Terminal',
  data() {
    return {
      command: '',
      monitor: Array(24).fill('')
    }
  },
  created() {
    this.showRegisters();
  },
  computed: {
    output() {
      return this.monitor.join("\n");
    },
    ...mapState(['isRunning'])
  },
  watch: {
    isRunning: function (newValue, oldValue) {
      if (newValue === false && oldValue === true) {
        this.showRegisters();
      }
    }
  },
  methods: {
    hexByte(value) {
      return value.toString(16).padStart(2, '0');
    },
    hexWord(value) {
      return value.toString(16).padStart(4, '0');
    },
    stringToByte(value) {
      return parseInt(value, 16) & 0xff;
    },
    asciiToChar(value) {
      return (value < 32) ? '.' : String.fromCharCode(value);
    },
    stringToWord(value) {
      return parseInt(value, 16) & 0xffff;
    },
    outputLine(line) {
      this.monitor.shift();
      this.monitor.push(line);
    },
    error() {
      this.outputLine('?');
      return;
    },
    showMemory() {
      // TODO: handle overflow, wrap at MEMTOP
      let parts = this.command.split(' ')

      if (parts.length === 1) {
        this.error();
        return;
      }

      let memoryPager = parseInt(parts[1], 16);
      let top = (parts.length < 3) ? memoryPager + 0x7f : parseInt(parts[2], 16);
      if (top > memoryPager + 0x7f) {
        top = memoryPager + 0x7f;
      }
      while (memoryPager <= top) {
        let line = `> ${this.hexWord(memoryPager)} `
        for (let i = 0; i < 8; i += 1) {
          line += `${this.hexByte(store.state.ram[memoryPager + i])} `;
        }
        for (let i = 0; i < 8; i += 1) {
          line += this.asciiToChar(store.state.ram[memoryPager + i]);
        }
        this.outputLine(line);
        memoryPager += 0x08;
      }
    },
    writeMemory() {
      let parts = this.command.split(' ');
      
      if (parts.length < 3) {
        this.error();
        return;
      }

      let startAddress = parseInt(parts[1], 16);
      if (startAddress < 0x000 || startAddress > 0xffff) {
        this.error();
        return;
      }

      // rewrite with shift or similar? (see Ruby 6502)
      // loop through additional parts
      for (let i = 0; i < (parts.length - 2); i += 1) {
      store.commit('writeRam', { address: startAddress + i, 
                                 value: this.stringToByte(parts[2 + i]) });
      }

      return;
    },
    showRegisters() {
      this.outputLine('   PC  SR AC XR YR SP');

      let registerLine = '; ';
      registerLine += `${this.hexWord(store.state.cpu.pc)} `;
      registerLine += `${this.hexByte(store.state.cpu.sr)} `;
      registerLine += `${this.hexByte(store.state.cpu.ac)} `;
      registerLine += `${this.hexByte(store.state.cpu.xr)} `;
      registerLine += `${this.hexByte(store.state.cpu.yr)} `;
      registerLine += `${this.hexByte(store.state.cpu.sp)} `;
      this.outputLine(registerLine);
    },
    setRegisters() {
      let parts = this.command.split(' ');
    
      if (parts.length != 7) {
        this.error();
        return;
      }

      store.commit('writeRegister', 
                   { register: 'pc', value: this.stringToWord(parts[1]) });
      store.commit('writeRegister', 
                   { register: 'sr', value: this.stringToByte(parts[2]) });
      store.commit('writeRegister', 
                   { register: 'ac', value: this.stringToByte(parts[3]) });
      store.commit('writeRegister', 
                   { register: 'xr', value: this.stringToByte(parts[4]) });
      store.commit('writeRegister', 
                   { register: 'yr', value: this.stringToByte(parts[5]) });
      store.commit('writeRegister', 
                   { register: 'sp', value: this.stringToByte(parts[6]) });                                                         

      this.showRegisters();
      return;
    },
    run() {
      let parts = this.command.split(' ');

      if (!parts[1]) {
        this.error();
        return;
      }

      store.commit('writeRegister',
              { register: 'pc', value: this.stringToWord(parts[1]) });
      store.commit('setIsRunning', true);
    },
    send() {
      this.outputLine(`<span style="color:yellow;">${this.command}</span>`);
      // switch block?
      if (this.command[0] === 'g') {
        this.run();
      } else if (this.command[0] === 'm') {
        this.showMemory();
      } else if (this.command[0] === 'r') {
        this.showRegisters();
      } else if (this.command[0] === '>') {
        this.writeMemory();
      } else if (this.command[0] === ';') {
        this.setRegisters();
      } else {
        this.error();
      }
      this.command = '';
    }
  }
}
</script>

<style scoped>
  div {
    text-align: left;
  }

  pre {
    font-family: monospace, sans-serif;
    font-size: 100%;
    width: 395px;
    padding: 3px 0 0 5px;
    background-color: black;
    color: lime;
  }
</style>
