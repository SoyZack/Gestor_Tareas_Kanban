
import {
    inicializarTareas,
    obtenerTareas,
    crearTarea,
    actualizarTarea,
    eliminarTarea
} from "./tareas.js";

import {
    renderizarTablero
} from "./tablero.js";

import {
    aplicarFiltros
} from "./filtros.js";

import {
    cargarTareas,
    guardarTareas
} from "./almacenamiento.js";


// 1. Obtener elementos del HTML

const formulario = document.querySelector("#form-tarea");
const campoTitulo = document.querySelector("#titulo");
const campoDescripcion = document.querySelector("#descripcion");
const campoPrioridad = document.querySelector("#prioridad");
const campoFecha = document.querySelector("#fechaLimite");

const campoBusqueda = document.querySelector("#busqueda");
const filtroPrioridad = document.querySelector("#filtro-prioridad");
const filtroEstado = document.querySelector("#filtro-estado");

const formularioCollapse = document.querySelector("#formulario-collapse");
const tablero = document.querySelector("#tablero");
const botonTema = document.querySelector("#themeToggle");
const formularioEditar = document.querySelector("#form-editar-tarea");
const modalEditarElemento = document.querySelector("#modalEditarTarea");
const modalEliminarElemento = document.querySelector("#modalEliminarTarea");
const campoEditarTitulo = document.querySelector("#editar-titulo");
const campoEditarDescripcion = document.querySelector("#editar-descripcion");
const campoEditarPrioridad = document.querySelector("#editar-prioridad");
const campoEditarFecha = document.querySelector("#editar-fecha");
const alertaFechaNueva = document.querySelector("#alerta-fecha-nueva");
const alertaFechaEditar = document.querySelector("#alerta-fecha-editar");
const nombreTareaEliminar = document.querySelector("#nombre-tarea-eliminar");
const botonConfirmarEliminar = document.querySelector("#confirmar-eliminar");
const CLAVE_TEMA = "taskflow_tema";
const FECHA_MINIMA = "2026-01-01";
const FECHA_MAXIMA = "2026-12-31";
const modalEditarTarea = bootstrap.Modal.getOrCreateInstance(modalEditarElemento);
const modalEliminarTarea = bootstrap.Modal.getOrCreateInstance(modalEliminarElemento);


// 2. Estado de los filtros

const filtros = {
    busqueda: "",
    prioridad: "todas",
    estado: "todos"
};

let tareaEditandoId = null;
let tareaEliminandoId = null;


// 3. Inicializar aplicación

function iniciarAplicacion() {

    const tareasGuardadas = cargarTareas();

    inicializarTema();
    inicializarTareas(tareasGuardadas);

    actualizarVista();

    registrarEventos();

    console.log("TaskFlow se ha iniciado correctamente.");
}


// 4. Registrar eventos

function registrarEventos() {

    formulario.addEventListener("submit", manejarCrearTarea);
    botonTema.addEventListener("click", alternarTema);
    formularioEditar.addEventListener("submit", manejarGuardarEdicion);
    botonConfirmarEliminar.addEventListener("click", confirmarEliminacion);
    campoFecha.addEventListener("input", () => {
        validarFechaLimite(alertaFechaNueva, campoFecha);
    });
    campoEditarFecha.addEventListener("input", () => {
        validarFechaLimite(alertaFechaEditar, campoEditarFecha);
    });

    campoBusqueda.addEventListener("input", () => {
        filtros.busqueda = campoBusqueda.value.trim();
        actualizarVista();
    });

    filtroPrioridad.addEventListener("change", () => {
        filtros.prioridad = filtroPrioridad.value;
        actualizarVista();
    });

    filtroEstado.addEventListener("change", () => {
        filtros.estado = filtroEstado.value;
        actualizarVista();
    });

    tablero.addEventListener("click", manejarAccionesTablero);
    tablero.addEventListener("change", manejarCambiosTablero);

    // Eventos para arrastrar y soltar tareas
    tablero.addEventListener("dragstart", manejarInicioArrastre);
    tablero.addEventListener("dragover", manejarArrastre);
    tablero.addEventListener("drop", manejarSoltar);

    tablero.addEventListener("dragend", evento => {
        evento.target.closest(".tarjeta-tarea")?.classList.remove("arrastrando");
        tareaArrastrada = null;
    });
}

function inicializarTema() {
    let temaGuardado = "claro";

    try {
        temaGuardado = localStorage.getItem(CLAVE_TEMA) || "claro";
    } catch (error) {
        console.error("No se pudo cargar la preferencia de tema:", error);
    }

    aplicarTema(temaGuardado === "oscuro" ? "oscuro" : "claro");
}

function alternarTema() {
    const temaActual = document.body.dataset.tema === "oscuro"
        ? "oscuro"
        : "claro";
    const nuevoTema = temaActual === "oscuro" ? "claro" : "oscuro";

    aplicarTema(nuevoTema);

    try {
        localStorage.setItem(CLAVE_TEMA, nuevoTema);
    } catch (error) {
        console.error("No se pudo guardar la preferencia de tema:", error);
    }
}

function aplicarTema(tema) {
    const temaOscuro = tema === "oscuro";

    document.body.dataset.tema = temaOscuro ? "oscuro" : "claro";
    botonTema.innerHTML = `<i class="bi ${temaOscuro ? "bi-sun-fill" : "bi-moon-fill"}" aria-hidden="true"></i>`;
    botonTema.title = temaOscuro
        ? "Cambiar a tema claro"
        : "Cambiar a tema oscuro";
    botonTema.setAttribute("aria-label", botonTema.title);
}

function fechaLimiteInvalida(campo) {
    const fecha = campo.value;

    return campo.validity.badInput ||
        (fecha !== "" && (fecha < FECHA_MINIMA || fecha > FECHA_MAXIMA));
}

function validarFechaLimite(alerta, campo) {
    let mensaje = "";

    if (!campo.value) {
        mensaje = "Debes agregar la fecha límite.";
    } else if (fechaLimiteInvalida(campo)) {
        mensaje = "La fecha límite debe estar entre el 1 de enero y el 31 de diciembre de 2026.";
    }

    alerta.textContent = mensaje;
    alerta.classList.toggle("d-none", mensaje === "");
    return mensaje !== "";
}

// 5. Crear una tarea

function manejarCrearTarea(evento) {

    evento.preventDefault();

    const titulo = campoTitulo.value.trim();
    const descripcion = campoDescripcion.value.trim();
    const prioridad = campoPrioridad.value;
    const fechaLimite = campoFecha.value;

    if (!titulo) {
        campoTitulo.setCustomValidity(
            "Escribe un título para la tarea."
        );

        campoTitulo.reportValidity();
        campoTitulo.focus();
        return;
    }

    campoTitulo.setCustomValidity("");

    if (validarFechaLimite(alertaFechaNueva, campoFecha)) {
        campoFecha.focus();
        return;
    }

    const nuevaTarea = {
        id: crypto.randomUUID(),
        titulo,
        descripcion,
        prioridad,
        fechaLimite,
        estado: "pendiente",
        creadaEn: new Date().toISOString()
    };

    const tareaCreada = crearTarea(nuevaTarea);

    if (!tareaCreada) return;

    guardarTareas(obtenerTareas());

    formulario.reset();

    actualizarVista();

    if (formularioCollapse) {
        bootstrap.Collapse
            .getOrCreateInstance(formularioCollapse)
            .hide();
    }

    console.log("Tarea creada:", tareaCreada);
}


// 6. Manejar acciones del tablero

function manejarAccionesTablero(evento) {

    const boton = evento.target.closest("button[data-accion]");

    if (!boton || !tablero.contains(boton)) {
        return;
    }

    const tarjeta = boton.closest("[data-id]");

    if (!tarjeta) return;

    const id = tarjeta.dataset.id;

    if (boton.dataset.accion === "editar") {
        manejarEditarTarea(id);
    }

    if (boton.dataset.accion === "eliminar") {
        manejarEliminarTarea(id);
    }
}


// 7. Manejar cambios de estado

function manejarCambiosTablero(evento) {

    const selector = evento.target.closest(
        '[data-accion="cambiar-estado"]'
    );

    if (!selector) return;

    const tarjeta = selector.closest("[data-id]");

    if (!tarjeta) return;

    const id = tarjeta.dataset.id;
    const nuevoEstado = selector.value;

    const estadosValidos = [
        "pendiente",
        "progreso",
        "completada"
    ];

    if (!estadosValidos.includes(nuevoEstado)) {
        return;
    }

    const tareaActualizada = actualizarTarea(id, {
        estado: nuevoEstado
    });

    if (!tareaActualizada) return;

    guardarTareas(obtenerTareas());

    actualizarVista();
}


let tareaArrastrada = null;

// 1. Detectar cuando comienza el arrastre
function manejarInicioArrastre(evento) {

    const tarjeta = evento.target.closest(".tarjeta-tarea");

    if (!tarjeta) return;

    tareaArrastrada = tarjeta.dataset.id;

    evento.dataTransfer.effectAllowed = "move";

    evento.dataTransfer.setData("text/plain", tareaArrastrada);

    tarjeta.classList.add("arrastrando");
}


// 2. Permitir arrastrar sobre las columnas
function manejarArrastre(evento) {

    const columna = evento.target.closest(".lista-tareas");

    if (!columna) return;

    // Permitir que el elemento sea soltado
    evento.preventDefault();

    evento.dataTransfer.dropEffect = "move";
}


// 3. Soltar la tarea en otra columna
function manejarSoltar(evento) {

    evento.preventDefault();

    const columna = evento.target.closest(".lista-tareas");

    if (!columna || !tareaArrastrada) return;

    const nuevoEstado = columna.id.replace("columna-", "");

    const estadosValidos = [
        "pendiente",
        "progreso",
        "completada"
    ];

    if (!estadosValidos.includes(nuevoEstado)) {
        return;
    }

    // Actualizar el estado de la tarea
    const tareaActualizada = actualizarTarea(
        tareaArrastrada,
        { estado: nuevoEstado }
    );

    if (!tareaActualizada) return;

    // Guardar cambios
    guardarTareas(obtenerTareas());

    // Actualizar tablero
    actualizarVista();

    tareaArrastrada = null;

    console.log("Tarea movida a:", nuevoEstado);
}


// 8. Editar una tarea

function manejarEditarTarea(id) {

    const tarea = obtenerTareas().find(
        tareaActual => String(tareaActual.id) === String(id)
    );

    if (!tarea) return;

    tareaEditandoId = id;
    campoEditarTitulo.value = tarea.titulo;
    campoEditarDescripcion.value = tarea.descripcion || "";
    campoEditarPrioridad.value = tarea.prioridad || "media";
    campoEditarFecha.value = tarea.fechaLimite || "";
    validarFechaLimite(alertaFechaEditar, campoEditarFecha);
    modalEditarTarea.show();
}

function manejarGuardarEdicion(evento) {
    evento.preventDefault();

    const titulo = campoEditarTitulo.value.trim();

    if (!titulo) {
        campoEditarTitulo.setCustomValidity("Escribe un título para la tarea.");
        campoEditarTitulo.reportValidity();
        campoEditarTitulo.focus();
        return;
    }

    campoEditarTitulo.setCustomValidity("");

    if (validarFechaLimite(alertaFechaEditar, campoEditarFecha)) {
        campoEditarFecha.focus();
        return;
    }

    const tareaActualizada = actualizarTarea(tareaEditandoId, {
        titulo,
        descripcion: campoEditarDescripcion.value.trim(),
        prioridad: campoEditarPrioridad.value,
        fechaLimite: campoEditarFecha.value
    });

    if (!tareaActualizada) return;

    guardarTareas(obtenerTareas());
    actualizarVista();
    tareaEditandoId = null;
    modalEditarTarea.hide();
}


// 9. Eliminar una tarea

function manejarEliminarTarea(id) {

    const tarea = obtenerTareas().find(
        tareaActual => String(tareaActual.id) === String(id)
    );

    if (!tarea) return;

    tareaEliminandoId = id;
    nombreTareaEliminar.textContent = tarea.titulo;
    modalEliminarTarea.show();
}

function confirmarEliminacion() {
    if (tareaEliminandoId === null) return;

    const eliminada = eliminarTarea(tareaEliminandoId);

    if (!eliminada) return;

    guardarTareas(obtenerTareas());
    actualizarVista();
    tareaEliminandoId = null;
    modalEliminarTarea.hide();
}


// 10. Aplicar filtros y actualizar tablero

function actualizarVista() {

    const tareas = obtenerTareas();

    const tareasFiltradas = aplicarFiltros(
        tareas,
        filtros
    );

    renderizarTablero(tareasFiltradas);
}


// 11. Iniciar cuando el DOM esté preparado

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarAplicacion
    );

} else {

    iniciarAplicacion();

}
