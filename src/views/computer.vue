<template>
  <div id="app">
    <div class="row registers">
      <div class="column-left">
        <Registers />
      </div>
      <div class="column-right">
        <StatusLights />
      </div>
    </div>
    <div class="row">
      <div class="column-left">
        <Terminal />
      </div>
      <div class="column-right">
        <Video />
      </div>
    </div>
    <div class="row">
      <div class="column-left">
        <SpPc />
      </div>
      <div class="column-right">
        <RunCpu />
      </div>
    </div>
  </div>
</template>

<script>
import Registers from '@/components/registers'
import RunCpu from '@/components/run-cpu'
import SpPc from '@/components/sp-pc'
import StatusLights from '@/components/status-lights'
import Terminal from '@/components/terminal'
import Video from '@/components/video'

export default {
  name: 'computer',
  components: {
    Registers,
    RunCpu,
    SpPc,
    StatusLights,
    Terminal,
    Video
  }
}
</script>

<style>
  .row {
    display: flex;
  }

  .header {
    height: 10vw;
    background-image: url('~@/assets/burl.png');
  }

  .registers {
    padding-top: 10px;
  }

  .title {
    margin: 10px auto 10px auto;
    height: 8vw;
  }

  img {
    max-height: 100%;
  }

  .column-left {
    flex: 50%;
    padding-left: 20px;
  }

  .column-right {
    flex: 50%;
  }
</style>