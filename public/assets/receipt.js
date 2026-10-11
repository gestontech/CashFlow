(() => {
  "use strict";

  const RECEIPT_WIDTH = "80mm";

  function money(value) {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value || 0));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function paymentLabel(method) {
    const labels = {
      cash: "Espèces",
      mobile_money: "Mobile Money",
      card: "Carte",
      transfer: "Virement"
    };

    return labels[method] || method || "Paiement";
  }

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(
      String(value).replace(" ", "T")
    );

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat(
      navigator.language || "fr-FR",
      {
        dateStyle: "short",
        timeStyle: "short"
      }
    ).format(date);
  }

  async function getSale(saleId) {
    const response = await fetch(
      `/api/sales/${encodeURIComponent(saleId)}`,
      {
        credentials: "same-origin"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Impossible de charger la vente."
      );
    }

    return data;
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(
        "cashflow-user"
      );

      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function getReceiptHtml(data) {
    const sale = data.sale || {};
    const items = Array.isArray(data.items)
      ? data.items
      : [];

    const user = getUser() || {};

    const shopName =
      user.shop_name ||
      "CashFlow";

    const customer =
      sale.customer_name ||
      "Client comptant";

    const rows = items
      .map(item => {
        const name = escapeHtml(
          item.product_name
        );

        const quantity = Number(
          item.quantity || 0
        );

        const unitPrice = Number(
          item.unit_price || 0
        );

        const subtotal = Number(
          item.subtotal ||
            unitPrice * quantity
        );

        return `
          <div class="receipt-item">
            <div class="receipt-item-name">
              ${name}
            </div>

            <div class="receipt-item-line">
              <span>
                ${quantity} × ${money(unitPrice)}
              </span>

              <strong>
                ${money(subtotal)}
              </strong>
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div
        id="cashflowReceiptPrint"
        class="cashflow-receipt"
      >

        <div class="receipt-header">

          <div class="receipt-logo">
            C
          </div>

          <div class="receipt-shop">
            <strong>
              ${escapeHtml(shopName)}
            </strong>

            <span>
              CashFlow
            </span>
          </div>

        </div>

        <div class="receipt-title">
          REÇU DE VENTE
        </div>

        <div class="receipt-meta">

          <div>
            <span>N°</span>
            <strong>
              ${escapeHtml(sale.id)}
            </strong>
          </div>

          <div>
            <span>Date</span>
            <strong>
              ${escapeHtml(
                formatDate(sale.created_at)
              )}
            </strong>
          </div>

          <div>
            <span>Client</span>
            <strong>
              ${escapeHtml(customer)}
            </strong>
          </div>

        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-items">
          ${rows}
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-total">
          <span>TOTAL</span>

          <strong>
            ${money(sale.total)}
          </strong>
        </div>

        <div class="receipt-payment">
          Paiement :
          ${escapeHtml(
            paymentLabel(
              sale.payment_method
            )
          )}
        </div>

        ${
          sale.note
            ? `
              <div class="receipt-note">
                ${escapeHtml(sale.note)}
              </div>
            `
            : ""
        }

        <div class="receipt-footer">

          <strong>
            Merci pour votre confiance
          </strong>

          <span>
            Généré avec CashFlow
          </span>

        </div>

      </div>
    `;
  }

  function ensureStyles() {
    if (
      document.getElementById(
        "cashflow-receipt-styles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "cashflow-receipt-styles";

    style.textContent = `
      .cashflow-receipt-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(10, 14, 25, .58);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .cashflow-receipt-modal {
        width: min(440px, 100%);
        max-height: 92vh;
        overflow: auto;
        border-radius: 24px;
        padding: 16px;
        background: rgba(255,255,255,.92);
        box-shadow:
          0 24px 80px rgba(0,0,0,.25);
      }

      .cashflow-receipt-actions {
        display: grid;
        grid-template-columns:
          repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 14px;
      }

      .cashflow-receipt-actions button {
        border: 0;
        border-radius: 12px;
        padding: 11px 8px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        background: #111827;
        color: white;
      }

      .cashflow-receipt-actions button.close {
        background: #e5e7eb;
        color: #111827;
      }

      .cashflow-receipt {
        width: ${RECEIPT_WIDTH};
        max-width: 100%;
        margin: auto;
        padding: 7mm 4mm;
        box-sizing: border-box;
        background: white;
        color: #111;
        font-family:
          Arial,
          Helvetica,
          sans-serif;
        font-size: 11px;
        line-height: 1.35;
      }

      .receipt-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
      }

      .receipt-logo {
        width: 30px;
        height: 30px;
        display: grid;
        place-items: center;
        border-radius: 9px;
        background: #111;
        color: white;
        font-size: 18px;
        font-weight: 800;
      }

      .receipt-shop {
        display: flex;
        flex-direction: column;
      }

      .receipt-shop strong {
        font-size: 15px;
      }

      .receipt-shop span {
        font-size: 9px;
        opacity: .65;
      }

      .receipt-title {
        margin: 14px 0 8px;
        text-align: center;
        font-weight: 800;
        font-size: 12px;
        letter-spacing: .08em;
      }

      .receipt-meta {
        display: grid;
        gap: 4px;
      }

      .receipt-meta div {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }

      .receipt-meta span {
        opacity: .65;
      }

      .receipt-meta strong {
        text-align: right;
        max-width: 65%;
      }

      .receipt-divider {
        border-top: 1px dashed #888;
        margin: 10px 0;
      }

      .receipt-item {
        margin: 7px 0;
      }

      .receipt-item-name {
        font-weight: 700;
        overflow-wrap: anywhere;
      }

      .receipt-item-line {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-top: 2px;
      }

      .receipt-item-line span {
        color: #555;
      }

      .receipt-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 15px;
        font-weight: 800;
      }

      .receipt-payment {
        margin-top: 7px;
        text-align: right;
        font-size: 10px;
      }

      .receipt-note {
        margin-top: 9px;
        padding: 6px;
        border: 1px dashed #aaa;
        font-size: 10px;
      }

      .receipt-footer {
        display: flex;
        flex-direction: column;
        gap: 3px;
        margin-top: 18px;
        text-align: center;
        font-size: 9px;
      }

      .receipt-footer span {
        opacity: .55;
      }

      .cashflow-receipt-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border: 0;
        border-radius: 10px;
        padding: 7px 10px;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
      }

      @media print {

        body > * {
          display: none !important;
        }

        .cashflow-receipt-overlay {
          position: static;
          display: block;
          padding: 0;
          background: white;
        }

        .cashflow-receipt-modal {
          width: 80mm;
          max-height: none;
          overflow: visible;
          padding: 0;
          border-radius: 0;
          box-shadow: none;
          background: white;
        }

        .cashflow-receipt-actions {
          display: none !important;
        }

        .cashflow-receipt {
          width: 80mm;
          max-width: 80mm;
          padding: 5mm 3mm;
        }

        @page {
          size: 80mm auto;
          margin: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function removeModal() {
    const existing = document.getElementById(
      "cashflowReceiptOverlay"
    );

    if (existing) {
      existing.remove();
    }
  }

  function openReceipt(data) {
    ensureStyles();
    removeModal();

    const overlay =
      document.createElement("div");

    overlay.id =
      "cashflowReceiptOverlay";

    overlay.className =
      "cashflow-receipt-overlay";

    const modal =
      document.createElement("div");

    modal.className =
      "cashflow-receipt-modal";

    modal.innerHTML = `
      <div class="cashflow-receipt-actions">

        <button
          type="button"
          data-receipt-action="print"
        >
          🖨️ PDF / Imprimer
        </button>

        <button
          type="button"
          data-receipt-action="whatsapp"
        >
          WhatsApp
        </button>

        <button
          type="button"
          class="close"
          data-receipt-action="close"
        >
          Fermer
        </button>

      </div>

      ${getReceiptHtml(data)}
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener(
      "click",
      event => {
        if (
          event.target === overlay
        ) {
          removeModal();
        }
      }
    );

    modal.addEventListener(
      "click",
      event => {
        const button =
          event.target.closest(
            "[data-receipt-action]"
          );

        if (!button) return;

        const action =
          button.dataset.receiptAction;

        if (action === "close") {
          removeModal();
        }

        if (action === "print") {
          window.print();
        }

        if (action === "whatsapp") {
          shareWhatsApp(data);
        }
      }
    );
  }

  function shareWhatsApp(data) {
    const sale = data.sale || {};
    const items = Array.isArray(data.items)
      ? data.items
      : [];

    const user = getUser() || {};

    const lines = [
      `🧾 Reçu — ${
        user.shop_name || "CashFlow"
      }`,
      `N° ${sale.id || ""}`,
      `Date : ${
        formatDate(sale.created_at)
      }`,
      "",
      ...items.map(item =>
        `${item.product_name} × ${
          item.quantity
        } = ${money(item.subtotal)}`
      ),
      "",
      `💰 TOTAL : ${money(sale.total)}`,
      `💳 Paiement : ${
        paymentLabel(
          sale.payment_method
        )
      }`,
      "",
      "Merci pour votre confiance."
    ];

    const text =
      encodeURIComponent(
        lines.join("\n")
      );

    window.open(
      `https://wa.me/?text=${text}`,
      "_blank",
      "noopener"
    );
  }

  async function showReceipt(saleId) {
    try {
      const data =
        await getSale(saleId);

      openReceipt(data);
    } catch (error) {
      alert(
        error.message ||
          "Impossible de générer le reçu."
      );
    }
  }

  function addReceiptButtons() {
    const content =
      document.querySelector(
        "#content"
      );

    if (!content) return;

    const buttons =
      content.querySelectorAll(
        "[data-sale-id]"
      );

    buttons.forEach(button => {
      if (
        button.dataset.receiptReady ===
        "1"
      ) {
        return;
      }

      button.dataset.receiptReady =
        "1";

      button.addEventListener(
        "click",
        () => {
          showReceipt(
            button.dataset.saleId
          );
        }
      );
    });
  }

  function observeSalesPage() {
    const content =
      document.querySelector(
        "#content"
      );

    if (!content) return;

    const observer =
      new MutationObserver(() => {
        addReceiptButtons();
      });

    observer.observe(content, {
      childList: true,
      subtree: true
    });

    addReceiptButtons();
  }

  window.CashFlowReceipt = {
    show: showReceipt
  };

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      observeSalesPage
    );
  } else {
    observeSalesPage();
  }
})();
