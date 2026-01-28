/**
 * Verifica las palabras del slug.
 * Retorna "Si" si TODAS las palabras están en la URL.
 * Retorna el número de palabras faltantes si falta alguna.
 *
 * @param {string} urlAntigua La URL original.
 * @param {string} urlNueva La URL nueva propuesta.
 * @param {string} slugTexto El texto objetivo.
 * @return "Si" o el número de palabras que faltan (integer).
 * @customfunction
 */
function verificarSlug(urlAntigua, urlNueva, slugTexto) {
    // 1. Validaciones básicas
    if (!slugTexto || slugTexto.toString().trim() === "") return "Slug vacío";

    // 2. Determinar qué URL usar
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
        // Si no hay URL válida, faltan todas las palabras
        return slugTexto.toString().trim().split(/\s+/).length;
    }

    // 3. Normalización (minúsculas y sin tildes)
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

    // 4. Contar palabras faltantes
    var palabras = slugInputLimpio.split(" ");
    var palabrasFaltantes = 0;

    for (var i = 0; i < palabras.length; i++) {
        var palabra = palabras[i];
        // Si la palabra existe y NO está en la URL, aumentamos el contador
        if (palabra.length > 0 && !urlLimpia.includes(palabra)) {
            palabrasFaltantes++;
        }
    }

    // 5. RESULTADO FINAL
    // Si faltan 0 palabras (están todas), devolvemos "Si"
    if (palabrasFaltantes === 0) {
        return "Si";
    } else {
        // Si falta alguna, devolvemos el número
        return palabrasFaltantes;
    }
}
