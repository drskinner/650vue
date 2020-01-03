import store from '@/store/index'
import constants from '@/const'
import { opcodes } from '@/opcodes'

export const execute = {
  methods: {
    //
    // step() is the main function.
    // It looks up the opcode, figures out what memory
    // to operate on based on the address mode, calls
    // the function for the opcode, and finally
    // increments the clock and program counter.
    //
    step() {
      let byte = store.state.ram[store.state.cpu.pc];
      let instruction = opcodes.get(byte);
      let address = this[instruction.mode]();

      this[instruction.opcode](address);
      this.cycles += instruction.cycles;
      store.commit('incrementPc');
    },
    // Instructions that could result in a zero or negative
    // must set the Z and N status flags correctly.
    znFlags(result) {
      if (result === 0) {
        store.commit('setFlag', constants.flags.SR_ZERO);
      } else {
        store.commit('clearFlag', constants.flags.SR_ZERO);
      }
      if ((result & 0x80) === 0) { // MSB indicates negative
        store.commit('clearFlag', constants.flags.SR_NEGATIVE);
      } else {
        store.commit('setFlag', constants.flags.SR_NEGATIVE);
      }
    },
    //
    // ADDRESS MODES
    // Each instruction calls an "address mode" function
    // to determine where in RAM to get its operand data.
    //
    // We don't actually need to return an address in implied mode.
    implied() {
      return null;
    },
    // In immediate mode, the operand is a one-byte literal value
    // so we can increment the PC (to point at the operand in memory)
    // and return the new PC as an address to be read.
    immediate() {
      store.commit('incrementPc');
      return store.state.cpu.pc;
    },
    // In absolute mode, the operand is a little-endian 2-byte address.
    absolute() {
      store.commit('incrementPc');
      let lo = store.state.ram[store.state.cpu.pc];
      store.commit('incrementPc');
      let hi = store.state.ram[store.state.cpu.pc];

      return hi * 0x0100 + lo;
    },
    //
    // OPCODES
    //
    BRK() {
      store.commit('setFlag', constants.flags.SR_BREAK);
      this.stop();
    },
    DEX() {
      store.commit('decrementRegister', 'xr');
      this.znFlags(store.state.cpu.xr);
    },
    DEY() {
      store.commit('decrementRegister', 'yr');
      this.znFlags(store.state.cpu.yr);
    },
    INX() {
      store.commit('incrementRegister', 'xr');
      this.znFlags(store.state.cpu.xr);
    },
    INY() {
      store.commit('incrementRegister', 'yr');
      this.znFlags(store.state.cpu.yr);
    },
    LDA(address) {
      console.log(address);
      store.commit('writeRegister', { register: 'ac', value: store.state.ram[address] });
      this.znFlags(store.state.cpu.ac);
    },
    LDX(address) {
      store.commit('writeRegister', { register: 'xr', value: store.state.ram[address] });
      this.znFlags(store.state.cpu.xr);
    },
    LDY(address) {
      store.commit('writeRegister', { register: 'yr', value: store.state.ram[address] });
      this.znFlags(store.state.cpu.yr);
    }
  }
}
