const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// --- CONFIGURACIÓN ---
const headless = false;
const pagesToScrape = 2; // Leeremos 2 páginas (aprox 20 resultados)

// IMPORTANTE: El orden aquí será el orden de las columnas
const universities = {
    Utem: "utem.cl",
    UC: "uc.cl",
    UChile: "uchile.cl",
    UdeC: "udec.cl",
    USACH: "usach.cl",
    UAI: "uai.cl",
    PUCV: "pucv.cl",
    USM: "usm.cl",
    UACH: "uach.cl",
    Uandes: "andes.cl",
    UDP: "udp.cl",
    UDLA: "udla.cl",
    UST: "ust.cl",
    UTalca: "utalca.cl",
    UTA: "uta.cl",
    UFRO: "ufro.cl",
    UNAB: "unab.cl",
    UV: "uv.cl",
    UAutonoma: "uautonoma.cl",
};

const keywords = [
    "universidad",
    "ingeniería civil industrial",
    // "ingeniería comercial",
    // "derecho",
    // "administración de empresas",
    // "carreras universitarias",
    // "ingeniería civil",
    // "ingeniería informatica",
    // "ingeniería industrial",
    // "ingenieía civil en minas",
    // "pedagogia",
    // "quimica y farmacia",
    // "psicología",
    // "ingeniería en comercio internacional",
    // "Arquitectura",
    // "ingenieria en biotecnologia",
    // "ingenieria civil biomedica",
    // "trabajo social",
    // "ingenieria civil en obras civiles",
    // "diseno en comunicacion visual",
    // "dibujante proyectista",
    // "ingenieria civil en mecanica",
    // "ingenieria civil electronica",
    // "ingenieria civil en ciencia de datos",
    // "administracion publica",
    // "ingenieria comercial",
    // "diseno industrial",
    // "ingenieria civil quimica",
    // "bibliotecologia y documentacion",
    // "ingenieria en construccion",
    // "ingenieria industrial",
    // "ingenieria civil matematica",
    // "ingenieria en alimentos",
    // "ingenieria civil en prevencion de riesgos",
    // "contador publico y auditor",
    // "ingenieria en gestion turistica",
    // "quimica industrial",
    // "ingenieria en geomensura",
    // "bachillerato en ciencias de la ingenieria",
];

async function runScraper() {
    const browser = await puppeteer.launch({
        headless: headless,
        defaultViewport: null,
        args: ["--start-maximized"],
    });

    const page = await browser.newPage();

    // Guardaremos todo en un array para imprimirlo al final
    const finalData = [];

    for (const keyword of keywords) {
        console.log("================================");
        console.log(`Buscando: "${keyword}"`);
        console.log("================================");

        let globalResults = [];

        // --- BUCLE DE PÁGINAS ---
        for (let i = 0; i < pagesToScrape; i++) {
            const startParam = i * 10;
            console.log(
                `        Leyendo página ${i + 1} (start=${startParam})...`,
            );
            try {
                await page.goto(
                    `https://www.google.cl/search?q=${encodeURIComponent(keyword)}&start=${startParam}`,
                    { waitUntil: "domcontentloaded" },
                );

                try {
                    await page.waitForSelector(".yuRUbf", { timeout: 10000 });
                } catch (e) {
                    // Si falla el wait, seguimos, quizás no hay más resultados
                }

                const pageResults = await page.evaluate(() => {
                    const nodes = Array.from(
                        document.querySelectorAll("div.yuRUbf a"),
                    );
                    return nodes.map((a) => a.href);
                });

                globalResults = globalResults.concat(pageResults);
                await new Promise((r) => setTimeout(r, 1500)); // Pequeña pausa
            } catch (error) {
                console.error(`Error en pág ${i}:`, error.message);
            }
        }

        console.log(
            `    ✅ Total acumulado: ${globalResults.length} enlaces.\n`,
        );

        // --- CALCULO DE POSICIONES ---
        const rowValues = [keyword]; // La primera columna es la palabra clave

        for (const [uniName, domain] of Object.entries(universities)) {
            const position = globalResults.findIndex((url) =>
                url.toLowerCase().includes(domain.toLowerCase()),
            );
            const limit = pagesToScrape * 10 + 1;
            // Guardamos el valor limpio
            rowValues.push(position === -1 ? limit : position + 1);
        }

        // Guardamos la fila completa
        finalData.push(rowValues);
    }

    await browser.close();

    // ==========================================
    // IMPRESIÓN LIMPIA PARA COPIAR A SHEETS
    // ==========================================
    console.log("\n\n📋 --- INICIO DE DATOS PARA COPIAR --- 📋\n");

    // 1. Imprimir Cabecera
    // Usamos , (coma) para separar columnas
    const headers = ["Busqueda", ...Object.keys(universities)];
    console.log(headers.join(","));

    // 2. Imprimir Filas
    finalData.forEach((row) => {
        console.log(row.join(","));
    });

    console.log("\n📋 --- FIN DE DATOS PARA COPIAR --- 📋\n");
}

runScraper();
