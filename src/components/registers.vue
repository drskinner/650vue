<template>
  <div>
    <b>AC</b> <Segment :value="this.registers.ac" size='byte' />
    <b> XR</b> <Segment :value="this.registers.xr" />
    <b> YR</b> <Segment :value="this.registers.yr" />
  </div>
</template>

<script>
import store from '@/store/index'
import Segment from '@/components/segment'

export default {
  components: {
    Segment,
  },
  computed: {
    registers() {
      return store.state.cpu;
    }
  }
}
</script>

<style scoped>
  div {
    padding-right: 28px;
  }
</style>
