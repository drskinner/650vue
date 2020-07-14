<template>
  <div>
    <pre v-html="output"></pre>
    <input ref="inputLine" id="command" :class="active" maxlength="40" v-model="command" v-on:keyup.enter="send" />
  </div>
</template>

<script>
import axios from 'axios';
import { assembler } from "@/mixins/assembler.js";
import { disassembler } from "@/mixins/disassembler.js";
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  name: 'Terminal',
  mixins: [assembler, disassembler],
  data() {
    return {
      command: '',
      memoryPager: 0x0000,
      monitor: Array(20).fill(''),
      labels: []
    }
  },
  computed: {
    ...mapState(['cpu', 'isRunning', 'ram']),
    output() {
      return this.monitor.join("\n");
    },
    active() {
      return this.isRunning ? 'inactive' : 'active';
    }
  },
  watch: {
    isRunning: function (newValue, oldValue) {
      if (newValue === false && oldValue === true) {
        this.showRegisters();
        this.$refs.inputLine.focus();
      }
    }
  },
  created() {
    this.outputLine('   Vuepermon Machine-Language Monitor');
    this.outputLine(' Inspired by Jim Butterfield\'s Supermon');
    this.outputLine('');
    this.showRegisters();
  },
  methods: {
    ...mapActions(['refreshVideo', 'resetCpu']),
    ...mapMutations(['setIsRunning', 'writeRam', 'writeRegister']),
    hexByte(value) {
      return value.toString(16).padStart(2, '0');
    },
    hexWord(value) {
      return value.toString(16).padStart(4, '0');
    },
    stringToByte(value) {
      return parseInt(value, 16) & 0xff;
    },
    stringToWord(value) {
      return parseInt(value, 16) & 0xffff;
    },
    asciiToChar(value) {
      return (value < 32) ? '.' : String.fromCharCode(value);
    },
    byteToSignedInt(signedByte) {
      return (signedByte & 0x80) ? -((signedByte ^ 0xff) + 1) : signedByte;
    },
    signedIntToByte(signedInt) {
      return (signedInt >= 0) ? signedInt : (0x100 + signedInt);
    },
    outputLine(line) {
      this.monitor.shift();
      this.monitor.push(line);
    },
    error() {
      this.outputLine('?');
    },
    clearScreen() {
      for (let i = 0x1000; i < 0x13e8; i += 1) {
        this.writeRam({ address: i, value: 0 });
      }

      // using mapAction allows us to replace this.$store.dispatch('refreshVideo')
      // with a simple function call:
      this.refreshVideo();
    },
    showMemory() {
      // TODO: handle overflow, wrap at MEMTOP
      let parts = this.command.split(' ')

      if (parts.length > 1) {
        this.memoryPager = parseInt(parts[1], 16);
      }

      let top = (parts.length < 3) ? this.memoryPager + 0x7f : parseInt(parts[2], 16);
      if (top > this.memoryPager + 0x7f) {
        top = this.memoryPager + 0x7f;
      }
      while (this.memoryPager <= top) {
        let line = `> ${this.hexWord(this.memoryPager)} `
        for (let i = 0; i < 8; i += 1) {
          line += `${this.hexByte(this.ram[this.memoryPager + i])} `;
        }
        for (let i = 0; i < 8; i += 1) {
          line += this.asciiToChar(this.ram[this.memoryPager + i]);
        }
        this.outputLine(line);
        this.memoryPager += 0x08;
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
        this.writeRam({ address: startAddress + i,
                        value: this.stringToByte(parts[2 + i]) });
      }

      this.refreshVideo();
    },
    showRegisters() {
      this.outputLine('   PC  SR AC XR YR SP');

      let registerLine = '; ';
      registerLine += `${this.hexWord(this.cpu.pc)} `;
      registerLine += `${this.hexByte(this.cpu.sr)} `;
      registerLine += `${this.hexByte(this.cpu.ac)} `;
      registerLine += `${this.hexByte(this.cpu.xr)} `;
      registerLine += `${this.hexByte(this.cpu.yr)} `;
      registerLine += `${this.hexByte(this.cpu.sp)} `;
      this.outputLine(registerLine);
    },
    setRegisters() {
      let parts = this.command.split(' ');
    
      if (parts.length != 7) {
        this.error();
        return;
      }

      this.writeRegister({ register: 'pc', value: this.stringToWord(parts[1]) });
      this.writeRegister({ register: 'sr', value: this.stringToByte(parts[2]) });
      this.writeRegister({ register: 'ac', value: this.stringToByte(parts[3]) });
      this.writeRegister({ register: 'xr', value: this.stringToByte(parts[4]) });
      this.writeRegister({ register: 'yr', value: this.stringToByte(parts[5]) });
      this.writeRegister({ register: 'sp', value: this.stringToByte(parts[6]) });                                                         

      this.showRegisters();
    },
    setPc() {
      let parts = this.command.split(' ');

      if (parts.length < 2) {
        this.error();
        return;
      }

      this.writeRegister({ register: 'pc', value: this.stringToWord(parts[1]) });
    },
    async directory() {
      // TODO: this will eventually require pagination
      try {
        const response = await axios.get(`disk/directory.txt`);

        response.data.split("\n").forEach(line => {
          if (line.length === 0) {
            return;
          }
          this.outputLine(line);
        });
      } catch(ex) {
        let error = 'Directory not found.';
        this.outputLine(`<span style="color:orange;">Error:</span> ${error}`);
      } finally {
        this.outputLine(' ');
        this.showRegisters();
      }
    },
    parseFileInputLine(line) {
      let parts = [];
      let key = '';

      switch(line[0]) {
        case '>':
          this.command = line;
          this.writeMemory();
          break;
        case '.':
          if (line.includes('*')) {
            for (key in this.labels) {
              line = line.replace(key, this.labels[key]);
            }
          }
          this.command = line;
          this.assemble();
          break;
        case ';':
          break;
        case '*':
          parts = line.split(' ');

          if (parts.length < 3) {
            this.outputLine(`<span style="color:orange;">Bad Label:</span> ${line}`);
            return;
          }

          this.labels[parts[0]] = parts[2];
          break;
        default:
          this.outputLine(line);
          break;
      }
    },
    async load() {
      try {
        let parts = this.command.split(' ');
        const response = await axios.get(`disk/${parts[1]}.txt`);
        this.labels = [];

        response.data.split("\n").forEach(line => {
          if (line.length === 0) {
            return;
          }
          this.parseFileInputLine(line);
        });
      } catch(ex) {
        let error = 'File not found.';
        this.outputLine(`<span style="color:orange;">Error:</span> ${error}`);
        this.outputLine(ex);
      } finally {
        this.command = '';
        this.resetCpu();
        this.showRegisters();
      }
    },
    run() {
      let parts = this.command.split(' ');

      if (parts[1]) {
        this.writeRegister({ register: 'pc', value: this.stringToWord(parts[1]) });
      }

      this.setIsRunning(true);
    },
    send() {
      if (this.isRunning) {
        return;
      }

      if (this.command[0] != '.') {
        this.outputLine(`<span style="color:yellow;">${this.command}</span>`);
      }

      switch (this.command[0]) {
        case 'd':
          this.disassemble();
          break;
        case 'g':
          this.run();
          break;
        case 'l':
          this.clearScreen();
          this.load();
          break;
        case 'm':
          this.showMemory();
          break;
        case 'p':
          this.setPc();
          break;
        case 'r':
          this.showRegisters();
            break;
        case 'z':
          this.clearScreen();
          break;
        case '$':
          this.directory();
          break;
        case '>':
          this.writeMemory();
          break;
        case ';':
          this.setRegisters();
          break;
        case '.':
          this.assemble();
          break;
        default:
          this.error();
      }

      if (this.command[0] === '.' && this.command.length >= 8) {
        this.disassemble(1); // disassemble() advances memoryPager
        this.command = `. ${this.hexWord(this.memoryPager)} `;
      } else {
        this.command = '';
      }
    }
  }
}
</script>

<style scoped>
  div {
    margin-top: 10px;
    padding: 0 0 10px 0;
  }

  pre {
    margin: auto;
    text-align: left;
    font-family: monospace, sans-serif;
    font-size: 100%;
    line-height: 1;
    width: 390px;
    padding: 3px 0 0 5px;
    background-color: black;
    color: lime;
  }

  input {
    font-family: monospace, sans-serif;
    font-size: 100%;
    width: 388px;
    padding: 3px 0 0 5px;
    margin-top: 5px;
    color: yellow;
  }

  input.active {
    background-color: black;
  }

  input.inactive {
    background-color: #580000;
  }
</style>
