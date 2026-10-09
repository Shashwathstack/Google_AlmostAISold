// Demo seed data for AlmostSold AI
// This provides realistic fictional data for the public demo workspace.
// In production, all data comes from Supabase.

export const DEMO_BUSINESSES = [
  { id: 'demo-biz-1', name: 'TechVibe Electronics', industry: 'Electronics Retail' },
  { id: 'demo-biz-2', name: 'GreenLeaf Furniture', industry: 'Home Furnishings' },
];

const LOSS_REASONS = ['Price', 'Availability', 'Delivery', 'Confusion', 'Competitor', 'Timing', 'Other'];
const STATUSES = ['open', 'analyzing', 'strategy_selected', 'recovery_attempted', 'recovered', 'closed'];
const PRIORITIES = ['high', 'medium', 'low'];

const PRODUCTS = [
  { name: 'Samsung 65" QLED TV', cost: 51460, price: 107817 },
  { name: 'Sony WH-1000XM5 Headphones', cost: 12035, price: 28967 },
  { name: 'MacBook Air M3', cost: 70550, price: 99517 },
  { name: 'iPad Pro 12.9"', cost: 43160, price: 91217 },
  { name: 'Bose SoundLink Max', cost: 7885, price: 20667 },
  { name: 'LG 27" 4K Monitor', cost: 14940, price: 37267 },
  { name: 'Canon EOS R6 Camera', cost: 81340, price: 207417 },
  { name: 'DJI Mini 4 Pro Drone', cost: 26560, price: 62997 },
  { name: 'Dyson V15 Vacuum', cost: 17430, price: 53867 },
  { name: 'Apple Watch Ultra 2', cost: 25730, price: 66317 },
  { name: 'Herman Miller Aeron Chair', cost: 48140, price: 115785 },
  { name: 'Secretlab Titan Evo', cost: 18260, price: 43077 },
  { name: 'Standing Desk Pro', cost: 28220, price: 74617 },
  { name: 'Ergonomic Office Set', cost: 12450, price: 35275 },
  { name: 'Leather Recliner Sofa', cost: 56440, price: 157617 },
];

const CUSTOMER_NOTES = [
  'Customer said the price was higher than Amazon. Mentioned they could get it ₹12,500 cheaper online.',
  'Wanted the product in white, but we only had black in stock. Didn\'t want to wait for restock.',
  'Delivery estimate of 3 weeks was too long. Customer needed it by next Friday for an event.',
  'Customer was confused about the warranty coverage. Left to "think about it" and never returned.',
  'Said they saw a competitor offering a similar product with free installation included.',
  'Customer said timing wasn\'t right — wanted to wait for Black Friday deals next month.',
  'Wanted to buy but couldn\'t get financing approved. Asked about payment plans we don\'t offer.',
  'Customer comparison-shopping between us and Best Buy. Ultimately chose Best Buy for price match.',
  'Product was in stock online but not at the store they visited. Didn\'t want to order for delivery.',
  'Customer found a refurbished option elsewhere at 40% less. Couldn\'t match on price.',
  'Mentioned the competitor\'s model included accessories we charge separately for.',
  'Customer expected same-day delivery but our earliest was 5 business days.',
  'Was interested but the sales associate couldn\'t answer technical questions confidently.',
  'Customer wanted to bundle 3 items for a discount. We couldn\'t accommodate the bundle request.',
  'Repeat customer who was loyal but said our prices have been creeping up compared to competitors.',
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId() {
  return 'opp-' + Math.random().toString(36).substring(2, 11);
}

export function generateDemoOpportunities(businessId = 'demo-biz-1', count = 42) {
  const opportunities = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  for (let i = 0; i < count; i++) {
    const product = randomItem(PRODUCTS);
    const lossReason = randomItem(LOSS_REASONS);
    const status = randomItem(STATUSES);
    const priority = randomItem(PRIORITIES);
    const createdAt = randomDate(sixMonthsAgo, now);
    const quotedValue = product.price * (0.85 + Math.random() * 0.3);
    const fulfillmentCost = product.cost * (0.9 + Math.random() * 0.2);
    
    const hasRecovery = status === 'recovered' || status === 'recovery_attempted';
    const recoveredRevenue = status === 'recovered' ? quotedValue * (0.7 + Math.random() * 0.25) : 0;
    const actualCost = status === 'recovered' ? fulfillmentCost : 0;

    opportunities.push({
      id: generateId(),
      business_id: businessId,
      product_name: product.name,
      original_price: Math.round(quotedValue * 100) / 100,
      fulfillment_cost: Math.round(fulfillmentCost * 100) / 100,
      quoted_value: Math.round(quotedValue * 100) / 100,
      loss_reason: lossReason,
      status,
      priority,
      customer_notes: randomItem(CUSTOMER_NOTES),
      created_at: createdAt.toISOString(),
      updated_at: new Date(createdAt.getTime() + Math.random() * 7 * 86400000).toISOString(),
      recovered_revenue: Math.round(recoveredRevenue * 100) / 100,
      actual_cost: Math.round(actualCost * 100) / 100,
      recovery_expense: hasRecovery ? Math.round(Math.random() * 50 * 100) / 100 : 0,
      selected_strategy: hasRecovery ? randomItem(['Discount', 'Smaller Package', 'Explain Value', 'Alternative Product']) : null,
      ai_analysis: null,
      scenarios: [],
    });
  }

  return opportunities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function generateDemoScenarios(opportunityId) {
  return [
    {
      id: 'scn-' + Math.random().toString(36).substring(2, 9),
      opportunity_id: opportunityId,
      strategy: 'Discount',
      selling_price: 0,
      fulfillment_cost: 0,
      recovery_expense: 0,
      conversion_probability: 0.45,
      gross_profit: 0,
      gross_margin: 0,
      expected_profit: 0,
      created_at: new Date().toISOString(),
    }
  ];
}

// Generate time series data for dashboard charts
export function generateTimeSeriesData(opportunities) {
  const months = {};
  const now = new Date();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().substring(0, 7);
    months[key] = {
      month: key,
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      lostValue: 0,
      estimatedRecovery: 0,
      actualRecovery: 0,
    };
  }

  opportunities.forEach(opp => {
    const key = opp.created_at.substring(0, 7);
    if (months[key]) {
      months[key].lostValue += opp.quoted_value;
      months[key].estimatedRecovery += opp.quoted_value * 0.35; // rough estimate
      months[key].actualRecovery += opp.recovered_revenue || 0;
    }
  });

  return Object.values(months).map(m => ({
    ...m,
    lostValue: Math.round(m.lostValue),
    estimatedRecovery: Math.round(m.estimatedRecovery),
    actualRecovery: Math.round(m.actualRecovery),
  }));
}

// Generate loss reason distribution
export function getLossReasonDistribution(opportunities) {
  const counts = {};
  LOSS_REASONS.forEach(r => { counts[r] = 0; });
  opportunities.forEach(opp => {
    counts[opp.loss_reason] = (counts[opp.loss_reason] || 0) + 1;
  });
  return LOSS_REASONS.map(reason => ({
    name: reason,
    value: counts[reason] || 0,
  })).filter(d => d.value > 0);
}

// Compute dashboard KPIs from real data
export function computeKPIs(opportunities) {
  const totalOpps = opportunities.length;
  const lostQuotedValue = opportunities.reduce((s, o) => s + o.quoted_value, 0);
  
  // Estimated recoverable: open + analyzing + strategy_selected opportunities
  const recoverableOpps = opportunities.filter(o => 
    ['open', 'analyzing', 'strategy_selected'].includes(o.status)
  );
  const estimatedRecoverableProfit = recoverableOpps.reduce((s, o) => {
    const margin = (o.quoted_value - o.fulfillment_cost);
    return s + margin * 0.35; // conservative 35% recovery estimate
  }, 0);

  const recoveredOpps = opportunities.filter(o => o.status === 'recovered');
  const actualRecoveredRevenue = recoveredOpps.reduce((s, o) => s + o.recovered_revenue, 0);
  const actualRealizedProfit = recoveredOpps.reduce((s, o) => {
    return s + (o.recovered_revenue - o.actual_cost - o.recovery_expense);
  }, 0);

  return {
    totalOpportunities: totalOpps,
    lostQuotedValue: Math.round(lostQuotedValue * 100) / 100,
    estimatedRecoverableProfit: Math.round(estimatedRecoverableProfit * 100) / 100,
    actualRecoveredRevenue: Math.round(actualRecoveredRevenue * 100) / 100,
    actualRealizedProfit: Math.round(actualRealizedProfit * 100) / 100,
  };
}

// Get top recovery opportunities
export function getTopOpportunities(opportunities, limit = 5) {
  return opportunities
    .filter(o => ['open', 'analyzing', 'strategy_selected'].includes(o.status))
    .sort((a, b) => {
      const profitA = (a.quoted_value - a.fulfillment_cost);
      const profitB = (b.quoted_value - b.fulfillment_cost);
      return profitB - profitA;
    })
    .slice(0, limit);
}

// Generate deterministic AI insights
export function generateInsights(opportunities) {
  const insights = [];
  const reasons = getLossReasonDistribution(opportunities);
  const topReason = reasons.sort((a, b) => b.value - a.value)[0];
  
  if (topReason) {
    insights.push({
      id: 'insight-1',
      category: 'pattern',
      icon: 'TrendingUp',
      finding: `${topReason.name} is the most common recorded reason for lost sales`,
      records: topReason.value,
      evidence: `${topReason.value} out of ${opportunities.length} opportunities cite ${topReason.name.toLowerCase()} as the primary reason.`,
      action: `Review ${topReason.name.toLowerCase()}-related opportunities to identify recurring patterns.`,
      isInference: false,
    });
  }

  const highValueLost = opportunities
    .filter(o => o.quoted_value > 83000 && o.status === 'open')
    .length;

  if (highValueLost > 0) {
    insights.push({
      id: 'insight-2',
      category: 'opportunity',
      icon: 'DollarSign',
      finding: `${highValueLost} high-value opportunities (>₹80,000) are still open`,
      records: highValueLost,
      evidence: `These represent significant potential recovery value. Early action typically yields better outcomes.`,
      action: 'Prioritize outreach to high-value open opportunities.',
      isInference: true,
    });
  }

  const recentLost = opportunities.filter(o => {
    const age = Date.now() - new Date(o.created_at).getTime();
    return age < 7 * 86400000 && o.status === 'open';
  }).length;

  if (recentLost > 0) {
    insights.push({
      id: 'insight-3',
      category: 'timing',
      icon: 'Clock',
      finding: `${recentLost} opportunities were lost in the past 7 days`,
      records: recentLost,
      evidence: `Recent losses are more likely to be recoverable. Customer interest may still be active.`,
      action: 'Focus recovery efforts on recently lost opportunities first.',
      isInference: true,
    });
  }

  return insights.slice(0, 3);
}
