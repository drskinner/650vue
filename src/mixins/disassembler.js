import { opcodes } from '@/opcodes'

export const disassembler = {
  methods: {
    disassemble() {
      // save memoryPager in data() for continuations
      let parts = this.command.split(' ');
      let lineCount = 0;
      let memoryPager = parseInt(parts[1], 16);

      while (lineCount < 0x10) {
        let instruction = opcodes.get(this.ram[memoryPager]);
        if (instruction === undefined) {
          instruction = opcodes.get(0x100);
        }

        let operand1 = this.ram[memoryPager + 1];
        let operand2 = this.ram[memoryPager + 2];
        
        let line = `. ${this.hexWord(memoryPager)}  `;
        line += `${this.hexByte(this.ram[memoryPager])} `;
        
        if (instruction.bytes >= 2) {
          line += `${this.hexByte(this.ram[memoryPager + 1])} `;
        } else {
          line += '   ';
        }
        if (instruction.bytes === 3) {
          line += `${this.hexByte(this.ram[memoryPager + 2])} `;
        } else {
          line += '   ';
        }
        line += `${instruction.opcode} `;

        switch (instruction.mode) {
          case 'absolute':
            line += `$${this.hexByte(operand2)}${this.hexByte(operand1)}`;
            break;
          case 'absoluteX':
            line += `$${this.hexByte(operand2)}${this.hexByte(operand1)},x`;
            break;
          case 'immediate':
            line += `#$${this.hexByte(operand1)}`;
            break;
          case 'implied':
            break;
          case 'relative': {
            let nextAddress = (memoryPager + 0x02) & 0xffff
            line += `$${this.hexWord(nextAddress + this.byteToSignedInt(nextAddress))}`;
            break;
          }
          default:
            break;
        }

        this.outputLine(line);

        memoryPager += instruction.bytes;
        lineCount += 1;
      }
    }
  }
}
