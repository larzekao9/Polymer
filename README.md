# Directorio de usuarios con Polymer 3

Ejemplo práctico de **Web Components con Polymer 3**: una pequeña aplicación que carga usuarios desde una API REST pública, permite buscarlos por nombre en tiempo real y marcarlos como favoritos, con un contador que se actualiza solo.

Proyecto desarrollado para la exposición sobre Polymer de la materia **Tecnología Web (INF513)**, Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones, Universidad Autónoma Gabriel René Moreno (Santa Cruz de la Sierra, Bolivia). Grupo 12 SA.

---

## Contenido

1. [Qué demuestra el ejemplo](#qué-demuestra-el-ejemplo)
2. [Requisitos](#requisitos)
3. [Instalación y ejecución](#instalación-y-ejecución)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Cómo funciona](#cómo-funciona)
6. [Conceptos de Polymer que se usan](#conceptos-de-polymer-que-se-usan)
7. [Limitaciones conocidas](#limitaciones-conocidas)
8. [Estado de Polymer y alternativa: Lit](#estado-de-polymer-y-alternativa-lit)
9. [Solución de problemas](#solución-de-problemas)
10. [Autores](#autores)

---

## Qué demuestra el ejemplo

- **Dos componentes reutilizables** que se comunican entre sí: `app-usuarios` (padre) y `tarjeta-usuario` (hijo).
- **Consumo de una API REST** con el elemento `iron-ajax`, sin escribir código `fetch`.
- **Data binding** de una vía (`[[ ]]`) y de dos vías (`{{ }}`).
- **Propiedades declaradas**, con `notify`, `reflectToAttribute` y propiedades **computadas**.
- **Listas y condicionales** declarativos con `dom-repeat` (con filtro) y `dom-if`.
- **Encapsulamiento de estilos** gracias al Shadow DOM nativo del navegador.

Funcionalidades visibles para el usuario:

| Acción | Resultado |
|---|---|
| Abrir la página | Se cargan 10 usuarios desde la API |
| Escribir en el buscador (por ejemplo, `cle`) | La lista se filtra al instante por nombre |
| Pulsar la estrella ☆ de una tarjeta | La tarjeta pasa a favorita (★) y se resalta con un borde dorado |
| Marcar o desmarcar favoritos | El contador "Favoritos" se actualiza solo |

---

## Requisitos

- **Node.js** en versión LTS (18 o superior) y **npm**.
- Un **navegador moderno** (Chrome, Edge, Firefox o Safari). Todos soportan Web Components de forma nativa, por lo que **no se necesitan polyfills**.
- **Conexión a Internet**: para instalar los paquetes y para consultar la API pública de pruebas.

Para comprobar las versiones instaladas:

```bash
node -v
npm -v
```

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/larzekao9/Polymer.git
cd Polymer

# 2. Instalar las dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm start
```

`npm start` ejecuta `web-dev-server --node-resolve --watch --open`, que:

- levanta un servidor local (por defecto en <http://localhost:8000>),
- resuelve las rutas de módulos como `@polymer/polymer/polymer-element.js` (`--node-resolve`),
- recarga la página automáticamente al guardar cambios (`--watch`),
- abre el navegador (`--open`).

> **¿Por qué hace falta un servidor?** Los componentes importan paquetes con rutas "desnudas" (por ejemplo, `@polymer/polymer/polymer-element.js`). El navegador no sabe resolverlas por sí solo; el servidor las convierte en rutas reales.

### Dependencias

| Paquete | Uso | Versión probada |
|---|---|---|
| `@polymer/polymer` | Biblioteca para crear los componentes | 3.5.2 |
| `@polymer/iron-ajax` | Elemento para consumir la API REST | 3.0.1 |
| `@web/dev-server` (desarrollo) | Servidor local con resolución de módulos y recarga | — |

`package.json` declara estas dependencias con `latest`. Si necesitas reproducir exactamente el entorno de la exposición, fija las versiones de la tabla.

---

## Estructura del proyecto

```
.
├── index.html               Página de entrada: carga el módulo y usa <app-usuarios>
├── package.json             Dependencias y script "start"
├── LEEME.txt                Instrucciones breves
├── .gitignore               Ignora node_modules/, .DS_Store y .claude/
└── src/
    ├── app-usuarios.js      Componente padre: API, buscador, lista y contador
    ├── tarjeta-usuario.js   Componente hijo: tarjeta con avatar, datos y favorito
    └── hola-polymer.js      Componente mínimo para verificar la instalación
```

> `node_modules/` se genera con `npm install` y no se incluye en el repositorio.

---

## Cómo funciona

### Flujo de datos

```
                     ┌────────────────────────────┐
  API REST           │         app-usuarios       │
  (JSONPlaceholder)  │                            │
        │            │  iron-ajax ──► usuarios    │
        └───────────►│  (last-response="{{ }}")   │
                     │        │                   │
                     │        ▼  dom-repeat + filter
                     │  ┌──────────────────┐      │
                     │  │  tarjeta-usuario │ ×10  │
                     │  └──────────────────┘      │
                     └────────────────────────────┘

  Hacia abajo  [[ ]] : nombre, correo y empresa pasan del padre a cada tarjeta.
  Hacia arriba {{ }} : "favorito" vuelve al padre gracias a notify: true
                       y el contador de favoritos se recalcula solo.
```

1. **Carga de datos.** `iron-ajax` con el atributo `auto` pide `https://jsonplaceholder.typicode.com/users` al abrir la página. La respuesta se guarda en la propiedad `usuarios` mediante `last-response="{{usuarios}}"`.
2. **Renderizado.** Un `dom-repeat` crea una `<tarjeta-usuario>` por cada elemento de `usuarios`. Le pasa `nombre`, `correo` y `empresa` con `[[ ]]` (binding de una vía, hacia abajo).
3. **Búsqueda.** El campo de búsqueda se enlaza con `busqueda` mediante `value="{{busqueda::input}}"` (binding de dos vías con un elemento nativo, escuchando el evento `input`). El filtro del `dom-repeat` se recalcula cada vez que cambia `busqueda`.
4. **Favoritos.** Al pulsar la estrella, `tarjeta-usuario` invierte su propiedad `favorito`. Como tiene `notify: true`, el cambio sube al padre por `favorito="{{usuario.favorito}}"`, y el contador `_contarFavoritos(usuarios.*)` se vuelve a evaluar.

### `tarjeta-usuario` (componente hijo)

Propiedades declaradas:

| Propiedad | Tipo | Detalle |
|---|---|---|
| `nombre`, `correo`, `empresa` | `String` | Datos que recibe del padre |
| `favorito` | `Boolean` | `notify: true` (binding de dos vías) y `reflectToAttribute: true` (permite el selector CSS `:host([favorito])`) |
| `iniciales` | `String` | **Computada**: `_calcularIniciales(nombre)`; se recalcula cuando cambia `nombre` |

Otros elementos del componente:

- `dom-if`: muestra la línea "Empresa" solo si la propiedad `empresa` tiene valor.
- `on-click="_alternarFavorito"`: manejador de eventos declarativo en la plantilla.
- Estilos propios dentro de `<style>`, encapsulados por el Shadow DOM.

### `app-usuarios` (componente padre)

| Elemento | Qué hace |
|---|---|
| `iron-ajax` | Consulta la API y guarda la respuesta en `usuarios` |
| `<input type="search">` | Escribe en `busqueda` |
| `dom-repeat` con `filter` | Genera las tarjetas y aplica `_crearFiltro(busqueda)` |
| `_crearFiltro(texto)` | Devuelve una función que filtra por nombre (sin distinguir mayúsculas) o `null` si no hay texto |
| `_contarFavoritos(usuarios.*)` | Cuenta cuántos usuarios son favoritos; el comodín `.*` lo re-evalúa ante cualquier cambio dentro de la lista |

---

## Conceptos de Polymer que se usan

| Concepto | Dónde se ve |
|---|---|
| Propiedades declaradas (`static get properties()`) | Los tres componentes |
| Plantilla (`static get template()` con `html`) | Los tres componentes |
| Binding de una vía `[[ ]]` | `nombre="[[usuario.name]]"` |
| Binding de dos vías `{{ }}` | `favorito="{{usuario.favorito}}"`, `last-response="{{usuarios}}"` |
| Binding con elemento nativo | `value="{{busqueda::input}}"` |
| `notify` | `favorito` en `tarjeta-usuario` |
| `reflectToAttribute` | `favorito` y el selector `:host([favorito])` |
| Propiedad computada | `iniciales` |
| Binding computado con comodín | `_contarFavoritos(usuarios.*)` |
| `dom-repeat` con `filter` | Lista de tarjetas y buscador |
| `dom-if` | Línea de empresa |
| Manejador de eventos declarativo | `on-click` |
| Shadow DOM | Visible en las herramientas de desarrollo: cada componente tiene un `#shadow-root (open)` |

### Verificar el Shadow DOM

Abre las herramientas de desarrollo del navegador (pestaña **Elements** o **Inspector**) y expande `<app-usuarios>` y `<tarjeta-usuario>`: cada uno contiene un `#shadow-root (open)` con su propia plantilla y estilos. Por eso los estilos de la página no afectan a las tarjetas y los de las tarjetas no se filtran hacia afuera.

---

## Limitaciones conocidas

Es un prototipo didáctico. Tiene estas limitaciones:

- **Depende de Internet y de una API de pruebas** (JSONPlaceholder). Si la API no responde, la lista queda vacía: no hay manejo de errores (`iron-ajax` dispara el evento `error`, que se podría escuchar con `on-error`).
- **Los favoritos no se guardan:** viven solo en memoria y se pierden al recargar la página.
- **Iniciales del avatar:** se calculan con las dos primeras palabras del nombre. Si el nombre incluye un tratamiento (por ejemplo, "Mrs."), las iniciales pueden no corresponder al nombre y apellido.
- **No incluye pruebas automatizadas.**

---

## Estado de Polymer y alternativa: Lit

Polymer está en **modo mantenimiento**: la última versión publicada de `@polymer/polymer` es la **3.5.2** (octubre de 2024) y la documentación oficial recomienda **[Lit](https://lit.dev)** para proyectos nuevos. Aun así, Polymer sigue funcionando y su estudio ayuda a entender de dónde vienen las ideas de los Web Components actuales.

Equivalencias básicas entre Polymer 3 y Lit:

| Aspecto | Polymer 3 | Lit |
|---|---|---|
| Clase base | `PolymerElement` | `LitElement` |
| Plantillas | `[[ ]]` y `{{ }}` | Expresiones JavaScript `${ }` |
| Binding | Una vía y dos vías | Una vía (los datos suben con eventos) |
| Condicionales y listas | `dom-if`, `dom-repeat` | JavaScript nativo (`? :`, `map()`) |
| Eventos | `on-click="metodo"` | `@click=${this.metodo}` |

Guía oficial de migración: [Lit for Polymer users](https://lit.dev/articles/lit-for-polymer-users/).

---

## Solución de problemas

| Problema | Posible causa y solución |
|---|---|
| `npm: command not found` | Node.js no está instalado. Instálalo desde <https://nodejs.org> (versión LTS). |
| El navegador muestra errores como `Failed to resolve module specifier "@polymer/polymer/..."` | Abriste `index.html` directamente (`file://`). Usa `npm start`, que resuelve los módulos. |
| La página abre, pero no aparecen usuarios | Revisa tu conexión a Internet y la consola del navegador (F12). La API pública puede estar caída. |
| `Port 8000 is already in use` | Hay otro servidor usando el puerto. Ciérralo o ejecuta `npx web-dev-server --node-resolve --watch --open --port 8080`. |
| Error por versiones mezcladas de Polymer (`dom-module` ya definido) | Hay dos copias de Polymer instaladas. Borra `node_modules` y `package-lock.json` y ejecuta `npm install` de nuevo. |

---

## Autores

- Arze Kao Luis Angel
- Vargas Osinaga Richard Junior

Materia: Tecnología Web (INF513) · Docente: Ing. Balcazar Veizaga Evans · Universidad Autónoma Gabriel René Moreno.

## Fuentes

- Polymer Project. [Polymer/polymer](https://github.com/Polymer/polymer) y [documentación de Polymer 3.0](https://polymer-library.polymer-project.org/3.0/docs/devguide/feature-overview).
- Polymer Project. [Data binding](https://polymer-library.polymer-project.org/3.0/docs/devguide/data-binding).
- Modern Web. [Web Dev Server](https://modern-web.dev/docs/dev-server/overview/).
- JSONPlaceholder. [API de pruebas](https://jsonplaceholder.typicode.com/).
- Lit. [lit.dev](https://lit.dev/docs/).
