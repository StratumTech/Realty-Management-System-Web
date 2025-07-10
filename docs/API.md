# Realty Management System API Documentation

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Properties API

### 1. Get Properties List
**GET** `/properties`

**Query Parameters:**
- `type` (string, optional): Property type (APARTMENT, HOUSE, COMMERCIAL, STUDIO)
- `dealType` (string, optional): Deal type (SALE, RENT)
- `minPrice` (number, optional): Minimum price
- `maxPrice` (number, optional): Maximum price
- `minRooms` (number, optional): Minimum number of rooms
- `maxRooms` (number, optional): Maximum number of rooms
- `regionuuid` (string, optional): Region UUID
- `agentuuid` (string, optional): Agent UUID
- `features` (string, optional): Comma-separated features (PARKING,BALCONY,ELEVATOR)
- `includeNoCoordinates` (boolean, optional): Include properties without coordinates
- `page` (number, optional): Page number (default: 0)
- `size` (number, optional): Page size (default: 10)

**Example Request:**
```http
GET /api/v1/properties?type=APARTMENT&dealType=SALE&minPrice=1000000&maxPrice=5000000&page=0&size=10
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "propertyUuid": "uuid-string",
      "userUuid": "user-uuid",
      "title": "2-комнатная квартира в центре",
      "type": "APARTMENT",
      "dealType": "SALE",
      "price": 4500000,
      "rooms": 2,
      "area": 65.4,
      "features": ["PARKING", "BALCONY"],
      "address": "ул. Ленина, 15",
      "latitude": 55.751244,
      "longitude": 37.618423,
      "createdAt": "2023-10-05T12:30:45Z",
      "updatedAt": "2023-10-05T12:30:45Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": { "sorted": false }
  },
  "totalPages": 1,
  "totalElements": 1,
  "last": true
}
```

### 2. Get Single Property
**GET** `/properties/{uuid}`

**Example Request:**
```http
GET /api/v1/properties/geerg-gergrg-rgergerg
```

**Response (200 OK):**
```json
{
  "propertyUuid": "geerg-gergrg-rgergerg",
  "userUuid": "user-uuid",
  "regionId": 5,
  "title": "2-комнатная квартира в центре",
  "type": "APARTMENT",
  "dealType": "SALE",
  "price": 4500000,
  "rooms": 2,
  "area": 65.4,
  "features": ["PARKING", "BALCONY"],
  "address": "ул. Ленина, 15",
  "description": "Просторная квартира с ремонтом...",
  "latitude": 55.751244,
  "longitude": 37.618423,
  "createdAt": "2023-10-05T12:30:45Z",
  "updatedAt": "2023-10-05T12:30:45Z"
}
```

### 3. Create Property
**POST** `/properties`
**Authorization Required**

**Request Body:**
```json
{
  "userUuid": "user-uuid",
  "regionId": 5,
  "title": "2-комнатная квартира в центре",
  "type": "APARTMENT",
  "dealType": "SALE",
  "price": 4500000,
  "rooms": 2,
  "area": 65.4,
  "features": ["PARKING", "BALCONY"],
  "address": "ул. Ленина, 15",
  "description": "Просторная квартира с ремонтом...",
  "latitude": 55.751244,
  "longitude": 37.618423
}
```

**Response (201 Created):**
```json
{
  "propertyUuid": "new-uuid",
  "userUuid": "user-uuid",
  "regionId": 5,
  "title": "2-комнатная квартира в центре",
  "type": "APARTMENT",
  "dealType": "SALE",
  "price": 4500000,
  "rooms": 2,
  "area": 65.4,
  "features": ["PARKING", "BALCONY"],
  "address": "ул. Ленина, 15",
  "latitude": 55.751244,
  "longitude": 37.618423,
  "createdAt": "2023-10-05T12:30:45Z",
  "updatedAt": "2023-10-05T12:30:45Z"
}
```

### 4. Update Property
**PUT** `/properties/{uuid}`
**Authorization Required**

**Request Body (partial update):**
```json
{
  "price": 37000,
  "features": ["ELEVATOR", "BALCONY"]
}
```

**Response (200 OK):**
```json
{
  "propertyUuid": "uuid",
  "userUuid": "user-uuid",
  "regionId": 5,
  "title": "2-комнатная квартира в центре",
  "type": "APARTMENT",
  "dealType": "SALE",
  "price": 37000,
  "rooms": 2,
  "area": 65.4,
  "features": ["ELEVATOR", "BALCONY"],
  "address": "ул. Ленина, 15",
  "latitude": 55.751244,
  "longitude": 37.618423,
  "createdAt": "2023-10-05T12:30:45Z",
  "updatedAt": "2023-10-05T12:30:45Z"
}
```

### 5. Delete Property
**DELETE** `/properties/{uuid}`
**Authorization Required**

**Response (200 OK):**
Empty body

## Authentication API

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "jwt-token",
  "refresh_token": "refresh-token",
  "user": {
    "uuid": "user-uuid",
    "email": "user@example.com",
    "role": "AGENT",
    "regionId": 5
  }
}
```

### Logout
**POST** `/auth/logout`
**Authorization Required**

**Response (200 OK):**
Empty body

### Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "refresh-token"
}
```

**Response (200 OK):**
```json
{
  "access_token": "new-jwt-token"
}
```

## Users API

### Get Profile
**GET** `/users/profile`
**Authorization Required**

**Response (200 OK):**
```json
{
  "uuid": "user-uuid",
  "email": "user@example.com",
  "firstName": "Иван",
  "lastName": "Петров",
  "phone": "+7-999-123-45-67",
  "role": "AGENT",
  "regionId": 5,
  "createdAt": "2023-10-05T12:30:45Z"
}
```

### Update Profile
**PUT** `/users/profile`
**Authorization Required**

**Request Body:**
```json
{
  "firstName": "Иван",
  "lastName": "Петров",
  "phone": "+7-999-123-45-67"
}
```

## Admin API

### Get Proposals
**GET** `/admin/proposals`
**Authorization Required (Admin)**

**Response (200 OK):**
```json
{
  "content": [
    {
      "uuid": "proposal-uuid",
      "firstName": "Владимир",
      "lastName": "Николаев",
      "email": "vladimir@example.com",
      "phone": "+7-999-444-55-66",
      "status": "PENDING",
      "submittedAt": "2023-10-05T12:30:45Z"
    }
  ]
}
```

### Approve Proposal
**PUT** `/admin/proposals/{uuid}/approve`
**Authorization Required (Admin)**

### Reject Proposal
**PUT** `/admin/proposals/{uuid}/reject`
**Authorization Required (Admin)**

**Request Body:**
```json
{
  "reason": "Недостаточный опыт работы"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "field": "price",
    "message": "Price must be greater than 0"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "FORBIDDEN",
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "INTERNAL_ERROR",
  "message": "Internal server error"
}
```

## Property Features

Available property features:
- `PARKING` - Парковка
- `BALCONY` - Балкон
- `ELEVATOR` - Лифт
- `SECURITY` - Охрана
- `PLAYGROUND` - Детская площадка
- `METRO_NEARBY` - Рядом метро
- `CITY_CENTER` - Центр города
- `QUIET_AREA` - Тихий район
- `DEVELOPED_INFRASTRUCTURE` - Развитая инфраструктура
- `SCHOOLS_NEARBY` - Школы рядом
- `HOSPITALS_NEARBY` - Больницы рядом
- `SHOPPING_CENTERS` - Торговые центры
- `PARK_NEARBY` - Парк рядом
- `FURNITURE` - Мебель
- `APPLIANCES` - Техника
- `EURO_RENOVATION` - Евроремонт
- `NEEDS_RENOVATION` - Требует ремонта
- `NEW_BUILDING` - Новостройка
- `SECONDARY` - Вторичка
