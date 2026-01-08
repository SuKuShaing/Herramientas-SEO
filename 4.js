function extraerGoogleAdsConSimulacion() {
    const filasSeleccionadas = document.querySelectorAll(
        ".particle-table-row.particle-row-selected"
    );

    if (filasSeleccionadas.length === 0) {
        console.warn("⚠️ No se encontraron filas seleccionadas.");
        return;
    }

    // --- FUNCIONES AUXILIARES ---

    const obtenerTexto = (fila, selector) => {
        const elemento = fila.querySelector(selector);
        return elemento ? elemento.innerText.replace(/\n/g, "").trim() : "";
    };

    const limpiarBid = (texto) => {
        // Elimina "CLP", comas y puntos, deja solo enteros
        const soloNumeros = texto.replace(/[^\d]/g, "");
        return soloNumeros ? parseInt(soloNumeros) : 0;
    };

    // Esta es la función mágica que convierte "De 1 K a 10 k" en un número como "5423"
    const generarVolumenSimulado = (textoRango) => {
        if (!textoRango || textoRango === "—") return 0;

        // 1. Normalizar texto (minusculas, quitar "de", quitar espacios duros)
        // Ejemplo entrada: "De 1 K a 10 k" -> "1k a 10k"
        let limpio = textoRango
            .toLowerCase()
            .replace(/de\s/g, "") // Quita "de " al inicio
            .replace(/&nbsp;/g, " ")
            .trim();

        // 2. Función interna para convertir "10k" -> 10000
        const parsearNumeroK = (str) => {
            let multiplicador = 1;
            if (str.includes("k")) multiplicador = 1000;
            if (str.includes("m")) multiplicador = 1000000;

            // Extraer solo el número (ej: "1.5" de "1.5 k")
            let valor = parseFloat(
                str.replace(/,/g, ".").replace(/[^\d\.]/g, "")
            );
            return Math.floor(valor * multiplicador);
        };

        // 3. Detectar si es un rango (busca la " a " separadora)
        if (limpio.includes(" a ")) {
            const partes = limpio.split(" a ");
            if (partes.length === 2) {
                const min = parsearNumeroK(partes[0]);
                const max = parsearNumeroK(partes[1]);

                // Generar random entre min y max
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
        }
        // 4. Si no es rango (ej: "< 10" o un número fijo)
        else if (limpio.includes("<")) {
            return parsearNumeroK(limpio) > 0
                ? Math.floor(parsearNumeroK(limpio) / 2)
                : 0;
        }

        // Si falló todo lo anterior, intentamos parsear lo que haya
        return parsearNumeroK(limpio) || 0;
    };

    // --- PROCESO PRINCIPAL ---

    let resultadoTexto =
        "Palabra Clave\tBúsquedas Mensuales (Est.)\tOferta Baja\tOferta Alta\n";

    filasSeleccionadas.forEach((fila) => {
        const palabra = obtenerTexto(fila, ".keyword");

        // Obtenemos el texto del rango (ej: "De 1 K a 10 k")
        const textoRango = obtenerTexto(
            fila,
            'ess-cell[essfield="search_volume"] .value-text'
        );

        // Lo convertimos a un número aleatorio dentro del rango
        const busquedasSimuladas = generarVolumenSimulado(textoRango);

        const ofertaBaja = limpiarBid(
            obtenerTexto(fila, 'ess-cell[essfield="bid_min"] text-field')
        );
        const ofertaAlta = limpiarBid(
            obtenerTexto(fila, 'ess-cell[essfield="bid_max"] text-field')
        );

        // Armamos la fila para Excel
        resultadoTexto += `${palabra}\t${busquedasSimuladas}\t${ofertaBaja}\t${ofertaAlta}\n`;
    });

    // Copiar al portapapeles
    copy(resultadoTexto);

    console.log("✅ ¡Datos copiados!");
    console.log(
        "Ahora 'Búsquedas Mensuales' es un número específico dentro del rango."
    );
    // Previsualización
    console.log(resultadoTexto);
}

extraerGoogleAdsConSimulacion();
