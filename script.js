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
            const generos_con_id = {
                genres: [],
            };

            [
                ...(
                    await obtenerDatosAPI(
                        "https://api.themoviedb.org/3/genre/movie/list?language=es",
                        "tmdb"
                    )
                )["genres"],
                ...(
                    await obtenerDatosAPI(
                        "https://api.themoviedb.org/3/genre/tv/list?language=es",
                        "tmdb"
                    )
                )["genres"],
            ].forEach((genero) => generos_con_id.genres.push(genero));

            const generos = Array.from(
                new Set(generos_con_id.genres.map((genero) => genero.name))
            ).sort();

            const proveedores_peliculas = await obtenerDatosAPI(
                "https://api.themoviedb.org/3/watch/providers/movie?language=es-MX",
                "tmdb"
            );

            const proveedores_series = await obtenerDatosAPI(
                "https://api.themoviedb.org/3/watch/providers/tv?language=es-MX",
                "tmdb"
            );
            const procesos_de_usuario = (
                await obtenerDatosAPI(
                    MOCKAPI_BASEURL + localStorage.getItem("session_user_id")
                )
            )["process_items"];

            const opcionesEstado = ["Pendiente", "En Curso", "Finalizado"];
            const opcionesFormato = [
                "Seleccionar Formato...",
                "Libros",
                "Series",
                "Películas",
            ];
            const opcionesValoracion = {
                1: "&starf;",
                2: "&starf; &starf;",
                3: "&starf; &starf; &starf;",
                4: "&starf; &starf; &starf; &starf;",
                5: "&starf; &starf; &starf; &starf; &starf;",
            };

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

            // Función genérica para llenar cualquier select
            function llenarSelect(select, opciones, valorSeleccionado = "") {
                select.innerHTML = ""; // Limpia las opciones actuales
                if (Array.isArray(opciones)) {
                    // Caso para opcionesEstado y opcionesFormato
                    opciones.forEach((opcion) => {
                        const option = document.createElement("option");
                        option.value = opcion;
                        option.textContent = opcion;
                        if (opcion === valorSeleccionado) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });
                } else {
                    // Caso para opcionesValoracion
                    for (const [value, text] of Object.entries(opciones)) {
                        const option = document.createElement("option");
                        option.value = value;
                        option.innerHTML = text;
                        if (value === valorSeleccionado) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    }
                }
            }

            // Función para convertir un elemento de texto a un input o select para editar
            function habilitarEdicion(p, tipo, opciones = null, valorOriginal = null) {
                let elementoEditable;
            
                if (tipo === "input" || tipo === "date") {
                    elementoEditable = document.createElement("input");
                    elementoEditable.type = tipo;
                    elementoEditable.value = p.textContent;
                } else if (tipo === "select") {
                    elementoEditable = document.createElement("select");
                    llenarSelect(
                        elementoEditable,
                        opciones,
                        p.getAttribute("valor")
                    );
                } else if (tipo === "textarea") {
                    elementoEditable = document.createElement("textarea");
                    elementoEditable.value = p.textContent;
                }
            
                p.replaceWith(elementoEditable);
                elementoEditable.focus();
            
                // Al perder el foco, volver al elemento de texto
                elementoEditable.addEventListener("blur", () => {
                    let selectedValue;
                    let selectedText;
            
                    if (elementoEditable.type === "select" || elementoEditable.type === "select-one") {
                        selectedValue = elementoEditable.value;
                        selectedText = elementoEditable.options[elementoEditable.selectedIndex].text;
                        if (opciones === opcionesValoracion) {
                            p.innerHTML = selectedText; // Asegura que se muestre el contenido de texto (estrellas)
                        } else {
                            p.textContent = selectedValue;
                        }
                    } else if (elementoEditable.type === "date") {
                        selectedValue = elementoEditable.value;
                        p.textContent = selectedValue ? selectedValue : "Pendiente";
                    } else {
                        selectedValue = elementoEditable.value;
                        p.textContent = selectedValue ? selectedValue : valorOriginal;
                    }
            
                    p.setAttribute("valor", selectedValue || valorOriginal); // Guardar el valor seleccionado o restaurar el original
                    elementoEditable.replaceWith(p);
                });
            }

            function cargarProcesos() {
                const Cuerpo = document.querySelector("main > article");

                procesos_de_usuario.forEach((proceso) => {
                    const proceso_cuerpo = document.createElement("form");
                    proceso_cuerpo.className = "flex wrap card j_sb";
                    Aqui me quede
                    const svg_section = document.createElement("svg-section");
                    svg_section.className = "flex all_c relative";

                    const load_bar = document.createElement("div");
                    load_bar.className = "load_bar_animation absolute";
                    svg_section.appendChild(load_bar);

                    const img = document.createElement("img");
                    img.className = "relative";
                    img.src = proceso.imagen;
                    img.alt = "";
                    svg_section.appendChild(img);

                    proceso_cuerpo.appendChild(svg_section);

                    const proces_1 = document.createElement("div");
                    proces_1.className = "proces_1 flex_col j_se";

                    // Título
                    const proces_hijo_1_titulo = document.createElement("div");
                    proces_hijo_1_titulo.className = "proces_hijo";
                    const h3_titulo = document.createElement("h3");
                    h3_titulo.textContent = "Titulo";
                    const p_titulo = document.createElement("p");
                    p_titulo.textContent = proceso.titulo;

                    p_titulo.addEventListener("click", () => {
                        habilitarEdicion(
                            p_titulo,
                            "input",
                            null,
                            proceso.titulo
                        );
                    });

                    proces_hijo_1_titulo.appendChild(h3_titulo);
                    proces_hijo_1_titulo.appendChild(p_titulo);
                    proces_1.appendChild(proces_hijo_1_titulo);

                    // Género
                    const proces_hijo_1_genero = document.createElement("div");
                    proces_hijo_1_genero.className = "proces_hijo";
                    const h3_genero = document.createElement("h3");
                    h3_genero.textContent = "Género";
                    const p_genero = document.createElement("p");
                    p_genero.textContent = proceso.genero;
                    p_genero.setAttribute("valor", proceso.genero); // Guardar valor actual

                    p_genero.addEventListener("click", () => {
                        habilitarEdicion(p_genero, "select", generos);
                    });

                    proces_hijo_1_genero.appendChild(h3_genero);
                    proces_hijo_1_genero.appendChild(p_genero);
                    proces_1.appendChild(proces_hijo_1_genero);

                    proceso_cuerpo.appendChild(proces_1);

                    const proces_2 = document.createElement("div");
                    proces_2.className = "proces_2 flex_col j_se";

                    // Estado
                    const proces_hijo_2_plataforma =
                        document.createElement("div");
                    proces_hijo_2_plataforma.className = "proces_hijo";
                    const h3_plataforma = document.createElement("h3");
                    h3_plataforma.textContent = "Plataforma";
                    const p_plataforma = document.createElement("p");
                    p_plataforma.textContent = proceso.plataforma;
                    const p_plataforma_atributos = {
                        required: "",
                        list: "plataformas",
                        name: "plataforma",
                    };
                    Object.entries(p_plataforma_atributos).forEach(
                        ([clave, valor]) =>
                            p_plataforma.setAttribute(clave, valor)
                    );
                    p_plataforma.setAttribute("valor", proceso.plataforma); // Guardar valor actual

                    p_plataforma.addEventListener("click", () => {
                        habilitarEdicion(p_plataforma, "input");
                    });

                    proces_hijo_2_plataforma.appendChild(h3_plataforma);
                    proces_hijo_2_plataforma.appendChild(p_plataforma);
                    proces_2.appendChild(proces_hijo_2_plataforma);

                    // Estado
                    const proces_hijo_2_estado = document.createElement("div");
                    proces_hijo_2_estado.className = "proces_hijo";
                    const h3_estado = document.createElement("h3");
                    h3_estado.textContent = "Estado";
                    const p_estado = document.createElement("p");
                    p_estado.textContent = proceso.estado;
                    p_estado.setAttribute("valor", proceso.estado); // Guardar valor actual

                    p_estado.addEventListener("click", () => {
                        habilitarEdicion(p_estado, "select", opcionesEstado);
                    });

                    proces_hijo_2_estado.appendChild(h3_estado);
                    proces_hijo_2_estado.appendChild(p_estado);
                    proces_2.appendChild(proces_hijo_2_estado);

                    // Formato
                    const proces_hijo_2_formato = document.createElement("div");
                    proces_hijo_2_formato.className = "proces_hijo";
                    const h3_formato = document.createElement("h3");
                    h3_formato.textContent = "Formato";
                    const p_formato = document.createElement("p");
                    p_formato.textContent = proceso.formato;
                    p_formato.setAttribute("valor", proceso.formato); // Guardar valor actual

                    p_formato.addEventListener("click", () => {
                        habilitarEdicion(p_formato, "select", opcionesFormato);
                    });

                    proces_hijo_2_formato.appendChild(h3_formato);
                    proces_hijo_2_formato.appendChild(p_formato);
                    proces_2.appendChild(proces_hijo_2_formato);

                    proceso_cuerpo.appendChild(proces_2);

                    const proces_3 = document.createElement("div");
                    proces_3.className = "proces_3 flex_col j_se";

                    // Fecha de terminación
                    const proces_hijo_3_fecha = document.createElement("div");
                    proces_hijo_3_fecha.className = "proces_hijo";
                    const h3_fecha = document.createElement("h3");
                    h3_fecha.textContent = "Fecha de terminación";
                    const p_fecha = document.createElement("p");
                    p_fecha.textContent =
                        proceso.fecha || "Pendiente";

                    p_fecha.addEventListener("click", () => {
                        habilitarEdicion(p_fecha, "date");
                    });

                    proces_hijo_3_fecha.appendChild(h3_fecha);
                    proces_hijo_3_fecha.appendChild(p_fecha);
                    proces_3.appendChild(proces_hijo_3_fecha);

                    // Valoración final
                    const proces_hijo_3_valoracion =
                        document.createElement("div");
                    proces_hijo_3_valoracion.className = "proces_hijo";
                    const h3_valoracion = document.createElement("h3");
                    h3_valoracion.textContent = "Valoración Final";
                    const p_valoracion = document.createElement("p");
                    p_valoracion.innerHTML =
                        opcionesValoracion[proceso.valoracion] || "Por definir";
                    p_valoracion.setAttribute(
                        "valor",
                        proceso.valoracion || "1"
                    ); // Guardar valor actual

                    p_valoracion.addEventListener("click", () => {
                        habilitarEdicion(
                            p_valoracion,
                            "select",
                            opcionesValoracion
                        );
                    });

                    proces_hijo_3_valoracion.appendChild(h3_valoracion);
                    proces_hijo_3_valoracion.appendChild(p_valoracion);
                    proces_3.appendChild(proces_hijo_3_valoracion);

                    const proces_hijo_3_resena = document.createElement("div");
                    proces_hijo_3_resena.className = "proces_hijo";
                    const h3_resena = document.createElement("h3");
                    h3_resena.textContent = "Reseña personal";
                    const q_resena = document.createElement("q");
                    q_resena.textContent = proceso.resena || "Pendiente"; // Contenido de la reseña

                    q_resena.addEventListener("click", () => {
                        habilitarEdicion(
                            q_resena,
                            "textarea",
                            null,
                            proceso.resena || "Pendiente"
                        );
                    });

                    proces_hijo_3_resena.appendChild(h3_resena);
                    proces_hijo_3_resena.appendChild(q_resena);
                    proces_3.appendChild(proces_hijo_3_resena);

                    proceso_cuerpo.appendChild(proces_3);

                    const boton_eliminar = document.createElement("button");
                    boton_eliminar.textContent = "Eliminar";
                    boton_eliminar.addEventListener("click", () => {
                        proceso_cuerpo.remove();
                    });
                    proceso_cuerpo.appendChild(boton_eliminar);

                    Cuerpo.appendChild(proceso_cuerpo);
                });
            }

            cargarProcesos();

            function obtener_genero(material_audiovisual) {
                let nombre_genero = "";
                const id = material_audiovisual.genre_ids[0];
                if (id) {
                    generos_con_id.genres.some((genero) => {
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

            async function obtenerArchivo_Texto(nombre, extension) {
                return await fetch(`/assets/${nombre}.${extension}`).then(
                    (res) => res.text()
                );
            }

            class templ_select extends HTMLElement {
                constructor() {
                    super();
                }

                async connectedCallback() {
                    const tipo = this.getAttribute("tipo");
                    this.insertAdjacentHTML(
                        "beforeend",
                        await obtenerArchivo_Texto(tipo, "html")
                    );
                }
            }

            class svg_section extends HTMLElement {
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
                        await obtenerArchivo_Texto(SVG, "svg")
                    );
                }
            }

            customElements.define("svg-section", svg_section);

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
                    dropdown.classList.remove("no_display");
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
            const titulo = popup.querySelector("input[name='titulo']");
            let genero;
            const paltaforma = popup.querySelector("input[name='plataforma']");
            let formato;
            const imagen = popup.querySelector("input[name='imagen']");

            function cargarPantallaAgregar(origen) {
                genero = popup.querySelector("select[name='genero']");
                formato = popup.querySelector("select[name='formato']");
                boton_añadir_personalizado.classList.add("no_display");
                llenarSelect(genero, generos);
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
                dropdown.classList.add("no_display");
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
