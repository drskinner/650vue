<template>
  <div id="app">
    <img src="@/assets/650vue_logo.png">
    <DisplayPanel />
  </div>
</template>

<script>
import DisplayPanel from './components/display-panel.vue'

export default {
  name: 'app',
  components: {
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
