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
    aplicarFiltros,
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
const campoFecha = document.querySelector("#fechalimite");

const campoBusqueda = document.querySelector("#busqueda");
const filtroPrioridad = document.querySelector("#filtro-prioridad");
const filtroEstado = document.querySelector("#filtro-estado");

const formularioCollapse = document.querySelector("#formulario-collapse");


// 2. Estado de los Filtros


const filtros = {
    busqueda: "",
    prioridad: "todas",
    estado: "todas"
}


// 3.Inicialiazar la aplicacion 

function iniciarAplicacion() {
    // Cargar tareas guardadas en el navegador
    const tareasGuardadas = cargarTareas();

    // Entregar las tareas iniciales al modulo de tareas
    inicializarTareas(tareasGuardadas);

    // Mostrar el tablero inicial
    actualizarVista();

    // Registrar los eventos
    registrarEventos();
    
    console.log("TaskFlow se ha iniciado correctamente.");
}


// 4. Registrar eventos

function registrarEventos() {
    // Crear tareas al enviar el formulario 
    formulario.addEventListener("submit", manejarCrearTarea);

    // Actualizar busqueda mientras se escribe
    campoBusqueda.addEventListener("input", () => {
        filtros.busqueda = campoBusqueda.value.trim();
        actualizarVista();
    });

    // Filtrar por prioridad 
    filtroPrioridad.addEventListener("change", () => {
        filtros.prioridad = filtroPrioridad.value;
        actualizarVista();
    });

    // Detectar acciones realizadas en las tarjetas
    document.querySelector("#tablero").addEventListener( "change",
        manejarCambiosTablero
    );
}

// 5. Crear una Tarea 

function manejarCrearTarea(evento) {
    evento.preventDefault();

    const titulo = campoTitulo.value.trim();
    const descripcion = campoDescripcion.value.trim();
    const prioridad = campoPrioridad.value;
    const fechaLimite = campoFecha.value;

    // Validar el titulo
    if (!titulo) {
        campoTitulo.setCustomValidity(
            "Escribe un titulo para la tarea"
        );
        campoTitulo.reportValidity();
        campoTitulo.focus();
        return;
    }
    campoTitulo.setCustomValidity("");

    // Crear el objeto de la tarea 

    const nuevaTarea = {
        id: crypto.randomUUID(),
        titulo,
        descripcion,
        prioridad,
        fechaLimite,
        estado: "pendiente",
        creadaEn: new Date().toISOString()
    };

    // Guardar la tarea mediante el modulo correpondiente.
    crearTarea(nuevaTarea);

    // Persistir los cambios 
    guardarTareas(obtenerTareas());

    // limpiar el Formulario
    formulario.reset();

    // Actualizar las tarjetas y los contadores. 
    actualizarVista();

    // Cerrar el formulario despegable de bootstrap
    if (
        formularioCollapse &&
        formularioCollapse.classList.contains("shows")
    ) {
        bootstrap.Collapse
            .getOrCreateInstance(formularioCollapse)
            .hide();    
    }

    console.log("Tarea Creada:", nuevaTarea);
}

// 6. Manejar botones de las tarjetas

function manejarAccionesTablero(evento) {
    const boton = evento.target.closest("button");

    if (!boton) {
            return;
    }

    const id = tarjeta.dataset.id;
    
    // Editar tarea
    if (boton.dataset.accion === "editar") {
        manejarEditarTarea(id);
    }

    // Eliminar tarea
    if (boton.dataset.accion === "eliminar") {
        manejarEliminarTarea(id);
    }
}

// 7. Manejar cambios de estado

function manejarCambiosTablero(evento) {
    const selector = evento.target.closest(
        '[data-accion="cambiar-estado"]'
    );

    if (!selector) {
        return;
    }

    const tarjeta = selector.closest("[data-id]");

    if (!tarjeta) {
        return;
    }

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

    actualizarTarea(id, {
        estado: nuevoEstado
    });

    guardarTareas(obtenerTareas());
    actualizarVista();
}


// 8. Editar una tarea

function manejarEditarTarea(id) {
    const tarea = obtenerTareas().find(
        tareaActual => String(tareaActual.id) === String(id)
    );

    if (!tarea) {
        return;
    }

    const nuevoTitulo = prompt(
        "Editar título de la tarea:",
        tarea.titulo
    );

    // Si cancela, no realizar cambios.
    if (nuevoTitulo === null) {
        return;
    }

    const tituloLimpio = nuevoTitulo.trim();

    if (!tituloLimpio) {
        alert("El título no puede estar vacío.");
        return;
    }

    const nuevaDescripcion = prompt(
        "Editar descripción:",
        tarea.descripcion
    );

    if (nuevaDescripcion === null) {
        return;
    }

    actualizarTarea(id, {
        titulo: tituloLimpio,
        descripcion: nuevaDescripcion.trim()
    });

    guardarTareas(obtenerTareas());
    actualizarVista();
}


// 9. Eliminar una tarea

function manejarEliminarTarea(id) {
    const confirmar = confirm(
        "¿Seguro que quieres eliminar esta tarea?"
    );

    if (!confirmar) {
        return;
    }

    eliminarTarea(id);

    guardarTareas(obtenerTareas());
    actualizarVista();
}


// 10. Aplicar filtros y renderizar

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