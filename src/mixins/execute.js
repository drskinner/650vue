import store from '@/store/index'
import constants from '@/const'
import { opcodes } from '@/opcodes'
import { mapActions } from 'vuex';

export const execute = {
  methods: {
    ...mapActions(['refreshVideo']),
    //
    // tick() handles the "clock". Currently executes
    // a certain number of cycles per tick at regular
    // intervals.
    tick() {
      let tickCycles = 10000;
      let instructionCycles = 0;

      while (tickCycles > 0 && !this.nmi) {
        instructionCycles = this.step();
        tickCycles -= instructionCycles;
      }

      // NMI cannot be ignored!
      if (this.nmi) {
        this.stop();
        cancelAnimationFrame(this.requestReference);
      } else if (!this.flagStatus(constants.flags.SR_INTERRUPT)) {
        this.stackPush((this.cpu.pc & 0xff00) >> 8);
        this.stackPush(this.cpu.pc & 0xff);
        this.stackPush(this.cpu.sr | 0x30);
        this.irq = true;

        let serviceRoutine = (this.ram[0xffff] << 8) + this.ram[0xfffe];
        store.commit('writeRegister', { register: 'pc', value: serviceRoutine });

        while (this.irq) {
          instructionCycles = this.step();
        }
      }

      // something, something, interrupt, frame rate, something.
      this.refreshVideo();

      // the cancel seems to slow the memory leak long enough to
      // allow the garbage collection to catch up a little bit.
      if (this.isRunning) {
        cancelAnimationFrame(this.requestReference);
        this.requestReference = requestAnimationFrame(this.tick);
      }
    },
    //
    // step() is the main function.
    // It looks up the opcode, figures out what memory to operate
    // on based on the address mode, calls the function to run
    // the opcode, and finally increments the program counter.
    // Return value: the base cycle count for the instruction
    // being run before any cycle penalties are applied.
    //
    step() {
      let byte = this.ram[this.cpu.pc];
      let instruction = opcodes.get(byte);
      this.penaltyCycles = 0; // reset cycle penalty

      let address = this[instruction.mode]();
      this[instruction.opcode](address);
      //this.runCycles += instruction.cycles + this.penaltyCycles;
      store.commit('incrementPc');

      // we want the display to refresh in single-step mode.
      if (!this.isRunning) {
        this.refreshVideo();
      }
      return instruction.cycles + this.penaltyCycles;
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
    // Top-down stack. Write a byte on page 0x01 at the location indicated by
    // the stack pointer, and decrement the pointer. The stack pointer does not
    // care if we overflow; 0x100 will roll over to 0x1ff.
    //
    stackPush(byte) {
      store.commit('writeRam', { address: 0x0100 + this.cpu.sp, value: byte });
      store.commit('decrementRegister', 'sp');
    },
    //
    // Increment the stack pointer, and return the byte at that new location,
    // which will become the next available location on the stack. The stack
    // pointer will happily underflow; 0x1ff will roll over to 0x100.
    //
    stackPull() {
      store.commit('incrementRegister', 'sp');
      return this.ram[(0x0100 + this.cpu.sp) & 0x01ff];
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
    // In absoluteX, the X register is added to the 2-byte address to get the
    // target address. Overflow addresses "wrap around" from 0xffff to 0x0000.
    //
    // When the calculated address is on a different page from the operand
    // address, the instruction will require an extra clock cycle to execute.
    absoluteX() {
      store.commit('incrementPc');
      let lo = this.ram[this.cpu.pc];
      store.commit('incrementPc');
      let hi = this.ram[this.cpu.pc];

      let target = (hi * 0x0100 + lo + this.cpu.xr) & 0xffff;

      if ((target & 0xff00) != (hi * 0x100)) {
        this.penaltyCycles += 1;
      }

      return target;
    },
    // When the calculated address is on a different page from the operand
    // address, the instruction will require an extra clock cycle to execute.
    absoluteY() {
      store.commit('incrementPc');
      let lo = this.ram[this.cpu.pc];
      store.commit('incrementPc');
      let hi = this.ram[this.cpu.pc];

      let target = (hi * 0x0100 + lo + this.cpu.yr) & 0xffff;

      if ((target & 0xff00) != (hi * 0x100)) {
        this.penaltyCycles += 1;
      }

      return target;
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
    // Indirect mode is only used with the JMP instruction. The operand contains a
    // 16-bit address which identifies the location of the low byte of another
    // 16-bit memory address which is the effective target of the jump.
    //
    // NOTE: the real 6502 has a famous bug: if the low byte of the pointer is 0xff,
    // the the high byte's location is 0x00 and not 0x100 as one would expect. For
    // example, JMP($C0FF) will get its high byte from $C000 instead of $C100.
    indirect() {
      store.commit('incrementPc');
      let pointerLo = this.ram[this.cpu.pc];
      store.commit('incrementPc');
      let pointerHi = this.ram[this.cpu.pc];

      let effectiveLo = (pointerHi * 0x0100 + pointerLo) & 0xffff
      let effectiveHi = (pointerHi * 0x0100 + ((pointerLo + 1) & 0xff)) & 0xffff

      return (this.ram[effectiveHi] * 0x0100 + this.ram[effectiveLo]) & 0xffff;
    },
    // Indirect, Indexed mode has, as its operand, a zero-page address that
    // holds the low byte of a little-endian two-byte address. To this
    // two-byte address, we add the value of the Y register to determine
    // the final "effective" address.
    //
    // As with absolute indexed modes, a change in page costs an additional
    // clock cycle.
    indirectIndexed() {
      store.commit('incrementPc');
      let zeroPageAddress = this.ram[this.cpu.pc];
      let lo = this.ram[zeroPageAddress];
      let hi = this.ram[zeroPageAddress + 1];

      let target = (hi * 0x0100 + lo + this.cpu.yr) & 0xffff;

      if ((target & 0xff00) != (hi * 0x100)) {
        this.penaltyCycles += 1;
      }

      return target;
    },
    // In "Indexed, Indirect" mode, the 8-bit operand is added to the
    // X register. The result is the low byte of a little-endian two-byte
    // effective address. Zero-page addresses "wrap", so there will be no
    // clock-cycle penalty for crossing a page boundary.
    //
    // "You may never need to use this mode. Indeed, most programmers lead
    //  full, rich lives without ever writing code that uses indexed, indirect
    //  addressing." -- Jim Butterfield
    indexedIndirect() {
      store.commit('incrementPc');
      let zeroPageAddress = (this.ram[this.cpu.pc] + this.cpu.xr) & 0xff
      let lo = this.ram[zeroPageAddress] & 0xff
      let hi = this.ram[zeroPageAddress + 1] & 0xff

      return (hi * 0x0100 + lo) & 0xffff
    },
    //
    // OPCODES
    //
    // ADC can seem very complicated, especially with respect to the behaviour
    // of the OVERFLOW flag. There's lots of material online about 1s- and
    // 2s-complements, signed 8-bit integers, and clever XORs but here,
    // performance isn't an issue, so I can try something a little more readable.
    //
    // TODO: Also, Decimal Mode is a fun complication that I'm totally ignoring for now.
    //
    ADC(address) {
      let signedAcc = this.byteToSignedInt(this.cpu.ac);
      let signedRam = this.byteToSignedInt(this.ram[address]);
      let signedSum = signedAcc + signedRam;

      if (signedSum > 127 || signedSum < -128) {
        store.commit('setFlag', constants.flags.SR_OVERFLOW);
      } else {
        store.commit('clearFlag', constants.flags.SR_OVERFLOW);
      }

      let sum = this.cpu.ac + this.ram[address];
      if (this.flagStatus(constants.flags.SR_CARRY)) {
        sum += 1;
      }

      if (sum > 0xff) {
        store.commit('setFlag', constants.flags.SR_CARRY);
      } else {
        store.commit('clearFlag', constants.flags.SR_CARRY);
      }

      this.cpu.ac = sum & 0xff;
      this.znFlags(this.cpu.ac);
    },
    AND(address) {
      store.commit('writeRegister', { register: 'ac', value: (this.cpu.ac & this.ram[address]) });
      this.znFlags(this.cpu.ac);
    },
    ASL(address) {
      if (address === null) {
        if (this.cpu.ac & 0x80) {
          store.commit('setFlag', constants.flags.SR_CARRY);
        } else {
          store.commit('clearFlag', constants.flags.SR_CARRY);
        }
        this.cpu.ac = (this.cpu.ac << 1) & 0xff;
        this.znFlags(this.cpu.ac);
      } else {
        if (this.ram[address] & 0x80) {
          store.commit('setFlag', constants.flags.SR_CARRY);
        } else {
          store.commit('clearFlag', constants.flags.SR_CARRY);
        }
        store.commit('writeRam', { address: address,
                                  value: (this.ram[address] << 1) & 0xff });
        this.znFlags(this.ram[address]);
      }
    },
    BCC(address) {
      if (!this.flagStatus(constants.flags.SR_CARRY)) {
        let target = this.cpu.pc + this.byteToSignedInt(this.ram[address]);

        this.penaltyCycles += 1;
        if ((target & 0xff00) != (this.cpu.pc & 0xff00)) {
          this.penaltyCycles += 1;
        }
        store.commit('writeRegister', { register: 'pc', value: target });
      }
    },
    BCS(address) {
      if (this.flagStatus(constants.flags.SR_CARRY)) {
        let target = this.cpu.pc + this.byteToSignedInt(this.ram[address]);

        this.penaltyCycles += 1;
        if ((target & 0xff00) != (this.cpu.pc & 0xff00)) {
          this.penaltyCycles += 1;
        }
        store.commit('writeRegister', { register: 'pc', value: target });
      }
    },
    BEQ(address) {
      if (this.flagStatus(constants.flags.SR_ZERO)) {
        let target = this.cpu.pc + this.byteToSignedInt(this.ram[address]);

        this.penaltyCycles += 1;
        if ((target & 0xff00) != (this.cpu.pc & 0xff00)) {
          this.penaltyCycles += 1;
        }
        store.commit('writeRegister', { register: 'pc', value: target });
      }
    },
    // BIT has always seemed a little weird...
    // Only flags are affected; not memory or AC.
    BIT(address) {
      let tmp = this.cpu.ac & this.ram[address];

      if (tmp === 0) {
        store.commit('setFlag', constants.flags.SR_ZERO);
      } else {
        store.commit('clearFlag', constants.flags.SR_ZERO);
      }

      if (tmp & constants.flags.SR_NEGATIVE) {
        store.commit('setFlag', constants.flags.SR_NEGATIVE);
      } else {
        store.commit('clearFlag', constants.flags.SR_NEGATIVE);
      }

      if (tmp & constants.flags.SR_OVERFLOW) {
        store.commit('setFlag', constants.flags.SR_OVERFLOW);
      } else {
        store.commit('clearFlag', constants.flags.SR_OVERFLOW);
      }
    },
    BMI(address) {
      if (this.flagStatus(constants.flags.SR_NEGATIVE)) {
        let target = this.cpu.pc + this.byteToSignedInt(this.ram[address]);

        this.penaltyCycles += 1;
        if ((target & 0xff00) != (this.cpu.pc & 0xff00)) {
          this.penaltyCycles += 1;
        }
        store.commit('writeRegister', { register: 'pc', value: target });
      }
    },
    BNE(address) {
      if (!this.flagStatus(constants.flags.SR_ZERO)) {
        let target = this.cpu.pc + this.byteToSignedInt(this.ram[address]);

        this.penaltyCycles += 1;
        if ((target & 0xff00) != (this.cpu.pc & 0xff00)) {
          this.penaltyCycles += 1;
        }
        store.commit('writeRegister', { register: 'pc', value: target });
      }
    },
    BPL(address) {
      if (!this.flagStatus(constants.flags.SR_NEGATIVE)) {
        let target = this.cpu.pc + this.byteToSignedInt(this.ram[address]);

        this.penaltyCycles += 1;
        if ((target & 0xff00) != (this.cpu.pc & 0xff00)) {
          this.penaltyCycles += 1;
        }
        store.commit('writeRegister', { register: 'pc', value: target });
      }
    },
    // 650vue pretends BRK triggers a non-maskable interrupt, because
    // the monitor lives in the terminal, outside of the virtual CPU.
    BRK() {
      store.commit('setFlag', constants.flags.SR_BREAK);
      this.nmi = true;
    },
    BVC(address) {
      if (!this.flagStatus(constants.flags.SR_OVERFLOW)) {
        let target = this.cpu.pc + this.byteToSignedInt(this.ram[address]);

        this.penaltyCycles += 1;
        if ((target & 0xff00) != (this.cpu.pc & 0xff00)) {
          this.penaltyCycles += 1;
        }
        store.commit('writeRegister', { register: 'pc', value: target });
      }
    },
    BVS(address) {
      if (this.flagStatus(constants.flags.SR_OVERFLOW)) {
        let target = this.cpu.pc + this.byteToSignedInt(this.ram[address]);

        this.penaltyCycles += 1;
        if ((target & 0xff00) != (this.cpu.pc & 0xff00)) {
          this.penaltyCycles += 1;
        }
        store.commit('writeRegister', { register: 'pc', value: target });
      }
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
    CMP(address) {
      let diff = (this.cpu.ac + 0x100 - this.ram[address]) & 0xff

      if (this.cpu.ac >= this.ram[address]) {
        store.commit('setFlag', constants.flags.SR_CARRY);
      } else {
        store.commit('clearFlag', constants.flags.SR_CARRY);
      }
      this.znFlags(diff)
    },
    CPX(address) {
      let diff = (this.cpu.xr + 0x100 - this.ram[address]) & 0xff

      if (this.cpu.xr >= this.ram[address]) {
        store.commit('setFlag', constants.flags.SR_CARRY);
      } else { 
        store.commit('clearFlag', constants.flags.SR_CARRY);
      }
      this.znFlags(diff)
    },
    CPY(address) {
      let diff = (this.cpu.yr + 0x100 - this.ram[address]) & 0xff

      if (this.cpu.yr >= this.ram[address]) {
        store.commit('setFlag', constants.flags.SR_CARRY);
      } else { 
        store.commit('clearFlag', constants.flags.SR_CARRY);
      }
      this.znFlags(diff)
    },
    DEC(address) {
      store.commit('writeRam', { address: address, value: (this.ram[address] - 1) & 0xff });
      this.znFlags(this.ram[address]);
    },
    DEX() {
      store.commit('decrementRegister', 'xr');
      this.znFlags(this.cpu.xr);
    },
    DEY() {
      store.commit('decrementRegister', 'yr');
      this.znFlags(this.cpu.yr);
    },
    EOR(address) {
      store.commit('writeRegister', { register: 'ac', value: (this.cpu.ac ^ this.ram[address]) });
      this.znFlags(this.cpu.ac);
    },
    INC(address) {
      store.commit('writeRam', { address: address, value: (this.ram[address] + 1) & 0xff });
      this.znFlags(this.ram[address]);
    },
    INX() {
      store.commit('incrementRegister', 'xr');
      this.znFlags(this.cpu.xr);
    },
    INY() {
      store.commit('incrementRegister', 'yr');
      this.znFlags(this.cpu.yr);
    },
    // Because step() will increment the PC before the next instruction
    // is evaluated, we'll JMP to address - 1.
    JMP(address) {
      store.commit('writeRegister', { register: 'pc', value: address - 1 });
    },
    // JSR pushes the return address minus 0x01 onto the stack.
    // RTS grabs the return address and increments the program counter
    // as part of its execution. As with JMP, we'll JSR to address - 1,
    // because PC increment.
    //
    // Remember, addresses are little-endian. High byte gets pushed
    // first, followed by low byte.
    JSR(address) {
      this.stackPush(this.cpu.pc >> 8);
      this.stackPush(this.cpu.pc & 0x00ff);

      store.commit('writeRegister', { register: 'pc', value: address - 1 });
    },
    LDA(address) {
      if (address == constants.registers.RANDOM) {
        store.commit('writeRegister', { register: 'ac', value: Math.floor(Math.random() * 256) });
      } else {
        store.commit('writeRegister', { register: 'ac', value: this.ram[address] });
      }
      this.znFlags(this.cpu.ac);
    },
    LDX(address) {
      if (address == constants.registers.RANDOM) {
        store.commit('writeRegister', { register: 'xr', value: Math.floor(Math.random() * 256) });
      } else {
        store.commit('writeRegister', { register: 'xr', value: this.ram[address] });
      }
      this.znFlags(this.cpu.xr);
    },
    LDY(address) {
      if (address == constants.registers.RANDOM) {
        store.commit('writeRegister', { register: 'yr', value: Math.floor(Math.random() * 256) });
      } else {
        store.commit('writeRegister', { register: 'yr', value: this.ram[address] });
      }
      this.znFlags(this.cpu.yr);
    },
    LSR(address) {
      if (address === null) {
        if (this.cpu.ac & 0x01) {
          store.commit('setFlag', constants.flags.SR_CARRY);
        } else {
          store.commit('clearFlag', constants.flags.SR_CARRY);
        }
        this.cpu.ac = (this.cpu.ac >> 1) & 0xff;
        this.znFlags(this.cpu.ac);
      } else {
        if (this.ram[address] & 0x01) {
          store.commit('setFlag', constants.flags.SR_CARRY);
        } else {
          store.commit('clearFlag', constants.flags.SR_CARRY);
        }
        store.commit('writeRam', { address: address,
                                  value: (this.ram[address] >> 1) & 0xff });
        this.znFlags(this.ram[address]);
      }
    },
    NOP() {
      return;
    },
    ORA(address) {
      store.commit('writeRegister', { register: 'ac', value: (this.cpu.ac | this.ram[address]) });
      this.znFlags(this.cpu.ac);
    },
    PHA() {
      this.stackPush(this.cpu.ac);
    },
    // Pushing the status register is a bit weird; the BREAK flag does not
    // physically exist in the processor and the UNUSED flag always reads high.
    // In VICE 128, even when you push 0x00 on the stack it comes back 0x30.
    PHP() {
      this.stackPush(this.cpu.sr | 0x30);
    },
    PLA() {
      store.commit('writeRegister', { register: 'ac', value: this.stackPull() });
      this.znFlags(this.cpu.ac);
    },
    // PLP has similar bit weirdness as in PHP.
    // There's no direct way to test the UNUSED and BREAK flags anyway.
    // I'm going to leave the BREAK flag alone even if that's not 100% accurate.
    PLP() {
      store.commit('writeRegister', { register: 'ac', value: (this.stackPull() | 0x20) });
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
    RTI() {
      store.commit('writeRegister', { register: 'sr', value: this.stackPull() });

      let lo = this.stackPull();
      let hi = this.stackPull();
      let returnAddress = (((hi << 8) + lo) - 1) & 0xffff;
      store.commit('writeRegister', { register: 'pc', value: returnAddress });

      this.irq = false;
    },
    // RTS should pull the return address minus one as JSR pushed
    // to the stack. Conveniently, the PC increment will ensure that
    // we resume execution at the instruction following the JSR.
    RTS() {
      let lo = this.stackPull();
      let hi = this.stackPull();

      store.commit('writeRegister', { register: 'pc', value: (hi << 8) + lo });
    },
    // SBC is pretty confusing, but it turns out that you can subtract
    // by inverting the operand and just adding, which is something you
    // can do in conventional arithmetic.
    //
    // TODO: This facile approach won't work in Decimal Mode.
    SBC(address) {
      let operand = this.ram[address] ^ 0xff;

      let signedAcc = this.byteToSignedInt(this.cpu.ac);
      let signedRam = this.byteToSignedInt(operand);
      let signedSum = signedAcc + signedRam;

      if (signedSum > 127 || signedSum < -128) {
        store.commit('setFlag', constants.flags.SR_OVERFLOW);
      } else {
        store.commit('clearFlag', constants.flags.SR_OVERFLOW);
      }

      let sum = this.cpu.ac + operand;
      if (this.flagStatus(constants.flags.SR_CARRY)) {
        sum += 1;
      }

      if (sum > 0xff) {
        store.commit('setFlag', constants.flags.SR_CARRY);
      } else {
        store.commit('clearFlag', constants.flags.SR_CARRY);
      }

      this.cpu.ac = sum & 0xff;
      this.znFlags(this.cpu.ac);
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
      this.penaltyCycles = 0; // no penalty for indexed stores
      store.commit('writeRam', { address: address, value: this.cpu.ac });
    },
    STX(address) {
      store.commit('writeRam', { address: address, value: this.cpu.xr });
    },
    STY(address) {
      store.commit('writeRam', { address: address, value: this.cpu.yr });
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
