import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SubscriptionInfo from '@/components/agent/SubscriptionInfo.vue'
import { useAgentStore } from '@/stores/agent'

describe('SubscriptionInfo Component', () => {
  let wrapper
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAgentStore()
    
    // Мокаем начальные данные
    store.properties = [
      { id: 1, title: 'Property 1' },
      { id: 2, title: 'Property 2' },
      { id: 3, title: 'Property 3' }
    ]
    store.agent.subscriptionStatus = 'active'
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendering', () => {
    it('should render subscription info correctly', () => {
      wrapper = mount(SubscriptionInfo)
      
      expect(wrapper.find('.subscription-info-widget').exists()).toBe(true)
      expect(wrapper.find('.subscription-title').text()).toBe('Ежемесячная подписка')
      expect(wrapper.find('.count-number').text()).toBe('3')
      expect(wrapper.find('.amount-number').text()).toBe('$15')
    })

    it('should display correct property count text for different numbers', async () => {
      // 1 объект
      store.properties = [{ id: 1 }]
      wrapper = mount(SubscriptionInfo)
      expect(wrapper.find('.count-label').text()).toBe('объект')

      // 2-4 объекта
      store.properties = [{ id: 1 }, { id: 2 }]
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.count-label').text()).toBe('объекта')

      // 5+ объектов
      store.properties = Array.from({ length: 5 }, (_, i) => ({ id: i + 1 }))
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.count-label').text()).toBe('объектов')
    })

    it('should show active status correctly', () => {
      store.agent.subscriptionStatus = 'active'
      wrapper = mount(SubscriptionInfo)
      
      expect(wrapper.find('.subscription-status.active').exists()).toBe(true)
      expect(wrapper.find('.status-text').text()).toBe('Активна')
      expect(wrapper.find('.manage-btn').exists()).toBe(true)
      expect(wrapper.find('.pay-btn').exists()).toBe(false)
    })

    it('should show inactive status correctly', () => {
      store.agent.subscriptionStatus = 'inactive'
      wrapper = mount(SubscriptionInfo)
      
      expect(wrapper.find('.subscription-status.inactive').exists()).toBe(true)
      expect(wrapper.find('.status-text').text()).toBe('Неактивна')
      expect(wrapper.find('.subscription-warning').exists()).toBe(true)
      expect(wrapper.find('.pay-btn').exists()).toBe(true)
      expect(wrapper.find('.manage-btn').exists()).toBe(false)
    })
  })

  describe('Payment Functionality', () => {
    beforeEach(() => {
      store.agent.subscriptionStatus = 'inactive'
      wrapper = mount(SubscriptionInfo)
    })

    it('should call paySubscription when pay button is clicked', async () => {
      const paySubscriptionSpy = vi.spyOn(store, 'paySubscription').mockResolvedValue()
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      const payBtn = wrapper.find('.pay-btn')
      expect(payBtn.exists()).toBe(true)
      
      await payBtn.trigger('click')
      
      expect(paySubscriptionSpy).toHaveBeenCalledWith(15) // 3 properties * $5
      expect(alertSpy).toHaveBeenCalledWith('Подписка успешно оплачена!')
      
      paySubscriptionSpy.mockRestore()
      alertSpy.mockRestore()
    })

    it('should handle payment errors', async () => {
      const paySubscriptionSpy = vi.spyOn(store, 'paySubscription')
        .mockRejectedValue(new Error('Payment failed'))
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      const payBtn = wrapper.find('.pay-btn')
      await payBtn.trigger('click')
      
      expect(alertSpy).toHaveBeenCalledWith('Ошибка при оплате подписки: Payment failed')
      
      paySubscriptionSpy.mockRestore()
      alertSpy.mockRestore()
    })

    it('should disable button during processing', async () => {
      let resolvePayment
      const paymentPromise = new Promise(resolve => {
        resolvePayment = resolve
      })
      
      vi.spyOn(store, 'paySubscription').mockReturnValue(paymentPromise)
      vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      const payBtn = wrapper.find('.pay-btn')
      
      // Кнопка должна быть активна изначально
      expect(payBtn.attributes('disabled')).toBeUndefined()
      expect(payBtn.text()).toContain('Оплатить $15')
      
      // Кликаем по кнопке
      await payBtn.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Кнопка должна быть заблокирована
      expect(payBtn.attributes('disabled')).toBeDefined()
      expect(payBtn.text()).toContain('Обработка...')
      
      // Завершаем платеж
      resolvePayment()
      await wrapper.vm.$nextTick()
      
      // Кнопка должна снова стать активной
      expect(payBtn.attributes('disabled')).toBeUndefined()
    })

    it('should prevent multiple payment attempts', async () => {
      const paySubscriptionSpy = vi.spyOn(store, 'paySubscription')
        .mockImplementation(() => new Promise(() => {})) // Never resolves
      
      const payBtn = wrapper.find('.pay-btn')
      
      // Первый клик
      await payBtn.trigger('click')
      expect(paySubscriptionSpy).toHaveBeenCalledTimes(1)
      
      // Второй клик (должен быть проигнорирован)
      await payBtn.trigger('click')
      expect(paySubscriptionSpy).toHaveBeenCalledTimes(1)
      
      paySubscriptionSpy.mockRestore()
    })
  })

  describe('Management Functionality', () => {
    beforeEach(() => {
      store.agent.subscriptionStatus = 'active'
      wrapper = mount(SubscriptionInfo)
    })

    it('should open subscription modal when manage button is clicked', async () => {
      const openModalSpy = vi.spyOn(store, 'openModal')
      
      const manageBtn = wrapper.find('.manage-btn')
      expect(manageBtn.exists()).toBe(true)
      
      await manageBtn.trigger('click')
      
      expect(openModalSpy).toHaveBeenCalledWith('subscriptionModal')
      
      openModalSpy.mockRestore()
    })
  })

  describe('Computed Properties', () => {
    it('should calculate total amount correctly', () => {
      store.properties = Array.from({ length: 7 }, (_, i) => ({ id: i + 1 }))
      wrapper = mount(SubscriptionInfo)
      
      expect(wrapper.find('.amount-number').text()).toBe('$35') // 7 * $5
    })

    it('should handle zero properties', () => {
      store.properties = []
      wrapper = mount(SubscriptionInfo)
      
      expect(wrapper.find('.count-number').text()).toBe('0')
      expect(wrapper.find('.amount-number').text()).toBe('$0')
      expect(wrapper.find('.count-label').text()).toBe('объектов')
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      wrapper = mount(SubscriptionInfo)
      
      expect(wrapper.find('.subscription-info-widget').exists()).toBe(true)
      expect(wrapper.find('.subscription-details').exists()).toBe(true)
      expect(wrapper.find('.subscription-actions').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper button attributes', () => {
      store.agent.subscriptionStatus = 'inactive'
      wrapper = mount(SubscriptionInfo)
      
      const payBtn = wrapper.find('.pay-btn')
      expect(payBtn.attributes('type')).toBe('button')
    })

    it('should have proper text content for screen readers', () => {
      wrapper = mount(SubscriptionInfo)
      
      expect(wrapper.text()).toContain('Ежемесячная подписка')
      expect(wrapper.text()).toContain('в месяц')
      expect(wrapper.text()).toContain('объект')
    })
  })
})
