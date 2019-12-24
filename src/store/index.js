import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    cpu: {
      ac: 0x01,
      xr: 0x02,
      yr: 0x03,
      sp: 0xFD,
      sr: Math.floor(Math.random() * 256),
      pc: 0x0000
    },
    ram: Array(65536).fill(0x00)
  },
  mutations: {
    incrementPc (state) {
      state.cpu.pc++;
    }
  },
  actions: {
  },
  getters: {
    flagStatus: (state) => (flag) => {
      return (state.cpu.sr & flag) > 0;
    }
  },
  modules: {
  }
})
