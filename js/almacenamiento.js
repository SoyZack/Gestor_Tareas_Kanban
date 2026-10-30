// Clave Utilizada para guardar las tareas.
const CLAVE_TAREAS = "taskflow_tareas";

// 1. Cargar tareas guardadas 

export function cargarTareas() {
    try {
        const datosGuardadas = localStorage.getItem(CLAVE_TAREAS);

        // Si no existen datos, Devuelven  un arreglo vacio
        if (datosGuardadas === null) {
            return [];
        }

        const tareas = JSON.parse(datosGuardadas);

        // Verificar que  los datos sean un arreglo 
        if (!Array.isArray(tareas)) {
            console.warn("Los datos guardados no son validos.");
            return [];
        }

        return tareas;
    } catch (error) {
        console.error("Error al cargar las tareas:", error);
        return[];
    }
}

// 2. Guardar todas las tareas

export function guardarTareas(tareas) {
    try{
        if (!Array.isArray(tareas)) {
            console.error("No se pueden guardar datos que no sean un arreglo");
            return false;
        }

        localStorage.setItem(
            CLAVE_TAREAS,
            JSON.stringify(tareas)
        );

        return true;
    } catch (error) {
        console.error("Error al guardar las tareas", error);
        return false;
    }
}

// 3. Eliminar todas las tareas guardadas

export function eliminarTareasGuardadas() {
    try {
        localStorage.removeItem(CLAVE_TAREAS);
        return true;
    } catch (error) {
        console.error("Error al eliminar las tareas:", error);
        return false;
    }
}

// 4. Comprobar si existen tarea guardadas

export function existenTareasGuardadas(){
    try {
        return localStorage.getItem(CLAVE_TAREAS) !== null;
    } catch (error) {
        console.error("Error al comprobar el almacenamiento", error);
    }
}