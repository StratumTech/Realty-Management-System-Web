<template>
  <header class="header">
    <div class="logo">🏠 RealEstate CRM</div>
    <div class="user-info">
      <span>Панель риелтора</span>
      <button class="exit-btn" @click="logout" title="Выйти">🚪</button>
    </div>
  </header>
</template>

<script setup>
const logout = () => {
  if (confirm('Вы действительно хотите выйти?')) {
    console.log('Выход из системы')
  }
}
</script>

<style scoped>
.header {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  font-weight: 500;
}

.exit-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.exit-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.exit-btn:active {
  transform: translateY(0);
}
</style>
