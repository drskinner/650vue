export const opcodes = new Map(
  [
    [0x00, { opcode: 'BRK', bytes: 1, cycles: 7, mode: 'implied' }],
    [0xa2, { opcode: 'LDX', bytes: 2, cycles: 2, mode: 'immediate' }],
    [0xca, { opcode: 'DEX', bytes: 1, cycles: 2, mode: 'implied' }],
    [0xe8, { opcode: 'INX', bytes: 1, cycles: 2, mode: 'implied' }]
  ]
);
