<template>
  <div class="login-wrapper">
    <div class="login-box">
      <h2 style="margin-bottom: 24px; color: #409eff">工会运动后台管理系统</h2>

      <el-form :model="form" label-width="auto" class="login-form">
        <el-form-item>
          <el-input v-model="account" placeholder="请输入账号" size="large" :prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="autoLogin">自动登录</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="login"
            :loading="loading"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const account = ref('')
const password = ref('')
const autoLogin = ref(true)
const loading = ref(false)
const router = useRouter()
const userStore = useUserStore()

const form = ref({
  account: '',
  password: '',
})

const login = async () => {
  if (!account.value || !password.value) {
    ElMessage.warning('请输入账号和密码')
    return
  }

  loading.value = true
  try {
    const ok = await userStore.login(account.value, password.value)
    if (ok) {
      // 记住账号密码用于下次自动登录
      if (autoLogin.value) {
        localStorage.setItem('autoLoginEnabled', 'true')
        localStorage.setItem('autoLoginAccount', account.value)
        localStorage.setItem('autoLoginPassword', password.value)
      } else {
        localStorage.removeItem('autoLoginEnabled')
        localStorage.removeItem('autoLoginAccount')
        localStorage.removeItem('autoLoginPassword')
      }
      router.push('/')
      ElMessage.success('登录成功')
    } else {
      ElMessage.error('登录失败，请检查账号和密码')
    }
  } catch (error) {
    // 错误信息已由request拦截器统一处理
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const savedAutoLogin = localStorage.getItem('autoLoginEnabled')
  if (savedAutoLogin !== null) autoLogin.value = savedAutoLogin === 'true'

  if (autoLogin.value) {
    const savedAccount = localStorage.getItem('autoLoginAccount')
    const savedPassword = localStorage.getItem('autoLoginPassword')
    if (savedAccount) account.value = savedAccount
    if (savedPassword) password.value = savedPassword
  }
})
</script>

<style scoped>
.login-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-box {
  padding: 40px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  width: 400px;
  text-align: center;
}
.login-form {
  margin-top: 20px;
}
</style>
