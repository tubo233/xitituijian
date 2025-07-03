<template>
  <div class="history-page">
    <AppHeader />
    
    <div class="container">
      <div class="page-header">
        <h1>学习历史</h1>
        <p>查看您的学习记录和进步轨迹</p>
      </div>
      
      <div class="history-content">
        <div class="stats-overview">
          <el-card class="stats-card">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ totalExercises }}</div>
                <div class="stat-label">总练习数</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ correctRate }}%</div>
                <div class="stat-label">正确率</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ averageDifficulty }}</div>
                <div class="stat-label">平均难度</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ studyDays }}</div>
                <div class="stat-label">学习天数</div>
              </div>
            </div>
          </el-card>
        </div>
        
        <div class="progress-chart">
          <el-card>
            <template #header>
              <h2>能力变化趋势</h2>
            </template>
            <div class="chart-container">
              <ProgressChart :data="progressData" />
            </div>
          </el-card>
        </div>
        
        <div class="history-list">
          <el-card>
            <template #header>
              <div class="list-header">
                <h2>练习记录</h2>
                <div class="filters">
                  <el-select v-model="selectedDate" placeholder="选择日期" clearable>
                    <el-option 
                      v-for="date in availableDates" 
                      :key="date"
                      :label="date"
                      :value="date"
                    />
                  </el-select>
                  <el-select v-model="selectedResult" placeholder="答题结果" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="正确" value="correct" />
                    <el-option label="错误" value="incorrect" />
                  </el-select>
                </div>
              </div>
            </template>
            
            <div class="history-timeline">
              <div 
                v-for="record in filteredHistory" 
                :key="record.id"
                class="timeline-item"
              >
                <div class="timeline-marker" :class="record.is_correct ? 'correct' : 'incorrect'">
                  <el-icon v-if="record.is_correct"><Check /></el-icon>
                  <el-icon v-else><Close /></el-icon>
                </div>
                
                <div class="timeline-content">
                  <div class="record-header">
                    <h3 class="exercise-title">{{ record.exercise_title }}</h3>
                    <div class="record-meta">
                      <el-tag 
                        :type="record.is_correct ? 'success' : 'danger'"
                        size="small"
                      >
                        {{ record.is_correct ? '正确' : '错误' }}
                      </el-tag>
                      <span class="record-time">{{ formatTime(record.submitted_at) }}</span>
                    </div>
                  </div>
                  
                  <div class="record-details">
                    <div class="difficulty-info">
                      <span class="label">难度：</span>
                      <el-tag 
                        :type="getDifficultyType(record.difficulty)"
                        size="small"
                      >
                        {{ getDifficultyText(record.difficulty) }}
                      </el-tag>
                    </div>
                    
                    <div class="knowledge-points">
                      <span class="label">知识点：</span>
                      <el-tag 
                        v-for="point in record.knowledge_points" 
                        :key="point"
                        size="small"
                        class="knowledge-tag"
                      >
                        {{ point }}
                      </el-tag>
                    </div>
                    
                    <div v-if="!record.is_correct" class="correct-answer">
                      <span class="label">正确答案：</span>
                      <span class="answer">{{ record.correct_answer }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="filteredHistory.length === 0" class="empty-state">
              <el-empty description="暂无练习记录" />
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExerciseStore } from '../stores/exercise'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import AppHeader from '../components/AppHeader.vue'
import ProgressChart from '../components/ProgressChart.vue'

const exerciseStore = useExerciseStore()

const selectedDate = ref('')
const selectedResult = ref('')

const totalExercises = computed(() => exerciseStore.exerciseHistory.length)

const correctRate = computed(() => {
  if (totalExercises.value === 0) return 0
  const correct = exerciseStore.exerciseHistory.filter(record => record.is_correct).length
  return Math.round((correct / totalExercises.value) * 100)
})

const averageDifficulty = computed(() => {
  if (totalExercises.value === 0) return 0
  const sum = exerciseStore.exerciseHistory.reduce((acc, record) => acc + record.difficulty, 0)
  return (sum / totalExercises.value).toFixed(2)
})

const studyDays = computed(() => {
  const dates = new Set(
    exerciseStore.exerciseHistory.map(record => 
      dayjs(record.submitted_at).format('YYYY-MM-DD')
    )
  )
  return dates.size
})

const availableDates = computed(() => {
  const dates = exerciseStore.exerciseHistory.map(record => 
    dayjs(record.submitted_at).format('YYYY-MM-DD')
  )
  return [...new Set(dates)].sort().reverse()
})

const filteredHistory = computed(() => {
  let filtered = exerciseStore.exerciseHistory

  if (selectedDate.value) {
    filtered = filtered.filter(record => 
      dayjs(record.submitted_at).format('YYYY-MM-DD') === selectedDate.value
    )
  }

  if (selectedResult.value) {
    filtered = filtered.filter(record => 
      selectedResult.value === 'correct' ? record.is_correct : !record.is_correct
    )
  }

  return filtered.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
})

const progressData = computed(() => {
  // Group by date and calculate daily performance
  const dailyStats = {}
  
  exerciseStore.exerciseHistory.forEach(record => {
    const date = dayjs(record.submitted_at).format('YYYY-MM-DD')
    if (!dailyStats[date]) {
      dailyStats[date] = { total: 0, correct: 0 }
    }
    dailyStats[date].total++
    if (record.is_correct) {
      dailyStats[date].correct++
    }
  })
  
  return Object.keys(dailyStats)
    .sort()
    .map(date => ({
      date,
      accuracy: (dailyStats[date].correct / dailyStats[date].total) * 100,
      cognitiveLevel: exerciseStore.cognitiveLevel * 100 // Mock progressive improvement
    }))
})

const formatTime = (timestamp) => {
  return dayjs(timestamp).format('MM-DD HH:mm')
}

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

onMounted(async () => {
  const result = await exerciseStore.getExerciseHistory()
  if (!result.success) {
    ElMessage.error(result.message)
  }
})
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
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

.history-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.stats-overview {
  margin-bottom: 24px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
}

.progress-chart {
  margin-bottom: 24px;
}

.chart-container {
  height: 300px;
  padding: 20px 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h2 {
  margin: 0;
  color: #2c3e50;
}

.filters {
  display: flex;
  gap: 12px;
}

.history-timeline {
  position: relative;
  padding-left: 40px;
}

.history-timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  margin-bottom: 32px;
}

.timeline-marker {
  position: absolute;
  left: -28px;
  top: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  z-index: 1;
}

.timeline-marker.correct {
  background: #10b981;
}

.timeline-marker.incorrect {
  background: #ef4444;
}

.timeline-content {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-left: 20px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.exercise-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-time {
  color: #6b7280;
  font-size: 0.9rem;
}

.record-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.difficulty-info,
.knowledge-points,
.correct-answer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-weight: 500;
  color: #374151;
  min-width: 60px;
}

.knowledge-tag {
  margin-right: 4px;
}

.answer {
  font-weight: 600;
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .list-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .filters {
    width: 100%;
    flex-direction: column;
  }
  
  .record-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .record-details {
    gap: 8px;
  }
  
  .difficulty-info,
  .knowledge-points,
  .correct-answer {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>