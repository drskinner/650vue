<template>
  <div>
    AC: <Segment :value="this.registers.ac" size='byte' />
    XR: <Segment :value="this.registers.xr" />
    YR: <Segment :value="this.registers.yr" />
    SP: <Segment :value="this.registers.sp" />
    PC: <Segment :value="this.registers.pc" size='word' />
    <StatusLights />
  </div>
</template>

<script>
import store from '@/store/index'
import Segment from '@/components/segment'
import StatusLights from '@/components/status-lights'

export default {
  components: {
    Segment,
    StatusLights
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
