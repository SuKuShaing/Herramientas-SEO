function extraerGoogleAdsLimpio() {
    const filasSeleccionadas = document.querySelectorAll(
        ".particle-table-row.particle-row-selected"
    );

    if (filasSeleccionadas.length === 0) {
        console.warn("⚠️ No se encontraron filas seleccionadas.");
        return;
    }

    const datos = [];

    filasSeleccionadas.forEach((fila) => {
        const obtenerTexto = (selector) => {
            const elemento = fila.querySelector(selector);
            return elemento ? elemento.innerText.replace(/\n/g, "").trim() : "";
        };

        // Función para dejar solo los números
        const limpiarANumero = (texto) => {
            // Elimina todo lo que no sea número o coma/punto decimal
            const soloNumeros = texto.replace(/[^\d]/g, "");
            return soloNumeros ? parseInt(soloNumeros) : 0;
        };

        const palabra = obtenerTexto(".keyword");
        const busquedas = obtenerTexto(
            'ess-cell[essfield="search_volume"] .value-text'
        );

        // Extraemos y limpiamos las ofertas
        const ofertaBajaRaw = obtenerTexto(
            'ess-cell[essfield="bid_min"] text-field'
        );
        const ofertaAltaRaw = obtenerTexto(
            'ess-cell[essfield="bid_max"] text-field'
        );

        datos.push({
            "Palabra Clave": palabra,
            "Búsquedas Mensuales": busquedas,
            "Oferta Baja (Número)": limpiarANumero(ofertaBajaRaw),
            "Oferta Alta (Número)": limpiarANumero(ofertaAltaRaw),
        });
    });

    console.table(datos);

    // Esto copia el resultado automáticamente al portapapeles
    copy(datos);
    console.log("✅ Datos copiados al portapapeles. Puedes pegar en Excel.");

    return datos;
}

extraerGoogleAdsLimpio();
