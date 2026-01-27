/**
 * Verifica si el texto del slug está presente en la URL nueva (o antigua si la nueva falta).
 *
 * @param {string} urlAntigua La URL original.
 * @param {string} urlNueva La URL nueva propuesta.
 * @param {string} slugTexto El texto que debería estar en el slug.
 * @return "Si", "No" o "Casi".
 * @customfunction
 */
function verificarSlug(urlAntigua, urlNueva, slugTexto) {
    // 1. Validar que exista el texto a buscar (slugTexto)
    if (!slugTexto || slugTexto.toString().trim() === "") return "No";

    // 2. Determinar qué URL usar
    // Si urlNueva tiene contenido, se usa esa. Si no, se evalúa urlAntigua.
    var url = "";
    if (urlNueva && urlNueva.toString().trim() !== "") {
        url = urlNueva.toString();
    } else if (
        urlAntigua &&
        urlAntigua.toString().trim() !== "" &&
        urlAntigua.toString().trim() !== "-"
    ) {
        url = urlAntigua.toString();
    } else {
        // Si no hay URL nueva válida y la antigua es "-" o vacía, es un "No"
        return "No";
    }

    // 3. Funciones de limpieza (Normalización)
    // Convertimos a minúsculas y eliminamos acentos para evitar errores (ej: Ingeniería vs Ingenieria)
    var normalizar = function (texto) {
        return texto
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Elimina tildes
            .trim();
    };

    var urlLimpia = normalizar(url);
    var slugInputLimpio = normalizar(slugTexto);

    // 4. LÓGICA "SI" (Coincidencia Exacta de Secuencia)
    // Convertimos el texto del slug en formato URL (espacios -> guiones)
    // Ejemplo: "Testimonios Utem" -> "testimonios-utem"
    var slugFormatoUrl = slugInputLimpio.replace(/\s+/g, "-");

    // Verificamos si la URL contiene exactamente esa secuencia
    if (urlLimpia.includes(slugFormatoUrl)) {
        return "Si";
    }

    // 5. LÓGICA "CASI" (Coincidencia Parcial o Dispersa)
    // Si no fue exacto, revisamos si al menos contiene las palabras por separado
    var palabras = slugInputLimpio.split(" ");
    var palabrasEncontradas = 0;

    for (var i = 0; i < palabras.length; i++) {
        var palabra = palabras[i];
        if (palabra.length > 0 && urlLimpia.includes(palabra)) {
            palabrasEncontradas++;
        }
    }

    // Si encontró alguna palabra (o todas, pero desordenadas/interrumpidas como en el Ejemplo 7a)
    if (palabrasEncontradas > 0) {
        return "Casi";
    }

    // 6. Si no encontró nada
    return "No";
}
