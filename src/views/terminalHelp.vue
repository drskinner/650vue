<template>
  <div class="terminal-help-content">
    <h1>Using the Terminal</h1>
    <div class="row">
      <div class="column-left">
        <figure>
          <img src="@/assets/manual/terminal.png">
          <figcaption>650Vue's <em>Vuepermon</em> virtual terminal</figcaption>
        </figure>
      </div>
      <div class="column-right">
        <p>
The main way of interacting with the 650Vue virtual machine is through the virtual terminal. The
large, upper window displays the terminal's output, and the small, lower box is where you enter
commands. There's no "submit" button; just enter a one-line command into the input box and press
RETURN. The terminal will process your command and display the results in the output window.
        </p>
        <p>
The terminal gives you access to a monitor that is similar to the Commodore 128's built-in
machine language monitor or Jim Butterfield's
<a href="https://github.com/jblang/supermon64" target="_blank">Supermon</a>
for Commodore's 8-bit computers. Anyone who used Supermon back in the day should feel right at home
with 650Vue's monitor&mdash;which, in the interest of terrible wordplay, we can call <em>Vuepermon</em>.
With Vuepermon, you can examine and modify virtual RAM and the 6502's status registers. You can enter
new instructions through the simple assembler and read through existing programs with the disassembler.
You can load programs from the virtual disk and run them from the terminal.
        </p>
        <h2>Vuepermon Command Reference</h2>
        <dl>
          <dt><code>d [&lt;address&gt;]</code></dt>
          <dd>
            Example: <code>d c000</code><br>
            Disassemble 16 instructions beginning at &lt;address&gt;. After the first
            16 lines are displayed, entering <code>d</code> with no arguments will
            continue disassembling from where you left off.
          </dd>
          <dt><code>g [&lt;address&gt;]</code></dt>
          <dd>
            Example: <code>g c000</code><br>
            Begin executing code from <code>address</code>. 650Vue will continue execution
            until it encounters a <code>BRK</code> instruction, an illegal opcode, or 
            receives a Non-Maskable Interrupt telling it to stop. If you don't supply an
            address, execution will begin at the program counter's current value.
          </dd>
          <dt><code>l &lt;filename&gt;</code></dt>
          <dd>
            Example: <code>l hello</code><br>
            Load <code>filename</code> from the virtual disk. Do not enclose filename
            in quotes.
          </dd>
          <dt><code>m [&lt;start_address&gt;] [&lt;end_address&gt;]</code></dt>
          <dd>
            Example: <code>m bff0 c010</code><br>
            Display up to 128 bytes of memory beginning at <code>start_address</code>.
            Each line of the display will list a 16-bit hexadecimal address, then
            the hexadecimal values of the 8 bytes starting at that address, followed
            by the ASCII representation of those same 8 bytes. After the first
            screenful of data, entering <code>m</code> with no arguments will continue
            displaying memory from where you left off.
          </dd>
          <dt><code>p &lt;address&gt;</code></dt>
          <dd>
            Example: <code>p c000</code><br>
            Set the Program Counter to <code>address</code>. Used when you want to
            start single-stepping from a specific instruction.
          </dd>
          <dt><code>r</code></dt>
          <dd>
            Display the 6502 registers.
          </dd>
          <dt><code>z</code></dt>
          <dd>
            Fill screen RAM with zeroes and force a screen refresh, effectively clearing
            the video display.
          </dd>
          <dt><code>> &lt;address&gt; &lt;byte&gt; [&lt;byte&gt; &lt;byte&gt; ...]</code></dt>
          <dd>
            Example: <code>> c010 48 65 6c 6c 6f 2c 20</code><br>
            Write a series of hexadecimal bytes to memory, beginning at <code>address</code>.
            You can enter as many bytes as will fit in a single line of input.
          </dd>
          <dt><code>; &lt;pc&gt; &lt;sr&gt; &lt;ac&gt; &lt;xr&gt; &lt;yr&gt; &lt;sp&gt;</code></dt>
          <dd>
            Example: <code>; c000 30 a0 00 00 fd</code><br>
            Set all the CPU registers. You must include all registers in order, from left
            to right: program counter, status register, accumulator, x-register, y-register,
            and stack pointer.
          </dd>
          <dt><code>. &lt;address&gt; &lt;opcode&gt; [&lt;operand&gt;]</code></dt>
          <dd>
            Example: <code>. c000 lda #$2a</code><br>
            Assemble one instruction at <code>address</code>. The assembler will determine
            the correct addressing mode from the syntax of <code>operand</code>. You must
            enter the operand precisely (see Addressing Modes below). When you enter a
            valid instruction, the terminal will prompt you to enter a new opcode at the
            next available address. 
          </dd>
        </dl>
        <h2>Addressing Modes</h2>
        <p>
Vuepermon's assembler is very simple and not user-friendly. As of this writing, you can't
use labels or macros and you have to enter instructions with the precise syntax the
assembler expects. While I don't intend to teach 6502 assembly language here, I thought it
would be helpful to lay out the address modes and their syntax for reference.
        </p>
        <table>
          <tr>
            <th>Addressing Mode</th>
            <th>Example Syntax</th>
            <th>Comments</th>
          </tr>
          <tr>
            <td>Absolute</td>
            <td><code>jsr $ffd2</code></td>
          </tr>
          <tr>
            <td>Absolute,X</td>
            <td><code>lda $c000,x</code></td>
          </tr>
          <tr>
            <td>Absolute,Y</td>
            <td><code>sta $c000,y</code></td>
          </tr>
          <tr>
            <td>Accumulator</td>
            <td><code>ror</code></td>
            <td>Use <code>ror</code> instead of <code>ror a</code>.</td>
          </tr>
          <tr>
            <td>Immediate</td>
            <td><code>lda #$2a</code></td>
          </tr>
          <tr>
            <td>Implied</td>
            <td><code>dex</code></td>
          </tr>
          <tr>
            <td>Indexed, Indirect</td>
            <td><code>lda ($20,x)</code></td>
          </tr>
          <tr>
          <tr>
            <td>Indirect</td>
            <td><code>jmp ($c000)</code></td>
          </tr>
          <tr>
            <td>Indirect, Indexed</td>
            <td><code>lda ($20),y</code></td>
          </tr>  
          <tr>
            <td>Relative</td>
            <td><code>beq $c010</code></td>
            <td>Enter target address of branch.</td>
          </tr>
          <tr>
            <td>Zero Page</td>
            <td><code>lda $c0</code></td>
          </tr>
          <tr>
            <td>Zero Page,X</td>
            <td><code>lda $fe,x</code></td>
          </tr>
          <tr>
            <td>Zero Page,Y</td>
            <td><code>lda $fe,y</code></td>
          </tr>                     
        </table>
        <p>
The assembler expects lowercase operands but opcodes are not case-sensitive. The
disassembler will display opcodes in ALL CAPS and operands in lowercase.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .terminal-help-content {
    padding: 0 40px 0 40px;
    text-align: left;
  }

  .column-left {
    flex: 20%;
    padding: 0 20px 0 40px;
  }

  .column-right {
    flex: 80%;
    padding-right: 40px;
  }

  h1 {
    text-align: center;
  }

  figure {
    text-align: center;
  }

  dd {
    margin-bottom: 5px;
  }

  th {
    padding-right: 20px;
  }

  code {
    font-size: 1.2em;
  }
</style>
