(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// javascript code for tax switch button with localStorage persistence

document.addEventListener("DOMContentLoaded", function () {
  const taxSwitch = document.getElementById("switchCheckDefault");
  if (!taxSwitch) return;

  const cards = document.querySelectorAll(".card-text");

  // Store original base prices
  const originalPrices = Array.from(cards).map((card) => {
    const match = card.innerText.match(/[₨\u20B9\u20A8]\s*([\d,]+)/);
    return match ? parseFloat(match[1].replace(/,/g, "")) : null;
  });

  function updatePrices(showTaxes) {
    cards.forEach((card, index) => {
      const basePrice = originalPrices[index];
      if (!basePrice) return;

      const titleEl = card.querySelector("b");
      const title = titleEl ? titleEl.innerText : "Listing";
      const locationEl = card.querySelector(".text-muted");
      const locationText = locationEl ? locationEl.outerHTML : "";
      const taxText = "+18% GST";

      if (showTaxes) {
        const taxedPrice = Math.round(basePrice * 1.18);
        card.innerHTML = `
          <b>${title}</b><br/>
          ${locationText ? locationText + '<br/>' : ''}
          Rs ${taxedPrice.toLocaleString("en-IN")} /night
          <i class="tax-info" style="display:inline;">&nbsp;&nbsp;${taxText}</i>
        `;
      } else {
        card.innerHTML = `
          <b>${title}</b><br/>
          ${locationText ? locationText + '<br/>' : ''}
          Rs ${basePrice.toLocaleString("en-IN")} /night
          <i class="tax-info" style="display:none;">&nbsp;&nbsp;${taxText}</i>
        `;
      }
    });
  }

  // Restore saved tax preference from localStorage
  const savedTaxPref = localStorage.getItem("wonderlust_tax_display") === "true";
  if (savedTaxPref) {
    taxSwitch.checked = true;
    updatePrices(true);
  }

  taxSwitch.addEventListener("change", function () {
    localStorage.setItem("wonderlust_tax_display", taxSwitch.checked);
    updatePrices(taxSwitch.checked);
  });
});

// Universal Theme-Aware Confirmation Dialog Handler
document.addEventListener("DOMContentLoaded", function () {
  let pendingFormToSubmit = null;
  const confirmModalEl = document.getElementById("themeConfirmModal");
  if (!confirmModalEl || typeof bootstrap === "undefined") return;

  const bsModal = new bootstrap.Modal(confirmModalEl);
  const titleEl = document.getElementById("themeConfirmModalTitle");
  const msgEl = document.getElementById("themeConfirmModalMsg");
  const actionBtn = document.getElementById("themeConfirmModalBtn");

  document.addEventListener("submit", function (e) {
    const form = e.target;
    if (form.hasAttribute("data-confirm") && !form.dataset.confirmed) {
      e.preventDefault();
      pendingFormToSubmit = form;
      if (titleEl) titleEl.innerText = form.getAttribute("data-confirm-title") || "Confirm Action";
      if (msgEl) msgEl.innerText = form.getAttribute("data-confirm") || "Are you sure you want to proceed?";
      if (actionBtn) {
        actionBtn.innerText = form.getAttribute("data-confirm-btn") || "Confirm & Delete";
        actionBtn.className = "btn " + (form.getAttribute("data-confirm-class") || "btn-danger") + " rounded-pill px-4 py-2 fw-semibold";
      }
      bsModal.show();
    }
  });

  if (actionBtn) {
    actionBtn.addEventListener("click", function () {
      if (pendingFormToSubmit) {
        pendingFormToSubmit.dataset.confirmed = "true";
        bsModal.hide();
        pendingFormToSubmit.submit();
        pendingFormToSubmit = null;
      }
    });
  }
});

