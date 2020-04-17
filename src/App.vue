<template>
  <div id="app">
    <div class="row header">
      <div class="title">
        <img src="@/assets/650vue_logo.png">
      </div>
    </div>
    <div id="nav">
      <router-link to="/computer">Computer</router-link> |
      <router-link to="/manual">Manual</router-link> |
      <router-link to="/terminal-help">Terminal Help</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<style>
body {
  background-image: url('~@/assets/leather.png');
  margin: none;
  overflow-y: scroll;
}

#app {
  font-family: 'Futura', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: none;
}

#nav {
  padding: 10px;
}

#nav a {
  font-weight: bold;
  color: #7b68ee;
}

#nav a:hover, a:hover {
  color: red;
}

#nav a.router-link-exact-active {
  color: sienna;
  font-weight: bold;
  text-decoration: none;
}

.row {
  display: flex;
}

.header {
  height: 10vw;
  background-image: url('~@/assets/burl.png');
}
</style>
