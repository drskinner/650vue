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
      let byte = this.ram[this.cpu.pc];
      let instruction = opcodes.get(byte);
      let address = this[instruction.mode]();

      this[instruction.opcode](address);
      this.cycles += instruction.cycles;
      store.commit('incrementPc');
      store.dispatch('refreshVideo');
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
    // Two's complement by hand...
    byteToSignedInt(signedByte) {
      return (signedByte & 0x80) ? -((signedByte ^ 0xff) + 1) : signedByte;
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
      return this.cpu.pc;
    },
    // Relative mode, like immediate mode, will use the byte after
    // the opcode as its operand.
    relative() {
      store.commit('incrementPc');
      return this.cpu.pc;
    },
    // In absolute mode, the operand is a little-endian 2-byte address.
    absolute() {
      store.commit('incrementPc');
      let lo = this.ram[this.cpu.pc];
      store.commit('incrementPc');
      let hi = this.ram[this.cpu.pc];

      return hi * 0x0100 + lo;
    },
    // In absolute_x, the X register is added to the 2-byte address to get the
    // target address. Overflow addresses "wrap around" from 0xffff to 0x0000.
    //
    // TODO: when the calculated address is on a different page from the operand
    // address, the instruction will require an extra clock cycle to execute.
    absoluteX() {
      store.commit('incrementPc');
      let lo = this.ram[this.cpu.pc];
      store.commit('incrementPc');
      let hi = this.ram[this.cpu.pc];

      return (hi * 0x0100 + lo + this.cpu.xr) & 0xffff;
    },
    // TODO: when the calculated address is on a different page from the operand
    // address, the instruction will require an extra clock cycle to execute.
    absoluteY() {
      store.commit('incrementPc');
      let lo = this.ram[this.cpu.pc];
      store.commit('incrementPc');
      let hi = this.ram[this.cpu.pc];

      return (hi * 0x0100 + lo + this.cpu.yr) & 0xffff;
    },
    // In zeroPage mode, the operand is an address of the form 0x00nn.
    // We can simply return this byte as an address.
    zeroPage() {
      store.commit('incrementPc');
      return this.ram[this.cpu.pc] & 0x00ff; // mask to enforce zero-page
    },
    // In zeroPageX, the X register is added to the operand to get the
    // target address. Overflows "wrap around" so we apply a zero-page mask.
    zeroPageX() {
      store.commit('incrementPc');
      return (this.ram[this.cpu.pc] + this.cpu.xr) & 0x00ff
    },
    zeroPageY() {
      store.commit('incrementPc');
      return (this.ram[this.cpu.pc] + this.cpu.yr) & 0x00ff
    },
    //
    // OPCODES
    //
    // TODO: cycle penalty if branch taken or page boundary crossed
    BEQ(address) {
      if (this.flagStatus(constants.flags.SR_ZERO)) {
        let target = this.cpu.pc + this.byteToSignedInt(this.ram[address]);
        store.commit('writeRegister', { register: 'pc', value: target });
      }
    },
    BNE(address) {
      if (!this.flagStatus(constants.flags.SR_ZERO)) {
        let target = this.cpu.pc + this.byteToSignedInt(this.ram[address]);
        store.commit('writeRegister', { register: 'pc', value: target });
      }
    },
    BRK() {
      store.commit('setFlag', constants.flags.SR_BREAK);
      this.stop();
    },
    CLC() {
      store.commit('clearFlag', constants.flags.SR_CARRY);
    },
    CLD() {
      store.commit('clearFlag', constants.flags.SR_DECIMAL);
    },
    CLI() {
      store.commit('clearFlag', constants.flags.SR_INTERRUPT);
    },
    CLV() {
      store.commit('clearFlag', constants.flags.SR_OVERFLOW);
    },
    DEX() {
      store.commit('decrementRegister', 'xr');
      this.znFlags(this.cpu.xr);
    },
    DEY() {
      store.commit('decrementRegister', 'yr');
      this.znFlags(this.cpu.yr);
    },
    INX() {
      store.commit('incrementRegister', 'xr');
      this.znFlags(this.cpu.xr);
    },
    INY() {
      store.commit('incrementRegister', 'yr');
      this.znFlags(this.cpu.yr);
    },
    // Because step() will increment the PC, we'll
    // JMP to address - 1.
    JMP(address) {
      store.commit('writeRegister', { register: 'pc', value: address - 1 });
    },
    LDA(address) {
      store.commit('writeRegister', { register: 'ac', value: this.ram[address] });
      this.znFlags(this.cpu.ac);
    },
    LDX(address) {
      store.commit('writeRegister', { register: 'xr', value: this.ram[address] });
      this.znFlags(this.cpu.xr);
    },
    LDY(address) {
      store.commit('writeRegister', { register: 'yr', value: this.ram[address] });
      this.znFlags(this.cpu.yr);
    },
    NOP() {
      return;
    },
    ROL(address) {
      let cachedCarryBit = this.flagStatus(constants.flags.SR_CARRY);

        if (address === null) {
        if (this.cpu.ac & 0x80) {
          store.commit('setFlag', constants.flags.SR_CARRY);
        } else {
          store.commit('clearFlag', constants.flags.SR_CARRY);
        }
        this.cpu.ac = ((this.cpu.ac << 1) & 0xff) + cachedCarryBit;
        this.znFlags(this.cpu.ac);
      } else {
        if (this.ram[address] & 0x80) {
          store.commit('setFlag', constants.flags.SR_CARRY);
        } else {
          store.commit('clearFlag', constants.flags.SR_CARRY);
        }
        store.commit('writeRam', { address: address,
                                   value: ((this.ram[address] << 1) & 0xff) + cachedCarryBit });
        this.znFlags(this.ram[address]);
      }
    },
    ROR(address) {
      let cachedCarryBit = this.flagStatus(constants.flags.SR_CARRY);

        if (address === null) {
        if (this.cpu.ac & 0x01) {
          store.commit('setFlag', constants.flags.SR_CARRY);
        } else {
          store.commit('clearFlag', constants.flags.SR_CARRY);
        }
        this.cpu.ac = ((this.cpu.ac >> 1) & 0xff) + (cachedCarryBit * 0x80);
        this.znFlags(this.cpu.ac);
      } else {
        if (this.ram[address] & 0x01) {
          store.commit('setFlag', constants.flags.SR_CARRY);
        } else {
          store.commit('clearFlag', constants.flags.SR_CARRY);
        }
        store.commit('writeRam', { address: address,
                                   value: ((this.ram[address] >> 1) & 0xff) + (cachedCarryBit * 0x80) });
        this.znFlags(this.ram[address]);
      }
    },
    SEC() {
      store.commit('setFlag', constants.flags.SR_CARRY);
    },
    SED() {
      store.commit('setFlag', constants.flags.SR_DECIMAL);
    },
    SEI() {
      store.commit('setFlag', constants.flags.SR_INTERRUPT);
    },
    STA(address) {
      store.commit('writeRam', { address: address, value: this.cpu.ac });
    },
    TAX() {
      store.commit('writeRegister', { register: 'xr', value: this.cpu.ac });
      this.znFlags(this.cpu.xr);
    },
    TAY() {
      store.commit('writeRegister', { register: 'yr', value: this.cpu.ac });
      this.znFlags(this.cpu.yr);
    },
    TSX() {
      store.commit('writeRegister', { register: 'xr', value: this.cpu.sp });
      this.znFlags(this.cpu.xr);
    },
    TXA() {
      store.commit('writeRegister', { register: 'ac', value: this.cpu.xr });
      this.znFlags(this.cpu.ac);
    },
    // TXS does not affect status flags
    TXS() {
      store.commit('writeRegister', { register: 'sp', value: this.cpu.xr });
    },
    TYA() {
      store.commit('writeRegister', { register: 'ac', value: this.cpu.yr });
      this.znFlags(this.cpu.ac);
    }
  }
}
