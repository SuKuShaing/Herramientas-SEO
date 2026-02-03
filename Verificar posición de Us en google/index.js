const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// 0. Configuraciones Generales
// Activar ventana del navegador para ver lo que está haciendo
const headless = false; // true para que no se vea la ventana, false para verla
const numResults = 35; // Cantidad de resultados por búsqueda

// 1. Configuración de tus Dominios (Mapeo Universidad -> Dominio)
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
};

// 2. Tus palabras clave (según tu imagen)
const keywords = [
    "universidad",
    "ingeniería civil industrial",
    "ingeniería comercial",
    "derecho",
    "administración de empresas",
    "carreras universitarias",
    "ingeniería civil",
    "ingeniería informatica",
    "ingeniería industrial",
    "ingenieía civil en minas",
    "pedagogia",
    "quimica y farmacia",
    "psicología",
    "ingeniería en comercio internacional",
    "Arquitectura",
    "ingenieria en biotecnologia",
    "ingenieria civil biomedica",
    "trabajo social",
    "ingenieria civil en obras civiles",
    "diseno en comunicacion visual",
    "dibujante proyectista",
    "ingenieria civil en mecanica",
    "ingenieria civil electronica",
    "ingenieria civil en ciencia de datos",
    "administracion publica",
    "ingenieria comercial",
    "diseno industrial",
    "ingenieria civil quimica",
    "bibliotecologia y documentacion",
    "ingenieria en construccion",
    "ingenieria industrial",
    "ingenieria civil matematica",
    "ingenieria en alimentos",
    "ingenieria civil en prevencion de riesgos",
    "contador publico y auditor",
    "ingenieria en gestion turistica",
    "quimica industrial",
    "ingenieria en geomensura",
    "bachillerato en ciencias de la ingenieria",
    "administracion publica",
];

async function runScraper() {
    const browser = await puppeteer.launch({ headless });
    const page = await browser.newPage();

    // Resultados finales
    const report = [];

    for (const keyword of keywords) {
        console.log(`🔍 Buscando: ${keyword}...`);

        try {
            // Ir a Google (Chile)
            await page.goto(
                `https://www.google.cl/search?q=${encodeURIComponent(keyword)}&num=${numResults}`,
                { waitUntil: "networkidle2" },
            );

            // Extraer todos los links orgánicos (excluyendo anuncios)
            const organicResults = await page.evaluate(() => {
                // Selector típico de Google para resultados orgánicos (puede cambiar, es la parte delicada)
                const items = Array.from(document.querySelectorAll("div.g a"));
                return items.map((a) => a.href);
            });

            // Objeto para guardar la posición de esta keyword
            const row = { keyword: keyword };

            // Verificar posición para cada universidad
            for (const [uniName, domain] of Object.entries(universities)) {
                // Buscamos el índice donde el dominio aparece por primera vez
                // Sumamos 1 porque los índices parten en 0
                const position = organicResults.findIndex((url) =>
                    url.includes(domain),
                );

                // Si position es -1 (no está), ponemos 100 o un valor alto
                row[uniName] =
                    position === -1 ? `>${numResults}` : position + 1;
            }

            report.push(row);

            // Espera humana aleatoria para evitar bloqueo (entre 2 y 5 segundos)
            const delay = Math.floor(Math.random() * 3000) + 2000;
            await new Promise((r) => setTimeout(r, delay));
        } catch (error) {
            console.error(`Error en ${keyword}:`, error);
        }
    }

    await browser.close();

    // 3. Imprimir resultado (o guardar en archivo)
    console.table(report);

    // Aquí podrías agregar código para escribir un CSV o un HTML
    // fs.writeFileSync('reporte_seo.json', JSON.stringify(report, null, 2));
}

runScraper();
