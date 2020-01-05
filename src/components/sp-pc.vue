<template>
  <div>
    <b>SP</b> <Segment :value="this.registers.sp" />
    <b> PC</b> <Segment :value="this.registers.pc" size='word' />
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
    }
  }
}
</script>
