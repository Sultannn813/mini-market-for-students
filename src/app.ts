type Product = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  image: string;
  description?: string;
};

type CartItem = {
  productId: number;
  quantity: number;
};

type Delivery = "pickup" | "courier";

type Order = {
  customerName: string;
  email: string;
  deliveryType: Delivery;
  address?: string;
  comment?: string;
  items: { name: string; price: number; quantity: number }[];
  subtotal: number;
  deliveryCost: number;
  total: number;
};

const products: Product[] = [
  { id: 1, name: "Тетрадь", price: 500, inStock: true, image: "images/notebook.jpg", description: "Школьная тетрадь 48 листов" },
  { id: 2, name: "Ручка", price: 200, inStock: false, image: "src\\images(6).jpg", description: "Шариковая ручка синяя" },
  { id: 3, name: "Рюкзак", price: 8000, inStock: true, image: "images/backpack.jpg", description: "Школьный рюкзак с отделениями" },
  { id: 4, name: "Карандаш", price: 100, inStock: true, image: "src\\Карандаш.jpg", description: "Простой карандаш HB" },
  { id: 5, name: "Пенал", price: 2500, inStock: true, image: "images/case.jpg", description: "Пенал-книжка текстильный" },
  { id: 6, name: "Альбом", price: 700, inStock: true, image: "images/album.jpg", description: "Альбом для рисования 24 листа" }
];

let cart: CartItem[] = [];

const productsContainer = document.getElementById("products-container") as HTMLElement;
const noProductsMessage = document.getElementById("no-products-message") as HTMLElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const maxPriceInput = document.getElementById("max-price-input") as HTMLInputElement;
const inStockCheckbox = document.getElementById("in-stock-checkbox") as HTMLInputElement;
const applyFiltersBtn = document.getElementById("apply-filters-btn") as HTMLButtonElement;
const resetFiltersBtn = document.getElementById("reset-filters-btn") as HTMLButtonElement;

const cartItemsBody = document.getElementById("cart-items-body") as HTMLElement;
const emptyCartMessage = document.getElementById("empty-cart-message") as HTMLElement;
const subtotalAmountEl = document.getElementById("subtotal-amount") as HTMLElement;
const clearCartBtn = document.getElementById("clear-cart-btn") as HTMLButtonElement;
const cartCounterEl = document.getElementById("cart-counter") as HTMLElement;

const orderForm = document.getElementById("order-form") as HTMLFormElement;
const customerNameInput = document.getElementById("customer-name") as HTMLInputElement;
const customerEmailInput = document.getElementById("customer-email") as HTMLInputElement;
const deliveryTypeSelect = document.getElementById("delivery-type") as HTMLSelectElement;
const addressGroup = document.getElementById("address-group") as HTMLElement;
const customerAddressInput = document.getElementById("customer-address") as HTMLInputElement;
const customerCommentInput = document.getElementById("customer-comment") as HTMLTextAreaElement;
const confirmCheckbox = document.getElementById("confirm-checkbox") as HTMLInputElement;

const orderSubtotalEl = document.getElementById("order-subtotal") as HTMLElement;
const orderDeliveryCostEl = document.getElementById("order-delivery-cost") as HTMLElement;
const orderTotalEl = document.getElementById("order-total") as HTMLElement;
const formErrorMessage = document.getElementById("form-error-message") as HTMLElement;
const orderResult = document.getElementById("order-result") as HTMLElement;
const resultName = document.getElementById("result-name") as HTMLElement;
const resultItems = document.getElementById("result-items") as HTMLElement;
const resultTotal = document.getElementById("result-total") as HTMLElement;
const orderJsonOutput = document.getElementById("order-json-output") as HTMLElement;

function renderProducts(productsToRender: Product[]): void {
  productsContainer.innerHTML = "";
  if (productsToRender.length === 0) {
    noProductsMessage.classList.remove("hidden");
    return;
  }
  noProductsMessage.classList.add("hidden");

  productsToRender.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    img.className = "product-image";

    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.name;

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = `${product.price} ₸`;

    const desc = document.createElement("p");
    desc.className = "product-description";
    desc.textContent = product.description || "";

    const btn = document.createElement("button");
    btn.className = "btn btn-primary";
    if (product.inStock) {
      btn.textContent = "В корзину";
      btn.addEventListener("click", () => addToCart(product.id));
    } else {
      btn.textContent = "Нет в наличии";
      btn.disabled = true;
    }

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(desc);
    card.appendChild(btn);

    productsContainer.appendChild(card);
  });
}

function filterProducts(): void {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const maxPriceValue = maxPriceInput.value.trim();
  const inStockOnly = inStockCheckbox.checked;

  let maxPrice: number | null = null;
  if (maxPriceValue !== "") {
    maxPrice = Number(maxPriceValue);
    if (isNaN(maxPrice) || maxPrice < 0) {
      alert("Некорректное значение максимальной цены");
      return;
    }
  }

  const filtered = products.filter(product => {
    const matchesName = product.name.toLowerCase().includes(searchTerm);
    const matchesStock = inStockOnly ? product.inStock : true;
    const matchesPrice = maxPrice !== null ? product.price <= maxPrice : true;
    return matchesName && matchesStock && matchesPrice;
  });

  renderProducts(filtered);
}

function resetFilters(): void {
  searchInput.value = "";
  maxPriceInput.value = "";
  inStockCheckbox.checked = false;
  renderProducts(products);
}

function addToCart(productId: number): void {
  const product = products.find(p => p.id === productId);
  if (!product || !product.inStock) return;

  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  renderCart();
}

function removeFromCart(productId: number): void {
  cart = cart.filter(item => item.productId !== productId);
  renderCart();
}

function clearCart(): void {
  cart = [];
  renderCart();
}

function calculateSubtotal(): number {
  return cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function getTotalUnits(): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart(): void {
  cartItemsBody.innerHTML = "";
  const subtotal = calculateSubtotal();

  if (cart.length === 0) {
    emptyCartMessage.style.display = "block";
  } else {
    emptyCartMessage.style.display = "none";
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      const tr = document.createElement("tr");

      const tdName = document.createElement("td");
      tdName.textContent = product.name;

      const tdPrice = document.createElement("td");
      tdPrice.textContent = `${product.price} ₸`;

      const tdQty = document.createElement("td");
      tdQty.textContent = item.quantity.toString();

      const tdSum = document.createElement("td");
      tdSum.textContent = `${product.price * item.quantity} ₸`;

      const tdAction = document.createElement("td");
      const removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-danger";
      removeBtn.textContent = "Удалить";
      removeBtn.addEventListener("click", () => removeFromCart(item.productId));
      tdAction.appendChild(removeBtn);

      tr.appendChild(tdName);
      tr.appendChild(tdPrice);
      tr.appendChild(tdQty);
      tr.appendChild(tdSum);
      tr.appendChild(tdAction);

      cartItemsBody.appendChild(tr);
    });
  }

  subtotalAmountEl.textContent = subtotal.toString();
  cartCounterEl.textContent = getTotalUnits().toString();
  updateOrderTotals();
}

function updateOrderTotals(): void {
  const subtotal = calculateSubtotal();
  const deliveryType = deliveryTypeSelect.value as Delivery;
  const deliveryCost = deliveryType === "courier" ? 1000 : 0;
  const total = subtotal + deliveryCost;

  orderSubtotalEl.textContent = subtotal.toString();
  orderDeliveryCostEl.textContent = deliveryCost.toString();
  orderTotalEl.textContent = total.toString();
}

deliveryTypeSelect.addEventListener("change", () => {
  const deliveryType = deliveryTypeSelect.value as Delivery;
  if (deliveryType === "courier") {
    addressGroup.style.display = "flex";
    customerAddressInput.required = true;
  } else {
    addressGroup.style.display = "none";
    customerAddressInput.required = false;
    customerAddressInput.value = "";
  }
  updateOrderTotals();
});

orderForm.addEventListener("submit", (e: Event) => {
  e.preventDefault();
  formErrorMessage.textContent = "";
  formErrorMessage.classList.add("hidden");

  if (cart.length === 0) {
    formErrorMessage.textContent = "Корзина пуста";
    formErrorMessage.classList.remove("hidden");
    return;
  }

  const name = customerNameInput.value.trim();
  if (name.length < 2) {
    formErrorMessage.textContent = "Имя должно содержать минимум 2 символа";
    formErrorMessage.classList.remove("hidden");
    return;
  }

  const deliveryType = deliveryTypeSelect.value as Delivery;
  let address: string | undefined = undefined;

  if (deliveryType === "courier") {
    address = customerAddressInput.value.trim();
    if (!address) {
      formErrorMessage.textContent = "Введите адрес для курьерской доставки";
      formErrorMessage.classList.remove("hidden");
      return;
    }
  }

  if (!confirmCheckbox.checked) {
    formErrorMessage.textContent = "Необходимо подтвердить состав заказа";
    formErrorMessage.classList.remove("hidden");
    return;
  }

  const subtotal = calculateSubtotal();
  const deliveryCost = deliveryType === "courier" ? 1000 : 0;
  const total = subtotal + deliveryCost;

  const orderItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId)!;
    return {
      name: product.name,
      price: product.price,
      quantity: item.quantity
    };
  });

  const order: Order = {
    customerName: name,
    email: customerEmailInput.value.trim(),
    deliveryType,
    address,
    comment: customerCommentInput.value.trim() || undefined,
    items: orderItems,
    subtotal,
    deliveryCost,
    total
  };

  resultName.textContent = order.customerName;
  resultItems.innerHTML = "";
  order.items.forEach(i => {
    const p = document.createElement("p");
    p.textContent = `${i.name} - ${i.quantity} шт. по ${i.price} ₸`;
    resultItems.appendChild(p);
  });
  resultTotal.textContent = order.total.toString();
  orderJsonOutput.textContent = JSON.stringify(order, null, 2);

  orderForm.classList.add("hidden");
  orderResult.classList.remove("hidden");

  clearCart();
});

applyFiltersBtn.addEventListener("click", filterProducts);
resetFiltersBtn.addEventListener("click", resetFilters);
clearCartBtn.addEventListener("click", clearCart);

renderProducts(products);
renderCart();