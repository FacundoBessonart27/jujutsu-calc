/* ==========================================================================
   JUJUTSU CALC — script.js
   Todo se controla desde la configuración CHARACTERS de abajo. Para cambiar
   las imágenes, el nombre o el color de un personaje, solo hay que editar
   este objeto: ninguna otra parte del archivo usa el nombre del personaje
   de forma directa.
   ========================================================================== */

const CHARACTERS = {
  0: {
    name: "Geto",
    color: "#9d4edd",
    glyph: "呪",
    images: [
      "assets/images/characters/geto/geto1.jpg",
      "assets/images/characters/geto/geto2.jpg"
    ]
  },
  1: {
    name: "Gojo",
    color: "#29c5ff",
    glyph: "∞",
    images: [
      "assets/images/characters/gojo/gojo1.jpg",
      "assets/images/characters/gojo/gojo2.jpg"
    ]
  },
  2: {
    name: "Yuji",
    color: "#ff6a3d",
    glyph: "力",
    images: [
      "assets/images/characters/yuji/yuji1.jpg",
      "assets/images/characters/yuji/yuji2.jpg"
    ]
  },
  3: {
    name: "Megumi",
    color: "#4a5fd6",
    glyph: "影",
    images: [
      "assets/images/characters/megumi/megumi1.jpg",
      "assets/images/characters/megumi/megumi2.jpg"
    ]
  },
  4: {
    name: "Nobara",
    color: "#ffb703",
    glyph: "藁",
    images: [
      "assets/images/characters/nobara/nobara1.jpg",
      "assets/images/characters/nobara/nobara2.jpg"
    ]
  },
  5: {
    name: "Sukuna",
    color: "#ff2d55",
    glyph: "王",
    images: [
      "assets/images/characters/sukuna/sukuna1.jpg",
      "assets/images/characters/sukuna/sukuna2.jpg"
    ]
  },
  6: {
    name: "Toji",
    color: "#8a8a99",
    glyph: "無",
    images: [
      "assets/images/characters/toji/toji1.jpg",
      "assets/images/characters/toji/toji2.jpg"
    ]
  },
  7: {
    name: "Nanami",
    color: "#2ec4b6",
    glyph: "定",
    images: [
      "assets/images/characters/nanami/nanami1.jpg",
      "assets/images/characters/nanami/nanami2.jpg"
    ]
  },
  8: {
    name: "Maki",
    color: "#c9c9e0",
    glyph: "刃",
    images: [
      "assets/images/characters/maki/maki1.jpg",
      "assets/images/characters/maki/maki2.jpg"
    ]
  },
  9: {
    name: "Yuta",
    color: "#8752e8",
    glyph: "魂",
    images: [
      "assets/images/characters/yuta/yuta1.jpg",
      "assets/images/characters/yuta/yuta2.jpg"
    ]
  }
};

// Orden en que se muestra el teclado: replica una calculadora convencional
// y cada dígito conserva el hechicero que tiene asignado.
const KEYPAD_LAYOUT = [
  { type: "digit", value: "7" }, { type: "digit", value: "8" },
  { type: "digit", value: "9" }, { type: "op", value: "÷" },

  { type: "digit", value: "4" }, { type: "digit", value: "5" },
  { type: "digit", value: "6" }, { type: "op", value: "×" },

  { type: "digit", value: "1" }, { type: "digit", value: "2" },
  { type: "digit", value: "3" }, { type: "op", value: "-" },

  { type: "clear", value: "C" }, { type: "digit", value: "0" },
  { type: "dot", value: "." }, { type: "op", value: "+" },

  { type: "equals", value: "=" }
];

const OPERATOR_SYMBOLS = { "+": "+", "-": "−", "×": "×", "÷": "÷" };

/* --------------------------------------------------------------------------
   Estado de ejecución de cada personaje: indica cuál de sus dos imágenes se
   muestra. Se guarda por separado para que pulsar un número no afecte a otro.
   -------------------------------------------------------------------------- */
const imageState = {};
Object.keys(CHARACTERS).forEach((digit) => { imageState[digit] = 0; });

/* --------------------------------------------------------------------------
   Estado interno de la calculadora
   -------------------------------------------------------------------------- */
const calc = {
  current: "0",     // valor que se está escribiendo o mostrando
  previous: null,    // operando guardado
  operator: null,    // operador pendiente
  waitingForOperand: false, // es true después de un operador o de igual
  hasError: false
};

const MAX_DIGITS = 14;
const imageSwapTimers = {};

// Convierte un resultado en un valor legible para la pantalla, limita su precisión
// y usa notación científica cuando el número ocuparía demasiado espacio.
// Recibe un número (o una cadena ya formateada) y devuelve texto seguro para mostrar.
function formatNumber(value) {
  if (typeof value === "string") return value;
  if (!isFinite(value)) return "Error";

  if (Math.abs(value) > 999999999999) {
    return value.toExponential(4).replace("e+", "e");
  }

  // Elimina pequeñas imprecisiones de punto flotante (por ejemplo, 0.1 + 0.2).
  let rounded = parseFloat(value.toPrecision(12));
  let str = rounded.toString();

  if (str.replace(/[-.]/g, "").length > MAX_DIGITS) {
    str = rounded.toExponential(4).replace("e+", "e");
  }
  return str;
}

// Determina si un resultado aritmético se puede guardar y mostrar con seguridad.
// Evita que NaN e Infinity entren en el estado de la calculadora.
function isValidResult(value) {
  return typeof value === "number" && Number.isFinite(value);
}

// Elimina la operación pendiente y coloca la calculadora en un estado de error recuperable.
// Actualiza el estado compartido y redibuja de inmediato la pantalla con "Error".
function setDisplayError() {
  calc.current = "0";
  calc.previous = null;
  calc.operator = null;
  calc.waitingForOperand = false;
  calc.hasError = true;
  render(true);
}

// Agrega un dígito al operando que se está editando o inicia el siguiente operando
// después de un operador o resultado. Recibe el dígito como texto y actualiza la pantalla.
function inputDigit(digit) {
  if (calc.hasError) resetCalculator(false);

  if (calc.waitingForOperand) {
    calc.current = digit;
    calc.waitingForOperand = false;
  } else {
    if (calc.current === "0") {
      calc.current = digit;
    } else if (calc.current.replace(/[-.]/g, "").length < MAX_DIGITS) {
      calc.current += digit;
    }
  }
  render();
}

// Agrega un único separador decimal al operando actual. Si se espera un nuevo operando,
// lo inicia como "0." para que la expresión siga siendo un número válido.
function inputDot() {
  if (calc.hasError) resetCalculator(false);

  if (calc.waitingForOperand) {
    calc.current = "0.";
    calc.waitingForOperand = false;
    render();
    return;
  }
  if (!calc.current.includes(".")) {
    calc.current += ".";
    render();
  }
}

// Guarda o aplica un operador. En operaciones encadenadas primero resuelve la operación
// pendiente y luego deja este operador preparado para el siguiente operando.
function inputOperator(op) {
  if (calc.hasError) resetCalculator(false);

  const inputValue = parseFloat(calc.current);

  if (calc.operator && calc.waitingForOperand) {
    // El usuario cambió de operador antes de escribir otro número: solo se reemplaza.
    calc.operator = op;
    render();
    return;
  }

  if (calc.previous === null) {
    calc.previous = inputValue;
  } else if (calc.operator) {
    const result = compute(calc.previous, inputValue, calc.operator);
    if (!isValidResult(result)) { setDisplayError(); return; }
    calc.previous = result;
    calc.current = formatNumber(result);
  }

  calc.operator = op;
  calc.waitingForOperand = true;
  render();
}

// Realiza una operación aritmética con dos operandos numéricos y un símbolo del teclado.
// La división por cero devuelve null para que quien la llame muestre un error controlado.
function compute(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "×": return a * b;
    case "÷":
      if (b === 0) return null; // La función que llama mostrará "Error".
      return a / b;
    default: return b;
  }
}

// Resuelve la operación pendiente y prepara el resultado para ser reemplazado por el
// siguiente dígito. No modifica nada cuando no existe una operación pendiente.
function inputEquals() {
  if (calc.hasError) return;
  if (calc.operator === null || calc.previous === null) return;

  const inputValue = parseFloat(calc.current);
  const result = compute(calc.previous, inputValue, calc.operator);

  if (!isValidResult(result)) {
    setDisplayError();
    return;
  }

  calc.current = formatNumber(result);
  calc.previous = null;
  calc.operator = null;
  calc.waitingForOperand = true;
  render();
}

// Convierte el operando actual a su porcentaje. El resultado se considera terminado,
// por lo que al escribir un dígito se inicia un nuevo operando en lugar de anexarlo.
function inputPercent() {
  if (calc.hasError) resetCalculator(false);
  const value = parseFloat(calc.current) / 100;
  calc.current = formatNumber(value);
  calc.waitingForOperand = true;
  render();
}

// Elimina el último carácter editable sin dejar un valor inválido en lugar del cero.
// No actúa justo después de un operador porque aún no hay un operando para editar.
function backspace() {
  if (calc.hasError) { resetCalculator(false); return; }
  if (calc.waitingForOperand) return;

  if (calc.current.length <= 1 || (calc.current.length === 2 && calc.current.startsWith("-"))) {
    calc.current = "0";
  } else {
    calc.current = calc.current.slice(0, -1);
  }
  render();
}

// Restablece el estado neutral de la calculadora. El parámetro opcional permite reiniciar
// antes de procesar una tecla sin generar un redibujado intermedio innecesario.
function resetCalculator(shouldRender = true) {
  calc.current = "0";
  calc.previous = null;
  calc.operator = null;
  calc.waitingForOperand = false;
  calc.hasError = false;
  if (shouldRender) render();
}

/* --------------------------------------------------------------------------
   Renderizado
   -------------------------------------------------------------------------- */
const els = {};

// Guarda los nodos del DOM que la calculadora usa repetidamente, evita búsquedas
// duplicadas y permite que el renderizado trabaje con una colección clara de elementos.
function cacheElements() {
  els.keypad = document.getElementById("keypad");
  els.expression = document.getElementById("expression");
  els.result = document.getElementById("result");
  els.tag = document.getElementById("activeSorcerer");
  els.backspace = document.getElementById("backspace");
  els.percent = document.getElementById("percent");
  els.screen = document.getElementById("screen");
}

// Sincroniza la pantalla con el estado de la calculadora, incluida la expresión pendiente
// y el mensaje de error recuperable. El parámetro opcional permite forzar el estado de error.
function render(isError = false) {
  if (calc.hasError || isError) {
    els.result.textContent = "Error";
    els.result.classList.add("is-error");
    els.expression.innerHTML = "&nbsp;";
    return;
  }

  els.result.classList.remove("is-error");
  els.result.textContent = calc.current;

  if (calc.operator && calc.previous !== null) {
    const opSymbol = OPERATOR_SYMBOLS[calc.operator] || calc.operator;
    const previousText = formatNumber(calc.previous);
    els.expression.textContent = `${previousText} ${opSymbol}${calc.waitingForOperand ? "" : " " + calc.current}`;
  } else {
    els.expression.innerHTML = "&nbsp;";
  }
}

// Actualiza la etiqueta y el brillo de la pantalla según el personaje del dígito pulsado.
// Recibe un dígito y solo modifica la respuesta visual, no el estado aritmético.
function setActiveSorcerer(digit) {
  const character = CHARACTERS[digit];
  if (!character) return;
  els.tag.textContent = character.name.toUpperCase();
  els.screen.style.setProperty("--screen-glow", character.color);
}

/* --------------------------------------------------------------------------
   Construcción del teclado
   -------------------------------------------------------------------------- */
// Construye el teclado en el orden declarado, usando un fragmento para insertar todos
// los botones en una sola actualización del DOM y evitar recálculos repetidos.
function buildKeypad() {
  const fragment = document.createDocumentFragment();

  KEYPAD_LAYOUT.forEach((key) => {
    let button;
    if (key.type === "digit") {
      button = buildSorcererKey(key.value);
    } else if (key.type === "op") {
      button = buildOperatorKey(key.value);
    } else if (key.type === "clear") {
      button = buildClearKey();
    } else if (key.type === "dot") {
      button = buildDotKey();
    } else if (key.type === "equals") {
      button = buildEqualsKey();
    }
    fragment.appendChild(button);
  });

  els.keypad.appendChild(fragment);
}

// Crea una tecla numérica con el retrato asignado, etiqueta accesible, glifo alternativo
// y listener que controla tanto el cálculo como el cambio de imagen.
function buildSorcererKey(digit) {
  const character = CHARACTERS[digit];

  const button = document.createElement("button");
  button.type = "button";
  button.className = "key key-sorcerer";
  button.style.setProperty("--curse-color", character.color);
  button.setAttribute("aria-label", `${digit} — ${character.name}`);
  button.dataset.digit = digit;

  const portrait = document.createElement("div");
  portrait.className = "portrait";

  const placeholder = document.createElement("div");
  placeholder.className = "placeholder";
  const glyph = document.createElement("span");
  glyph.className = "placeholder-glyph";
  glyph.textContent = character.glyph;
  glyph.setAttribute("aria-hidden", "true");
  placeholder.appendChild(glyph);

  const img = document.createElement("img");
  img.alt = `${character.name}`;
  img.loading = "lazy";
  img.draggable = false;

  // Si la imagen real no está disponible, muestra el marcador visual
  // en lugar del icono de imagen rota.
  img.addEventListener("error", () => {
    img.style.display = "none";
  });
  img.addEventListener("load", () => {
    img.classList.add("is-visible");
  });

  img.src = character.images[imageState[digit]];

  portrait.appendChild(placeholder);
  portrait.appendChild(img);
  button.appendChild(portrait);

  const label = document.createElement("div");
  label.className = "key-label";
  const number = document.createElement("span");
  number.className = "key-number";
  number.textContent = digit;
  const name = document.createElement("span");
  name.className = "key-name";
  name.textContent = character.name;
  label.appendChild(number);
  label.appendChild(name);
  button.appendChild(label);

  button.addEventListener("click", () => handleDigitPress(digit, button));

  return button;
}

// Crea una tecla de operador y la conecta con el manejador común de operadores.
function buildOperatorKey(symbol) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "key key-operator";
  button.textContent = symbol;
  button.setAttribute("aria-label", `Operador ${symbol}`);
  button.addEventListener("click", () => inputOperator(symbol));
  return button;
}

// Crea la tecla de borrado total que restaura el estado inicial de la calculadora.
function buildClearKey() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "key key-operator key-clear";
  button.textContent = "C";
  button.setAttribute("aria-label", "Borrar todo");
  button.addEventListener("click", () => resetCalculator());
  return button;
}

// Crea la tecla decimal y delega su validación en inputDot.
function buildDotKey() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "key key-operator key-dot";
  button.textContent = ".";
  button.setAttribute("aria-label", "Decimal");
  button.addEventListener("click", inputDot);
  return button;
}

// Crea la tecla de igual de ancho completo y la conecta con el resolvedor de operaciones.
function buildEqualsKey() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "key key-equals";
  button.textContent = "=";
  button.setAttribute("aria-label", "Igual");
  button.addEventListener("click", inputEquals);
  return button;
}

/* --------------------------------------------------------------------------
   Pulsación de dígito: actualiza la calculadora Y cambia la imagen del personaje.
   -------------------------------------------------------------------------- */
// Gestiona la pulsación de una tecla numérica: registra el dígito, actualiza la respuesta
// visual del personaje activo y solicita el siguiente retrato de ese personaje.
function handleDigitPress(digit, button) {
  inputDigit(digit);
  setActiveSorcerer(digit);
  cycleCharacterImage(digit, button);
}

// Alterna solo la imagen del personaje seleccionado. Las pulsaciones rápidas cancelan el
// cambio anterior pendiente para que el retrato termine suavemente en el estado más reciente.
function cycleCharacterImage(digit, button) {
  const character = CHARACTERS[digit];
  const img = button.querySelector("img");

  imageState[digit] = (imageState[digit] + 1) % character.images.length;
  const nextSrc = character.images[imageState[digit]];

  window.clearTimeout(imageSwapTimers[digit]);
  img.classList.add("is-swapping");
  imageSwapTimers[digit] = window.setTimeout(() => {
    img.src = nextSrc;
    img.classList.remove("is-swapping");
  }, 160);
}

/* --------------------------------------------------------------------------
   Soporte para teclado físico
   -------------------------------------------------------------------------- */
// Asigna las teclas físicas admitidas a los mismos manejadores de toque/clic, mantiene
// ambos métodos de entrada consistentes y evita la acción predeterminada de Enter.
function handleKeydown(e) {
  if (e.key >= "0" && e.key <= "9") {
    const button = els.keypad.querySelector(`[data-digit="${e.key}"]`);
    if (button) button.click();
    return;
  }
  const opMap = { "+": "+", "-": "-", "*": "×", "/": "÷" };
  if (opMap[e.key]) { inputOperator(opMap[e.key]); return; }
  if (e.key === "Enter" || e.key === "=") { e.preventDefault(); inputEquals(); return; }
  if (e.key === ".") { inputDot(); return; }
  if (e.key === "Backspace") { backspace(); return; }
  if (e.key === "Escape") { resetCalculator(); return; }
  if (e.key === "%") { inputPercent(); return; }
}

/* --------------------------------------------------------------------------
   Inicialización
   -------------------------------------------------------------------------- */
// Inicia la aplicación cuando la página está lista: guarda elementos, crea el teclado,
// conecta los listeners restantes y muestra el estado inicial con cero.
function init() {
  cacheElements();
  buildKeypad();
  els.backspace.addEventListener("click", backspace);
  els.percent.addEventListener("click", inputPercent);
  document.addEventListener("keydown", handleKeydown);
  render();
}

document.addEventListener("DOMContentLoaded", init);
