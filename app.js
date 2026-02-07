const SHIPPING = 30;
const CART_KEY = "my_demo_cart_v1";

/* מוצרים + תמונות מתאימות (Unsplash לפי מילת חיפוש) */
const PRODUCTS = [
  // בגדים
  { id:"c1", name:"חולצת טי־שירט לבנה", category:"clothes", price:80,  imgQ:"white t-shirt" },
  { id:"c2", name:"מכנס ג׳ינס כחול",     category:"clothes", price:120, imgQ:"blue jeans" },
  { id:"c3", name:"קפוצ׳ון שחור",        category:"clothes", price:150, imgQ:"black hoodie" },
  { id:"c4", name:"שמלת קיץ",            category:"clothes", price:179, imgQ:"summer dress" },
  { id:"c5", name:"נעלי סניקרס",         category:"clothes", price:249, imgQ:"sneakers shoes" },
  { id:"c6", name:"כובע מצחייה",         category:"clothes", price:59,  imgQ:"baseball cap" },

  // מכשירים
  { id:"g1", name:"אוזניות אלחוטיות",    category:"gadgets", price:249, imgQ:"wireless headphones" },
  { id:"g2", name:"מטען מהיר USB-C",     category:"gadgets", price:79,  imgQ:"usb-c charger" },
  { id:"g3", name:"שעון חכם",            category:"gadgets", price:329, imgQ:"smartwatch" },
  { id:"g4", name:"רמקול בלוטות׳",       category:"gadgets", price:199, imgQ:"bluetooth speaker" },
  { id:"g5", name:"מקלדת אלחוטית",       category:"gadgets", price:189, imgQ:"wireless keyboard" },
  { id:"g6", name:"עכבר אלחוטי",         category:"gadgets", price:99,  imgQ:"wireless mouse" },
];

// תמונות יציבות (קבועות) לכל מוצר — עובד מצוין ב-GitHub Pages ובטלפון
const PRODUCT_IMAGES = {
  c1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=70",
  c2: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=70",
  c3: "https://images.unsplash.com/photo-1520975958225-5f61d92e99d2?auto=format&fit=crop&w=900&q=70",
  c4: "https://images.unsplash.com/photo-1520975682224-06d0f0c2f23b?auto=format&fit=crop&w=900&q=70",
  c5: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=70",
  c6: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=70",

  g1: "https://images.unsplash.com/photo-1518449082505-8a7f2b3a1f0b?auto=format&fit=crop&w=900&q=70",
  g2: "https://images.unsplash.com/photo-1583863788434-e58a36330d34?auto=format&fit=crop&w=900&q=70",
  g3: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=70",
  g4: "https://images.unsplash.com/photo-1512446816042-444d64126772?auto=format&fit=crop&w=900&q=70",
  g5: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=70",
  g6: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=70",
};

function imgUrl(product) {
  // product הוא אובייקט מוצר
  return PRODUCT_IMAGES[product.id] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=70";
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
        <img src="${imgUrl(p.imgQ)}" alt="${p.name}">
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
      return { id, name:p.name, price:p.price, qty, img:imgUrl(p) };

    }).filter(Boolean);

    wrap.innerHTML = lines.map(l => `
      <div class="cartItem">
        <img src="${imgUrl(p)}" alt="${p.name}">

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
