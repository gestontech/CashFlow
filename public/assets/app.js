(() => {
  "use strict";

  const state = {
    user: null,
    config: {
      appName: "CashFlow",
      supportEmail: "gestontech@gmail.com",
      supportWhatsapp: "243993030390",
      adminEmail: "gestontech@gmail.com"
    },
    page: "dashboard",
    products: [],
    customers: [],
    sales: [],
    debts: [],
    reports: {
      from: "",
      to: "",
      rows: [],
      summary: {
        total: 0,
        count: 0
      }
    },
    theme: "system",
    language: "fr"
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

  const LANGUAGES = ["fr", "en", "pt", "es"];

  const translations = {
    fr: {
      dashboard: "Tableau de bord",
      products: "Produits & stock",
      sales: "Ventes",
      customers: "Clients",
      debts: "Dettes",
      reports: "Rapports",
      subscription: "Abonnement",
      profile: "Mon profil",
      admin: "Administration",
      loading: "Chargement...",
      wait: "Veuillez patienter.",
      hello: "BONJOUR",
      activity: "Voici l'état actuel de votre activité.",
      newSale: "Nouvelle vente",
      todaySales: "Ventes aujourd'hui",
      monthSales: "Ventes du mois",
      stock: "Stock disponible",
      remainingDebts: "Dettes restantes",
      recentSales: "Dernières ventes",
      currentPlan: "Plan actuel",
      seeOffers: "Voir les offres",
      inventory: "INVENTAIRE",
      manageProducts: "Gérez vos produits et surveillez votre stock.",
      addProduct: "Ajouter un produit",
      editProduct: "Modifier le produit",
      newProduct: "Nouveau produit",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      available: "Disponible",
      lowStock: "Stock faible",
      product: "Produit",
      sku: "SKU",
      price: "Prix",
      quantity: "Quantité",
      state: "État",
      actions: "Actions",
      salesHistory: "Historique des ventes",
      allRecentSales: "Toutes vos ventes récentes.",
      exportCSV: "Export CSV",
      exportPDF: "Export PDF",
      cashSale: "Client comptant",
      customer: "Client",
      payment: "Paiement",
      paymentMethod: "Méthode de paiement",
      cash: "Espèces",
      mobileMoney: "Mobile Money",
      card: "Carte",
      transfer: "Virement",
      note: "Note",
      saveSale: "Enregistrer la vente",
      clients: "CLIENTS",
      manageCustomers: "Gérez vos clients et leurs informations.",
      addCustomer: "Ajouter un client",
      newCustomer: "Nouveau client",
      name: "Nom",
      phone: "Téléphone",
      email: "E-mail",
      debtsTitle: "Dettes clients",
      manageDebts: "Suivez les montants à récupérer.",
      addDebt: "Ajouter une dette",
      newDebt: "Nouvelle dette",
      amount: "Montant",
      paid: "Payé",
      remaining: "Restant",
      open: "Ouverte",
      paidStatus: "Payée",
      paymentHistory: "Historique des paiements",
      makePayment: "Paiement",
      reportsTitle: "Rapports",
      reportsDescription: "Analysez vos ventes sur une période personnalisée.",
      from: "Du",
      to: "Au",
      apply: "Appliquer",
      revenue: "Chiffre d'affaires",
      transactions: "Transactions",
      salesPerDay: "Ventes par jour",
      account: "COMPTE",
      manageProfile: "Gérez vos informations personnelles.",
      changePhoto: "Changer la photo",
      fullName: "Nom complet",
      shopName: "Nom de la boutique",
      sensitiveArea: "Zone sensible",
      deleteAccount: "Supprimer mon compte",
      deleteAccountDescription:
        "La suppression du compte efface définitivement vos données associées.",
      choosePlan: "Choisissez votre plan",
      grow: "Évoluez avec votre activité.",
      recommended: "RECOMMANDÉ",
      currentPlanButton: "Plan actuel",
      choosePlanButton: "Choisir ce plan",
      paymentsUnavailable:
        "Les paiements en ligne ne sont pas encore connectés.",
      adminPrivate: "Gestion privée de CashFlow.",
      users: "Utilisateurs",
      activeUsers: "Utilisateurs actifs",
      role: "Rôle",
      activate: "Activer",
      deactivate: "Désactiver",
      noData: "Aucune donnée",
      noProducts: "Aucun produit",
      noCustomers: "Aucun client",
      noSales: "Aucune vente",
      noDebts: "Aucune dette",
      support: "Support",
      logout: "Se déconnecter",
      createAccount: "Créer un compte",
      login: "Connexion",
      success: "Opération réussie.",
      error: "Une erreur est survenue."
    },

    en: {
      dashboard: "Dashboard",
      products: "Products & stock",
      sales: "Sales",
      customers: "Customers",
      debts: "Debts",
      reports: "Reports",
      subscription: "Subscription",
      profile: "My profile",
      admin: "Administration",
      loading: "Loading...",
      wait: "Please wait.",
      hello: "HELLO",
      activity: "Here is the current state of your business.",
      newSale: "New sale",
      todaySales: "Today's sales",
      monthSales: "Monthly sales",
      stock: "Available stock",
      remainingDebts: "Outstanding debts",
      recentSales: "Recent sales",
      currentPlan: "Current plan",
      seeOffers: "View plans",
      inventory: "INVENTORY",
      manageProducts: "Manage your products and monitor your stock.",
      addProduct: "Add product",
      editProduct: "Edit product",
      newProduct: "New product",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      available: "Available",
      lowStock: "Low stock",
      product: "Product",
      sku: "SKU",
      price: "Price",
      quantity: "Quantity",
      state: "Status",
      actions: "Actions",
      salesHistory: "Sales history",
      allRecentSales: "All your recent sales.",
      exportCSV: "CSV export",
      exportPDF: "PDF export",
      cashSale: "Walk-in customer",
      customer: "Customer",
      payment: "Payment",
      paymentMethod: "Payment method",
      cash: "Cash",
      mobileMoney: "Mobile Money",
      card: "Card",
      transfer: "Transfer",
      note: "Note",
      saveSale: "Save sale",
      clients: "CUSTOMERS",
      manageCustomers: "Manage your customers and their information.",
      addCustomer: "Add customer",
      newCustomer: "New customer",
      name: "Name",
      phone: "Phone",
      email: "Email",
      debtsTitle: "Customer debts",
      manageDebts: "Track amounts to collect.",
      addDebt: "Add debt",
      newDebt: "New debt",
      amount: "Amount",
      paid: "Paid",
      remaining: "Remaining",
      open: "Open",
      paidStatus: "Paid",
      paymentHistory: "Payment history",
      makePayment: "Payment",
      reportsTitle: "Reports",
      reportsDescription: "Analyze your sales over a custom period.",
      from: "From",
      to: "To",
      apply: "Apply",
      revenue: "Revenue",
      transactions: "Transactions",
      salesPerDay: "Sales per day",
      account: "ACCOUNT",
      manageProfile: "Manage your personal information.",
      changePhoto: "Change photo",
      fullName: "Full name",
      shopName: "Shop name",
      sensitiveArea: "Sensitive area",
      deleteAccount: "Delete my account",
      deleteAccountDescription:
        "Deleting your account permanently removes your associated data.",
      choosePlan: "Choose your plan",
      grow: "Grow with your business.",
      recommended: "RECOMMENDED",
      currentPlanButton: "Current plan",
      choosePlanButton: "Choose this plan",
      paymentsUnavailable:
        "Online payments are not connected yet.",
      adminPrivate: "Private CashFlow administration.",
      users: "Users",
      activeUsers: "Active users",
      role: "Role",
      activate: "Activate",
      deactivate: "Deactivate",
      noData: "No data",
      noProducts: "No products",
      noCustomers: "No customers",
      noSales: "No sales",
      noDebts: "No debts",
      support: "Support",
      logout: "Log out",
      createAccount: "Create account",
      login: "Login",
      success: "Operation successful.",
      error: "An error occurred."
    },

    pt: {
      dashboard: "Painel",
      products: "Produtos e estoque",
      sales: "Vendas",
      customers: "Clientes",
      debts: "Dívidas",
      reports: "Relatórios",
      subscription: "Assinatura",
      profile: "Meu perfil",
      admin: "Administração",
      loading: "Carregando...",
      wait: "Aguarde.",
      hello: "OLÁ",
      activity: "Veja o estado atual da sua atividade.",
      newSale: "Nova venda",
      todaySales: "Vendas de hoje",
      monthSales: "Vendas do mês",
      stock: "Estoque disponível",
      remainingDebts: "Dívidas restantes",
      recentSales: "Vendas recentes",
      currentPlan: "Plano atual",
      seeOffers: "Ver planos",
      inventory: "ESTOQUE",
      manageProducts: "Gerencie seus produtos e acompanhe o estoque.",
      addProduct: "Adicionar produto",
      editProduct: "Editar produto",
      newProduct: "Novo produto",
      save: "Salvar",
      cancel: "Cancelar",
      delete: "Excluir",
      available: "Disponível",
      lowStock: "Estoque baixo",
      product: "Produto",
      sku: "SKU",
      price: "Preço",
      quantity: "Quantidade",
      state: "Estado",
      actions: "Ações",
      salesHistory: "Histórico de vendas",
      allRecentSales: "Todas as suas vendas recentes.",
      exportCSV: "Exportar CSV",
      exportPDF: "Exportar PDF",
      cashSale: "Cliente à vista",
      customer: "Cliente",
      payment: "Pagamento",
      paymentMethod: "Método de pagamento",
      cash: "Dinheiro",
      mobileMoney: "Mobile Money",
      card: "Cartão",
      transfer: "Transferência",
      note: "Nota",
      saveSale: "Salvar venda",
      clients: "CLIENTES",
      manageCustomers: "Gerencie seus clientes e informações.",
      addCustomer: "Adicionar cliente",
      newCustomer: "Novo cliente",
      name: "Nome",
      phone: "Telefone",
      email: "E-mail",
      debtsTitle: "Dívidas de clientes",
      manageDebts: "Acompanhe os valores a receber.",
      addDebt: "Adicionar dívida",
      newDebt: "Nova dívida",
      amount: "Valor",
      paid: "Pago",
      remaining: "Restante",
      open: "Aberta",
      paidStatus: "Paga",
      paymentHistory: "Histórico de pagamentos",
      makePayment: "Pagamento",
      reportsTitle: "Relatórios",
      reportsDescription: "Analise suas vendas em um período personalizado.",
      from: "De",
      to: "Até",
      apply: "Aplicar",
      revenue: "Faturamento",
      transactions: "Transações",
      salesPerDay: "Vendas por dia",
      account: "CONTA",
      manageProfile: "Gerencie suas informações pessoais.",
      changePhoto: "Alterar foto",
      fullName: "Nome completo",
      shopName: "Nome da loja",
      sensitiveArea: "Área sensível",
      deleteAccount: "Excluir minha conta",
      deleteAccountDescription:
        "A exclusão da conta remove permanentemente seus dados.",
      choosePlan: "Escolha seu plano",
      grow: "Cresça com seu negócio.",
      recommended: "RECOMENDADO",
      currentPlanButton: "Plano atual",
      choosePlanButton: "Escolher este plano",
      paymentsUnavailable:
        "Os pagamentos online ainda não estão conectados.",
      adminPrivate: "Administração privada do CashFlow.",
      users: "Usuários",
      activeUsers: "Usuários ativos",
      role: "Função",
      activate: "Ativar",
      deactivate: "Desativar",
      noData: "Sem dados",
      noProducts: "Nenhum produto",
      noCustomers: "Nenhum cliente",
      noSales: "Nenhuma venda",
      noDebts: "Nenhuma dívida",
      support: "Suporte",
      logout: "Sair",
      createAccount: "Criar conta",
      login: "Entrar",
      success: "Operação concluída.",
      error: "Ocorreu um erro."
    },

    es: {
      dashboard: "Panel",
      products: "Productos y stock",
      sales: "Ventas",
      customers: "Clientes",
      debts: "Deudas",
      reports: "Informes",
      subscription: "Suscripción",
      profile: "Mi perfil",
      admin: "Administración",
      loading: "Cargando...",
      wait: "Espere.",
      hello: "HOLA",
      activity: "Este es el estado actual de su actividad.",
      newSale: "Nueva venta",
      todaySales: "Ventas de hoy",
      monthSales: "Ventas del mes",
      stock: "Stock disponible",
      remainingDebts: "Deudas pendientes",
      recentSales: "Ventas recientes",
      currentPlan: "Plan actual",
      seeOffers: "Ver planes",
      inventory: "INVENTARIO",
      manageProducts: "Gestione sus productos y controle el stock.",
      addProduct: "Añadir producto",
      editProduct: "Editar producto",
      newProduct: "Nuevo producto",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      available: "Disponible",
      lowStock: "Stock bajo",
      product: "Producto",
      sku: "SKU",
      price: "Precio",
      quantity: "Cantidad",
      state: "Estado",
      actions: "Acciones",
      salesHistory: "Historial de ventas",
      allRecentSales: "Todas sus ventas recientes.",
      exportCSV: "Exportar CSV",
      exportPDF: "Exportar PDF",
      cashSale: "Cliente de contado",
      customer: "Cliente",
      payment: "Pago",
      paymentMethod: "Método de pago",
      cash: "Efectivo",
      mobileMoney: "Mobile Money",
      card: "Tarjeta",
      transfer: "Transferencia",
      note: "Nota",
      saveSale: "Guardar venta",
      clients: "CLIENTES",
      manageCustomers: "Gestione sus clientes y sus datos.",
      addCustomer: "Añadir cliente",
      newCustomer: "Nuevo cliente",
      name: "Nombre",
      phone: "Teléfono",
      email: "Correo",
      debtsTitle: "Deudas de clientes",
      manageDebts: "Controle los importes pendientes.",
      addDebt: "Añadir deuda",
      newDebt: "Nueva deuda",
      amount: "Importe",
      paid: "Pagado",
      remaining: "Restante",
      open: "Abierta",
      paidStatus: "Pagada",
      paymentHistory: "Historial de pagos",
      makePayment: "Pago",
      reportsTitle: "Informes",
      reportsDescription: "Analice sus ventas en un período personalizado.",
      from: "Desde",
      to: "Hasta",
      apply: "Aplicar",
      revenue: "Facturación",
      transactions: "Transacciones",
      salesPerDay: "Ventas por día",
      account: "CUENTA",
      manageProfile: "Gestione sus datos personales.",
      changePhoto: "Cambiar foto",
      fullName: "Nombre completo",
      shopName: "Nombre de la tienda",
      sensitiveArea: "Zona sensible",
      deleteAccount: "Eliminar mi cuenta",
      deleteAccountDescription:
        "Eliminar la cuenta borra permanentemente sus datos asociados.",
      choosePlan: "Elija su plan",
      grow: "Crezca con su negocio.",
      recommended: "RECOMENDADO",
      currentPlanButton: "Plan actual",
      choosePlanButton: "Elegir este plan",
      paymentsUnavailable:
        "Los pagos en línea todavía no están conectados.",
      adminPrivate: "Administración privada de CashFlow.",
      users: "Usuarios",
      activeUsers: "Usuarios activos",
      role: "Rol",
      activate: "Activar",
      deactivate: "Desactivar",
      noData: "Sin datos",
      noProducts: "Sin productos",
      noCustomers: "Sin clientes",
      noSales: "Sin ventas",
      noDebts: "Sin deudas",
      support: "Soporte",
      logout: "Cerrar sesión",
      createAccount: "Crear cuenta",
      login: "Iniciar sesión",
      success: "Operación realizada.",
      error: "Ocurrió un error."
    }
  };

  function t(key) {
    return (
      translations[state.language]?.[key] ||
      translations.fr[key] ||
      key
    );
  }

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

    return date.toLocaleDateString(
      state.language || undefined
    );
  }

  function localDateInput(daysAgo = 0) {
    const date = new Date();

    date.setDate(
      date.getDate() - daysAgo
    );

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function setMessage(text, type = "") {
    if (!authMessage) return;

    authMessage.textContent =
      text || "";

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
              "Content-Type":
                "application/json"
            }),
        ...(options.headers || {})
      }
    };

    const response =
      await fetch(url, config);

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    let data;

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data =
        await response.json();
    } else {
      data =
        await response.text();
    }

    if (!response.ok) {
      const error =
        typeof data === "object"
          ? data.error
          : data;

      throw new Error(
        error ||
          t("error")
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
      // Valeurs par défaut.
    }

    updateSupportLinks();
  }

  function updateSupportLinks() {
    const whatsapp =
      String(
        state.config.supportWhatsapp ||
          ""
      ).replace(/\D/g, "");

    const email =
      state.config.supportEmail ||
      "gestontech@gmail.com";

    const whatsappURL =
      whatsapp
        ? `https://wa.me/${whatsapp}`
        : "#";

    [
      $("#waAuth"),
      $("#waLink")
    ].forEach(link => {
      if (link) {
        link.href =
          whatsappURL;
      }
    });

    [
      $("#mailAuth"),
      $("#mailLink")
    ].forEach(link => {
      if (link) {
        link.href =
          `mailto:${email}`;
      }
    });

    if ($("#mailLink")) {
      $("#mailLink").textContent =
        email;
    }
  }

  /* =====================================================
     LANGUAGE
  ===================================================== */

  function detectLanguage() {
    const saved =
      localStorage.getItem(
        "cashflow-lang"
      );

    const browser =
      (
        navigator.language ||
        "fr"
      ).slice(0, 2).toLowerCase();

    state.language =
      saved ||
      (
        LANGUAGES.includes(browser)
          ? browser
          : "fr"
      );

    document.documentElement.lang =
      state.language;
  }

  function refreshStaticLanguage() {
    document.documentElement.lang =
      state.language;

    const pageButtonMap = {
      dashboard: t("dashboard"),
      products: t("products"),
      sales: t("sales"),
      customers: t("customers"),
      debts: t("debts"),
      reports: t("reports"),
      subscription: t("subscription"),
      profile: t("profile"),
      admin: t("admin")
    };

    $$("#nav [data-page]")
      .forEach(button => {
        const page =
          button.dataset.page;

        const label =
          $("span:last-child", button);

        if (
          label &&
          pageButtonMap[page]
        ) {
          label.textContent =
            pageButtonMap[page];
        }
      });

    const title =
      $("#pageTitle");

    if (title) {
      title.textContent =
        pageButtonMap[state.page] ||
        "CashFlow";
    }

    const logout =
      $("#logout");

    if (logout) {
      logout.textContent =
        t("logout");
    }

    updateSupportLinks();
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
    state.theme =
      getSavedTheme();

    if (
      state.theme === "system"
    ) {
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
    const loginForm =
      $("#loginForm");

    const registerForm =
      $("#registerForm");

    if (
      !loginForm ||
      !registerForm
    ) {
      return;
    }

    loginForm.classList.toggle(
      "hidden",
      mode !== "login"
    );

    registerForm.classList.toggle(
      "hidden",
      mode !== "register"
    );

    $$(".tabs button")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.auth ===
            mode
        );
      });

    setMessage("");
  }

  async function login(event) {
    event.preventDefault();

    const data =
      Object.fromEntries(
        new FormData(
          event.currentTarget
        )
      );

    setMessage(
      state.language === "fr"
        ? "Connexion en cours..."
        : "Signing in..."
    );

    try {
      const result =
        await api(
          "/api/auth/login",
          {
            method: "POST",
            body:
              JSON.stringify(data)
          }
        );

      state.user =
        result.user;

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

    const data =
      Object.fromEntries(
        new FormData(
          event.currentTarget
        )
      );

    setMessage(
      state.language === "fr"
        ? "Création du compte..."
        : "Creating account..."
    );

    try {
      const result =
        await api(
          "/api/auth/register",
          {
            method: "POST",
            body:
              JSON.stringify(data)
          }
        );

      state.user =
        result.user;

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
      // Nettoyage local.
    }

    state.user = null;

    appView?.classList.add(
      "hidden"
    );

    authView?.classList.remove(
      "hidden"
    );

    switchAuth("login");
  }

  async function checkSession() {
    try {
      const result =
        await api(
          "/api/auth/me"
        );

      if (result.user) {
        state.user =
          result.user;

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

    authView?.classList.remove(
      "hidden"
    );

    appView?.classList.add(
      "hidden"
    );
  }

  function showApp() {
    authView?.classList.add(
      "hidden"
    );

    appView?.classList.remove(
      "hidden"
    );

    updateUserUI();
  }

  function updateUserUI() {
    if (!state.user) {
      return;
    }

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
        state.user.role !==
          "admin"
      );
    }
  }

  /* =====================================================
     DATA
  ===================================================== */

  async function loadUserData() {
    if (!state.user) {
      return;
    }

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

      state.products =
        Array.isArray(products)
          ? products
          : [];

      state.customers =
        Array.isArray(customers)
          ? customers
          : [];

      state.sales =
        Array.isArray(sales)
          ? sales
          : [];

      state.debts =
        Array.isArray(debts)
          ? debts
          : [];
    } catch (error) {
      console.error(error);
    }

    updateUserUI();
  }

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const titles = {
    dashboard: "dashboard",
    products: "products",
    sales: "sales",
    customers: "customers",
    debts: "debts",
    reports: "reportsTitle",
    subscription: "subscription",
    profile: "profile",
    admin: "admin"
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

    state.page =
      page;

    localStorage.setItem(
      "cashflow-page",
      page
    );

    $$("#nav button")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.page ===
            page
        );
      });

    const title =
      $("#pageTitle");

    if (title) {
      title.textContent =
        t(titles[page]) ||
        "CashFlow";
    }

    content.innerHTML =
      `<div class="card empty">
        <div>
          <strong>${escapeHTML(
            t("loading")
          )}</strong>
          <span>${escapeHTML(
            t("wait")
          )}</span>
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
        await api(
          "/api/dashboard"
        );

      const plan =
        state.user.plan ===
        "elite"
          ? "Élite"
          : state.user.plan ===
            "pro"
          ? "Pro"
          : "Gratuit";

      content.innerHTML = `
        <div class="page-head">
          <div>
            <span class="eyebrow">
              ${escapeHTML(t("hello"))}
            </span>

            <h2>
              ${escapeHTML(
                state.user.name
              )}
            </h2>

            <p>
              ${escapeHTML(
                t("activity")
              )}
            </p>
          </div>

          <div class="page-actions">
            <button
              class="primary"
              data-action="new-sale"
            >
              ${escapeHTML(
                t("newSale")
              )}
            </button>
          </div>
        </div>

        <div class="card-grid">

          ${statCard(
            t("todaySales"),
            money(
              data.today?.total
            ),
            `${
              data.today?.count ||
              0
            } vente(s)`
          )}

          ${statCard(
            t("monthSales"),
            money(
              data.month?.total
            ),
            `${
              data.month?.count ||
              0
            } vente(s)`
          )}

          ${statCard(
            t("stock"),
            data.stock?.units ||
              0,
            `${
              data.stock?.low ||
              0
            } produit(s)`
          )}

          ${statCard(
            t("remainingDebts"),
            money(
              data.debt?.amount
            ),
            "À récupérer"
          )}

        </div>

        <div class="content-grid">

          <div class="card">
            <div class="card-header">
              <h3>
                ${escapeHTML(
                  t("recentSales")
                )}
              </h3>

              <span>
                ${escapeHTML(
                  plan
                )}
              </span>
            </div>

            ${
              Array.isArray(
                data.recent
              ) &&
              data.recent.length
                ? salesTable(
                    data.recent
                  )
                : emptyState(
                    t("noSales"),
                    t("activity")
                  )
            }
          </div>

          <div class="card">
            <div class="card-header">
              <h3>
                ${escapeHTML(
                  t("subscription")
                )}
              </h3>

              <span>
                ${escapeHTML(
                  t("currentPlan")
                )}
              </span>
            </div>

            <div>
              <div class="stat-value">
                ${escapeHTML(
                  plan
                )}
              </div>

              <p style="color:var(--muted);font-size:.82rem">
                ${
                  state.user.plan ===
                  "free"
                    ? "30 produits / 20 clients maximum."
                    : "Fonctionnalités professionnelles activées."
                }
              </p>

              <button
                class="secondary"
                data-action="subscription"
              >
                ${escapeHTML(
                  t("seeOffers")
                )}
              </button>
            </div>
          </div>

        </div>
      `;
    } catch (error) {
      content.innerHTML =
        errorState(
          error.message
        );
    }
  }

  function statCard(
    label,
    value,
    meta
  ) {
    return `
      <div class="card stat-card">
        <div class="stat-label">
          ${escapeHTML(label)}
        </div>

        <div class="stat-value">
          ${escapeHTML(value)}
        </div>

        <div class="stat-meta">
          ${escapeHTML(meta)}
        </div>
      </div>
    `;
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
              <th>${escapeHTML(
                t("payment")
              )}</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            ${rows
              .map(
                row => `
                  <tr>
                    <td>
                      #${row.id}
                    </td>

                    <td>
                      ${formatDate(
                        row.created_at
                      )}
                    </td>

                    <td>
                      <strong>
                        ${money(
                          row.total
                        )}
                      </strong>
                    </td>

                    <td>
                      <span class="badge">
                        ${escapeHTML(
                          row.payment_method ||
                            "cash"
                        )}
                      </span>
                    </td>

                    <td>
                      <button
                        class="secondary"
                        data-action="sale-detail"
                        data-id="${row.id}"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                `
              )
              .join("")}
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
          <span class="eyebrow">
            ${escapeHTML(
              t("inventory")
            )}
          </span>

          <h2>
            ${escapeHTML(
              t("products")
            )}
          </h2>

          <p>
            ${escapeHTML(
              t("manageProducts")
            )}
          </p>
        </div>

        <div class="page-actions">
          <button
            class="primary"
            data-action="add-product"
          >
            ${escapeHTML(
              t("addProduct")
            )}
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
                      <th>${escapeHTML(
                        t("product")
                      )}</th>
                      <th>${escapeHTML(
                        t("sku")
                      )}</th>
                      <th>${escapeHTML(
                        t("price")
                      )}</th>
                      <th>Stock</th>
                      <th>${escapeHTML(
                        t("state")
                      )}</th>
                      <th>${escapeHTML(
                        t("actions")
                      )}</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${state.products
                      .map(
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
                                product.sku ||
                                  "—"
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
                                Number(
                                  product.stock
                                ) <=
                                Number(
                                  product.min_stock
                                )
                                  ? `
                                    <span class="badge warning">
                                      ${escapeHTML(
                                        t(
                                          "lowStock"
                                        )
                                      )}
                                    </span>
                                  `
                                  : `
                                    <span class="badge">
                                      ${escapeHTML(
                                        t(
                                          "available"
                                        )
                                      )}
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
                                ${escapeHTML(
                                  t("save")
                                )}
                              </button>

                              <button
                                class="secondary danger"
                                data-action="delete-product"
                                data-id="${product.id}"
                              >
                                ${escapeHTML(
                                  t("delete")
                                )}
                              </button>
                            </td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
            : emptyState(
                t("noProducts"),
                t("manageProducts")
              )
        }
      </div>
    `;
  }

  function productForm(
    product = null
  ) {
    const editing =
      Boolean(product);

    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">
            ${escapeHTML(
              t("product")
            )}
          </span>

          <h2>
            ${escapeHTML(
              editing
                ? t("editProduct")
                : t("newProduct")
            )}
          </h2>
        </div>
      </div>

      <div class="card">
        <form
          id="productForm"
          class="form-grid"
        >

          <div class="field">
            <label>
              ${escapeHTML(
                t("name")
              )}

              <input
                name="name"
                required
                value="${escapeHTML(
                  product?.name ||
                    ""
                )}"
              >
            </label>
          </div>

          <div class="field">
            <label>
              ${escapeHTML(
                t("sku")
              )}

              <input
                name="sku"
                value="${escapeHTML(
                  product?.sku ||
                    ""
                )}"
              >
            </label>
          </div>

          <div class="field">
            <label>
              ${escapeHTML(
                t("price")
              )}

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
              ${escapeHTML(
                t("cancel")
              )}
            </button>

            <button
              type="submit"
              class="primary"
            >
              ${escapeHTML(
                t("save")
              )}
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
      Number(
        data.min_stock || 0
      );

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
          body:
            JSON.stringify(data)
        }
      );

      state.products =
        await api(
          "/api/products"
        );

      navigate("products");
    } catch (error) {
      alert(error.message);
    }
  }

  async function deleteProduct(id) {
    const product =
      state.products.find(
        item =>
          Number(item.id) ===
          Number(id)
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
        await api(
          "/api/products"
        );

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
          <span class="eyebrow">
            ${escapeHTML(
              t("sales")
            )}
          </span>

          <h2>
            ${escapeHTML(
              t("salesHistory")
            )}
          </h2>

          <p>
            ${escapeHTML(
              t("allRecentSales")
            )}
          </p>
        </div>

        <div class="page-actions">
          <button
            class="secondary"
            data-action="export-csv"
          >
            ${escapeHTML(
              t("exportCSV")
            )}
          </button>

          <button
            class="secondary"
            data-action="export-pdf"
          >
            ${escapeHTML(
              t("exportPDF")
            )}
          </button>

          <button
            class="primary"
            data-action="new-sale"
          >
            ${escapeHTML(
              t("newSale")
            )}
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
                      <th>${escapeHTML(
                        t("customer")
                      )}</th>
                      <th>Total</th>
                      <th>${escapeHTML(
                        t("payment")
                      )}</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    ${state.sales
                      .map(
                        sale => `
                          <tr>
                            <td>
                              #${sale.id}
                            </td>

                            <td>
                              ${formatDate(
                                sale.created_at
                              )}
                            </td>

                            <td>
                              ${escapeHTML(
                                sale.customer_name ||
                                  t(
                                    "cashSale"
                                  )
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
                                  sale.payment_method ||
                                    "cash"
                                )}
                              </span>
                            </td>

                            <td>
                              <button
                                class="secondary"
                                data-action="sale-detail"
                                data-id="${sale.id}"
                              >
                                Détails
                              </button>
                            </td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
            : emptyState(
                t("noSales"),
                t("allRecentSales")
              )
        }
      </div>
    `;
  }

  function newSale() {
    if (
      !state.products.length
    ) {
      alert(
        t("noProducts")
      );

      navigate("products");
      return;
    }

    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">
            ${escapeHTML(
              t("sales")
            )}
          </span>

          <h2>
            ${escapeHTML(
              t("newSale")
            )}
          </h2>
        </div>
      </div>

      <div class="card">
        <form id="saleForm">

          <div
            id="saleItems"
          ></div>

          <button
            type="button"
            class="secondary"
            data-action="add-sale-row"
          >
            + Produit
          </button>

          <div
            class="form-grid"
            style="margin-top:20px"
          >

            <div class="field">
              <label>
                ${escapeHTML(
                  t("customer")
                )}

                <select
                  name="customer_id"
                >
                  <option value="">
                    ${escapeHTML(
                      t("cashSale")
                    )}
                  </option>

                  ${state.customers
                    .map(
                      customer => `
                        <option value="${customer.id}">
                          ${escapeHTML(
                            customer.name
                          )}
                        </option>
                      `
                    )
                    .join("")}
                </select>
              </label>
            </div>

            <div class="field">
              <label>
                ${escapeHTML(
                  t("paymentMethod")
                )}

                <select
                  name="payment_method"
                >
                  <option value="cash">
                    ${escapeHTML(
                      t("cash")
                    )}
                  </option>

                  <option value="mobile_money">
                    ${escapeHTML(
                      t("mobileMoney")
                    )}
                  </option>

                  <option value="card">
                    ${escapeHTML(
                      t("card")
                    )}
                  </option>

                  <option value="transfer">
                    ${escapeHTML(
                      t("transfer")
                    )}
                  </option>
                </select>
              </label>
            </div>

            <div class="field full">
              <label>
                ${escapeHTML(
                  t("note")
                )}

                <textarea
                  name="note"
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
            Total : ${money(0)}
          </div>

          <div class="form-actions">

            <button
              type="button"
              class="secondary"
              data-action="sales"
            >
              ${escapeHTML(
                t("cancel")
              )}
            </button>

            <button
              type="submit"
              class="primary"
            >
              ${escapeHTML(
                t("saveSale")
              )}
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

    if (!container) {
      return;
    }

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "sale-row";

    row.style.display =
      "grid";

    row.style.gridTemplateColumns =
      "minmax(0,1fr) 90px 120px 45px";

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
          ${escapeHTML(
            t("product")
          )}
        </option>

        ${state.products
          .map(
            product => `
              <option
                value="${product.id}"
                data-price="${product.price}"
                data-stock="${product.stock}"
              >
                ${escapeHTML(
                  product.name
                )}
                — ${money(
                  product.price
                )}
                — stock ${
                  product.stock
                }
              </option>
            `
          )
          .join("")}
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
        ${money(0)}
      </div>

      <button
        type="button"
        class="secondary"
        data-remove-sale-row
      >
        ×
      </button>
    `;

    container.appendChild(
      row
    );

    $(".sale-product", row)
      ?.addEventListener(
        "change",
        updateSaleTotal
      );

    $(".sale-quantity", row)
      ?.addEventListener(
        "input",
        updateSaleTotal
      );

    $(
      "[data-remove-sale-row]",
      row
    )?.addEventListener(
      "click",
      () => {
        row.remove();

        if (
          !container.children
            .length
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

    $$(".sale-row")
      .forEach(row => {
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
            option?.dataset.price ||
              0
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
      });

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

      const selected =
        product.selectedOptions[0];

      const stock =
        Number(
          selected?.dataset.stock ||
            0
        );

      if (
        quantity > stock
      ) {
        alert(
          `Stock insuffisant pour ${selected.textContent.trim()}.`
        );
        return;
      }

      items.push({
        product_id:
          Number(
            product.value
          ),
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
              form.get(
                "customer_id"
              )
            )
          : null,
      payment_method:
        form.get(
          "payment_method"
        ),
      note:
        form.get("note") ||
        ""
    };

    try {
      await api(
        "/api/sales",
        {
          method: "POST",
          body:
            JSON.stringify(data)
        }
      );

      await loadUserData();

      navigate("sales");
    } catch (error) {
      alert(error.message);
    }
  }

  async function showSaleDetail(id) {
    try {
      const sale =
        await api(
          `/api/sales/${id}`
        );

      const items =
        Array.isArray(
          sale.items
        )
          ? sale.items
          : [];

      content.innerHTML = `
        <div class="page-head">
          <div>
            <span class="eyebrow">
              ${escapeHTML(
                t("sales")
              )}
            </span>

            <h2>
              Vente #${id}
            </h2>

            <p>
              ${formatDate(
                sale.created_at
              )}
            </p>
          </div>

          <button
            class="secondary"
            data-action="sales"
          >
            ${escapeHTML(
              t("cancel")
            )}
          </button>
        </div>

        <div class="card">

          <div class="card-grid">

            ${statCard(
              "Total",
              money(sale.total),
              sale.payment_method ||
                "cash"
            )}

            ${statCard(
              t("customer"),
              sale.customer_name ||
                t("cashSale"),
              ""
            )}

          </div>

          <div
            class="table-wrap"
            style="margin-top:20px"
          >
            <table>
              <thead>
                <tr>
                  <th>${escapeHTML(
                    t("product")
                  )}</th>
                  <th>${escapeHTML(
                    t("quantity")
                  )}</th>
                  <th>${escapeHTML(
                    t("price")
                  )}</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                ${items
                  .map(
                    item => `
                      <tr>
                        <td>
                          ${escapeHTML(
                            item.product_name ||
                              item.name ||
                              "Produit"
                          )}
                        </td>

                        <td>
                          ${item.quantity}
                        </td>

                        <td>
                          ${money(
                            item.price
                          )}
                        </td>

                        <td>
                          ${money(
                            Number(
                              item.quantity
                            ) *
                              Number(
                                item.price
                              )
                          )}
                        </td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          ${
            sale.note
              ? `
                <p style="
                  margin-top:18px;
                  color:var(--muted)
                ">
                  ${escapeHTML(
                    sale.note
                  )}
                </p>
              `
              : ""
          }

        </div>
      `;
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
          <span class="eyebrow">
            ${escapeHTML(
              t("clients")
            )}
          </span>

          <h2>
            ${escapeHTML(
              t("customers")
            )}
          </h2>

          <p>
            ${escapeHTML(
              t("manageCustomers")
            )}
          </p>
        </div>

        <button
          class="primary"
          data-action="add-customer"
        >
          ${escapeHTML(
            t("addCustomer")
          )}
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
                      <th>${escapeHTML(
                        t("name")
                      )}</th>
                      <th>${escapeHTML(
                        t("phone")
                      )}</th>
                      <th>${escapeHTML(
                        t("email")
                      )}</th>
                      <th>${escapeHTML(
                        t("actions")
                      )}</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${state.customers
                      .map(
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
                                customer.phone ||
                                  "—"
                              )}
                            </td>

                            <td>
                              ${escapeHTML(
                                customer.email ||
                                  "—"
                              )}
                            </td>

                            <td>
                              <button
                                class="secondary"
                                data-action="edit-customer"
                                data-id="${customer.id}"
                              >
                                Modifier
                              </button>

                              <button
                                class="secondary danger"
                                data-action="delete-customer"
                                data-id="${customer.id}"
                              >
                                ${escapeHTML(
                                  t("delete")
                                )}
                              </button>
                            </td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
            : emptyState(
                t("noCustomers"),
                t("manageCustomers")
              )
        }
      </div>
    `;
  }

  function customerForm(
    customer = null
  ) {
    const editing =
      Boolean(customer);

    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">
            ${escapeHTML(
              t("customers")
            )}
          </span>

          <h2>
            ${escapeHTML(
              editing
                ? "Modifier le client"
                : t("newCustomer")
            )}
          </h2>
        </div>
      </div>

      <div class="card">
        <form
          id="customerForm"
          class="form-grid"
        >

          <div class="field">
            <label>
              ${escapeHTML(
                t("name")
              )}

              <input
                name="name"
                required
                value="${escapeHTML(
                  customer?.name ||
                    ""
                )}"
              >
            </label>
          </div>

          <div class="field">
            <label>
              ${escapeHTML(
                t("phone")
              )}

              <input
                name="phone"
                value="${escapeHTML(
                  customer?.phone ||
                    ""
                )}"
              >
            </label>
          </div>

          <div class="field">
            <label>
              ${escapeHTML(
                t("email")
              )}

              <input
                name="email"
                type="email"
                value="${escapeHTML(
                  customer?.email ||
                    ""
                )}"
              >
            </label>
          </div>

          <div class="form-actions full">
            <button
              type="button"
              class="secondary"
              data-action="customers"
            >
              ${escapeHTML(
                t("cancel")
              )}
            </button>

            <button
              type="submit"
              class="primary"
            >
              ${escapeHTML(
                t("save")
              )}
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
              editing
                ? `/api/customers/${customer.id}`
                : "/api/customers",
              {
                method:
                  editing
                    ? "PUT"
                    : "POST",
                body:
                  JSON.stringify(
                    data
                  )
              }
            );

            state.customers =
              await api(
                "/api/customers"
              );

            navigate(
              "customers"
            );
          } catch (error) {
            alert(
              error.message
            );
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
          <span class="eyebrow">
            ${escapeHTML(
              t("debtsTitle")
            )}
          </span>

          <h2>
            ${escapeHTML(
              t("debts")
            )}
          </h2>

          <p>
            ${escapeHTML(
              t("manageDebts")
            )}
          </p>
        </div>

        <div class="page-actions">
          <span class="badge warning">
            ${escapeHTML(
              t("remaining")
            )} :
            ${money(total)}
          </span>

          <button
            class="primary"
            data-action="add-debt"
          >
            ${escapeHTML(
              t("addDebt")
            )}
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
                      <th>${escapeHTML(
                        t("customer")
                      )}</th>
                      <th>${escapeHTML(
                        t("amount")
                      )}</th>
                      <th>${escapeHTML(
                        t("paid")
                      )}</th>
                      <th>${escapeHTML(
                        t("remaining")
                      )}</th>
                      <th>${escapeHTML(
                        t("state")
                      )}</th>
                      <th>${escapeHTML(
                        t("actions")
                      )}</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${state.debts
                      .map(
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
                                      ${escapeHTML(
                                        t(
                                          "paidStatus"
                                        )
                                      )}
                                    </span>
                                  `
                                  : `
                                    <span class="badge warning">
                                      ${escapeHTML(
                                        t(
                                          "open"
                                        )
                                      )}
                                    </span>
                                  `
                              }
                            </td>

                            <td>
                              <button
                                class="secondary"
                                data-action="debt-history"
                                data-id="${debt.id}"
                              >
                                ${escapeHTML(
                                  t(
                                    "paymentHistory"
                                  )
                                )}
                              </button>

                              ${
                                debt.status !==
                                "paid"
                                  ? `
                                    <button
                                      class="secondary"
                                      data-action="pay-debt"
                                      data-id="${debt.id}"
                                    >
                                      ${escapeHTML(
                                        t(
                                          "makePayment"
                                        )
                                      )}
                                    </button>
                                  `
                                  : ""
                              }
                            </td>
                          </tr>
                        `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
            : emptyState(
                t("noDebts"),
                t("manageDebts")
              )
        }
      </div>
    `;
  }

  function debtForm() {
    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">
            ${escapeHTML(
              t("debts")
            )}
          </span>

          <h2>
            ${escapeHTML(
              t("newDebt")
            )}
          </h2>
        </div>
      </div>

      <div class="card">
        <form
          id="debtForm"
          class="form-grid"
        >

          <div class="field">
            <label>
              ${escapeHTML(
                t("customer")
              )}

              <select
                name="customer_id"
                required
              >
                <option value="">
                  ${escapeHTML(
                    t("customer")
                  )}
                </option>

                ${state.customers
                  .map(
                    customer => `
                      <option
                        value="${customer.id}"
                      >
                        ${escapeHTML(
                          customer.name
                        )}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </label>
          </div>

          <div class="field">
            <label>
              ${escapeHTML(
                t("amount")
              )}

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
              ${escapeHTML(
                t("note")
              )}

              <textarea
                name="note"
              ></textarea>
            </label>
          </div>

          <div class="form-actions full">
            <button
              type="button"
              class="secondary"
              data-action="debts"
            >
              ${escapeHTML(
                t("cancel")
              )}
            </button>

            <button
              type="submit"
              class="primary"
            >
              ${escapeHTML(
                t("save")
              )}
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
            Number(
              data.amount
            );

          data.customer_id =
            Number(
              data.customer_id
            );

          try {
            await api(
              "/api/debts",
              {
                method: "POST",
                body:
                  JSON.stringify(
                    data
                  )
              }
            );

            state.debts =
              await api(
                "/api/debts"
              );

            navigate("debts");
          } catch (error) {
            alert(
              error.message
            );
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
        `${t(
          "remaining"
        )}: ${money(
          debt.remaining
        )}\n\nMontant du paiement :`
      );

    if (
      value === null
    ) {
      return;
    }

    const amount =
      Number(value);

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      alert(
        "Montant invalide."
      );
      return;
    }

    if (
      amount >
      Number(
        debt.remaining
      )
    ) {
      alert(
        "Le paiement dépasse le montant restant."
      );
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

  async function showDebtHistory(id) {
    try {
      const payments =
        await api(
          `/api/debts/${id}/payments`
        );

      const debt =
        state.debts.find(
          item =>
            Number(item.id) ===
            Number(id)
        );

      content.innerHTML = `
        <div class="page-head">
          <div>
            <span class="eyebrow">
              ${escapeHTML(
                t("debts")
              )}
            </span>

            <h2>
              ${escapeHTML(
                t(
                  "paymentHistory"
                )
              )}
            </h2>

            <p>
              ${escapeHTML(
                debt?.customer_name ||
                  "Client"
              )}
            </p>
          </div>

          <button
            class="secondary"
            data-action="debts"
          >
            ${escapeHTML(
              t("cancel")
            )}
          </button>
        </div>

        <div class="card">

          ${
            Array.isArray(
              payments
            ) &&
            payments.length
              ? `
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Montant</th>
                      </tr>
                    </thead>

                    <tbody>
                      ${payments
                        .map(
                          payment => `
                            <tr>
                              <td>
                                ${formatDate(
                                  payment.created_at
                                )}
                              </td>

                              <td>
                                <strong>
                                  ${money(
                                    payment.amount
                                  )}
                                </strong>
                              </td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : emptyState(
                  t("noData"),
                  t(
                    "paymentHistory"
                  )
                )
          }

        </div>
      `;
    } catch (error) {
      alert(error.message);
    }
  }

  /* =====================================================
     REPORTS
  ===================================================== */

  async function renderReports(
    from = localDateInput(30),
    to = localDateInput(0)
  ) {
    try {
      const data =
        await api(
          `/api/reports?from=${encodeURIComponent(
            from
          )}&to=${encodeURIComponent(
            to
          )}`
        );

      state.reports = {
        from:
          data.from || from,
        to:
          data.to || to,
        rows:
          Array.isArray(
            data.rows
          )
            ? data.rows
            : [],
        summary:
          data.summary || {
            total: 0,
            count: 0
          }
      };

      content.innerHTML = `
        <div class="page-head">
          <div>
            <span class="eyebrow">
              ${escapeHTML(
                t("reports")
              )}
            </span>

            <h2>
              ${escapeHTML(
                t("reportsTitle")
              )}
            </h2>

            <p>
              ${escapeHTML(
                t(
                  "reportsDescription"
                )
              )}
            </p>
          </div>

          <div class="page-actions">
            <button
              class="secondary"
              data-action="export-csv"
            >
              ${escapeHTML(
                t("exportCSV")
              )}
            </button>

            <button
              class="secondary"
              data-action="export-pdf"
            >
              ${escapeHTML(
                t("exportPDF")
              )}
            </button>
          </div>
        </div>

        <div class="card">

          <form
            id="reportFilter"
            class="form-grid"
          >

            <div class="field">
              <label>
                ${escapeHTML(
                  t("from")
                )}

                <input
                  name="from"
                  type="date"
                  value="${escapeHTML(
                    state.reports
                      .from
                  )}"
                  required
                >
              </label>
            </div>

            <div class="field">
              <label>
                ${escapeHTML(
                  t("to")
                )}

                <input
                  name="to"
                  type="date"
                  value="${escapeHTML(
                    state.reports
                      .to
                  )}"
                  required
                >
              </label>
            </div>

            <div class="form-actions">
              <button
                class="primary"
                type="submit"
              >
                ${escapeHTML(
                  t("apply")
                )}
              </button>
            </div>

          </form>

        </div>

        <div class="card-grid">

          ${statCard(
            t("revenue"),
            money(
              state.reports
                .summary.total
            ),
            `${state.reports.from} → ${state.reports.to}`
          )}

          ${statCard(
            t("transactions"),
            state.reports
              .summary.count,
            "Ventes"
          )}

        </div>

        <div
          class="card"
          style="margin-top:15px"
        >

          <div class="card-header">
            <h3>
              ${escapeHTML(
                t("salesPerDay")
              )}
            </h3>

            <span>
              ${escapeHTML(
                state.reports
                  .from
              )}
              →
              ${escapeHTML(
                state.reports
                  .to
              )}
            </span>
          </div>

          ${
            state.reports
              .rows.length
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
                      ${state.reports
                        .rows
                        .map(
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
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              `
              : emptyState(
                  t("noData"),
                  t(
                    "reportsDescription"
                  )
                )
          }

        </div>
      `;

      $("#reportFilter")
        ?.addEventListener(
          "submit",
          async event => {
            event.preventDefault();

            const form =
              new FormData(
                event.currentTarget
              );

            const nextFrom =
              form.get("from");

            const nextTo =
              form.get("to");

            if (
              nextFrom >
              nextTo
            ) {
              alert(
                "La date de début doit être avant la date de fin."
              );
              return;
            }

            await renderReports(
              nextFrom,
              nextTo
            );
          }
        );
    } catch (error) {
      content.innerHTML =
        errorState(
          error.message
        );
    }
  }

  /* =====================================================
     SUBSCRIPTION
  ===================================================== */

  function renderSubscription() {
    const current =
      state.user.plan ||
      "free";

    content.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">
            CASHFLOW
          </span>

          <h2>
            ${escapeHTML(
              t("choosePlan")
            )}
          </h2>

          <p>
            ${escapeHTML(
              t("grow")
            )}
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
          current === "free"
        )}

        ${priceCard(
          "Pro",
          "5",
          "Pour les commerçants actifs",
          [
            "Produits illimités",
            "Clients illimités",
            "Ventes et stock",
            "Dettes clients",
            "Rapports",
            "Export CSV",
            "Sauvegarde cloud",
            "Support prioritaire"
          ],
          current === "pro",
          true
        )}

        ${priceCard(
          "Élite",
          "12",
          "Pour une gestion avancée",
          [
            "Tout Pro",
            "Historique complet",
            "Gestion avancée",
            "Rapports détaillés",
            "Export CSV + PDF",
            "Multi-appareils",
            "Sauvegarde cloud",
            "Support prioritaire"
          ],
          current === "elite"
        )}

      </div>

      <div
        class="card"
        style="margin-top:16px"
      >
        <strong>
          ${escapeHTML(
            t("currentPlan")
          )} :
        </strong>

        ${escapeHTML(
          current === "elite"
            ? "Élite"
            : current === "pro"
            ? "Pro"
            : "Gratuit"
        )}

        <p style="
          color:var(--muted);
          font-size:.82rem;
          margin-bottom:0
        ">
          ${escapeHTML(
            t(
              "paymentsUnavailable"
            )
          )}
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
        featured
          ? "featured"
          : ""
      }">

        ${
          featured
            ? `
              <span class="badge">
                ${escapeHTML(
                  t("recommended")
                )}
              </span>
            `
            : ""
        }

        <h3 style="
          margin-top:${
            featured
              ? "12px"
              : "0"
          }
        ">
          ${escapeHTML(
            name
          )}
        </h3>

        <div class="price">
          $${escapeHTML(
            price
          )}
          <small>
            / mois
          </small>
        </div>

        <p style="
          color:var(--muted);
          font-size:.82rem;
        ">
          ${escapeHTML(
            description
          )}
        </p>

        <ul>
          ${features
            .map(
              feature =>
                `<li>${escapeHTML(
                  feature
                )}</li>`
            )
            .join("")}
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
          ${escapeHTML(
            active
              ? t(
                  "currentPlanButton"
                )
              : t(
                  "choosePlanButton"
                )
          )}
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
          <span class="eyebrow">
            ${escapeHTML(
              t("account")
            )}
          </span>

          <h2>
            ${escapeHTML(
              t("profile")
            )}
          </h2>

          <p>
            ${escapeHTML(
              t(
                "manageProfile"
              )
            )}
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
              ${escapeHTML(
                t("changePhoto")
              )}

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
              ${escapeHTML(
                t("fullName")
              )}

              <input
                name="name"
                required
                value="${escapeHTML(
                  state.user.name ||
                    ""
                )}"
              >
            </label>
          </div>

          <div class="field">
            <label>
              ${escapeHTML(
                t("email")
              )}

              <input
                value="${escapeHTML(
                  state.user.email ||
                    ""
                )}"
                disabled
              >
            </label>
          </div>

          <div class="field">
            <label>
              ${escapeHTML(
                t("phone")
              )}

              <input
                name="phone"
                value="${escapeHTML(
                  state.user.phone ||
                    ""
                )}"
              >
            </label>
          </div>

          <div class="field">
            <label>
              ${escapeHTML(
                t("shopName")
              )}

              <input
                name="shop_name"
                value="${escapeHTML(
                  state.user.shop_name ||
                    ""
                )}"
              >
            </label>
          </div>

          <div class="form-actions full">
            <button
              type="submit"
              class="primary"
            >
              ${escapeHTML(
                t("save")
              )}
            </button>
          </div>

        </form>

      </div>

      <div
        class="card"
        style="margin-top:15px"
      >

        <div class="card-header">
          <h3>
            ${escapeHTML(
              t("sensitiveArea")
            )}
          </h3>
        </div>

        <p style="
          color:var(--muted);
          font-size:.82rem;
        ">
          ${escapeHTML(
            t(
              "deleteAccountDescription"
            )
          )}
        </p>

        <button
          class="secondary danger"
          data-action="delete-account"
        >
          ${escapeHTML(
            t("deleteAccount")
          )}
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

  async function saveProfile(
    event
  ) {
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
              JSON.stringify(
                data
              )
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

  async function uploadAvatar(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp"
      ].includes(
        file.type
      )
    ) {
      alert(
        "Format d'image non pris en charge."
      );
      return;
    }

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

    if (
      password === null
    ) {
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

      appView?.classList.add(
        "hidden"
      );

      authView?.classList.remove(
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
      state.user.role !==
      "admin"
    ) {
      navigate("dashboard");
      return;
    }

    try {
      const [
        stats,
        users
      ] = await Promise.all([
        api(
          "/api/admin/stats"
        ),
        api(
          "/api/admin/users"
        )
      ]);

      content.innerHTML = `
        <div class="page-head">
          <div>
            <span class="eyebrow">
              ADMIN
            </span>

            <h2>
              ${escapeHTML(
                t("admin")
              )}
            </h2>

            <p>
              ${escapeHTML(
                t("adminPrivate")
              )}
            </p>
          </div>
        </div>

        <div class="card-grid">

          ${statCard(
            t("users"),
            stats.users || 0,
            ""
          )}

          ${statCard(
            t("activeUsers"),
            stats.active || 0,
            ""
          )}

          ${statCard(
            t("transactions"),
            stats.sales?.count ||
              0,
            ""
          )}

          ${statCard(
            t("revenue"),
            money(
              stats.sales?.total
            ),
            ""
          )}

        </div>

        <div
          class="card"
          style="margin-top:15px"
        >

          <div class="card-header">
            <h3>
              ${escapeHTML(
                t("users")
              )}
            </h3>

            <span>
              ${escapeHTML(
                t("admin")
              )}
            </span>
          </div>

          <div class="table-wrap">
            <table>

              <thead>
                <tr>
                  <th>${escapeHTML(
                    t("name")
                  )}</th>
                  <th>${escapeHTML(
                    t("email")
                  )}</th>
                  <th>Plan</th>
                  <th>${escapeHTML(
                    t("role")
                  )}</th>
                  <th>${escapeHTML(
                    t("state")
                  )}</th>
                  <th>${escapeHTML(
                    t("actions")
                  )}</th>
                </tr>
              </thead>

              <tbody>
                ${users
                  .map(
                    user => {
                      const isPrincipal =
                        String(
                          user.email
                        ).toLowerCase() ===
                        String(
                          state.config.adminEmail ||
                            "gestontech@gmail.com"
                        ).toLowerCase();

                      const active =
                        Number(
                          user.active
                        ) === 1 ||
                        user.active ===
                          true;

                      return `
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
                              ${
                                isPrincipal
                                  ? "disabled"
                                  : ""
                              }
                            >
                              ${[
                                "free",
                                "pro",
                                "elite"
                              ]
                                .map(
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
                                )
                                .join("")}
                            </select>
                          </td>

                          <td>
                            ${
                              isPrincipal
                                ? `
                                  <span class="badge">
                                    admin
                                  </span>
                                `
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
                              active
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

                            ${
                              isPrincipal
                                ? `
                                  <span class="badge">
                                    Principal
                                  </span>
                                `
                                : `
                                  <button
                                    class="secondary"
                                    data-action="toggle-user"
                                    data-id="${user.id}"
                                    data-active="${active}"
                                  >
                                    ${
                                      active
                                        ? t(
                                            "deactivate"
                                          )
                                        : t(
                                            "activate"
                                          )
                                    }
                                  </button>

                                  <button
                                    class="secondary danger"
                                    data-action="admin-delete-user"
                                    data-id="${user.id}"
                                  >
                                    ${escapeHTML(
                                      t(
                                        "delete"
                                      )
                                    )}
                                  </button>
                                `
                            }

                          </td>

                        </tr>
                      `;
                    }
                  )
                  .join("")}
              </tbody>

            </table>
          </div>

        </div>
      `;

      $$(
        "[data-admin-plan]"
      ).forEach(select => {
        select.addEventListener(
          "change",
          () =>
            updateAdminUser(
              select.dataset.id
            )
        );
      });

      $$(
        "[data-admin-role]"
      ).forEach(select => {
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
        errorState(
          error.message
        );
    }
  }

  async function updateAdminUser(
    id
  ) {
    const plan =
      $(
        `[data-admin-plan][data-id="${id}"]`
      )?.value;

    const role =
      $(
        `[data-admin-role][data-id="${id}"]`
      )?.value;

    const body = {};

    if (plan) {
      body.plan =
        plan;
    }

    if (role) {
      body.role =
        role;
    }

    try {
      await api(
        `/api/admin/users/${id}`,
        {
          method: "PUT",
          body:
            JSON.stringify(
              body
            )
        }
      );

      await renderAdmin();
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

      await renderAdmin();
    } catch (error) {
      alert(error.message);
    }
  }

  async function adminDeleteUser(
    id
  ) {
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

      await renderAdmin();
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
            ${escapeHTML(
              title
            )}
          </strong>

          <span>
            ${escapeHTML(
              text
            )}
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
            ${escapeHTML(
              t("error")
            )}
          </strong>

          <span>
            ${escapeHTML(
              text
            )}
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
        await navigate(
          navButton.dataset.page
        );
        return;
      }

      const action =
        event.target.closest(
          "[data-action]"
        );

      if (!action) {
        return;
      }

      const name =
        action.dataset.action;

      switch (name) {
        case "new-sale":
          newSale();
          break;

        case "add-sale-row":
          addSaleRow();
          break;

        case "sales":
          await navigate(
            "sales"
          );
          break;

        case "products":
          await navigate(
            "products"
          );
          break;

        case "customers":
          await navigate(
            "customers"
          );
          break;

        case "debts":
          await navigate(
            "debts"
          );
          break;

        case "reports":
          await navigate(
            "reports"
          );
          break;

        case "subscription":
          await navigate(
            "subscription"
          );
          break;

        case "profile":
          await navigate(
            "profile"
          );
          break;

        case "add-product":
          productForm();
          break;

        case "edit-product": {
          const product =
            state.products.find(
              item =>
                Number(
                  item.id
                ) ===
                Number(
                  action.dataset.id
                )
            );

          if (product) {
            productForm(
              product
            );
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

        case "edit-customer": {
          const customer =
            state.customers.find(
              item =>
                Number(
                  item.id
                ) ===
                Number(
                  action.dataset.id
                )
            );

          if (customer) {
            customerForm(
              customer
            );
          }

          break;
        }

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

        case "debt-history":
          await showDebtHistory(
            action.dataset.id
          );
          break;

        case "sale-detail":
          await showSaleDetail(
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
              "true" ||
              action.dataset.active ===
              "1"
          );
          break;

        case "admin-delete-user":
          await adminDeleteUser(
            action.dataset.id
          );
          break;

        case "plan-info":
          alert(
            t(
              "paymentsUnavailable"
            )
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
      () =>
        navigate(
          "profile"
        )
    );

  /* =====================================================
     SYSTEM THEME
  ===================================================== */

  if (
    window.matchMedia
  ) {
    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    media.addEventListener?.(
      "change",
      () => {
        if (
          getSavedTheme() ===
          "system"
        ) {
          applyTheme();
        }
      }
    );
  }

  /* =====================================================
     START
  ===================================================== */

  async function start() {
    detectLanguage();

    refreshStaticLanguage();

    applyTheme();

    switchAuth("login");

    await loadConfig();

    refreshStaticLanguage();

    await checkSession();
  }

  start();
})();

  /* =====================================================
     REÇUS DE VENTE
     Liaison avec public/assets/receipt.js
  ===================================================== */

  function addReceiptButtons(root = document) {
    if (!root) return;

    root.querySelectorAll(
      '[data-action="sale-detail"][data-id]'
    ).forEach(button => {
      if (
        button.parentElement?.querySelector(
          '[data-action="sale-receipt"]'
        )
      ) {
        return;
      }

      const receiptButton =
        document.createElement("button");

      receiptButton.type = "button";
      receiptButton.className =
        "secondary";
      receiptButton.dataset.action =
        "sale-receipt";
      receiptButton.dataset.id =
        button.dataset.id;
      receiptButton.textContent =
        "🧾 Reçu";

      button.parentElement.appendChild(
        receiptButton
      );
    });
  }

  document.addEventListener(
    "click",
    event => {
      const button =
        event.target.closest(
          '[data-action="sale-receipt"]'
        );

      if (!button) return;

      const saleId =
        button.dataset.id;

      if (
        saleId &&
        window.CashFlowReceipt &&
        typeof window.CashFlowReceipt.show ===
          "function"
      ) {
        window.CashFlowReceipt.show(
          saleId
        );
      }
    }
  );

  const receiptObserver =
    new MutationObserver(() => {
      addReceiptButtons(
        document.querySelector(
          "#content"
        )
      );
    });

  const contentForReceipt =
    document.querySelector(
      "#content"
    );

  if (contentForReceipt) {
    receiptObserver.observe(
      contentForReceipt,
      {
        childList: true,
        subtree: true
      }
    );

    addReceiptButtons(
      contentForReceipt
    );
  }
