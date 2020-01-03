<template>
  <div id="app">
    <div class="row">
    <div class="column-left">
      <img src="@/assets/650vue_logo.png">
      <DisplayPanel />
      <RunCpu />
    </div>
    <div class="column-right">
      <Video />
      <Terminal />
      <hr>
      <DebugFlags />
    </div>
    </div>
  </div>
</template>

<script>
import DebugFlags from '@/components/debug-flags'
import DisplayPanel from './components/display-panel.vue'
import RunCpu from './components/run-cpu.vue'
import Terminal from './components/terminal.vue'
import Video from '@/components/video'

export default {
  name: 'app',
  components: {
    DebugFlags,
    DisplayPanel,
    RunCpu,
    Terminal,
    Video
  }
}
</script>

<style>
#app {
  font-family: 'Futura', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

.row {
  display: flex;
}

.column-left {
  flex: 50%;
  padding-left: 20px;
}

.column-right {
  flex: 50%;
}
</style>
