# Jujutsu Calc — Cursed Arithmetic

Calculadora web temática de **Jujutsu Kaisen**. Cada número del 0 al 9
está asociado a un hechicero distinto: al presionarlo, además de
introducir el dígito en la operación, la imagen del personaje cambia
entre sus dos retratos disponibles.

Proyecto 100% estático: HTML, CSS y JavaScript vanilla. Sin frameworks,
sin backend, sin base de datos y sin dependencias externas — funciona
por completo en el navegador, incluso sin conexión, una vez cargado.

## 1. Tecnologías

- HTML5
- CSS3 (custom properties, CSS Grid, sin frameworks)
- JavaScript vanilla (ES6+, sin librerías)

## 2. Características

- Calculadora funcional: suma, resta, multiplicación, división,
  porcentaje, decimales, borrado total y borrado del último carácter.
- Manejo seguro de errores: división por cero, resultados inválidos o
  números muy grandes nunca muestran `NaN`, `Infinity` ni `undefined`
  — siempre se muestra `Error` y la calculadora se recupera al tocar
  cualquier tecla.
- 10 hechiceros, uno por número, cada uno con **dos imágenes** que
  alternan en ciclo cada vez que se presiona su tecla, con una
  animación corta de transición.
- El estado de la imagen es independiente por personaje: presionar `1`
  nunca altera la imagen de otro número.
- Placeholder visual elegante (sin ícono de imagen rota) mientras no
  se coloquen las imágenes reales.
- Diseño oscuro inspirado en energía maldita, con un color de "técnica
  maldita" propio por personaje que ilumina su tecla y la pantalla al
  usarse.
- Totalmente responsive, pensado primero para celular (desde ~320px)
  y con un ancho máximo cuidado en pantallas grandes.
- Soporte de teclado físico (números, `+ - * /`, `Enter`, `Backspace`,
  `Escape`, `%`) y respeto de `prefers-reduced-motion`.
- Configuración centralizada de personajes: para cambiar nombre, color
  o imágenes de un personaje solo se edita un objeto en `script.js`.

## 3. Estructura de carpetas

```
Jujutsu-Calc/
├── README.md
├── .gitignore
└── www/                          ← esta carpeta es la que se publica
    ├── index.html
    ├── style.css
    ├── script.js
    └── assets/
        └── images/
            └── characters/
                ├── geto/
                ├── gojo/
                ├── yuji/
                ├── megumi/
                ├── nobara/
                ├── sukuna/
                ├── toji/
                ├── nanami/
                ├── maki/
                └── yuta/
```

Todo lo necesario para ejecutar la aplicación vive dentro de `www/`,
que es completamente independiente y usa únicamente **rutas
relativas** (por ejemplo `assets/images/characters/gojo/gojo1.jpg`),
nunca rutas absolutas ni URLs externas. Esto es lo que permite
publicarla directamente con GitHub Pages.

## 4. Personaje por número

| Número | Personaje              |
|:------:|-------------------------|
| 0      | Suguru Geto             |
| 1      | Satoru Gojo              |
| 2      | Yuji Itadori             |
| 3      | Megumi Fushiguro         |
| 4      | Nobara Kugisaki          |
| 5      | Ryomen Sukuna            |
| 6      | Toji Fushiguro           |
| 7      | Kento Nanami             |
| 8      | Maki Zenin               |
| 9      | Yuta Okkotsu             |

## 5. Cómo ejecutar el proyecto localmente

No requiere instalación ni build. Basta con abrir el archivo
directamente, o (recomendado) servirlo con un servidor local simple
para evitar restricciones del navegador con `file://`:

```bash
cd www
# Opción A: Python
python3 -m http.server 8000

# Opción B: Node (npx)
npx serve .
```

Luego abre `http://localhost:8000` en el navegador.

También puedes abrir `www/index.html` directamente con doble clic,
aunque algunos navegadores son más permisivos que otros al hacerlo
sin servidor.

## 6. Cómo colocar las imágenes

Cada personaje necesita **dos imágenes**, con estos nombres exactos,
dentro de su propia carpeta en `www/assets/images/characters/`:

```
www/assets/images/characters/gojo/gojo1.jpg
www/assets/images/characters/gojo/gojo2.jpg
```

Repite el mismo patrón para cada carpeta: `geto1.jpg` / `geto2.jpg`,
`yuji1.jpg` / `yuji2.jpg`, `megumi1.jpg` / `megumi2.jpg`,
`nobara1.jpg` / `nobara2.jpg`, `sukuna1.jpg` / `sukuna2.jpg`,
`toji1.jpg` / `toji2.jpg`, `nanami1.jpg` / `nanami2.jpg`,
`maki1.jpg` / `maki2.jpg`, `yuta1.jpg` / `yuta2.jpg`.

En cuanto coloques un archivo con el nombre correcto, la aplicación lo
usará automáticamente — no hay que tocar el código. Mientras un
archivo no exista, ese número mostrará el placeholder elegante en su
lugar, sin ningún ícono de imagen rota.

Formato recomendado: imagen recortada en proporción cuadrada (las
imágenes incluidas usan `.jpg`) para que se vea bien dentro de la tecla.

## 7. Cómo cambiar las imágenes (o añadir un personaje)

Toda la configuración vive en un único objeto al inicio de
`www/script.js`:

```js
const CHARACTERS = {
  1: {
    name: "Gojo",
    color: "#29c5ff",
    glyph: "∞",
    images: [
      "assets/images/characters/gojo/gojo1.jpg",
      "assets/images/characters/gojo/gojo2.jpg"
    ]
  },
  // ...
};
```

Para cambiar las imágenes de un personaje, edita su arreglo `images`.
Para cambiar su nombre o el color de su energía maldita, edita `name`
o `color`. No es necesario modificar ninguna otra parte del código.

## 8. Cómo publicar el proyecto con GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `jujutsu-calc`).
2. Sube todo el contenido de esta carpeta (`Jujutsu-Calc/`) al
   repositorio:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Jujutsu Calc"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/jujutsu-calc.git
   git push -u origin main
   ```
3. En GitHub, entra a **Settings → Pages**.
4. En **Source**, selecciona la rama `main` y la carpeta **`/www`**.
5. Guarda los cambios. GitHub Pages publicará la URL, normalmente:
   ```
   https://TU-USUARIO.github.io/jujutsu-calc/
   ```
6. Espera uno o dos minutos y visita la URL — la calculadora quedará
   publicada usando exactamente los mismos archivos que probaste en
   local, ya que todas las rutas son relativas.

## Licencia y uso de la propiedad intelectual

Este es un proyecto de fan hecho con fines educativos / de portfolio.
"Jujutsu Kaisen" y sus personajes son propiedad de sus respectivos
creadores y editoriales; este proyecto no incluye ni distribuye
ningún material oficial (ilustraciones, logotipos, etc.) — las
imágenes de personajes deben ser agregadas manualmente por quien
despliegue el proyecto.
