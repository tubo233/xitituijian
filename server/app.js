import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const app = express()
const PORT = 5000
const JWT_SECRET = 'er-tga-secret-key'

// Middleware
app.use(cors())
app.use(express.json())

// Mock database
const users = [
  {
    id: 1,
    username: 'student001',
    name: '张三',
    email: 'zhangsan@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
  },
  {
    id: 2,
    username: 'student002', 
    name: '李四',
    email: 'lisi@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
  }
]

const exercises = [
  {
    id: 1,
    title: '二次函数的性质',
    question: '已知二次函数 f(x) = ax² + bx + c，其中 a > 0，若函数的对称轴为 x = 2，且 f(0) = 3，f(1) = 0，求 a、b、c 的值。',
    options: [
      'a = 1, b = -4, c = 3',
      'a = 2, b = -8, c = 3', 
      'a = 1, b = -2, c = 3',
      'a = 3, b = -12, c = 3'
    ],
    correct_answer: 0,
    explanation: '根据对称轴公式 x = -b/(2a) = 2，可得 b = -4a。由 f(0) = 3 得 c = 3。由 f(1) = 0 得 a + b + c = 0，代入得 a - 4a + 3 = 0，解得 a = 1。',
    difficulty: 0.6,
    knowledge_points: ['二次函数', '对称轴', '函数值'],
    recommendation_reason: '这道题可以帮助你巩固二次函数的基本性质，难度适中，符合你当前的学习水平。'
  },
  {
    id: 2,
    title: '三角函数的化简',
    question: '化简：sin²α + cos²α + 2sinα·cosα',
    options: [
      '1',
      '(sinα + cosα)²',
      '2sinα·cosα',
      'sin²α + cos²α'
    ],
    correct_answer: 1,
    explanation: 'sin²α + cos²α + 2sinα·cosα = (sinα + cosα)²，这是完全平方公式的应用。',
    difficulty: 0.4,
    knowledge_points: ['三角函数', '恒等变换', '完全平方公式'],
    recommendation_reason: '通过这道题可以加强你对三角恒等式和代数恒等式结合的理解。'
  },
  {
    id: 3,
    title: '导数的应用',
    question: '函数 f(x) = x³ - 3x² + 2 在区间 [0, 3] 上的最大值是多少？',
    options: ['2', '0', '-2', '6'],
    correct_answer: 0,
    explanation: '求导得 f\'(x) = 3x² - 6x = 3x(x-2)，令 f\'(x) = 0 得 x = 0 或 x = 2。计算端点和驻点的函数值：f(0) = 2，f(2) = -2，f(3) = 2，所以最大值为 2。',
    difficulty: 0.7,
    knowledge_points: ['导数', '函数最值', '驻点'],
    recommendation_reason: '这道题考查导数在求函数最值中的应用，有助于提升你的综合分析能力。'
  },
  {
    id: 4,
    title: '概率统计基础',
    question: '一个袋子里有 5 个红球和 3 个蓝球，随机取出 2 个球，求取出的两个球颜色相同的概率。',
    options: ['1/2', '5/14', '9/28', '1/4'],
    correct_answer: 2,
    explanation: '总的取法有 C(8,2) = 28 种。两球同色的情况：两红球 C(5,2) = 10 种，两蓝球 C(3,2) = 3 种，共 13 种。所以概率为 13/28。',
    difficulty: 0.5,
    knowledge_points: ['概率', '组合', '古典概型'],
    recommendation_reason: '概率问题需要清晰的逻辑思维，这道题可以帮你理解古典概型的计算方法。'
  },
  {
    id: 5,
    title: '数列求和',
    question: '求数列 1, 3, 5, 7, ... 的前 n 项和。',
    options: ['n²', '2n-1', 'n(n+1)', 'n(2n-1)'],
    correct_answer: 0,
    explanation: '这是首项为 1，公差为 2 的等差数列。第 n 项为 aₙ = 2n-1，前 n 项和为 Sₙ = n(a₁+aₙ)/2 = n(1+2n-1)/2 = n²。',
    difficulty: 0.3,
    knowledge_points: ['等差数列', '数列求和'],
    recommendation_reason: '等差数列是数列的基础，掌握好求和公式对后续学习很重要。'
  },
  {
    id: 6,
    title: '复数运算',
    question: '计算 (1+i)² + (1-i)²',
    options: ['0', '2', '2i', '4'],
    correct_answer: 0,
    explanation: '(1+i)² = 1 + 2i + i² = 1 + 2i - 1 = 2i，(1-i)² = 1 - 2i + i² = 1 - 2i - 1 = -2i，所以 (1+i)² + (1-i)² = 2i + (-2i) = 0。',
    difficulty: 0.4,
    knowledge_points: ['复数', '复数运算'],
    recommendation_reason: '复数运算是高中数学的重要内容，这道题帮你熟悉基本的复数计算。'
  }
]

const exerciseHistory = [
  {
    id: 1,
    exercise_id: 1,
    exercise_title: '二次函数的性质',
    is_correct: true,
    difficulty: 0.6,
    knowledge_points: ['二次函数', '对称轴'],
    correct_answer: 'a = 1, b = -4, c = 3',
    submitted_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    exercise_id: 2,
    exercise_title: '三角函数的化简',
    is_correct: false,
    difficulty: 0.4,
    knowledge_points: ['三角函数', '恒等变换'],
    correct_answer: '(sinα + cosα)²',
    submitted_at: '2024-01-15T09:15:00Z'
  },
  {
    id: 3,
    exercise_id: 5,
    exercise_title: '数列求和',
    is_correct: true,
    difficulty: 0.3,
    knowledge_points: ['等差数列', '数列求和'],
    correct_answer: 'n²',
    submitted_at: '2024-01-14T16:45:00Z'
  },
  {
    id: 4,
    exercise_id: 6,
    exercise_title: '复数运算',
    is_correct: true,
    difficulty: 0.4,
    knowledge_points: ['复数', '复数运算'],
    correct_answer: '0',
    submitted_at: '2024-01-14T14:20:00Z'
  },
  {
    id: 5,
    exercise_id: 4,
    exercise_title: '概率统计基础',
    is_correct: false,
    difficulty: 0.5,
    knowledge_points: ['概率', '组合'],
    correct_answer: '9/28',
    submitted_at: '2024-01-13T11:30:00Z'
  }
]

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: '访问令牌缺失' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '令牌无效' })
    }
    req.user = user
    next()
  })
}

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { username, name, email, password } = req.body
  
  // Check if user exists
  const existingUser = users.find(u => u.username === username || u.email === email)
  if (existingUser) {
    return res.status(400).json({ message: '用户名或邮箱已存在' })
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    username,
    name,
    email,
    password: hashedPassword
  }
  
  users.push(newUser)
  
  res.status(201).json({ message: '注册成功' })
})

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  
  // Find user
  const user = users.find(u => u.username === username)
  if (!user) {
    return res.status(400).json({ message: '用户名或密码错误' })
  }
  
  // Check password
  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    return res.status(400).json({ message: '用户名或密码错误' })
  }
  
  // Generate token
  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email
    },
    token
  })
})

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ message: '用户不存在' })
  }
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email
    }
  })
})

// Exercise routes
app.get('/api/recommendations', authenticateToken, (req, res) => {
  // Return personalized recommendations (mock)
  const recommendations = exercises.slice(0, 4).map(exercise => ({
    id: exercise.id,
    title: exercise.title,
    description: exercise.question.substring(0, 100) + '...',
    difficulty: exercise.difficulty,
    knowledge_points: exercise.knowledge_points,
    recommendation_reason: exercise.recommendation_reason
  }))
  
  res.json({ recommendations })
})

app.get('/api/exercises/:id', authenticateToken, (req, res) => {
  const exerciseId = parseInt(req.params.id)
  const exercise = exercises.find(e => e.id === exerciseId)
  
  if (!exercise) {
    return res.status(404).json({ message: '习题不存在' })
  }
  
  res.json({ exercise })
})

app.post('/api/exercises/submit', authenticateToken, (req, res) => {
  const { exercise_id, answer } = req.body
  const exercise = exercises.find(e => e.id === exercise_id)
  
  if (!exercise) {
    return res.status(404).json({ message: '习题不存在' })
  }
  
  const isCorrect = answer === exercise.correct_answer
  
  // Add to history (mock)
  const newRecord = {
    id: exerciseHistory.length + 1,
    exercise_id: exercise.id,
    exercise_title: exercise.title,
    is_correct: isCorrect,
    difficulty: exercise.difficulty,
    knowledge_points: exercise.knowledge_points,
    correct_answer: exercise.options[exercise.correct_answer],
    submitted_at: new Date().toISOString()
  }
  
  exerciseHistory.unshift(newRecord)
  
  res.json({
    is_correct: isCorrect,
    correct_answer: exercise.correct_answer,
    explanation: exercise.explanation
  })
})

app.get('/api/exercises/history', authenticateToken, (req, res) => {
  res.json({ history: exerciseHistory })
})

app.get('/api/student/knowledge-state', authenticateToken, (req, res) => {
  // Mock knowledge state data
  const knowledgeState = {
    '二次函数': 85,
    '三角函数': 72,
    '导数应用': 68,
    '概率统计': 75,
    '数列': 90,
    '复数': 80,
    '立体几何': 65,
    '解析几何': 70
  }
  
  const cognitiveLevel = 0.76
  
  res.json({
    knowledge_state: knowledgeState,
    cognitive_level: cognitiveLevel
  })
})

// Feedback route
app.post('/api/feedback', authenticateToken, (req, res) => {
  // Mock feedback submission
  console.log('Feedback received:', req.body)
  res.json({ message: '反馈提交成功' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`)
  console.log('\n测试账户信息:')
  console.log('用户名: student001')
  console.log('密码: password')
  console.log('\n或者:')
  console.log('用户名: student002') 
  console.log('密码: password')
})