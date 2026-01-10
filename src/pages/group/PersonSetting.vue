<template>
  <div class="person-setting">
    <div v-if="unionInfo">
      <h2>{{ unionInfo.name }}人员详情</h2>

      <!-- 各小组折叠面板 -->
      <div v-for="group in regularGroups" :key="group.groupId ?? 'unjoined'" class="group-collapse">
        <el-collapse>
          <el-collapse-item :title="`${group.groupName}人员信息详情`">
            <el-table
              :data="group.membersList || group.members || []"
              :row-class-name="tableRowClassName"
              style="width: 100%"
            >
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="wxname" label="微信名" />
              <el-table-column label="角色">
                <template #default="{ row }">
                  {{ row.role === 2 ? '组长' : '组员' }}
                </template>
              </el-table-column>
              <el-table-column label="状态">
                <template #default="{ row }">
                  {{ row.status === 0 ? '禁用' : '正常' }}
                </template>
              </el-table-column>
              <el-table-column label="初次登录">
                <template #default="{ row }">
                  {{ formatDateTime(row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="最近登录">
                <template #default="{ row }">
                  {{ formatDateTime(row.updateTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-dropdown @command="handleCommand($event, row, group.groupId)">
                    <el-button type="primary" size="small">
                      操作<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="setLeader" v-if="row.role !== 2"
                          >设为组长</el-dropdown-item
                        >
                        <el-dropdown-item command="setMember" v-if="row.role === 2"
                          >设为组员</el-dropdown-item
                        >
                        <el-dropdown-item command="removeFromGroup">移出小组</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 选择小组对话框 -->
      <el-dialog v-model="selectGroupDialogVisible" title="选择小组" width="30%">
        <el-form label-width="100px">
          <el-form-item label="用户信息">
            <span>{{ selectedUser?.name }} ({{ selectedUser?.wxname }})</span>
          </el-form-item>
          <el-form-item label="选择小组">
            <el-select v-model="selectedGroupId" placeholder="请选择小组" style="width: 100%">
              <el-option
                v-for="group in regularGroups"
                :key="group.groupId"
                :label="group.groupName"
                :value="group.groupId"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="selectGroupDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmAddToGroup">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 禁用用户 -->
      <div class="disabled-group">
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="禁用用户" name="disabled">
            <el-table
              :data="disabledMembers"
              :row-class-name="tableRowClassName"
              style="width: 100%"
            >
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="wxname" label="微信名" />
              <el-table-column label="角色">
                <template #default="{ row }">
                  {{ row.role === 2 ? '组长' : '组员' }}
                </template>
              </el-table-column>
              <el-table-column label="状态">
                <template #default="{ row }">
                  {{ row.status === 0 ? '禁用' : '正常' }}
                </template>
              </el-table-column>
              <el-table-column label="初次登录">
                <template #default="{ row }">
                  {{ formatDateTime(row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="最近登录">
                <template #default="{ row }">
                  {{ formatDateTime(row.updateTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-dropdown @command="handleDisabledCommand($event, row)">
                    <el-button type="primary" size="small">
                      操作<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="restoreUser">恢复权限</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 待加入小组人员（未加入小组） -->
      <div class="pending-group">
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="待加入小组人员" name="pending">
            <el-table
              :data="pendingGroup.membersList || pendingGroup.members || []"
              :row-class-name="tableRowClassName"
              style="width: 100%"
            >
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="wxname" label="微信名" />
              <el-table-column label="角色">
                <template #default="{ row }">
                  {{ row.role === 2 ? '组长' : '组员' }}
                </template>
              </el-table-column>
              <el-table-column label="状态">
                <template #default="{ row }">
                  {{ row.status === 0 ? '禁用' : '正常' }}
                </template>
              </el-table-column>
              <el-table-column label="初次登录">
                <template #default="{ row }">
                  {{ formatDateTime(row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="最近登录">
                <template #default="{ row }">
                  {{ formatDateTime(row.updateTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-dropdown @command="handlePendingCommand($event, row)">
                    <el-button type="primary" size="small">
                      操作<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="addToGroup">添加到小组</el-dropdown-item>
                        <el-dropdown-item command="deleteUser">删除用户</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
    <div v-else>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  fetchUnionInfo,
  updateMemberRole,
  removeMember,
  addMemberToGroup,
  deleteUser,
  restoreUser,
  type UnionInfo,
  type GroupInfo,
  type GroupMember,
} from '@/api/group'
import { ElMessage, ElMessageBox } from 'element-plus'

const unionInfo = ref<UnionInfo>()
const unionId = JSON.parse(localStorage.getItem('userInfo') || '{}').unionId || ''
const activeCollapse = ref(['pending']) // 默认展开待加入小组人员

// 选择小组对话框
const selectGroupDialogVisible = ref(false)
const selectedUser = ref<GroupMember | null>(null)
const selectedGroupId = ref<number | null>(null)

/**
 * 生成操作人openid（管理员名称+当前时间）
 */
const generateOperatorOpenid = (): string => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const managerName = userInfo.name || '管理员'
  const timestamp = new Date().toISOString()
  return `${managerName}_${timestamp}`
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string | null | undefined): string => {
  if (!dateTime) return '-'
  try {
    const date = new Date(dateTime)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateTime
  }
}

onMounted(async () => {
  if (!unionId) {
    ElMessage.warning('未找到工会ID，请重新登录')
    return
  }
  try {
    unionInfo.value = await fetchUnionInfo(unionId)
  } catch (e) {
    console.error('获取工会信息失败', e)
    ElMessage.error('获取工会信息失败')
  }
})

// 普通小组（排除未加入小组）
const regularGroups = computed<GroupInfo[]>(() => {
  if (!unionInfo.value?.groupList) return []
  return unionInfo.value.groupList.filter(
    (g: GroupInfo) => g.groupId !== null && g.groupId !== undefined,
  )
})

// 待加入小组人员（groupId为null且groupName为"待加入小组人员"的组）
const pendingGroup = computed<GroupInfo>(() => {
  if (!unionInfo.value?.groupList)
    return { groupId: null, groupName: '待加入小组人员', members: [], memberCount: 0 }
  const pending = unionInfo.value.groupList.find(
    (g: GroupInfo) => (g.groupId === null || g.groupId === undefined) && g.groupName === '待加入小组人员',
  )
  return pending || { groupId: null, groupName: '待加入小组人员', members: [], memberCount: 0 }
})

// 禁用用户组（groupId为null且groupName为"禁用用户"的组）
const disabledGroup = computed<GroupInfo>(() => {
  if (!unionInfo.value?.groupList)
    return { groupId: null, groupName: '禁用用户', members: [], memberCount: 0 }
  const disabled = unionInfo.value.groupList.find(
    (g: GroupInfo) => (g.groupId === null || g.groupId === undefined) && g.groupName === '禁用用户',
  )
  return disabled || { groupId: null, groupName: '禁用用户', members: [], memberCount: 0 }
})

// 禁用用户列表（从禁用用户组中获取）
const disabledMembers = computed<GroupMember[]>(() => {
  return disabledGroup.value.membersList || disabledGroup.value.members || []
})

// 处理普通小组操作
const handleCommand = async (command: string, row: GroupMember, groupId: number | null) => {
  if (groupId === null || groupId === undefined) {
    ElMessage.warning('无效的小组ID')
    return
  }

  const userId = row.openid
  const operatorOpenid = generateOperatorOpenid()

  switch (command) {
    case 'setLeader':
      try {
        await ElMessageBox.confirm('确定将该用户设为组长吗？', '提示', { type: 'warning' })
        await updateMemberRole({
          openid: userId,
          groupId,
          role: 2,
          operatorOpenid,
        })
        ElMessage.success('已设为组长')
        // 重新加载数据
        if (unionId) {
          unionInfo.value = await fetchUnionInfo(unionId)
        }
      } catch {
        // 错误信息已由request拦截器统一处理
      }
      break
    case 'setMember':
      try {
        await ElMessageBox.confirm('确定将该用户设为组员吗？', '提示', { type: 'warning' })
        await updateMemberRole({
          openid: userId,
          groupId,
          role: 1,
          operatorOpenid,
        })
        ElMessage.success('已设为组员')
        // 重新加载数据
        if (unionId) {
          unionInfo.value = await fetchUnionInfo(unionId)
        }
      } catch {
        // 错误信息已由request拦截器统一处理
      }
      break
    case 'removeFromGroup':
      try {
        await ElMessageBox.confirm('确定将该用户移出小组吗？', '提示', { type: 'warning' })
        await removeMember({
          openid: userId,
          groupId,
          operatorOpenid,
        })
        ElMessage.success('已移出小组')
        // 重新加载数据
        if (unionId) {
          unionInfo.value = await fetchUnionInfo(unionId)
        }
      } catch {
        // 错误信息已由request拦截器统一处理
      }
      break
  }
}

// 处理待加入小组操作
const handlePendingCommand = async (command: string, row: GroupMember) => {
  const userId = row.openid

  switch (command) {
    case 'addToGroup':
      // 检查是否有可添加的小组
      if (regularGroups.value.length === 0) {
        ElMessage.warning('没有可添加的小组')
        return
      }
      // 弹出选择小组对话框
      selectedUser.value = row
      selectedGroupId.value = null
      selectGroupDialogVisible.value = true
      break
    case 'deleteUser':
      try {
        await ElMessageBox.confirm('确定删除该用户吗？', '提示', { type: 'warning' })
        await deleteUser(userId)
        ElMessage.success('已删除用户')
        // 重新加载数据
        if (unionId) {
          unionInfo.value = await fetchUnionInfo(unionId)
        }
      } catch {
        // 错误信息已由request拦截器统一处理
      }
      break
  }
}

// 处理禁用用户操作（仅允许恢复权限，后续可扩展启用功能）
const handleDisabledCommand = async (command: string, row: GroupMember) => {
  const userId = row.openid

  switch (command) {
    case 'restoreUser':
      try {
        await ElMessageBox.confirm('确定恢复该用户权限吗？', '提示', { type: 'warning' })
        await restoreUser({
          openid: userId,
          operatorOpenid: generateOperatorOpenid(),
        })
        ElMessage.success('已恢复用户权限')
        // 重新加载数据
        if (unionId) {
          unionInfo.value = await fetchUnionInfo(unionId)
        }
      } catch {
        // 错误信息已由request拦截器统一处理
      }
      break
  }
}

// 表格行类名
const tableRowClassName = ({ row }: { row: GroupMember }) => {
  return row.role === 2 ? 'leader-row' : ''
}

// 确认添加到小组
const confirmAddToGroup = async () => {
  if (!selectedUser.value || selectedGroupId.value === null) {
    ElMessage.warning('请选择小组')
    return
  }

  try {
    const operatorOpenid = generateOperatorOpenid()
    await addMemberToGroup({
      openid: selectedUser.value.openid,
      groupId: selectedGroupId.value,
      operatorOpenid,
    })
    ElMessage.success('已添加到小组')
    selectGroupDialogVisible.value = false
    selectedUser.value = null
    selectedGroupId.value = null
    // 重新加载数据
    if (unionId) {
      unionInfo.value = await fetchUnionInfo(unionId)
    }
  } catch {
    // 错误信息已由request拦截器统一处理
  }
}
</script>

<style scoped>
.person-setting {
  padding: 20px;
}
.group-collapse,
.pending-group,
.disabled-group {
  margin-bottom: 20px;
}

/* 折叠栏标题样式优化 */
:deep(.el-collapse-item__header) {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  padding: 16px 20px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

:deep(.el-collapse-item__header:hover) {
  background-color: #e9ecef;
}

/* 组长行样式 - 淡蓝色 */
::v-deep(.leader-row) {
  background-color: #e6f7ff !important;
}
</style>
