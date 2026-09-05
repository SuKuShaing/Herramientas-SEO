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

// todo lo que es en Chile es para que la búsqueda tenga intención y crear historial para las siguientes búsquedas, cosa que no solo salgan videos

const keywords = [
    "Dónde estudiar en Chile",
    "universidades en Chile",
    "universidades en Chile con ingeniería en Chile",
    "universidades en Chile con carreras universitarias en chile",
    "universidades en Chile con ingeniería civil industrial",
    "universidades en Chile con ingeniería comercial",
    "universidades en Chile con derecho",
    "universidades en Chile con administración de empresas",
    "universidades en Chile con ingeniería civil",
    "universidades en Chile con ingeniería informática",
    "universidades en Chile con ingeniería industrial",
    "universidades en Chile con ingeniería civil en minas",
    "universidades en Chile con pedagogía",
    "universidades en Chile con química y farmacia",
    "universidades en Chile con psicología",
    "universidades en Chile con ingeniería en comercio internacional",
    "universidades en Chile con Arquitectura",
    "universidades en Chile con ingeniería en biotecnología",
    "universidades en Chile con ingeniería civil biomédica",
    "universidades en Chile con trabajo social",
    "universidades en Chile con ingeniería civil en obras civiles",
    "universidades en Chile con diseño en comunicación visual",
    "universidades en Chile con dibujante proyectista",
    "universidades en Chile con ingeniería civil en mecánica",
    "universidades en Chile con ingeniería civil electrónica",
    "universidades en Chile con ingeniería civil en ciencia de datos",
    "universidades en Chile con administración pública",
    "universidades en Chile con ingeniería comercial",
    "universidades en Chile con diseño industrial",
    "universidades en Chile con ingeniería civil química",
    "universidades en Chile con bibliotecología y documentación",
    "universidades en Chile con ingeniería en construcción",
    "universidades en Chile con ingeniería industrial",
    "universidades en Chile con ingeniería civil matemática",
    "universidades en Chile con ingeniería en alimentos",
    "universidades en Chile con ingeniería civil en prevención de riesgos",
    "universidades en Chile con contador público y auditor",
    "universidades en Chile con ingeniería en gestión turística",
    "universidades en Chile con química industrial",
    "universidades en Chile con ingeniería en geomensura",
    "universidades en Chile con bachillerato en ciencias de la ingeniería",
    "universidades en Chile con administración pública",
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

    for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        console.log("================================");
        console.log(`${i + 1}/${keywords.length} - Buscando: "${keyword}"`);
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
                    `https://www.google.cl/search?q=${encodeURIComponent(
                        keyword +
                            " -site:youtube.com -site:facebook.com -site:instagram.com -site:twitter.com -site:tiktok.com  -site:linkedin.com  -site:wikipedia.org -site:reddit.com",
                    )}&start=${startParam}&gl=cl&hl=es`,
                    { waitUntil: "domcontentloaded" },
                );

                // --- LÓGICA DE CAPTCHA ---
                const checkCaptcha = async () => {
                    try {
                        const el = await page.$('#captcha, form[action*="CaptchaRedirect"], iframe[src*="recaptcha"]');
                        return el !== null || page.url().includes('/sorry/');
                    } catch (e) {
                        // Si ocurre una navegación (Context destroyed), asumimos true 
                        // para NO romper el bucle prematuramente y revisar de nuevo.
                        return true;
                    }
                };

                if (await checkCaptcha()) {
                    console.log("    ⚠️ CAPTCHA detectado. Por favor, resuélvelo en el navegador. Esperando...");
                    
                    while (await checkCaptcha()) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    
                    // Dar un par de segundos extra para que el DOM de los resultados termine de renderizar
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    console.log("    ✅ CAPTCHA resuelto. Continuando...");
                }
                // -------------------------

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
                await new Promise((r) =>
                    setTimeout(r, entreValores(1000, 7000)),
                ); // Pequeña pausa
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
    // GUARDADO EN CSV
    // ==========================================
    const fs = require("fs");
    const headers = ["Búsqueda", ...Object.keys(universities)];

    // Crear el contenido del CSV
    // Usamos ; como separador por si las keywords tienen comas, aunque en este caso no parece
    // Pero el usuario usaba comas en su output, mantengamos comas.
    const csvContent = [
        headers.join(","),
        ...finalData.map((row) => row.join(",")),
    ].join("\n");

    const outputPath = "resultados.csv";
    fs.writeFileSync(outputPath, csvContent, "utf-8");

    console.log(
        `\n\n✅ Proceso finalizado. Se han guardado ${finalData.length} filas en: ${outputPath}`,
    );
    console.log("RECUERDA BORRAR LA PRIMERA FILA: Dónde estudiar en Chile");
}

runScraper();

function entreValores(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
