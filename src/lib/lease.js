function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
function getKttAmount(price, deviceType) {
  const p = toNumber(price)
  if (p < 500) return 0

  if (deviceType === 'mac') {
    if (p >= 500 && p < 1500) return 400
    if (p >= 1500 && p < 2000) return 500
    return 600
  }

  // default: PC laptop
  if (p >= 500 && p < 1500) return 150
  if (p >= 1500 && p < 2000) return 200
  return 200
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
    (protectionPlan === 'bbpplus' ? toNumber(protectionCost) : toNumber(protectionCost))
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
