export default {
  flags: {  
    SR_CARRY:     0x01,
    SR_ZERO:      0x02,
    SR_INTERRUPT: 0x04,
    SR_DECIMAL:   0x08,
    SR_BREAK:     0x10,
    SR_UNUSED:    0x20,
    SR_OVERFLOW:  0x40,
    SR_NEGATIVE:  0x80
  },
  // I've borrowed the idea for zero-page pseduo-registers from
  // Stian Søreng. http://www.6502asm.com/help.html
  registers: {
    LAST_KEY: 0x0d,
    JIFFY_CLOCK: 0x0e,
    RANDOM: 0x0f
  }
}