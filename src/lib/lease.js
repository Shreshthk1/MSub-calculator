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
  const adminFeeMonthly = isMember ? 0 : toNumber(adminFee) / months
  // protectionCost is the full term cost; show monthly equivalent (3 years)
  const protectionMonthly = protectionPlan === 'none' ? 0 : toNumber(protectionCost) / 36
  const monthlyPayment = monthlyLease + adminFeeMonthly + protectionMonthly
  const totalLeaseCost = monthlyLease * months + (isMember ? 0 : toNumber(adminFee)) + toNumber(protectionCost)

  return {
    deviceType,
    kttAmount,
    financedAmount,
    monthlyLease,
    adminFeeMonthly,
    monthlyPayment,
    totalLeaseCost,
    protectionMonthly,
    termMonths: months,
  }
}
