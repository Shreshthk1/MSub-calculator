function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
// KTT tiers: [minimum price, KTT amount], highest band first.
// Devices priced below the lowest band are not eligible for KTT.
// KTT is based on the system price; associate discounts don't move it to a lower band.
export const KTT_TABLES = {
  pc: [[2000, 200], [1500, 200], [1000, 150], [500, 150]],
  mac: [[2000, 600], [1500, 500], [1000, 400], [500, 200]],
  'desktop-pc': [[2000, 300], [1500, 250], [1000, 150], [500, 150]],
  'desktop-apple': [[2000, 500], [1500, 400], [1000, 300], [500, 200]],
  'tablet-surface': [[2000, 250], [1500, 200], [1000, 150], [500, 100]],
  'tablet-samsung': [[2000, 350], [1500, 200], [1000, 150], [500, 100]],
  'tablet-ipad': [[2000, 500], [1500, 400], [1000, 300], [500, 150]],
  'mobile-apple': [[2500, 600], [2000, 600], [1750, 500], [1500, 400], [1250, 350], [1000, 300], [750, 200]],
  'mobile-samsung': [[2500, 400], [2000, 350], [1750, 300], [1500, 250], [1250, 200], [1000, 150], [750, 100]],
  'mobile-google': [[2500, 400], [2000, 350], [1750, 300], [1500, 250], [1250, 200], [1000, 150], [750, 100]],
  'watch-apple': [[1000, 250], [750, 150], [500, 100]],
  'watch-samsung': [[1000, 250], [750, 150], [500, 100]],
}

export const ADMIN_FEE = 129.99

export function getKttAmount(price, deviceType) {
  const p = toNumber(price)
  const table = KTT_TABLES[deviceType] ?? KTT_TABLES.pc
  const band = table.find(([minimum]) => p >= minimum)
  return band ? band[1] : 0
}

export function calculateLease({
  laptopPrice,
  deviceType = 'pc',
  termMonths,
  adminFee,
  isMember,
  protectionPlan,
  protectionCost,
}) {
  const price = toNumber(laptopPrice)
  const months = Math.max(1, Math.round(toNumber(termMonths) || 36))
  const kttAmount = getKttAmount(price, deviceType)
  const financedAmount = Math.max(0, price - kttAmount)
  const monthlyLease = financedAmount / months
  const waivesAdminFee = isMember || protectionPlan === 'bbpplus'
  const adminFeeMonthly = waivesAdminFee ? 0 : toNumber(adminFee) / months
  const protectionMonthly =
    protectionPlan === 'none'
      ? 0
      : protectionPlan === 'bbpplus'
        ? toNumber(protectionCost)
        : toNumber(protectionCost) / 36
  const monthlySubtotal = monthlyLease + adminFeeMonthly + protectionMonthly
  const taxAmount = monthlySubtotal * 0.05
  const monthlyPayment = monthlySubtotal + taxAmount
  const totalLeaseCost =
    monthlyLease * months +
    (waivesAdminFee ? 0 : toNumber(adminFee)) +
    // BBP+ is monthly and cancelable after a year, so only the first 12 months are counted.
    (protectionPlan === 'bbpplus' ? toNumber(protectionCost) * 12 : toNumber(protectionCost))
  const totalWithTax = totalLeaseCost * 1.05

  return {
    deviceType,
    kttAmount,
    financedAmount,
    monthlyLease,
    adminFeeMonthly,
    monthlySubtotal,
    taxAmount,
    monthlyPayment,
    totalLeaseCost,
    totalWithTax,
    protectionMonthly,
    termMonths: months,
  }
}
