import { opcodes } from '@/opcodes'

export const disassembler = {
  methods: {
    disassemble(maxLines = 0x10) {
      let parts = this.command.split(' ');
      let lineCount = 0;
      if (parts.length > 1) {
        this.memoryPager = parseInt(parts[1], 16);
      }

      while (lineCount < maxLines) {
        let instruction = opcodes.get(this.ram[this.memoryPager]);
        if (instruction === undefined) {
          instruction = opcodes.get(0x100);
        }

        let operand1 = this.ram[this.memoryPager + 1];
        let operand2 = this.ram[this.memoryPager + 2];
        
        let line = `. ${this.hexWord(this.memoryPager)}  `;
        line += `${this.hexByte(this.ram[this.memoryPager])} `;
        
        if (instruction.bytes >= 2) {
          line += `${this.hexByte(this.ram[this.memoryPager + 1])} `;
        } else {
          line += '   ';
        }
        if (instruction.bytes === 3) {
          line += `${this.hexByte(this.ram[this.memoryPager + 2])} `;
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
            let nextAddress = (this.memoryPager + 0x02) & 0xffff
            line += `$${this.hexWord((nextAddress + this.byteToSignedInt(operand1)) & 0xffff)}`;
            break;
          }
          default:
            break;
        }

        this.outputLine(line);

        this.memoryPager += instruction.bytes;
        lineCount += 1;
      }
    }
  }
}
