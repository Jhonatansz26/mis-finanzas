# ¿De qué trata "Mis Finanzas" (cash-popular)?

> **Nota importante:** este documento describe el proyecto **tal como está hoy**. Todo el código actual fue hecho por el integrante anterior del semillero; nuestro grupo solo ha corregido bugs para levantar el proyecto e iniciar sesión. **Aún no hemos hecho ninguna mejora** (ni de UX, ni de interacción, ni de backend, ni de frontend). Las ideas de mejora se listan al final y **ninguna está implementada todavía**.

## La idea central

**Mis Finanzas** es una aplicación para que **dueños de negocios pequeños** (tiendas, mercados, puestos de venta) puedan **llevar el control financiero de su negocio desde el celular o el navegador**, sin necesidad de saber de contabilidad ni usar Excel.

El problema que ataca es real y muy común: la mayoría de comerciantes pequeños **no registran sus ingresos y egresos**, mezclan el dinero del negocio con el personal, y por eso **no saben si su negocio gana o pierde dinero**, cuáles productos les dejan más utilidad, ni cuánto tienen que vender para cubrir sus costos fijos.

La app busca convertir ese registro diario en **análisis automáticos con gráficas y consejos**, para que el dueño tome decisiones informadas sin ser contador.

## ¿Quién la usa?

- **Dueño/administrador**: se registra, crea su negocio, administra productos, costos y ve los análisis.
- **Vendedor/punto de venta**: cada negocio puede tener varios puntos de venta registrando sus transacciones.

## Flujo de uso típico

1. **Registro e inicio de sesión** (autenticación con JWT, contraseñas cifradas).
2. **Crea su negocio** y le agrega **puntos de venta**.
3. **Registra sus productos** (nombre, precio de compra, precio de venta, categoría).
4. **Define sus costos fijos** (arriendo, servicios, transporte...) y **categorías de egresos**.
5. En el día a día **registra transacciones**: ingresos (ventas) y egresos (gastos), desde cualquier punto de venta.
6. La app muestra los **análisis**: diario, semanal y mensual.

## Funcionalidades existentes (heredadas del integrante anterior)

### Operación del negocio
- Gestión de **negocios y puntos de venta** (crear, editar, eliminar).
- Gestión de **productos** con cálculo de utilidad por producto.
- Registro de **transacciones de ingresos y egresos** por fecha y punto de venta.
- **Libro diario (diarybook)**: historial de movimientos del negocio.
- Gestión de **costos fijos** y **categorías de egresos**.

### Análisis financiero
- **Panel de control (dashboard)** con métricas del día: ingresos, egresos y balance.
- **Análisis diario, semanal y mensual** con gráficas de rendimiento.
- **Utilidad por producto (product profit)** y **mejores vendedores (best sellers)**.
- **Punto de equilibrio (balance point)**: cuánto debe vender el negocio por mes para cubrir costos fijos.
- **Verificación de configuración**: valida que el usuario complete su setup antes de mostrar análisis.
- **Reportes** (diarios, semanales y mensuales) y componente de **consejos prácticos**.
- **Exportación a Excel** de reportes.

## Contexto académico: por qué estamos retomando este proyecto

En la revisión académica del proyecto, el profesor identificó **tres oportunidades de crecimiento** que orientan nuestro trabajo en el semillero:

1. **Profundidad funcional**: llevar la aplicación más allá de la captura de datos, fortaleciendo los análisis y la lógica financiera que la distinguen de una simple lista de formularios.
2. **Interactividad**: enriquecer la experiencia del usuario con gráficas dinámicas, animaciones y flujos que reaccionen en tiempo real a lo que el usuario hace.
3. **Impacto y propuesta de valor**: lograr que la aplicación comunique con claridad el valor que aporta al comerciante y genere una experiencia que "enganche".

Nuestro objetivo es **llevar el proyecto a ese siguiente nivel**. Lo que sigue son **ideas candidatas de mejora (pendientes, no implementadas)**, organizadas por el área que atienden.

## Ideas de mejora (pendientes — esto es lo que podríamos hacer)

### Interacción y UX (fortalece la interactividad)
- Gráficas dinámicas con animaciones y filtros por rango de fechas/punto de venta.
- Formularios más ágiles: autocompletado de productos al registrar ventas, escaneo/cantidad rápida.
- Estados vacíos y onboarding guiado ("primera vez? crea tu negocio aquí").
- Notificaciones o recordatorios (ej. "no has registrado el cierre del día").

### Análisis e inteligencia (fortalece la profundidad funcional)
- Comparativos entre períodos (esta semana vs. la anterior) y proyecciones.
- Alertas automáticas: "tus egresos subieron 30%", "vas 40% por debajo del punto de equilibrio".
- Consejos personalizados según los datos reales del negocio.
- Meta de venta mensual con barra de progreso.

### Backend / calidad
- Migrar el pool "mysql-compatible" a SQL de Postgres nativo (hoy se escribe SQL estilo MySQL sobre Postgres — frágil y confuso).
- Tests reales (backend casi no tiene pruebas; el frontend no tiene ninguna).
- Paginación y validación consistente en endpoints de listas.

### Frontend / técnico
- Quitar logs de consola con datos sensibles en producción (`apiConfig.ts` imprime headers con el token).
- Mover la URL del backend a variables de entorno (hoy está hardcodeada a `localhost:3000`).
- Configurar lint/typecheck para el frontend y automatizar verificación.

## Arquitectura resumida

| Parte | Tecnología | Qué hace |
|---|---|---|
| `backend/` | NestJS + PostgreSQL (Supabase) | API REST con auth JWT, swagger y la lógica de negocio/análisis |
| `frontend/` | Expo (React Native) + Expo Router | App móvil y web, estado con Zustand, gráficas y formularios |

## En una frase

> **Mis Finanzas busca ser el "contador de bolsillo" del comerciante pequeño: registra ventas y gastos en segundos y le dice si gana o pierde, qué productos le conviene vender más y cuánto necesita facturar para que el negocio sea sostenible.**
