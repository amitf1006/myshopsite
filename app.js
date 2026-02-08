const SHIPPING = 30;
const CART_KEY = "my_demo_cart_v1";

/* מוצרים */
const PRODUCTS = [
  // בגדים
  { id:"c1", name:"חולצת טי־שירט לבנה", category:"clothes", price:80,  img:"images/tshirt.jpg" },
  { id:"c2", name:"מכנס ג׳ינס",          category:"clothes", price:120, img:"images/jeans.jpg" },
  { id:"c3", name:"קפוצ׳ון",              category:"clothes", price:150, img:"images/hoodie.jpg" },
  { id:"c4", name:"שמלת ערב ארוכה",             category:"clothes", price:179, img:"images/dress.png" },
  { id:"c5", name:"נעלי סניקרס",          category:"clothes", price:249, img:"images/sneakers.jpg" },
  { id:"c6", name:"כובע",                 category:"clothes", price:59,  img:"images/hat.jpg" },
  { id:"c7", name:"ז׳קט ג׳ינס",            category:"clothes", price:199, img:"images/jeansjacket.jpg" },
  { id:"c8", name:"שמלה ערב קצרה",             category:"clothes", price:169, img:"images/shortdress.jpg" },
  { id:"c9", name:"ג׳קט גברים",            category:"clothes", price:219, img:"images/manjacket.jpg" },

  // מכשירים
  { id:"g1", name:"אוזניות אלחוטיות",      category:"gadgets", price:249, img:"images/headphones.jpg" },
  { id:"g2", name:"מטען USB-C",             category:"gadgets", price:79,  img:"images/charge.jpg" },
  { id:"g3", name:"שעון חכם",               category:"gadgets", price:329, img:"images/watch.png" },
  { id:"g4", name:"רמקול אלחוטי",          category:"gadgets", price:199, img:"images/speakr.png" },
  { id:"g5", name:"מקלדת",                 category:"gadgets", price:189, img:"images/keyboard.jpg" },
  { id:"g6", name:"אוזניות אלחוטיות",       category:"gadgets", price:279, img:"images/headphonesbluetooth.jpg" },
];

/* ==== תמונות מובנות בקוד (SVG Data URL) – תמיד עובד ==== */
function escapeXml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function imgUrl(product) {
  const bg1 = product.category === "clothes" ? "#dbeafe" : "#dcfce7";
  const bg2 = product.category === "clothes" ? "#bfdbfe" : "#bbf7d0";
  const icon = product.category === "clothes" ? "👕" : "📱";
  const name = escapeXml(product.name);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="650">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="38%" text-anchor="middle" font-size="110">${icon}</text>
    <text x="50%" y="57%" text-anchor="middle"
          font-family="Arial" font-size="44" font-weight="700" fill="#111827">
      ${name}
    </text>
    <text x="50%" y="68%" text-anchor="middle"
          font-family="Arial" font-size="26" fill="#374151">
      תמונת דמו (מובנית בקוד)
    </text>
  </svg>`.trim();

  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function getProduct(id){
  return PRODUCTS.find(p => p.id === id);
}

/* עגלה: { [id]: qty } */
function readCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "{}"); }
  catch { return {}; }
}
function writeCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function cartCount(cart){
  return Object.values(cart).reduce((s,q)=>s+q,0);
}
function subtotal(cart){
  let sum = 0;
  for (const [id, qty] of Object.entries(cart)){
    const p = getProduct(id);
    if (p) sum += p.price * qty;
  }
  return sum;
}

/* ===== Header count ===== */
function updateCartCount(){
  const el = document.getElementById("cartCount");
  if (!el) return;
  el.textContent = String(cartCount(readCart()));
}

/* ===== Home page render ===== */
function renderHome(){
  const grid = document.getElementById("products");
  if (!grid) return;

  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");

  function apply(){
    const q = (searchInput?.value || "").trim().toLowerCase();
    const cat = categorySelect?.value || "all";

    const filtered = PRODUCTS.filter(p => {
      const matchQ = p.name.toLowerCase().includes(q);
      const matchCat = (cat === "all") ? true : (p.category === cat);
      return matchQ && matchCat;
    });

    grid.innerHTML = filtered.map(p => `
      <article class="productCard">
        <img src="${p.img}" alt="${p.name}">
        <div class="productBody">
          <h3 class="productName">${p.name}</h3>
          <div class="cat">${p.category === "clothes" ? "בגדים" : "מכשירים"}</div>
          <div class="metaRow">
            <div class="price">${p.price}₪</div>
            <button class="addBtn" type="button" data-add="${p.id}">הוספה לעגלה</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.getAttribute("data-add");
    const cart = readCart();
    cart[id] = (cart[id] || 0) + 1;
    writeCart(cart);
    updateCartCount();
  });

  searchInput?.addEventListener("input", apply);
  categorySelect?.addEventListener("change", apply);

  apply();
  updateCartCount();
}

/* ===== Cart page render ===== */
function renderCart(){
  const wrap = document.getElementById("cartItems");
  if (!wrap) return;

  const empty = document.getElementById("emptyCart");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const shippingEl = document.getElementById("shipping");
  const clearBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutMsg = document.getElementById("checkoutMsg");

  if (shippingEl) shippingEl.textContent = String(SHIPPING);

  function redraw(){
    const cart = readCart();
    const ids = Object.keys(cart);

    if (ids.length === 0){
      wrap.innerHTML = "";
      empty?.classList.remove("hidden");
      if (subtotalEl) subtotalEl.textContent = "0";
      if (totalEl) totalEl.textContent = String(SHIPPING);
      checkoutBtn?.setAttribute("disabled","disabled");
      return;
    }

    empty?.classList.add("hidden");
    checkoutBtn?.removeAttribute("disabled");

    const lines = ids.map(id => {
      const p = getProduct(id);
      const qty = cart[id];
      if (!p) return null;
      return { id, name:p.name, price:p.price, qty, img:p.img };
    }).filter(Boolean);

    wrap.innerHTML = lines.map(l => `
      <div class="cartItem">
        <img src="${l.img}" alt="${l.name}">
        <div>
          <div class="cartTop">
            <div>
              <h3 class="cartName">${l.name}</h3>
              <div class="cartMeta">
                <span>מחיר: <strong>${l.price}₪</strong></span>
                <span>סה״כ לפריט: <strong>${l.price * l.qty}₪</strong></span>
              </div>
            </div>
            <button class="btnDanger" type="button" data-remove="${l.id}">מחיקה</button>
          </div>

          <div class="qtyRow">
            <button class="qtyBtn" type="button" data-dec="${l.id}">−</button>
            <div class="qty">${l.qty}</div>
            <button class="qtyBtn" type="button" data-inc="${l.id}">+</button>
          </div>
        </div>
      </div>
    `).join("");

    const sub = subtotal(cart);
    if (subtotalEl) subtotalEl.textContent = String(sub);
    if (totalEl) totalEl.textContent = String(sub + SHIPPING);
  }

  wrap.addEventListener("click", (e) => {
    const cart = readCart();

    const inc = e.target.closest("[data-inc]");
    if (inc){
      const id = inc.getAttribute("data-inc");
      cart[id] = (cart[id] || 0) + 1;
      writeCart(cart);
      redraw();
      updateCartCount();
      return;
    }

    const dec = e.target.closest("[data-dec]");
    if (dec){
      const id = dec.getAttribute("data-dec");
      const next = (cart[id] || 0) - 1;
      if (next <= 0) delete cart[id];
      else cart[id] = next;
      writeCart(cart);
      redraw();
      updateCartCount();
      return;
    }

    const rm = e.target.closest("[data-remove]");
    if (rm){
      const id = rm.getAttribute("data-remove");
      delete cart[id];
      writeCart(cart);
      redraw();
      updateCartCount();
      return;
    }
  });

  clearBtn?.addEventListener("click", () => {
    writeCart({});
    checkoutMsg?.classList.add("hidden");
    redraw();
    updateCartCount();
  });

  checkoutBtn?.addEventListener("click", () => {
    const cart = readCart();
    const sub = subtotal(cart);
    const tot = sub + SHIPPING;
    if (checkoutMsg){
      checkoutMsg.classList.remove("hidden");
      checkoutMsg.textContent = `הזמנה דמו נוצרה 🎉 סה״כ לתשלום: ${tot}₪ (כולל משלוח ${SHIPPING}₪)`;
    }
  });

  redraw();
  updateCartCount();
}

/* הפעלה לפי הדף */
renderHome();
renderCart();
updateCartCount();
