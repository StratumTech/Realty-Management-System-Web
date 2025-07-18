import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAgentStore } from '@/stores/agent'
import SubscriptionInfo from '@/components/agent/SubscriptionInfo.vue'
import SubscriptionModal from '@/components/agent/SubscriptionModal.vue'
import AgentPage from '@/components/agent/AgentPage.vue'

describe('Subscription Flow Integration', () => {
  let store
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    store = useAgentStore()
    
    // Устанавливаем начальные данные
    store.properties = [
      { id: 1, title: 'Property 1' },
      { id: 2, title: 'Property 2' },
      { id: 3, title: 'Property 3' }
    ]
  })

  describe('Subscription Payment Flow', () => {
    it('should complete full payment flow from inactive to active', async () => {
      // Начинаем с неактивной подписки
      store.agent.subscriptionStatus = 'inactive'
      
      const wrapper = mount(SubscriptionInfo, {
        global: {
          plugins: [pinia]
        }
      })

      // Проверяем начальное состояние
      expect(wrapper.find('.subscription-status.inactive').exists()).toBe(true)
      expect(wrapper.find('.pay-btn').exists()).toBe(true)
      expect(wrapper.find('.subscription-warning').exists()).toBe(true)
      expect(wrapper.find('.amount-number').text()).toBe('$15') // 3 properties * $5

      // Мокаем alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      // Кликаем по кнопке оплаты
      const payBtn = wrapper.find('.pay-btn')
      await payBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Проверяем, что подписка стала активной
      expect(store.agent.subscriptionStatus).toBe('active')
      expect(store.agent.lastPaymentDate).toBeInstanceOf(Date)
      expect(store.agent.paymentHistory[0]).toMatchObject({
        amount: 15,
        status: 'success'
      })

      // Проверяем, что UI обновился
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.subscription-status.active').exists()).toBe(true)
      expect(wrapper.find('.manage-btn').exists()).toBe(true)
      expect(wrapper.find('.pay-btn').exists()).toBe(false)
      expect(wrapper.find('.subscription-warning').exists()).toBe(false)

      // Проверяем уведомление об успехе
      expect(alertSpy).toHaveBeenCalledWith('Подписка успешно оплачена!')

      alertSpy.mockRestore()
    })

    it('should handle payment failure correctly', async () => {
      store.agent.subscriptionStatus = 'inactive'
      
      // Мокаем ошибку оплаты
      vi.spyOn(store, 'paySubscription').mockRejectedValue(new Error('Payment failed'))
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      const wrapper = mount(SubscriptionInfo, {
        global: {
          plugins: [pinia]
        }
      })

      const payBtn = wrapper.find('.pay-btn')
      await payBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Проверяем, что статус не изменился
      expect(store.agent.subscriptionStatus).toBe('inactive')
      
      // Проверяем, что отображается ошибка
      expect(alertSpy).toHaveBeenCalledWith('Ошибка при оплате подписки: Payment failed')

      alertSpy.mockRestore()
    })

    it('should update amount when properties count changes', async () => {
      const wrapper = mount(SubscriptionInfo, {
        global: {
          plugins: [pinia]
        }
      })

      // Начальная сумма
      expect(wrapper.find('.amount-number').text()).toBe('$15')
      expect(wrapper.find('.count-number').text()).toBe('3')

      // Добавляем недвижимость
      store.addProperty({
        title: 'New Property',
        address: 'Test Address',
        price: 1000000,
        dealType: 'sale',
        propertyType: '2+1'
      })

      await wrapper.vm.$nextTick()

      // Проверяем обновленную сумму
      expect(wrapper.find('.amount-number').text()).toBe('$20') // 4 properties * $5
      expect(wrapper.find('.count-number').text()).toBe('4')
    })
  })

  describe('Subscription Modal Integration', () => {
    it('should open subscription modal from info widget', async () => {
      store.agent.subscriptionStatus = 'active'
      
      const wrapper = mount(SubscriptionInfo, {
        global: {
          plugins: [pinia]
        }
      })

      const manageBtn = wrapper.find('.manage-btn')
      await manageBtn.trigger('click')

      // Проверяем, что модальное окно открылось
      expect(store.modals.subscriptionModal).toBe(true)
    })

    it('should display correct data in subscription modal', async () => {
      store.agent.subscriptionStatus = 'active'
      store.openModal('subscriptionModal')

      const wrapper = mount(SubscriptionModal, {
        global: {
          plugins: [pinia]
        }
      })

      // Проверяем отображение данных
      expect(wrapper.find('.modal-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('3') // количество объектов
      expect(wrapper.text()).toContain('$15.00') // общая сумма
      expect(wrapper.find('.status-card.active').exists()).toBe(true)
    })

    it('should close modal correctly', async () => {
      store.openModal('subscriptionModal')

      const wrapper = mount(SubscriptionModal, {
        global: {
          plugins: [pinia]
        }
      })

      const closeBtn = wrapper.find('.close-btn')
      await closeBtn.trigger('click')

      expect(store.modals.subscriptionModal).toBe(false)
    })
  })

  describe('Property Visibility Integration', () => {
    it('should hide properties when subscription becomes inactive', async () => {
      // Начинаем с активной подписки
      store.agent.subscriptionStatus = 'active'
      
      // Проверяем, что все недвижимости видны
      expect(store.getVisibleProperties()).toHaveLength(3)
      expect(store.canEditProperties()).toBe(true)

      // Деактивируем подписку
      store.agent.subscriptionStatus = 'inactive'

      // Проверяем, что недвижимости скрыты
      expect(store.getVisibleProperties()).toHaveLength(0)
      expect(store.canEditProperties()).toBe(false)
    })

    it('should show properties when subscription becomes active', async () => {
      // Начинаем с неактивной подписки
      store.agent.subscriptionStatus = 'inactive'
      
      expect(store.getVisibleProperties()).toHaveLength(0)
      expect(store.canEditProperties()).toBe(false)

      // Активируем подписку через оплату
      await store.paySubscription(15)

      // Проверяем, что недвижимости стали видны
      expect(store.getVisibleProperties()).toHaveLength(3)
      expect(store.canEditProperties()).toBe(true)
    })
  })

  describe('Full Agent Page Integration', () => {
    it('should render all subscription components correctly', async () => {
      const wrapper = mount(AgentPage, {
        global: {
          plugins: [pinia],
          stubs: {
            'HeaderComponent': true,
            'MapContainer': true,
            'PropertiesSection': true,
            'PropertyModal': true,
            'ProfileModal': true,
            'EditPropertyModal': true,
            'SubscriptionModal': true
          }
        }
      })

      // Проверяем, что SubscriptionInfo отображается
      expect(wrapper.findComponent(SubscriptionInfo).exists()).toBe(true)
    })

    it('should handle subscription state changes across components', async () => {
      const wrapper = mount(AgentPage, {
        global: {
          plugins: [pinia],
          stubs: {
            'HeaderComponent': true,
            'MapContainer': true,
            'PropertiesSection': true,
            'PropertyModal': true,
            'ProfileModal': true,
            'EditPropertyModal': true,
            'SubscriptionModal': true
          }
        }
      })

      const subscriptionInfo = wrapper.findComponent(SubscriptionInfo)
      
      // Начинаем с неактивной подписки
      store.agent.subscriptionStatus = 'inactive'
      await wrapper.vm.$nextTick()

      expect(subscriptionInfo.find('.pay-btn').exists()).toBe(true)

      // Активируем подписку
      await store.paySubscription(15)
      await wrapper.vm.$nextTick()

      expect(subscriptionInfo.find('.manage-btn').exists()).toBe(true)
    })
  })

  describe('Payment History Integration', () => {
    it('should track payment history correctly', async () => {
      store.agent.subscriptionStatus = 'inactive'
      store.agent.paymentHistory = []

      // Первый платеж
      await store.paySubscription(15)
      
      expect(store.agent.paymentHistory).toHaveLength(1)
      expect(store.agent.paymentHistory[0]).toMatchObject({
        amount: 15,
        status: 'success'
      })

      // Добавляем недвижимость и делаем второй платеж
      store.addProperty({
        title: 'New Property',
        address: 'Test Address',
        price: 1000000,
        dealType: 'sale',
        propertyType: '2+1'
      })

      store.agent.subscriptionStatus = 'inactive' // Симулируем истечение подписки
      await store.paySubscription(20) // 4 properties * $5

      expect(store.agent.paymentHistory).toHaveLength(2)
      expect(store.agent.paymentHistory[0]).toMatchObject({
        amount: 20,
        status: 'success'
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle network errors during payment', async () => {
      store.agent.subscriptionStatus = 'inactive'
      
      // Мокаем сетевую ошибку
      vi.spyOn(store, 'paySubscription').mockRejectedValue(new Error('Network error'))
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      const wrapper = mount(SubscriptionInfo, {
        global: {
          plugins: [pinia]
        }
      })

      const payBtn = wrapper.find('.pay-btn')
      await payBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Проверяем обработку ошибки
      expect(store.agent.subscriptionStatus).toBe('inactive')
      expect(alertSpy).toHaveBeenCalledWith('Ошибка при оплате подписки: Network error')

      alertSpy.mockRestore()
    })

    it('should handle subscription status check errors', () => {
      // Устанавливаем некорректный статус
      store.agent.subscriptionStatus = 'unknown'

      // Проверяем, что функция возвращает false для неизвестного статуса
      expect(store.checkSubscriptionStatus()).toBe(false)
      expect(store.canEditProperties()).toBe(false)
      expect(store.getVisibleProperties()).toHaveLength(0)
    })
  })
})
