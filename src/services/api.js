const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_VERSION = '/api/v1'

class ApiClient {
  constructor() {
    this.baseURL = `${API_BASE_URL}${API_VERSION}`
  }

  getAuthHeaders() {
    const token = localStorage.getItem('access_token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint

    return this.request(url, {
      method: 'GET'
    })
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    })
  }
}

const apiClient = new ApiClient()

export const propertiesApi = {
  // GET /api/v1/properties
  getProperties(filters = {}) {
    const params = {}

    if (filters.type) params.type = filters.type
    if (filters.dealType) params.dealType = filters.dealType
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    if (filters.minRooms) params.minRooms = filters.minRooms
    if (filters.maxRooms) params.maxRooms = filters.maxRooms
    if (filters.regionUuid) params.regionuuid = filters.regionUuid
    if (filters.agentUuid) params.agentuuid = filters.agentUuid
    if (filters.features && filters.features.length > 0) {
      params.features = filters.features.join(',')
    }
    if (filters.includeNoCoordinates !== undefined) {
      params.includeNoCoordinates = filters.includeNoCoordinates
    }
    if (filters.page !== undefined) params.page = filters.page
    if (filters.size !== undefined) params.size = filters.size

    return apiClient.get('/properties', params)
  },

  // GET /api/v1/properties/{uuid}
  getProperty(uuid) {
    return apiClient.get(`/properties/${uuid}`)
  },

  // POST /api/v1/properties
  createProperty(propertyData) {
    const apiData = {
      userUuid: propertyData.userUuid,
      regionId: propertyData.regionId,
      title: propertyData.title,
      type: propertyData.type,
      dealType: propertyData.dealType,
      price: propertyData.price,
      rooms: propertyData.rooms,
      area: propertyData.area,
      features: propertyData.features || [],
      address: propertyData.address,
      description: propertyData.description,
      latitude: propertyData.latitude,
      longitude: propertyData.longitude
    }

    return apiClient.post('/properties', apiData)
  },

  // PUT /api/v1/properties/{uuid}
  updateProperty(uuid, updateData) {
    const apiData = {}

    if (updateData.title !== undefined) apiData.title = updateData.title
    if (updateData.type !== undefined) apiData.type = updateData.type
    if (updateData.dealType !== undefined) apiData.dealType = updateData.dealType
    if (updateData.price !== undefined) apiData.price = updateData.price
    if (updateData.rooms !== undefined) apiData.rooms = updateData.rooms
    if (updateData.area !== undefined) apiData.area = updateData.area
    if (updateData.features !== undefined) apiData.features = updateData.features
    if (updateData.address !== undefined) apiData.address = updateData.address
    if (updateData.description !== undefined) apiData.description = updateData.description
    if (updateData.latitude !== undefined) apiData.latitude = updateData.latitude
    if (updateData.longitude !== undefined) apiData.longitude = updateData.longitude

    return apiClient.put(`/properties/${uuid}`, apiData)
  },

  // DELETE /api/v1/properties/{uuid}
  deleteProperty(uuid) {
    return apiClient.delete(`/properties/${uuid}`)
  }
}

export const authApi = {
  // POST /api/v1/auth/login
  login(credentials) {
    return apiClient.post('/auth/login', credentials)
  },

  // POST /api/v1/auth/logout
  logout() {
    return apiClient.post('/auth/logout', {})
  },

  // POST /api/v1/auth/refresh
  refreshToken() {
    return apiClient.post('/auth/refresh', {})
  }
}

export const usersApi = {
  // GET /api/v1/users/profile
  getProfile() {
    return apiClient.get('/users/profile')
  },

  // PUT /api/v1/users/profile
  updateProfile(profileData) {
    return apiClient.put('/users/profile', profileData)
  },

  // POST /api/v1/users/avatar - загрузка аватара
  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)

    return apiClient.request('/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        // Убираем Content-Type для FormData
        ...apiClient.getAuthHeaders()
      }
    })
  },

  // GET /api/v1/users/avatar - получение аватара
  getAvatar() {
    return apiClient.get('/users/avatar')
  },

  // DELETE /api/v1/users/avatar - удаление аватара
  deleteAvatar() {
    return apiClient.delete('/users/avatar')
  }
}

export const regionsApi = {
  // GET /api/v1/regions
  getRegions() {
    return apiClient.get('/regions')
  },

  // GET /api/v1/regions/{uuid}
  getRegion(uuid) {
    return apiClient.get(`/regions/${uuid}`)
  }
}

export const adminApi = {
  // GET /api/v1/admin/proposals
  getProposals(filters = {}) {
    return apiClient.get('/admin/proposals', filters)
  },

  // PUT /api/v1/admin/proposals/{uuid}/approve
  approveProposal(uuid) {
    return apiClient.put(`/admin/proposals/${uuid}/approve`, {})
  },

  // PUT /api/v1/admin/proposals/{uuid}/reject
  rejectProposal(uuid, reason) {
    return apiClient.put(`/admin/proposals/${uuid}/reject`, { reason })
  },

  // GET /api/v1/admin/claims
  getClaims(filters = {}) {
    return apiClient.get('/admin/claims', filters)
  },

  // PUT /api/v1/admin/claims/{uuid}/answer
  answerClaim(uuid, response) {
    return apiClient.put(`/admin/claims/${uuid}/answer`, { response })
  },

  // PUT /api/v1/admin/claims/{uuid}/close
  closeClaim(uuid) {
    return apiClient.put(`/admin/claims/${uuid}/close`, {})
  },

  // GET /api/v1/admin/stats
  getStats() {
    return apiClient.get('/admin/stats')
  }
}

export const handleApiError = (error) => {
  if (error.message.includes('401')) {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
  } else if (error.message.includes('403')) {
    console.error('Access denied')
  } else if (error.message.includes('404')) {
    console.error('Resource not found')
  } else if (error.message.includes('500')) {
    console.error('Server error')
  } else {
    console.error('Network error:', error)
  }

  throw error
}

export default apiClient
