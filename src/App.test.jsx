import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { calculateLease } from './lib/lease'

describe('calculateLease', () => {
  it('uses the entered protection cost for BBP+ while showing it as a first-year charge', () => {
    const result = calculateLease({
      laptopPrice: 1200,
      deviceType: 'pc',
      termMonths: 36,
      adminFee: 130,
      isMember: false,
      protectionPlan: 'bbpplus',
      protectionCost: 39,
    })

    expect(result.protectionMonthly).toBe(39)
    expect(result.totalLeaseCost).toBeCloseTo(1050 + 39, 5)
  })

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

  it('includes 5% tax in the monthly payment', () => {
    const result = calculateLease({
      laptopPrice: 1200,
      deviceType: 'pc',
      termMonths: 36,
      adminFee: 130,
      isMember: false,
      protectionPlan: 'none',
      protectionCost: 0,
    })

    const subtotal = result.monthlyLease + result.adminFeeMonthly + result.protectionMonthly
    expect(result.monthlyPayment).toBeCloseTo(subtotal * 1.05, 5)
  })

  it('shows total savings when the 36-month total is less than the laptop price', () => {
    render(<App />)

    expect(screen.getByText(/total savings/i)).toBeInTheDocument()

    const laptopPriceInput = screen.getByRole('spinbutton', { name: /laptop price/i })
    fireEvent.change(laptopPriceInput, { target: { value: '300' } })

    expect(screen.queryByText(/total savings/i)).not.toBeInTheDocument()
  })
})
