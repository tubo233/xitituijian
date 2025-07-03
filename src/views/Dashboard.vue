<template>
  <div class="dashboard">
    <AppHeader />
    
    <div class="container">
      <div class="welcome-section">
        <h1 class="welcome-title">
          欢迎回来，{{ userStore.user?.name || '同学' }}！
        </h1>
        <p class="welcome-subtitle">
          今天也要努力学习哦 🎯
        </p>
      </div>
      
      <div class="dashboard-grid">
        <!-- Today's Recommendations -->
        <div class="recommendations-section">
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <h2>今日推荐</h2>
                <el-button 
                  type="primary" 
                  :icon="Refresh" 
                  @click="refreshRecommendations"
                  :loading="loadingRecommendations"
                >
                  刷新推荐
                </el-button>
              </div>
            </template>
            
            <div v-if="exerciseStore.recommendations.length > 0" class="recommendations-grid">
              <div 
                v-for="(exercise, index) in exerciseStore.recommendations.slice(0, 6)" 
                :key="exercise.id"
                class="exercise-card"
                @click="goToExercise(exercise.id)"
              >
                <div class="exercise-header">
                  <span class="exercise-number">#{{ index + 1 }}</span>
                  <span class="difficulty-badge" :class="getDifficultyClass(exercise.difficulty)">
                    {{ getDifficultyText(exercise.difficulty) }}
                  </span>
                </div>
                <h3 class="exercise-title">{{ exercise.title }}</h3>
                <p class="exercise-description">{{ exercise.description }}</p>
                <div class="exercise-tags">
                  <el-tag 
                    v-for="tag in exercise.knowledge_points" 
                    :key="tag" 
                    size="small"
                    class="knowledge-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                <div class="recommendation-reason">
                  <el-icon><InfoFilled /></el-icon>
                  <span>{{ exercise.recommendation_reason }}</span>
                </div>
              </div>
            </div>
            
            <el-empty v-else description="暂无推荐习题" />
          </el-card>
        </div>
        
        <!-- Learning Overview -->
        <div class="overview-section">
          <el-card class="section-card">
            <template #header>
              <h2>学习概览</h2>
            </template>
            
            <div class="overview-content">
              <div class="cognitive-level">
                <h3>当前认知水平</h3>
                <div class="level-display">
                  <el-progress 
                    :percentage="Math.round(exerciseStore.cognitiveLevel * 100)" 
                    :stroke-width="12"
                    :color="getLevelColor(exerciseStore.cognitiveLevel)"
                  />
                  <span class="level-text">{{ getLevelText(exerciseStore.cognitiveLevel) }}</span>
                </div>
              </div>
              
              <div class="knowledge-radar">
                <h3>知识点掌握图谱</h3>
                <div class="radar-container">
                  <KnowledgeRadar :data="knowledgeData" />
                </div>
              </div>
            </div>
          </el-card>
        </div>
        
        <!-- Quick Stats -->
        <div class="stats-section">
          <el-card class="section-card">
            <template #header>
              <h2>学习统计</h2>
            </template>
            
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ stats.totalExercises }}</div>
                  <div class="stat-label">总练习题数</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ stats.correctRate }}%</div>
                  <div class="stat-label">正确率</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><TrendCharts /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ stats.weeklyProgress }}%</div>
                  <div class="stat-label">本周进步</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <el-icon><Star /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ stats.masteredConcepts }}</div>
                  <div class="stat-label">已掌握知识点</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useExerciseStore } from '../stores/exercise'
import { ElMessage } from 'element-plus'
import { 
  Refresh, 
  InfoFilled, 
  Document, 
  Check, 
  TrendCharts, 
  Star 
} from '@element-plus/icons-vue'
import AppHeader from '../components/AppHeader.vue'
import KnowledgeRadar from '../components/KnowledgeRadar.vue'

const router = useRouter()
const userStore = useUserStore()
const exerciseStore = useExerciseStore()

const loadingRecommendations = ref(false)

const stats = ref({
  totalExercises: 0,
  correctRate: 0,
  weeklyProgress: 0,
  masteredConcepts: 0
})

const knowledgeData = computed(() => {
  const knowledge = exerciseStore.knowledgeState
  return Object.keys(knowledge).map(key => ({
    name: key,
    value: knowledge[key] * 100
  }))
})

const refreshRecommendations = async () => {
  loadingRecommendations.value = true
  const result = await exerciseStore.getRecommendations()
  
  if (!result.success) {
    ElMessage.error(result.message)
  }
  
  loadingRecommendations.value = false
}

const goToExercise = (exerciseId) => {
  router.push(`/exercise?id=${exerciseId}`)
}

const getDifficultyClass = (difficulty) => {
  if (difficulty < 0.3) return 'easy'
  if (difficulty < 0.7) return 'medium'
  return 'hard'
}

const getDifficultyText = (difficulty) => {
  if (difficulty < 0.3) return '简单'
  if (difficulty < 0.7) return '中等'
  return '困难'
}

const getLevelColor = (level) => {
  if (level < 0.3) return '#f56c6c'
  if (level < 0.7) return '#e6a23c'
  return '#67c23a'
}

const getLevelText = (level) => {
  if (level < 0.3) return '初学者'
  if (level < 0.7) return '进阶者'
  return '熟练者'
}

const loadStats = async () => {
  // Mock data - replace with actual API call
  stats.value = {
    totalExercises: 156,
    correctRate: 78,
    weeklyProgress: 12,
    masteredConcepts: 23
  }
}

onMounted(async () => {
  await Promise.all([
    exerciseStore.getRecommendations(),
    exerciseStore.getKnowledgeState(),
    loadStats()
  ])
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
}

.recommendations-section {
  grid-column: 1;
  grid-row: 1 / 3;
}

.overview-section {
  grid-column: 2;
  grid-row: 1;
}

.stats-section {
  grid-column: 2;
  grid-row: 2;
}

.section-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #2c3e50;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.exercise-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.exercise-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.exercise-number {
  font-weight: 600;
  color: #667eea;
}

.difficulty-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.difficulty-badge.easy {
  background: #d1fae5;
  color: #065f46;
}

.difficulty-badge.medium {
  background: #fef3c7;
  color: #92400e;
}

.difficulty-badge.hard {
  background: #fee2e2;
  color: #991b1b;
}

.exercise-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
}

.exercise-description {
  color: #6b7280;
  margin-bottom: 12px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.exercise-tags {
  margin-bottom: 12px;
}

.knowledge-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.recommendation-reason {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #667eea;
  background: #ede9fe;
  padding: 8px 12px;
  border-radius: 8px;
}

.overview-content {
  space-y: 24px;
}

.cognitive-level {
  margin-bottom: 32px;
}

.cognitive-level h3,
.knowledge-radar h3 {
  margin-bottom: 16px;
  color: #374151;
  font-size: 1.1rem;
}

.level-display {
  text-align: center;
}

.level-text {
  display: block;
  margin-top: 12px;
  font-weight: 600;
  color: #374151;
}

.radar-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
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
  font-size: 0.85rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .recommendations-section {
    grid-column: 1;
    grid-row: 1;
  }
  
  .overview-section {
    grid-column: 1;
    grid-row: 2;
  }
  
  .stats-section {
    grid-column: 1;
    grid-row: 3;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>