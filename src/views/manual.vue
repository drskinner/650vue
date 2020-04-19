<template>
  <div class="manual">
    <section id="manual-intro">
      <div class="disclaimer">The information in this manual has been reviewed and
        is believed to be entirely reliable. However, no responsibility is assumed
        for inaccuracies. The material in this manual is for informational purposes
        only and is subject to change without notice.</div>
      <h1>650Vue Manual</h1>
      <p>Congratulations and welcome to the exciting new world of micro-computers!
        As a user of the 650Vue Microcomputer Simulator Module&trade;, you now have at your
        disposal a completely operational, fully tested<sup>1</sup>, and very capable
        virtual computer built in VueJS. By selecting 650Vue, you have eliminated all
        of the problems of constructing and debugging a microcomputer system. No
        wiring or soldering! Your time is now available for learning the operation
        of the system and beginning immediately to apply it to your specific
        areas of interest.</p>
      <p>At the heart of 650Vue is a simulated MOS 6502 microprocessor. The 650Vue
        system is intended to provide you with a capable microcomputer for use in
        your "real-world" applications. Accordingly, the system includes a full
        64 kilobytes of virtual RAM to provide data and program storage for your
        application program. In addition, you are provided with status lights,
        digital readouts, a video output device, and a terminal for communicating
        with the virtual machine.</p>
      <p>This manual cannot presume to provide all of the technical information
        on the hardware or programming aspects of the simulated 6502 microprocessor.
        If you would like to learn more about 6502 programming, I recommend some
        <a href="http://www.6502.org/tutorials/" target="_blank">6502 Tutorials</a>.
        So much for introductory comments! Now lets get started and take a look at
        the components of 650Vue.</p>
    </section>
    
    <section id="manual-registers">
      <div class="row">
        <div class="column-left"></div>
        <div class="column-right">
          <h2>Registers</h2>
        </div>
      </div>
      <div class="row">
        <div class="column-left">
          <div class="segment-row">
            <b>AC</b> <Segment :value="66" size='byte' />
            <b> XR</b> <Segment :value="196" />
            <b> YR</b> <Segment :value="165" />
          </div>
          <div>
            <b>SP</b> <Segment :value="253" />
            <b> PC</b> <Segment :value="57495" size='word' />
          </div>
        </div>
        <div class="column-right">
          <p>The segmented displays (pictured at left) show the values of 650Vue's registers
            as they update in real time. At the normal execution speed of 600kHz, these
            displays update too quickly to be meaningful. When running in single-step mode
            or setting break points with the <code>BRK</code> instruction, these displays
            provide a useful debugging tool.</p>
          <p>Each register is labelled: <b>AC</b> for the accumulator, a register primarily
            concerned with arithmetic and logic operations; <b>XR</b> and <b>YR</b> for the
            X- and Y-registers, mainly used for loops and indexing; <b>SP</b> for the stack
            pointer, which points to an address on page 01 of RAM
            (<code>$0100</code>&ndash;<code>$01ff</code>), and <b>PC</b> for the program
            counter, which indicates the address of the next instruction to be executed.</p>
          <p>The 6502 processor status register is not shown with a segmented digital display,
            but instead with a strip of status lights as described in the next section.</p>
        </div>
      </div>
    </section>

    <section id="manual-status">
      <div class="row">
        <div class="column-left"></div>
        <div class="column-right">
          <h2>Status Flags</h2>
        </div>
      </div>
      <div class="row">
        <div class="column-left">
          <img class="clipping-full" src="@/assets/manual/status_lights.png">
        </div>
        <div class="column-right">
          <p>A row of eight lights displays the flags of the processor status register&mdash;if
            a light is on, the corresponding bit in the status register is set. Many 6502
            instructions will affect the state of the flags. From left to right, the flags 
            are: Negative (<b>N</b>), Overflow (<b>V</b>), Unused (<b>&ndash;</b>), Break 
            (<b>B</b>), Decimal (<b>D</b>), Interrupt (<b>I</b>), Zero (<b>Z</b>), and Carry
            (<b>C</b>). The unused flag, bit 5 of the status register, always returns 1 when 
            read, imitating the behaviour of a real 6502.</p>
        </div>
      </div>     
    </section>

    <section id="manual-control">
      <div class="row">
        <div class="column-left"></div>
        <div class="column-right">
          <h2>Control Buttons</h2>
        </div>
      </div>
      <div class="row">
        <div class="column-left">
          <div class="button-row">
            <button>RUN</button>
            <button>STEP</button>
            <button>STOP</button>
            <button>RESET</button>
          </div>
        </div>
        <div class="column-right">
          <p>There are three buttons to control the running state of the machine and one
            button to reset the virtual CPU. <b>RUN</b> will begin executing instructions
            starting from the address indicated by the program counter. 650Vue will continue
            program execution until either the <b>STOP</b> button is pressed or it encounters
            a <code>BRK</code> instruction or an undefined opcode. While the CPU is stopped,
            you can single-step through your code, executing one instruction at a time by
            pressing the <b>STEP</b> button.</p>
          <p>The <b>RESET</b> button returns the virtual machine to a predictable initial
            state. The reset sets the accumulator, x-register, and y-register to zero,
            fills the stack with zero bytes and initializes the stack pointer to
            <code>$fd</code>, sets status flags to zero, and sets the program counter to
            the address contained in the reset vector at addresses <code>$fffc</code> and
            <code>$fffd</code>. The reset process will not clear RAM so that any programs
            you have in memory persist.</p>
          <p>When 650Vue is first loaded in your web browser, all registers are in a random
            state. You can use <b>RESET</b> to initialize the machine.</p>
        </div>
      </div>
    </section>

    <section id="manual-video">
      <div class="row">
        <div class="column-left"></div>
        <div class="column-right">
          <h2>Video Display</h2>
          <p>The large region underneath the status lights is a 50-column, 20-line
            monochrome video display. 650Vue treats the 1,000 bytes starting at address
            <code>$1000</code> as virtual screen RAM and will draw characters corresponding
            to the ASCII value of each memory location in that region. For example, if you
            put the value <code>$41</code> (65 in decimal) at memory location
            <code>$1000</code>, an 'A' will appear in the top-left corner of the video
            display. The display is updated on every second browser repaint, giving an
            effective framerate of roughly 30Hz in most browsers.</p>
          <p>I have plans to improve the video display in future versions by giving it
            colour capabilities, pixel graphics, and making the base address of screen
            RAM configurable.</p>
        </div>
      </div>
      <div class="row">
        <div class="column-left"></div>
        <div class="column-right"></div>
      </div>
    </section>

    <section id="manual-terminal">
      <div class="row">
        <div class="column-left"></div>
        <div class="column-right">
          <h2>Terminal</h2>
        </div>
      </div>
      <div class="row">
        <div class="column-left">
          <img class="clipping-reduced" src="@/assets/manual/terminal.png">
        </div>
        <div class="column-right">
          <p>On the left side of the browser window, situated between the two sets
            of segmented displays, you will find the virtual terminal. The large,
            upper window displays the terminal's output, and the small, lower box
            is where you enter commands. There's no "submit" button; just enter a
            one-line command into the input box and press RETURN. The terminal will
            process your command and display the results in the output window.</p>
          <p>The terminal is the main way of interacting with the virtual machine;
            it gives you access to registers, memory, and a simple assembler/disassembler
            through a program known as a "machine language monitor". The monitor has
            many useful features&mdash;please consult the 
            <router-link :to="{ name: 'TerminalHelp' }">Terminal Documentation</router-link>
            for more detailed information.</p>
        </div>
      </div>
    </section>

    <section id="manual-zero-page">
      <div class="row">
        <div class="column-left"></div>
        <div class="column-right">
          <h2>Zero Page</h2>
          <p>The area of memory known as <i>zero page</i> (addresses <code>$0000</code>
          to <code>$00ff</code>) is important to 6502 programmers because instructions
          that operate on zero page use less memory and execute more quickly than those
          that operate on the full 64k address space. I've left most of zero page
          available for programs, but the first sixteen bytes (<code>$00</code> to
          <code>$0f</code>) are reserved for a future operating system.</p>
          <p>At the moment, location <code>$000f</code> acts like a read-only random
          number generator, so an instruction like <code>LDA $0f</code> will fetch
          a random number between <code>$00</code> and <code>$ff</code> and store it
          in the accumulator.</p>
        </div>
      </div>
    </section>

    <section id="manual-footnotes">
      <hr>
      <p><sup>1</sup>Not fully tested.</p>
    </section>
  </div>
</template>

<script>
import Segment from '@/components/segment'

export default {
  name: 'manual',
  components: {
    Segment
  }
}
</script>

<style scoped>
  .row {
    display: flex;
  }

  .column-left {
    flex: 40%;
    margin-left: 40px;
  }

  .column-right {
    flex: 60%;
    margin-right: 40px;
  }

  section {
    margin: 16px 0 0 0;
  }

  section#manual-intro {
    margin: 20px 40px;
  }

  code {
    font-size: 1.2em;
  }

  h1 {
    font-size: 2em;
  }

  h2 {
    text-align: left;
  }

  h2.intro-header {
    text-align: center;
  }

  p {
    text-align: left;
  }

  sup {
    font-size: 50%;
  }

  div.disclaimer {
    text-align: center;
    font-style: italic;
    padding: 0 100px;
  }

  section#manual-footnotes {
    font-size: 50%;
  }

  .segment-row, .button-row {
    margin-top: 20px;
    padding-bottom: 10px;
  }

  img.clipping-full {
    margin-top: 20px;
    width: 90%;
  }

  img.clipping-reduced {
    margin-top: 20px;
    width: 60%;
  }

  button {
    border: none;
    background: url('../assets/button.png') no-repeat top left;
    width: 58px;
    height: 58px;
    font-weight: bold;
  }
</style>