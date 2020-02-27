# 650Vue

650Vue is a single-page application written in Vue.js that simulates the MOS 6502
microprocessor. The simulator includes register displays, status lights, an internal
clock, a video display, file I/O (read-only in the public version), and a full-featured
terminal with a machine-language monitor, assembler, and disassembler. 650Vue 
simulates the full official instruction set of the 6502 and even attempts to replicate 
some well-documented bugs in the original hardware. A Vuex store acts like a data bus and
allows the virtual CPU to address a full 64 kilobytes of virtual RAM. The simulated internal
clock, running at approximately 600kHz, can handle an IRQ interrupt service routine on each
browser display repaint cycle.

The public version of 650Vue is hosted on GitHub at 
<a href="https://drskinner.github.io/650vue/">https://drskinner.github.io/650vue/</a>.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
