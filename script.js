"use strict";

const url = window.location;
const MOCKAPI_BASEURL =
    "https://66c79f4c732bf1b79fa710b8.mockapi.io/api/v1/users/";
let user_session;

async function crearDatosAPI(url, datos) {
    const opciones = {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(datos),
    };

    try {
        const respuesta = await fetch(new Request(url, opciones));
        if (!respuesta.ok) throw new Error(respuesta.status);
        return await respuesta.json();
    } catch (error) {
        console.error("Error enviando los datos: ", error);
    }
}

async function actualizarDatosAPI(url, datos) {
    const opciones = {
        method: "PUT",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(datos),
    };

    try {
        const respuesta = await fetch(new Request(url, opciones));
        if (!respuesta.ok) throw new Error(respuesta.status);
        return await respuesta.json();
    } catch (error) {
        console.error("Error enviando los datos: ", error);
    }
}

async function obtenerDatosAPI(url, api) {
    let opciones;
    if (api === "tmdb") {
        opciones = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization:
                    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyYTI2MzY4MTY4YTM2NzY1ODdmNTg4NTYzYmFlOWI4NyIsIm5iZiI6MTcyNDU1NDg3MC4yMjU3NzcsInN1YiI6IjY2YWE5MmE1NDIzMjEyYzBhMjc1NmZlZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.8tZ5n7o5INcTQ2dhXtvqhTqVFybwWJjDU9y77iWu_ag",
            },
        };
    } else {
        opciones = {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        };
    }

    try {
        const respuesta = await fetch(new Request(url, opciones));
        if (!respuesta.ok) throw new Error(respuesta.status);
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener datos: ", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    user_session = localStorage.getItem("session_user_username");
    if (url.pathname.includes("index")) {
        const LOADER_ELEMENT = document.querySelector(".load_bar_animation");
        LOADER_ELEMENT.removeAttribute("style");
        if (!user_session) {
            document
                .querySelector("#login")
                .addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const formObject = Object.fromEntries(formData.entries());
                    formObject["username"] =
                        formObject["username"].toLowerCase();
                    const MockAPIUsuarios = await obtenerDatosAPI(
                        MOCKAPI_BASEURL
                    );
                    if (MockAPIUsuarios.length > 0) {
                        let usuario_encontrado;
                        for (const usuario of MockAPIUsuarios) {
                            if (usuario.username === formObject["username"]) {
                                formObject["id"] = usuario.id;
                                await actualizarDatosAPI(
                                    MOCKAPI_BASEURL + formObject["id"],
                                    formObject
                                );
                                usuario_encontrado = true;
                            }
                        }
                        if (!usuario_encontrado) {
                            formObject["id"] = MockAPIUsuarios.length + 1;
                            await crearDatosAPI(MOCKAPI_BASEURL, formObject);
                        }
                    } else {
                        formObject["id"] = MockAPIUsuarios.length + 1;
                        await crearDatosAPI(MOCKAPI_BASEURL, formObject);
                    }
                    localStorage.setItem("session_user_id", formObject["id"]);
                    localStorage.setItem(
                        "session_user_username",
                        formObject["username"]
                    );
                    location.reload();
                });
        } else {
            document.querySelector("main").classList.add("no_display");
            document.querySelector("header").style.flexGrow = 1;
            LOADER_ELEMENT.style["right"] = "0%";
            setTimeout(() => {
                window.location.href = "http://127.0.0.1:5500/session.html";
            }, 1500);
        }
    } else {
        if (!user_session) {
            window.location.href = "http://127.0.0.1:5500/index.html";
        } else {
            const generos_peliculas = await obtenerDatosAPI(
                "https://api.themoviedb.org/3/genre/movie/list?language=es",
                "tmdb"
            );
            const generos_series = await obtenerDatosAPI(
                "https://api.themoviedb.org/3/genre/tv/list?language=es",
                "tmdb"
            );
            const proveedores_peliculas = await obtenerDatosAPI(
                "https://api.themoviedb.org/3/watch/providers/movie?language=es-MX",
                "tmdb"
            );
            const proveedores_series = await obtenerDatosAPI(
                "https://api.themoviedb.org/3/watch/providers/tv?language=es-MX",
                "tmdb"
            );
            const procesos_de_usuario = (await obtenerDatosAPI( MOCKAPI_BASEURL + localStorage.getItem("session_user_id")
            ))["process_items"];

            console.log(procesos_de_usuario);

            SIGUE LA CREACION DE LOS PROCESOS

            function llenarDatalist() {
                const conjunto_proveedores = new Set();
                proveedores_peliculas.results.forEach((proveedor) =>
                    conjunto_proveedores.add(proveedor.provider_name)
                );
                proveedores_series.results.forEach((proveedor) =>
                    conjunto_proveedores.add(proveedor.provider_name)
                );
                const proveedores = Array.from(conjunto_proveedores);
                proveedores.sort();
                proveedores.forEach((proveedor) => {
                    const option = document.createElement("option");
                    option.value, (option.textContent = proveedor);
                    document
                        .querySelector("#plataformas")
                        .insertAdjacentElement("beforeend", option);
                });
            }

            llenarDatalist();

            function llenarGeneros() {
                const conjunto_generos = new Set();
                generos_peliculas.genres.forEach((genero) =>
                    conjunto_generos.add(genero.name)
                );
                generos_series.genres.forEach((genero) =>
                    conjunto_generos.add(genero.name)
                );
                const generos = Array.from(conjunto_generos);
                generos.sort();
                generos.forEach((proveedor) => {
                    const option = document.createElement("option");
                    option.value, (option.textContent = proveedor);
                    document
                        .querySelector("select[name='genero']")
                        .insertAdjacentElement("beforeend", option);
                });
            }

            llenarGeneros();
            function obtener_genero(material_audiovisual) {
                let nombre_genero = "";
                const id = material_audiovisual.genre_ids[0];
                if (id) {
                    generos_peliculas.genres.some((genero) => {
                        if (genero.id === Number(id)) {
                            nombre_genero = genero.name;
                            return true;
                        }
                    });
                }
                return nombre_genero;
            }

            async function obtener_plataforma(material_audiovisual, tipo) {
                let proveedor = "";
                const id = Number(material_audiovisual.id);
                let datos;
                if (tipo === "Películas") {
                    datos = await obtenerDatosAPI(
                        `https://api.themoviedb.org/3/movie/${id}/watch/providers`,
                        "tmdb"
                    );
                } else {
                    datos = await obtenerDatosAPI(
                        `https://api.themoviedb.org/3/tv/${id}/watch/providers`,
                        "tmdb"
                    );
                }

                if (datos.results) {
                    if ("CO" in datos.results) {
                        const en_CO = datos.results["CO"];
                        const disponibilidad = [
                            "flatrate",
                            "buy",
                            "rent",
                            "ads",
                        ];
                        disponibilidad.forEach((opcion) => {
                            if (opcion in en_CO) {
                                proveedor = en_CO[opcion][0].provider_name;
                            }
                        });
                    }
                }
                return proveedor;
            }

            async function obtenerSVG_Texto(nombre) {
                return await fetch(`/assets/${nombre}.svg`).then((res) =>
                    res.text()
                );
            }

            class OpcionLateral extends HTMLElement {
                constructor() {
                    super();
                }

                async connectedCallback() {
                    const SVG = this.getAttribute("svg");
                    const animacion = document.createElement("div");
                    const colors = [
                        "fuchsia",
                        "lime",
                        "yellow",
                        "blue",
                        "aqua",
                        "orange",
                        "hotpink",
                        "lawngreen",
                        "cyan",
                        "magenta",
                        "springgreen",
                        "dodgerblue",
                        "deeppink",
                        "chartreuse",
                        "mediumspringgreen",
                        "limegreen",
                        "crimson",
                        "tomato",
                        "gold",
                        "coral",
                        "orangered",
                        "greenyellow",
                        "mediumturquoise",
                        "royalblue",
                        "mediumorchid",
                        "mediumpurple",
                        "yellowgreen",
                        "turquoise",
                        "mediumvioletred",
                        "darkorange",
                        "lightskyblue",
                        "palevioletred",
                        "mediumseagreen",
                        "violet",
                        "salmon",
                        "sandybrown",
                        "darkcyan",
                        "mediumslateblue",
                        "goldenrod",
                        "#3b82f6",
                        "#8b5df6",
                    ];
                    if (SVG === "logout") {
                        animacion.style.backgroundColor = "red";
                    } else {
                        animacion.style.backgroundColor =
                            colors[Math.floor(Math.random() * colors.length)];
                    }
                    animacion.classList.add("load_bar_animation", "absolute");
                    this.insertAdjacentElement("beforeend", animacion);
                    this.insertAdjacentHTML(
                        "beforeend",
                        await obtenerSVG_Texto(SVG)
                    );
                }
            }

            customElements.define("a-section", OpcionLateral);

            async function llenarDropdown(objeto, tipo, dropdown) {
                const titulo = document.createElement("h5");
                titulo.classList.add("unselected");
                titulo.textContent = tipo;
                dropdown.insertAdjacentElement("beforeend", titulo);
                let resultados;
                if (tipo === "Películas" || tipo === "Series") {
                    resultados = objeto.results.slice(0, 11);
                } else {
                    resultados = objeto.items;
                }
                if (resultados.length > 0) {
                    for (const resultado of resultados) {
                        const li = await crearElementoLi(resultado, tipo);
                        dropdown.insertAdjacentElement("beforeend", li);
                    }
                } else {
                    titulo.remove();
                }
            }

            async function crearElementoLi(material_audiovisual, tipo) {
                const li = document.createElement("li");
                li.classList.add("flex", "j_sb", "pointer");
                const img = document.createElement("img");
                const capturarErrorImg = () =>
                    (img.src = "https://http.cat/images/400.jpg");
                img.onerror = capturarErrorImg;
                const informacion = document.createElement("div");
                informacion.classList.add("flex_col", "j_sa");
                [img, informacion].forEach((elem) =>
                    li.insertAdjacentElement("beforeend", elem)
                );
                const titulo = document.createElement("h6");
                const cita = document.createElement("q");
                [titulo, cita].forEach((elem) =>
                    informacion.insertAdjacentElement("beforeend", elem)
                );
                if (tipo === "Películas") {
                    if (material_audiovisual.poster_path) {
                        img.src = `https://image.tmdb.org/t/p/w500/${material_audiovisual.poster_path}`;
                    } else {
                        img.remove();
                    }

                    li.setAttribute("titulo", material_audiovisual.title);
                    li.setAttribute(
                        "genero",
                        obtener_genero(material_audiovisual)
                    );
                    li.setAttribute(
                        "plataforma",
                        await obtener_plataforma(material_audiovisual, tipo)
                    );
                    titulo.textContent = material_audiovisual.title;
                    cita.textContent = material_audiovisual.release_date;
                } else if (tipo === "Series") {
                    if (material_audiovisual.poster_path) {
                        img.src = `https://image.tmdb.org/t/p/w500/${material_audiovisual.poster_path}`;
                    } else {
                        img.remove();
                    }

                    li.setAttribute("titulo", material_audiovisual.name);
                    li.setAttribute(
                        "genero",
                        obtener_genero(material_audiovisual)
                    );
                    li.setAttribute(
                        "plataforma",
                        await obtener_plataforma(material_audiovisual, tipo)
                    );
                    titulo.textContent = material_audiovisual.name;
                    cita.textContent = material_audiovisual.first_air_date;
                } else {
                    if (material_audiovisual.volumeInfo.imageLinks) {
                        img.src =
                            material_audiovisual.volumeInfo.imageLinks.smallThumbnail;
                    } else {
                        img.remove();
                    }

                    li.setAttribute(
                        "titulo",
                        material_audiovisual.volumeInfo.title
                    );
                    li.setAttribute("genero", "");
                    titulo.textContent = material_audiovisual.volumeInfo.title;
                    if (material_audiovisual.volumeInfo.authors) {
                        cita.textContent =
                            material_audiovisual.volumeInfo.authors.join(" | ");
                    } else {
                        cita.remove();
                    }
                }
                li.setAttribute("formato", tipo);
                li.addEventListener("click", (e) =>
                    cargarPantallaAgregar(e.currentTarget)
                );
                return li;
            }

            function debounce(func, delay) {
                let timeout;
                return function (...args) {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => func.apply(this, args), delay);
                };
            }

            document.querySelector("#search").addEventListener(
                "input",
                debounce(async (e) => {
                    dropdown.textContent = "";
                    const value = e.target.value;
                    if (value) {
                        boton_añadir_personalizado.classList.remove(
                            "no_display"
                        );
                        await llenarDropdown(
                            await obtenerDatosAPI(
                                `https://api.themoviedb.org/3/search/movie?query=${value}&include_adult=false&language=es-MX`,
                                "tmdb"
                            ),
                            "Películas",
                            dropdown
                        );
                        await llenarDropdown(
                            await obtenerDatosAPI(
                                `https://api.themoviedb.org/3/search/tv?query=${value}&include_adult=false&language=es-MX`,
                                "tmdb"
                            ),
                            "Series",
                            dropdown
                        );
                        await llenarDropdown(
                            await obtenerDatosAPI(
                                `https://www.googleapis.com/books/v1/volumes?q=${value}&orderBy=relevance&key=AIzaSyBlKG-uYeIZpmTG774O_jfILcw0TsMesN8`
                            ),
                            "Libros",
                            dropdown
                        );
                    } else {
                        boton_añadir_personalizado.classList.add("no_display");
                    }
                }, 800)
            );

            const boton_añadir_personalizado =
                document.querySelector("#search_bar button");
            const dropdown = document.querySelector("#dropdown");
            const popup = document.querySelector("#pantalla_agregar");
            const titulo = popup.querySelector("input[name='titulo'");
            const genero = popup.querySelector("select[name='genero'");
            const paltaforma = popup.querySelector("input[name='plataforma'");
            const formato = popup.querySelector("select[name='formato'");
            const imagen = popup.querySelector("input[name='imagen'");

            function cargarPantallaAgregar(origen) {
                boton_añadir_personalizado.classList.add("no_display");
                dropdown.textContent = "";

                if (origen.tagName === "LI") {
                    titulo.value = origen.getAttribute("titulo");

                    genero.value = origen.getAttribute("genero");

                    paltaforma.value = origen.getAttribute("plataforma");

                    formato.value = origen.getAttribute("formato");

                    imagen.value = origen.querySelector("img").src;

                    [titulo, genero, paltaforma, formato].forEach((input) =>
                        input.value
                            ? input.setAttribute("disabled", "")
                            : undefined
                    );
                } else {
                    titulo.value = document.querySelector("#search").value;
                }
                dropdown.textContent = "";
                popup.classList.remove("no_display");
            }

            function limpiarPantalla_agregar() {
                document
                    .querySelectorAll("select")
                    .forEach((select) => (select.selectedIndex = 0));
                document
                    .querySelectorAll("input, textarea")
                    .forEach((elem) => (elem.value = ""));
            }

            function cerrarPantalla_agregar() {
                limpiarPantalla_agregar();
                dropdown.textContent = "";
                popup.classList.add("no_display");
                [titulo, genero, paltaforma, formato].forEach((input) =>
                    input.removeAttribute("disabled")
                );
            }

            popup.addEventListener("click", (e) => {
                if (e.target.id === "pantalla_agregar") {
                    cerrarPantalla_agregar();
                }
            });

            document
                .querySelector(".exit")
                .parentElement.addEventListener(
                    "click",
                    cerrarPantalla_agregar
                );

            document
                .querySelector("#contenido_personalizado")
                .addEventListener("click", (e) =>
                    cargarPantallaAgregar(e.currentTarget)
                );

            document
                .querySelector("#pantalla_agregar-body")
                .addEventListener("submit", async (e) => {
                    e.preventDefault();
                    [titulo, genero, paltaforma, formato].forEach((input) =>
                        input.removeAttribute("disabled")
                    );
                    const formData = new FormData(e.target);
                    const formObject = Object.fromEntries(formData.entries());
                    const MockAPIUsuarios = await obtenerDatosAPI(
                        MOCKAPI_BASEURL
                    );

                    for (const usuario of MockAPIUsuarios) {
                        if (
                            usuario.username ===
                            localStorage.getItem("session_user_username")
                        ) {
                            const item_encontrado = usuario[
                                "process_items"
                            ].some((item) =>
                                item.titulo === formObject.titulo ? true : false
                            );
                            if (!item_encontrado)
                                usuario["process_items"].push(formObject);

                            await actualizarDatosAPI(
                                MOCKAPI_BASEURL +
                                    localStorage.getItem("session_user_id"),
                                usuario
                            );
                        }
                    }
                    window.location.reload();
                });
        }
    }
});

window.addEventListener("beforeunload", () => {
    document.querySelectorAll("input").forEach((input) => (input.value = ""));
});
