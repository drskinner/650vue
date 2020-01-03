export const opcodes = new Map(
  [
    [0x00, { opcode: 'BRK', bytes: 1, cycles: 7, mode: 'implied' }],
    [0x88, { opcode: 'DEY', bytes: 1, cycles: 2, mode: 'implied' }],
    [0xa0, { opcode: 'LDY', bytes: 2, cycles: 2, mode: 'immediate' }],
    [0xa2, { opcode: 'LDX', bytes: 2, cycles: 2, mode: 'immediate' }],
    [0xa9, { opcode: 'LDA', bytes: 2, cycles: 2, mode: 'immediate' }],
    [0xad, { opcode: 'LDA', bytes: 3, cycles: 4, mode: 'absolute' }],
    [0xc8, { opcode: 'INY', bytes: 1, cycles: 2, mode: 'implied' }],
    [0xca, { opcode: 'DEX', bytes: 1, cycles: 2, mode: 'implied' }],
    [0xe8, { opcode: 'INX', bytes: 1, cycles: 2, mode: 'implied' }]
  ]
);
