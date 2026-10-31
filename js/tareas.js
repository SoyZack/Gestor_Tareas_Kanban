// Arreglo principal donde se almacena las tareas
let tareas = [];

// 1. Inicializar las tareas
export function inicializarTareas(tareasIniciales = []) {
    tareas = Array.isArray(tareasIniciales)
        ?[...tareasIniciales]
        :[];
}

// 2. Obtener todas las tareas
export function obtenerTareas() {
    return [...tareas];
}

// 3. Crear una nueva tarea
export function crearTarea(nuevaTarea) {
    if(!nuevaTarea || !nuevaTarea.titulo?.trim()) {
        console.error("El titulo de la tarea es obligatorio.");
        return null;
    }

    const tarea = {
        id: nuevaTarea.id || crypto.randomUUID(),
        titulo: nuevaTarea.titulo.trim(),
        descripcion: nuevaTarea.descripcion || "",
        prioridad: nuevaTarea.prioridad || "media",
        estado: nuevaTarea.estado || "pendiente",
        fechaLimite: nuevaTarea.fechaLimite || "",
        creadaEn: nuevaTarea.creadaEn || new Date().toISOString()
    };

    tareas.push(tarea);
    return tarea;
}

// 4. Actualizar una tarea existente
export function actualizarTarea(id, datosActualizados) {
    const indice = tareas.findIndex(
        tarea => String(tarea.id) === String(id)
    );

    if (indice === -1) {
        console.error("No se encontrar la tarea.");
        return null;
    }

    tareas[indice] = {
        ...tareas[indice],
        ...datosActualizados,
        id: tareas[indice].id
    };

    return tareas[indice];
}

// 5. Eliminar una tarea
export function eliminarTarea(id) {
    const cantidadInicial = tareas.length;

    tareas = tareas.filter(
        tarea => String(tarea.id) !== String(id)
    );

    return tareas.length < cantidadInicial;
}
