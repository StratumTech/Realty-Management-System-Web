<template>
  <div class="admin-header">
    <div class="header-content">
      <div class="logo">
        <h2>🏢 Realty Admin</h2>
      </div>

      <div class="admin-info">
        <div class="admin-avatar">
          <img :src="admin.avatar" :alt="adminName" />
        </div>
        <div class="admin-details">
          <div class="admin-name">{{ adminName }}</div>
          <div class="admin-role">Региональный администратор</div>
          <div class="admin-region">{{ admin.region }}</div>
        </div>
        <button class="profile-btn" @click="openProfile">
          ⚙️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

const admin = computed(() => adminStore.admin)
const adminName = computed(() => `${admin.value.firstName} ${admin.value.lastName}`)

const openProfile = () => {
  adminStore.openModal('profileModal')
}
</script>

<style scoped>
.admin-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.logo h2 {
  color: #2e7d32;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #4caf50;
}

.admin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-details {
  text-align: left;
}

.admin-name {
  font-weight: 600;
  color: #2e7d32;
  font-size: 1.1rem;
}

.admin-role {
  color: #4caf50;
  font-size: 0.9rem;
  margin: 2px 0;
}

.admin-region {
  color: #666;
  font-size: 0.85rem;
}

.profile-btn {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.profile-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .logo h2 {
    font-size: 1.5rem;
  }

  .admin-info {
    justify-content: center;
  }
}
</style>
