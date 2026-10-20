const products = [
  { id: 1, name: "Proteína Whey", category: "Proteínas", price: 29.90, emoji: "🥛", tag: "POPULAR", description: "Proteína en polvo · formato 1 kg", detail: "Producto de proteína en polvo. Revisa la fuente proteica, los alérgenos y la información nutricional del fabricante." },
  { id: 2, name: "Proteína vegetal", category: "Proteínas", price: 24.90, emoji: "🌱", tag: "VEGETAL", description: "Alternativa vegetal · formato 500 g", detail: "Proteína de origen vegetal. Comprueba los ingredientes y posibles trazas en el etiquetado." },
  { id: 3, name: "Creatina monohidrato", category: "Rendimiento", price: 19.90, emoji: "⚡", tag: "CLÁSICO", description: "Polvo monocomponente · 300 g", detail: "Producto de creatina monohidrato. Consulta el etiquetado y pide asesoramiento profesional sobre su idoneidad." },
  { id: 4, name: "Bebida isotónica", category: "Rendimiento", price: 14.50, emoji: "🥤", tag: "HIDRATACIÓN", description: "Mezcla en polvo para bebida", detail: "Preparado para bebida. Consulta azúcares, electrolitos, instrucciones y advertencias del fabricante." },
  { id: 5, name: "Multivitamínico", category: "Bienestar", price: 12.90, emoji: "🍊", tag: "BIENESTAR", description: "Complemento de vitaminas y minerales", detail: "Complemento alimenticio. Evita combinar productos con ingredientes duplicados sin orientación profesional." },
  { id: 6, name: "Omega 3", category: "Bienestar", price: 16.90, emoji: "🐟", tag: "ESENCIALES", description: "Complemento de ácidos grasos", detail: "Complemento de ácidos grasos. Revisa origen, alérgenos, composición y posibles interacciones con medicamentos." },
  { id: 7, name: "Botella deportiva", category: "Accesorios", price: 8.90, emoji: "🚰", tag: "REUTILIZABLE", description: "Botella para tu día a día", detail: "Accesorio para transportar agua. Consulta el material y las indicaciones de limpieza del fabricante." },
  { id: 8, name: "Shaker", category: "Accesorios", price: 6.90, emoji: "🥤", tag: "BÁSICO", description: "Mezclador para bebidas en polvo", detail: "Accesorio para preparar bebidas. Lava bien todas las piezas siguiendo las instrucciones del fabricante." }
];

const cart = {};
let activeCategory = "Todos";
let searchQuery = "";

const productsElement = document.querySelector("#products");
const modalRoot = document.querySelector("#modal-root");
const cartCount = document.querySelector("#cart-count");
const resultCount = document.querySelector("#result-count");
const searchInput = document.querySelector("#search");

function formatPrice(amount) {
  return amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function renderProducts() {
  const filtered = products.filter(product => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const searchable = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return matchesCategory && searchable.includes(searchQuery.toLowerCase());
  });

  resultCount.textContent = `${filtered.length} productos`;
  if (!filtered.length) {
    productsElement.innerHTML = '<p class="empty-results">No hay productos con esa búsqueda. Prueba con otra palabra.</p>';
    return;
  }

  productsElement.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-visual">
        <span class="product-tag">${product.tag}</span>
        <span class="product-emoji" aria-hidden="true">${product.emoji}</span>
      </div>
      <div class="product-body">
        <span class="muted">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="price">${formatPrice(product.price)}</div>
        <button class="button add-button" data-add="${product.id}" type="button">AÑADIR AL CARRITO +</button>
        <button class="chip details-button" data-details="${product.id}" type="button">Ver detalles</button>
      </div>
    </article>
  `).join("");
}

function updateCartCount() {
  cartCount.textContent = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
}

function openModal(content, asDrawer = false) {
  modalRoot.innerHTML = `<div class="modal-overlay" id="modal-overlay"><section class="${asDrawer ? "drawer" : "modal-box"}">${content}</section></div>`;
  modalRoot.querySelector(".close-button")?.addEventListener("click", closeModal);
  modalRoot.querySelector("#modal-overlay").addEventListener("click", event => {
    if (event.target.id === "modal-overlay") closeModal();
  });
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function showCart() {
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  const total = entries.reduce((sum, [id, quantity]) => {
    return sum + products.find(product => product.id === Number(id)).price * quantity;
  }, 0);
  const totalItems = entries.reduce((sum, [, quantity]) => sum + quantity, 0);

  const rows = entries.map(([id, quantity]) => {
    const product = products.find(item => item.id === Number(id));
    return `<div class="cart-row">
      <div><strong>${product.emoji} ${product.name}</strong>
        <div class="muted" style="margin-top:5px">${formatPrice(product.price)} / unidad</div>
        <div class="quantity">
          <button type="button" data-quantity="${id}" data-delta="-1" aria-label="Quitar una unidad">−</button>
          <span>${quantity}</span>
          <button type="button" data-quantity="${id}" data-delta="1" aria-label="Añadir una unidad">+</button>
        </div>
      </div>
      <strong>${formatPrice(product.price * quantity)}</strong>
    </div>`;
  }).join("");

  openModal(`
    <button class="close-button" type="button" aria-label="Cerrar">✕</button>
    <p class="eyebrow">TU SELECCIÓN</p>
    <h2 style="margin:12px 0 20px">Carrito (${totalItems})</h2>
    ${entries.length ? rows : '<div class="empty-results">🛒<p>Tu carrito está vacío.</p><button class="button" id="back-to-shop" type="button">Ver productos</button></div>'}
    ${entries.length ? `
      <div style="display:flex;justify-content:space-between;margin:22px 0;font-size:17px"><strong>Total estimado</strong><strong>${formatPrice(total)}</strong></div>
      <p class="notice">El envío no está calculado. Esta es una tienda de demostración; no se realizará ningún cobro.</p>
      <button class="button" id="checkout" style="width:100%;margin-top:12px" type="button">CONTINUAR AL PEDIDO →</button>` : ""}
  `, true);

  modalRoot.querySelector("#back-to-shop")?.addEventListener("click", closeModal);
  modalRoot.querySelectorAll("[data-quantity]").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.quantity;
      cart[id] = Math.max(0, (cart[id] || 0) + Number(button.dataset.delta));
      if (!cart[id]) delete cart[id];
      updateCartCount();
      showCart();
    });
  });
  modalRoot.querySelector("#checkout")?.addEventListener("click", showCheckout);
}

function showDetails(id) {
  const product = products.find(item => item.id === Number(id));
  openModal(`
    <button class="close-button" type="button" aria-label="Cerrar">✕</button>
    <div class="detail-emoji">${product.emoji}</div>
    <p class="eyebrow">${product.category}</p>
    <h2>${product.name}</h2>
    <p class="lead">${product.detail}</p>
    <div class="modal-price">${formatPrice(product.price)}</div>
    <p class="notice">Demo: las características y el etiquetado deben verificarse antes de comercializar este producto.</p>
    <button class="button" id="detail-add" style="width:100%;margin-top:12px" type="button">AÑADIR AL CARRITO</button>
  `);
  modalRoot.querySelector("#detail-add").addEventListener("click", () => {
    cart[id] = (cart[id] || 0) + 1;
    updateCartCount();
    showCart();
  });
}

function showCheckout() {
  openModal(`
    <button class="close-button" type="button" aria-label="Cerrar">✕</button>
    <div style="font-size:42px">🧾</div>
    <h2 style="margin:15px 0">Pedido de demostración</h2>
    <p class="lead">Tu carrito está listo para una futura integración de pago.</p>
    <p class="notice">No se ha realizado ningún cobro ni pedido real. Para activar compras necesitarás una pasarela de pago segura, gestión de pedidos, envíos, políticas de privacidad y condiciones legales.</p>
    <button class="button" id="return-shop" style="width:100%;margin-top:15px" type="button">Volver a la tienda</button>
  `);
  modalRoot.querySelector("#return-shop").addEventListener("click", closeModal);
}

function answerQuestion(question) {
  const text = question.toLowerCase();
  if (/compr|pedido|carrito|pago/.test(text)) {
    return "Pulsa “Añadir al carrito”, abre el carrito y revisa las cantidades. El botón de pedido solo muestra una demostración: los pagos reales todavía no están habilitados.";
  }
  if (/env[ií]|entrega/.test(text)) {
    return "Los plazos, costes de envío y devoluciones aún no están configurados. Una tienda real debe indicar las zonas de entrega, los plazos y las condiciones antes de pagar.";
  }
  if (/ingred|alérg|compos|etiquet/.test(text)) {
    return "Entra en “Ver detalles” de cada producto. Esta demo tiene descripciones generales, no un etiquetado real; verifica siempre los ingredientes y alérgenos del envase original.";
  }
  if (/prote|creatina|suplement|vitamina|tomar|dosis|menor|edad|salud/.test(text)) {
    return "La idoneidad depende de cada persona y de su salud. Los suplementos no son necesarios para todo el mundo. Si eres menor de edad, consulta con un profesional sanitario y un adulto responsable antes de utilizarlos.";
  }
  if (/hola|buenas/.test(text)) {
    return "¡Hola! Puedo explicarte cómo funciona el carrito, qué información debe tener cada ficha y cómo está organizada la tienda. ¿Qué necesitas saber?";
  }
  return "Puedo orientarte sobre el catálogo, las fichas de producto, el carrito y los pasos necesarios para habilitar pagos reales. Para dudas sobre salud o si un suplemento es adecuado para ti, consulta a un profesional sanitario.";
}

function showAssistant() {
  openModal(`
    <button class="close-button" type="button" aria-label="Cerrar">✕</button>
    <p class="eyebrow">ASISTENTE NUTRIVA</p>
    <h2>¿En qué te ayudo?</h2>
    <p class="muted">Respuestas informativas para orientarte por la tienda.</p>
    <div id="chat-log" class="chat-log"><div class="chat-bubble">¡Hola! 👋 Puedo ayudarte con el catálogo, ingredientes y el proceso de compra. ¿Qué quieres saber?</div></div>
    <div class="quick-questions">
      <button type="button" data-question="Cómo comprar">Cómo comprar</button>
      <button type="button" data-question="Ingredientes">Ingredientes</button>
      <button type="button" data-question="Proteína">Proteínas</button>
      <button type="button" data-question="Envíos">Envíos</button>
    </div>
    <form id="chat-form" class="chat-form">
      <input id="chat-input" class="search" placeholder="Escribe tu duda..." aria-label="Escribe tu duda" required>
      <button class="button" type="submit">Enviar</button>
    </form>
    <p class="notice" style="margin-top:12px">No sustituye el consejo de un profesional sanitario. No ofrecemos diagnósticos ni recomendaciones médicas personalizadas.</p>
  `);

  const log = modalRoot.querySelector("#chat-log");
  const input = modalRoot.querySelector("#chat-input");

  function sendQuestion(question) {
    const clean = question.trim();
    if (!clean) return;
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    userBubble.textContent = clean;
    const answerBubble = document.createElement("div");
    answerBubble.className = "chat-bubble";
    answerBubble.textContent = answerQuestion(clean);
    log.append(userBubble, answerBubble);
    log.scrollTop = log.scrollHeight;
    input.value = "";
    input.focus();
  }

  modalRoot.querySelector("#chat-form").addEventListener("submit", event => {
    event.preventDefault();
    sendQuestion(input.value);
  });
  modalRoot.querySelectorAll("[data-question]").forEach(button => {
    button.addEventListener("click", () => sendQuestion(button.dataset.question));
  });
}

document.querySelector("#open-cart").addEventListener("click", showCart);
document.querySelector("#open-assistant").addEventListener("click", showAssistant);
searchInput.addEventListener("input", event => {
  searchQuery = event.target.value;
  renderProducts();
});
document.querySelector("#filters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll("[data-category]").forEach(chip => {
    chip.classList.toggle("active", chip === button);
  });
  renderProducts();
});
productsElement.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const detailsButton = event.target.closest("[data-details]");
  if (addButton) {
    const id = addButton.dataset.add;
    cart[id] = (cart[id] || 0) + 1;
    updateCartCount();
    const originalText = addButton.textContent;
    addButton.textContent = "✓ AÑADIDO";
    window.setTimeout(() => {
      if (addButton.isConnected) addButton.textContent = originalText;
    }, 900);
  }
  if (detailsButton) showDetails(detailsButton.dataset.details);
});

renderProducts();
updateCartCount();
