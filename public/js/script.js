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

// javascript code for tax switch button

document.addEventListener("DOMContentLoaded", function () {
  const taxSwitch = document.getElementById("switchCheckDefault");
  const cards = document.querySelectorAll(".card-text");

  // Store original prices
  const originalPrices = Array.from(cards).map((card) => {
    // Match numbers after the currency symbol
    const match = card.innerText.match(/₨\s*([\d,]+)/);
    return match ? parseFloat(match[1].replace(/,/g, "")) : null;
  });

  taxSwitch.addEventListener("change", function () {
    cards.forEach((card, index) => {
      const basePrice = originalPrices[index];
      if (!basePrice) return;

      const title = card.querySelector("b").innerText;
      const taxText = "+18% GST";

      if (taxSwitch.checked) {
        const taxedPrice = Math.round(basePrice * 1.18);
        card.innerHTML = `
          <b>${title}</b><br/>
          ₨ ${taxedPrice.toLocaleString("en-IN")} /night
          <i class="tax-info" style="display:inline;">&nbsp;&nbsp;${taxText}</i>
        `;
      } else {
        card.innerHTML = `
          <b>${title}</b><br/>
          ₨ ${basePrice.toLocaleString("en-IN")} /night
          <i class="tax-info" style="display:none;">&nbsp;&nbsp;${taxText}</i>
        `;
      }
    });
  });
});
