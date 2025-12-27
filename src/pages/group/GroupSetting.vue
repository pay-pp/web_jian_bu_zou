<template>
  <div class="group-setting">
    <div v-if="unionInfo">
      <h2>{{ unionInfo.name }}</h2>
      <p>成员总数: {{ unionInfo.unionCount }}</p>

      <!-- 编辑工会信息表单 -->
      <el-form :model="editForm" label-width="120px" @submit.prevent="submitUnionInfo">
        <input type="hidden" :value="editForm.id" />
        <el-form-item label="微信登录码">
          <el-input v-model="editForm.unionCode" placeholder="请输入微信登录码" />
        </el-form-item>
        <el-form-item label="每月奖励金额">
          <el-input
            v-model.number="editForm.rewardAmount"
            type="number"
            placeholder="请输入每月奖励金额"
          >
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="工会公告">
          <el-input
            v-model="editForm.gongGao"
            type="textarea"
            :rows="4"
            placeholder="请输入工会公告"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitUnionInfo">保存修改</el-button>
        </el-form-item>
      </el-form>

      <!-- 小组列表 -->
      <div class="group-list">
        <div class="list-header">
          <h3>小组列表</h3>
          <el-button type="primary" @click="dialogVisible = true">增加小组</el-button>
        </div>
        <el-table v-if="groupList.length" :data="groupList" style="width: 100%">
          <el-table-column prop="groupName" label="小组名称" />
          <el-table-column label="成员数量">
            <template #default="{ row }">
              {{ row.memberCount || row.members?.length || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                @click="deleteGroupHandler(row)"
                :disabled="
                  row.groupId === null ||
                  row.groupId === undefined ||
                  (row.memberCount || row.members?.length || 0) > 0 ||
                  row.groupName === '待加入小组人员'
                "
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else>暂无小组信息</div>
      </div>
    </div>
    <div v-else>
      <p>暂无工会信息</p>
    </div>

    <!-- 新增小组对话框 -->
    <el-dialog v-model="dialogVisible" title="新增小组" width="30%">
      <el-form :model="newGroupForm" label-width="80px">
        <input type="hidden" :value="{ id: unionInfo?.id }" />
        <el-form-item label="小组名称">
          <el-input v-model="newGroupForm.groupName" placeholder="请输入小组名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addGroup">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  fetchUnionInfo,
  updateUnionInfo,
  createGroup,
  deleteGroup as deleteGroupApi,
  type UnionInfo,
  type GroupInfo,
} from '@/api/group'
import { ElMessage, ElMessageBox } from 'element-plus'

/* 响应式数据 */
const unionInfo = ref<UnionInfo>()
const unionId = JSON.parse(localStorage.getItem('userInfo') || '{}').unionId || ''
console.log(unionInfo.value)
// 编辑工会表单
const editForm = ref({
  id: 0,
  unionCode: '',
  rewardAmount: 0,
  gongGao: '',
})

// 新增小组表单
const dialogVisible = ref(false)
const newGroupForm = ref({
  groupName: '',
})

// 计算属性：安全获取小组列表
const groupList = computed<GroupInfo[]>(() => {
  return unionInfo.value?.groupList || []
})

onMounted(async () => {
  if (!unionId) {
    ElMessage.warning('未找到工会ID，请重新登录')
    return
  }
  try {
    unionInfo.value = await fetchUnionInfo(unionId)
    // 初始化编辑表单
    if (unionInfo.value) {
      editForm.value = {
        id: unionInfo.value.id, // 加入id，但不对外展示
        unionCode: unionInfo.value.unionCode || '',
        rewardAmount: unionInfo.value.rewardAmount || 0,
        gongGao: unionInfo.value.gongGao || '',
      }
    }
  } catch (e) {
    console.error('获取工会信息失败', e)
    ElMessage.error('获取工会信息失败')
  }
})

// 提交工会信息修改
const submitUnionInfo = async () => {
  // 确保有 id
  if (!editForm.value.id) {
    ElMessage.error('缺少工会ID')
    return
  }
  try {
    // 调用API更新
    await updateUnionInfo(editForm.value)
    ElMessage.success('保存成功')
    // 更新 unionInfo 中的相应字段，保持其他字段不变
    if (unionInfo.value) {
      unionInfo.value = {
        ...unionInfo.value,
        unionCode: editForm.value.unionCode,
        rewardAmount: editForm.value.rewardAmount,
        gongGao: editForm.value.gongGao,
      }
    }
  } catch {
    ElMessage.error('保存失败')
  }
}

// 新增小组
const addGroup = async () => {
  if (!newGroupForm.value.groupName.trim()) {
    ElMessage.warning('请输入小组名称')
    return
  }
  if (!unionId) {
    ElMessage.error('未找到工会ID')
    return
  }
  try {
    await createGroup({
      unionId: Number(unionId),
      groupName: newGroupForm.value.groupName,
    })
    ElMessage.success('新增小组成功')
    dialogVisible.value = false
    newGroupForm.value.groupName = ''
    // 重新加载工会信息
    unionInfo.value = await fetchUnionInfo(unionId)
  } catch {
    ElMessage.error('新增小组失败')
  }
}

// 删除小组
const deleteGroupHandler = async (group: GroupInfo) => {
  // 判断是否为"未加入小组"（groupId为null）
  if (group.groupId === null || group.groupId === undefined) {
    ElMessage.warning('不能删除"未加入小组"')
    return
  }

  const memberCount = group.memberCount || group.members?.length || 0
  if (memberCount > 0) {
    ElMessage.warning('请先清空成员')
    return
  }

  try {
    await ElMessageBox.confirm('确定删除该小组吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteGroupApi(group.groupId)
    ElMessage.success('删除成功')

    // 重新加载工会信息
    if (unionId) {
      unionInfo.value = await fetchUnionInfo(unionId)
    }
  } catch {
    // 用户取消或删除失败（错误信息已由request拦截器统一处理）
  }
}
</script>

<style scoped>
.group-setting {
  padding: 20px;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 10px;
}
</style>
