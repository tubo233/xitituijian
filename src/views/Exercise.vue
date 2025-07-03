<template>
  <div class="exercise-page">
    <AppHeader />
    
    <div class="container">
      <div class="exercise-container">
        <div v-if="currentExercise" class="exercise-content">
          <div class="exercise-header">
            <div class="exercise-meta">
              <el-tag :type="getDifficultyType(currentExercise.difficulty)">
                {{ getDifficultyText(currentExercise.difficulty) }}
              </el-tag>
              <span class="exercise-id">题目 #{{ currentExercise.id }}</span>
            </div>
            <div class="exercise-actions">
              <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
            </div>
          </div>
          
          <el-card class="exercise-card">
            <h1 class="exercise-title">{{ currentExercise.title }}</h1>
            
            <div class="exercise-question">
              <p>{{ currentExercise.question }}</p>
              <div v-if="currentExercise.image" class="exercise-image">
                <img :src="currentExercise.image" alt="题目图片" />
              </div>
            </div>
            
            <div class="exercise-options">
              <el-radio-group 
                v-model="selectedAnswer" 
                class="options-group"
                :disabled="submitted"
              >
                <el-radio 
                  v-for="(option, index) in currentExercise.options" 
                  :key="index"
                  :label="index"
                  class="option-item"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                  <span class="option-text">{{ option }}</span>
                </el-radio>
              </el-radio-group>
            </div>
            
            <div class="exercise-footer">
              <div class="knowledge-points">
                <span class="label">相关知识点：</span>
                <el-tag 
                  v-for="point in currentExercise.knowledge_points" 
                  :key="point"
                  size="small"
                  class="knowledge-tag"
                >
                  {{ point }}
                </el-tag>
              </div>
              
              <div class="recommendation-info">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ currentExercise.recommendation_reason }}</span>
              </div>
            </div>
          </el-card>
          
          <div class="submit-section">
            <el-button 
              v-if="!submitted"
              type="primary" 
              size="large"
              :disabled="selectedAnswer === null"
              :loading="submitting"
              @click="submitAnswer"
            >
              提交答案
            </el-button>
            
            <div v-else class="result-section">
              <div class="result-card" :class="resultClass">
                <div class="result-icon">
                  <el-icon v-if="isCorrect"><Check /></el-icon>
                  <el-icon v-else><Close /></el-icon>
                </div>
                <div class="result-content">
                  <h3>{{ isCorrect ? '回答正确！' : '回答错误' }}</h3>
                  <p v-if="!isCorrect">
                    正确答案是：{{ String.fromCharCode(65 + currentExercise.correct_answer) }}
                  </p>
                  <p v-if="currentExercise.explanation" class="explanation">
                    {{ currentExercise.explanation }}
                  </p>
                </div>
              </div>
              
              <div class="next-actions">
                <el-button @click="getNextExercise">下一题</el-button>
                <el-button type="primary" @click="goToDashboard">返回首页</el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="loading-state">
          <el-skeleton :rows="8" animated />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExerciseStore } from '../stores/exercise'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, 
  InfoFilled, 
  Check, 
  Close 
} from '@element-plus/icons-vue'
import AppHeader from '../components/AppHeader.vue'

const route = useRoute()
const router = useRouter()
const exerciseStore = useExerciseStore()

const selectedAnswer = ref(null)
const submitted = ref(false)
const submitting = ref(false)
const submitResult = ref(null)

const currentExercise = computed(() => exerciseStore.currentExercise)

const isCorrect = computed(() => {
  return submitResult.value?.is_correct || false
})

const resultClass = computed(() => {
  return isCorrect.value ? 'correct' : 'incorrect'
})

const getDifficultyType = (difficulty) => {
  if (difficulty < 0.3) return 'success'
  if (difficulty < 0.7) return 'warning'
  return 'danger'
}

const getDifficultyText = (difficulty) => {
  if (difficulty < 0.3) return '简单'
  if (difficulty < 0.7) return '中等'
  return '困难'
}

const submitAnswer = async () => {
  if (selectedAnswer.value === null) return
  
  submitting.value = true
  
  const result = await exerciseStore.submitAnswer(
    currentExercise.value.id, 
    selectedAnswer.value
  )
  
  if (result.success) {
    submitResult.value = result.result
    submitted.value = true
    
    if (result.result.is_correct) {
      ElMessage.success('回答正确！')
    } else {
      ElMessage.error('回答错误，继续加油！')
    }
  } else {
    ElMessage.error(result.message)
  }
  
  submitting.value = false
}

const getNextExercise = async () => {
  // Get next recommended exercise
  await exerciseStore.getRecommendations()
  if (exerciseStore.recommendations.length > 0) {
    const nextExercise = exerciseStore.recommendations[0]
    router.push(`/exercise?id=${nextExercise.id}`)
    resetExerciseState()
  } else {
    ElMessage.info('暂无更多推荐习题')
    goToDashboard()
  }
}

const resetExerciseState = () => {
  selectedAnswer.value = null
  submitted.value = false
  submitResult.value = null
}

const goBack = () => {
  router.go(-1)
}

const goToDashboard = () => {
  router.push('/dashboard')
}

onMounted(async () => {
  const exerciseId = route.query.id
  if (exerciseId) {
    const result = await exerciseStore.getExercise(exerciseId)
    if (!result.success) {
      ElMessage.error(result.message)
      router.push('/dashboard')
    }
  } else {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.exercise-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.exercise-container {
  margin-top: 20px;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  color: white;
}

.exercise-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exercise-id {
  font-weight: 500;
}

.exercise-card {
  margin-bottom: 24px;
}

.exercise-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f2937;
}

.exercise-question {
  margin-bottom: 32px;
}

.exercise-question p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 16px;
}

.exercise-image {
  text-align: center;
}

.exercise-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.options-group {
  width: 100%;
}

.option-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 16px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.option-item:hover {
  border-color: #667eea;
  background: #f8fafc;
}

.option-item.is-checked {
  border-color: #667eea;
  background: #ede9fe;
}

.option-label {
  font-weight: 600;
  color: #667eea;
  margin-right: 12px;
  min-width: 24px;
}

.option-text {
  flex: 1;
  line-height: 1.5;
}

.exercise-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.knowledge-points {
  margin-bottom: 16px;
}

.label {
  font-weight: 500;
  color: #374151;
  margin-right: 8px;
}

.knowledge-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.recommendation-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #ede9fe;
  border-radius: 8px;
  color: #667eea;
  font-size: 0.9rem;
}

.submit-section {
  text-align: center;
}

.result-section {
  space-y: 24px;
}

.result-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.result-card.correct {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
}

.result-card.incorrect {
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.result-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.result-card.correct .result-icon {
  background: #10b981;
}

.result-card.incorrect .result-icon {
  background: #ef4444;
}

.result-content h3 {
  margin-bottom: 8px;
  font-size: 1.2rem;
}

.result-card.correct .result-content {
  color: #065f46;
}

.result-card.incorrect .result-content {
  color: #991b1b;
}

.explanation {
  margin-top: 12px;
  font-style: italic;
  opacity: 0.8;
}

.next-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.loading-state {
  background: white;
  padding: 32px;
  border-radius: 16px;
}

:deep(.el-radio) {
  width: 100%;
  margin-right: 0;
}

:deep(.el-radio__input) {
  margin-right: 12px;
}

:deep(.el-radio__label) {
  width: 100%;
  padding-left: 0;
}

@media (max-width: 768px) {
  .exercise-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .next-actions {
    flex-direction: column;
  }
}
</style>