export function aplicarFiltros(tareas, filtros) {
    return tareas.filter(tarea => {
        const coincideBusqueda =
            !filtros.busqueda ||
            tarea.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase());

        const coincidePrioridad =
            filtros.prioridad === "todas" ||
            tarea.prioridad === filtros.prioridad;

        const coincideEstado =
            filtros.estado === "todos" ||
            filtros.estado === "todas" ||
            tarea.estado === filtros.estado;

        return coincideBusqueda && coincidePrioridad && coincideEstado;
    });
}