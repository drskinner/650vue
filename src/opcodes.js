export const opcodes = new Map(
  [
    [0x00, { opcode: 'BRK', bytes: 1, cycles: 7, mode: 'implied' }],
    [0x06, { opcode: 'ASL', bytes: 2, cycles: 5, mode: 'zeroPage' }],
    [0x0a, { opcode: 'ASL', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x0e, { opcode: 'ASL', bytes: 3, cycles: 6, mode: 'absolute' }],

    [0x16, { opcode: 'ASL', bytes: 2, cycles: 6, mode: 'zeroPageX' }],
    [0x18, { opcode: 'CLC', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x1e, { opcode: 'ASL', bytes: 3, cycles: 7, mode: 'absoluteX' }],

    [0x26, { opcode: 'ROL', bytes: 2, cycles: 5, mode: 'zeroPage' }],
    [0x2a, { opcode: 'ROL', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x2e, { opcode: 'ROL', bytes: 3, cycles: 6, mode: 'absolute' }],

    [0x36, { opcode: 'ROL', bytes: 2, cycles: 6, mode: 'zeroPageX' }],
    [0x38, { opcode: 'SEC', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x3e, { opcode: 'ROL', bytes: 3, cycles: 7, mode: 'absoluteX' }],

    [0x46, { opcode: 'LSR', bytes: 2, cycles: 5, mode: 'zeroPage' }],
    [0x4a, { opcode: 'LSR', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x4c, { opcode: 'JMP', bytes: 3, cycles: 3, mode: 'absolute' }],
    [0x4e, { opcode: 'LSR', bytes: 3, cycles: 7, mode: 'absoluteX' }],

    [0x56, { opcode: 'LSR', bytes: 2, cycles: 6, mode: 'zeroPageX' }],
    [0x58, { opcode: 'CLI', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x5e, { opcode: 'LSR', bytes: 3, cycles: 6, mode: 'absolute' }],

    [0x66, { opcode: 'ROR', bytes: 2, cycles: 5, mode: 'zeroPage' }],
    [0x6a, { opcode: 'ROR', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x6e, { opcode: 'ROR', bytes: 3, cycles: 6, mode: 'absolute' }],

    [0x76, { opcode: 'ROR', bytes: 2, cycles: 6, mode: 'zeroPageX' }],
    [0x78, { opcode: 'SEI', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x7e, { opcode: 'ROR', bytes: 3, cycles: 7, mode: 'absoluteX' }],

    [0x88, { opcode: 'DEY', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x8a, { opcode: 'TXA', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x8d, { opcode: 'STA', bytes: 3, cycles: 4, mode: 'absolute' }],

    [0x98, { opcode: 'TYA', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x9d, { opcode: 'STA', bytes: 3, cycles: 5, mode: 'absoluteY' }],
    [0x9a, { opcode: 'TXS', bytes: 1, cycles: 2, mode: 'implied' }],
    [0x9d, { opcode: 'STA', bytes: 3, cycles: 5, mode: 'absoluteX' }],

    [0xa0, { opcode: 'LDY', bytes: 2, cycles: 2, mode: 'immediate' }],
    [0xa2, { opcode: 'LDX', bytes: 2, cycles: 2, mode: 'immediate' }],
    [0xa4, { opcode: 'LDY', bytes: 2, cycles: 3, mode: 'zeroPage' }],
    [0xa5, { opcode: 'LDA', bytes: 2, cycles: 3, mode: 'zeroPage' }],
    [0xa6, { opcode: 'LDX', bytes: 2, cycles: 3, mode: 'zeroPage' }],
    [0xa8, { opcode: 'TAY', bytes: 1, cycles: 2, mode: 'implied' }],
    [0xa9, { opcode: 'LDA', bytes: 2, cycles: 2, mode: 'immediate' }],
    [0xaa, { opcode: 'TAX', bytes: 1, cycles: 2, mode: 'implied' }],
    [0xac, { opcode: 'LDY', bytes: 3, cycles: 4, mode: 'absolute' }],
    [0xad, { opcode: 'LDA', bytes: 3, cycles: 4, mode: 'absolute' }],
    [0xae, { opcode: 'LDX', bytes: 3, cycles: 4, mode: 'absolute' }],

    [0xb4, { opcode: 'LDY', bytes: 2, cycles: 4, mode: 'zeroPageX' }],
    [0xb5, { opcode: 'LDA', bytes: 2, cycles: 4, mode: 'zeroPageX' }],
    [0xb6, { opcode: 'LDX', bytes: 2, cycles: 4, mode: 'zeroPageY' }],
    [0xb8, { opcode: 'CLV', bytes: 1, cycles: 2, mode: 'implied' }],
    [0xb9, { opcode: 'LDA', bytes: 3, cycles: 4, mode: 'absoluteY' }],
    [0xba, { opcode: 'TSX', bytes: 1, cycles: 2, mode: 'implied' }],
    [0xbc, { opcode: 'LDY', bytes: 3, cycles: 4, mode: 'absoluteX' }],
    [0xbd, { opcode: 'LDA', bytes: 3, cycles: 4, mode: 'absoluteX' }],
    [0xbe, { opcode: 'LDX', bytes: 3, cycles: 4, mode: 'absoluteY' }],

    [0xc8, { opcode: 'INY', bytes: 1, cycles: 2, mode: 'implied' }],
    [0xca, { opcode: 'DEX', bytes: 1, cycles: 2, mode: 'implied' }],

    [0xd0, { opcode: 'BNE', bytes: 2, cycles: 2, mode: 'relative' }],
    [0xd8, { opcode: 'CLD', bytes: 1, cycles: 2, mode: 'implied' }],

    [0xe8, { opcode: 'INX', bytes: 1, cycles: 2, mode: 'implied' }],
    [0xea, { opcode: 'NOP', bytes: 1, cycles: 2, mode: 'implied' }],

    [0xf0, { opcode: 'BEQ', bytes: 2, cycles: 2, mode: 'relative' }],
    [0xf8, { opcode: 'SED', bytes: 1, cycles: 2, mode: 'implied' }],

    [0x100, { opcode: '???', bytes: 1, cycles: 0, mode: 'implied' }]
  ]
);
