import Vue from 'vue'
import Vuex from 'vuex'
import constants from '@/const';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    cpu: { // simulate some noise
      ac: Math.floor(Math.random() * 256),
      xr: Math.floor(Math.random() * 256),
      yr: Math.floor(Math.random() * 256),
      sp: Math.floor(Math.random() * 256),
      sr: Math.floor(Math.random() * 256),
      pc: Math.floor(Math.random() * 65536)
    },
    ram: Array(65536).fill(0x00),
    isRunning: false,
    videoFrame: 0
  },
  mutations: {
    setIsRunning(state, running) {
      state.isRunning = running;
    },
    updateVideoFrame(state) {
      state.videoFrame = (state.videoFrame + 1) % 60;
    },
    resetPc({ cpu, ram }) { // destructuring multiple properties
      cpu.pc = (ram[0xfffd] * 0x100) + ram[0xfffc];
    },
    // Reset _could_ actually JMP to the reset vector like it's meant to,
    // and then some code in "ROM" could initialize the registers.
    resetRegisters({ cpu }) {
      cpu.ac = 0x00;
      cpu.xr = 0x00;
      cpu.yr = 0x00;
      cpu.sp = 0xfd; // TODO: investigate real behaviour of reset.
      cpu.sr = 0x24; // The UNUSED status flag is always set.
                     // Also set INTERRUPT disable flag so we don't
                     // service IRQs before the vector is defined.
    },
    clearStack({ ram }) {
      for (let i = 0x0100; i <= 0x01fd; i += 1) {
        ram[i] = 0x00;
      }
    },
    incrementPc({ cpu }) {
      cpu.pc = (cpu.pc + 1) & 0xffff;
    },
    incrementRegister({ cpu }, register) {
      cpu[register] = (cpu[register] + 0x01) & 0xff;
    },
    // Subtracting 0x01 is equivalent to adding 0xff with a subsequent mask.
    decrementRegister({ cpu }, register) {
      cpu[register] = (cpu[register] + 0xff) & 0xff;
    },
    writeRegister({ cpu }, data) {
      cpu[data.register] = data.value;
    },
    writeRam({ ram }, data) {
      ram[data.address] = data.value;
    },
    setFlag({ cpu }, flag) {
      cpu.sr |= flag;
    },
    clearFlag({ cpu }, flag) {
      cpu.sr &= (~flag & 0xff);
    },
    setLastKey({ ram }, key) {
      if (key.length === 1) {
        ram[constants.registers.LAST_KEY] = (key.charCodeAt(0));
      } else if (key === 'ArrowDown') {
        ram[constants.registers.LAST_KEY] = constants.keys.ARROW_DOWN;
      } else if (key === 'ArrowLeft') {
        ram[constants.registers.LAST_KEY] = constants.keys.ARROW_LEFT;
      } else if (key === 'ArrowRight') {
        ram[constants.registers.LAST_KEY] = constants.keys.ARROW_RIGHT;
      } else if (key === 'ArrowUp') {
        ram[constants.registers.LAST_KEY] = constants.keys.ARROW_UP;
      } else if (key === 'Backspace') {
        ram[constants.registers.LAST_KEY] = constants.keys.BACKSPACE;
      } else if (key === 'Enter') {
        ram[constants.registers.LAST_KEY] = constants.keys.ENTER;
      }
    }
  },
  actions: {
    resetCpu({ commit }) { // destructured shorthand for context.commit
      commit('resetRegisters');
      commit('resetPc');
      commit('clearStack');
    },
    refreshVideo({ commit }) {
      commit('updateVideoFrame');
    },
    processKey({ commit }, key) {
      commit('setLastKey', key);
    }
  },
  getters: {
    flagStatus: ({ cpu: { sr } }) => (flag) => { // destructure nested property
      return (sr & flag) > 0;
    }
  },
  modules: {
  }
})
