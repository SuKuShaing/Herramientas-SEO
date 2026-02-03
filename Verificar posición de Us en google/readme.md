# Verificador de Posicionamiento SEO - Universidades Chilenas

Este proyecto es una herramienta de automatización desarrollada en Node.js para verificar el posicionamiento (ranking) de diversos dominios de universidades chilenas en los resultados de búsqueda de Google.

Utiliza **Puppeteer** con el plugin `stealth` para realizar búsquedas automatizadas simulando un navegador real, evitando bloqueos y capturando las posiciones de los dominios de interés para una lista de palabras clave predefinidas.

## Características

- **Búsqueda Automatizada**: Realiza consultas en Google.cl para múltiples palabras clave relacionadas con carreras y universidades.
- **Filtrado de Resultados**: Excluye sitios de redes sociales y videos incorrectos (Youtube, Facebook, etc.) para enfocar los resultados en sitios web relevantes.
- **Ranking de Universidades**: Rastrea la posición de dominios específicos (ej: `uchile.cl`, `uc.cl`, `usach.cl`, etc.) en las primeras páginas de resultados.
- **Salida en CSV**: Genera automáticamente un archivo `resultados.csv` con una matriz de posiciones lista para analizar.
- **Modo Stealth**: Configurado para minimizar la detección de bots por parte de Google.

## Requisitos Previos

- Node.js instalado en el sistema.
- Navegador Google Chrome (Puppeteer descarga su propia versión de Chromium, pero es bueno tener el entorno listo).

## Instalación

1.  Abre una terminal en la carpeta del proyecto.
2.  Instala las dependencias necesarias definidas en `package.json`

```bash
npm install
```

Esto instalará `puppeteer-extra` y `puppeteer-extra-plugin-stealth` principalmente.

## Uso

Para ejecutar el script:

```bash
node index.js
```

### Comportamiento durante la ejecución

1.  Se abrirá una ventana de navegador Chromium (configurado en `headless: false` por defecto para que puedas ver el proceso).
2.  **Importante**: El navegador necesita cargar para verificar que no eres un robot. Si aparece un **CAPTCHA** de Google, resuélvelo manualmente en la ventana abierta.
3.  El script buscará secuencialmente cada palabra clave definida en `keywords`.
4.  Para cada búsqueda, analizará los resultados orgánicos (saltando anuncios).
5.  El progreso se mostrará en la consola.

## Resultados

Al finalizar, se generará un archivo **`resultados.csv`** en la misma carpeta del proyecto.

- **Contenido**: Una tabla donde:
    - **Filas**: Palabras clave buscadas (ej: "universidades en Chile con derecho").
    - **Columnas**: Universidades monitoreadas.
    - **Valores**: Posición del dominio en Google (1 = primer resultado).
- **Interpretación**:
    - Un número (ej: `3`) indica que la universidad apareció en esa posición.
    - Un número alto (ej: `21` o más) indica que la universidad no apareció en las primeras páginas escaneadas (fuera del rango de búsqueda).

> [!IMPORTANT]
> **Acción Requerida**: Una vez que hayas copiado o procesado la información del archivo **`resultados.csv`**, **bórralo**. Es muy importante eliminar este archivo después de su uso para asegurar una ejecución limpia la próxima vez.

## Configuración

Puedes modificar el archivo `index.js` para ajustar:

- **`pagesToScrape`**: Número de páginas de Google a leer (por defecto 2, aprox. 20 resultados).
- **`universities`**: Objeto con los nombres y dominios de las universidades a rastrear.
- **`keywords`**: La lista de frases o términos de búsqueda.

---

**Nota**: Este script incluye tiempos de espera aleatorios para comportarse de manera "humana" y reducir el riesgo de bloqueo temporal de IP. Si deseas detener el proceso antes de tiempo, puedes presionar `Ctrl + C` en la terminal.
