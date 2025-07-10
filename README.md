# 🏢 Realty Management System

Система управления недвижимостью с панелями для агентов и региональных администраторов.

## 🚀 Возможности

### 👨‍💼 Панель агента недвижимости:
- ✅ Добавление и редактирование объектов недвижимости
- ✅ Система тегов (базовые + пользовательские)
- ✅ Статусы недвижимости (доступно/продано/арендовано)
- ✅ Календарь показов и аренды с комментариями
- ✅ Фильтры и сортировка по всем параметрам
- ✅ Интерактивная карта с объектами
- ✅ Управление профилем и персональной ссылкой

### 👨‍💼 Панель регионального администратора:
- ✅ Обработка заявок на регистрацию агентов
- ✅ Ответы на вопросы от агентов
- ✅ Статистика и аналитика региона
- ✅ Управление агентами
- ✅ Контроль качества работы

## 🛠 Технологии

- **Frontend**: Vue 3, Pinia, Vite
- **Styling**: CSS3 с градиентами и анимациями
- **API**: REST API с JWT аутентификацией
- **Maps**: Leaflet для интерактивных карт

## 📦 Установка и запуск

### Предварительные требования
- Node.js 16+
- npm или yarn

### Установка
```bash
# Клонирование репозитория
git clone <repository-url>
cd Realty-Management-System-Web

# Установка зависимостей
npm install

# Копирование файла окружения
cp .env.example .env
```

### Настройка окружения
Отредактируйте файл `.env`:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080

# Environment
VITE_APP_ENV=development

# Debug
VITE_DEBUG=true
```

### Запуск в режиме разработки
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

### Сборка для продакшена
```bash
npm run build
```

## 🔐 Демо-данные для входа

### Агент недвижимости:
- **Email**: `agent@demo.com`
- **Пароль**: `demo123`

### Региональный администратор:
- **Email**: `admin@demo.com`
- **Пароль**: `admin123`

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
