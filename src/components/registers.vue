<template>
  <div class="registers-container">
    <b>AC</b> <Segment :value="cpu.ac" size='byte' />
    <b> XR</b> <Segment :value="cpu.xr" />
    <b> YR</b> <Segment :value="cpu.yr" />
  </div>
</template>

<script>
import Segment from '@/components/segment';
import { mapState } from 'vuex';

export default {
  components: {
    Segment,
  },
  computed: {
    ...mapState(['cpu'])
  }
}
</script>

<style scoped>
.registers-container {
  padding-right: 28px;
}
</style>
