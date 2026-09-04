"use strict";

const currencies = { USD: "$", CAD: "$", GBP: "£", EUR: "€", AUD: "$" };
const products = [
  ["Jotform Enterprise Base Package (includes 5 users)", "Base Packages", true, false, 8328, 12500, 6300, 7300, 12900],
  ["Jotform Government Base Package (includes 5 users)", "Base Packages", true, false, 13116, 19700, 10000, 11500, 20300],
  ["Jotform Enterprise Light Package (includes 3 users)", "Base Packages", true, false, 4990, 7485, 3792.4, 4391.2, 7735],
  ["Additional User", "Add-Ons", true, false, 948, 1416, 720, 840, 1464],
  ["Additional 5 User Bundle", "Add-Ons", true, false, 4740, 7100, 3600, 4200, 7300],
  ["Additional 5 User Bundle - Discounted", "Add-Ons", true, false, 4740, 7100, 3600, 4200, 7300],
  ["Salesforce AppExchange Package", "Add-Ons", true, false, 3900, 5900, 3000, 3400, 6000],
  ["Salesforce AppExchange Per User Additional Fee", "Add-Ons", true, false, 240, 360, 200, 210, 400],
  ["HIPAA / SOC2 Compliance", "Add-Ons", true, false, 4788, 7200, 3600, 4200, 7400],
  ["Data-Only Users (Bundle of 10)", "Add-Ons", true, false, 3588, 5400, 2700, 3200, 5600],
  ["Additional Custom Domain", "Add-Ons", true, false, 500, 800, 400, 400, 800],
  ["Bundle of 5 AI Agent Phone Numbers", "Add-Ons", true, false, 600, 900, 500, 530, 930],
  ["SQL Widget (non-HIPAA instances only)", "Add-Ons", true, false, 4990, 7500, 3800, 4400, 7700],
  ["SSO Integration (Per Integration)", "Add-Ons", true, false, 2490, 3700, 1900, 2200, 3900],
  ["SCIM Provisioning", "Add-Ons", true, false, 2490, 3700, 1900, 2200, 3900],
  ["JIT (Just In Time) Provisioning", "Add-Ons", true, false, 1000, 1500, 800, 900, 1600],
  ["Add another product", "Add-Ons", true, true, 0, 0, 0, 0, 0],
  ["Enterprise Onboarding", "One-Time Fees", false, false, 3500, 5300, 2700, 3100, 5400],
  ["Professional Services", "One-Time Fees", false, true, 0, 0, 0, 0, 0],
  ["Custom Domain Change Fee", "One-Time Fees", false, false, 500, 800, 400, 400, 800],
  ["Server Migration Fee (H to non-H or vice versa)", "One-Time Fees", false, false, 4500, 6800, 3400, 4000, 7000],
  ["Slug Change Fee", "One-Time Fees", false, false, 1200, 1800, 900, 1100, 1900]
].map(([name, category, annual, customPrice, USD, CAD, GBP, EUR, AUD]) => ({ name, category, annual, customPrice, prices: { USD, CAD, GBP, EUR, AUD } }));

const salespeople = [
  ["Brad Morris", "bradmorris@jotform.com"], ["Derec Thompson", "derecthompson@jotform.com"],
  ["Keith Alberts", "keith@jotform.com"], ["Jack Barrett", "jack@jotform.com"],
  ["Grant Gutwein", "grant@jotform.com"], ["Brian Longtin", "brianlongtin@jotform.com"],
  ["Matthew Ansted", "matthewansted@jotform.com"], ["Peter Eichner", "peter@jotform.com"],
  ["Ian Robinson", "ian@jotform.com"], ["Andy Shen", "andyshen@jotform.com"],
  ["Austin Foley", "austin@jotform.com"], ["David Kennedy", "davidkennedy@jotform.com"],
  ["Ajay Pathak", "ajay@jotform.com"], ["Michael McComb", "michaelmccomb@jotform.com"],
  ["Quyen Pham", "quyenpham@jotform.com"], ["Ryan Verba", "ryanverba@jotform.com"],
  ["Richard Martin", "richardmartin@jotform.com"], ["Austin Schaefer", "austinschaefer@jotform.com"],
  ["Selena Hart", "selenahart@jotform.com"], ["Jeri Resor", "jeri.resor@jotform.com"],
  ["Janelle Maffucci", "janelle@jotform.com"], ["Chloe Waters", "chloewaters@jotform.com"],
  ["Mariana Alzate", "mariana@jotform.com"], ["Gage Deschambeault", "gage@jotform.com"],
  ["Neville Burton", "nevilleburton@jotform.com"], ["Adam Gleisner", "adamgleisner@jotform.com"],
  ["Ben Hanks", "benhanks@jotform.com"], ["Lewis Johnson", "lewis@jotform.com"],
  ["Laura Lindberg", "laura.lindberg@jotform.com"], ["Fatma Tan", "fatmatan@jotform.com"],
  ["Miray Doyduk", "miray@jotform.com"], ["Ezgisu Yılmaz", "ezgisu@jotform.com"]
].map(([name, email]) => ({ name, email }));

const entities = [
  { name: "Jotform US", address: "4 Embarcadero Center, Suite 780\nSan Francisco, CA 94111", taxLabel: "Tax ID", taxId: "46-5729519" },
  { name: "Jotform Canada Inc.", address: "411-150 22ND Street W, North Vancouver BC V7M 3M4", taxLabel: "TCV", taxId: "23-014404-TCV" },
  { name: "Jotform PTY LTD", address: "Level 36, Gateway\n1 Macquarie Place\nSydney, NSW 2000", taxLabel: "ABN", taxId: "47 651 796 922" },
  { name: "Jotform LTD", address: "3 Albert Mews, Albert Road, London, N4 3RD, United Kingdom", taxLabel: "VAT", taxId: "375 7259 57" }
];

const terms = {
  "1": { label: "12 months", months: 12, years: 1, discount: 0 },
  "2": { label: "2 years", months: 24, years: 2, discount: 5 },
  "2_no_discount": { label: "2 years — no discount", months: 24, years: 2, discount: 0 },
  "3": { label: "3 years", months: 36, years: 3, discount: 10 },
  "5": { label: "5 years", months: 60, years: 5, discount: 15 }
};

const defaultNotes = [
  "Quote is valid for 30 days",
  "3 years paid up front: 10% off of total",
  "5 years paid up front: 15% off of total",
  "Quoted prices are before taxes. If taxes are applicable to your organization in your jurisdiction, they will be added to your invoice.",
  "Prices are Jotform to Reseller Prices. Reseller to add their own margins on top of these prices"
];

const redlinesDisclaimerDefault = "Jotform only considers legal changes on a 3+ year agreement or if the Total Contract Value is greater than $30,000 USD.";

const defaultDocumentText = {
  brandName: "Jotform", dateLabel: "Date", quoteTitle: "QUOTE",
  sellerName: "Jotform US", sellerAddress: "4 Embarcadero Center, Suite 780\nSan Francisco, CA 94111",
  taxIdLabel: "Tax ID", taxId: "46-5729519", customerHeading: "To Customer:", resellerHeading: "To Reseller:",
  nameLabel: "Name:", addressLabel: "Address:", optionLabelPrefix: "Option", platformHeader: "Platform",
  quantityHeader: "Quantity", costPerYearHeader: "Cost\nPer Year", numberOfYearsHeader: "Number of Months",
  totalDueHeader: "Total Due", listPriceHeader: "List Price", discountedPriceHeader: "Discounted Price",
  totalLabel: "TOTAL", paidUpFrontDiscountSuffix: "paid up front discount", notesTitle: "NOTES:"
};

const eligibilityProducts = new Set([
  "Additional User",
  "Additional 5 User Bundle",
  "Additional 5 User Bundle - Discounted",
  "Salesforce AppExchange Per User Additional Fee"
]);
const additionalFiveUserBundleName = "Additional 5 User Bundle";
const discountedFiveUserBundleName = "Additional 5 User Bundle - Discounted";
const fiveUserBundleStandardDiscountPercent = 30;
const currencyOrder = ["USD", "CAD", "GBP", "EUR", "AUD"];
let nextRowId = 2;

function quoteDate() {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date());
}

function quoteNumber(name) {
  const initials = name.trim().split(/\s+/).map((part) => part[0]?.toUpperCase() || "").join("");
  const today = new Date();
  const date = `${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}${today.getFullYear()}`;
  return initials ? `${initials}${date}` : "";
}

function freshState() {
  return {
    recipientType: "customer", proposalDate: quoteDate(), customerName: "", customerCompany: "", customerAddress: "",
    resellerName: "", resellerAddress: "", preparedBy: "", salespersonEmail: "", quoteNumber: "", entity: "Jotform US", sellerAddressSingleLine: false, currency: "USD",
    eligibilityDiscount: "0", resellerDiscount: "0", customTermLabel: "", customTermMonths: "", customTermDiscount: "",
    selectedTerms: ["1"], multiYearDiscountEnabled: false, multiYearDiscountPercent: "", text: { ...defaultDocumentText }, defaultNotes: [...defaultNotes], notes: [], redlinesDisclaimerEnabled: false, redlinesDisclaimerText: redlinesDisclaimerDefault, rows: [{ id: 1, product: products[0].name, displayName: "", quantity: "1", unitOverride: "", waived: false, resellerDiscountEligible: true, multiUserDiscountPercent: "" }]
  };
}

let state = freshState();
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const productByName = new Map(products.map((product) => [product.name, product]));

function number(value) {
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function editable(value, attributes = "", className = "") {
  return `<span class="quote-editable-text ${className}" contenteditable="true" spellcheck="false" ${attributes}>${escapeHtml(value)}</span>`;
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: state.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function productOptions(selected) {
  const groups = ["Base Packages", "Add-Ons", "One-Time Fees"];
  return `<option value="">Select product</option>${groups.map((group) => `<optgroup label="${group}">${products.filter((p) => p.category === group && p.name !== discountedFiveUserBundleName).map((p) => `<option value="${escapeHtml(p.name)}" ${p.name === selected ? "selected" : ""}>${escapeHtml(p.name)}</option>`).join("")}</optgroup>`).join("")}`;
}

function isFiveUserBundle(productName) {
  return productName === additionalFiveUserBundleName || productName === discountedFiveUserBundleName;
}

function lineFor(row) {
  const product = productByName.get(row.product);
  const quantity = number(row.quantity);
  const unit = number(row.unitOverride) || Number(product?.prices[state.currency] || 0);
  const eligibilityPercent = discountPercent(state.eligibilityDiscount);
  const multiUserDiscountPercent = isFiveUserBundle(row.product)
    ? (eligibilityPercent > 0 ? 15 : 30)
    : 0;
  const effectiveUnit = unit * (1 - multiUserDiscountPercent / 100);
  const listTotal = row.waived ? 0 : quantity * unit;
  const total = row.waived ? 0 : quantity * effectiveUnit;
  return { row, product, quantity, unit, effectiveUnit, multiUserDiscountPercent, listTotal, total, annual: product?.annual !== false };
}

function discountPercent(value) {
  return number(String(value).split("-")[0]);
}

function selectedTermObjects() {
  return state.selectedTerms.map((key) => {
    if (key !== "custom") return { key, ...terms[key] };
    const months = number(state.customTermMonths) || 12;
    return { key, label: state.customTermLabel.trim() || `${months} months`, months, years: months / 12, discount: number(state.customTermDiscount) };
  });
}

function totalsFor(term) {
  const eligibilityPercent = discountPercent(state.eligibilityDiscount);
  const lines = state.rows.map(lineFor).filter((line) => line.product && line.quantity > 0).map((line) => ({
    ...line,
    total: line.total * (line.annual ? term.years : 1),
    listTotal: line.listTotal * (line.annual ? term.years : 1),
    eligibilityDiscount: (line.product.category === "Base Packages" || eligibilityProducts.has(line.product.name))
      ? line.total * (line.annual ? term.years : 1) * eligibilityPercent / 100
      : 0
  }));
  const listPriceSubtotal = lines.reduce((sum, line) => sum + line.listTotal, 0);
  const recurring = lines.filter((line) => line.annual).reduce((sum, line) => sum + line.total, 0);
  const oneTime = lines.filter((line) => !line.annual).reduce((sum, line) => sum + line.total, 0);
  const resellerPercent = state.recipientType === "reseller" ? discountPercent(state.resellerDiscount) : 0;
  const eligibility = lines.reduce((sum, line) => sum + line.eligibilityDiscount, 0);
  const resellerRecurring = lines.filter((line) => line.annual && line.row.resellerDiscountEligible !== false).reduce((sum, line) => sum + line.total, 0) * resellerPercent / 100;
  const resellerOneTime = lines.filter((line) => !line.annual && line.row.resellerDiscountEligible !== false).reduce((sum, line) => sum + line.total, 0) * resellerPercent / 100;
  const recurringAfterStandard = recurring - eligibility - resellerRecurring;
  const multiYearDiscountPercent = state.multiYearDiscountEnabled ? Math.min(100, number(state.multiYearDiscountPercent)) : 0;
  const multiYearDiscount = recurringAfterStandard * multiYearDiscountPercent / 100;
  const recurringAfterMultiYear = recurringAfterStandard - multiYearDiscount;
  const termDiscountPercent = term.discount;
  const termDiscount = recurringAfterMultiYear * termDiscountPercent / 100;
  const totalDue = Math.max(0, recurringAfterMultiYear - termDiscount) + Math.max(0, oneTime - resellerOneTime);
  return { lines, listPriceSubtotal, recurring, oneTime, eligibilityPercent, eligibility, resellerPercent, resellerRecurring, resellerOneTime, multiYearDiscountEnabled: state.multiYearDiscountEnabled, multiYearDiscountPercent, multiYearDiscount, termDiscountPercent, termDiscount, totalDue };
}

function renderPricing() {
  const container = $("#pricingRows");
  container.innerHTML = state.rows.map((row) => {
    const line = lineFor(row);
    const customName = row.product === "Add another product";
    const oneTime = line.product?.annual === false;
    return `<div class="pricing-row" data-row-id="${row.id}">
      <div class="product-stack">
        <select data-role="product" aria-label="Product">${productOptions(row.product)}</select>
        ${state.recipientType === "reseller" ? `<label class="row-reseller-discount-control"><input data-role="resellerDiscountEligible" type="checkbox" ${row.resellerDiscountEligible !== false ? "checked" : ""}/><span>Apply reseller discount</span></label>` : ""}
        ${customName ? `<input data-role="displayName" value="${escapeHtml(row.displayName)}" placeholder="Product name" aria-label="Custom product name" />` : ""}
      </div>
      <input data-role="quantity" value="${escapeHtml(row.quantity)}" inputmode="decimal" aria-label="Quantity" />
      <input data-role="unitOverride" value="${escapeHtml(row.unitOverride || (line.product ? line.unit : ""))}" inputmode="decimal" aria-label="Unit price" ${line.product?.customPrice && !row.unitOverride ? 'placeholder="Required"' : ""} />
      <div><div class="calculated" data-role="rowTotal">${row.waived ? "Waived" : money(line.total)}</div>${oneTime ? `<label class="waived-control"><input data-role="waived" type="checkbox" ${row.waived ? "checked" : ""}/> Waived</label>` : ""}</div>
      <button class="remove-button product-remove-button" data-role="remove" type="button" aria-label="Remove row" title="Remove row"><svg class="trash-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg></button>
    </div>`;
  }).join("");

  container.querySelectorAll(".pricing-row").forEach((element) => {
    const row = state.rows.find((item) => item.id === Number(element.dataset.rowId));
    element.addEventListener("input", (event) => {
      const role = event.target.dataset.role;
      if (!role || !row || role === "product" || role === "remove") return;
      row[role] = event.target.type === "checkbox" ? event.target.checked : event.target.value;
      const totalCell = element.querySelector('[data-role="rowTotal"]');
      if (totalCell) totalCell.textContent = row.waived ? "Waived" : money(lineFor(row).total);
      renderSummaryAndQuote();
    });
    element.addEventListener("change", (event) => {
      const role = event.target.dataset.role;
      if (!row) return;
      if (role === "product") {
        row.product = event.target.value;
        row.displayName = "";
        row.unitOverride = "";
        row.waived = false;
        row.multiUserDiscountPercent = "";
        if (!number(row.quantity) && row.product) row.quantity = "1";
        renderPricing();
        renderSummaryAndQuote();
      }
    });
    element.querySelector('[data-role="remove"]').addEventListener("click", () => {
      if (state.rows.length === 1) return;
      state.rows = state.rows.filter((item) => item.id !== row.id);
      renderPricing();
      renderSummaryAndQuote();
    });
  });
}

function renderNotesEditor() {
  $("#notesEditor").innerHTML = state.notes.map((note, index) => `<div class="note-row"><textarea data-note-index="${index}" aria-label="Note ${index + 1}">${escapeHtml(note)}</textarea><button class="remove-button" data-remove-note="${index}" type="button" aria-label="Remove note">×</button></div>`).join("");
  $$('[data-note-index]').forEach((field) => field.addEventListener("input", () => { state.notes[Number(field.dataset.noteIndex)] = field.value; renderQuote(); }));
  $$('[data-remove-note]').forEach((button) => button.addEventListener("click", () => { state.notes.splice(Number(button.dataset.removeNote), 1); renderNotesEditor(); renderQuote(); }));
}

function partyData({ headingKey, nameField, companyField, addressField }) {
  const company = companyField ? state[companyField] : "";
  return {
    heading: `<h2>${editable(state.text[headingKey], `data-text-key="${headingKey}"`)}${company ? ` ${editable(company, `data-state-field="${companyField}"`)}` : ""}</h2>`,
    fields: `<p class="quote-party-row"><strong class="quote-party-label">${editable(state.text.nameLabel, 'data-text-key="nameLabel"')}</strong>${editable(state[nameField] || "", `data-state-field="${nameField}"`, "quote-plain-editable-text")}</p>${state[addressField] ? `<p class="quote-party-row"><strong class="quote-party-label">${editable(state.text.addressLabel, 'data-text-key="addressLabel"')}</strong>${editable(state[addressField], `data-state-field="${addressField}"`, "quote-plain-editable-text quote-address")}</p>` : ""}`
  };
}

function partiesTable() {
  const left = state.recipientType === "reseller"
    ? partyData({ headingKey: "resellerHeading", nameField: "resellerName", addressField: "resellerAddress" })
    : partyData({ headingKey: "customerHeading", nameField: "customerName", companyField: "customerCompany", addressField: "customerAddress" });
  const right = state.recipientType === "reseller"
    ? partyData({ headingKey: "customerHeading", nameField: "customerName", companyField: "customerCompany", addressField: "customerAddress" })
    : null;
  return `<table class="quote-party-table" aria-label="Quote recipient"><colgroup><col class="quote-party-col-left"/><col class="quote-party-col-spacer"/><col class="quote-party-col-right"/></colgroup><tbody><tr><td class="quote-party-cell">${left.heading}${left.fields}</td><td></td><td class="quote-party-cell">${right ? `${right.heading}${right.fields}` : ""}</td></tr></tbody></table>`;
}

function optionTable(term, index, totalOptions) {
  const totals = totalsFor(term);
  const showResellerDiscountColumns = state.recipientType === "reseller";
  const documentTermLabel = term.key === "2_no_discount" ? "2 years" : term.label;
  const termLabel = totalOptions > 1 ? `${editable(state.text.optionLabelPrefix, 'data-text-key="optionLabelPrefix"')} ${String.fromCharCode(65 + index)}: ${escapeHtml(documentTermLabel)}` : (term.key === "1" ? "" : escapeHtml(documentTermLabel));
  const isEligibilityLine = (line) => line.product.category === "Base Packages" || eligibilityProducts.has(line.product.name);
  const quoteLines = totals.eligibility > 0
    ? [...totals.lines.filter(isEligibilityLine), ...totals.lines.filter((line) => !isEligibilityLine(line))]
    : totals.lines;
  const separateEligibility = quoteLines.filter((line) => isEligibilityLine(line) && !isFiveUserBundle(line.product.name)).reduce((sum, line) => sum + line.eligibilityDiscount, 0);
  const lastEligibilityLine = separateEligibility > 0
    ? [...quoteLines].reverse().find((line) => isEligibilityLine(line) && !isFiveUserBundle(line.product.name))
    : null;
  const lastQuoteLine = quoteLines[quoteLines.length - 1];
  const eligibilityLabel = state.eligibilityDiscount.includes("education") ? "Education Discount" : "Non-profit Discount";
  const rows = quoteLines.map((line) => {
    const pdfProductName = isFiveUserBundle(line.product.name)
      ? additionalFiveUserBundleName
      : line.product.name.replace(/\(includes ([35]) users\)/g, "(includes $1 Users)");
    const productName = editable(line.row.displayName || pdfProductName, `data-row-id="${line.row.id}" data-row-field="displayName"`, "quote-plain-editable-text");
    const productNameCell = `<div class="quote-product-cell">${productName}</div>`;
    const editableQuantity = editable(line.row.quantity, `data-row-id="${line.row.id}" data-row-field="quantity"`, "quote-plain-editable-text");
    const quantity = isFiveUserBundle(line.product.name)
      ? `<span class="quote-bundle-quantity">${editableQuantity} ${line.quantity === 1 ? "Bundle" : "Bundles"} of 5 users</span>`
      : editableQuantity;
    const resellerDiscountedTotal = line.row.resellerDiscountEligible !== false
      ? line.total * (1 - totals.resellerPercent / 100)
      : line.total;
    const bundlePdfTotal = line.listTotal * (1 - fiveUserBundleStandardDiscountPercent / 100);
    const bundlePriceDisplay = isFiveUserBundle(line.product.name)
      ? `<span class="quote-inline-discount-price"><s>${money(line.eligibilityDiscount > 0 ? bundlePdfTotal : line.listTotal)}</s><strong>${money(line.eligibilityDiscount > 0 ? line.total - line.eligibilityDiscount : bundlePdfTotal)}</strong></span>`
      : money(line.total);
    const resellerPrice = isFiveUserBundle(line.product.name) && line.eligibilityDiscount > 0
      ? `<span class="quote-inline-discount-price"><s>${money(bundlePdfTotal)}</s><strong>${money(resellerDiscountedTotal - line.eligibilityDiscount)}</strong></span>`
      : money(resellerDiscountedTotal);
    const productRow = showResellerDiscountColumns
      ? `<tr><td>${productNameCell}</td><td>${quantity}</td><td>${line.annual ? term.months : "-"}</td><td>${line.row.waived ? "Waived" : money(line.listTotal)}</td><td>${line.row.waived ? "Waived" : resellerPrice}</td></tr>`
      : `<tr><td>${productNameCell}</td><td>${quantity}</td><td>${isFiveUserBundle(line.product.name) ? "" : editable(money(line.unit), `data-row-id="${line.row.id}" data-row-field="unitOverride"`, "quote-plain-editable-text")}</td><td>${line.annual ? term.months : "One-time"}</td><td>${line.row.waived ? "Waived" : bundlePriceDisplay}</td></tr>`;
    const eligibilityRow = separateEligibility > 0 && lastEligibilityLine?.row.id === line.row.id
      ? `<tr class="quote-line-discount-row"><td>${eligibilityLabel} - ${totals.eligibilityPercent}%</td><td></td>${showResellerDiscountColumns ? `<td>${term.months}</td><td></td>` : `<td></td><td>${term.months}</td>`}<td>−${money(separateEligibility)}</td></tr>`
      : "";
    const resellerRow = !showResellerDiscountColumns && totals.resellerRecurring + totals.resellerOneTime > 0 && lastQuoteLine?.row.id === line.row.id
      ? `<tr class="quote-line-discount-row"><td>Reseller Discount - ${totals.resellerPercent}%</td><td></td><td></td><td>${term.months}</td><td>−${money(totals.resellerRecurring + totals.resellerOneTime)}</td></tr>`
      : "";
    return `${productRow}${eligibilityRow}${resellerRow}`;
  }).join("");
  const discounts = [
    totals.multiYearDiscountEnabled ? `<tr class="quote-line-discount-row"><td>Multi Year Discount - ${totals.multiYearDiscountPercent}%</td><td></td>${showResellerDiscountColumns ? `<td>${term.months}</td><td></td>` : `<td></td><td>${term.months}</td>`}<td>−${money(totals.multiYearDiscount)}</td></tr>` : "",
    totals.termDiscount > 0 ? `<tr class="quote-line-discount-row"><td>${escapeHtml(documentTermLabel)} ${editable(state.text.paidUpFrontDiscountSuffix, 'data-text-key="paidUpFrontDiscountSuffix"')} </td><td>${totals.termDiscountPercent}%</td>${showResellerDiscountColumns ? `<td>${term.months}</td><td></td>` : `<td></td><td>${term.months}</td>`}<td>−${money(totals.termDiscount)}</td></tr>` : ""
  ].join("");
  const columns = showResellerDiscountColumns
    ? `<colgroup><col class="quote-col-platform"/><col class="quote-col-quantity"/><col class="quote-col-reseller-months"/><col class="quote-col-reseller-list"/><col class="quote-col-reseller-discounted"/></colgroup>`
    : `<colgroup><col class="quote-col-platform"/><col class="quote-col-quantity"/><col class="quote-col-amount"/><col class="quote-col-years"/><col class="quote-col-total"/></colgroup>`;
  const headers = showResellerDiscountColumns
    ? `<th>${editable(state.text.numberOfYearsHeader, 'data-text-key="numberOfYearsHeader"')}</th><th>${editable(state.text.listPriceHeader, 'data-text-key="listPriceHeader"')}</th><th><span class="quote-discounted-price-header">${editable(state.text.discountedPriceHeader, 'data-text-key="discountedPriceHeader"')}</span></th>`
    : `<th>${editable(state.text.costPerYearHeader, 'data-text-key="costPerYearHeader"')}</th><th>${editable(state.text.numberOfYearsHeader, 'data-text-key="numberOfYearsHeader"')}</th><th>${editable(state.text.totalDueHeader, 'data-text-key="totalDueHeader"')}</th>`;
  const totalCells = showResellerDiscountColumns
    ? `<td></td><td>${money(totals.listPriceSubtotal)}</td>`
    : `<td></td><td></td>`;
  return `<section class="quote-table-block">${termLabel ? `<h2 class="quote-option-title">${termLabel}</h2>` : ""}<table class="quote-table">${columns}<thead><tr><th>${editable(state.text.platformHeader, 'data-text-key="platformHeader"')}</th><th>${editable(state.text.quantityHeader, 'data-text-key="quantityHeader"')}</th>${headers}</tr></thead><tbody>${rows}${discounts}<tr class="quote-total-row"><td>${editable(state.text.totalLabel, 'data-text-key="totalLabel"')}</td><td></td>${totalCells}<td>${money(totals.totalDue)}</td></tr></tbody></table></section>`;
}

function renderQuote() {
  const entity = entities.find((item) => item.name === state.entity) || entities[0];
  const salesperson = salespeople.find((item) => item.name === state.preparedBy);
  const termObjects = selectedTermObjects();
  const sellerAddressCells = state.sellerAddressSingleLine
    ? `<td class="quote-company-block" colspan="4"><p><strong>${editable(state.text.sellerName, 'data-text-key="sellerName"')}</strong></p><p>${editable(state.text.sellerAddress, 'data-text-key="sellerAddress"', "quote-address quote-address-single-line")}</p></td>`
    : `<td class="quote-company-block"><p><strong>${editable(state.text.sellerName, 'data-text-key="sellerName"')}</strong></p><p>${editable(state.text.sellerAddress, 'data-text-key="sellerAddress"', "quote-address")}</p></td><td></td><td></td><td></td>`;
  $("#quotePaper").innerHTML = `
    <header class="quote-logo-row"><div class="quote-logo"><img class="quote-brand-mark" src="assets/jotform-mark-hd.png" alt=""/>${editable(state.text.brandName, 'data-text-key="brandName"')}</div></header>
    <table class="quote-info-table" aria-label="Quote details">
      <colgroup><col class="quote-info-col-seller"/><col class="quote-info-col-spacer"/><col class="quote-info-col-date"/><col class="quote-info-col-meta"/></colgroup>
      <tbody>
        <tr class="quote-info-top-row"><td></td><td></td><td class="quote-date"><p>${editable(state.text.dateLabel, 'data-text-key="dateLabel"')}</p><p><strong>${escapeHtml(state.proposalDate)}</strong></p></td><td class="quote-meta"><p class="quote-title-line">${editable(state.text.quoteTitle, 'data-text-key="quoteTitle"')}</p><p>${editable(state.quoteNumber || quoteNumber(state.preparedBy), 'data-state-field="quoteNumber"', "quote-plain-editable-text")}</p><p>${editable(state.preparedBy, 'data-state-field="preparedBy"', "quote-plain-editable-text")}</p><p>${editable(salesperson?.email || state.salespersonEmail, 'data-state-field="salespersonEmail"', "quote-plain-editable-text")}</p></td></tr>
        <tr class="quote-info-blank-row"><td></td><td></td><td></td><td></td></tr>
        <tr class="quote-info-seller-row">${sellerAddressCells}</tr>
        <tr class="quote-info-tax-row"><td class="quote-tax-id">${editable(state.text.taxIdLabel, 'data-text-key="taxIdLabel"')}: ${editable(state.text.taxId, 'data-text-key="taxId"')}</td><td></td><td></td><td></td></tr>
      </tbody>
    </table>
    ${partiesTable()}
    ${termObjects.map((term, index) => optionTable(term, index, termObjects.length)).join("")}
    <section class="quote-notes"><h2>${editable(state.text.notesTitle, 'data-text-key="notesTitle"')}</h2><ol>${state.defaultNotes.map((note, index) => `<li class="quote-note-edit-row"><span class="quote-editable-text quote-note-editable" contenteditable="true" data-default-note="${index}" data-placeholder="Click to write note">${escapeHtml(note)}</span><button class="quote-inline-button no-print" type="button" data-remove-default-note="${index}" aria-label="Remove note">−</button></li>`).join("")}${state.redlinesDisclaimerEnabled ? `<li class="quote-additional-note quote-redlines-disclaimer"><span class="quote-editable-text quote-note-editable" contenteditable="true" data-redlines-disclaimer data-placeholder="Redline Disclaimer">${escapeHtml(state.redlinesDisclaimerText)}</span><button class="quote-inline-button no-print" type="button" data-remove-redlines-disclaimer aria-label="Remove Redline Disclaimer">−</button></li>` : ""}${state.notes.map((note, index) => `<li class="quote-additional-note"><span class="quote-editable-text quote-note-editable" contenteditable="true" data-additional-note="${index}" data-placeholder="Click to write note">${escapeHtml(note)}</span><button class="quote-inline-button no-print" type="button" data-remove-additional-note="${index}" aria-label="Remove note">−</button></li>`).join("")}</ol><button class="quote-note-add-button no-print" id="addDefaultNote" type="button">Add note</button></section>`;
  $$('[data-text-key]').forEach((element) => element.addEventListener("input", () => {
    const key = element.dataset.textKey;
    const value = element.innerText.replace(/\n+$/g, "");
    state.text[key] = value;
    $$(`[data-text-key="${key}"]`).forEach((copy) => { if (copy !== element) copy.innerText = value; });
  }));
  $$('[data-state-field]').forEach((element) => element.addEventListener("input", () => {
    const key = element.dataset.stateField;
    state[key] = element.innerText.replace(/\n+$/g, "");
    const control = document.getElementById(key);
    if (control) control.value = state[key];
  }));
  $$('[data-state-field]').forEach((element) => element.addEventListener("blur", () => { const control = document.getElementById(element.dataset.stateField); if (control) control.value = state[element.dataset.stateField]; }));
  $$('[data-row-field]').forEach((element) => element.addEventListener("blur", () => {
    const row = state.rows.find((item) => item.id === Number(element.dataset.rowId));
    if (!row) return;
    const field = element.dataset.rowField;
    const rawValue = element.innerText.replace(/\n+$/g, "");
    row[field] = field === "unitOverride"
      ? rawValue.replace(/[^0-9.-]/g, "")
      : field === "multiUserDiscountPercent"
        ? (rawValue.trim() ? String(Math.min(100, number(rawValue))) : "")
        : rawValue;
    renderPricing();
    renderSummaryAndQuote();
  }));
  $$('[data-default-note]').forEach((element) => element.addEventListener("input", () => { state.defaultNotes[Number(element.dataset.defaultNote)] = element.innerText; }));
  $('[data-redlines-disclaimer]')?.addEventListener("input", (event) => {
    state.redlinesDisclaimerText = event.currentTarget.innerText;
    $("#redlinesDisclaimerText").value = state.redlinesDisclaimerText;
  });
  $$('[data-additional-note]').forEach((element) => element.addEventListener("input", () => {
    const noteIndex = Number(element.dataset.additionalNote);
    state.notes[noteIndex] = element.innerText;
    const panelNote = document.querySelector(`[data-note-index="${noteIndex}"]`);
    if (panelNote) panelNote.value = state.notes[noteIndex];
  }));
  $$('[data-remove-default-note]').forEach((button) => button.addEventListener("click", () => { state.defaultNotes.splice(Number(button.dataset.removeDefaultNote), 1); renderQuote(); }));
  $('[data-remove-redlines-disclaimer]')?.addEventListener("click", () => {
    state.redlinesDisclaimerEnabled = false;
    $("#redlinesDisclaimer").checked = false;
    $("#redlinesDisclaimerText").hidden = true;
    renderQuote();
  });
  $$('[data-remove-additional-note]').forEach((button) => button.addEventListener("click", () => {
    state.notes.splice(Number(button.dataset.removeAdditionalNote), 1);
    renderNotesEditor();
    renderQuote();
  }));
  $("#addDefaultNote").addEventListener("click", () => {
    const noteIndex = state.defaultNotes.length;
    state.defaultNotes.push("");
    renderQuote();
    document.querySelector(`[data-default-note="${noteIndex}"]`)?.focus();
  });
}

function renderSummaryAndQuote() {
  const term = selectedTermObjects()[0] || { ...terms["1"], key: "1" };
  const totals = totalsFor(term);
  $("#termSummary").textContent = selectedTermObjects().map((item) => item.label).join(", ");
  $("#editorRecurring").textContent = money(totals.recurring);
  $("#editorOneTime").textContent = money(totals.oneTime);
  renderQuote();
}

function updateRecipientVisibility() {
  $$(".reseller-only").forEach((element) => { element.hidden = state.recipientType !== "reseller"; });
}

function fillStaticOptions() {
  $("#preparedBy").insertAdjacentHTML("beforeend", salespeople.map((person) => `<option value="${escapeHtml(person.name)}">${escapeHtml(person.name)}</option>`).join(""));
  $("#jotformEntity").innerHTML = entities.map((entity) => `<option value="${escapeHtml(entity.name)}">${escapeHtml(entity.name)}</option>`).join("");
  $("#currency").innerHTML = currencyOrder.map((code) => `<option value="${code}">${code} (${currencies[code]})</option>`).join("");
}

function syncControls() {
  const mapping = { recipientType: "recipientType", proposalDate: "proposalDate", resellerName: "resellerName", resellerAddress: "resellerAddress", customerName: "customerName", customerCompany: "customerCompany", customerAddress: "customerAddress", preparedBy: "preparedBy", entity: "jotformEntity", currency: "currency", eligibilityDiscount: "eligibilityDiscount", resellerDiscount: "resellerDiscount", customTermLabel: "customTermLabel", customTermMonths: "customTermMonths", customTermDiscount: "customTermDiscount" };
  Object.entries(mapping).forEach(([stateKey, id]) => { $("#" + id).value = state[stateKey]; });
  $$('#termGrid input[type="checkbox"]').forEach((input) => { input.checked = state.selectedTerms.includes(input.value); });
  $("#multiYearDiscount").checked = state.multiYearDiscountEnabled;
  $("#multiYearDiscountPercent").value = state.multiYearDiscountPercent;
  $("#multiYearDiscountRateField").hidden = !state.multiYearDiscountEnabled;
  $("#customTermFields").hidden = !state.selectedTerms.includes("custom");
  $("#redlinesDisclaimer").checked = state.redlinesDisclaimerEnabled;
  $("#redlinesDisclaimerText").value = state.redlinesDisclaimerText;
  $("#redlinesDisclaimerText").hidden = !state.redlinesDisclaimerEnabled;
  $("#sellerAddressSingleLine").checked = state.sellerAddressSingleLine;
  updateRecipientVisibility();
}

function bindControls() {
  const mapping = { recipientType: "recipientType", resellerName: "resellerName", resellerAddress: "resellerAddress", customerName: "customerName", customerCompany: "customerCompany", customerAddress: "customerAddress", preparedBy: "preparedBy", jotformEntity: "entity", currency: "currency", eligibilityDiscount: "eligibilityDiscount", resellerDiscount: "resellerDiscount", customTermLabel: "customTermLabel", customTermMonths: "customTermMonths", customTermDiscount: "customTermDiscount" };
  Object.entries(mapping).forEach(([id, key]) => {
    $("#" + id).addEventListener("input", (event) => {
      state[key] = event.target.value;
      if (id === "preparedBy") {
        state.salespersonEmail = salespeople.find((person) => person.name === state.preparedBy)?.email || "";
        state.quoteNumber = quoteNumber(state.preparedBy);
      }
      if (id === "jotformEntity") {
        const entity = entities.find((item) => item.name === state.entity) || entities[0];
        state.text.sellerName = entity.name;
        state.text.sellerAddress = entity.address;
        state.text.taxIdLabel = entity.taxLabel;
        state.text.taxId = entity.taxId;
      }
      if (id === "recipientType") {
        updateRecipientVisibility();
        renderPricing();
      }
      if (id === "currency") renderPricing();
      renderSummaryAndQuote();
    });
  });

  $$('#termGrid input[type="checkbox"]').forEach((input) => input.addEventListener("change", () => {
    const selected = $$('#termGrid input:checked').map((checkbox) => checkbox.value);
    if (!selected.length) { input.checked = true; return; }
    state.selectedTerms = selected;
    $("#customTermFields").hidden = !selected.includes("custom");
    renderSummaryAndQuote();
  }));

  $("#multiYearDiscount").addEventListener("change", (event) => {
    state.multiYearDiscountEnabled = event.target.checked;
    $("#multiYearDiscountRateField").hidden = !state.multiYearDiscountEnabled;
    renderSummaryAndQuote();
  });
  $("#multiYearDiscountPercent").addEventListener("input", (event) => {
    state.multiYearDiscountPercent = event.target.value;
    renderSummaryAndQuote();
  });

  $("#sellerAddressSingleLine").addEventListener("change", (event) => {
    state.sellerAddressSingleLine = event.target.checked;
    renderQuote();
  });

  $("#redlinesDisclaimer").addEventListener("change", (event) => {
    state.redlinesDisclaimerEnabled = event.target.checked;
    $("#redlinesDisclaimerText").hidden = !state.redlinesDisclaimerEnabled;
    renderQuote();
  });
  $("#redlinesDisclaimerText").addEventListener("input", (event) => {
    state.redlinesDisclaimerText = event.target.value;
    renderQuote();
  });

  $("#addRow").addEventListener("click", () => { state.rows.push({ id: nextRowId++, product: "", displayName: "", quantity: "1", unitOverride: "", waived: false, resellerDiscountEligible: true, multiUserDiscountPercent: "" }); renderPricing(); renderSummaryAndQuote(); });
  $("#addNote").addEventListener("click", () => {
    const noteIndex = state.notes.length;
    state.notes.push("");
    renderNotesEditor();
    renderQuote();
    document.querySelector(`[data-note-index="${noteIndex}"]`)?.focus();
  });
  $("#refreshQuote").addEventListener("click", () => { state = freshState(); nextRowId = 2; syncControls(); renderPricing(); renderNotesEditor(); renderSummaryAndQuote(); $("#validationMessage").textContent = ""; });

  $("#downloadPdf").addEventListener("click", async () => {
    const invalidRow = state.rows.find((row) => {
      const product = productByName.get(row.product);
      return (row.product === "Add another product" && !row.displayName.trim()) || (product?.customPrice && !number(row.unitOverride));
    });
    if (invalidRow) {
      $("#validationMessage").textContent = "Custom product name and amount are required before downloading the PDF.";
      return;
    }
    $("#validationMessage").textContent = "";
    const safeCompany = (state.customerCompany.trim() || "Customer").replace(/[\\/:*?"<>|]+/g, " ").trim();
    const filename = `${safeCompany} - Jotform Enterprise Quote.pdf`;
    const button = $("#downloadPdf");
    const previousLabel = button.textContent;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.getSelection()?.removeAllRanges();
    button.disabled = true;
    button.textContent = "Preparing PDF…";
    document.body.classList.add("pdf-exporting");
    try {
      if (typeof window.html2pdf === "function") {
        const quotePaper = $("#quotePaper");
        await Promise.all([...quotePaper.querySelectorAll("img")].map(async (image) => {
          if (!image.complete) {
            await new Promise((resolve, reject) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", reject, { once: true });
            });
          }
          if (!image.naturalWidth) throw new Error(`Image could not be loaded: ${image.src}`);
          if (typeof image.decode === "function") await image.decode();
        }));
        await window.html2pdf().set({
          margin: 0,
          filename,
          image: { type: "jpeg", quality: 0.99 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"], avoid: [".quote-table-block"] }
        }).from(quotePaper).save();
      } else {
        const previousTitle = document.title;
        document.title = filename.replace(/\.pdf$/i, "");
        window.print();
        window.setTimeout(() => { document.title = previousTitle; }, 1000);
      }
    } catch (error) {
      console.error(error);
      $("#validationMessage").textContent = "PDF could not be created. Please try again.";
    } finally {
      document.body.classList.remove("pdf-exporting");
      button.disabled = false;
      button.textContent = previousLabel;
    }
  });

  const modal = $("#feedbackModal");
  $("#giveFeedback").addEventListener("click", () => { const frame = modal.querySelector("iframe"); if (!frame.src) frame.src = frame.dataset.src; modal.hidden = false; });
  $("#closeFeedback").addEventListener("click", () => { modal.hidden = true; });
  modal.addEventListener("click", (event) => { if (event.target === modal) modal.hidden = true; });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") modal.hidden = true; });
}

fillStaticOptions();
bindControls();
syncControls();
renderPricing();
renderNotesEditor();
renderSummaryAndQuote();
