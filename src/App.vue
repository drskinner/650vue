<template>
  <div id="app">
    <img src="@/assets/650vue_logo.png">
    <DisplayPanel />
    <hr>
    <DebugFlags />
  </div>
</template>

<script>
import DebugFlags from '@/components/debug-flags'
import DisplayPanel from './components/display-panel.vue'

export default {
  name: 'app',
  components: {
    DebugFlags,
    DisplayPanel
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
