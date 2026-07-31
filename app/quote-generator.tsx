"use client";

import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";
import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import {
  currencyCodes,
  currencySymbols,
  productPrices,
  type CurrencyCode,
  type ProductPrice,
} from "./pricing-data";

type PricingRow = {
  id: string;
  productName: string;
  displayName?: string;
  quantity: string;
  unitPriceOverride?: string;
  waived?: boolean;
};

type PricingOption = {
  id: string;
  rows: PricingRow[];
};

type QuoteTermValue = "1" | "2" | "2_no_discount" | "3" | "5" | "custom";

type QuoteRecipientType = "customer" | "reseller";

type EligibilityDiscountType =
  | "none"
  | "education"
  | "nonprofit";

type ResellerDiscountType =
  | "none"
  | "reseller30"
  | "reseller20"
  | "reseller10";

type ProposalTextField =
  | "customerName"
  | "customerCompany"
  | "customerAddress"
  | "resellerName"
  | "resellerAddress"
  | "preparedByName"
  | "salespersonEmail"
  | "quoteNumber";

type DocumentText = {
  brandName: string;
  dateLabel: string;
  quoteTitle: string;
  sellerName: string;
  sellerAddress: string;
  taxIdLabel: string;
  taxId: string;
  customerHeading: string;
  customerHeadingExtra: string;
  resellerHeading: string;
  resellerHeadingExtra: string;
  nameLabel: string;
  addressLabel: string;
  optionLabelPrefix: string;
  platformHeader: string;
  quantityHeader: string;
  costPerYearHeader: string;
  numberOfYearsHeader: string;
  listPriceHeader: string;
  discountedPriceHeader: string;
  totalDueHeader: string;
  totalLabel: string;
  recurringSubtotalLabel: string;
  oneTimeFeesLabel: string;
  subtotalBeforeDiscountsLabel: string;
  customDiscountLabel: string;
  paidUpFrontDiscountSuffix: string;
  notesTitle: string;
  defaultNotes: string[];
};

type DocumentTextChangeHandler = <K extends keyof DocumentText>(
  key: K,
  value: DocumentText[K],
) => void;

type QuoteTermOption = {
  value: QuoteTermValue;
  label: string;
  months: number;
  years: number;
  discountPercent: number;
};

type JotformEntityOption = {
  name: string;
  address: string;
  taxIdLabel: string;
  taxId: string;
};

type QuoteRecipient = {
  title: string;
  headingKey: keyof DocumentText;
  headingExtra: string;
  headingExtraKey: keyof DocumentText;
  headingExtraField?: ProposalTextField;
  name: string;
  nameField: ProposalTextField;
  address: string;
  addressField: ProposalTextField;
};

type ProposalData = {
  recipientType: QuoteRecipientType;
  customerName: string;
  customerCompany: string;
  customerAddress: string;
  resellerName: string;
  resellerAddress: string;
  preparedByName: string;
  salespersonEmail: string;
  jotformEntityName: string;
  quoteNumber: string;
  proposalDate: string;
  currency: CurrencyCode;
  eligibilityDiscountType: EligibilityDiscountType;
  resellerDiscountType: ResellerDiscountType;
  customDiscountName: string;
  customDiscountPercent: string;
  selectedQuoteTerms: QuoteTermValue[];
  customQuoteTermLabel: string;
  customQuoteTermMonths: string;
  customQuoteTermDiscountPercent: string;
  pricingOptions: PricingOption[];
  additionalNotes: string[];
  documentText: DocumentText;
};

type LegacyPricingOption = PricingOption & {
  title?: string;
  subtitle?: string;
  totalLabel?: string;
  termYears?: string;
  nonprofitDiscountPercent?: string;
  multiyearDiscountPercent?: string;
};

type LegacyProposalData = Partial<ProposalData> & {
  customerCountry?: string;
  costProposalStyle?: string;
  customQuoteTermYears?: string;
  pricingOptions?: LegacyPricingOption[];
};

type CalculatedLine = {
  row: PricingRow;
  product?: ProductPrice;
  quantity: number;
  defaultUnitPrice: number;
  unitPrice: number;
  total: number;
  eligibilityDiscountAmount: number;
  resellerDiscountAmount: number;
};

type OptionTotals = {
  lines: CalculatedLine[];
  recurringSubtotal: number;
  oneTimeSubtotal: number;
  subtotalBeforeDiscounts: number;
  eligibilityDiscountLabel: string;
  eligibilityDiscountPercent: number;
  eligibilityDiscountAmount: number;
  resellerDiscountLabel: string;
  resellerDiscountPercent: number;
  resellerDiscountAmount: number;
  customDiscountAmount: number;
  termDiscountAmount: number;
  totalDiscountAmount: number;
  total: number;
  termYears: number;
  termMonths: number;
  customDiscountPercent: number;
  termDiscountPercent: number;
};

const productGroups = ["Base Packages", "Add-Ons", "One-Time Fees"] as const;
const defaultGeneratorPanelWidth = 760;
const minGeneratorPanelWidth = 380;
const maxGeneratorPanelWidth = 760;

const quoteTermOptions: QuoteTermOption[] = [
  { value: "1", label: "12 months", months: 12, years: 1, discountPercent: 0 },
  { value: "2", label: "2 years", months: 24, years: 2, discountPercent: 5 },
  {
    value: "2_no_discount",
    label: "2 years - no discount",
    months: 24,
    years: 2,
    discountPercent: 0,
  },
  { value: "3", label: "3 years", months: 36, years: 3, discountPercent: 10 },
  { value: "5", label: "5 years", months: 60, years: 5, discountPercent: 15 },
];

const eligibilityDiscountOptions: Array<{
  value: EligibilityDiscountType;
  label: string;
  discountLabel: string;
  percent: number;
}> = [
  {
    value: "none",
    label: "No education / non-profit discount",
    discountLabel: "",
    percent: 0,
  },
  {
    value: "education",
    label: "Education Discount - 30%",
    discountLabel: "Education Discount",
    percent: 30,
  },
  {
    value: "nonprofit",
    label: "Non-profit Discount - 30%",
    discountLabel: "Non-profit Discount",
    percent: 30,
  },
];

const resellerDiscountOptions: Array<{
  value: ResellerDiscountType;
  label: string;
  discountLabel: string;
  percent: number;
}> = [
  {
    value: "none",
    label: "No reseller discount",
    discountLabel: "",
    percent: 0,
  },
  {
    value: "reseller30",
    label: "Reseller Discount - 30%",
    discountLabel: "Reseller Discount",
    percent: 30,
  },
  {
    value: "reseller20",
    label: "Reseller Discount - 20%",
    discountLabel: "Reseller Discount",
    percent: 20,
  },
  {
    value: "reseller10",
    label: "Reseller Discount - 10%",
    discountLabel: "Reseller Discount",
    percent: 10,
  },
];

const jotformEntityOptions: JotformEntityOption[] = [
  {
    name: "Jotform US",
    address: "4 Embarcadero Center, Suite 780\nSan Francisco, CA 94111",
    taxIdLabel: "Tax ID",
    taxId: "46-5729519",
  },
  {
    name: "Jotform Canada Inc.",
    address: "411-150 22ND Street W, North Vancouver BC V7M 3M4",
    taxIdLabel: "TCV",
    taxId: "23-014404-TCV",
  },
  {
    name: "Jotform PTY LTD",
    address: "Level 36, Gateway\n1 Macquarie Place\nSydney, NSW 2000",
    taxIdLabel: "ABN",
    taxId: "47 651 796 922",
  },
  {
    name: "Jotform LTD",
    address: "3 Albert Mews, Albert Road, London, N4 3RD, United Kingdom",
    taxIdLabel: "VAT",
    taxId: "375 7259 57",
  },
];

const entityDocumentTextKeys = new Set<keyof DocumentText>([
  "sellerName",
  "sellerAddress",
  "taxIdLabel",
  "taxId",
]);

const allQuoteTermValues = quoteTermOptions.map((term) => term.value);
const allSelectableQuoteTermValues: QuoteTermValue[] = [
  ...allQuoteTermValues,
  "custom",
];

const productByName = new Map(
  productPrices.map((product) => [product.product, product]),
);

const defaultBasePackageName = "Jotform Enterprise Base Package (includes 5 users)";
const customProductName = "Add another product";
const legacyProductNameMap = new Map([
  ["Onboarding Fee", "Enterprise Onboarding"],
  ["Custom One-Time Fee", "Professional Services"],
  ["Salesforce AppExchange Package*", "Salesforce AppExchange Package"],
  [
    "Salesforce AppExchange Per User Additional Fee**",
    "Salesforce AppExchange Per User Additional Fee",
  ],
]);
const eligibilityDiscountProductNames = new Set([
  "Additional User",
  "Additional 5 User Bundle",
  "Salesforce AppExchange Per User Additional Fee",
]);

const salespersonOptions = [
  { name: "Brad Morris", email: "bradmorris@jotform.com" },
  { name: "Derec Thompson", email: "derecthompson@jotform.com" },
  { name: "Keith Alberts", email: "keith@jotform.com" },
  { name: "Jack Barrett", email: "jack@jotform.com" },
  { name: "Grant Gutwein", email: "grant@jotform.com" },
  { name: "Brian Longtin", email: "brianlongtin@jotform.com" },
  { name: "Matthew Ansted", email: "matthewansted@jotform.com" },
  { name: "Peter Eichner", email: "peter@jotform.com" },
  { name: "Ian Robinson", email: "ian@jotform.com" },
  { name: "Andy Shen", email: "andyshen@jotform.com" },
  { name: "Austin Foley", email: "austin@jotform.com" },
  { name: "David Kennedy", email: "davidkennedy@jotform.com" },
  { name: "Ajay Pathak", email: "ajay@jotform.com" },
  { name: "Michael McComb", email: "michaelmccomb@jotform.com" },
  { name: "Quyen Pham", email: "quyenpham@jotform.com" },
  { name: "Ryan Verba", email: "ryanverba@jotform.com" },
  { name: "Richard Martin", email: "richardmartin@jotform.com" },
  { name: "Austin Schaefer", email: "austinschaefer@jotform.com" },
  { name: "Selena Hart", email: "selenahart@jotform.com" },
  { name: "Jeri Resor", email: "jeri.resor@jotform.com" },
  { name: "Janelle Maffucci", email: "janelle@jotform.com" },
  { name: "Chloe Waters", email: "chloewaters@jotform.com" },
  { name: "Mariana Alzate", email: "mariana@jotform.com" },
  { name: "Gage Deschambeault", email: "gage@jotform.com" },
  { name: "Neville Burton", email: "nevilleburton@jotform.com" },
  { name: "Adam Gleisner", email: "adamgleisner@jotform.com" },
  { name: "Ben Hanks", email: "benhanks@jotform.com" },
  { name: "Lewis Johnson", email: "lewis@jotform.com" },
  { name: "Laura Lindberg", email: "laura.lindberg@jotform.com" },
  { name: "Fatma Tan", email: "fatmatan@jotform.com" },
  { name: "Miray Doyduk", email: "miray@jotform.com" },
  { name: "Ezgisu Yılmaz", email: "ezgisu@jotform.com" },
];

const legacySalespersonNameMap = new Map([
  ["Derec Alan Thompson", "Derec Thompson"],
  ["Grant Benjamin Gutwein", "Grant Gutwein"],
  ["Austin Michael Schaefer", "Austin Schaefer"],
]);

const defaultDocumentText: DocumentText = {
  brandName: "Jotform",
  dateLabel: "Date",
  quoteTitle: "QUOTE",
  sellerName: "Jotform US",
  sellerAddress: "4 Embarcadero Center, Suite 780\nSan Francisco, CA 94111",
  taxIdLabel: "Tax ID",
  taxId: "46-5729519",
  customerHeading: "To Customer:",
  customerHeadingExtra: "",
  resellerHeading: "To Reseller:",
  resellerHeadingExtra: "",
  nameLabel: "Name",
  addressLabel: "Address",
  optionLabelPrefix: "Option",
  platformHeader: "Platform",
  quantityHeader: "Quantity",
  costPerYearHeader: "Cost\nPer Year",
  numberOfYearsHeader: "Number of Months",
  listPriceHeader: "List Price",
  discountedPriceHeader: "Discounted Price",
  totalDueHeader: "Total Due",
  totalLabel: "TOTAL",
  recurringSubtotalLabel: "Recurring subtotal",
  oneTimeFeesLabel: "One-time fees",
  subtotalBeforeDiscountsLabel: "Subtotal before discounts",
  customDiscountLabel: "Discount (Other)",
  paidUpFrontDiscountSuffix: "paid up front discount",
  notesTitle: "NOTES:",
  defaultNotes: [
    "Quote is valid for 30 days",
    "3 years paid up front: 10% off of total",
    "5 years paid up front: 15% off of total",
    "Quoted prices are before taxes. If taxes are applicable to your organization in your jurisdiction, they will be added to your invoice.",
    "Prices are Jotform to Reseller Prices. Reseller to add their own margins on top of these prices",
  ],
};

const emptyProposal: ProposalData = {
  recipientType: "customer",
  customerName: "",
  customerCompany: "",
  customerAddress: "",
  resellerName: "",
  resellerAddress: "",
  preparedByName: "",
  salespersonEmail: "",
  jotformEntityName: "Jotform US",
  quoteNumber: "",
  proposalDate: todayQuoteDate(),
  currency: "USD",
  eligibilityDiscountType: "none",
  resellerDiscountType: "none",
  customDiscountName: "",
  customDiscountPercent: "",
  selectedQuoteTerms: ["1"],
  customQuoteTermLabel: "",
  customQuoteTermMonths: "",
  customQuoteTermDiscountPercent: "",
  pricingOptions: [
    {
      id: "option-1",
      rows: [row("row-1", defaultBasePackageName, "1")],
    },
  ],
  additionalNotes: [],
  documentText: normalizeDocumentText(),
};

function row(id: string, productName: string, quantity: string): PricingRow {
  return { id, productName, quantity };
}

function cloneProposal(source: ProposalData): ProposalData {
  return JSON.parse(JSON.stringify(source)) as ProposalData;
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function todayQuoteDate() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function todayQuoteNumberDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const year = String(today.getFullYear());

  return `${month}${day}${year}`;
}

function salespersonInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function quoteNumberForSalesperson(name: string) {
  const initials = salespersonInitials(name);

  return initials ? `${initials}${todayQuoteNumberDate()}` : "";
}

function quotePdfTitle(proposal: ProposalData) {
  const companyName = proposal.customerCompany.trim() || "Customer";
  const safeCompanyName = companyName
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return `${safeCompanyName || "Customer"} - Jotform Enterprise Quote`;
}

function normalizeSalespersonName(name: string) {
  return legacySalespersonNameMap.get(name) || name;
}

function setBrowserTitle(title: string) {
  document.title = title;
}

function currentProposal(source: ProposalData): ProposalData {
  const legacySource = source as LegacyProposalData;
  const recipientType = normalizeRecipientType(source.recipientType);
  const preparedByName = normalizeSalespersonName(source.preparedByName || "");
  const salesperson = salespersonOptions.find(
    (option) => option.name === preparedByName,
  );

  return {
    ...source,
    recipientType,
    customerName: source.customerName || "",
    customerCompany: source.customerCompany || legacySource.customerCountry || "",
    customerAddress: source.customerAddress || "",
    resellerName: source.resellerName || "",
    resellerAddress: source.resellerAddress || "",
    preparedByName,
    salespersonEmail: source.salespersonEmail || salesperson?.email || "",
    jotformEntityName: source.jotformEntityName || jotformEntityOptions[0].name,
    quoteNumber:
      source.quoteNumber || quoteNumberForSalesperson(preparedByName) || "",
    eligibilityDiscountType: normalizeEligibilityDiscountType(
      source.eligibilityDiscountType,
    ),
    resellerDiscountType: normalizeResellerDiscountType(
      source.resellerDiscountType || source.eligibilityDiscountType,
      recipientType,
    ),
    customDiscountName: "",
    customDiscountPercent: "",
    selectedQuoteTerms: normalizeQuoteTermValues(source.selectedQuoteTerms),
    customQuoteTermLabel: source.customQuoteTermLabel || "",
    customQuoteTermMonths:
      source.customQuoteTermMonths ||
      legacyCustomTermMonths(legacySource.customQuoteTermYears),
    customQuoteTermDiscountPercent: source.customQuoteTermDiscountPercent || "",
    pricingOptions: source.pricingOptions?.length
      ? source.pricingOptions.map(normalizePricingOption)
      : cloneProposal(emptyProposal).pricingOptions,
    proposalDate: todayQuoteDate(),
    documentText: normalizeDocumentText(source.documentText),
  };
}

function normalizeRecipientType(value: unknown): QuoteRecipientType {
  return value === "reseller" ? "reseller" : "customer";
}

function isEligibilityDiscountAllowed(
  value: EligibilityDiscountType,
) {
  return eligibilityDiscountOptions.some(
    (option) => option.value === value,
  );
}

function normalizeEligibilityDiscountType(
  value: unknown,
): EligibilityDiscountType {
  const normalizedValue =
    value === "education" ||
    value === "nonprofit"
      ? value
      : "none";

  return isEligibilityDiscountAllowed(normalizedValue)
    ? normalizedValue
    : "none";
}

function normalizeResellerDiscountType(
  value: unknown,
  recipientType: QuoteRecipientType,
): ResellerDiscountType {
  if (recipientType !== "reseller") return "none";

  if (
    value === "reseller30" ||
    value === "reseller20" ||
    value === "reseller10"
  ) {
    return value;
  }

  if (value === "reseller15") return "reseller20";

  return "none";
}

function eligibilityDiscountForType(type: EligibilityDiscountType) {
  return (
    eligibilityDiscountOptions.find((option) => option.value === type) ||
    eligibilityDiscountOptions[0]
  );
}

function resellerDiscountForType(type: ResellerDiscountType) {
  return (
    resellerDiscountOptions.find((option) => option.value === type) ||
    resellerDiscountOptions[0]
  );
}

function normalizeDocumentText(source?: Partial<DocumentText>): DocumentText {
  const normalizedSource = { ...(source || {}) };

  if (normalizedSource.costPerYearHeader === "Cost Per Year") {
    normalizedSource.costPerYearHeader = defaultDocumentText.costPerYearHeader;
  }

  if (
    normalizedSource.costPerYearHeader === "Annual Unit Fees" ||
    normalizedSource.costPerYearHeader === "Annual Unit\nFees"
  ) {
    normalizedSource.costPerYearHeader = defaultDocumentText.costPerYearHeader;
  }

  if (normalizedSource.totalDueHeader === "Total Due") {
    normalizedSource.totalDueHeader = defaultDocumentText.totalDueHeader;
  }

  if (
    normalizedSource.totalDueHeader === "Total Fees for Term" ||
    normalizedSource.totalDueHeader === "Total Fees for\nTerm"
  ) {
    normalizedSource.totalDueHeader = defaultDocumentText.totalDueHeader;
  }

  if (normalizedSource.numberOfYearsHeader === "Number of Years") {
    normalizedSource.numberOfYearsHeader =
      defaultDocumentText.numberOfYearsHeader;
  }

  if (normalizedSource.customDiscountLabel === "Custom discount") {
    normalizedSource.customDiscountLabel = defaultDocumentText.customDiscountLabel;
  }

  return {
    ...defaultDocumentText,
    ...normalizedSource,
    defaultNotes: Array.isArray(source?.defaultNotes)
      ? source.defaultNotes
      : [...defaultDocumentText.defaultNotes],
  };
}

function normalizeQuoteTermValues(values: unknown): QuoteTermValue[] {
  if (!Array.isArray(values)) return [];

  return allSelectableQuoteTermValues.filter((value) => values.includes(value));
}

function customQuoteTerm(proposal: ProposalData): QuoteTermOption {
  const months = positiveNumber(proposal.customQuoteTermMonths, 12) || 12;
  const years = months / 12;
  const discountPercent = positiveNumber(proposal.customQuoteTermDiscountPercent);
  const fallbackLabel = formatTermMonthsLabel(months);

  return {
    value: "custom",
    label: proposal.customQuoteTermLabel.trim() || fallbackLabel,
    months,
    years,
    discountPercent,
  };
}

function legacyCustomTermMonths(yearsInput?: string) {
  const years = positiveNumber(yearsInput || "");

  return years > 0 ? String(years * 12) : "";
}

function formatTermMonthsLabel(months: number) {
  const formattedMonths = formatPlainNumber(months);

  return `${formattedMonths} ${months === 1 ? "month" : "months"}`;
}

function quoteTermDocumentLabel(term: QuoteTermOption) {
  return term.value === "2_no_discount" ? "2 years" : term.label;
}

function formatPlainNumber(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function selectedQuoteTerms(values: QuoteTermValue[], proposal?: ProposalData) {
  const normalizedValues = normalizeQuoteTermValues(values);

  if (normalizedValues.length === 0) return [quoteTermOptions[0]];

  const selectedTerms = quoteTermOptions.filter((term) =>
    normalizedValues.includes(term.value),
  );

  if (proposal && normalizedValues.includes("custom")) {
    selectedTerms.push(customQuoteTerm(proposal));
  }

  return selectedTerms.length ? selectedTerms : [quoteTermOptions[0]];
}

function isQuoteTermSelected(values: QuoteTermValue[], value: QuoteTermValue) {
  const normalizedValues = normalizeQuoteTermValues(values);

  return normalizedValues.length === 0
    ? value === "1"
    : normalizedValues.includes(value);
}

function normalizeProductName(productName: string) {
  return legacyProductNameMap.get(productName) || productName;
}

function quoteProductLabel(productName: string) {
  return productName.replace(/\(includes ([35]) users\)/g, "(includes $1 Users)");
}

function normalizePricingOption(
  option: LegacyPricingOption,
  optionIndex = 0,
): PricingOption {
  return {
    id: option.id || newId(`option-${optionIndex}`),
    rows: option.rows?.length
      ? option.rows.map((pricingRow, rowIndex) => ({
          id: pricingRow.id || newId(`row-${rowIndex}`),
          productName: normalizeProductName(pricingRow.productName || ""),
          displayName: pricingRow.displayName || "",
          quantity: pricingRow.quantity || "",
          unitPriceOverride: pricingRow.unitPriceOverride || "",
          waived: pricingRow.waived || false,
        }))
      : [row(newId("row"), "", "")],
  };
}

function primaryPricingOption(proposal: ProposalData): PricingOption {
  return proposal.pricingOptions[0] || emptyProposal.pricingOptions[0];
}

function numberFromInput(value: string, fallback = 0) {
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizedMoneyInput(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue ? String(positiveNumber(trimmedValue)) : "";
}

function positiveNumber(value: string, fallback = 0) {
  return Math.max(0, numberFromInput(value, fallback));
}

function formatMoney(value: number, currency: CurrencyCode) {
  const rounded = Math.round(value * 100) / 100;
  const hasCents = Math.abs(rounded % 1) > 0;

  return `${currencySymbols[currency]}${rounded.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

function unitPriceFromRow(pricingRow: PricingRow, defaultUnitPrice: number) {
  const override = pricingRow.unitPriceOverride?.trim();

  return override ? positiveNumber(override) : defaultUnitPrice;
}

function isCustomPriceProduct(product?: ProductPrice) {
  return Boolean(product?.customPriceRequired);
}

function isCustomProductRow(pricingRow: PricingRow) {
  return pricingRow.productName === customProductName;
}

function hasCustomPriceAmount(pricingRow: PricingRow) {
  return positiveNumber(pricingRow.unitPriceOverride || "") > 0;
}

function hasCustomProductDisplayName(pricingRow: PricingRow) {
  return Boolean(pricingRow.displayName?.trim());
}

function isMissingCustomPriceLine(line?: CalculatedLine) {
  return Boolean(
    line &&
      isCustomPriceProduct(line.product) &&
      !hasCustomPriceAmount(line.row),
  );
}

function isMissingCustomProductNameLine(line?: CalculatedLine) {
  return Boolean(
    line &&
      isCustomProductRow(line.row) &&
      !hasCustomProductDisplayName(line.row),
  );
}

function missingCustomPriceRows(proposal: ProposalData) {
  return primaryPricingOption(proposal).rows.filter((pricingRow) => {
    const product = productByName.get(pricingRow.productName);

    return isCustomPriceProduct(product) && !hasCustomPriceAmount(pricingRow);
  });
}

function missingCustomProductNameRows(proposal: ProposalData) {
  return primaryPricingOption(proposal).rows.filter(
    (pricingRow) =>
      isCustomProductRow(pricingRow) &&
      !hasCustomProductDisplayName(pricingRow),
  );
}

function priceInputValue(line?: CalculatedLine) {
  if (!line) return "";

  if (isCustomPriceProduct(line.product) && !line.row.unitPriceOverride?.trim()) {
    return "";
  }

  return line.row.unitPriceOverride?.trim()
    ? line.row.unitPriceOverride
    : String(line.defaultUnitPrice);
}

function isEligibilityDiscountLine(line: CalculatedLine) {
  return (
    line.product?.category === "Base Packages" ||
    eligibilityDiscountProductNames.has(line.row.productName)
  );
}

function calculateOption(
  option: PricingOption,
  currency: CurrencyCode,
  term: QuoteTermOption,
  eligibilityDiscountType: EligibilityDiscountType,
  resellerDiscountType: ResellerDiscountType,
  customDiscountInput: string,
): OptionTotals {
  const eligibilityDiscount = eligibilityDiscountForType(
    eligibilityDiscountType,
  );
  const resellerDiscount = resellerDiscountForType(resellerDiscountType);
  const customDiscountPercent = positiveNumber(customDiscountInput);
  const termDiscountPercent = term.discountPercent;

  const lines = option.rows.map((pricingRow) => {
    const product = productByName.get(pricingRow.productName);
    const quantity = positiveNumber(pricingRow.quantity);
    const defaultUnitPrice = product?.prices[currency] ?? 0;
    const unitPrice = unitPriceFromRow(pricingRow, defaultUnitPrice);
    const termMultiplier = product?.annual === false ? 1 : term.years;
    const isWaived = product?.category === "One-Time Fees" && pricingRow.waived;
    const total = isWaived ? 0 : unitPrice * quantity * termMultiplier;
    const line: CalculatedLine = {
      row: pricingRow,
      product,
      quantity,
      defaultUnitPrice,
      unitPrice,
      total,
      eligibilityDiscountAmount: 0,
      resellerDiscountAmount: 0,
    };

    return {
      ...line,
      eligibilityDiscountAmount: isEligibilityDiscountLine(line)
        ? total * (eligibilityDiscount.percent / 100)
        : 0,
      resellerDiscountAmount: total * (resellerDiscount.percent / 100),
    };
  });

  const recurringSubtotal = lines
    .filter((line) => line.product?.annual !== false)
    .reduce((sum, line) => sum + line.total, 0);
  const oneTimeSubtotal = lines
    .filter((line) => line.product?.annual === false)
    .reduce((sum, line) => sum + line.total, 0);
  const eligibilityDiscountAmount = lines.reduce(
    (sum, line) => sum + line.eligibilityDiscountAmount,
    0,
  );
  const resellerDiscountAmount = lines.reduce(
    (sum, line) => sum + line.resellerDiscountAmount,
    0,
  );
  const recurringResellerDiscountAmount = lines
    .filter((line) => line.product?.annual !== false)
    .reduce((sum, line) => sum + line.resellerDiscountAmount, 0);
  const oneTimeResellerDiscountAmount = resellerDiscountAmount -
    recurringResellerDiscountAmount;
  const recurringAfterStandardDiscounts =
    recurringSubtotal - eligibilityDiscountAmount - recurringResellerDiscountAmount;
  const customDiscountAmount =
    recurringAfterStandardDiscounts * (customDiscountPercent / 100);
  const recurringAfterCustom =
    recurringAfterStandardDiscounts - customDiscountAmount;
  const termDiscountAmount =
    recurringAfterCustom * (termDiscountPercent / 100);
  const subtotalBeforeDiscounts = recurringSubtotal + oneTimeSubtotal;
  const totalDiscountAmount =
    eligibilityDiscountAmount +
    resellerDiscountAmount +
    customDiscountAmount +
    termDiscountAmount;

  return {
    lines,
    recurringSubtotal,
    oneTimeSubtotal,
    subtotalBeforeDiscounts,
    eligibilityDiscountLabel: eligibilityDiscount.discountLabel,
    eligibilityDiscountPercent: eligibilityDiscount.percent,
    eligibilityDiscountAmount,
    resellerDiscountLabel: resellerDiscount.discountLabel,
    resellerDiscountPercent: resellerDiscount.percent,
    resellerDiscountAmount,
    customDiscountAmount,
    termDiscountAmount,
    totalDiscountAmount,
    total:
      recurringAfterCustom -
      termDiscountAmount +
      oneTimeSubtotal -
      oneTimeResellerDiscountAmount,
    termYears: term.years,
    termMonths: term.months,
    customDiscountPercent,
    termDiscountPercent,
  };
}

export function QuoteGenerator() {
  const [proposal, setProposal] = useState<ProposalData>(() =>
    cloneProposal(emptyProposal),
  );
  const [pdfValidationMessage, setPdfValidationMessage] = useState("");
  const [generatorPanelWidth, setGeneratorPanelWidth] = useState(
    defaultGeneratorPanelWidth,
  );
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFeedbackFrameLoaded, setIsFeedbackFrameLoaded] = useState(false);
  const datedProposal = currentProposal(proposal);

  function maxAvailableGeneratorPanelWidth() {
    const viewportMax =
      typeof window === "undefined"
        ? maxGeneratorPanelWidth
        : Math.max(minGeneratorPanelWidth, window.innerWidth - 420);

    return Math.min(maxGeneratorPanelWidth, viewportMax);
  }

  function clampGeneratorPanelWidth(width: number) {
    return Math.min(
      Math.max(width, minGeneratorPanelWidth),
      maxAvailableGeneratorPanelWidth(),
    );
  }

  useEffect(() => {
    let animationFrame = 0;

    function syncGeneratorPanelWidth() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        setGeneratorPanelWidth(maxAvailableGeneratorPanelWidth());
      });
    }

    syncGeneratorPanelWidth();
    window.addEventListener("resize", syncGeneratorPanelWidth);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", syncGeneratorPanelWidth);
    };
  }, []);

  useEffect(() => {
    if (!isFeedbackOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFeedbackOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isFeedbackOpen]);

  function updateProposal<K extends keyof ProposalData>(
    key: K,
    value: ProposalData[K],
  ) {
    setProposal((current) => ({ ...current, [key]: value }));
  }

  function updateRecipientType(type: QuoteRecipientType) {
    setProposal((current) => ({
      ...current,
      recipientType: type,
      eligibilityDiscountType: normalizeEligibilityDiscountType(
        current.eligibilityDiscountType,
      ),
      resellerDiscountType: normalizeResellerDiscountType(
        current.resellerDiscountType,
        type,
      ),
    }));
  }

  function updateSalespersonName(name: string) {
    const salesperson = salespersonOptions.find((option) => option.name === name);

    setProposal((current) => ({
      ...current,
      preparedByName: name,
      salespersonEmail: salesperson?.email || "",
      quoteNumber: quoteNumberForSalesperson(name),
    }));
  }

  function updateJotformEntityName(name: string) {
    const entity = jotformEntityOptions.find((option) => option.name === name);

    setProposal((current) => {
      const documentText = normalizeDocumentText(current.documentText);

      return {
        ...current,
        jotformEntityName: name,
        documentText: entity
          ? {
              ...documentText,
              sellerName: entity.name,
              sellerAddress: entity.address,
              taxIdLabel: entity.taxIdLabel,
              taxId: entity.taxId,
            }
          : documentText,
      };
    });
  }

  function updateDocumentText<K extends keyof DocumentText>(
    key: K,
    value: DocumentText[K],
  ) {
    setProposal((current) => ({
      ...current,
      jotformEntityName: entityDocumentTextKeys.has(key)
        ? ""
        : current.jotformEntityName,
      documentText: {
        ...normalizeDocumentText(current.documentText),
        [key]: value,
      },
    }));
  }

  function updateDefaultDocumentNote(index: number, value: string) {
    setProposal((current) => {
      const documentText = normalizeDocumentText(current.documentText);

      return {
        ...current,
        documentText: {
          ...documentText,
          defaultNotes: documentText.defaultNotes.map((note, noteIndex) =>
            noteIndex === index ? value : note,
          ),
        },
      };
    });
  }

  function addDefaultDocumentNote() {
    setProposal((current) => {
      const documentText = normalizeDocumentText(current.documentText);

      return {
        ...current,
        documentText: {
          ...documentText,
          defaultNotes: [...documentText.defaultNotes, ""],
        },
      };
    });
  }

  function removeDefaultDocumentNote(index: number) {
    setProposal((current) => {
      const documentText = normalizeDocumentText(current.documentText);

      return {
        ...current,
        documentText: {
          ...documentText,
          defaultNotes: documentText.defaultNotes.filter(
            (_, noteIndex) => noteIndex !== index,
          ),
        },
      };
    });
  }

  function updatePricingRow(
    optionId: string,
    rowId: string,
    patch: Partial<PricingRow>,
  ) {
    setProposal((current) => ({
      ...current,
      pricingOptions: current.pricingOptions.map((option) =>
        option.id === optionId
          ? {
              ...option,
              rows: option.rows.map((pricingRow) =>
                pricingRow.id === rowId
                  ? { ...pricingRow, ...patch }
                  : pricingRow,
              ),
            }
          : option,
      ),
    }));
  }

  function addPricingRow(optionId: string) {
    setProposal((current) => ({
      ...current,
      pricingOptions: current.pricingOptions.map((option) =>
        option.id === optionId
          ? {
              ...option,
              rows: [...option.rows, row(newId("row"), "", "")],
            }
          : option,
      ),
    }));
  }

  function toggleQuoteTerm(value: QuoteTermValue) {
    setProposal((current) => {
      const currentValues = normalizeQuoteTermValues(current.selectedQuoteTerms);
      const activeValues = currentValues.length > 0 ? currentValues : ["1"];
      const nextValues = activeValues.includes(value)
        ? activeValues.filter((termValue) => termValue !== value)
        : [...activeValues, value];
      const normalizedNextValues = allSelectableQuoteTermValues.filter((termValue) =>
        nextValues.includes(termValue),
      );

      return {
        ...current,
        selectedQuoteTerms:
          normalizedNextValues.length === 0 ? ["1"] : normalizedNextValues,
      };
    });
  }

  function removePricingRow(optionId: string, rowId: string) {
    setProposal((current) => ({
      ...current,
      pricingOptions: current.pricingOptions.map((option) =>
        option.id === optionId
          ? {
              ...option,
              rows:
                option.rows.length === 1
                  ? option.rows
                  : option.rows.filter((pricingRow) => pricingRow.id !== rowId),
            }
          : option,
      ),
    }));
  }

  function movePricingRow(
    optionId: string,
    rowId: string,
    direction: -1 | 1,
  ) {
    setProposal((current) => ({
      ...current,
      pricingOptions: current.pricingOptions.map((option) => {
        if (option.id !== optionId) return option;

        const currentIndex = option.rows.findIndex(
          (pricingRow) => pricingRow.id === rowId,
        );
        const nextIndex = currentIndex + direction;

        if (
          currentIndex < 0 ||
          nextIndex < 0 ||
          nextIndex >= option.rows.length
        ) {
          return option;
        }

        const rows = [...option.rows];
        [rows[currentIndex], rows[nextIndex]] = [
          rows[nextIndex],
          rows[currentIndex],
        ];

        return {
          ...option,
          rows,
        };
      }),
    }));
  }

  function updateAdditionalNote(index: number, value: string) {
    setProposal((current) => ({
      ...current,
      additionalNotes: current.additionalNotes.map((note, noteIndex) =>
        noteIndex === index ? value : note,
      ),
    }));
  }

  function addAdditionalNote() {
    setProposal((current) => ({
      ...current,
      additionalNotes: [...current.additionalNotes, ""],
    }));
  }

  function removeAdditionalNote(index: number) {
    setProposal((current) => ({
      ...current,
      additionalNotes: current.additionalNotes.filter(
        (_, noteIndex) => noteIndex !== index,
      ),
    }));
  }

  function printProposal() {
    const missingNameRows = missingCustomProductNameRows(datedProposal);
    const missingPriceRows = missingCustomPriceRows(datedProposal);

    if (missingNameRows.length > 0 || missingPriceRows.length > 0) {
      setPdfValidationMessage(
        missingNameRows.length > 0 && missingPriceRows.length > 0
          ? "Custom product name and amount are required before downloading the PDF."
          : missingNameRows.length > 0
            ? "Custom product name is required before downloading the PDF."
            : "Custom amount is required before downloading the PDF.",
      );
      window.requestAnimationFrame(() => {
        const firstMissingInput = document.querySelector(
          "[data-required-custom-product-name='true'], [data-required-custom-price='true']",
        );

        if (firstMissingInput instanceof HTMLElement) {
          firstMissingInput.focus();
        }
      });
      return;
    }

    setPdfValidationMessage("");
    const previousTitle = document.title;
    let titleRestored = false;
    const restoreTitle = () => {
      if (titleRestored) return;
      titleRestored = true;
      setBrowserTitle(previousTitle);
      window.removeEventListener("afterprint", restoreTitle);
    };

    setBrowserTitle(quotePdfTitle(datedProposal));
    window.addEventListener("afterprint", restoreTitle, { once: true });
    window.print();
    window.setTimeout(restoreTitle, 60000);
  }

  function openFeedbackForm() {
    setIsFeedbackFrameLoaded(false);
    setIsFeedbackOpen(true);
  }

  function closeFeedbackForm() {
    setIsFeedbackOpen(false);
  }

  function refreshProposal() {
    setProposal(cloneProposal(emptyProposal));
  }

  function startGeneratorPanelResize(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = generatorPanelWidth;
    const resizeHandle = event.currentTarget;
    const pointerId = event.pointerId;
    let nextWidth = startWidth;

    resizeHandle.setPointerCapture(pointerId);

    function handlePointerMove(moveEvent: PointerEvent) {
      nextWidth = clampGeneratorPanelWidth(
        startWidth + moveEvent.clientX - startX,
      );
      setGeneratorPanelWidth(nextWidth);
    }

    function handlePointerUp() {
      resizeHandle.releasePointerCapture(pointerId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  const pricingOption = primaryPricingOption(datedProposal);
  const selectedTermsForTotals = selectedQuoteTerms(
    datedProposal.selectedQuoteTerms,
    datedProposal,
  );
  const editorTerm =
    selectedTermsForTotals.find((term) => term.value === "custom") ||
    selectedTermsForTotals[0] ||
    quoteTermOptions[0];
  const editorTotals = calculateOption(
    pricingOption,
    datedProposal.currency,
    editorTerm,
    datedProposal.eligibilityDiscountType,
    datedProposal.resellerDiscountType,
    datedProposal.customDiscountPercent,
  );
  const standardDiscountOptions = eligibilityDiscountOptions;

  return (
    <main
      className="proposal-app"
      style={
        {
          "--generator-panel-width": `${generatorPanelWidth}px`,
        } as CSSProperties
      }
    >
      <aside className="generator-panel no-print">
        <div className="generator-header">
          <div className="site-brand">
            <Image
              className="site-brand-logo"
              src="/jotform-logo.png"
              alt=""
              aria-hidden="true"
              width={51}
              height={50}
              unoptimized
            />
            <div>
              <p className="kicker">Jotform Enterprise</p>
              <h1>Quote Generator</h1>
            </div>
          </div>
        </div>

        <section className="editor-section">
          <div className="section-heading">
            <h2>Quote Details</h2>
          </div>
          <div className="form-grid">
            <label className="field-label">
              Recipient type
              <select
                className="field"
                value={proposal.recipientType}
                onChange={(event) =>
                  updateRecipientType(event.target.value as QuoteRecipientType)
                }
              >
                <option value="customer">Customer</option>
                <option value="reseller">Reseller</option>
              </select>
            </label>
            <label className="field-label">
              Quote date
              <input
                className="field"
                value={datedProposal.proposalDate}
                readOnly
              />
            </label>
            {datedProposal.recipientType === "customer" ? (
              <>
                <label className="field-label">
                  Contact name
                  <input
                    className="field"
                    value={proposal.customerName}
                    onChange={(event) =>
                      updateProposal("customerName", event.target.value)
                    }
                  />
                </label>
                <label className="field-label">
                  Company name
                  <input
                    className="field"
                    value={proposal.customerCompany}
                    onChange={(event) =>
                      updateProposal("customerCompany", event.target.value)
                    }
                  />
                </label>
                <label className="field-label wide-field">
                  Customer address
                  <textarea
                    className="field address-field"
                    value={proposal.customerAddress}
                    onChange={(event) =>
                      updateProposal("customerAddress", event.target.value)
                    }
                  />
                </label>
              </>
            ) : (
              <>
                <label className="field-label">
                  Reseller name
                  <input
                    className="field"
                    value={proposal.resellerName}
                    onChange={(event) =>
                      updateProposal("resellerName", event.target.value)
                    }
                  />
                </label>
                <label className="field-label wide-field">
                  Reseller address
                  <textarea
                    className="field address-field"
                    value={proposal.resellerAddress}
                    onChange={(event) =>
                      updateProposal("resellerAddress", event.target.value)
                    }
                  />
                </label>
                <label className="field-label">
                  Contact name
                  <input
                    className="field"
                    value={proposal.customerName}
                    onChange={(event) =>
                      updateProposal("customerName", event.target.value)
                    }
                  />
                </label>
                <label className="field-label">
                  Company name
                  <input
                    className="field"
                    value={proposal.customerCompany}
                    onChange={(event) =>
                      updateProposal("customerCompany", event.target.value)
                    }
                  />
                </label>
                <label className="field-label wide-field">
                  Customer address
                  <textarea
                    className="field address-field"
                    value={proposal.customerAddress}
                    onChange={(event) =>
                      updateProposal("customerAddress", event.target.value)
                    }
                  />
                </label>
              </>
            )}
            <label className="field-label">
              Salesperson name
              <select
                className="field"
                value={proposal.preparedByName}
                onChange={(event) => updateSalespersonName(event.target.value)}
              >
                <option value="">Select prepared by</option>
                {salespersonOptions.map((salesperson) => (
                  <option key={salesperson.name} value={salesperson.name}>
                    {salesperson.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Jotform entity
              <select
                className="field"
                value={proposal.jotformEntityName}
                onChange={(event) => updateJotformEntityName(event.target.value)}
              >
                <option value="">Select Jotform entity</option>
                {jotformEntityOptions.map((entity) => (
                  <option key={entity.name} value={entity.name}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="editor-section">
          <div className="section-heading">
            <h2>Quote Items</h2>
          </div>

          <label className="field-label currency-row">
            Currency
            <select
              className="field"
              value={proposal.currency}
              onChange={(event) =>
                updateProposal("currency", event.target.value as CurrencyCode)
              }
            >
              {currencyCodes.map((currency) => (
                <option key={currency} value={currency}>
                  {currency} ({currencySymbols[currency]})
                </option>
              ))}
            </select>
          </label>

          <div className="pricing-editor">
            <article className="pricing-option-editor">
              <div className="pricing-row-head">
                <span />
                <span>Product</span>
                <span>Qty</span>
                <span>Unit</span>
                <span>Total</span>
                <span />
              </div>
              {pricingOption.rows.map((pricingRow) => {
                const line = editorTotals.lines.find(
                  (candidate) => candidate.row.id === pricingRow.id,
                );
                const isOneTimeFee =
                  line?.product?.category === "One-Time Fees";
                const isCustomProduct = isCustomProductRow(pricingRow);
                const rowIndex = pricingOption.rows.findIndex(
                  (candidate) => candidate.id === pricingRow.id,
                );
                const isFirstRow = rowIndex === 0;
                const isLastRow = rowIndex === pricingOption.rows.length - 1;

                return (
                  <div className="pricing-row-editor" key={pricingRow.id}>
                    <div className="row-reorder-controls">
                      <button
                        className="row-move-button row-move-up"
                        type="button"
                        disabled={isFirstRow}
                        onClick={() =>
                          movePricingRow(pricingOption.id, pricingRow.id, -1)
                        }
                        aria-label="Move row up"
                        title="Move row up"
                      />
                      <button
                        className="row-move-button row-move-down"
                        type="button"
                        disabled={isLastRow}
                        onClick={() =>
                          movePricingRow(pricingOption.id, pricingRow.id, 1)
                        }
                        aria-label="Move row down"
                        title="Move row down"
                      />
                    </div>
                    <div className="product-field-wrap">
                      <select
                        className="field compact-field product-select"
                        value={pricingRow.productName}
                        onChange={(event) => {
                          const nextProductName = event.target.value;
                          const nextProduct = productByName.get(nextProductName);
                          updatePricingRow(pricingOption.id, pricingRow.id, {
                            productName: nextProductName,
                            displayName: "",
                            quantity:
                              nextProductName &&
                              !positiveNumber(pricingRow.quantity)
                                ? "1"
                                : pricingRow.quantity,
                            unitPriceOverride: "",
                            waived:
                              nextProduct?.category === "One-Time Fees"
                                ? pricingRow.waived
                                : false,
                          });
                          if (pdfValidationMessage) setPdfValidationMessage("");
                        }}
                        aria-label="Product"
                      >
                        <option value="">Select product</option>
                        {productGroups.map((group) => (
                          <optgroup key={group} label={group}>
                            {productPrices
                              .filter(
                                (product) =>
                                  product.category === group &&
                                  product.product !== customProductName,
                              )
                              .map((product) => (
                                <option
                                  key={product.product}
                                  value={product.product}
                                >
                                  {product.product}
                                </option>
                            ))}
                          </optgroup>
                        ))}
                        <option value={customProductName}>
                          {customProductName}
                        </option>
                      </select>
                      {isCustomProduct ? (
                        <input
                          className={`field compact-field custom-product-name-field ${
                            isMissingCustomProductNameLine(line)
                              ? "field-error"
                              : ""
                          }`}
                          value={pricingRow.displayName || ""}
                          placeholder="Product name"
                          required
                          data-required-custom-product-name={
                            isMissingCustomProductNameLine(line)
                              ? "true"
                              : undefined
                          }
                          onChange={(event) => {
                            updatePricingRow(pricingOption.id, pricingRow.id, {
                              displayName: event.target.value,
                            });
                            if (pdfValidationMessage) setPdfValidationMessage("");
                          }}
                          aria-label="Custom product name"
                          aria-invalid={isMissingCustomProductNameLine(line)}
                        />
                      ) : null}
                      {isMissingCustomProductNameLine(line) ? (
                        <span className="custom-price-required-message">
                          Product name required
                        </span>
                      ) : null}
                    </div>
                    <input
                      className="field compact-field quantity-field"
                      inputMode="decimal"
                      value={pricingRow.quantity}
                      onChange={(event) =>
                        updatePricingRow(pricingOption.id, pricingRow.id, {
                          quantity: event.target.value,
                        })
                      }
                      aria-label="Quantity"
                    />
                    <div className="money-field-wrap">
                      <input
                        className={`field compact-field money-field ${
                          isMissingCustomPriceLine(line) ? "field-error" : ""
                        }`}
                        inputMode="decimal"
                        value={priceInputValue(line)}
                        placeholder={
                          isCustomPriceProduct(line?.product)
                            ? "Required"
                            : ""
                        }
                        required={isCustomPriceProduct(line?.product)}
                        data-required-custom-price={
                          isMissingCustomPriceLine(line) ? "true" : undefined
                        }
                        onChange={(event) => {
                          updatePricingRow(pricingOption.id, pricingRow.id, {
                            unitPriceOverride: event.target.value,
                          });
                          if (pdfValidationMessage) setPdfValidationMessage("");
                        }}
                        aria-label="Unit price"
                        aria-invalid={isMissingCustomPriceLine(line)}
                      />
                      {isMissingCustomPriceLine(line) ? (
                        <span className="custom-price-required-message">
                          Required before downloading PDF
                        </span>
                      ) : null}
                    </div>
                    {isOneTimeFee ? (
                      <div className="waived-total-cell">
                        <label className="waived-control">
                          <input
                            type="checkbox"
                            checked={Boolean(pricingRow.waived)}
                            onChange={(event) =>
                              updatePricingRow(pricingOption.id, pricingRow.id, {
                                waived: event.target.checked,
                              })
                            }
                          />
                          <span>Waived</span>
                        </label>
                        <span className="calculated-cell">
                          {pricingRow.waived
                            ? "Waived"
                            : formatMoney(line?.total ?? 0, proposal.currency)}
                        </span>
                      </div>
                    ) : (
                      <span className="calculated-cell">
                        {formatMoney(line?.total ?? 0, proposal.currency)}
                      </span>
                    )}
                    <button
                      className="icon-button small-icon-button"
                      onClick={() =>
                        removePricingRow(pricingOption.id, pricingRow.id)
                      }
                      aria-label="Remove row"
                      title="Remove row"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                );
              })}

              <div className="pricing-option-footer">
                <button
                  className="secondary-button"
                  onClick={() => addPricingRow(pricingOption.id)}
                >
                  Add row
                </button>
                <div className="pricing-summary-editor">
                  <div>
                    <span>{formatTermMonthsLabel(editorTerm.months)} recurring</span>
                    <strong>
                      {formatMoney(
                        editorTotals.recurringSubtotal,
                        proposal.currency,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>One-time</span>
                    <strong>
                      {formatMoney(editorTotals.oneTimeSubtotal, proposal.currency)}
                    </strong>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="editor-section">
          <div className="section-heading">
            <h2>Discount</h2>
          </div>
          <div className="discount-grid">
            <label className="field-label discount-field standard-discount-field">
              Education / Non-profit discount
              <select
                className="field"
                value={datedProposal.eligibilityDiscountType}
                onChange={(event) =>
                  updateProposal(
                    "eligibilityDiscountType",
                    event.target.value as EligibilityDiscountType,
                  )
                }
              >
                {standardDiscountOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {datedProposal.recipientType === "reseller" ? (
              <label className="field-label discount-field standard-discount-field">
                Reseller discount
                <select
                  className="field"
                  value={datedProposal.resellerDiscountType}
                  onChange={(event) =>
                    updateProposal(
                      "resellerDiscountType",
                      event.target.value as ResellerDiscountType,
                    )
                  }
                >
                  {resellerDiscountOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </section>

        <section className="editor-section">
          <div className="section-heading">
            <h2>Quote Terms</h2>
          </div>
          <details className="term-dropdown">
            <summary>
              {selectedQuoteTerms(datedProposal.selectedQuoteTerms, datedProposal)
                .map((term) => term.label)
                .join(", ")}
            </summary>
            <div className="term-grid">
              {quoteTermOptions.map((term) => (
                <label className="term-toggle" key={term.value}>
                  <input
                    type="checkbox"
                    checked={isQuoteTermSelected(
                      datedProposal.selectedQuoteTerms,
                      term.value,
                    )}
                    onChange={() => toggleQuoteTerm(term.value)}
                  />
                  <span>
                    <strong>{term.label}</strong>
                    <small>
                      {term.discountPercent > 0
                        ? `${term.discountPercent}% discount`
                        : "No term discount"}
                    </small>
                  </span>
                </label>
              ))}
              <label className="term-toggle custom-term-toggle">
                <input
                  type="checkbox"
                  checked={isQuoteTermSelected(
                    datedProposal.selectedQuoteTerms,
                    "custom",
                  )}
                  onChange={() => toggleQuoteTerm("custom")}
                />
                <span>
                  <strong>Custom term</strong>
                  <small>Set label, months, and optional discount</small>
                </span>
              </label>
              {isQuoteTermSelected(datedProposal.selectedQuoteTerms, "custom") ? (
                <div className="custom-term-fields">
                  <label className="field-label">
                    Term label
                    <input
                      className="field"
                      value={proposal.customQuoteTermLabel}
                      placeholder="e.g. 18 months"
                      onChange={(event) =>
                        updateProposal("customQuoteTermLabel", event.target.value)
                      }
                    />
                  </label>
                  <label className="field-label">
                    Number of months
                    <input
                      className="field"
                      inputMode="decimal"
                      value={proposal.customQuoteTermMonths}
                      placeholder="e.g. 18"
                      onChange={(event) =>
                        updateProposal("customQuoteTermMonths", event.target.value)
                      }
                    />
                  </label>
                  <label className="field-label">
                    Discount %
                    <input
                      className="field"
                      inputMode="decimal"
                      value={proposal.customQuoteTermDiscountPercent}
                      placeholder="Optional"
                      onChange={(event) =>
                        updateProposal(
                          "customQuoteTermDiscountPercent",
                          event.target.value,
                        )
                      }
                    />
                  </label>
                </div>
              ) : null}
            </div>
          </details>
        </section>

        <section className="editor-section">
          <div className="section-heading">
            <h2>Notes</h2>
            <button className="secondary-button" onClick={addAdditionalNote}>
              Add note
            </button>
          </div>
          <div className="note-editor">
            {proposal.additionalNotes.map((note, index) => (
              <div className="note-row" key={`note-${index}`}>
                <textarea
                  className="field note-field"
                  value={note}
                  onChange={(event) =>
                    updateAdditionalNote(index, event.target.value)
                  }
                  aria-label={`Note ${index + 1}`}
                />
                <button
                  className="icon-button"
                  onClick={() => removeAdditionalNote(index)}
                  aria-label="Remove note"
                  title="Remove note"
                >
                  -
                </button>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <button
        className="panel-resize-handle no-print"
        type="button"
        aria-label="Resize quote generator panel"
        title="Resize quote generator panel"
        onPointerDown={startGeneratorPanelResize}
      />

      <section className="preview-shell">
        <div className="preview-actions no-print">
          <button className="primary-button" onClick={printProposal}>
            Download PDF
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={openFeedbackForm}
          >
            Give feedback
          </button>
          <button className="secondary-button" onClick={refreshProposal}>
            Refresh
          </button>
        </div>
        {pdfValidationMessage ? (
          <p className="pdf-validation-message no-print" role="alert">
            {pdfValidationMessage}
          </p>
        ) : null}

        <QuoteDocument
          proposal={datedProposal}
          onPartyFieldChange={updateProposal}
          onPricingRowChange={updatePricingRow}
          onDocumentTextChange={updateDocumentText}
          onDefaultDocumentNoteChange={updateDefaultDocumentNote}
          onAddDefaultDocumentNote={addDefaultDocumentNote}
          onRemoveDefaultDocumentNote={removeDefaultDocumentNote}
        />
      </section>

      {isFeedbackOpen ? (
        <div
          className="feedback-modal-backdrop no-print"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeFeedbackForm();
          }}
        >
          <section
            className="feedback-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Give feedback"
          >
            <button
              className="feedback-modal-close"
              type="button"
              onClick={closeFeedbackForm}
              aria-label="Close feedback form"
              autoFocus
            >
              ×
            </button>
            <div className="feedback-modal-body">
              {!isFeedbackFrameLoaded ? (
                <div className="feedback-modal-loading" role="status">
                  Loading feedback form…
                </div>
              ) : null}
              <iframe
                className="feedback-modal-frame"
                src="https://form.jotform.com/262111315426041"
                title="Give feedback form"
                onLoad={() => setIsFeedbackFrameLoaded(true)}
              />
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function QuoteDocument({
  proposal,
  onPartyFieldChange,
  onPricingRowChange,
  onDocumentTextChange,
  onDefaultDocumentNoteChange,
  onAddDefaultDocumentNote,
  onRemoveDefaultDocumentNote,
}: {
  proposal: ProposalData;
  onPartyFieldChange: <K extends keyof ProposalData>(
    key: K,
    value: ProposalData[K],
  ) => void;
  onPricingRowChange: (
    optionId: string,
    rowId: string,
    patch: Partial<PricingRow>,
  ) => void;
  onDocumentTextChange: DocumentTextChangeHandler;
  onDefaultDocumentNoteChange: (index: number, value: string) => void;
  onAddDefaultDocumentNote: () => void;
  onRemoveDefaultDocumentNote: (index: number) => void;
}) {
  const pricingOption = primaryPricingOption(proposal);
  const quoteTerms = selectedQuoteTerms(proposal.selectedQuoteTerms, proposal);

  return (
    <div className="quote-output">
      <QuotePage
        proposal={proposal}
        options={quoteTerms.map((term, index) => ({
          optionLetter: String.fromCharCode(65 + index),
          term,
          totals: calculateOption(
            pricingOption,
            proposal.currency,
            term,
            proposal.eligibilityDiscountType,
            proposal.resellerDiscountType,
            proposal.customDiscountPercent,
          ),
        }))}
        pricingOptionId={pricingOption.id}
        onPartyFieldChange={onPartyFieldChange}
        onPricingRowChange={onPricingRowChange}
        onDocumentTextChange={onDocumentTextChange}
        onDefaultDocumentNoteChange={onDefaultDocumentNoteChange}
        onAddDefaultDocumentNote={onAddDefaultDocumentNote}
        onRemoveDefaultDocumentNote={onRemoveDefaultDocumentNote}
      />
    </div>
  );
}

function QuotePage({
  proposal,
  options,
  pricingOptionId,
  onPartyFieldChange,
  onPricingRowChange,
  onDocumentTextChange,
  onDefaultDocumentNoteChange,
  onAddDefaultDocumentNote,
  onRemoveDefaultDocumentNote,
}: {
  proposal: ProposalData;
  options: Array<{
    optionLetter: string;
    term: QuoteTermOption;
    totals: OptionTotals;
  }>;
  pricingOptionId: string;
  onPartyFieldChange: <K extends keyof ProposalData>(
    key: K,
    value: ProposalData[K],
  ) => void;
  onPricingRowChange: (
    optionId: string,
    rowId: string,
    patch: Partial<PricingRow>,
  ) => void;
  onDocumentTextChange: DocumentTextChangeHandler;
  onDefaultDocumentNoteChange: (index: number, value: string) => void;
  onAddDefaultDocumentNote: () => void;
  onRemoveDefaultDocumentNote: (index: number) => void;
}) {
  const documentText = proposal.documentText;
  const recipients = quoteRecipients(proposal, documentText);
  const showOptionLetters = options.length > 1;
  const showSingleCustomTermHeader =
    options.length === 1 && options[0]?.term.value === "custom";

  return (
    <article className="quote-page">
      <header className="quote-logo-row">
        <div className="quote-logo">
          <Image
            className="quote-brand-mark"
            src="/jotform-logo.png"
            alt=""
            aria-hidden="true"
            width={51}
            height={50}
            unoptimized
          />
          <EditableText
            value={documentText.brandName}
            placeholder="Brand"
            onChange={(value) => onDocumentTextChange("brandName", value)}
          />
        </div>
      </header>

      <table className="quote-info-table" aria-label="Quote details">
        <colgroup>
          <col className="quote-info-col-seller" />
          <col className="quote-info-col-spacer" />
          <col className="quote-info-col-date" />
          <col className="quote-info-col-meta" />
        </colgroup>
        <tbody>
          <tr className="quote-info-top-row">
            <td />
            <td />
            <td className="quote-date">
              <p>
                <EditableText
                  value={documentText.dateLabel}
                  placeholder="Date"
                  onChange={(value) => onDocumentTextChange("dateLabel", value)}
                />
              </p>
              <p>
                <strong>
                  {valueOrPlaceholder(proposal.proposalDate, "Quote date")}
                </strong>
              </p>
            </td>
            <td className="quote-meta">
              <p className="quote-title-line">
                <EditableText
                  value={documentText.quoteTitle}
                  placeholder="QUOTE"
                  onChange={(value) => onDocumentTextChange("quoteTitle", value)}
                />
              </p>
              <p>
                <PlainEditableText
                  value={proposal.quoteNumber}
                  placeholder="Quote number"
                  onChange={(value) => onPartyFieldChange("quoteNumber", value)}
                />
              </p>
              <p>
                <PlainEditableText
                  value={proposal.preparedByName}
                  placeholder="Salesperson Name"
                  onChange={(value) =>
                    onPartyFieldChange("preparedByName", value)
                  }
                />
              </p>
              <p>
                <PlainEditableText
                  value={proposal.salespersonEmail}
                  placeholder="Salesperson email"
                  onChange={(value) =>
                    onPartyFieldChange("salespersonEmail", value)
                  }
                />
              </p>
            </td>
          </tr>
          <tr className="quote-info-blank-row">
            <td />
            <td />
            <td />
            <td />
          </tr>
          <tr className="quote-info-seller-row">
            <td className="quote-company-block">
              <p>
                <EditableText
                  value={documentText.sellerName}
                  placeholder="Seller name"
                  onChange={(value) => onDocumentTextChange("sellerName", value)}
                />
              </p>
              <p>
                <EditableText
                  className="quote-address-edit"
                  value={documentText.sellerAddress}
                  placeholder="Seller address"
                  multiline
                  onChange={(value) =>
                    onDocumentTextChange("sellerAddress", value)
                  }
                />
              </p>
            </td>
            <td />
            <td />
            <td />
          </tr>
          <tr className="quote-info-tax-row">
            <td className="quote-tax-id">
              <EditableText
                value={documentText.taxIdLabel}
                placeholder="Tax ID"
                onChange={(value) => onDocumentTextChange("taxIdLabel", value)}
              />
              :{" "}
              <EditableText
                value={documentText.taxId}
                placeholder="Tax ID number"
                onChange={(value) => onDocumentTextChange("taxId", value)}
              />
            </td>
            <td />
            <td />
            <td />
          </tr>
        </tbody>
      </table>

      <QuotePartiesTable
        recipients={recipients}
        documentText={documentText}
        onPartyFieldChange={onPartyFieldChange}
        onDocumentTextChange={onDocumentTextChange}
      />

      {options.map((option) => (
        <QuoteTable
          key={option.term.value}
          optionLetter={option.optionLetter}
          showOptionLetter={showOptionLetters}
          showTermHeader={showOptionLetters || showSingleCustomTermHeader}
          recipientType={proposal.recipientType}
          term={option.term}
          currency={proposal.currency}
          totals={option.totals}
          customDiscountName={proposal.customDiscountName}
          pricingOptionId={pricingOptionId}
          onPricingRowChange={onPricingRowChange}
          documentText={documentText}
          onDocumentTextChange={onDocumentTextChange}
        />
      ))}
      <QuoteNotes
        additionalNotes={proposal.additionalNotes}
        documentText={documentText}
        onDocumentTextChange={onDocumentTextChange}
        onDefaultDocumentNoteChange={onDefaultDocumentNoteChange}
        onAddDefaultDocumentNote={onAddDefaultDocumentNote}
        onRemoveDefaultDocumentNote={onRemoveDefaultDocumentNote}
      />
    </article>
  );
}

function quoteRecipients(
  proposal: ProposalData,
  documentText: DocumentText,
): QuoteRecipient[] {
  if (proposal.recipientType === "reseller") {
    return [
      {
        title: documentText.resellerHeading,
        headingKey: "resellerHeading" as const,
        headingExtra: documentText.resellerHeadingExtra,
        headingExtraKey: "resellerHeadingExtra" as const,
        name: proposal.resellerName,
        nameField: "resellerName" as const,
        address: proposal.resellerAddress,
        addressField: "resellerAddress" as const,
      },
      {
        title: documentText.customerHeading,
        headingKey: "customerHeading" as const,
        headingExtra:
          proposal.customerCompany || documentText.customerHeadingExtra,
        headingExtraKey: "customerHeadingExtra" as const,
        headingExtraField: "customerCompany" as const,
        name: proposal.customerName,
        nameField: "customerName" as const,
        address: proposal.customerAddress,
        addressField: "customerAddress" as const,
      },
    ];
  }

  return [
    {
      title: documentText.customerHeading,
      headingKey: "customerHeading" as const,
      headingExtra: proposal.customerCompany || documentText.customerHeadingExtra,
      headingExtraKey: "customerHeadingExtra" as const,
      headingExtraField: "customerCompany" as const,
      name: proposal.customerName,
      nameField: "customerName" as const,
      address: proposal.customerAddress,
      addressField: "customerAddress" as const,
    },
  ];
}

function QuotePartiesTable({
  recipients,
  documentText,
  onPartyFieldChange,
  onDocumentTextChange,
}: {
  recipients: ReturnType<typeof quoteRecipients>;
  documentText: DocumentText;
  onPartyFieldChange: <K extends keyof ProposalData>(
    key: K,
    value: ProposalData[K],
  ) => void;
  onDocumentTextChange: DocumentTextChangeHandler;
}) {
  const leftRecipient = recipients[0];
  const rightRecipient = recipients[1];

  return (
    <table
      className={`quote-party-table ${
        rightRecipient ? "" : "quote-party-table-single"
      }`}
      aria-label="Quote recipient"
    >
      <colgroup>
        <col className="quote-party-col-left" />
        <col className="quote-party-col-spacer" />
        <col className="quote-party-col-right" />
      </colgroup>
      <tbody>
        <tr className="quote-party-heading-row">
          <td>
            <QuotePartyHeading
              recipient={leftRecipient}
              onPartyFieldChange={onPartyFieldChange}
              onDocumentTextChange={onDocumentTextChange}
            />
          </td>
          <td />
          <td>
            {rightRecipient ? (
              <QuotePartyHeading
                recipient={rightRecipient}
                onPartyFieldChange={onPartyFieldChange}
                onDocumentTextChange={onDocumentTextChange}
              />
            ) : null}
          </td>
        </tr>
        <tr>
          <td>
            <QuotePartyFields
              recipient={leftRecipient}
              documentText={documentText}
              onPartyFieldChange={onPartyFieldChange}
              onDocumentTextChange={onDocumentTextChange}
            />
          </td>
          <td />
          <td>
            {rightRecipient ? (
              <QuotePartyFields
                recipient={rightRecipient}
                documentText={documentText}
                onPartyFieldChange={onPartyFieldChange}
                onDocumentTextChange={onDocumentTextChange}
              />
            ) : null}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function QuotePartyHeading({
  recipient,
  onPartyFieldChange,
  onDocumentTextChange,
}: {
  recipient: ReturnType<typeof quoteRecipients>[number];
  onPartyFieldChange: <K extends keyof ProposalData>(
    key: K,
    value: ProposalData[K],
  ) => void;
  onDocumentTextChange: DocumentTextChangeHandler;
}) {
  return (
    <h2>
      <EditableText
        value={recipient.title}
        placeholder="Recipient heading"
        onChange={(value) => onDocumentTextChange(recipient.headingKey, value)}
      />
      <OptionalInlineEditableText
        value={recipient.headingExtra}
        placeholder="Add text"
        onChange={(value) => {
          if (recipient.headingExtraField) {
            onPartyFieldChange(recipient.headingExtraField, value);
            return;
          }

          onDocumentTextChange(recipient.headingExtraKey, value);
        }}
      />
    </h2>
  );
}

function QuotePartyFields({
  recipient,
  documentText,
  onPartyFieldChange,
  onDocumentTextChange,
}: {
  recipient: ReturnType<typeof quoteRecipients>[number];
  documentText: DocumentText;
  onPartyFieldChange: <K extends keyof ProposalData>(
    key: K,
    value: ProposalData[K],
  ) => void;
  onDocumentTextChange: DocumentTextChangeHandler;
}) {
  const showAddress = Boolean(recipient.address.trim());

  return (
    <>
      <p className="quote-party-row">
        <strong className="quote-party-label">
          <EditableText
            value={documentText.nameLabel}
            placeholder="Name"
            onChange={(value) => onDocumentTextChange("nameLabel", value)}
          />
          :
        </strong>
        <PlainEditableText
          value={recipient.name}
          onChange={(value) =>
            onPartyFieldChange(recipient.nameField, value)
          }
        />
      </p>
      {showAddress ? (
        <p className="quote-party-row">
          <strong className="quote-party-label">
            <EditableText
              value={documentText.addressLabel}
              placeholder="Address"
              onChange={(value) => onDocumentTextChange("addressLabel", value)}
            />
            :
          </strong>
          <PlainEditableText
            className="quote-address-edit"
            value={recipient.address}
            multiline
            onChange={(value) =>
              onPartyFieldChange(recipient.addressField, value)
            }
          />
        </p>
      ) : null}
    </>
  );
}

function QuoteTable({
  optionLetter,
  showOptionLetter,
  showTermHeader,
  recipientType,
  term,
  currency,
  totals,
  customDiscountName,
  pricingOptionId,
  onPricingRowChange,
  documentText,
  onDocumentTextChange,
}: {
  optionLetter: string;
  showOptionLetter: boolean;
  showTermHeader: boolean;
  recipientType: QuoteRecipientType;
  term: QuoteTermOption;
  currency: CurrencyCode;
  totals: OptionTotals;
  customDiscountName: string;
  pricingOptionId: string;
  onPricingRowChange: (
    optionId: string,
    rowId: string,
    patch: Partial<PricingRow>,
  ) => void;
  documentText: DocumentText;
  onDocumentTextChange: DocumentTextChangeHandler;
}) {
  const termDocumentLabel = quoteTermDocumentLabel(term);
  const showResellerDiscountColumns =
    recipientType === "reseller" && totals.resellerDiscountPercent > 0;
  const quoteLines =
    totals.eligibilityDiscountAmount > 0
      ? [
          ...totals.lines.filter(isEligibilityDiscountLine),
          ...totals.lines.filter((line) => !isEligibilityDiscountLine(line)),
        ]
      : totals.lines;
  const eligibilityDiscountAnchor =
    totals.eligibilityDiscountAmount > 0
      ? [...quoteLines].reverse().find(isEligibilityDiscountLine)
      : undefined;
  const resellerDiscountAnchor =
    totals.resellerDiscountAmount > 0 && !showResellerDiscountColumns
      ? quoteLines[quoteLines.length - 1]
      : undefined;

  return (
    <section className="quote-table-block">
      {showTermHeader ? (
        <h2 className="quote-option-title">
          {showOptionLetter ? (
            <>
              <EditableText
                value={documentText.optionLabelPrefix}
                placeholder="Option"
                onChange={(value) =>
                  onDocumentTextChange("optionLabelPrefix", value)
                }
              />{" "}
              {optionLetter}: {termDocumentLabel}
            </>
          ) : (
            termDocumentLabel
          )}
        </h2>
      ) : null}
      <table className="quote-table">
        {showResellerDiscountColumns ? (
          <colgroup>
            <col className="quote-col-platform" />
            <col className="quote-col-quantity" />
            <col className="quote-col-reseller-months" />
            <col className="quote-col-reseller-list" />
            <col className="quote-col-reseller-discounted" />
          </colgroup>
        ) : (
          <colgroup>
            <col className="quote-col-platform" />
            <col className="quote-col-quantity" />
            <col className="quote-col-amount" />
            <col className="quote-col-years" />
            <col className="quote-col-total" />
          </colgroup>
        )}
        <thead>
          <tr>
            <th>
              <EditableText
                value={documentText.platformHeader}
                placeholder="Platform"
                onChange={(value) => onDocumentTextChange("platformHeader", value)}
              />
            </th>
            <th>
              <EditableText
                value={documentText.quantityHeader}
                placeholder="Quantity"
                onChange={(value) => onDocumentTextChange("quantityHeader", value)}
              />
            </th>
            {showResellerDiscountColumns ? (
              <>
                <th>
                  <EditableText
                    value={documentText.numberOfYearsHeader}
                    placeholder="Number of Months"
                    onChange={(value) =>
                      onDocumentTextChange("numberOfYearsHeader", value)
                    }
                  />
                </th>
                <th>
                  <EditableText
                    value={documentText.listPriceHeader}
                    placeholder="List Price"
                    multiline
                    onChange={(value) =>
                      onDocumentTextChange("listPriceHeader", value)
                    }
                  />
                </th>
                <th>
                  <span className="quote-discounted-price-header">
                    <EditableText
                      value={documentText.discountedPriceHeader}
                      placeholder="Discounted Price"
                      multiline
                      onChange={(value) =>
                        onDocumentTextChange("discountedPriceHeader", value)
                      }
                    />
                    <span>({totals.resellerDiscountPercent}%)</span>
                  </span>
                </th>
              </>
            ) : (
              <>
                <th>
                  <EditableText
                    value={documentText.costPerYearHeader}
                    placeholder="Cost Per Year"
                    multiline
                    onChange={(value) =>
                      onDocumentTextChange("costPerYearHeader", value)
                    }
                  />
                </th>
                <th>
                  <EditableText
                    value={documentText.numberOfYearsHeader}
                    placeholder="Number of Months"
                    onChange={(value) =>
                      onDocumentTextChange("numberOfYearsHeader", value)
                    }
                  />
                </th>
                <th>
                  <EditableText
                    value={documentText.totalDueHeader}
                    placeholder="Total Due"
                    multiline
                    onChange={(value) =>
                      onDocumentTextChange("totalDueHeader", value)
                    }
                  />
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {quoteLines.map((line) => (
            <Fragment key={line.row.id}>
              <tr>
                <td>
                  <PlainEditableText
                    value={
                      line.row.displayName?.trim()
                        ? line.row.displayName
                        : quoteProductLabel(line.row.productName)
                    }
                    onChange={(value) =>
                      onPricingRowChange(pricingOptionId, line.row.id, {
                        displayName: value,
                      })
                    }
                  />
                </td>
                <td>
                  <PlainEditableText
                    value={line.row.quantity}
                    commitOnInput
                    onChange={(value) =>
                      onPricingRowChange(pricingOptionId, line.row.id, {
                        quantity: value,
                      })
                    }
                  />
                </td>
                {showResellerDiscountColumns ? (
                  <>
                    <td>
                      {line.product?.annual === false
                        ? "-"
                        : formatPlainNumber(term.months)}
                    </td>
                    <td>
                      {line.product?.category === "One-Time Fees" &&
                      line.row.waived
                        ? "Waived"
                        : formatQuoteMoney(line.total, currency)}
                    </td>
                    <td>
                      {line.product?.category === "One-Time Fees" &&
                      line.row.waived
                        ? "Waived"
                        : formatQuoteMoney(
                            line.total - line.resellerDiscountAmount,
                            currency,
                          )}
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <PlainEditableText
                        value={
                          isCustomPriceProduct(line.product) &&
                          !line.row.unitPriceOverride?.trim()
                            ? ""
                            : formatAnnualMoney(line.unitPrice, currency)
                        }
                        placeholder={
                          isCustomPriceProduct(line.product) ? "Enter amount" : ""
                        }
                        onChange={(value) =>
                          onPricingRowChange(pricingOptionId, line.row.id, {
                            unitPriceOverride: normalizedMoneyInput(value),
                          })
                        }
                      />
                    </td>
                    <td>
                      {line.product?.annual === false
                        ? "One-time"
                        : formatPlainNumber(term.months)}
                    </td>
                    <td>
                      {line.product?.category === "One-Time Fees" &&
                      line.row.waived
                        ? "Waived"
                        : formatQuoteMoney(line.total, currency)}
                    </td>
                  </>
                )}
              </tr>
              {eligibilityDiscountAnchor?.row.id === line.row.id ? (
                <tr
                  className="quote-line-discount-row"
                  key={`${line.row.id}-eligibility-discount`}
                >
                  <td>
                    {totals.eligibilityDiscountLabel} -{" "}
                    {totals.eligibilityDiscountPercent}%
                  </td>
                  <td />
                  {showResellerDiscountColumns ? (
                    <>
                      <td>{formatPlainNumber(term.months)}</td>
                      <td />
                    </>
                  ) : (
                    <>
                      <td />
                      <td>{formatPlainNumber(term.months)}</td>
                    </>
                  )}
                  <td>
                    -{formatQuoteMoney(totals.eligibilityDiscountAmount, currency)}
                  </td>
                </tr>
              ) : null}
              {resellerDiscountAnchor?.row.id === line.row.id ? (
                <tr
                  className="quote-line-discount-row"
                  key={`${line.row.id}-reseller-discount`}
                >
                  <td>
                    {totals.resellerDiscountLabel} -{" "}
                    {totals.resellerDiscountPercent}%
                  </td>
                  <td />
                  <td />
                  <td>{formatPlainNumber(term.months)}</td>
                  <td>
                    -{formatQuoteMoney(totals.resellerDiscountAmount, currency)}
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
          {totals.customDiscountAmount > 0 ? (
            <tr>
              <td>
                {customDiscountName.trim() ? (
                  customDiscountName.trim()
                ) : (
                  <EditableText
                    value={documentText.customDiscountLabel}
                    placeholder="Discount (Other)"
                    onChange={(value) =>
                      onDocumentTextChange("customDiscountLabel", value)
                    }
                  />
                )}{" "}
                - {totals.customDiscountPercent}%
              </td>
              <td />
              {showResellerDiscountColumns ? (
                <>
                  <td>{formatPlainNumber(term.months)}</td>
                  <td />
                </>
              ) : (
                <>
                  <td />
                  <td>{formatPlainNumber(term.months)}</td>
                </>
              )}
              <td>-{formatQuoteMoney(totals.customDiscountAmount, currency)}</td>
            </tr>
          ) : null}
          {totals.termDiscountAmount > 0 ? (
            <tr>
              <td>
                {termDocumentLabel}{" "}
                <EditableText
                  value={documentText.paidUpFrontDiscountSuffix}
                  placeholder="paid up front discount"
                  onChange={(value) =>
                    onDocumentTextChange("paidUpFrontDiscountSuffix", value)
                  }
                />
              </td>
              <td>{term.discountPercent}%</td>
              {showResellerDiscountColumns ? (
                <>
                  <td>{formatPlainNumber(term.months)}</td>
                  <td />
                </>
              ) : (
                <>
                  <td />
                  <td>{formatPlainNumber(term.months)}</td>
                </>
              )}
              <td>-{formatQuoteMoney(totals.termDiscountAmount, currency)}</td>
            </tr>
          ) : null}
          <tr className="quote-total-row">
            <td>
              <EditableText
                value={documentText.totalLabel}
                placeholder="TOTAL"
                onChange={(value) => onDocumentTextChange("totalLabel", value)}
              />
            </td>
            <td />
            {showResellerDiscountColumns ? (
              <>
                <td />
                <td>{formatQuoteMoney(totals.subtotalBeforeDiscounts, currency)}</td>
              </>
            ) : (
              <>
                <td />
                <td />
              </>
            )}
            <td>{formatQuoteMoney(totals.total, currency)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

function QuoteNotes({
  additionalNotes,
  documentText,
  onDocumentTextChange,
  onDefaultDocumentNoteChange,
  onAddDefaultDocumentNote,
  onRemoveDefaultDocumentNote,
}: {
  additionalNotes: string[];
  documentText: DocumentText;
  onDocumentTextChange: DocumentTextChangeHandler;
  onDefaultDocumentNoteChange: (index: number, value: string) => void;
  onAddDefaultDocumentNote: () => void;
  onRemoveDefaultDocumentNote: (index: number) => void;
}) {
  const visibleAdditionalNotes = additionalNotes.filter(
    (note) => note.trim().length > 0,
  );

  return (
    <section className="quote-notes">
      <h2>
        <EditableText
          value={documentText.notesTitle}
          placeholder="NOTES:"
          onChange={(value) => onDocumentTextChange("notesTitle", value)}
        />
      </h2>
      <ol>
        {documentText.defaultNotes.map((note, index) => (
          <li key={`default-note-${index}`}>
            <EditableText
              value={note}
              placeholder={`Note ${index + 1}`}
              multiline
              onChange={(value) => onDefaultDocumentNoteChange(index, value)}
            />
            <button
              className="quote-inline-button no-print"
              onClick={() => onRemoveDefaultDocumentNote(index)}
              aria-label="Remove note"
              title="Remove note"
            >
              -
            </button>
          </li>
        ))}
        {visibleAdditionalNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ol>
      <button
        className="quote-note-add-button no-print"
        onClick={onAddDefaultDocumentNote}
      >
        Add note
      </button>
    </section>
  );
}

function valueOrPlaceholder(value: string, placeholder: string) {
  return value.trim() ? (
    value
  ) : (
    <span className="quote-placeholder">{placeholder}</span>
  );
}

function PlainEditableText({
  value,
  onChange,
  className = "",
  multiline = false,
  commitOnInput = false,
  placeholder = "",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
  commitOnInput?: boolean;
  placeholder?: string;
}) {
  const isPlaceholder = value.trim().length === 0 && placeholder;
  const commitValue = (element: HTMLElement) => {
    const nextValue = element.innerText.replace(/\n+$/g, "");

    onChange(isPlaceholder && nextValue === placeholder ? "" : nextValue);
  };

  return (
    <span
      className={`quote-editable-text quote-plain-editable-text ${
        isPlaceholder ? "quote-placeholder" : ""
      } ${className}`}
      contentEditable
      suppressContentEditableWarning
      onFocus={(event) => {
        if (isPlaceholder) event.currentTarget.innerText = "";
      }}
      onInput={(event) => {
        if (commitOnInput) commitValue(event.currentTarget);
      }}
      onBlur={(event) => {
        commitValue(event.currentTarget);
      }}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {isPlaceholder ? placeholder : value}
    </span>
  );
}

function OptionalInlineEditableText({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <span
      className="quote-editable-text quote-empty-inline-editable"
      contentEditable
      data-placeholder={placeholder}
      suppressContentEditableWarning
      onBlur={(event) => {
        onChange(event.currentTarget.innerText.replace(/\n+$/g, ""));
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {value}
    </span>
  );
}

function EditableText({
  value,
  placeholder,
  onChange,
  className = "",
  multiline = false,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
}) {
  const isPlaceholder = value.trim().length === 0;

  return (
    <span
      className={`quote-editable-text ${
        isPlaceholder ? "quote-placeholder" : ""
      } ${className}`}
      contentEditable
      suppressContentEditableWarning
      onFocus={(event) => {
        if (isPlaceholder) event.currentTarget.innerText = "";
      }}
      onBlur={(event) => {
        const nextValue = event.currentTarget.innerText.replace(/\n+$/g, "");
        onChange(isPlaceholder && nextValue === placeholder ? "" : nextValue);
      }}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {isPlaceholder ? placeholder : value}
    </span>
  );
}

function formatAnnualMoney(value: number, currency: CurrencyCode) {
  return formatQuoteMoney(value, currency);
}

function formatQuoteMoney(value: number, currency: CurrencyCode) {
  return `${currencySymbols[currency]}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="trash-icon"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}
