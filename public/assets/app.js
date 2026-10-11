(() => {
  "use strict";

  const state = {
    user: null,
    config: {
      appName: "CashFlow",
      supportEmail: "gestontech@gmail.com",
      supportWhatsapp: "243993030390"
    },
    page: "dashboard",
    products: [],
    customers: [],
    sales: [],
    debts: [],
    reports: [],
    theme: "system"
  };

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const content = $("#content");
  const authView = $("#authView");
  const appView = $("#appView");
  const authMessage = $("#authMessage");

  const currency = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function money(value) {
    return currency.format(Number(value || 0));
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(
      String(value).replace(" ", "T")
    );

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString();
  }

  function setMessage(text, type = "") {
    if (!authMessage) return;

    authMessage.textContent = text || "";
    authMessage.className =
      `message ${type}`.trim();
  }

  async function api(
    url,
    options = {}
  ) {
    const config = {
      credentials: "same-origin",
      ...options,
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : {
              "Content-Type": "application/json"
            }),
        ...(options.headers || {})
      }
    };

    const response = await fetch(
      url,
      config
    );

    const contentType =
      response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error =
        typeof data === "object"
          ? data.error
          : data;

      throw new Error(
        error || "Une erreur est survenue."
      );
    }

    return data;
  }

  async function loadConfig() {
    try {
      const config =
        await api("/api/config");

      state.config = {
        ...state.config,
        ...config
      };
    } catch {
      // Les valeurs par défaut restent disponibles.
    }

    updateSupportLinks();
  }

  function updateSupportLinks() {
    const whatsapp =
      String(
        state.config.supportWhatsapp || ""
      ).replace(/\D/g, "");

    const email =
      state.config.supportEmail ||
      "gestontech@gmail.com";

    const whatsappURL =
      whatsapp
        ? `https://wa.me/${whatsapp}`
        : "#";

    const links = [
      $("#waAuth"),
      $("#waLink")
    ];

    links.forEach(link => {
      if (link) {
        link.href = whatsappURL;
      }
    });

    const mailLinks = [
      $("#mailAuth"),
      $("#mailLink")
    ];

    mailLinks.forEach(link => {
      if (link) {
        link.href =
          `mailto:${email}`;
      }
    });

    if ($("#mailLink")) {
      $("#mailLink").textContent = email;
    }
  }

  /* =====================================================
     THEME
  ===================================================== */

  function getSavedTheme() {
    return (
      localStorage.getItem(
        "cashflow-theme"
      ) || "system"
    );
  }

  function applyTheme() {
    state.theme = getSavedTheme();

    if (state.theme === "system") {
      document.documentElement.removeAttribute(
        "data-theme"
      );
      return;
    }

    document.documentElement.dataset.theme =
      state.theme;
  }

  function toggleTheme() {
    const current =
      state.theme === "system"
        ? (
            window.matchMedia &&
            window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches
              ? "dark"
              : "light"
          )
        : state.theme;

    const next =
      current === "dark"
        ? "light"
        : "dark";

    localStorage.setItem(
      "cashflow-theme",
      next
    );

    applyTheme();
  }

  /* =====================================================
     AUTH
  ===================================================== */

  function switchAuth(mode) {
    const login =
      $("#loginForm");

    const register =
      $("#registerForm");

    const tabs =
      $$(".tabs button");

    if (!login || !register) return;

    login.classList.toggle(
      "hidden",
      mode !== "login"
    );

    register.classList.toggle(
      "hidden",
      mode !== "register"
    );

    tabs.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.auth === mode
      );
    });

    setMessage("");
  }

  async function login(event) {
    event.preventDefault();

    const form =
      new FormData(event.currentTarget);

    setMessage(
      "Connexion en cours..."
    );

    try {
      const result =
        await api(
          "/api/auth/login",
          {
            method: "POST",
            body: JSON.stringify(
              Object.fromEntries(form)
            )
          }
        );

      state.user = result.user;

      setMessage(
        "Connexion réussie.",
        "success"
      );

      showApp();

      await loadUserData();

      navigate("dashboard");
    } catch (error) {
      setMessage(
        error.message,
        "error"
      );
    }
  }

  async function register(event) {
    event.preventDefault();

    const form =
      new FormData(event.currentTarget);

    const data =
      Object.fromEntries(form);

    setMessage(
      "Création du compte..."
    );

    try {
      const result =
        await api(
          "/api/auth/register",
          {
            method: "POST",
            body: JSON.stringify(data)
          }
        );

      state.user = result.user;

      setMessage(
        "Compte créé avec succès.",
        "success"
      );

      showApp();

      await loadUserData();

      navigate("dashboard");
    } catch (error) {
      setMessage(
        error.message,
        "error"
      );
    }
  }

  async function logout() {
    try {
      await api(
        "/api/auth/logout",
        {
          method: "POST"
        }
      );
    } catch {
      // Même en cas d'erreur réseau,
      // on remet l'interface à zéro.
    }

    state.user = null;

    appView.classList.add("hidden");
    authView.classList.remove("hidden");

    switchAuth("login");
    setMessage("");
  }

  async function checkSession() {
    try {
      const result =
        await api("/api/auth/me");

      if (result.user) {
        state.user = result.user;

        showApp();

        await loadUserData();

        navigate(
          localStorage.getItem(
            "cashflow-page"
          ) || "dashboard"
        );

        return;
      }
    } catch {
      // Non connecté.
    }

    authView.classList.remove("hidden");
    appView.classList.add("hidden");
  }

  function showApp() {
    authView.classList.add("hidden");
    appView.classList.remove("hidden");

    updateUserUI();
  }

  function updateUserUI() {
    if (!state.user) return;

    const shopLabel =
      $("#shopLabel");

    if (shopLabel) {
      shopLabel.textContent =
        state.user.shop_name ||
        "Ma boutique";
    }

    const avatarButton =
      $("#avatarBtn");

    if (avatarButton) {
      if (state.user.avatar) {
        avatarButton.innerHTML =
          `<img src="${escapeHTML(
            state.user.avatar
          )}" alt="Photo de profil">`;
      } else {
        avatarButton.textContent =
          (
            state.user.name ||
            "C"
          )
            .trim()
            .charAt(0)
            .toUpperCase();
      }
    }

    const adminNav =
      $("#adminNav");

    if (adminNav) {
      adminNav.classList.toggle(
        "hidden",
        state.user.role !== "admin"
      );
    }
  }

  /* =====================================================
     DATA
  ===================================================== */

  async function loadUserData() {
    if (!state.user) return;

    try {
      const [
        products,
        customers,
        sales,
        debts
      ] = await Promise.all([
        api("/api/products"),
        api("/api/customers"),
        api("/api/sales"),
        api("/api/debts")
      ]);

      state.products = products;
      state.customers = customers;
      state.sales = sales;
      state.debts = debts;
    } catch (error) {
      console.error(error);
    }

    updateUserUI();
  }

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const titles = {
    dashboard: "Tableau de bord",
    products: "Produits & stock",
    sales: "Ventes",
    customers: "Clients",
    debts: "Dettes",
    reports: "Rapports",
    subscription: "Abonnement",
    profile: "Mon profil",
    admin: "Administration"
  };

  async function navigate(page) {
    if (
      !state.user ||
      !content
    ) {
      return;
    }

    if (
      page === "admin" &&
      state.user.role !== "admin"
    ) {
      page = "dashboard";
    }

    state.page = page;

    localStorage.setItem(
      "cashflow-page",
      page
    );

    $$("#nav button").forEach(
      button => {
        button.classList.toggle(
          "active",
          button.dataset.page === page
        );
      }
    );

    const title =
      $("#pageTitle");

    if (title) {
      title.textContent =
        titles[page] ||
        "CashFlow";
    }

    content.innerHTML =
      `<div class="card empty">
        <div>
          <strong>Chargement...</strong>
          <span>Veuillez patienter.</span>
        </div>
      </div>`;

    switch (page) {
      case "dashboard":
        await renderDashboard();
        break;

      case "products":
        renderProducts();
        break;

      case "sales":
        renderSales();
        break;

      case "customers":
        renderCustomers();
        break;

      case "debts":
        renderDebts();
        break;

      case "reports":
        await renderReports();
        break;

      case "subscription":
        renderSubscription();
        break;

      case "profile":
        renderProfile();
        break;

      case "admin":
        await renderAdmin();
        break;

      default:
        await renderDashboard();
    }
  }

  /* =====================================================
     DASHBOARD
  ===================================================== */

  async function renderDashboard() {
    try {
      const data =
        await api("/api/dashboard");

      const plan =
        state.user.plan === "elite"
          ? "Élite"
          : state.user.plan === "pro"
          ? "Pro"
          : "Gratuit";

      content.innerHTML = `
        <div class="page-head">
          <div>
            <span class="eyebrow">BONJOUR</span>
            <h2>${escapeHTML(
              state.user.name
            )}</h2>
            <p>
              Voici l'état actuel de votre activité.
            </p>
          </div>

          <div class="page-actions">
            <button
              class="primary"
              data-action="new-sale"
            >
              Nouvelle vente
            </button>
          </div>
        </div>

        <div class="card-grid">

          <div class="card stat-card">
            <div class="stat-label">
              Ventes aujourd'hui
            </div>
            <div class="stat-value">
              ${money(data.today.total)}
            </div>
            <div class="stat-meta">
              ${data.today.count} vente(s)
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-label">
              Ventes du mois
            </div>
            <div class="stat-value">
              ${money(data.month.total)}
            </div>
            <div class="stat-meta">
              ${data.month.count} vente(s)
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-label">
              Stock disponible
            </div>
            <div class="stat-value">
              ${data.stock.units}
            </div>
            <div class="stat-meta">
              ${data.stock.low} produit(s) à surveiller
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-label">
              Dettes restantes
            </div>
            <div class="stat-value">
              ${money(data.debt.amount)}
            </div>
            <div class="stat-meta">
              À récupérer auprès des clients
            </div>
          </div>

        </div>

        <div class="content-grid">

          <div class="card">
            <div class="card-header">
              <h3>Dernières ventes</h3>
              <span>${escapeHTML(
                plan
              )}</span>
            </div>

            ${
              data.recent.length
                ? salesTable(data.recent)
                : emptyState(
                    "Aucune vente",
                    "Commencez votre première vente."
                  )
            }
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Votre abonnement</h3>
              <span>Plan actuel</span>
            </div>

            <div>
              <div class="stat-value">
                ${escapeHTML(plan)}
              </div>

              <p style="color:var(--muted);font-size:.82rem">
                ${
                  state.user.plan === "free"
                    ? "30 produits et 20 clients maximum."
                    : "Fonctionnalités professionnelles activées."
                }
              </p>

              <button
                class="secondary"
                data-action="subscription"
              >
                Voir les offres
              </button>
            </div>
          </div>

        </div>
      `;
    } catch (error) {
      content.innerHTML =
        errorState(error.message);
    }
  }

  function salesTable(rows) {
    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Paiement</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td>#${row.id}</td>
                <td>${formatDate(
                  row.created_at
                )}</td>
                <td>${money(
                  row.total
                )}</td>
                <td>
                  <span class="badge">
                    ${escapeHTML(
                      row.payment_method || "cash"
                    )}
                  </span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  /* =====================================================
     PRODUCTS
  ===================================================== */

  function renderProducts() {
    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">INVENTAIRE</span>
          <h2>Produits & stock</h2>
          <p>
            Gérez vos produits et surveillez votre stock.
          </p>
        </div>

        <div class="page-actions">
          <button
            class="primary"
            data-action="add-product"
          >
            Ajouter un produit
          </button>
        </div>
      </div>

      <div class="card">
        ${
          state.products.length
            ? `
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>SKU</th>
                      <th>Prix</th>
                      <th>Stock</th>
                      <th>État</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${state.products.map(
                      product => `
                        <tr>
                          <td>
                            <strong>
                              ${escapeHTML(
                                product.name
                              )}
                            </strong>
                          </td>

                          <td>
                            ${escapeHTML(
                              product.sku || "—"
                            )}
                          </td>

                          <td>
                            ${money(
                              product.price
                            )}
                          </td>

                          <td>
                            ${product.stock}
                          </td>

                          <td>
                            ${
                              Number(product.stock) <=
                              Number(product.min_stock)
                                ? `
                                  <span class="badge warning">
                                    Stock faible
                                  </span>
                                `
                                : `
                                  <span class="badge">
                                    Disponible
                                  </span>
                                `
                            }
                          </td>

                          <td>
                            <button
                              class="secondary"
                              data-action="edit-product"
                              data-id="${product.id}"
                            >
                              Modifier
                            </button>

                            <button
                              class="secondary danger"
                              data-action="delete-product"
                              data-id="${product.id}"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      `
                    ).join("")}
                  </tbody>
                </table>
              </div>
            `
            : emptyState(
                "Aucun produit",
                "Ajoutez votre premier produit."
              )
        }
      </div>
    `;
  }

  function productForm(product = null) {
    const editing =
      Boolean(product);

    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">PRODUIT</span>
          <h2>
            ${editing
              ? "Modifier le produit"
              : "Nouveau produit"}
          </h2>
          <p>
            Enregistrez les informations du produit.
          </p>
        </div>
      </div>

      <div class="card">

        <form
          id="productForm"
          class="form-grid"
        >

          <div class="field">
            <label>
              Nom
              <input
                name="name"
                required
                value="${escapeHTML(
                  product?.name || ""
                )}"
                placeholder="Ex. Riz 25 kg"
              >
            </label>
          </div>

          <div class="field">
            <label>
              SKU
              <input
                name="sku"
                value="${escapeHTML(
                  product?.sku || ""
                )}"
                placeholder="REF-001"
              >
            </label>
          </div>

          <div class="field">
            <label>
              Prix
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                value="${product?.price ?? ""}"
              >
            </label>
          </div>

          <div class="field">
            <label>
              Stock
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                value="${product?.stock ?? 0}"
              >
            </label>
          </div>

          <div class="field">
            <label>
              Seuil d'alerte
              <input
                name="min_stock"
                type="number"
                min="0"
                step="1"
                value="${product?.min_stock ?? 0}"
              >
            </label>
          </div>

          <div class="form-actions full">
            <button
              type="button"
              class="secondary"
              data-action="products"
            >
              Annuler
            </button>

            <button
              type="submit"
              class="primary"
            >
              ${
                editing
                  ? "Enregistrer"
                  : "Ajouter"
              }
            </button>
          </div>

        </form>
      </div>
    `;

    $("#productForm")
      ?.addEventListener(
        "submit",
        event =>
          saveProduct(
            event,
            product
          )
      );
  }

  async function saveProduct(
    event,
    product
  ) {
    event.preventDefault();

    const data =
      Object.fromEntries(
        new FormData(
          event.currentTarget
        )
      );

    data.price =
      Number(data.price);

    data.stock =
      Number(data.stock);

    data.min_stock =
      Number(data.min_stock || 0);

    try {
      await api(
        product
          ? `/api/products/${product.id}`
          : "/api/products",
        {
          method:
            product
              ? "PUT"
              : "POST",
          body: JSON.stringify(data)
        }
      );

      state.products =
        await api("/api/products");

      navigate("products");
    } catch (error) {
      alert(error.message);
    }
  }

  async function deleteProduct(id) {
    const product =
      state.products.find(
        item => Number(item.id) === Number(id)
      );

    if (!product) return;

    if (
      !confirm(
        `Supprimer "${product.name}" ?`
      )
    ) {
      return;
    }

    try {
      await api(
        `/api/products/${id}`,
        {
          method: "DELETE"
        }
      );

      state.products =
        await api("/api/products");

      renderProducts();
    } catch (error) {
      alert(error.message);
    }
  }

  /* =====================================================
     SALES
  ===================================================== */

  function renderSales() {
    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">VENTES</span>
          <h2>Historique des ventes</h2>
          <p>
            Toutes vos ventes récentes.
          </p>
        </div>

        <div class="page-actions">
          <button
            class="secondary"
            data-action="export-csv"
          >
            Export CSV
          </button>

          <button
            class="secondary"
            data-action="export-pdf"
          >
            Export PDF
          </button>

          <button
            class="primary"
            data-action="new-sale"
          >
            Nouvelle vente
          </button>
        </div>
      </div>

      <div class="card">
        ${
          state.sales.length
            ? `
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Total</th>
                      <th>Paiement</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${state.sales.map(
                      sale => `
                        <tr>
                          <td>#${sale.id}</td>
                          <td>
                            ${formatDate(
                              sale.created_at
                            )}
                          </td>
                          <td>
                            ${escapeHTML(
                              sale.customer_name ||
                              "Comptant"
                            )}
                          </td>
                          <td>
                            <strong>
                              ${money(
                                sale.total
                              )}
                            </strong>
                          </td>
                          <td>
                            <span class="badge">
                              ${escapeHTML(
                                sale.payment_method
                              )}
                            </span>
                          </td>
                        </tr>
                      `
                    ).join("")}
                  </tbody>
                </table>
              </div>
            `
            : emptyState(
                "Aucune vente",
                "Votre historique apparaîtra ici."
              )
        }
      </div>
    `;
  }

  function newSale() {
    if (!state.products.length) {
      alert(
        "Ajoutez d'abord au moins un produit."
      );
      navigate("products");
      return;
    }

    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">CAISSE</span>
          <h2>Nouvelle vente</h2>
          <p>
            Sélectionnez les produits vendus.
          </p>
        </div>
      </div>

      <div class="card">

        <form id="saleForm">

          <div id="saleItems"></div>

          <div class="form-grid">

            <div class="field">
              <label>
                Client
                <select name="customer_id">
                  <option value="">
                    Client comptant
                  </option>

                  ${state.customers.map(
                    customer => `
                      <option value="${customer.id}">
                        ${escapeHTML(
                          customer.name
                        )}
                      </option>
                    `
                  ).join("")}
                </select>
              </label>
            </div>

            <div class="field">
              <label>
                Méthode de paiement
                <select name="payment_method">
                  <option value="cash">
                    Espèces
                  </option>
                  <option value="mobile_money">
                    Mobile Money
                  </option>
                  <option value="card">
                    Carte
                  </option>
                  <option value="transfer">
                    Virement
                  </option>
                </select>
              </label>
            </div>

            <div class="field full">
              <label>
                Note
                <textarea
                  name="note"
                  placeholder="Note facultative"
                ></textarea>
              </label>
            </div>

          </div>

          <div
            id="saleTotal"
            style="
              margin-top:20px;
              font-size:1.5rem;
              font-weight:850;
              text-align:right;
            "
          >
            Total : 0.00
          </div>

          <div class="form-actions">

            <button
              type="button"
              class="secondary"
              data-action="sales"
            >
              Annuler
            </button>

            <button
              type="submit"
              class="primary"
            >
              Enregistrer la vente
            </button>

          </div>

        </form>
      </div>
    `;

    addSaleRow();

    $("#saleForm")
      ?.addEventListener(
        "submit",
        submitSale
      );
  }

  function addSaleRow() {
    const container =
      $("#saleItems");

    if (!container) return;

    const row =
      document.createElement("div");

    row.className =
      "sale-row";

    row.style.display =
      "grid";

    row.style.gridTemplateColumns =
      "minmax(0,1fr) 100px 120px 45px";

    row.style.gap =
      "10px";

    row.style.marginBottom =
      "10px";

    row.innerHTML = `
      <select
        class="sale-product"
        required
      >
        <option value="">
          Sélectionner un produit
        </option>

        ${state.products.map(
          product => `
            <option
              value="${product.id}"
              data-price="${product.price}"
            >
              ${escapeHTML(
                product.name
              )}
              — ${money(
                product.price
              )}
              — stock ${product.stock}
            </option>
          `
        ).join("")}
      </select>

      <input
        class="sale-quantity"
        type="number"
        min="1"
        value="1"
        required
      >

      <div
        class="sale-subtotal"
        style="
          display:flex;
          align-items:center;
          justify-content:flex-end;
          font-weight:750;
        "
      >
        0.00
      </div>

      <button
        type="button"
        class="secondary"
        data-remove-sale-row
      >
        ×
      </button>
    `;

    container.appendChild(row);

    row
      .querySelector(
        ".sale-product"
      )
      ?.addEventListener(
        "change",
        updateSaleTotal
      );

    row
      .querySelector(
        ".sale-quantity"
      )
      ?.addEventListener(
        "input",
        updateSaleTotal
      );

    row
      .querySelector(
        "[data-remove-sale-row]"
      )
      ?.addEventListener(
        "click",
        () => {
          row.remove();

          if (
            !$("#saleItems")
              .children.length
          ) {
            addSaleRow();
          }

          updateSaleTotal();
        }
      );

    updateSaleTotal();
  }

  function updateSaleTotal() {
    let total = 0;

    $$(".sale-row").forEach(
      row => {
        const select =
          $(".sale-product", row);

        const quantity =
          Number(
            $(".sale-quantity", row)
              ?.value || 0
          );

        const option =
          select?.selectedOptions[0];

        const price =
          Number(
            option?.dataset.price || 0
          );

        const subtotal =
          price * quantity;

        total += subtotal;

        const output =
          $(".sale-subtotal", row);

        if (output) {
          output.textContent =
            money(subtotal);
        }
      }
    );

    const totalNode =
      $("#saleTotal");

    if (totalNode) {
      totalNode.textContent =
        `Total : ${money(total)}`;
    }
  }

  async function submitSale(event) {
    event.preventDefault();

    const rows =
      $$(".sale-row");

    const items = [];

    for (const row of rows) {
      const product =
        $(".sale-product", row);

      const quantity =
        Number(
          $(".sale-quantity", row)
            ?.value || 0
        );

      if (
        !product?.value ||
        quantity <= 0
      ) {
        alert(
          "Sélectionnez un produit et une quantité valide."
        );
        return;
      }

      items.push({
        product_id:
          Number(product.value),
        quantity
      });
    }

    const form =
      new FormData(
        event.currentTarget
      );

    const data = {
      items,
      customer_id:
        form.get("customer_id")
          ? Number(
              form.get("customer_id")
            )
          : null,
      payment_method:
        form.get("payment_method"),
      note:
        form.get("note") || ""
    };

    try {
      await api(
        "/api/sales",
        {
          method: "POST",
          body: JSON.stringify(data)
        }
      );

      await loadUserData();

      navigate("sales");
    } catch (error) {
      alert(error.message);
    }
  }

  /* =====================================================
     CUSTOMERS
  ===================================================== */

  function renderCustomers() {
    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">CLIENTS</span>
          <h2>Clients</h2>
          <p>
            Gérez vos clients et leurs informations.
          </p>
        </div>

        <button
          class="primary"
          data-action="add-customer"
        >
          Ajouter un client
        </button>
      </div>

      <div class="card">
        ${
          state.customers.length
            ? `
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Téléphone</th>
                      <th>E-mail</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${state.customers.map(
                      customer => `
                        <tr>
                          <td>
                            <strong>
                              ${escapeHTML(
                                customer.name
                              )}
                            </strong>
                          </td>

                          <td>
                            ${escapeHTML(
                              customer.phone || "—"
                            )}
                          </td>

                          <td>
                            ${escapeHTML(
                              customer.email || "—"
                            )}
                          </td>

                          <td>
                            <button
                              class="secondary danger"
                              data-action="delete-customer"
                              data-id="${customer.id}"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      `
                    ).join("")}
                  </tbody>
                </table>
              </div>
            `
            : emptyState(
                "Aucun client",
                "Ajoutez votre premier client."
              )
        }
      </div>
    `;
  }

  function customerForm() {
    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">CLIENT</span>
          <h2>Nouveau client</h2>
          <p>
            Ajoutez les coordonnées de votre client.
          </p>
        </div>
      </div>

      <div class="card">
        <form
          id="customerForm"
          class="form-grid"
        >

          <div class="field">
            <label>
              Nom
              <input
                name="name"
                required
                placeholder="Nom du client"
              >
            </label>
          </div>

          <div class="field">
            <label>
              Téléphone
              <input
                name="phone"
                placeholder="+243..."
              >
            </label>
          </div>

          <div class="field">
            <label>
              E-mail
              <input
                name="email"
                type="email"
                placeholder="client@example.com"
              >
            </label>
          </div>

          <div class="form-actions full">
            <button
              type="button"
              class="secondary"
              data-action="customers"
            >
              Annuler
            </button>

            <button
              type="submit"
              class="primary"
            >
              Ajouter
            </button>
          </div>

        </form>
      </div>
    `;

    $("#customerForm")
      ?.addEventListener(
        "submit",
        async event => {
          event.preventDefault();

          const data =
            Object.fromEntries(
              new FormData(
                event.currentTarget
              )
            );

          try {
            await api(
              "/api/customers",
              {
                method: "POST",
                body:
                  JSON.stringify(data)
              }
            );

            state.customers =
              await api(
                "/api/customers"
              );

            navigate("customers");
          } catch (error) {
            alert(error.message);
          }
        }
      );
  }

  async function deleteCustomer(id) {
    const customer =
      state.customers.find(
        item =>
          Number(item.id) ===
          Number(id)
      );

    if (!customer) return;

    if (
      !confirm(
        `Supprimer "${customer.name}" ?`
      )
    ) {
      return;
    }

    try {
      await api(
        `/api/customers/${id}`,
        {
          method: "DELETE"
        }
      );

      state.customers =
        await api(
          "/api/customers"
        );

      renderCustomers();
    } catch (error) {
      alert(error.message);
    }
  }

  /* =====================================================
     DEBTS
  ===================================================== */

  function renderDebts() {
    const total =
      state.debts.reduce(
        (sum, debt) =>
          sum +
          Number(
            debt.remaining || 0
          ),
        0
      );

    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">CRÉDIT</span>
          <h2>Dettes clients</h2>
          <p>
            Suivez les montants à récupérer.
          </p>
        </div>

        <div class="page-actions">
          <span class="badge warning">
            Total restant : ${money(total)}
          </span>

          <button
            class="primary"
            data-action="add-debt"
          >
            Ajouter une dette
          </button>
        </div>
      </div>

      <div class="card">
        ${
          state.debts.length
            ? `
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Montant</th>
                      <th>Payé</th>
                      <th>Restant</th>
                      <th>État</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${state.debts.map(
                      debt => `
                        <tr>
                          <td>
                            ${escapeHTML(
                              debt.customer_name ||
                              "Client"
                            )}
                          </td>

                          <td>
                            ${money(
                              debt.amount
                            )}
                          </td>

                          <td>
                            ${money(
                              debt.paid
                            )}
                          </td>

                          <td>
                            <strong>
                              ${money(
                                debt.remaining
                              )}
                            </strong>
                          </td>

                          <td>
                            ${
                              debt.status ===
                              "paid"
                                ? `
                                  <span class="badge">
                                    Payée
                                  </span>
                                `
                                : `
                                  <span class="badge warning">
                                    Ouverte
                                  </span>
                                `
                            }
                          </td>

                          <td>
                            ${
                              debt.status !==
                              "paid"
                                ? `
                                  <button
                                    class="secondary"
                                    data-action="pay-debt"
                                    data-id="${debt.id}"
                                  >
                                    Paiement
                                  </button>
                                `
                                : "—"
                            }
                          </td>
                        </tr>
                      `
                    ).join("")}
                  </tbody>
                </table>
              </div>
            `
            : emptyState(
                "Aucune dette",
                "Les dettes clients apparaîtront ici."
              )
        }
      </div>
    `;
  }

  function debtForm() {
    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">DETTE</span>
          <h2>Nouvelle dette</h2>
          <p>
            Enregistrez une dette client.
          </p>
        </div>
      </div>

      <div class="card">
        <form
          id="debtForm"
          class="form-grid"
        >

          <div class="field">
            <label>
              Client
              <select name="customer_id">
                <option value="">
                  Client
                </option>

                ${state.customers.map(
                  customer => `
                    <option value="${customer.id}">
                      ${escapeHTML(
                        customer.name
                      )}
                    </option>
                  `
                ).join("")}
              </select>
            </label>
          </div>

          <div class="field">
            <label>
              Montant
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
              >
            </label>
          </div>

          <div class="field full">
            <label>
              Note
              <textarea
                name="note"
                placeholder="Détails facultatifs"
              ></textarea>
            </label>
          </div>

          <div class="form-actions full">
            <button
              type="button"
              class="secondary"
              data-action="debts"
            >
              Annuler
            </button>

            <button
              type="submit"
              class="primary"
            >
              Enregistrer
            </button>
          </div>

        </form>
      </div>
    `;

    $("#debtForm")
      ?.addEventListener(
        "submit",
        async event => {
          event.preventDefault();

          const data =
            Object.fromEntries(
              new FormData(
                event.currentTarget
              )
            );

          data.amount =
            Number(data.amount);

          data.customer_id =
            data.customer_id
              ? Number(
                  data.customer_id
                )
              : null;

          try {
            await api(
              "/api/debts",
              {
                method: "POST",
                body:
                  JSON.stringify(data)
              }
            );

            state.debts =
              await api(
                "/api/debts"
              );

            navigate("debts");
          } catch (error) {
            alert(error.message);
          }
        }
      );
  }

  async function payDebt(id) {
    const debt =
      state.debts.find(
        item =>
          Number(item.id) ===
          Number(id)
      );

    if (!debt) return;

    const value =
      prompt(
        `Montant du paiement (reste ${money(
          debt.remaining
        )}) :`
      );

    if (value === null) return;

    const amount =
      Number(value);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      alert("Montant invalide.");
      return;
    }

    try {
      await api(
        `/api/debts/${id}/payment`,
        {
          method: "POST",
          body:
            JSON.stringify({
              amount
            })
        }
      );

      state.debts =
        await api(
          "/api/debts"
        );

      renderDebts();
    } catch (error) {
      alert(error.message);
    }
  }

  /* =====================================================
     REPORTS
  ===================================================== */

  async function renderReports() {
    try {
      state.reports =
        await api("/api/reports");

      const total =
        state.reports.reduce(
          (sum, row) =>
            sum +
            Number(row.total || 0),
          0
        );

      const count =
        state.reports.reduce(
          (sum, row) =>
            sum +
            Number(
              row.sales_count || 0
            ),
          0
        );

      content.innerHTML = `
        <div class="page-head">
          <div>
            <span class="eyebrow">ANALYSE</span>
            <h2>Rapports</h2>
            <p>
              Analyse des ventes sur les derniers jours.
            </p>
          </div>

          <div class="page-actions">
            <button
              class="secondary"
              data-action="export-csv"
            >
              Export CSV
            </button>

            <button
              class="secondary"
              data-action="export-pdf"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div class="card-grid">

          <div class="card stat-card">
            <div class="stat-label">
              Chiffre d'affaires
            </div>
            <div class="stat-value">
              ${money(total)}
            </div>
            <div class="stat-meta">
              Période affichée
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-label">
              Nombre de ventes
            </div>
            <div class="stat-value">
              ${count}
            </div>
            <div class="stat-meta">
              Transactions
            </div>
          </div>

        </div>

        <div class="card" style="margin-top:15px">

          <div class="card-header">
            <h3>Ventes par jour</h3>
            <span>31 derniers jours disponibles</span>
          </div>

          ${
            state.reports.length
              ? `
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Ventes</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      ${state.reports.map(
                        row => `
                          <tr>
                            <td>
                              ${formatDate(
                                row.day
                              )}
                            </td>
                            <td>
                              ${row.sales_count}
                            </td>
                            <td>
                              <strong>
                                ${money(
                                  row.total
                                )}
                              </strong>
                            </td>
                          </tr>
                        `
                      ).join("")}
                    </tbody>
                  </table>
                </div>
              `
              : emptyState(
                  "Aucune donnée",
                  "Créez des ventes pour générer vos rapports."
                )
          }

        </div>
      `;
    } catch (error) {
      content.innerHTML =
        errorState(error.message);
    }
  }

  /* =====================================================
     SUBSCRIPTION
  ===================================================== */

  function renderSubscription() {
    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">CASHFLOW</span>
          <h2>Choisissez votre plan</h2>
          <p>
            Évoluez avec votre activité.
          </p>
        </div>
      </div>

      <div class="pricing-grid">

        ${priceCard(
          "Gratuit",
          "0",
          "Pour démarrer",
          [
            "30 produits maximum",
            "20 clients maximum",
            "Ventes quotidiennes",
            "Stock local",
            "1 appareil",
            "Support e-mail"
          ],
          state.user.plan === "free"
        )}

        ${priceCard(
          "Pro",
          "5",
          "Pour les commerçants actifs",
          [
            "Produits illimités",
            "Clients illimités",
            "Suivi des ventes et du stock",
            "Dettes clients",
            "Rapports avancés",
            "Export CSV",
            "Sauvegarde cloud",
            "Support prioritaire"
          ],
          state.user.plan === "pro",
          true
        )}

        ${priceCard(
          "Élite",
          "12",
          "Pour une gestion avancée",
          [
            "Tout Pro",
            "Historique complet",
            "Gestion avancée des ventes",
            "Rapports détaillés",
            "Export CSV + PDF",
            "Multi-appareils",
            "Sauvegarde cloud",
            "Support prioritaire"
          ],
          state.user.plan === "elite"
        )}

      </div>

      <div class="card" style="margin-top:16px">
        <strong>Votre plan actuel :</strong>
        ${escapeHTML(
          state.user.plan === "elite"
            ? "Élite"
            : state.user.plan === "pro"
            ? "Pro"
            : "Gratuit"
        )}

        <p style="color:var(--muted);font-size:.8rem">
          Les paiements en ligne ne sont pas encore connectés.
          Cette page présente les offres disponibles.
        </p>
      </div>
    `;
  }

  function priceCard(
    name,
    price,
    description,
    features,
    active,
    featured = false
  ) {
    return `
      <div class="price-card ${
        featured ? "featured" : ""
      }">

        ${
          featured
            ? `
              <span class="badge">
                RECOMMANDÉ
              </span>
            `
            : ""
        }

        <h3 style="margin-top:${
          featured ? "12px" : "0"
        }">
          ${name}
        </h3>

        <div class="price">
          $${price}
          <small>/ mois</small>
        </div>

        <p style="
          color:var(--muted);
          font-size:.8rem;
        ">
          ${description}
        </p>

        <ul>
          ${features.map(
            feature =>
              `<li>${escapeHTML(
                feature
              )}</li>`
          ).join("")}
        </ul>

        <button
          class="${
            active
              ? "secondary"
              : featured
              ? "primary"
              : "secondary"
          }"
          ${
            active
              ? "disabled"
              : ""
          }
          data-action="plan-info"
        >
          ${
            active
              ? "Plan actuel"
              : "Choisir ce plan"
          }
        </button>

      </div>
    `;
  }

  /* =====================================================
     PROFILE
  ===================================================== */

  function renderProfile() {
    const initial =
      (
        state.user.name ||
        "C"
      )
        .trim()
        .charAt(0)
        .toUpperCase();

    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">COMPTE</span>
          <h2>Mon profil</h2>
          <p>
            Gérez vos informations personnelles.
          </p>
        </div>
      </div>

      <div class="card">

        <div class="profile-header">

          <div class="profile-avatar">
            ${
              state.user.avatar
                ? `
                  <img
                    src="${escapeHTML(
                      state.user.avatar
                    )}"
                    alt="Photo"
                  >
                `
                : initial
            }
          </div>

          <div class="profile-info">

            <h2>
              ${escapeHTML(
                state.user.name
              )}
            </h2>

            <p>
              ${escapeHTML(
                state.user.email
              )}
            </p>

            <label
              class="upload-button"
              style="cursor:pointer"
            >
              Changer la photo

              <input
                id="avatarInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
              >
            </label>

          </div>

        </div>

        <form
          id="profileForm"
          class="form-grid"
        >

          <div class="field">
            <label>
              Nom complet
              <input
                name="name"
                required
                value="${escapeHTML(
                  state.user.name || ""
                )}"
              >
            </label>
          </div>

          <div class="field">
            <label>
              E-mail
              <input
                value="${escapeHTML(
                  state.user.email || ""
                )}"
                disabled
              >
            </label>
          </div>

          <div class="field">
            <label>
              Téléphone
              <input
                name="phone"
                value="${escapeHTML(
                  state.user.phone || ""
                )}"
                placeholder="+243..."
              >
            </label>
          </div>

          <div class="field">
            <label>
              Nom de la boutique
              <input
                name="shop_name"
                value="${escapeHTML(
                  state.user.shop_name || ""
                )}"
              >
            </label>
          </div>

          <div class="form-actions full">
            <button
              type="submit"
              class="primary"
            >
              Enregistrer
            </button>
          </div>

        </form>

      </div>

      <div
        class="card"
        style="margin-top:15px"
      >
        <div class="card-header">
          <h3>Zone sensible</h3>
          <span>Suppression définitive</span>
        </div>

        <p style="
          color:var(--muted);
          font-size:.82rem;
        ">
          La suppression du compte efface vos données associées.
        </p>

        <button
          class="secondary danger"
          data-action="delete-account"
        >
          Supprimer mon compte
        </button>
      </div>
    `;

    $("#profileForm")
      ?.addEventListener(
        "submit",
        saveProfile
      );

    $("#avatarInput")
      ?.addEventListener(
        "change",
        uploadAvatar
      );
  }

  async function saveProfile(event) {
    event.preventDefault();

    const data =
      Object.fromEntries(
        new FormData(
          event.currentTarget
        )
      );

    try {
      const result =
        await api(
          "/api/profile",
          {
            method: "PUT",
            body:
              JSON.stringify(data)
          }
        );

      state.user =
        result.user;

      updateUserUI();

      alert(
        "Profil mis à jour."
      );

      renderProfile();
    } catch (error) {
      alert(error.message);
    }
  }

  async function uploadAvatar(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const form =
      new FormData();

    form.append(
      "avatar",
      file
    );

    try {
      const result =
        await api(
          "/api/profile/avatar",
          {
            method: "POST",
            body: form
          }
        );

      state.user =
        result.user;

      updateUserUI();

      renderProfile();
    } catch (error) {
      alert(error.message);
    }
  }

  async function deleteAccount() {
    const password =
      prompt(
        "Entrez votre mot de passe pour confirmer la suppression du compte :"
      );

    if (password === null) {
      return;
    }

    if (!password) {
      alert(
        "Le mot de passe est requis."
      );
      return;
    }

    if (
      !confirm(
        "Cette action est définitive. Continuer ?"
      )
    ) {
      return;
    }

    try {
      await api(
        "/api/account",
        {
          method: "DELETE",
          body:
            JSON.stringify({
              password
            })
        }
      );

      state.user = null;

      appView.classList.add(
        "hidden"
      );

      authView.classList.remove(
        "hidden"
      );

      switchAuth("login");

      alert(
        "Votre compte a été supprimé."
      );
    } catch (error) {
      alert(error.message);
    }
  }

  /* =====================================================
     ADMIN
  ===================================================== */

  async function renderAdmin() {
    if (
      state.user.role !== "admin"
    ) {
      navigate("dashboard");
      return;
    }

    try {
      const [
        stats,
        users
      ] = await Promise.all([
        api("/api/admin/stats"),
        api("/api/admin/users")
      ]);

      content.innerHTML = `
        <div class="page-head">
          <div>
            <span class="eyebrow">ADMIN</span>
            <h2>Administration</h2>
            <p>
              Gestion privée de CashFlow.
            </p>
          </div>
        </div>

        <div class="card-grid">

          <div class="card stat-card">
            <div class="stat-label">
              Utilisateurs
            </div>
            <div class="stat-value">
              ${stats.users}
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-label">
              Utilisateurs actifs
            </div>
            <div class="stat-value">
              ${stats.active}
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-label">
              Nombre de ventes
            </div>
            <div class="stat-value">
              ${stats.sales.count}
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-label">
              Chiffre d'affaires
            </div>
            <div class="stat-value">
              ${money(
                stats.sales.total
              )}
            </div>
          </div>

        </div>

        <div
          class="card"
          style="margin-top:15px"
        >

          <div class="card-header">
            <h3>Utilisateurs</h3>
            <span>Accès administrateur</span>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>E-mail</th>
                  <th>Plan</th>
                  <th>Rôle</th>
                  <th>État</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                ${users.map(
                  user => `
                    <tr>
                      <td>
                        ${escapeHTML(
                          user.name
                        )}
                      </td>

                      <td>
                        ${escapeHTML(
                          user.email
                        )}
                      </td>

                      <td>
                        <select
                          data-admin-plan
                          data-id="${user.id}"
                        >
                          ${[
                            "free",
                            "pro",
                            "elite"
                          ].map(
                            plan => `
                              <option
                                value="${plan}"
                                ${
                                  user.plan ===
                                  plan
                                    ? "selected"
                                    : ""
                                }
                              >
                                ${plan}
                              </option>
                            `
                          ).join("")}
                        </select>
                      </td>

                      <td>
                        ${
                          user.email.toLowerCase() ===
                          state.config.adminEmail
                            ? "admin"
                            : `
                              <select
                                data-admin-role
                                data-id="${user.id}"
                              >
                                <option
                                  value="user"
                                  ${
                                    user.role ===
                                    "user"
                                      ? "selected"
                                      : ""
                                  }
                                >
                                  user
                                </option>

                                <option
                                  value="admin"
                                  ${
                                    user.role ===
                                    "admin"
                                      ? "selected"
                                      : ""
                                  }
                                >
                                  admin
                                </option>
                              </select>
                            `
                        }
                      </td>

                      <td>
                        ${
                          user.active
                            ? `
                              <span class="badge">
                                Actif
                              </span>
                            `
                            : `
                              <span class="badge danger">
                                Désactivé
                              </span>
                            `
                        }
                      </td>

                      <td>
                        <button
                          class="secondary"
                          data-action="toggle-user"
                          data-id="${user.id}"
                          data-active="${
                            user.active
                          }"
                        >
                          ${
                            user.active
                              ? "Désactiver"
                              : "Activer"
                          }
                        </button>

                        ${
                          user.email.toLowerCase() !==
                          "gestontech@gmail.com"
                            ? `
                              <button
                                class="secondary danger"
                                data-action="admin-delete-user"
                                data-id="${user.id}"
                              >
                                Supprimer
                              </button>
                            `
                            : ""
                        }
                      </td>
                    </tr>
                  `
                ).join("")}
              </tbody>
            </table>
          </div>

        </div>
      `;

      $$("[data-admin-plan]")
        .forEach(select => {
          select.addEventListener(
            "change",
            () =>
              updateAdminUser(
                select.dataset.id
              )
          );
        });

      $$("[data-admin-role]")
        .forEach(select => {
          select.addEventListener(
            "change",
            () =>
              updateAdminUser(
                select.dataset.id
              )
          );
        });
    } catch (error) {
      content.innerHTML =
        errorState(error.message);
    }
  }

  async function updateAdminUser(id) {
    const plan =
      $(
        `[data-admin-plan][data-id="${id}"]`
      )?.value;

    const role =
      $(
        `[data-admin-role][data-id="${id}"]`
      )?.value;

    try {
      await api(
        `/api/admin/users/${id}`,
        {
          method: "PUT",
          body:
            JSON.stringify({
              plan,
              role
            })
        }
      );

      alert(
        "Utilisateur mis à jour."
      );

      renderAdmin();
    } catch (error) {
      alert(error.message);
    }
  }

  async function toggleUser(
    id,
    active
  ) {
    try {
      await api(
        `/api/admin/users/${id}`,
        {
          method: "PUT",
          body:
            JSON.stringify({
              active:
                !active
            })
        }
      );

      renderAdmin();
    } catch (error) {
      alert(error.message);
    }
  }

  async function adminDeleteUser(id) {
    if (
      !confirm(
        "Supprimer définitivement cet utilisateur ?"
      )
    ) {
      return;
    }

    try {
      await api(
        `/api/admin/users/${id}`,
        {
          method: "DELETE"
        }
      );

      renderAdmin();
    } catch (error) {
      alert(error.message);
    }
  }

  /* =====================================================
     HELPERS
  ===================================================== */

  function emptyState(
    title,
    text
  ) {
    return `
      <div class="empty">
        <div>
          <strong>
            ${escapeHTML(title)}
          </strong>

          <span>
            ${escapeHTML(text)}
          </span>
        </div>
      </div>
    `;
  }

  function errorState(
    text
  ) {
    return `
      <div class="card empty">
        <div>
          <strong>
            Impossible de charger cette page
          </strong>

          <span>
            ${escapeHTML(text)}
          </span>
        </div>
      </div>
    `;
  }

  function exportFile(
    type
  ) {
    const url =
      type === "pdf"
        ? "/api/export/sales.pdf"
        : "/api/export/sales.csv";

    window.location.href =
      url;
  }

  /* =====================================================
     GLOBAL EVENTS
  ===================================================== */

  document.addEventListener(
    "click",
    async event => {
      const authTab =
        event.target.closest(
          "[data-auth]"
        );

      if (authTab) {
        switchAuth(
          authTab.dataset.auth
        );
        return;
      }

      const navButton =
        event.target.closest(
          "[data-page]"
        );

      if (navButton) {
        navigate(
          navButton.dataset.page
        );
        return;
      }

      const action =
        event.target.closest(
          "[data-action]"
        );

      if (!action) return;

      const name =
        action.dataset.action;

      switch (name) {
        case "new-sale":
          newSale();
          break;

        case "sales":
          navigate("sales");
          break;

        case "products":
          navigate("products");
          break;

        case "customers":
          navigate("customers");
          break;

        case "debts":
          navigate("debts");
          break;

        case "subscription":
          navigate("subscription");
          break;

        case "add-product":
          productForm();
          break;

        case "edit-product": {
          const product =
            state.products.find(
              item =>
                Number(item.id) ===
                Number(
                  action.dataset.id
                )
            );

          if (product) {
            productForm(product);
          }

          break;
        }

        case "delete-product":
          await deleteProduct(
            action.dataset.id
          );
          break;

        case "add-customer":
          customerForm();
          break;

        case "delete-customer":
          await deleteCustomer(
            action.dataset.id
          );
          break;

        case "add-debt":
          debtForm();
          break;

        case "pay-debt":
          await payDebt(
            action.dataset.id
          );
          break;

        case "export-csv":
          exportFile("csv");
          break;

        case "export-pdf":
          exportFile("pdf");
          break;

        case "delete-account":
          await deleteAccount();
          break;

        case "toggle-user":
          await toggleUser(
            action.dataset.id,
            action.dataset.active ===
              "1" ||
              action.dataset.active ===
              "true"
          );
          break;

        case "admin-delete-user":
          await adminDeleteUser(
            action.dataset.id
          );
          break;

        case "plan-info":
          alert(
            "Le paiement en ligne sera disponible après connexion d'un fournisseur de paiement."
          );
          break;
      }
    }
  );

  $("#loginForm")
    ?.addEventListener(
      "submit",
      login
    );

  $("#registerForm")
    ?.addEventListener(
      "submit",
      register
    );

  $("#logout")
    ?.addEventListener(
      "click",
      logout
    );

  $("#themeBtn")
    ?.addEventListener(
      "click",
      toggleTheme
    );

  $("#avatarBtn")
    ?.addEventListener(
      "click",
      () => navigate("profile")
    );

  /* =====================================================
     LANGUAGE
  ===================================================== */

  function setupLanguage() {
    const saved =
      localStorage.getItem(
        "cashflow-lang"
      );

    const browser =
      (
        navigator.language ||
        "fr"
      ).slice(0, 2);

    const supported = [
      "fr",
      "en",
      "pt",
      "es"
    ];

    const language =
      saved ||
      (
        supported.includes(browser)
          ? browser
          : "fr"
      );

    document.documentElement.lang =
      language;
  }

  /* =====================================================
     START
  ===================================================== */

  async function start() {
    setupLanguage();

    applyTheme();

    switchAuth("login");

    await loadConfig();

    await checkSession();
  }

  start();
})();
