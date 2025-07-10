<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <h1>🏢 Realty Management System</h1>
          <p>Система управления недвижимостью</p>
        </div>
      </div>

      <div class="role-selection">
        <h2>Выберите роль для входа</h2>

        <div class="role-cards">
          <div
            class="role-card agent-card"
            @click="selectRole('agent')"
            :class="{ selected: selectedRole === 'agent' }"
          >
            <div class="role-icon">🏠</div>
            <h3>Агент недвижимости</h3>
            <p>Управление объектами недвижимости, работа с клиентами, размещение объявлений</p>
            <ul class="role-features">
              <li>✅ Добавление недвижимости</li>
              <li>✅ Управление календарем</li>
              <li>✅ Работа с клиентами</li>
              <li>✅ Аналитика продаж</li>
            </ul>
          </div>

          <div
            class="role-card admin-card"
            @click="selectRole('admin')"
            :class="{ selected: selectedRole === 'admin' }"
          >
            <div class="role-icon">👨‍💼</div>
            <h3>Региональный администратор</h3>
            <p>Управление агентами, обработка заявок, контроль качества работы</p>
            <ul class="role-features">
              <li>✅ Управление агентами</li>
              <li>✅ Обработка заявок</li>
              <li>✅ Статистика региона</li>
              <li>✅ Контроль качества</li>
            </ul>
          </div>
        </div>

        <div v-if="selectedRole" class="login-form">
          <h3>Вход как {{ getRoleText(selectedRole) }}</h3>

          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="loginForm.email"
                type="email"
                placeholder="Введите ваш email"
                required
              />
            </div>

            <div class="form-group">
              <label for="password">Пароль</label>
              <input
                id="password"
                v-model="loginForm.password"
                type="password"
                placeholder="Введите пароль"
                required
              />
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="login-btn"
                :disabled="loading"
                :class="selectedRole"
              >
                <span v-if="loading">⏳ Вход...</span>
                <span v-else>🚀 Войти в систему</span>
              </button>
            </div>
          </form>

          <div class="demo-credentials">
            <h4>Демо-данные для входа:</h4>
            <div class="demo-section">
              <strong>Агент:</strong>
              <div class="demo-info">
                <span>Email: agent@demo.com</span>
                <span>Пароль: demo123</span>
              </div>
            </div>
            <div class="demo-section">
              <strong>Администратор:</strong>
              <div class="demo-info">
                <span>Email: admin@demo.com</span>
                <span>Пароль: admin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['login-success'])

const selectedRole = ref('')
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const selectRole = (role) => {
  selectedRole.value = role

  if (role === 'agent') {
    loginForm.email = 'agent@demo.com'
    loginForm.password = 'demo123'
  } else if (role === 'admin') {
    loginForm.email = 'admin@demo.com'
    loginForm.password = 'admin123'
  }
}

const getRoleText = (role) => {
  return role === 'agent' ? 'Агент недвижимости' : 'Региональный администратор'
}

const handleLogin = async () => {
  loading.value = true

  try {

    await new Promise(resolve => setTimeout(resolve, 1500))

    const isValidAgent = loginForm.email === 'agent@demo.com' && loginForm.password === 'demo123'
    const isValidAdmin = loginForm.email === 'admin@demo.com' && loginForm.password === 'admin123'

    if ((selectedRole.value === 'agent' && isValidAgent) ||
        (selectedRole.value === 'admin' && isValidAdmin)) {

      const userData = {
        role: selectedRole.value,
        email: loginForm.email,
        loginTime: new Date().toISOString()
      }
      localStorage.setItem('user', JSON.stringify(userData))

      emit('login-success', selectedRole.value)
    } else {
      alert('Неверные данные для входа!')
    }
  } catch (error) {
    console.error('Ошибка входа:', error)
    alert('Ошибка при входе в систему')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  max-width: 900px;
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo h1 {
  color: #2e7d32;
  font-size: 2.5em;
  margin-bottom: 10px;
  font-weight: 700;
}

.logo p {
  color: #4caf50;
  font-size: 1.2em;
  margin: 0;
}

.role-selection h2 {
  text-align: center;
  color: #2e7d32;
  margin-bottom: 30px;
  font-size: 1.8em;
}

.role-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.role-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.role-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.role-card.selected {
  border-color: #4caf50;
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
}

.role-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.role-card h3 {
  color: #2e7d32;
  margin-bottom: 15px;
  font-size: 1.4em;
}

.role-card p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.role-features {
  list-style: none;
  padding: 0;
  text-align: left;
}

.role-features li {
  color: #555;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.login-form {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  border: 2px solid #e0e0e0;
}

.login-form h3 {
  color: #2e7d32;
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.3em;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #555;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #4caf50;
}

.form-actions {
  text-align: center;
  margin-bottom: 30px;
}

.login-btn {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.demo-credentials {
  background: white;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.demo-credentials h4 {
  color: #2e7d32;
  margin-bottom: 15px;
  text-align: center;
}

.demo-section {
  margin-bottom: 15px;
}

.demo-section strong {
  color: #555;
  display: block;
  margin-bottom: 5px;
}

.demo-info {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #666;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .login-container {
    padding: 20px;
  }

  .logo h1 {
    font-size: 2em;
  }

  .role-cards {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .role-card {
    padding: 20px;
  }

  .demo-info {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
