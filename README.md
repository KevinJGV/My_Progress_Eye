# My Progress Eye v1.0 - Gestor de Contenido Multimedia

My Progress Eye es una aplicación web interactiva diseñada para ayudar a los usuarios a gestionar y dar seguimiento a su consumo de contenido multimedia, incluyendo películas, series y libros.

## Contenido del proyecto

- [Comenzando 🚀](#comenzando-)
- [Características principales 🌟](#características-principales-)
- [Interfaz de usuario 🖥️](#interfaz-de-usuario-️)
- [Funcionalidades detalladas 📋](#funcionalidades-detalladas-)
- [Construido con 🛠️](#construido-con-️)
- [Consideraciones de diseño 🎨](#consideraciones-de-diseño-)
- [Autoría ✒️](#autoría-️)

## Comenzando 🚀

My Progress Eye es una aplicación web responsive diseñada para funcionar en una amplia gama de dispositivos. Para comenzar a utilizar la aplicación:

1. Clona el repositorio e inicia `index.html` en tu navegador ó [inicia desde GitHub Pages]([https://kevinjgv.github.io/Proyecto_JavaScript_GonzalezKevin_/])
2. Inicia sesión o crea una nueva cuenta de usuario.
3. Comienza a agregar y gestionar tu contenido multimedia.

## Características principales 🌟

- Gestión de cuenta de usuario personalizada.
- Búsqueda y agregado de películas, series y libros a tu lista personal.
- Seguimiento del progreso de visualización/lectura.
- Categorización por tipo de contenido (películas, series, libros).
- Sistema de valoración y reseñas personales.
- Interfaz intuitiva y responsive.

## Interfaz de usuario 🖥️

La interfaz de My Progress Eye se compone de varias secciones clave:

1. **Barra de búsqueda**: Permite buscar contenido para agregar a tu lista.
2. **Panel de agregar contenido**: Formulario para añadir nuevos elementos a tu lista.
3. **Dashboard principal**: Muestra todos tus elementos agregados con opciones de filtrado.
4. **Barra lateral**: Proporciona acceso rápido a diferentes categorías y la opción de cerrar sesión.

## Funcionalidades detalladas 📋

### Gestión de usuarios

- Inicio de sesión y creación de cuentas.
- Almacenamiento de datos de usuario en MockAPI.

### Búsqueda de contenido

- Integración con APIs externas (TMDB para películas y series, Google Books para libros).
- Resultados de búsqueda en tiempo real con debounce para optimizar las peticiones.

### Agregar contenido

- Formulario detallado para agregar nuevo contenido manualmente o desde resultados de búsqueda.
- Campos incluyen: título, género, plataforma, estado, formato, fecha de terminación, valoración y reseña personal.

### Dashboard de contenido

- Visualización de todo el contenido agregado en tarjetas informativas.
- Opciones de edición inline para cada campo de información.
- Funcionalidad de eliminación de elementos.

### Filtrado y categorización

- Filtrado rápido por tipo de contenido (todos, libros, películas, series).
- Visualización adaptativa según el contenido filtrado.

## Construido con 🛠️

El proyecto utiliza tecnologías web modernas:

* HTML5
* CSS3 (con diseño responsivo y animaciones)
* JavaScript (ES6+, con manejo asíncrono de APIs)
* APIs externas: TMDB, Google Books
* MockAPI para almacenamiento de datos de usuario

## Consideraciones de diseño 🎨

- Paleta de colores consistente con variables CSS para fácil personalización.
- Diseño responsivo que se adapta a diferentes tamaños de pantalla.
- Animaciones sutiles para mejorar la experiencia de usuario.
- Iconografía personalizada para diferentes tipos de contenido.

## Autoría ✒️

* [KevinJGV]([https://github.com/KevinJGV](https://github.com/KevinJGV))

Este proyecto fue desarrollado como una herramienta personal para gestionar y dar seguimiento al consumo de contenido multimedia. Utiliza APIs públicas para la búsqueda de contenido y MockAPI para el almacenamiento de datos de usuario.
