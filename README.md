# Mis Finanzas

Aplicación de gestión financiera para negocios y mercados.

## Estructura del Proyecto

```
mis-finanzas/
├── backend/       # API REST (NestJS + PostgreSQL)
├── frontend/      # App Móvil y Web (Expo + React Native)
└── README.md
```

## Requisitos

- Node.js 18+
- npm
- Cuenta en Supabase (base de datos PostgreSQL)

## Descargar el Proyecto

### Opción 1 - ZIP (para probar)
1. Ir a https://github.com/Jhonatansz26/mis-finanzas
2. Click en el botón verde **"Code"**
3. Click en **"Download ZIP"**
4. Descomprimir el archivo

### Opción 2 - Git Clone (para trabajar en equipo)
```bash
git clone https://github.com/Jhonatansz26/mis-finanzas.git
```

## Cómo Correr el Proyecto

### 1. Backend

```bash
cd backend
npm install
cp .env-template .env   # Configurar variables de entorno
npm run build
npm run start:dev
```

El backend corre en `http://localhost:3000`

### 2. Frontend (otra terminal)

```bash
cd frontend
npm install
npx expo start --web --port 8082
```

El frontend corre en `http://localhost:8082`

### 3. Swagger (Documentación API)

Una vez corriendo el backend, accede a:
`http://localhost:3000/api`

## Tecnologías

### Backend
- NestJS
- PostgreSQL (Supabase)
- JWT Authentication
- Swagger

### Frontend
- Expo (React Native)
- Expo Router
- Zustand (State Management)
- Axios

## Funcionalidades

- Registro de negocios/mercados
- Puntos de venta
- Gestión de productos
- Registro de transacciones (ingresos/egresos)
- Análisis financiero
- Costos fijos
- Panel de control con métricas

## Licencia

Proyecto académico - SENA
