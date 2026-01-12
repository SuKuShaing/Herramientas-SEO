function extraerGoogleAdsFinal() {
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
        const soloNumeros = texto.replace(/[^\d]/g, "");
        return soloNumeros ? parseInt(soloNumeros) : 0;
    };

    // Lógica principal de Búsquedas
    const procesarVolumen = (textoRango) => {
        if (!textoRango || textoRango === "—") return 0;

        // Limpieza inicial: "De 1 K a 10 k" -> "1 k a 10 k"
        let limpio = textoRango
            .toLowerCase()
            .replace(/^de\s+/i, "") // Quita "de " al inicio
            .replace(/&nbsp;/g, " ")
            .trim();

        // Función interna: Convierte "1.5 k" en 1500, "500" en 500
        const parsearNumeroK = (str) => {
            let multiplicador = 1;
            if (str.includes("k")) multiplicador = 1000;
            if (str.includes("m")) multiplicador = 1000000;

            // Quita letras, cambia coma por punto para decimales
            // Ej: "1,5 k" -> "1.5"
            let numeroLimpio = str
                .replace(/[km]/g, "")
                .trim()
                .replace(",", ".");

            // Quita cualquier otro caracter que no sea numero o punto (por si acaso hay miles con punto)
            // Si el formato es 1.000 (miles con punto), esto requiere cuidado.
            // Google suele usar "1 k". Si usa "1.000", parseFloat lo toma como 1.
            // Asumiremos formato K/M estándar de la herramienta.

            let valor = parseFloat(numeroLimpio);
            return Math.floor(valor * multiplicador);
        };

        // CASO 1: ES UN RANGO (Tiene " a ") -> APLICAR RANDOM
        if (limpio.includes(" a ")) {
            const partes = limpio.split(" a ");
            if (partes.length === 2) {
                const min = parsearNumeroK(partes[0]);
                const max = parsearNumeroK(partes[1]);

                // Matemática aleatoria solo aquí
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
        }

        // CASO 2: MENOR QUE (Ej: "< 10")
        else if (limpio.includes("<")) {
            return parsearNumeroK(limpio.replace("<", "")) || 0;
        }

        // CASO 3: ES UN VALOR ÚNICO (Ej: "500" o "10 k") -> DEVOLVER EXACTO
        // No aplicamos random, devolvemos lo que dice el texto convertido a número completo
        return parsearNumeroK(limpio) || 0;
    };

    // --- PROCESO PRINCIPAL ---

    let resultadoTexto =
        "Palabra Clave\tBúsquedas Mensuales\tOferta Baja\tOferta Alta\n";

    filasSeleccionadas.forEach((fila) => {
        const palabra = obtenerTexto(fila, ".keyword");

        // Obtenemos el texto de la celda de búsquedas
        const textoVolumen = obtenerTexto(
            fila,
            'ess-cell[essfield="search_volume"] .value-text'
        );

        // Procesamos con la nueva lógica
        const valorBusqueda = procesarVolumen(textoVolumen);

        const ofertaBaja = limpiarBid(
            obtenerTexto(fila, 'ess-cell[essfield="bid_min"] text-field')
        );
        const ofertaAlta = limpiarBid(
            obtenerTexto(fila, 'ess-cell[essfield="bid_max"] text-field')
        );

        // Armamos la fila para Excel (TSV)
        resultadoTexto += `${palabra}\t${valorBusqueda}\t${ofertaBaja}\t${ofertaAlta}\n`;
    });

    // Copiar al portapapeles
    copy(resultadoTexto);

    console.log("✅ ¡Datos copiados!");
    console.log("Regla aplicada: Rangos = Aleatorio | Valor único = Exacto.");
    // Previsualización
    console.log(resultadoTexto);
}

extraerGoogleAdsFinal();
