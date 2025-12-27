<template>
  <el-header class="header-bar">
    <div class="title">工会运动后台管理系统</div>
    <div class="right">
      <el-text class="user-name">{{ userName }}</el-text>
      <el-button type="primary" plain @click="onLogout" size="small">退出登录</el-button>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const userName = computed(() => userStore.userInfo?.name ?? '未登录')

const onLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header-bar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #409eff;
  color: #fff;
  box-sizing: border-box;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  color: #fff;
}
</style>
