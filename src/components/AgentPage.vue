<template>
  <div class="agent-page">
    <HeaderComponent />

    <div class="dashboard">
      <div class="main-content">
        <MapContainer />

        <PropertiesSection />
      </div>

      <div class="sidebar">
        <AgentCard />

        <PersonalLink />
      </div>
    </div>

    <PropertyModal />
    <ProfileModal />
    <EditPropertyModal />
  </div>
</template>

<script setup>
import HeaderComponent from './HeaderComponent.vue'
import AgentCard from './AgentCard.vue'
import PersonalLink from './PersonalLink.vue'
import MapContainer from './MapContainer.vue'
import PropertiesSection from './PropertiesSection.vue'
import PropertyModal from './PropertyModal.vue'
import ProfileModal from './ProfileModal.vue'
import EditPropertyModal from './EditPropertyModal.vue'
</script>

<style scoped>
.agent-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a4a14 0%, #2d5a27 25%, #4a7c59 100%);
  color: #333;
}

.dashboard {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .dashboard {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .main-content {
    order: 2;
  }

  .sidebar {
    order: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .sidebar {
    grid-template-columns: 1fr;
  }

  .dashboard {
    padding: 0.5rem;
  }
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}

.btn {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
  text-decoration: none;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.btn-outline {
  background: transparent;
  border: 2px solid #4caf50;
  color: #4caf50;
}

.btn-outline:hover {
  background: #4caf50;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
