<template>
  <div>
    This component will be removed. Just testing.
    {{ flags }}
    <ul>
      <li>NEGATIVE: {{ negative }}</li>
      <li>OVERFLOW: {{ overflow }}</li>
      <li>UNUSED: {{ unused }}</li>
      <li>BREAK: {{ bork }}</li>
      <li>DECIMAL: {{ decimal }}</li>
      <li>INTERRUPT: {{ interrupt }}</li>
      <li>ZERO: {{ zero }}</li>
      <li>CARRY: {{ carry }}</li>
    </ul>
  </div>
</template>

<script>
import constants from '@/const';

export default {
  computed: {
    flags() {
      return constants.flags;
    },
    carry() {
      return this.$store.getters.flagStatus(this.flags.SR_CARRY);
    },
    zero() {
      return this.$store.getters.flagStatus(this.flags.SR_ZERO);
    },
    interrupt() {
      return this.$store.getters.flagStatus(this.flags.SR_INTERRUPT);
    },
    decimal() {
      return this.$store.getters.flagStatus(this.flags.SR_DECIMAL);
    },
    bork() {
      return this.$store.getters.flagStatus(this.flags.SR_BREAK);
    },
    unused() {
      return this.$store.getters.flagStatus(this.flags.SR_UNUSED);
    },
    overflow() {
      return this.$store.getters.flagStatus(this.flags.SR_OVERFLOW);
    },
    negative() {
      return this.$store.getters.flagStatus(this.flags.SR_NEGATIVE);
    }
  }
}
</script>

<style scoped>
  ul {
    list-style-type: none;
  }
</style>