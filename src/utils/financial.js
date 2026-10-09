// Financial calculation utilities for AlmostSold AI
// Centralized to avoid duplicate calculations across components.

/**
 * Calculate gross profit
 */
export function grossProfit(sellingPrice, fulfillmentCost) {
  return sellingPrice - fulfillmentCost;
}

/**
 * Calculate gross margin percentage
 */
export function grossMargin(sellingPrice, fulfillmentCost) {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - fulfillmentCost) / sellingPrice) * 100;
}

/**
 * Calculate expected recovered revenue
 * = sellingPrice * conversionProbability
 */
export function expectedRecoveredRevenue(sellingPrice, conversionProbability) {
  return sellingPrice * conversionProbability;
}

/**
 * Calculate expected recovered profit
 * = (sellingPrice - fulfillmentCost - recoveryExpense) * conversionProbability
 */
export function expectedRecoveredProfit(sellingPrice, fulfillmentCost, recoveryExpense, conversionProbability) {
  return (sellingPrice - fulfillmentCost - recoveryExpense) * conversionProbability;
}

/**
 * Calculate the net difference between recovery scenario profit and baseline
 */
export function profitDifference(scenarioProfit, baselineProfit) {
  return scenarioProfit - baselineProfit;
}

/**
 * Format a number as currency
 */
export function formatCurrency(value, compact = false) {
  if (value === null || value === undefined || isNaN(value)) return '₹0.00';
  
  if (compact && Math.abs(value) >= 1000) {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1,
    });
    return formatter.format(value);
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a large number compactly
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-IN').format(value);
}

/**
 * Get strategy configuration
 */
export const STRATEGIES = [
  {
    id: 'discount',
    name: 'Discount',
    icon: 'Percent',
    description: 'Offer a price reduction to win back the customer.',
    defaultDiscount: 10,
    fields: ['discountPercent'],
  },
  {
    id: 'smaller_package',
    name: 'Smaller Package',
    icon: 'Package',
    description: 'Offer a reduced version at a lower price point.',
    defaultReduction: 25,
    fields: ['priceReduction'],
  },
  {
    id: 'alternative_product',
    name: 'Alternative Product',
    icon: 'RefreshCw',
    description: 'Suggest a different product that better fits the customer.',
    fields: ['newPrice', 'newCost'],
  },
  {
    id: 'payment_flexibility',
    name: 'Payment Flexibility',
    icon: 'CreditCard',
    description: 'Offer installment plans or deferred payment.',
    fields: ['installments'],
  },
  {
    id: 'explain_value',
    name: 'Explain Value',
    icon: 'MessageCircle',
    description: 'Re-engage with better information about value proposition.',
    fields: [],
  },
  {
    id: 'do_not_pursue',
    name: 'Do Not Pursue',
    icon: 'XCircle',
    description: 'Mark as not worth pursuing based on analysis.',
    fields: [],
  },
];

/**
 * Apply strategy adjustments to calculate scenario financials
 */
export function calculateScenario(params) {
  const {
    originalPrice,
    fulfillmentCost,
    strategy,
    discountPercent = 0,
    priceReduction = 0,
    newPrice,
    newCost,
    recoveryExpense = 0,
    conversionProbability = 0.3,
  } = params;

  let sellingPrice = originalPrice;
  let cost = fulfillmentCost;

  switch (strategy) {
    case 'discount':
      sellingPrice = originalPrice * (1 - discountPercent / 100);
      break;
    case 'smaller_package':
      sellingPrice = originalPrice * (1 - priceReduction / 100);
      cost = fulfillmentCost * (1 - priceReduction / 100 * 0.6); // costs don't scale linearly
      break;
    case 'alternative_product':
      sellingPrice = newPrice || originalPrice;
      cost = newCost || fulfillmentCost;
      break;
    case 'payment_flexibility':
      // Price stays the same, minor admin cost
      sellingPrice = originalPrice;
      break;
    case 'explain_value':
      // No price change
      sellingPrice = originalPrice;
      break;
    case 'do_not_pursue':
      return {
        sellingPrice: 0,
        fulfillmentCost: 0,
        recoveryExpense: 0,
        grossProfit: 0,
        grossMargin: 0,
        conversionProbability: 0,
        expectedRevenue: 0,
        expectedProfit: 0,
      };
    default:
      break;
  }

  const gp = grossProfit(sellingPrice, cost);
  const gm = grossMargin(sellingPrice, cost);
  const expRevenue = expectedRecoveredRevenue(sellingPrice, conversionProbability);
  const expProfit = expectedRecoveredProfit(sellingPrice, cost, recoveryExpense, conversionProbability);

  return {
    sellingPrice: Math.round(sellingPrice * 100) / 100,
    fulfillmentCost: Math.round(cost * 100) / 100,
    recoveryExpense: Math.round(recoveryExpense * 100) / 100,
    grossProfit: Math.round(gp * 100) / 100,
    grossMargin: Math.round(gm * 10) / 10,
    conversionProbability,
    expectedRevenue: Math.round(expRevenue * 100) / 100,
    expectedProfit: Math.round(expProfit * 100) / 100,
  };
}

/**
 * Generate deterministic AI strategy explanation
 * Returns an evidence-based recommendation, not a fake AI response.
 */
export function generateStrategyExplanation(opportunity, strategy, scenario) {
  const explanations = {
    discount: {
      objection: opportunity.customer_notes || 'Price was cited as the primary concern.',
      evidence: `The customer indicated price sensitivity. A ${Math.round((1 - scenario.sellingPrice / opportunity.original_price) * 100)}% discount brings the price to ${formatCurrency(scenario.sellingPrice)}.`,
      rationale: 'Price-sensitive customers often reconsider when offered a targeted discount that addresses their specific concern.',
      tradeoff: `Reduces gross margin from ${formatPercent(grossMargin(opportunity.original_price, opportunity.fulfillment_cost))} to ${formatPercent(scenario.grossMargin)}. Each recovered sale contributes ${formatCurrency(scenario.grossProfit)} in gross profit.`,
      uncertainty: 'Conversion probability is an estimate. Actual results depend on timing, customer interest, and competitive alternatives.',
      nextStep: 'Send a personalized recovery message highlighting the special pricing offer.',
    },
    smaller_package: {
      objection: opportunity.customer_notes || 'Customer may have been deterred by the total cost.',
      evidence: `A scaled-down offering at ${formatCurrency(scenario.sellingPrice)} may better fit the customer\'s budget or needs.`,
      rationale: 'Offering a right-sized alternative can capture value from customers who found the original offering too large or expensive.',
      tradeoff: `Lower revenue per sale but potentially higher conversion. Expected profit per attempt: ${formatCurrency(scenario.expectedProfit)}.`,
      uncertainty: 'The customer may want the full product and not be interested in a reduced version.',
      nextStep: 'Present the smaller option as a "starter" or "essentials" package.',
    },
    alternative_product: {
      objection: opportunity.customer_notes || 'The original product may not have been the best fit.',
      evidence: `An alternative product may better address the customer\'s underlying need.`,
      rationale: 'Sometimes the sale was lost because of product-market fit, not price. A different product can resolve the mismatch.',
      tradeoff: `Different cost structure with ${formatCurrency(scenario.grossProfit)} gross profit at ${formatPercent(scenario.grossMargin)} margin.`,
      uncertainty: 'Requires understanding the customer\'s true needs. The alternative must genuinely be a better fit.',
      nextStep: 'Reach out with the alternative suggestion, explaining why it may be a better match.',
    },
    payment_flexibility: {
      objection: opportunity.customer_notes || 'Customer may have faced budget constraints.',
      evidence: `Offering payment flexibility keeps the full price of ${formatCurrency(scenario.sellingPrice)} while reducing the immediate financial burden.`,
      rationale: 'Payment plans remove the barrier of a large upfront cost without discounting the product.',
      tradeoff: `Maintains full margin but introduces minor administrative cost and payment risk.`,
      uncertainty: 'Not all customers will qualify for or be interested in payment plans.',
      nextStep: 'Present available payment plan options with clear terms.',
    },
    explain_value: {
      objection: opportunity.customer_notes || 'Customer may not have fully understood the value proposition.',
      evidence: `Re-engaging with better information at the original price of ${formatCurrency(scenario.sellingPrice)} preserves full margin.`,
      rationale: 'Many lost sales result from incomplete information rather than genuine rejection. A follow-up can address knowledge gaps.',
      tradeoff: `No price concession maintains maximum profitability, but conversion likelihood may be lower.`,
      uncertainty: 'Effectiveness depends heavily on whether the original loss was truly due to misunderstanding versus a firm objection.',
      nextStep: 'Prepare a personalized explanation addressing the specific concern noted.',
    },
    do_not_pursue: {
      objection: opportunity.customer_notes || 'Various factors make recovery unlikely.',
      evidence: 'Based on the recorded information, the expected return from recovery efforts is low.',
      rationale: 'Not every lost sale is worth pursuing. Focusing resources on higher-probability opportunities is more efficient.',
      tradeoff: 'Saves time and resources that can be redirected to more promising recovery efforts.',
      uncertainty: 'There is always a small chance the customer might have reconsidered.',
      nextStep: 'Close this opportunity and focus on higher-priority items.',
    },
  };

  return explanations[strategy] || explanations.explain_value;
}
