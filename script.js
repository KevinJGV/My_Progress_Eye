"use strict";

const URL = window.location;
const MOCKAPI_URL_BASE = "https://66c79f4c732bf1b79fa710b8.mockapi.io/api/v1/users/";
const API_TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyYTI2MzY4MTY4YTM2NzY1ODdmNTg4NTYzYmFlOWI4NyIsIm5iZiI6MTcyNDU1NDg3MC4yMjU3NzcsInN1YiI6IjY2YWE5MmE1NDIzMjEyYzBhMjc1NmZlZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.8tZ5n7o5INcTQ2dhXtvqhTqVFybwWJjDU9y77iWu_ag";
const API_GOOGLE_KEY = "AIzaSyBlKG-uYeIZpmTG774O_jfILcw0TsMesN8";

let sesionUsuario;
let usuario;
let generosConId;
let proveedoresPeliculas;
let proveedoresSeries;

const opcionesEstado = ["Pendiente", "En Curso", "Finalizado"];
const opcionesFormato = ["Libros", "Series", "Películas"];
const opcionesValoracion = {
    1: "&starf;",
    2: "&starf; &starf;",
    3: "&starf; &starf; &starf;",
    4: "&starf; &starf; &starf; &starf;",
    5: "&starf; &starf; &starf; &starf; &starf;"
};

async function solicitarAPI(url, api = "mockapi") {
    const opciones = {
        method: "GET",
        headers: api === "tmdb" ? {
            accept: "application/json",
            Authorization: `Bearer ${API_TMDB_TOKEN}`
        } : { "Content-Type": "application/json" }
    };

    try {
        const respuesta = await fetch(new Request(url, opciones));
        if (!respuesta.ok) throw new Error(respuesta.status);
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener datos: ", error);
    }
}

async function enviarAPI(url, datos, metodo = "POST") {
    const opciones = {
        method: metodo,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(datos)
    };

    try {
        const respuesta = await fetch(new Request(url, opciones));
        if (!respuesta.ok) throw new Error(respuesta.status);
        return await respuesta.json();
    } catch (error) {
        console.error(`Error ${metodo === "POST" ? "enviando" : "actualizando"} los datos: `, error);
    }
}

async function inicializarDatos() {
    const [generosPeliculas, generosSeries] = await Promise.all([
        solicitarAPI("https://api.themoviedb.org/3/genre/movie/list?language=es", "tmdb"),
        solicitarAPI("https://api.themoviedb.org/3/genre/tv/list?language=es", "tmdb")
    ]);

    generosConId = { genres: [...generosPeliculas.genres, ...generosSeries.genres] };

    [proveedoresPeliculas, proveedoresSeries] = await Promise.all([
        solicitarAPI("https://api.themoviedb.org/3/watch/providers/movie?language=es-MX", "tmdb"),
        solicitarAPI("https://api.themoviedb.org/3/watch/providers/tv?language=es-MX", "tmdb")
    ]);

    usuario = await solicitarAPI(MOCKAPI_URL_BASE + localStorage.getItem("session_user_id"));
}

function llenarDatalist() {
    const conjunto_proveedores = new Set();
    proveedoresPeliculas.results.forEach((proveedor) =>
        conjunto_proveedores.add(proveedor.provider_name)
    );
    proveedoresSeries.results.forEach((proveedor) =>
        conjunto_proveedores.add(proveedor.provider_name)
    );
    const proveedores = Array.from(conjunto_proveedores);
    proveedores.sort();
    proveedores.forEach((proveedor) => {
        const option = document.createElement("option");
        option.value = proveedor;
        option.textContent = proveedor;
        document.querySelector("#plataformas").insertAdjacentElement("beforeend", option);
    });
}

function llenarSelect(select, opciones, valorSeleccionado = "") {
    select.innerHTML = "";
    if (Array.isArray(opciones)) {
        opciones.forEach(opcion => {
            const option = document.createElement("option");
            option.value = option.textContent = opcion;
            option.selected = opcion === valorSeleccionado;
            select.appendChild(option);
        });
    } else {
        Object.entries(opciones).forEach(([valor, texto]) => {
            const option = document.createElement("option");
            option.value = valor;
            option.innerHTML = texto;
            option.selected = valor === valorSeleccionado;
            select.appendChild(option);
        });
    }
}

function habilitarEdicion(elemento, tipo, opciones = null, valorOriginal = null) {
    let elementoEditable;

    if (tipo === "input" || tipo === "date") {
        elementoEditable = document.createElement("input");
        elementoEditable.type = tipo;
        elementoEditable.value = elemento.textContent;
        elementoEditable.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                elementoEditable.blur();
            }
        });
    } else if (tipo === "select") {
        elementoEditable = document.createElement("select");
        llenarSelect(elementoEditable, opciones, elemento.getAttribute("valor"));
    } else if (tipo === "textarea") {
        elementoEditable = document.createElement("textarea");
        elementoEditable.value = elemento.textContent;
    }

    elementoEditable.maxLength = 20;
    elemento.replaceWith(elementoEditable);
    elementoEditable.focus();

    elementoEditable.addEventListener("blur", async (e) => {
        const elementoEditado = e.target;
        const indice = elementoEditado.closest("form").getAttribute("i");
        usuario.process_items[indice][elemento.getAttribute("seccion")] = elementoEditado.value;

        await enviarAPI(MOCKAPI_URL_BASE + localStorage.getItem("session_user_id"), usuario, "PUT");

        let valorSeleccionado, textoSeleccionado;

        if (elementoEditable.tagName === "SELECT") {
            valorSeleccionado = elementoEditable.value;
            textoSeleccionado = elementoEditable.options[elementoEditable.selectedIndex].text;
            elemento.innerHTML = opciones === opcionesValoracion ? textoSeleccionado : valorSeleccionado;
        } else if (elementoEditable.type === "date") {
            valorSeleccionado = elementoEditable.value;
            elemento.textContent = valorSeleccionado || "Pendiente";
        } else {
            valorSeleccionado = elementoEditable.value;
            elemento.textContent = valorSeleccionado || valorOriginal;
        }

        elemento.setAttribute("valor", valorSeleccionado || valorOriginal);
        elementoEditable.replaceWith(elemento);
    });
}

async function obtenerGenero(materialAudiovisual) {
    const id = materialAudiovisual.genre_ids[0];
    if (id) {
        const genero = generosConId.genres.find(g => g.id === Number(id));
        return genero ? genero.name : "";
    }
    return "";
}

async function obtenerPlataforma(materialAudiovisual, tipo) {
    const id = Number(materialAudiovisual.id);
    const datos = await solicitarAPI(`https://api.themoviedb.org/3/${tipo === "Películas" ? "movie" : "tv"}/${id}/watch/providers`, "tmdb");

    if (datos.results && datos.results.CO) {
        const enCO = datos.results.CO;
        for (const opcion of ["flatrate", "buy", "rent", "ads"]) {
            if (enCO[opcion]) {
                return enCO[opcion][0].provider_name;
            }
        }
    }
    return "";
}

async function obtenerArchivoTexto(nombre, extension) {
    try {
        const response = await fetch(`assets/${nombre}.${extension}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let content = await response.text();
        
        if (extension === 'svg') {
            content = content.replace(/<\?xml[^>]*\?>/g, '');
            content = content.replace(/<!--[\s\S]*?-->/g, '');
            content = content.trim();
        }
        
        return content;
    } catch (error) {
        console.error(`Error al cargar archivo ${nombre}.${extension}:`, error);
        throw error;
    }
}

async function crearElementoLi(materialAudiovisual, tipo) {
    const li = document.createElement("li");
    li.classList.add("flex", "j_sb", "pointer");
    const img = document.createElement("img");
    img.onerror = () => img.src = "https://http.cat/images/400.jpg";
    const informacion = document.createElement("div");
    informacion.classList.add("flex_col", "j_sa");
    li.append(img, informacion);

    const titulo = document.createElement("h6");
    const cita = document.createElement("q");
    informacion.append(titulo, cita);

    if (tipo === "Películas" || tipo === "Series") {
        const espelicula = tipo === "Películas";
        if (materialAudiovisual.poster_path) {
            img.src = `https://image.tmdb.org/t/p/w500/${materialAudiovisual.poster_path}`;
        } else {
            img.remove();
        }

        li.setAttribute("titulo", materialAudiovisual[espelicula ? "title" : "name"]);
        li.setAttribute("genero", await obtenerGenero(materialAudiovisual));
        li.setAttribute("plataforma", await obtenerPlataforma(materialAudiovisual, tipo));
        titulo.textContent = materialAudiovisual[espelicula ? "title" : "name"];
        cita.textContent = materialAudiovisual[espelicula ? "release_date" : "first_air_date"];
    } else {
        if (materialAudiovisual.volumeInfo.imageLinks) {
            img.src = materialAudiovisual.volumeInfo.imageLinks.smallThumbnail;
        } else {
            img.remove();
        }

        li.setAttribute("titulo", materialAudiovisual.volumeInfo.title);
        li.setAttribute("genero", "");
        titulo.textContent = materialAudiovisual.volumeInfo.title;
        if (materialAudiovisual.volumeInfo.authors) {
            cita.textContent = materialAudiovisual.volumeInfo.authors.join(" | ");
        } else {
            cita.remove();
        }
    }

    li.setAttribute("formato", tipo);
    li.addEventListener("click", e => cargarPantallaAgregar(e.currentTarget));
    return li;
}

async function llenarDropdown(objeto, tipo, dropdown) {
    const titulo = document.createElement("h5");
    titulo.classList.add("unselected");
    titulo.textContent = tipo;
    dropdown.appendChild(titulo);

    const resultados = tipo === "Libros" ? objeto.items : objeto.results.slice(0, 11);
    if (resultados.length > 0) {
        for (const resultado of resultados) {
            const li = await crearElementoLi(resultado, tipo);
            dropdown.appendChild(li);
        }
    } else {
        titulo.remove();
    }
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function buscarContenido(valor) {
    dropdown.textContent = "";
    dropdown.classList.remove("no_display");

    if (valor) {
        botonAnadirPersonalizado.classList.remove("no_display");

        const peliculas = await solicitarAPI(
            `https://api.themoviedb.org/3/search/movie?query=${valor}&include_adult=false&language=es-MX`,
            "tmdb"
        );
        await llenarDropdown(peliculas, "Películas", dropdown);

        const series = await solicitarAPI(
            `https://api.themoviedb.org/3/search/tv?query=${valor}&include_adult=false&language=es-MX`,
            "tmdb"
        );
        await llenarDropdown(series, "Series", dropdown);

        const libros = await solicitarAPI(
            `https://www.googleapis.com/books/v1/volumes?q=${valor}&orderBy=relevance&key=${API_GOOGLE_KEY}`
        );
        await llenarDropdown(libros, "Libros", dropdown);

    } else {
        botonAnadirPersonalizado.classList.add("no_display");
    }
}

function cargarPantallaAgregar(origen) {
    botonAnadirPersonalizado.classList.add("no_display");
    llenarSelect(genero, Array.from(new Set(generosConId.genres.map(g => g.name))).sort());
    llenarDatalist();
    dropdown.textContent = "";
    if (origen.tagName === "LI") {
        titulo.value = origen.getAttribute("titulo");
        genero.value = origen.getAttribute("genero");
        plataforma.value = origen.getAttribute("plataforma");
        formato.value = origen.getAttribute("formato");
        if (origen.querySelector("img")) imagen.value = origen.querySelector("img").src;

        [titulo, genero, plataforma, formato].forEach(input => input.value ? input.setAttribute("disabled", "") : undefined);
    } else {
        titulo.value = document.querySelector("#search").value;
    }
    dropdown.textContent = "";
    popup.classList.remove("no_display");
}

function limpiarPantallaAgregar() {
    document.querySelectorAll("select").forEach(select => select.selectedIndex = 0);
    document.querySelectorAll("input, textarea").forEach(elem => elem.value = "");
}

function cerrarPantallaAgregar() {
    limpiarPantallaAgregar();
    dropdown.classList.add("no_display");
    dropdown.textContent = "";
    popup.classList.add("no_display");
    [titulo, genero, plataforma, formato].forEach(input => input.removeAttribute("disabled"));
}

async function agregarProcesoUsuario(formObject) {
    const usuariosMockAPI = await solicitarAPI(MOCKAPI_URL_BASE);
    for (const usuario of usuariosMockAPI) {
        if (usuario.username === localStorage.getItem("session_user_username")) {
            const itemEncontrado = usuario.process_items.some(item => item.titulo === formObject.titulo);
            if (!itemEncontrado) usuario.process_items.push(formObject);
            await enviarAPI(MOCKAPI_URL_BASE + localStorage.getItem("session_user_id"), usuario, "PUT");
        }
    }
    window.location.reload();
}

function filtrarProcesos(filtro) {
    const articulo = document.querySelector("article");
    const salvapantallas = document.querySelector("#salvapantallas");
    salvapantallas.textContent = "";
    let contador = 0;

    Array.from(articulo.children).forEach(elemento => {
        if (filtro === "todos" || elemento.getAttribute("formato") === filtro || elemento.tagName === "SECTION") {
            elemento.classList.remove("no_display");

        } else {
            elemento.classList.add("no_display");
            contador++;
        }
    });

    if (contador + 1 === articulo.children.length) {
        salvapantallas.textContent = filtro === "todos" ?
            "Sin progresos en tu vida, cambia ;)" :
            "No tienes procesos en esta categoría.";
    }
}

function evaluarCantidadDeHijos(elemento) {
    const salvapantallas = document.querySelector("#salvapantallas");
    salvapantallas.textContent = elemento.children.length > 1 ?
        "" :
        "Sin progresos en tu vida, cambia ;)";
}

async function inicializarPagina() {
    sesionUsuario = localStorage.getItem("session_user_username");

    if (URL.pathname.includes("index")) {
        manejarPaginaIndex();
    } else {
        if (!sesionUsuario) {
            window.location.href = "index.html";
        } else {
            await manejarPaginaSesion();
        }
    }
}

async function manejarPaginaIndex() {
    const elementoCargador = document.querySelector(".load_bar_animation");
    elementoCargador.removeAttribute("style");

    if (!sesionUsuario) {
        document.querySelector("#login").addEventListener("submit", manejarInicioSesion);
    } else {
        document.querySelector("main").classList.add("no_display");
        document.querySelector("header").style.flexGrow = 1;
        elementoCargador.style.right = "0%";
        setTimeout(() => {
            window.location.href = "session.html";
        }, 1500);
    }
}

async function manejarInicioSesion(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formObject = Object.fromEntries(formData.entries());
    formObject.username = formObject.username.toLowerCase();

    const usuariosMockAPI = await solicitarAPI(MOCKAPI_URL_BASE);
    let usuarioEncontrado = usuariosMockAPI.find(u => u.username === formObject.username);

    if (usuarioEncontrado) {
        formObject.id = usuarioEncontrado.id;
        await enviarAPI(MOCKAPI_URL_BASE + formObject.id, formObject, "PUT");
    } else {
        formObject.id = usuariosMockAPI.length + 1;
        await enviarAPI(MOCKAPI_URL_BASE, formObject);
    }

    localStorage.setItem("session_user_id", formObject.id);
    localStorage.setItem("session_user_username", formObject.username);
    location.reload();
}

async function manejarPaginaSesion() {
    document.querySelector("title").textContent = `${sesionUsuario} - Dashboard`;
    await inicializarDatos();
    definirComponenteSVG();
    await cargarProcesos();
    inicializarEventListeners();
    observarCambiosProcesos();
}

function definirComponenteSVG() {
    if (customElements.get("svg-section")) {
        return;
    }

    class SVGSection extends HTMLElement {
        constructor() {
            super();
        }

        async connectedCallback() {
            const SVG = this.getAttribute("svg");
            
            const animacion = document.createElement("div");
            const colores = [
                "fuchsia", "lime", "yellow", "blue", "aqua", "orange", "hotpink",
                "lawngreen", "cyan", "magenta", "springgreen", "dodgerblue", "deeppink",
                "chartreuse", "mediumspringgreen", "limegreen", "crimson", "tomato",
                "gold", "coral", "orangered", "greenyellow", "mediumturquoise", "royalblue",
                "mediumorchid", "mediumpurple", "yellowgreen", "turquoise", "mediumvioletred",
                "darkorange", "lightskyblue", "palevioletred", "mediumseagreen", "violet",
                "salmon", "sandybrown", "darkcyan", "mediumslateblue", "goldenrod", "#3b82f6", "#8b5df6"
            ];
            animacion.style.backgroundColor = SVG === "logout" ? "red" : colores[Math.floor(Math.random() * colores.length)];
            animacion.classList.add("load_bar_animation", "absolute");
            this.appendChild(animacion);
            
            try {
                const svgContent = await obtenerArchivoTexto(SVG, "svg");
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = svgContent;
                const svgElement = tempDiv.querySelector('svg');
                
                if (svgElement) {
                    let titleText = svgElement.getAttribute('data-title') || '';
                    
                    if (!titleText) {
                        titleText = SVG.charAt(0).toUpperCase() + SVG.slice(1);
                    }
                    
                    const svgClone = svgElement.cloneNode(true);
                    this.appendChild(svgClone);
                    
                    if (titleText) {
                        this.setAttribute('data-title', titleText);
                    }
                } else {
                    throw new Error('No se encontró elemento SVG válido');
                }
                
            } catch (error) {
                console.error(`Error cargando SVG ${SVG}:`, error);
                const fallbackText = document.createElement("span");
                fallbackText.textContent = SVG.charAt(0).toUpperCase() + SVG.slice(1);
                fallbackText.style.color = "white";
                fallbackText.style.fontSize = "12px";
                this.appendChild(fallbackText);
            }
        }
    }
    
    try {
        customElements.define("svg-section", SVGSection);
    } catch (error) {
        console.error("Error definiendo svg-section:", error);
    }
}

async function cargarProcesos() {
    const cuerpo = document.querySelector("main > article");
    const salvapantallas = document.querySelector("#salvapantallas");

    if (usuario.process_items.length > 0) salvapantallas.textContent = "";

    usuario.process_items.forEach((proceso, index) => {
        const procesoCuerpo = crearElementoProceso(proceso, index);
        cuerpo.appendChild(procesoCuerpo);
    });
}

function crearElementoProceso(proceso, index) {
    const procesoCuerpo = document.createElement("form");
    procesoCuerpo.className = "flex wrap card j_sb relative";
    procesoCuerpo.setAttribute("formato", proceso.formato);
    procesoCuerpo.setAttribute("i", index);

    const svgSection = document.createElement("svg-section");
    svgSection.className = "flex all_c relative";
    svgSection.setAttribute("svg", proceso.formato);

    const img = document.createElement("img");
    img.className = "relative";
    img.src = proceso.imagen;
    img.alt = "";
    svgSection.appendChild(img);

    procesoCuerpo.appendChild(svgSection);

    const seccionesProceso = ['titulo', 'genero', 'plataforma', 'estado', 'formato', 'fecha', 'valoracion', 'reseña'];
    const bloquesProceso = [
        ['titulo', 'genero'],
        ['plataforma', 'estado', 'formato'],
        ['fecha', 'valoracion', 'reseña']
    ];

    bloquesProceso.forEach((bloque, i) => {
        const divBloque = document.createElement('div');
        divBloque.className = "flex_col j_se";

        bloque.forEach(seccion => {
            const divSeccion = document.createElement('div');
            divSeccion.className = "proces_hijo";

            const h3 = document.createElement('h3');
            h3.textContent = seccion.charAt(0).toUpperCase() + seccion.slice(1);

            const elemento = seccion === 'reseña' ? document.createElement('q') : document.createElement('p');
            elemento.setAttribute("seccion", seccion);
            elemento.textContent = proceso[seccion] || (seccion === 'fecha' ? 'Pendiente' : '');

            if (seccion === 'valoracion') {
                elemento.innerHTML = opcionesValoracion[proceso[seccion]] || "Por definir";
            }

            elemento.setAttribute("valor", proceso[seccion] || "");

            elemento.addEventListener("click", () => {

                let tipo = "input";
                let opciones = null;

                if (seccion === 'estado') {
                    tipo = "select";
                    opciones = opcionesEstado;
                } else if (seccion === 'formato') {
                    tipo = "select";
                    opciones = opcionesFormato;
                } else if (seccion === 'genero') {
                    tipo = "select";
                    opciones = Array.from(new Set(generosConId.genres.map(g => g.name))).sort();
                } else if (seccion === 'valoracion') {
                    tipo = "select";
                    opciones = opcionesValoracion;
                } else if (seccion === 'fecha') {
                    tipo = "date";
                } else if (seccion === 'reseña') {
                    tipo = "textarea";
                }

                habilitarEdicion(elemento, tipo, opciones, proceso[seccion]);
            });

            divSeccion.appendChild(h3);
            divSeccion.appendChild(elemento);
            divBloque.appendChild(divSeccion);
        });

        procesoCuerpo.appendChild(divBloque);
    });

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", async (e) => {
        e.preventDefault();
        usuario.process_items.splice(index, 1);
        await enviarAPI(MOCKAPI_URL_BASE + localStorage.getItem("session_user_id"), usuario, "PUT");
        procesoCuerpo.remove();
    });
    procesoCuerpo.appendChild(botonEliminar);

    return procesoCuerpo;
}

let botonAnadirPersonalizado, dropdown, popup, titulo, genero, plataforma, formato, imagen;

function inicializarEventListeners() {
    botonAnadirPersonalizado = document.querySelector("#search_bar button");
    dropdown = document.querySelector("#dropdown");
    popup = document.querySelector("#pantalla_agregar");
    titulo = popup.querySelector("input[name='titulo']");
    genero = popup.querySelector("select[name='genero']");
    plataforma = popup.querySelector("input[name='plataforma']");
    formato = popup.querySelector("select[name='formato']");
    imagen = popup.querySelector("input[name='imagen']");

    document.querySelector("#search").addEventListener("input", debounce(async (e) => {
        await buscarContenido(e.target.value);
    }, 800));

    popup.addEventListener("click", (e) => {
        if (e.target.id === "pantalla_agregar") {
            cerrarPantallaAgregar();
        }
    });

    document.querySelector(".exit").parentElement.addEventListener("click", cerrarPantallaAgregar);

    document.querySelector("#contenido_personalizado").addEventListener("click", (e) => cargarPantallaAgregar(e.currentTarget));

    document.querySelector("#pantalla_agregar-body").addEventListener("submit", async (e) => {
        e.preventDefault();
        [titulo, genero, plataforma, formato].forEach(input => input.removeAttribute("disabled"));
        const formData = new FormData(e.target);
        const formObject = Object.fromEntries(formData.entries());
        await agregarProcesoUsuario(formObject);
    });

    document.querySelectorAll("#sections > *").forEach((elemento, index) => {
        elemento.addEventListener("click", () => {
            const filtro = elemento.getAttribute("svg");
            filtrarProcesos(index === 0 ? "todos" : filtro);
        });
    });

    document.querySelector("svg-section[svg='logout']").addEventListener("click", () => {
        localStorage.clear();
        window.location.reload();
    });
}

function observarCambiosProcesos() {
    const observador = new MutationObserver((mutaciones) => {
        mutaciones.forEach((mutacion) => {
            if (mutacion.type === "childList") {
                evaluarCantidadDeHijos(mutacion.target);
            }
        });
    });

    const procesosEnPantalla = document.querySelector("article");
    observador.observe(procesosEnPantalla, { childList: true });
}

document.addEventListener("DOMContentLoaded", inicializarPagina);

window.addEventListener("beforeunload", () => {
    document.querySelectorAll("input").forEach(input => input.value = "");
});