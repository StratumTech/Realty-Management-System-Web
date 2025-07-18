import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAgentStore } from '@/stores/agent'
import { geocodingService } from '@/services/geocodingService'
import { photoStorage } from '@/services/photoStorage'
import PropertyModal from '@/components/property/PropertyModal.vue'
import EditPropertyModal from '@/components/property/EditPropertyModal.vue'
import PropertiesSection from '@/components/property/PropertiesSection.vue'

describe('Property Management Integration', () => {
  let store
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    store = useAgentStore()
    
    // Мокаем внешние сервисы
    vi.spyOn(geocodingService, 'forwardGeocode').mockResolvedValue({
      lat: 55.7558,
      lng: 37.6176,
      formatted_address: 'Москва, ул. Тверская, 1'
    })
    
    vi.spyOn(photoStorage, 'savePhotos').mockResolvedValue([
      'data:image/jpeg;base64,photo1',
      'data:image/jpeg;base64,photo2'
    ])
  })

  describe('Property Creation Flow', () => {
    it('should create property with all data including photos and geocoding', async () => {
      const wrapper = mount(PropertyModal, {
        global: {
          plugins: [pinia]
        }
      })

      // Открываем модальное окно
      store.openModal('propertyModal')
      await wrapper.vm.$nextTick()

      // Заполняем форму
      await wrapper.find('#propertyTitle').setValue('Тестовая квартира')
      await wrapper.find('#propertyAddress').setValue('Москва, ул. Тверская, 1')
      await wrapper.find('#propertyPrice').setValue('5000000')
      await wrapper.find('#propertyDealType').setValue('sale')
      await wrapper.find('#propertyType').setValue('2+1')
      await wrapper.find('#propertyDescription').setValue('Отличная квартира')

      // Симулируем добавление фотографий
      const files = [
        new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' }),
        new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' })
      ]
      
      // Находим компонент PhotosManager и симулируем загрузку фотографий
      const photosManager = wrapper.findComponent({ name: 'PhotosManager' })
      if (photosManager.exists()) {
        await photosManager.vm.$emit('update:modelValue', [
          'data:image/jpeg;base64,photo1',
          'data:image/jpeg;base64,photo2'
        ])
      }

      // Симулируем геокодирование
      await wrapper.find('.geocode-btn').trigger('click')
      await wrapper.vm.$nextTick()

      // Отправляем форму
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Проверяем, что недвижимость была создана
      const properties = store.properties
      const newProperty = properties[properties.length - 1]

      expect(newProperty).toMatchObject({
        title: 'Тестовая квартира',
        address: 'Москва, ул. Тверская, 1',
        price: 5000000,
        dealType: 'sale',
        propertyType: '2+1',
        description: 'Отличная квартира',
        coordinates: {
          lat: 55.7558,
          lng: 37.6176
        },
        photos: [
          'data:image/jpeg;base64,photo1',
          'data:image/jpeg;base64,photo2'
        ]
      })

      // Проверяем, что модальное окно закрылось
      expect(store.modals.propertyModal).toBe(false)
    })

    it('should handle geocoding errors gracefully', async () => {
      geocodingService.forwardGeocode.mockRejectedValue(new Error('Geocoding failed'))
      
      const wrapper = mount(PropertyModal, {
        global: {
          plugins: [pinia]
        }
      })

      store.openModal('propertyModal')
      await wrapper.vm.$nextTick()

      await wrapper.find('#propertyAddress').setValue('Неверный адрес')
      await wrapper.find('.geocode-btn').trigger('click')
      await wrapper.vm.$nextTick()

      // Проверяем, что отображается ошибка
      expect(wrapper.find('.geocoding-status.error').exists()).toBe(true)
      expect(wrapper.find('.geocoding-status.error').text()).toContain('❌')
    })

    it('should handle photo upload errors', async () => {
      photoStorage.savePhotos.mockRejectedValue(new Error('Storage full'))
      
      const wrapper = mount(PropertyModal, {
        global: {
          plugins: [pinia]
        }
      })

      store.openModal('propertyModal')
      await wrapper.vm.$nextTick()

      const photosManager = wrapper.findComponent({ name: 'PhotosManager' })
      if (photosManager.exists()) {
        // Симулируем ошибку загрузки фотографий
        const fileInput = photosManager.find('input[type="file"]')
        const files = [new File(['test'], 'test.jpg', { type: 'image/jpeg' })]
        
        Object.defineProperty(fileInput.element, 'files', {
          value: files,
          writable: false
        })
        
        await fileInput.trigger('change')
        await wrapper.vm.$nextTick()

        // Проверяем, что отображается ошибка
        expect(photosManager.find('.upload-error').exists()).toBe(true)
      }
    })
  })

  describe('Property Editing Flow', () => {
    beforeEach(() => {
      // Добавляем тестовую недвижимость
      store.properties = [{
        id: 1,
        title: 'Исходная квартира',
        address: 'Москва, ул. Арбат, 1',
        price: 3000000,
        dealType: 'rent',
        propertyType: '1+1',
        description: 'Старое описание',
        photos: ['data:image/jpeg;base64,oldphoto'],
        coordinates: { lat: 55.7522, lng: 37.5927 }
      }]
    })

    it('should edit property with updated data', async () => {
      const wrapper = mount(EditPropertyModal, {
        global: {
          plugins: [pinia]
        }
      })

      // Выбираем недвижимость для редактирования
      store.selectedProperty = store.properties[0]
      store.openModal('editPropertyModal')
      await wrapper.vm.$nextTick()

      // Изменяем данные
      await wrapper.find('#propertyTitle').setValue('Обновленная квартира')
      await wrapper.find('#propertyPrice').setValue('3500000')
      await wrapper.find('#propertyDescription').setValue('Новое описание')

      // Отправляем форму
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Проверяем, что недвижимость была обновлена
      const updatedProperty = store.properties.find(p => p.id === 1)
      expect(updatedProperty).toMatchObject({
        title: 'Обновленная квартира',
        price: 3500000,
        description: 'Новое описание'
      })

      // Проверяем, что модальное окно закрылось
      expect(store.modals.editPropertyModal).toBe(false)
    })

    it('should preserve existing photos when editing', async () => {
      const wrapper = mount(EditPropertyModal, {
        global: {
          plugins: [pinia]
        }
      })

      store.selectedProperty = store.properties[0]
      store.openModal('editPropertyModal')
      await wrapper.vm.$nextTick()

      // Проверяем, что существующие фотографии загружены
      const photosManager = wrapper.findComponent({ name: 'PhotosManager' })
      if (photosManager.exists()) {
        expect(photosManager.props('modelValue')).toEqual(['data:image/jpeg;base64,oldphoto'])
      }

      // Изменяем только заголовок
      await wrapper.find('#propertyTitle').setValue('Новый заголовок')
      await wrapper.find('form').trigger('submit')
      await wrapper.vm.$nextTick()

      // Проверяем, что фотографии сохранились
      const updatedProperty = store.properties.find(p => p.id === 1)
      expect(updatedProperty.photos).toEqual(['data:image/jpeg;base64,oldphoto'])
    })
  })

  describe('Property List Integration', () => {
    beforeEach(() => {
      store.properties = [
        {
          id: 1,
          title: 'Квартира 1',
          dealType: 'sale',
          propertyStatus: 'available',
          price: 5000000,
          tags: ['Центр', 'Новостройка']
        },
        {
          id: 2,
          title: 'Квартира 2',
          dealType: 'rent',
          propertyStatus: 'rented',
          price: 50000,
          tags: ['Метро рядом']
        }
      ]
    })

    it('should filter properties correctly', async () => {
      const wrapper = mount(PropertiesSection, {
        global: {
          plugins: [pinia]
        }
      })

      // Проверяем начальное состояние
      expect(wrapper.findAll('.property-card')).toHaveLength(2)

      // Применяем фильтр по типу сделки
      const filtersComponent = wrapper.findComponent({ name: 'PropertyFilters' })
      await filtersComponent.vm.$emit('filter-change', { dealType: 'sale' })
      await wrapper.vm.$nextTick()

      // Проверяем, что отображается только одна недвижимость
      expect(wrapper.findAll('.property-card')).toHaveLength(1)
      expect(wrapper.find('.property-card').text()).toContain('Квартира 1')
    })

    it('should handle property deletion', async () => {
      const wrapper = mount(PropertiesSection, {
        global: {
          plugins: [pinia]
        }
      })

      // Мокаем confirm
      global.confirm = vi.fn(() => true)

      expect(wrapper.findAll('.property-card')).toHaveLength(2)

      // Кликаем по кнопке удаления первой недвижимости
      const deleteBtn = wrapper.find('.property-card .btn-danger')
      await deleteBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Проверяем, что недвижимость была удалена
      expect(store.properties).toHaveLength(1)
      expect(store.properties[0].id).toBe(2)
    })

    it('should open edit modal when edit button is clicked', async () => {
      const wrapper = mount(PropertiesSection, {
        global: {
          plugins: [pinia]
        }
      })

      const editBtn = wrapper.find('.property-card .btn-outline')
      await editBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Проверяем, что модальное окно редактирования открылось
      expect(store.modals.editPropertyModal).toBe(true)
      expect(store.selectedProperty).toEqual(store.properties[0])
    })
  })

  describe('Subscription Integration', () => {
    it('should block property operations when subscription is inactive', async () => {
      store.agent.subscriptionStatus = 'inactive'
      
      const wrapper = mount(PropertiesSection, {
        global: {
          plugins: [pinia]
        }
      })

      // Проверяем, что кнопки заблокированы
      const editBtn = wrapper.find('.btn-outline')
      const deleteBtn = wrapper.find('.btn-danger')
      
      expect(editBtn.attributes('disabled')).toBeDefined()
      expect(deleteBtn.attributes('disabled')).toBeDefined()

      // Проверяем, что недвижимость не отображается
      expect(store.getVisibleProperties()).toHaveLength(0)
    })

    it('should allow property operations when subscription is active', async () => {
      store.agent.subscriptionStatus = 'active'
      store.properties = [{ id: 1, title: 'Test Property' }]
      
      const wrapper = mount(PropertiesSection, {
        global: {
          plugins: [pinia]
        }
      })

      // Проверяем, что кнопки активны
      const editBtn = wrapper.find('.btn-outline')
      const deleteBtn = wrapper.find('.btn-danger')
      
      expect(editBtn.attributes('disabled')).toBeUndefined()
      expect(deleteBtn.attributes('disabled')).toBeUndefined()

      // Проверяем, что недвижимость отображается
      expect(store.getVisibleProperties()).toHaveLength(1)
    })
  })
})
