function extraerGoogleAdsCorregido() {
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

    // --- NUEVA LÓGICA DE PARSEO ---
    const parsearNumeroK = (str) => {
        if (!str) return 0;

        // Caso A: Tiene K o M (es un aproximado o rango, ej: "1,5 k" o "10 k")
        if (/[km]/i.test(str)) {
            let multiplicador = 1;
            if (/k/i.test(str)) multiplicador = 1000;
            if (/m/i.test(str)) multiplicador = 1000000;

            // Aquí la coma SÍ puede ser decimal (ej: 1,5 k). Reemplazamos coma por punto.
            // Y quitamos cualquier otro caracter raro.
            let numeroLimpio = str
                .replace(/[km]/gi, "")
                .trim()
                .replace(",", ".");
            let valor = parseFloat(numeroLimpio);
            return Math.floor(valor * multiplicador);
        }

        // Caso B: Es un número exacto con separador de miles (ej: "1,600" o "1.600")
        else {
            // Aquí NO queremos decimales, queremos quitar la puntuación y dejar los dígitos juntos.
            // "1,600" -> "1600"
            let soloDigitos = str.replace(/[^\d]/g, "");
            return parseInt(soloDigitos, 10) || 0;
        }
    };

    const procesarVolumen = (textoRango) => {
        if (!textoRango || textoRango === "—") return 0;

        let limpio = textoRango
            .toLowerCase()
            .replace(/^de\s+/i, "")
            .replace(/&nbsp;/g, " ")
            .trim();

        // 1. Si es un RANGO (tiene " a ") -> Aplicar Aleatorio
        if (limpio.includes(" a ")) {
            const partes = limpio.split(" a ");
            if (partes.length === 2) {
                const min = parsearNumeroK(partes[0]);
                const max = parsearNumeroK(partes[1]);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
        }

        // 2. Si es MENOR QUE (ej: "< 10")
        else if (limpio.includes("<")) {
            return parsearNumeroK(limpio.replace("<", "")) || 0;
        }

        // 3. Si es VALOR UNICO (ej: "1,600" o "10 k") -> Devolver tal cual
        return parsearNumeroK(limpio);
    };

    // --- PROCESO PRINCIPAL ---

    let resultadoTexto =
        "Palabra Clave\tBúsquedas Mensuales\tOferta Baja\tOferta Alta\n";

    filasSeleccionadas.forEach((fila) => {
        const palabra = obtenerTexto(fila, ".keyword");
        const textoVolumen = obtenerTexto(
            fila,
            'ess-cell[essfield="search_volume"] .value-text'
        );

        const valorBusqueda = procesarVolumen(textoVolumen);
        const ofertaBaja = limpiarBid(
            obtenerTexto(fila, 'ess-cell[essfield="bid_min"] text-field')
        );
        const ofertaAlta = limpiarBid(
            obtenerTexto(fila, 'ess-cell[essfield="bid_max"] text-field')
        );

        resultadoTexto += `${palabra}\t${valorBusqueda}\t${ofertaBaja}\t${ofertaAlta}\n`;
    });

    copy(resultadoTexto);

    console.log("✅ Datos copiados. Error de miles (1,600) corregido.");
    console.log(resultadoTexto);
}

extraerGoogleAdsCorregido();
