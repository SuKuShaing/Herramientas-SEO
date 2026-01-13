/**
 * Verifica SEO o devuelve el total de palabras si la URL es un guion "-".
 * * @param {string} url La URL a analizar (si es "-" retorna el conteo total de palabras).
 * @param {string} tipo El tipo de etiqueta: "title", "description" o "h1".
 * @param {string} textoEsperado Las palabras clave a buscar.
 * @return {string|number} "Si", número de faltantes, o total de palabras si es "-".
 * @customfunction
 */
function VERIFICAR_SEO(url, tipo, textoEsperado) {
    if (!url || !textoEsperado) return "";

    // 1. Limpieza inicial de la URL (toma la primera si hay varias)
    var urlFinal = url
        .toString()
        .split(/[,;\n\s]+/)[0]
        .trim();

    // --- NUEVA LÓGICA: CASO GUION "-" ---
    if (urlFinal === "-") {
        // Si es un guion, simplemente contamos cuántas palabras tiene el texto esperado
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
        // Verificación básica de URL válida antes de intentar conectar
        if (urlFinal.length < 4) return "URL inválida";

        var options = {
            muteHttpExceptions: true,
            followRedirects: true,
        };

        var response = UrlFetchApp.fetch(urlFinal, options);
        var html = response.getContentText();
        var responseCode = response.getResponseCode();

        if (responseCode !== 200) return "Error " + responseCode;

        // --- Extracción (Igual que antes) ---
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

        // --- Comparación y Conteo ---
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

        // Lista de palabras buscadas
        var palabrasClave = inputLimpio.split(" ").filter(function (p) {
            return p.length > 0;
        });

        // Filtramos las que NO están
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
