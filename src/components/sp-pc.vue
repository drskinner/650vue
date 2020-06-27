<template>
  <div>
    <b>SP</b> <Segment :value="cpu.sp" />
    <b> PC</b> <Segment :value="cpu.pc" size='word' />
  </div>
</template>

<script>
import Segment from '@/components/segment';
import { mapState } from 'vuex';

export default {
  components: {
    Segment
  },
  computed: {
    ...mapState(['cpu'])
  }
}
</script>
