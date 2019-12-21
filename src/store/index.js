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
      sr: 0x04,
      pc: 0x0001
    },
    ram: Array(65536).fill(0x00)
  },
  mutations: {
  },
  actions: {
  },
  getters: {
    getRegister: state => register => state.cpu[register],
    getMemory: state => address => state.ram[address]
  },
  modules: {
  }
})
