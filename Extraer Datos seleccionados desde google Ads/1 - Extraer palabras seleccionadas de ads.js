function extraerGoogleAdsExacto() {
    // 1. Seleccionamos las filas usando la clase específica que me mostraste
    // "particle-table-row particle-row-selected"
    const filasSeleccionadas = document.querySelectorAll(
        ".particle-table-row.particle-row-selected"
    );

    if (filasSeleccionadas.length === 0) {
        console.warn(
            "⚠️ No se encontraron filas seleccionadas. Asegúrate de marcar los checkbox azules a la izquierda de las palabras clave."
        );
        return;
    }

    const datos = [];

    filasSeleccionadas.forEach((fila) => {
        // Función auxiliar para obtener texto limpio dentro de la fila
        const obtenerTexto = (selector) => {
            const elemento = fila.querySelector(selector);
            // Limpiamos saltos de línea y espacios extra
            return elemento
                ? elemento.innerText.replace(/\n/g, "").trim()
                : "ND";
        };

        // 2. Extraemos usando las clases y atributos 'essfield' que me diste

        // Palabra Clave
        const palabra = obtenerTexto(".keyword");

        // Búsquedas Mensuales (usando essfield para mayor precisión)
        const busquedas = obtenerTexto(
            'ess-cell[essfield="search_volume"] .value-text'
        );

        // Ofertas: En tu HTML aparecen 'bid_min' y 'bid_max'.
        // bid_min = Intervalo bajo (lo que pediste en el texto)
        // bid_max = Intervalo alto
        const ofertaBaja = obtenerTexto(
            'ess-cell[essfield="bid_min"] text-field'
        );
        const ofertaAlta = obtenerTexto(
            'ess-cell[essfield="bid_max"] text-field'
        );

        datos.push({
            "Palabra Clave": palabra,
            "Búsquedas Mensuales": busquedas,
            "Oferta (Intervalo Bajo)": ofertaBaja,
            "Oferta (Intervalo Alto)": ofertaAlta,
        });
    });

    // Imprimir tabla bonita en consola
    console.table(datos);

    // Devolver datos por si quieres copiarlos con copy()
    return datos;
}

// Ejecutar la función automáticamente
extraerGoogleAdsExacto();
