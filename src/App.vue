<script setup>
import { ref, onMounted } from 'vue'
import LoginPage from './components/auth/LoginPage.vue'
import AgentPage from './components/agent/AgentPage.vue'
import AdminPage from './components/admin/AdminPage.vue'

const isAuthenticated = ref(false)
const currentView = ref('agent')

const checkAuthentication = () => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    isAuthenticated.value = true
    currentView.value = userData.role || 'agent'
  }
}

const handleLoginSuccess = (role) => {
  isAuthenticated.value = true
  currentView.value = role
}

const handleLogout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('access_token')
  isAuthenticated.value = false
  currentView.value = 'agent'
}

const switchView = (view) => {
  currentView.value = view
}

onMounted(() => {
  checkAuthentication()
})
</script>

<template>
  <div id="app">
    <LoginPage
      v-if="!isAuthenticated"
      @login-success="handleLoginSuccess"
    />

    <div v-else>
      <div class="app-switcher">
        <button
          class="switch-btn"
          :class="{ active: currentView === 'agent' }"
          @click="switchView('agent')"
        >
          🏠 Панель агента
        </button>
        <button
          class="switch-btn"
          :class="{ active: currentView === 'admin' }"
          @click="switchView('admin')"
        >
          👨‍💼 Панель администратора
        </button>
        <button
          class="switch-btn logout-btn"
          @click="handleLogout"
        >
          🚪 Выйти
        </button>
      </div>

      <AgentPage v-if="currentView === 'agent'" />
      <AdminPage v-if="currentView === 'admin'" />
    </div>
  </div>
</template>

<style>
#app {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

.app-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 10px;
  border-radius: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.switch-btn {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.switch-btn:hover {
  border-color: #4caf50;
  color: #2e7d32;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.2);
}

.switch-btn.active {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  border-color: #4caf50;
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.switch-btn.logout-btn {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  border-color: #f44336;
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.switch-btn.logout-btn:hover {
  border-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

@media (max-width: 768px) {
  .app-switcher {
    position: relative;
    top: auto;
    right: auto;
    margin: 10px;
    justify-content: center;
  }

  .switch-btn {
    font-size: 0.8rem;
    padding: 8px 16px;
  }
}
</style>
