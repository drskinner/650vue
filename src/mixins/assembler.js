import { opcodes } from '@/opcodes'
import store from '@/store/index'

export const assembler = {
  methods: {
    // Parse the line of assembler and write to memory.
    // A line like "c000 lda #$2a" consists of three parts:
    //   (1) the address (c000),
    //   (2) the mnemonic (lda),
    //   (3) the optional operand (#$2a).
    //
    // * split the input into its components,
    // * determine the correct address mode from the operand,
    // * find the instruction that matches mnemonic and mode,
    // * write the instruction to the correct address, and
    // * resolve the operand and write bytes if required.
    assemble() {
      if (this.command.length <= 8) {
        return;
      }

      let parts = this.command.split(' ');
      let mnemonic = (parts[2]) ? parts[2].toUpperCase() : null;
      let operand = (parts[3]) ? parts[3] : null;

      this.memoryPager = this.stringToWord(parts[1]);

      let mode;
      if (operand === null) {
        mode = 'implied';
      } else if (operand.match(/#\$(\d|[a-f]){2}$/)) { // #$00
        mode = 'immediate';
      } else if (operand.match(/\$(\d|[a-f]){4}$/)) { // $0000
        // TODO: bounds checking for relative branch address
        mode = (mnemonic[0] === 'B') ? 'relative' : 'absolute';
      } else if (operand.match(/\$(\d|[a-f]){4},x$/)) { // $0000,x
        mode = 'absoluteX';
      } else if (operand.match(/\$(\d|[a-f]){4},y$/)) { // $0000,y
        mode = 'absoluteY';
      } else if (operand.match(/\$(\d|[a-f]){2}$/)) { // $00
        mode = 'zeroPage';
      } else if (operand.match(/\$(\d|[a-f]){2},x$/)) { // $00,x
        mode = 'zeroPageX';
      } else if (operand.match(/\$(\d|[a-f]){2},y$/)) { // $00,y
        mode = 'zeroPageY';
      } else if (operand.match(/\(\$(\d|[a-f]){4}\)$/)) { // ($0000)
        mode = 'indirect';
      } else if (operand.match(/\(\$(\d|[a-f]){2}\),y$/)) { // ($00),y
        mode = 'indirectIndexed';
      } else if (operand.match(/\(\$(\d|[a-f]){2},x\)$/)) { // ($00,x)
        mode = 'indexedIndirect';
      }

      let instruction;
      opcodes.forEach(function(value, key) {
        if (value.opcode === mnemonic && value.mode === mode) {
          instruction = { byte: key, ...opcodes.get(key) };
        }
      });

      if (!instruction) {
        this.error();
        return;
      }

      store.commit('writeRam', { address: this.memoryPager,
                                 value: instruction.byte });

      let targetLo, targetHi, branchTo, relativeTarget;

      switch(mode) {
        case 'absolute':
        case 'absoluteX':
        case 'absoluteY':
          targetHi = operand.substring(1, 3);
          targetLo = operand.substring(3, 5);
          break;
        case 'immediate':
          targetLo = operand.substring(2, 4);
          break;
        case 'indirectIndexed':
        case 'indexedIndirect':
          targetLo = operand.substring(2, 4);
          break;
        case 'relative': // this one is tricky! 
          branchTo = this.stringToWord(operand.substring(1, 5));
          relativeTarget = this.signedIntToByte((branchTo - (this.memoryPager + 2)) & 0xff);
          targetLo = this.hexByte(relativeTarget);
          break;
        case 'zeroPage':
        case 'zeroPageX':
        case 'zeroPageY':
          targetLo = operand.substring(1, 3);
          break;
      }

      // little-endian; write low byte of 16-bit operands first
      if (targetLo) {
        store.commit('writeRam', { address: this.memoryPager + 1,
                                   value: this.stringToByte(targetLo) });
      }
      if (targetHi) {
        store.commit('writeRam', { address: this.memoryPager + 2,
                                   value: this.stringToByte(targetHi) });
      }
    },
  }
}
