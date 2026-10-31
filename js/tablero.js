
const ESTADOS = [
    "pendiente",
    "progreso",
    "completada"
];

// Evitar que los datos se interpreten como HTML.
function escaparHTML(valor = "") {
    return String(valor).replace(/[&<>"']/g, caracter => {
        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return caracteres[caracter];
    });
}

// Formatear fecha.
function formatearFecha(fecha) {

    if (!fecha) return "Sin fecha límite";

    const fechaObjeto = new Date(`${fecha}T00:00:00`);

    if (Number.isNaN(fechaObjeto.getTime())) {
        return "Fecha no válida";
    }

    return fechaObjeto.toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// Crear tarjeta de tarea.
function crearTarjeta(tarea) {

    const id = escaparHTML(tarea.id);
    const titulo = escaparHTML(tarea.titulo);
    const descripcion = escaparHTML(tarea.descripcion);

    const prioridad = ["baja", "media", "alta"].includes(tarea.prioridad)
        ? tarea.prioridad
        : "media";

    const estado = ESTADOS.includes(tarea.estado)
        ? tarea.estado
        : "pendiente";

    const fecha = formatearFecha(tarea.fechaLimite);

    return `
        <article class="tarjeta-tarea" data-id="${id}" draggable="true">

            <div class="d-flex justify-content-between align-items-start mb-2">

                <span class="prioridad-${prioridad}">
                    ${prioridad.toUpperCase()}
                </span>

                <div class="acciones-tarea">

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        data-accion="editar">
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        data-accion="eliminar">
                        <i class="bi bi-trash"></i>
                    </button>

                </div>

            </div>

            <h6 class="fw-bold">${titulo}</h6>

            <p class="text-muted small">
                ${descripcion || "Sin descripción"}
            </p>

            <div class="small text-muted mb-3">
                <i class="bi bi-calendar-event"></i>
                ${fecha}
            </div>

            <div class="d-flex align-items-center justify-content-between">

                <label for="estado-${id}" class="small">
                    Estado:
                </label>

                <select
                    id="estado-${id}"
                    class="form-select form-select-sm w-auto"
                    data-accion="cambiar-estado">

                    <option value="pendiente"
                        ${estado === "pendiente" ? "selected" : ""}>
                        Pendiente
                    </option>

                    <option value="progreso"
                        ${estado === "progreso" ? "selected" : ""}>
                        En progreso
                    </option>

                    <option value="completada"
                        ${estado === "completada" ? "selected" : ""}>
                        Completada
                    </option>

                </select>

            </div>

        </article>
    `;
}


// Renderizar tablero.
export function renderizarTablero(tareas) {

    ESTADOS.forEach(estado => {

        const lista = document.querySelector(
            `#columna-${estado}`
        );

        if (!lista) {
            console.error("No se encontró la columna:", estado);
            return;
        }

        const tareasEstado = tareas.filter(
            tarea => tarea.estado === estado
        );

        if (tareasEstado.length === 0) {

            lista.innerHTML = `
                <div class="mensaje-vacio text-center text-muted py-3">
                    <i class="bi bi-inbox"></i>
                    <p class="small mb-0">
                        No hay tareas todavía
                    </p>
                </div>
            `;

        } else {

            lista.innerHTML = tareasEstado
                .map(tarea => crearTarjeta(tarea))
                .join("");

        }

        const contador = document.querySelector(
            `#contador-${estado}`
        );

        if (contador) {
            contador.textContent = tareasEstado.length;
        }

    });

}
