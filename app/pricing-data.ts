export type CurrencyCode = "USD" | "CAD" | "GBP" | "EUR" | "AUD";

export type ProductPrice = {
  product: string;
  category: "Base Packages" | "Add-Ons" | "One-Time Fees";
  annual: boolean;
  customPriceRequired?: boolean;
  prices: Record<CurrencyCode, number>;
};

export const currencyCodes: CurrencyCode[] = ["USD", "CAD", "GBP", "EUR", "AUD"];

export const currencySymbols: Record<CurrencyCode, string> = {
  USD: "$",
  CAD: "$",
  GBP: "£",
  EUR: "€",
  AUD: "$",
};

export const productPrices: ProductPrice[] = [
  {
    product: "Jotform Enterprise Base Package (includes 5 users)",
    category: "Base Packages",
    annual: true,
    prices: { USD: 8328, CAD: 12500, GBP: 6300, EUR: 7300, AUD: 12900 },
  },
  {
    product: "Jotform Government Base Package (includes 5 users)",
    category: "Base Packages",
    annual: true,
    prices: { USD: 13116, CAD: 19700, GBP: 10000, EUR: 11500, AUD: 20300 },
  },
  {
    product: "Jotform Enterprise Light Package (includes 3 users)",
    category: "Base Packages",
    annual: true,
    prices: { USD: 4990, CAD: 7485, GBP: 3792.4, EUR: 4391.2, AUD: 7735 },
  },
  {
    product: "Additional User",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 948, CAD: 1416, GBP: 720, EUR: 840, AUD: 1464 },
  },
  {
    product: "Additional 5 User Bundle",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 4740, CAD: 7100, GBP: 3600, EUR: 4200, AUD: 7300 },
  },
  {
    product: "Additional 5 User Bundle - Discounted",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 4740, CAD: 7100, GBP: 3600, EUR: 4200, AUD: 7300 },
  },
  {
    product: "Salesforce AppExchange Package",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 3900, CAD: 5900, GBP: 3000, EUR: 3400, AUD: 6000 },
  },
  {
    product: "Salesforce AppExchange Per User Additional Fee",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 240, CAD: 360, GBP: 200, EUR: 210, AUD: 400 },
  },
  {
    product: "HIPAA / SOC2 Compliance",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 4788, CAD: 7200, GBP: 3600, EUR: 4200, AUD: 7400 },
  },
  {
    product: "Data-Only Users (Bundle of 10)",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 3588, CAD: 5400, GBP: 2700, EUR: 3200, AUD: 5600 },
  },
  {
    product: "Additional Custom Domain",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 500, CAD: 800, GBP: 400, EUR: 400, AUD: 800 },
  },
  {
    product: "Add another product",
    category: "Add-Ons",
    annual: true,
    customPriceRequired: true,
    prices: { USD: 0, CAD: 0, GBP: 0, EUR: 0, AUD: 0 },
  },
  {
    product: "Bundle of 5 AI Agent Phone Numbers",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 600, CAD: 900, GBP: 500, EUR: 530, AUD: 930 },
  },
  {
    product: "SQL Widget (non-HIPAA instances only)",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 4990, CAD: 7500, GBP: 3800, EUR: 4400, AUD: 7700 },
  },
  {
    product: "SSO Integration (Per Integration)",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 2490, CAD: 3700, GBP: 1900, EUR: 2200, AUD: 3900 },
  },
  {
    product: "SCIM Provisioning",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 2490, CAD: 3700, GBP: 1900, EUR: 2200, AUD: 3900 },
  },
  {
    product: "JIT (Just In Time) Provisioning",
    category: "Add-Ons",
    annual: true,
    prices: { USD: 1000, CAD: 1500, GBP: 800, EUR: 900, AUD: 1600 },
  },
  {
    product: "Enterprise Onboarding",
    category: "One-Time Fees",
    annual: false,
    prices: { USD: 3500, CAD: 5300, GBP: 2700, EUR: 3100, AUD: 5400 },
  },
  {
    product: "Professional Services",
    category: "One-Time Fees",
    annual: false,
    customPriceRequired: true,
    prices: { USD: 0, CAD: 0, GBP: 0, EUR: 0, AUD: 0 },
  },
  {
    product: "Custom Domain Change Fee",
    category: "One-Time Fees",
    annual: false,
    prices: { USD: 500, CAD: 800, GBP: 400, EUR: 400, AUD: 800 },
  },
  {
    product: "Server Migration Fee (H to non-H or vice versa)",
    category: "One-Time Fees",
    annual: false,
    prices: { USD: 4500, CAD: 6800, GBP: 3400, EUR: 4000, AUD: 7000 },
  },
  {
    product: "Slug Change Fee",
    category: "One-Time Fees",
    annual: false,
    prices: { USD: 1200, CAD: 1800, GBP: 900, EUR: 1100, AUD: 1900 },
  },
];
