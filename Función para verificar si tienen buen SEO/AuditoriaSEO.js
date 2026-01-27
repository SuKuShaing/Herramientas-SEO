/**
 * Verifica SEO priorizando la URL Nueva. Si no existe, usa la Antigua.
 *
 * @param {string} urlAntigua La URL original (Columna C).
 * @param {string} urlNueva La URL nueva (Columna D, por ejemplo). Si está vacía, se usa la antigua.
 * @param {string} tipo El tipo de etiqueta: "title", "description" o "h1".
 * @param {string} textoEsperado Las palabras clave a buscar.
 * @return {string|number} "Si", número de faltantes, o total de palabras si es "-".
 * @customfunction
 */
function VERIFICAR_SEO(urlAntigua, urlNueva, tipo, textoEsperado) {
    // Validamos que haya al menos texto esperado y alguna URL (antigua o nueva)
    if (!textoEsperado) return "";

    // 1. Función auxiliar para limpiar URLs (quita espacios, toma la primera si hay varias)
    var limpiarUrl = function (u) {
        if (!u) return "";
        return u
            .toString()
            .split(/[,;\n\s]+/)[0]
            .trim();
    };

    var limpiaAntigua = limpiarUrl(urlAntigua);
    var limpiaNueva = limpiarUrl(urlNueva);

    // 2. Lógica de Selección: ¿Cuál usamos?
    // Asumimos por defecto la antigua
    var urlFinal = limpiaAntigua;

    // Si la nueva existe y tiene una longitud razonable (ej. más de 3 caracteres, para evitar errores),
    // entonces la nueva tiene prioridad y sobrescribe a la antigua.
    if (limpiaNueva && limpiaNueva.length > 3) {
        urlFinal = limpiaNueva;
    }

    // Nota: Si pusiste un guion "-" en la URL Nueva, 'limpiaNueva' será "-",
    // length es 1, por lo tanto NO entra al if y usaría la antigua.
    // Si quieres que el guion en la nueva signifique "Ya no hay web",
    // cambia el if a: (limpiaNueva.length > 0)

    // --- 3. Lógica del GUION "-" (Igual que antes) ---
    // Si la URL elegida es un guion, devolvemos el total de palabras del texto esperado
    if (urlFinal === "-") {
        var palabras = textoEsperado
            .toString()
            .trim()
            .split(/\s+/)
            .filter(function (p) {
                return p.length > 0;
            });
        return palabras.length;
    }

    try {
        // Verificación básica
        if (urlFinal.length < 4) return "URL inválida";

        var options = {
            muteHttpExceptions: true,
            followRedirects: true,
        };

        // Hacemos fetch a la URL elegida (urlFinal)
        var response = UrlFetchApp.fetch(urlFinal, options);
        var html = response.getContentText();
        var responseCode = response.getResponseCode();

        if (responseCode !== 200) return "Error " + responseCode;

        // --- 4. Extracción (Igual que antes) ---
        var contenidoEncontrado = "";

        if (tipo.toLowerCase() === "title") {
            var match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            contenidoEncontrado = match ? match[1] : "";
        } else if (tipo.toLowerCase() === "description") {
            var match = html.match(
                /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i,
            );
            contenidoEncontrado = match ? match[1] : "";
        } else if (tipo.toLowerCase() === "h1") {
            var match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            contenidoEncontrado = match ? match[1] : "";
        }

        // --- 5. Comparación y Conteo ---
        var limpiarTexto = function (txt) {
            return txt
                .toString()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();
        };

        var contenidoLimpio = limpiarTexto(contenidoEncontrado);
        var inputLimpio = limpiarTexto(textoEsperado);

        var palabrasClave = inputLimpio.split(" ").filter(function (p) {
            return p.length > 0;
        });

        var palabrasQueFaltan = palabrasClave.filter(function (palabra) {
            return !contenidoLimpio.includes(palabra);
        });

        var numeroFaltantes = palabrasQueFaltan.length;

        if (numeroFaltantes === 0) {
            return "Si";
        } else {
            return numeroFaltantes;
        }
    } catch (e) {
        return "Error: " + e.message;
    }
}
