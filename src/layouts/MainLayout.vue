<template>
  <el-container class="layout">
    <el-header class="header">
      <header-bar />
    </el-header>
    <el-container class="content">
      <el-aside class="menu">
        <side-menu />
      </el-aside>
      <el-main class="main-view">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue'
import SideMenu from '@/components/SideMenu.vue'
</script>

<style scoped>
.layout {
  width: 100%;
  height: 100vh;
}
.header {
  height: 60px;
  padding: 0;
  border-bottom: 1px solid #ddd;
}
.menu {
  width: 200px;
  border-right: 1px solid #ddd;
}
.main-view {
  padding: 20px;
  overflow-y: auto;
}
</style>
