import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    admin: {
      id: 'admin-1',
      firstName: 'Анна',
      lastName: 'Петрова',
      email: 'anna.admin@example.com',
      phone: '+7-999-111-22-33',
      telegram: '@anna_admin',
      whatsapp: '+7-999-111-22-33',
      preferredContact: 'email',
      avatar: 'https://via.placeholder.com/50/4CAF50/FFFFFF?text=АП',
      region: 'Москва и МО',
      totalApplications: 45,
      processedApplications: 42,
      revenue: 150000,
      status: 'active'
    },

    agentProposals: [
      {
        id: 'proposal-1',
        firstName: 'Владимир',
        lastName: 'Николаев',
        email: 'vladimir@example.com',
        phone: '+7-999-444-55-66',
        telegram: '@vladimir_nikolaev',
        whatsapp: '+7-999-444-55-66',
        preferredContact: 'email',
        submittedAt: new Date('2025-07-06T09:30:00Z'),
        experience: '5 лет опыта в сфере недвижимости',
        status: 'pending'
      },
      {
        id: 'proposal-2',
        firstName: 'Ольга',
        lastName: 'Смирнова',
        email: 'olga@example.com',
        phone: '+7-999-555-66-77',
        telegram: '@olga_smirnova',
        whatsapp: '+7-999-555-66-77',
        preferredContact: 'phone',
        submittedAt: new Date('2025-07-05T15:45:00Z'),
        experience: '3 года работы в сфере недвижимости',
        status: 'pending'
      }
    ],

    agentClaims: [
      {
        id: 'claim-1',
        title: 'Проблема с оплатой размещения',
        content: 'Не могу оплатить размещение объекта. Карта не проходит.',
        author: {
          firstName: 'Иван',
          lastName: 'Петров',
          avatar: 'https://via.placeholder.com/30/4CAF50/FFFFFF?text=ИП'
        },
        submittedAt: new Date('2025-07-06T11:20:00Z'),
        status: 'open'
      },
      {
        id: 'claim-2',
        title: 'Вопрос по редактированию объекта',
        content: 'Как изменить адрес уже размещенного объекта?',
        author: {
          firstName: 'Мария',
          lastName: 'Сидорова',
          avatar: 'https://via.placeholder.com/30/4CAF50/FFFFFF?text=МС'
        },
        submittedAt: new Date('2025-07-05T14:10:00Z'),
        status: 'open'
      }
    ],

    stats: {
      totalAgents: 25,
      activeAgents: 22,
      totalApplications: 45,
      processedApplications: 42,
      totalRevenue: 350000,
      avgResponseTime: '2.3 часа'
    },

    modals: {
      proposalModal: false,
      claimModal: false,
      refusalModal: false
    },

    selectedProposal: null,
    selectedClaim: null,
    currentRefusalReason: ''
  }),

  getters: {
    pendingProposals: (state) => {
      return state.agentProposals.filter(p => p.status === 'pending')
    },

    openClaims: (state) => {
      return state.agentClaims.filter(c => c.status === 'open')
    },

    processedProposals: (state) => {
      return state.agentProposals.filter(p => p.status !== 'pending')
    }
  },

  actions: {
    openModal(modalName) {
      this.modals[modalName] = true
    },

    closeModal(modalName) {
      this.modals[modalName] = false
      if (modalName === 'proposalModal') {
        this.selectedProposal = null
      }
      if (modalName === 'claimModal') {
        this.selectedClaim = null
      }
      if (modalName === 'refusalModal') {
        this.currentRefusalReason = ''
      }
    },

    approveProposal(proposalId) {
      const proposal = this.agentProposals.find(p => p.id === proposalId)
      if (proposal) {
        proposal.status = 'approved'
        proposal.processedAt = new Date()
        this.stats.processedApplications++
        this.stats.activeAgents++
      }
    },

    rejectProposal(proposalId, reason) {
      const proposal = this.agentProposals.find(p => p.id === proposalId)
      if (proposal) {
        proposal.status = 'rejected'
        proposal.processedAt = new Date()
        proposal.rejectionReason = reason
        this.stats.processedApplications++
      }
    },

    answerClaim(claimId, response) {
      const claim = this.agentClaims.find(c => c.id === claimId)
      if (claim) {
        claim.status = 'answered'
        claim.response = response
        claim.answeredAt = new Date()
      }
    },

    closeClaim(claimId) {
      const claim = this.agentClaims.find(c => c.id === claimId)
      if (claim) {
        claim.status = 'closed'
        claim.closedAt = new Date()
      }
    },

    updateAdminProfile(profileData) {
      this.admin = { ...this.admin, ...profileData }
    },

    updateStats(statsData) {
      this.stats = { ...this.stats, ...statsData }
    },

    selectProposal(proposalId) {
      this.selectedProposal = this.agentProposals.find(p => p.id === proposalId)
    },

    selectClaim(claimId) {
      this.selectedClaim = this.agentClaims.find(c => c.id === claimId)
    },

    async loadProposals() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.agentProposals)
        }, 1000)
      })
    },

    async loadClaims() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.agentClaims)
        }, 1000)
      })
    },

    async loadStats() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.stats)
        }, 1000)
      })
    }
  }
})
