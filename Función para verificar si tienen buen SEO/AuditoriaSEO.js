/**
 * Esta código se ejecuta en Apps Script de google Sheets
 * Verifica si las palabras clave existen en la etiqueta HTML.
 * - Soporta celdas con múltiples URLs (toma solo la primera).
 * - Devuelve "Si" o el número de palabras que faltan.
 *
 * @param {string} url La URL (o lista de URLs) a analizar.
 * @param {string} tipo El tipo de etiqueta: "title", "description" o "h1".
 * @param {string} textoEsperado Las palabras clave a buscar.
 * @return {string|number} "Si" o el número de palabras faltantes.
 * @customfunction
 */
function VERIFICAR_SEO(url, tipo, textoEsperado) {
    if (!url || !textoEsperado) return "";

    try {
        // --- NUEVO: LÓGICA DE SELECCIÓN DE URL ---
        // 1. Convertimos a string
        // 2. Separamos por: comas (,), punto y coma (;), saltos de línea (\n) o espacios (\s)
        // 3. Tomamos el primer elemento ([0]) y limpiamos espacios vacíos (.trim())
        var urlFinal = url
            .toString()
            .split(/[,;\n\s]+/)[0]
            .trim();

        // Verificamos que haya quedado algo parecido a una URL (opcional, para evitar errores feos)
        if (urlFinal.length < 4) return "URL inválida";

        var options = {
            muteHttpExceptions: true,
            followRedirects: true,
        };

        // Usamos 'urlFinal' en lugar de la variable 'url' original
        var response = UrlFetchApp.fetch(urlFinal, options);
        var html = response.getContentText();
        var responseCode = response.getResponseCode();

        if (responseCode !== 200) return "Error " + responseCode;

        // --- (El resto del código sigue igual) ---
        var contenidoEncontrado = "";

        if (tipo.toLowerCase() === "title") {
            var match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            contenidoEncontrado = match ? match[1] : "";
        } else if (tipo.toLowerCase() === "description") {
            var match = html.match(
                /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i
            );
            contenidoEncontrado = match ? match[1] : "";
        } else if (tipo.toLowerCase() === "h1") {
            var match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            contenidoEncontrado = match ? match[1] : "";
        }

        var limpiar = function (txt) {
            return txt
                .toString()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();
        };

        var contenidoLimpio = limpiar(contenidoEncontrado);
        var inputLimpio = limpiar(textoEsperado);

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
