<template>
  <div class="feedback-page">
    <AppHeader />
    
    <div class="container">
      <div class="page-header">
        <h1>用户反馈</h1>
        <p>您的意见对我们很重要，帮助我们改进推荐系统</p>
      </div>
      
      <div class="feedback-content">
        <el-card class="feedback-card">
          <template #header>
            <h2>推荐满意度评价</h2>
          </template>
          
          <el-form 
            ref="feedbackFormRef"
            :model="feedbackForm"
            :rules="feedbackRules"
            label-width="120px"
            class="feedback-form"
          >
            <el-form-item label="整体满意度" prop="overallRating">
              <div class="rating-section">
                <el-rate 
                  v-model="feedbackForm.overallRating"
                  :colors="ratingColors"
                  show-text
                  :texts="ratingTexts"
                />
              </div>
            </el-form-item>
            
            <el-form-item label="推荐准确性" prop="accuracyRating">
              <div class="rating-section">
                <el-rate 
                  v-model="feedbackForm.accuracyRating"
                  :colors="ratingColors"
                  show-text
                  :texts="accuracyTexts"
                />
                <p class="rating-description">推荐的习题是否符合您的学习水平</p>
              </div>
            </el-form-item>
            
            <el-form-item label="内容多样性" prop="diversityRating">
              <div class="rating-section">
                <el-rate 
                  v-model="feedbackForm.diversityRating"
                  :colors="ratingColors"
                  show-text
                  :texts="diversityTexts"
                />
                <p class="rating-description">推荐的习题类型是否丰富多样</p>
              </div>
            </el-form-item>
            
            <el-form-item label="学习效果" prop="effectivenessRating">
              <div class="rating-section">
                <el-rate 
                  v-model="feedbackForm.effectivenessRating"
                  :colors="ratingColors"
                  show-text
                  :texts="effectivenessTexts"
                />
                <p class="rating-description">通过练习推荐的习题，您的学习效果如何</p>
              </div>
            </el-form-item>
            
            <el-form-item label="使用频率" prop="usageFrequency">
              <el-select v-model="feedbackForm.usageFrequency" placeholder="请选择使用频率">
                <el-option label="每天" value="daily" />
                <el-option label="每周2-3次" value="weekly" />
                <el-option label="每周1次" value="once_weekly" />
                <el-option label="偶尔使用" value="occasionally" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="最喜欢的功能">
              <el-checkbox-group v-model="feedbackForm.favoriteFeatures">
                <el-checkbox label="个性化推荐">个性化推荐</el-checkbox>
                <el-checkbox label="难度匹配">难度匹配</el-checkbox>
                <el-checkbox label="知识点覆盖">知识点覆盖</el-checkbox>
                <el-checkbox label="学习进度跟踪">学习进度跟踪</el-checkbox>
                <el-checkbox label="即时反馈">即时反馈</el-checkbox>
                <el-checkbox label="历史记录">历史记录</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="改进建议" prop="suggestions">
              <el-input
                v-model="feedbackForm.suggestions"
                type="textarea"
                :rows="4"
                placeholder="请分享您对系统的改进建议或遇到的问题..."
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="推荐给朋友">
              <el-rate 
                v-model="feedbackForm.recommendationScore"
                :colors="ratingColors"
                show-text
                :texts="recommendationTexts"
              />
              <p class="rating-description">您是否愿意将此系统推荐给朋友</p>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                size="large"
                :loading="submitting"
                @click="submitFeedback"
              >
                提交反馈
              </el-button>
              <el-button size="large" @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card class="stats-card">
          <template #header>
            <h2>反馈统计</h2>
          </template>
          
          <div class="stats-content">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">4.6</div>
                <div class="stat-label">平均满意度</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">1,234</div>
                <div class="stat-label">反馈总数</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">92%</div>
                <div class="stat-label">推荐率</div>
              </div>
            </div>
          </div>
          
          <div class="recent-feedback">
            <h3>最近反馈</h3>
            <div class="feedback-list">
              <div v-for="item in recentFeedback" :key="item.id" class="feedback-item">
                <div class="feedback-header">
                  <el-rate 
                    :model-value="item.rating" 
                    disabled 
                    size="small"
                  />
                  <span class="feedback-date">{{ formatDate(item.date) }}</span>
                </div>
                <p class="feedback-text">{{ item.comment }}</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Star, ChatDotRound, TrendCharts } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import AppHeader from '../components/AppHeader.vue'
import api from '../utils/api'

const feedbackFormRef = ref()
const submitting = ref(false)

const feedbackForm = reactive({
  overallRating: 0,
  accuracyRating: 0,
  diversityRating: 0,
  effectivenessRating: 0,
  usageFrequency: '',
  favoriteFeatures: [],
  suggestions: '',
  recommendationScore: 0
})

const feedbackRules = {
  overallRating: [
    { required: true, message: '请评价整体满意度', trigger: 'change' }
  ],
  accuracyRating: [
    { required: true, message: '请评价推荐准确性', trigger: 'change' }
  ],
  diversityRating: [
    { required: true, message: '请评价内容多样性', trigger: 'change' }
  ],
  effectivenessRating: [
    { required: true, message: '请评价学习效果', trigger: 'change' }
  ],
  usageFrequency: [
    { required: true, message: '请选择使用频率', trigger: 'change' }
  ]
}

const ratingColors = ['#ff4757', '#ffa502', '#2ed573']

const ratingTexts = ['很不满意', '不满意', '一般', '满意', '很满意']
const accuracyTexts = ['很不准确', '不准确', '一般', '准确', '很准确']
const diversityTexts = ['很单一', '单一', '一般', '多样', '很多样']
const effectivenessTexts = ['无效果', '效果差', '一般', '有效果', '效果很好']
const recommendationTexts = ['绝不推荐', '不推荐', '可能推荐', '会推荐', '强烈推荐']

const recentFeedback = ref([
  {
    id: 1,
    rating: 5,
    comment: '推荐的习题很符合我的水平，帮助很大！',
    date: '2024-01-15'
  },
  {
    id: 2,
    rating: 4,
    comment: '系统很好用，希望能增加更多题型。',
    date: '2024-01-14'
  },
  {
    id: 3,
    rating: 5,
    comment: '个性化推荐功能很棒，学习效率提高了不少。',
    date: '2024-01-13'
  }
])

const submitFeedback = async () => {
  if (!feedbackFormRef.value) return
  
  await feedbackFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      
      try {
        await api.post('/feedback', feedbackForm)
        ElMessage.success('反馈提交成功，感谢您的宝贵意见！')
        resetForm()
      } catch (error) {
        ElMessage.error('提交失败，请稍后重试')
      }
      
      submitting.value = false
    }
  })
}

const resetForm = () => {
  if (feedbackFormRef.value) {
    feedbackFormRef.value.resetFields()
  }
  Object.assign(feedbackForm, {
    overallRating: 0,
    accuracyRating: 0,
    diversityRating: 0,
    effectivenessRating: 0,
    usageFrequency: '',
    favoriteFeatures: [],
    suggestions: '',
    recommendationScore: 0
  })
}

const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.page-header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.feedback-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.feedback-card,
.stats-card {
  height: fit-content;
}

.feedback-form {
  max-width: none;
}

.rating-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-description {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.stats-content {
  margin-bottom: 32px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.recent-feedback h3 {
  margin-bottom: 16px;
  color: #374151;
}

.feedback-list {
  space-y: 16px;
}

.feedback-item {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.feedback-date {
  font-size: 0.85rem;
  color: #6b7280;
}

.feedback-text {
  margin: 0;
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.4;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

:deep(.el-rate__text) {
  color: #6b7280;
}

:deep(.el-checkbox-group) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

@media (max-width: 768px) {
  .feedback-content {
    grid-template-columns: 1fr;
  }
  
  :deep(.el-checkbox-group) {
    grid-template-columns: 1fr;
  }
  
  .feedback-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>