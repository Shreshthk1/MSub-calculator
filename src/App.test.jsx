import { describe, expect, it } from 'vitest'
import { calculateLease } from './lib/lease'

describe('calculateLease', () => {
  it('splits the lease amount over 36 months and waives the admin fee for members', () => {
    const result = calculateLease({
      laptopPrice: 1200,
      deviceType: 'pc',
      termMonths: 36,
      adminFee: 130,
      isMember: true,
      protectionPlan: 'none',
      protectionCost: 0,
    })

    // For a PC with price 1200, KTT per table = 150
    expect(result.kttAmount).toBe(150)
    // financed = 1200 - 150 = 1050; over 36 months -> 1050/36 = 29.166666...
    expect(result.monthlyLease).toBeCloseTo(29.166666, 5)
    expect(result.adminFeeMonthly).toBe(0)
    expect(result.monthlyPayment).toBeCloseTo(29.166666, 5)
  })
})
