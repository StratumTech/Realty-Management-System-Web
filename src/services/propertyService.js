import { propertiesApi, handleApiError } from './api.js'

export const PROPERTY_TYPES = {
  APARTMENT: 'APARTMENT',
  HOUSE: 'HOUSE',
  COMMERCIAL: 'COMMERCIAL',
  STUDIO: 'STUDIO'
}

export const DEAL_TYPES = {
  SALE: 'SALE',
  RENT: 'RENT'
}

export const PROPERTY_FEATURES = {
  PARKING: 'PARKING',
  BALCONY: 'BALCONY',
  ELEVATOR: 'ELEVATOR',
  SECURITY: 'SECURITY',
  PLAYGROUND: 'PLAYGROUND',
  METRO_NEARBY: 'METRO_NEARBY',
  CITY_CENTER: 'CITY_CENTER',
  QUIET_AREA: 'QUIET_AREA',
  DEVELOPED_INFRASTRUCTURE: 'DEVELOPED_INFRASTRUCTURE',
  SCHOOLS_NEARBY: 'SCHOOLS_NEARBY',
  HOSPITALS_NEARBY: 'HOSPITALS_NEARBY',
  SHOPPING_CENTERS: 'SHOPPING_CENTERS',
  PARK_NEARBY: 'PARK_NEARBY',
  FURNITURE: 'FURNITURE',
  APPLIANCES: 'APPLIANCES',
  EURO_RENOVATION: 'EURO_RENOVATION',
  NEEDS_RENOVATION: 'NEEDS_RENOVATION',
  NEW_BUILDING: 'NEW_BUILDING',
  SECONDARY: 'SECONDARY'
}

class PropertyService {
  async getProperties(filters = {}) {
    try {
      const response = await propertiesApi.getProperties(filters)
      return {
        properties: response.content || [],
        pagination: {
          page: response.pageable?.pageNumber || 0,
          size: response.pageable?.pageSize || 10,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          isLast: response.last || false
        }
      }
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  async getProperty(uuid) {
    try {
      return await propertiesApi.getProperty(uuid)
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  async createProperty(propertyData) {
    try {
      this.validatePropertyData(propertyData)

      const apiData = this.transformToApiFormat(propertyData)

      return await propertiesApi.createProperty(apiData)
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  async updateProperty(uuid, updateData) {
    try {
      const apiData = this.transformToApiFormat(updateData, true)

      return await propertiesApi.updateProperty(uuid, apiData)
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  async deleteProperty(uuid) {
    try {
      await propertiesApi.deleteProperty(uuid)
      return true
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }

  transformToApiFormat(data, isUpdate = false) {
    const apiData = {}

    if (!isUpdate) {
      apiData.userUuid = data.userUuid || this.getCurrentUserUuid()
      apiData.regionId = data.regionId || this.getCurrentRegionId()
    }

    if (data.title) apiData.title = data.title
    if (data.propertyType) apiData.type = this.mapPropertyType(data.propertyType)
    if (data.dealType) apiData.dealType = this.mapDealType(data.dealType)
    if (data.price !== undefined) apiData.price = Number(data.price)
    if (data.rooms !== undefined) apiData.rooms = Number(data.rooms)
    if (data.area !== undefined) apiData.area = Number(data.area)
    if (data.address) apiData.address = data.address
    if (data.description) apiData.description = data.description

    if (data.coordinates) {
      apiData.latitude = data.coordinates.lat
      apiData.longitude = data.coordinates.lng
    }

    if (data.tags && Array.isArray(data.tags)) {
      apiData.features = this.mapTagsToFeatures(data.tags)
    }

    return apiData
  }

  transformFromApiFormat(apiData) {
    return {
      id: apiData.propertyUuid,
      userUuid: apiData.userUuid,
      regionId: apiData.regionId,
      title: apiData.title,
      propertyType: this.mapApiPropertyType(apiData.type),
      dealType: this.mapApiDealType(apiData.dealType),
      price: apiData.price,
      rooms: apiData.rooms,
      area: apiData.area,
      address: apiData.address,
      description: apiData.description,
      coordinates: {
        lat: apiData.latitude,
        lng: apiData.longitude
      },
      tags: this.mapFeaturesToTags(apiData.features || []),
      createdAt: new Date(apiData.createdAt),
      updatedAt: new Date(apiData.updatedAt),
      status: 'paid',
      propertyStatus: 'available'
    }
  }

  mapPropertyType(frontendType) {
    const mapping = {
      'studio': PROPERTY_TYPES.STUDIO,
      '1+1': PROPERTY_TYPES.APARTMENT,
      '2+1': PROPERTY_TYPES.APARTMENT,
      '3+1': PROPERTY_TYPES.APARTMENT,
      'house': PROPERTY_TYPES.HOUSE,
      'commercial': PROPERTY_TYPES.COMMERCIAL
    }
    return mapping[frontendType] || PROPERTY_TYPES.APARTMENT
  }

  mapApiPropertyType(apiType) {
    const mapping = {
      [PROPERTY_TYPES.STUDIO]: 'studio',
      [PROPERTY_TYPES.APARTMENT]: '2+1',
      [PROPERTY_TYPES.HOUSE]: 'house',
      [PROPERTY_TYPES.COMMERCIAL]: 'commercial'
    }
    return mapping[apiType] || '2+1'
  }

  mapDealType(frontendType) {
    const mapping = {
      'sale': DEAL_TYPES.SALE,
      'rent': DEAL_TYPES.RENT
    }
    return mapping[frontendType] || DEAL_TYPES.SALE
  }

  mapApiDealType(apiType) {
    const mapping = {
      [DEAL_TYPES.SALE]: 'sale',
      [DEAL_TYPES.RENT]: 'rent'
    }
    return mapping[apiType] || 'sale'
  }

  mapTagsToFeatures(tags) {
    const tagToFeatureMapping = {
      'Парковка': PROPERTY_FEATURES.PARKING,
      'Балкон': PROPERTY_FEATURES.BALCONY,
      'Лифт': PROPERTY_FEATURES.ELEVATOR,
      'Охрана': PROPERTY_FEATURES.SECURITY,
      'Детская площадка': PROPERTY_FEATURES.PLAYGROUND,
      'Рядом метро': PROPERTY_FEATURES.METRO_NEARBY,
      'Центр города': PROPERTY_FEATURES.CITY_CENTER,
      'Тихий район': PROPERTY_FEATURES.QUIET_AREA,
      'Развитая инфраструктура': PROPERTY_FEATURES.DEVELOPED_INFRASTRUCTURE,
      'Школы рядом': PROPERTY_FEATURES.SCHOOLS_NEARBY,
      'Больницы рядом': PROPERTY_FEATURES.HOSPITALS_NEARBY,
      'Торговые центры': PROPERTY_FEATURES.SHOPPING_CENTERS,
      'Парк рядом': PROPERTY_FEATURES.PARK_NEARBY,
      'Мебель': PROPERTY_FEATURES.FURNITURE,
      'Техника': PROPERTY_FEATURES.APPLIANCES,
      'Евроремонт': PROPERTY_FEATURES.EURO_RENOVATION,
      'Требует ремонта': PROPERTY_FEATURES.NEEDS_RENOVATION,
      'Новостройка': PROPERTY_FEATURES.NEW_BUILDING,
      'Вторичка': PROPERTY_FEATURES.SECONDARY
    }

    return tags.map(tag => tagToFeatureMapping[tag]).filter(Boolean)
  }

  mapFeaturesToTags(features) {
    const featureToTagMapping = {
      [PROPERTY_FEATURES.PARKING]: 'Парковка',
      [PROPERTY_FEATURES.BALCONY]: 'Балкон',
      [PROPERTY_FEATURES.ELEVATOR]: 'Лифт',
      [PROPERTY_FEATURES.SECURITY]: 'Охрана',
      [PROPERTY_FEATURES.PLAYGROUND]: 'Детская площадка',
      [PROPERTY_FEATURES.METRO_NEARBY]: 'Рядом метро',
      [PROPERTY_FEATURES.CITY_CENTER]: 'Центр города',
      [PROPERTY_FEATURES.QUIET_AREA]: 'Тихий район',
      [PROPERTY_FEATURES.DEVELOPED_INFRASTRUCTURE]: 'Развитая инфраструктура',
      [PROPERTY_FEATURES.SCHOOLS_NEARBY]: 'Школы рядом',
      [PROPERTY_FEATURES.HOSPITALS_NEARBY]: 'Больницы рядом',
      [PROPERTY_FEATURES.SHOPPING_CENTERS]: 'Торговые центры',
      [PROPERTY_FEATURES.PARK_NEARBY]: 'Парк рядом',
      [PROPERTY_FEATURES.FURNITURE]: 'Мебель',
      [PROPERTY_FEATURES.APPLIANCES]: 'Техника',
      [PROPERTY_FEATURES.EURO_RENOVATION]: 'Евроремонт',
      [PROPERTY_FEATURES.NEEDS_RENOVATION]: 'Требует ремонта',
      [PROPERTY_FEATURES.NEW_BUILDING]: 'Новостройка',
      [PROPERTY_FEATURES.SECONDARY]: 'Вторичка'
    }

    return features.map(feature => featureToTagMapping[feature]).filter(Boolean)
  }

  validatePropertyData(data) {
    const required = ['title', 'propertyType', 'dealType', 'price', 'address']
    const missing = required.filter(field => !data[field])

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }

    if (data.price <= 0) {
      throw new Error('Price must be greater than 0')
    }

    if (data.rooms && data.rooms < 0) {
      throw new Error('Rooms cannot be negative')
    }

    if (data.area && data.area <= 0) {
      throw new Error('Area must be greater than 0')
    }
  }

  getCurrentUserUuid() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.uuid || 'default-user-uuid'
  }

  getCurrentRegionId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.regionId || 1
  }
}

export const propertyService = new PropertyService()
export default propertyService
