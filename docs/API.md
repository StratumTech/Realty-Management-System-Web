# 🏢 RESTful API Documentation

## 🏠 Properties API

### 1. GET /api/v1/properties
Получение списка недвижимости с фильтрацией

**Request:**
```http
GET /api/v1/properties?type=APARTMENT&dealType=SALE&minPrice=1000000&maxPrice=5000000&minRooms=2&maxRooms=3&regionuuid=5&agentuuid=42&features=PARKING,BALCONY&includeNoCoordinates=true&page=0&size=10
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "propertyUuid": "geerg-gergrg-rgergerg",
      "userUuid": "user-uuid-123",
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
      "createdAt": "2023-10-05T12:30:45Z"
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

### 2. GET /api/v1/properties/{uuid}
Получение конкретной недвижимости по UUID

**Request:**
```http
GET /api/v1/properties/geerg-gergrg-rgergerg
```

**Response (200 OK):**
```json
{
  "propertyUuid": "geerg-gergrg-rgergerg",
  "userUuid": "geerg-gergrg-rgergerg",
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

### 3. POST /api/v1/properties
Создание новой недвижимости

**Request:**
```http
POST /api/v1/properties
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "userUuid": "geerg-gergrg-rgergerg",
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
  "propertyUuid": "new-property-uuid",
  "userUuid": "geerg-gergrg-rgergerg",
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

### 4. PUT /api/v1/properties/{uuid}
Обновление существующей недвижимости

**Request:**
```http
PUT /api/v1/properties/geerg-gergrg-rgergerg
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "price": 37000,
  "features": ["ELEVATOR", "BALCONY"]
}
```

**Response (200 OK):**
```json
{
  "propertyUuid": "geerg-gergrg-rgergerg",
  "userUuid": "geerg-gergrg-rgergerg",
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

### 5. DELETE /api/v1/properties/{uuid}
Удаление недвижимости

**Request:**
```http
DELETE /api/v1/properties/geerg-gergrg-rgergerg
Authorization: Bearer <access_token>
```

**Response (204 No Content):**
```
Empty body
```

---

## 👥 User API

### 1. GET /api/v1/users
Получение списка пользователей

**Request:**
```http
GET /api/v1/users?page=0&size=5
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "userUuid": "geerg-gergrg-rgergerg",
      "role": "AGENT",
      "regionId": 1,
      "firstName": "Иван",
      "lastName": "Иванов",
      "email": "ivan@example.com",
      "phone": "+79161234567",
      "createdAt": "2023-09-01T10:00:00Z",
      "updatedAt": "2023-09-01T10:00:00Z",
      "isBlocked": false
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 5,
    "sort": { "sorted": false }
  },
  "totalElements": 1
}
```

### 2. GET /api/v1/agents/{userUuid}
Получение информации об агенте

**Request:**
```http
GET /api/v1/agents/geerg-gergrg-rgergerg
```

**Response (200 OK):**
```json
{
  "userUuid": "geerg-gergrg-rgergerg",
  "role": "AGENT",
  "regionId": 1,
  "firstName": "Иван",
  "lastName": "Иванов",
  "email": "ivan@example.com",
  "phone": "+79161234567",
  "createdAt": "2023-09-01T10:00:00Z",
  "updatedAt": "2023-09-01T10:00:00Z",
  "isBlocked": false
}
```

### 3. GET /api/v1/agents/{userUuid}/properties
Получение недвижимости агента

**Request:**
```http
GET /api/v1/agents/geerg-gergrg-rgergerg/properties
```

**Response (200 OK):**
```json
[
  {
    "propertyUuid": "geerg-gergrg-rgergerg",
    "title": "2-комнатная квартира в центре",
    "type": "APARTMENT",
    "dealType": "SALE",
    "price": 4500000,
    "rooms": 2,
    "area": 65.4,
    "address": "ул. Ленина, 15",
    "createdAt": "2023-10-05T12:30:45Z",
    "updatedAt": "2023-10-05T12:30:45Z"
  }
]
```

### 4. PUT /api/v1/agents/{uuid}
Обновление информации об агенте

**Request:**
```http
PUT /api/v1/agents/geerg-gergrg-rgergerg
Authorization: Bearer <admin_token>
Content-Type: application/json
```

```json
{
  "phone": "+79167778899"
}
```

**Response (200 OK):**
```json
{
  "userUuid": "geerg-gergrg-rgergerg",
  "role": "AGENT",
  "regionId": 1,
  "firstName": "Иван",
  "lastName": "Иванов",
  "email": "ivan@example.com",
  "phone": "+79167778899",
  "createdAt": "2023-09-01T10:00:00Z",
  "updatedAt": "2023-09-01T10:00:00Z",
  "isBlocked": false
}
```

### 5. DELETE /api/v1/agents/{uuid}
Удаление агента

**Request:**
```http
DELETE /api/v1/agents/geerg-gergrg-rgergerg
Authorization: Bearer <admin_token>
```

**Response (204 No Content):**
```
Empty body
```

### 6. GET /api/v1/agents/{uuid}/stats
Получение статистики агента

**Request:**
```http
GET /api/v1/agents/geerg-gergrg-rgergerg/stats
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "propertyCount": 5,
  "viewCount": 150,
  "lastUpdated": "2025-07-01T08:50:00Z"
}
```

### 7. GET /api/v1/agents/{uuid}/export
Экспорт данных агента

**Request:**
```http
GET /api/v1/agents/geerg-gergrg-rgergerg/export
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```csv
Content-Type: text/csv

uuid,title,price
1,Квартира,4500000
```

### 8. PUT /api/v1/agents/{uuid}/block
Блокировка агента

**Request:**
```http
PUT /api/v1/agents/geerg-gergrg-rgergerg/block
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "userUuid": "geerg-gergrg-rgergerg",
  "role": "AGENT",
  "regionId": 1,
  "firstName": "Иван",
  "lastName": "Иванов",
  "email": "ivan@example.com",
  "phone": "+79167778899",
  "createdAt": "2023-09-01T10:00:00Z",
  "updatedAt": "2023-09-01T10:00:00Z",
  "isBlocked": true
}
```

### 9. PUT /api/v1/agents/{uuid}/unblock
Разблокировка агента

**Request:**
```http
PUT /api/v1/agents/geerg-gergrg-rgergerg/unblock
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "userUuid": "geerg-gergrg-rgergerg",
  "role": "AGENT",
  "regionId": 1,
  "firstName": "Иван",
  "lastName": "Иванов",
  "email": "ivan@example.com",
  "phone": "+79167778899",
  "createdAt": "2023-09-01T10:00:00Z",
  "updatedAt": "2023-09-01T10:00:00Z",
  "isBlocked": false
}
```

---

## 🔐 Authentication API

### 1. POST /api/v1/auth/login
Авторизация пользователя

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "ivan@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "role": "AGENT"
}
```

### 2. POST /api/v1/auth/register
Регистрация нового пользователя

**Request:**
```http
POST /api/v1/auth/register
Content-Type: application/json
```

```json
{
  "firstName": "Алексей",
  "lastName": "Смирнов",
  "email": "stanislavyakunin76@gmail.com",
  "password": "1234567890",
  "password_confirmation": "1234567890",
  "phone": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "uuid": 100,
  "firstName": "Алексей",
  "lastName": "Смирнов",
  "email": "alex@example.com",
  "role": "USER",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. POST /api/v1/auth/refresh
Обновление токена доступа

**Request:**
```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

## 🔧 Особенности реализации

### 🔐 Авторизация
- **Защищенные методы** требуют `Authorization: Bearer <token>`
- **Роли**: `ADMIN`, `REGIONAL_ADMIN`, `AGENT`, `GUEST`

### ❌ Коды ошибок
| Код | Описание |
|-----|----------|
| `401` | **Unauthorized** - Неверные учетные данные |
| `403` | **Forbidden** - Нет прав доступа |
| `404` | **Not Found** - Ресурс не найден |
| `400` | **Bad Request** - Ошибки валидации |
| `409` | **Conflict** - Ошибка при попытке создать запись |
| `500` | **Internal Server Error** - Внутренняя ошибка сервера |
| `502` | **Bad Gateway** - Неверный адрес |

### ✅ Валидация
- **Bean Validation (JSR-380)** для всех DTO
- **Глобальный обработчик исключений**

### 📄 Пагинация
- **Стандарт Spring Pageable** (`page`, `size`)
- **Ответ содержит метаданные пагинации**

### 📅 Даты
- **Формат**: ISO-8601 (`yyyy-MM-dd'T'HH:mm:ss'Z'`)
- **Временная зона**: UTC

---

## 🔑 Компетенции и доступ к эндпоинтам

### 👥 Роли и их компетенции

| Роль | Описание |
|------|----------|
| **ADMIN** | Полный доступ к системе (управление всеми агентами, свойствами, авторизация) |
| **REGIONAL_ADMIN** | Управление агентами и недвижимостью только в своем регионе |
| **AGENT** | Управление своими свойствами и просмотр своей статистики/портфеля |
| **GUEST** | Доступ только к публичным данным |

### 🏠 Properties API (Internal)
**Prefix:** `/api/v1/`

| Эндпоинт | ADMIN | REGIONAL_ADMIN | AGENT | GUEST |
|----------|-------|----------------|-------|-------|
| `GET /properties` | ✅ | ✅ | ❌ | ❌ |
| `GET /properties/{uuid}` | ✅ | ✅ | ❌ | ❌ |
| `POST /properties` | ✅ | ✅ (свой регион) | ❌ | ❌ |
| `PUT /properties/{uuid}` | ✅ | ✅ (свой регион) | ❌ | ❌ |
| `DELETE /properties/{uuid}` | ✅ | ✅ (свой регион) | ❌ | ❌ |

### 🌐 Guest API (External)
**Prefix:** `/api/v1/`

| Эндпоинт | ADMIN | REGIONAL_ADMIN | AGENT | GUEST |
|----------|-------|----------------|-------|-------|
| `GET /agents/{agentUuid}/properties` | ❌ | ❌ | ❌ | ✅ |
| `POST /agent-requests` | ❌ | ❌ | ❌ | ✅ |

### 👨‍💼 Agents API (External)
**Prefix:** `/api/v1/`

| Эндпоинт | ADMIN | REGIONAL_ADMIN | AGENT | GUEST |
|----------|-------|----------------|-------|-------|
| `GET /agents` | ✅ | ✅ | ❌ | ❌ |
| `GET /agents/{agentUuid}` | ✅ | ✅ | ✅ | ✅ |
| `PUT /agents/{agentUuid}` | ✅ | ✅ (свой регион) | ✅ (свой) | ❌ |
| `DELETE /agents/{agentUuid}` | ✅ | ✅ (свой регион) | ✅ (свой) | ❌ |
| `GET /agents/{agentUuid}/stats` | ✅ | ✅ (свой регион) | ✅ (свой) | ❌ |
| `GET /agents/{agentUuid}/export` | ✅ | ✅ (свой регион) | ✅ (свой) | ❌ |
| `PUT /agents/{agentUuid}/block` | ✅ | ✅ (свой регион) | ❌ | ❌ |
| `PUT /agents/{agentUuid}/unblock` | ✅ | ✅ (свой регион) | ❌ | ❌ |
| `GET /agents/{agentUuid}/properties` | ✅ | ✅ | ✅ | ✅ |
| `POST /agents/{agentUuid}/properties` | ✅ | ✅ (свой регион) | ✅ | ❌ |
| `GET /agents/{agentUuid}/properties/{uuid}` | ✅ | ✅ | ✅ | ✅ |
| `PUT /agents/{agentUuid}/properties/{uuid}` | ✅ | ✅ (свой регион) | ✅ (свой) | ❌ |
| `DELETE /agents/{agentUuid}/properties/{uuid}` | ✅ | ✅ (свой регион) | ✅ (свой) | ❌ |
| `GET /agents/{agentUuid}/properties/{uuid}/calendar` | ✅ | ✅ | ✅ | ✅ |
| `PUT /agents/{agentUuid}/properties/{uuid}/calendar` | ✅ | ✅ (свой регион) | ✅ (свой) | ❌ |

### 🏛️ Regional Administrators API (External)
**Prefix:** `/api/v1/`

| Эндпоинт | Описание |
|----------|----------|
| `GET /agent-requests` | Получение списка заявок на регистрацию риэлтора |
| `POST /agent-requests/{id}/approve` | Одобрение заявки риэлтора |
| `POST /agent-requests/{id}/reject` | Отклонение заявки риэлтора |

### 🌍 Global Administrator API (External)
**Prefix:** `/api/v1/`

| Эндпоинт | Описание |
|----------|----------|
| `GET /admin-requests` | Получение списка заявок на регистрацию регионального администратора |
| `POST /admin-requests/{id}/approve` | Одобрение заявки администратора |
| `POST /admin-requests/{id}/reject` | Отклонение заявки администратора |
| `GET /admins` | Получение списка всех региональных администраторов |
| `PUT /admins/{adminUuid}/block` | Блокировка администратора |
| `PUT /admins/{adminUuid}/unblock` | Разблокировка администратора |

### 🔐 Authorization API (External)
**Prefix:** `/api/v1/`

| Эндпоинт | ADMIN | REGIONAL_ADMIN | AGENT | GUEST |
|----------|-------|----------------|-------|-------|
| `POST /auth/register` | ❌ | ❌ | ❌ | ✅ |
| `POST /auth/login` | ❌ | ❌ | ❌ | ✅ |
| `GET /auth/token` | ✅ | ✅ | ✅ | ❌ |

### 🌐 Other API (External)
**Prefix:** `/api/v1/`

| Эндпоинт | ADMIN | REGIONAL_ADMIN | AGENT | GUEST | Описание |
|----------|-------|----------------|-------|-------|----------|
| `GET /regions` | ✅ | ✅ | ✅ | ✅ | Получение списка регионов |
| `GET /questions` | ✅ | ✅ | ✅ | ❌ | Получение списка вопросов |
| `POST /questions` | ❌ | ❌ | ✅ | ✅ | Задать вопрос |
| `POST /questions/{id}` | ✅ | ✅ | ❌ | ❌ | Ответ на вопрос |
