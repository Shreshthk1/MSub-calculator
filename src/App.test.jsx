import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { calculateLease, getKttAmount } from './lib/lease'

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
    expect(result.monthlyPayment).toBeCloseTo(29.166666 * 1.05, 5)
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

  it('applies mobile and smart watch KTT by brand and price band', () => {
    expect(getKttAmount(749.99, 'mobile-apple')).toBe(0)
    expect(getKttAmount(750, 'mobile-apple')).toBe(200)
    expect(getKttAmount(1399, 'mobile-samsung')).toBe(200)
    expect(getKttAmount(1800, 'mobile-google')).toBe(300)
    expect(getKttAmount(2200, 'mobile-apple')).toBe(600)
    expect(getKttAmount(3000, 'mobile-samsung')).toBe(400)
    expect(getKttAmount(499.99, 'watch-apple')).toBe(0)
    expect(getKttAmount(800, 'watch-samsung')).toBe(150)
    expect(getKttAmount(1100, 'watch-apple')).toBe(250)
  })

  it('applies laptop, desktop and tablet KTT by brand and price band', () => {
    expect(getKttAmount(999.99, 'mac')).toBe(200)
    expect(getKttAmount(1699.99, 'mac')).toBe(500)
    expect(getKttAmount(1799.99, 'pc')).toBe(200)
    expect(getKttAmount(1499.99, 'pc')).toBe(150)
    expect(getKttAmount(1600, 'desktop-pc')).toBe(250)
    expect(getKttAmount(2100, 'desktop-apple')).toBe(500)
    expect(getKttAmount(499.99, 'tablet-ipad')).toBe(0)
    expect(getKttAmount(1200, 'tablet-ipad')).toBe(300)
    expect(getKttAmount(2500, 'tablet-samsung')).toBe(350)
    expect(getKttAmount(1999.99, 'tablet-surface')).toBe(200)
  })

  it('shows total savings when the 36-month total is less than the laptop price', () => {
    render(<App />)

    expect(screen.getByText(/total savings/i)).toBeInTheDocument()

    const laptopPriceInput = screen.getByRole('spinbutton', { name: /device price/i })
    fireEvent.change(laptopPriceInput, { target: { value: '300' } })

    expect(screen.queryByText(/total savings/i)).not.toBeInTheDocument()
  })
})
