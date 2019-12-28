import Vue from 'vue'
import Vuex from 'vuex'

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
    ram: Array(65536).fill(0x00)
  },
  mutations: {
    resetPc(state) {
      state.cpu.pc = (state.ram[0xffdd] * 0x100) + state.ram[0xffdc];
    },
    resetRegisters({ cpu }) {
      cpu.ac = 0x00;
      cpu.xr = 0x00;
      cpu.yr = 0x00;
      cpu.sp = 0xfd; // TODO: investigate real behaviour of reset
      cpu.sr = 0x20;
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
    }
    // TODO:
    // * set and clear individual status flags
    // * write to ram
    // * push/pull to stack
  },
  actions: {
    resetCpu({ commit }) { // destructured shorthand for context.commit
      commit('resetRegisters');
      commit('resetPc');
    }
  },
  getters: {
    flagStatus: (state) => (flag) => {
      return (state.cpu.sr & flag) > 0;
    }
  },
  modules: {
  }
})
