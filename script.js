"use strict";

const url = window.location;
const BASE_URL_API =
    "https://66c79f4c732bf1b79fa710b8.mockapi.io/api/v1/users/";
let user_session;

async function enviarDatosAPI(datos, url) {
    const opciones = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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

async function obtenerDatosAPI(url) {
    const opciones = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    };

    try {
        const respuesta = await fetch(new Request(url, opciones));
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener datos: ", error);
        throw error;
    }
}

function Redirigir_sesion(user_id) {}

document.addEventListener("DOMContentLoaded", async () => {
    user_session = localStorage.getItem("session_user_id");
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
                    formObject["id"] = formObject["id"].toLowerCase();
                    if (
                        !(await obtenerDatosAPI(
                            BASE_URL_API + formObject["id"]
                        ))
                    ) {
                        await enviarDatosAPI(BASE_URL_API, formObject);
                    }
                    localStorage.setItem("session_user_id", formObject["id"]);
                    location.reload();
                });
        } else {
            document.querySelector("main").classList.add("no_display");
            document.querySelector("header").style.flexGrow = 1;
            LOADER_ELEMENT.style["right"] = "0%";
            setTimeout(() => {
                window.location.href = "http://127.0.0.1:5500/session.html"
            }, 1500);
        }
    } else {
        if (!user_session) {
            window.location.href = "http://127.0.0.1:5500/index.html"
        } else {

        }
    }
});
