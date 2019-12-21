<template>
  <div>
    AC: <Segment :value="this.registers.ac" size='byte' />
    XR: <Segment :value="this.registers.xr" />
    YR: <Segment :value="this.registers.yr" />
    SP: <Segment :value="this.registers.sp" />
    PC: <Segment :value="this.registers.pc" size='word' />
  </div>
</template>

<script>
import store from '@/store/index'
import Segment from '@/components/segment'

export default {
  components: {
    Segment
  },
  computed: {
    registers() {
      return store.state.cpu;
    },
    memory() {
      return store.state.ram;
    }
  }
}
</script>
