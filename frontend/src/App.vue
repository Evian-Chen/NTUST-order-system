<script setup lang="ts">
// App.vue 現在只負責提供舞台給 router-view 表演
</script>

<template>
  <router-view></router-view>
</template>

<style>
/* 全域樣式設定 - 深色主題 */
body {
  margin: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #1a1a2e;
  color: #eaeaea;
}

* {
  box-sizing: border-box;
}
</style>