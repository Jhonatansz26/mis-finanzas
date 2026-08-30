# AGENTS.md

Dos paquetes npm independientes (sin workspace raíz): `backend/` (API NestJS, puerto 3000) y `frontend/` (app Expo/React Native llamada "cash-popular"). Ejecuta todos los comandos dentro de la carpeta correspondiente.

## Backend

```bash
npm install
npm run start:dev      # modo watch, http://localhost:3000
npm run build          # requerido antes de start:prod / PM2 (ecosystem.config.js ejecuta dist/main.js)
npm run lint           # eslint con --fix (modifica archivos automáticamente)
npm test               # pruebas unitarias jest (*.spec.ts bajo src/)
npm run test:e2e       # e2e con supertest (test/jest-e2e.json)
```

- Requiere `backend/.env` con `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `JWT_KEY`. El README menciona `.env-template`, pero ese archivo no existe en el repositorio.
- `.env` está en .gitignore y contiene credenciales reales — nunca lo commitees ni cites sus valores. El historial del repo muestra commits pasados eliminando secretos filtrados.

### Capa de base de datos (detalle crítico)

- La base de datos es **PostgreSQL (Supabase)**, pero se accede a través de un pool personalizado `MysqlCompatiblePool` (`src/db/mysql-compatible-pool.ts`) inyectado con el token `'MYSQL'`. Los servicios extienden `BaseService` (`src/common/base.service.ts`) y escriben **SQL estilo MySQL con placeholders `?`**, que se convierten a `$n` automáticamente.
- `backend/schema.sql` es un dump de MySQL guardado solo como referencia; no es ejecutable contra la base de datos real de Postgres. Usa el MCP de Supabase (configurado en `opencode.json`) para inspeccionar el esquema real.
- Las consultas que no son SELECT usan la forma de resultado de mysql2 (`affectedRows`, `insertId`) simulada por el wrapper del pool — no lo reemplaces con `pg` directo sin actualizar todos los servicios.

### Convenciones de la API

- Auth: JWT con passport; los endpoints están protegidos por defecto — usa el decorador `@Public()` (`src/auth/decorator/public.decorator.ts`) para rutas abiertas.
- Swagger UI en `http://localhost:3000/api`.
- `ValidationPipe` global (DTOs con class-validator) y rate limit global (10 req/min) habilitados.
- CORS solo permite `http://localhost:5173` y `http://localhost:8082`.

## Frontend

```bash
npm install
npx expo start --web --port 8082   # el puerto 8082 es obligatorio para coincidir con el CORS del backend
```

- Usa **Expo Router**: `main` es `expo-router/entry`; las rutas viven en `app/` (`(auth)/`, `(main)/`). `App.tsx` NO es el entrypoint.
- La URL del backend está hardcodeada a `http://localhost:3000` en `frontend/api/apiConfig.ts` — actualízala ahí al apuntar a una API desplegada.
- El token de auth se guarda en expo-secure-store bajo la clave `auth-token`; una respuesta 401 limpia los stores de auth/business y redirige a `/`.
- El frontend no tiene tests ni lint configurados; verifica los cambios construyendo/ejecutando la app web.

## Idioma

Los comentarios del código, mensajes de commit y documentación están en español — sigue esa convención.
