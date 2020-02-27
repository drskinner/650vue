<template>
  <div class="about">
    <div class="about-content">
      <h1>About 650Vue</h1>
      <p>
650Vue is a single-page application written in Vue.js that simulates the MOS 6502
microprocessor. The simulator includes register displays, status lights, an internal
clock, a video display, file I/O (read-only in the public version), and a full-featured
terminal with a machine-language monitor, assembler, and disassembler. 650Vue 
simulates the full official instruction set of the 6502 and even attempts to replicate 
some well-documented bugs in the original hardware. A Vuex store acts like a data bus and
allows the virtual CPU to address a full 64 kilobytes of virtual RAM. The simulated internal
clock, running at approximately 600kHz, can handle an IRQ interrupt service routine on each
browser display repaint cycle.
      </p>
      <p>
If you would like to learn more about how 650Vue is put together, you can
<a href="https://github.com/drskinner/650vue" target="_blank">browse the public repository</a>
on GitHub. The public version of 650Vue is hosted on GitHub at 
<a href="https://drskinner.github.io/650vue/">https://drskinner.github.io/650vue/</a>.
      </p>
      <h2>Simulators vs. Emulators</h2>
      <p>
650Vue is more of a 6502 simulator than a 6502 emulator. A <em>simulator</em> creates a software
environment capable of executing arbitrary code; an <em>emulator</em> attempts to mimic some
real-world hardware as closely as possible. 650Vue does not emulate any actual computer hardware
but employs a lot of tricks to simulate a working machine. There is no data bus and no address
bus; the CPU registers and RAM all live in a Vuex store. File I/O is handled with an Axios call
to local storage. The video "display" is a big textarea that mirrors the bytes stored in screen
RAM. I've faked the clock oscillator (see below), but even so, 650Vue can run interrupt-driven 6502
machine-language programs as long as precise timing is not a requirement. Although
650Vue has no real-world analogue, it is a bit like a more user-friendly version of MOS Technology,
Inc.'s <a href="https://en.wikipedia.org/wiki/KIM-1">KIM-1</a> computer.
      </p>
      <h2>Timing, Interrupts, and the Virtual Clock</h2>
      <p>
650Vue does not implement a precise clock. Instead, it will try to run 10,000 CPU cycles' worth of
machine-language instructions on every browser repaint. The repaint typically occurs
60 times per second, so we can aspire to an effective clock rate of 600,000 CPU cycles per second,
or 600kHz. However, the repaint rate tends to fluctuate, and a slow repaint or heavy garbage 
collection can put a serious dent in the browser's frame rate, causing the virtual CPU's
effective clock speed to drop. 650Vue isn't really optimized for steady performance, but it can run
programs at close to full speed if we're willing to tolerate small inaccuracies in the timing.
      </p>
      <p>
650Vue can handle interrupt requests. On each browser repaint frame, after the CPU has burned
through 10,000-ish cycles, it will check bit 2 of the status register&mdash;the interrupt disable
flag. If interrupts are enabled, the CPU will jump to the routine pointed to by the 6502's IRQ
vector and will resume normal execution when it encounters an RTI (Return From Interrupt)
instruction. You need to be careful, though, because interrupt-driven routines can eat a LOT
of your computer's RAM and CPU. If your machine gets hot and your fan starts running excessively,
the STOP button will generate an NMI (Non-Maskable Interrupt) and immediately halt execution.
      </p>
    </div>
  </div>
</template>

<style scoped>
.about-content {
  padding: 0 40px 0 40px;
  text-align: left;
}
</style>
