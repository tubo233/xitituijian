import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

export const useExerciseStore = defineStore('exercise', () => {
  const recommendations = ref([])
  const currentExercise = ref(null)
  const exerciseHistory = ref([])
  const knowledgeState = ref({})
  const cognitiveLevel = ref(0)
  
  const getRecommendations = async () => {
    try {
      const response = await api.get('/recommendations')
      recommendations.value = response.data.recommendations
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '获取推荐失败' 
      }
    }
  }
  
  const getExercise = async (exerciseId) => {
    try {
      const response = await api.get(`/exercises/${exerciseId}`)
      currentExercise.value = response.data.exercise
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '获取习题失败' 
      }
    }
  }
  
  const submitAnswer = async (exerciseId, answer) => {
    try {
      const response = await api.post('/exercises/submit', {
        exercise_id: exerciseId,
        answer: answer
      })
      
      // Update local state
      await getKnowledgeState()
      await getExerciseHistory()
      
      return { 
        success: true, 
        result: response.data 
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '提交答案失败' 
      }
    }
  }
  
  const getExerciseHistory = async () => {
    try {
      const response = await api.get('/exercises/history')
      exerciseHistory.value = response.data.history
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '获取历史记录失败' 
      }
    }
  }
  
  const getKnowledgeState = async () => {
    try {
      const response = await api.get('/student/knowledge-state')
      knowledgeState.value = response.data.knowledge_state
      cognitiveLevel.value = response.data.cognitive_level
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '获取知识状态失败' 
      }
    }
  }
  
  return {
    recommendations,
    currentExercise,
    exerciseHistory,
    knowledgeState,
    cognitiveLevel,
    getRecommendations,
    getExercise,
    submitAnswer,
    getExerciseHistory,
    getKnowledgeState
  }
})