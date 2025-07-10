<template>
  <div class="tags-input">
    <label class="tags-label">🏷️ Теги недвижимости</label>

    <div class="predefined-tags">
      <div class="tags-section-title">Базовые теги:</div>
      <div class="tags-grid">
        <button
          v-for="tag in predefinedTags"
          :key="tag"
          type="button"
          class="tag-button"
          :class="{ 'selected': selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <div class="custom-tags">
      <div class="tags-section-title">Пользовательские теги:</div>
      <div class="custom-tag-input">
        <input
          v-model="newTag"
          type="text"
          placeholder="Добавить свой тег..."
          @keyup.enter="addCustomTag"
          @keyup.comma="addCustomTag"
          class="tag-input"
        />
        <button
          type="button"
          class="add-tag-btn"
          @click="addCustomTag"
          :disabled="!newTag.trim()"
        >
          ➕
        </button>
      </div>
    </div>

    <div v-if="selectedTags.length > 0" class="selected-tags">
      <div class="tags-section-title">Выбранные теги:</div>
      <div class="selected-tags-list">
        <span
          v-for="tag in selectedTags"
          :key="tag"
          class="selected-tag"
        >
          {{ tag }}
          <button
            type="button"
            class="remove-tag"
            @click="removeTag(tag)"
          >
            ✕
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const predefinedTags = ref([
  'Новостройка',
  'Вторичка',
  'Евроремонт',
  'Требует ремонта',
  'Мебель',
  'Техника',
  'Балкон',
  'Лоджия',
  'Парковка',
  'Лифт',
  'Охрана',
  'Детская площадка',
  'Рядом метро',
  'Центр города',
  'Тихий район',
  'Развитая инфраструктура',
  'Школы рядом',
  'Больницы рядом',
  'Торговые центры',
  'Парк рядом'
])

const selectedTags = ref([...props.modelValue])
const newTag = ref('')

watch(() => props.modelValue, (newValue) => {
  selectedTags.value = [...newValue]
}, { deep: true })

watch(selectedTags, (newValue) => {
  emit('update:modelValue', [...newValue])
}, { deep: true })

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const addCustomTag = () => {
  const tag = newTag.value.trim().replace(',', '')
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}
</script>

<style scoped>
.tags-input {
  margin-bottom: 1rem;
}

.tags-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.tags-section-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
}

.predefined-tags {
  margin-bottom: 1rem;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-button {
  padding: 0.4rem 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-button:hover {
  border-color: #007bff;
  color: #007bff;
}

.tag-button.selected {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.custom-tags {
  margin-bottom: 1rem;
}

.custom-tag-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.tag-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
}

.tag-input:focus {
  outline: none;
  border-color: #007bff;
}

.add-tag-btn {
  padding: 0.5rem 0.8rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s ease;
}

.add-tag-btn:hover:not(:disabled) {
  background: #218838;
}

.add-tag-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.selected-tags {
  margin-top: 1rem;
}

.selected-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  background: #f8f9fa;
  border: 2px solid #007bff;
  border-radius: 20px;
  color: #007bff;
  font-size: 0.85rem;
  font-weight: 500;
}

.remove-tag {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
  margin-left: 0.2rem;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-tag:hover {
  background: #dc3545;
  color: white;
}
</style>
