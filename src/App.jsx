import { useMemo, useState } from 'react'
import { calculateLease } from './lib/lease'

const currency = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function InputField({ label, value, onChange, min = 0, step = 1, suffix, type = 'number' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 focus-within:border-cyan-400">
        <input
          type={type}
          min={min}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent text-lg text-white outline-none"
        />
        {suffix ? <span className="ml-2 text-sm text-slate-400">{suffix}</span> : null}
      </div>
    </label>
  )
}

function MetricCard({ title, value, accent = 'text-white' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`mt-2 text-xl font-semibold ${accent}`}>{value}</p>
    </div>
  )
}

function KttInfo({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-2xl rounded-lg bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close KTT info"
          className="absolute right-3 top-3 rounded-md bg-slate-800/40 px-3 py-1 text-sm text-slate-300 hover:bg-slate-800"
        >
          Close
        </button>

        <h3 className="text-lg font-semibold">Important KTT Amount Details</h3>
        <p className="mt-2 text-sm text-slate-400">KTT is applied based on the price band and device type.</p>

        <div className="mt-4 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-300">
                <th className="pb-3 pr-6">Price Band</th>
                <th className="pb-3 pr-6">PC Laptops - KTT Amount</th>
                <th className="pb-3">Apple MacBook - KTT Amount</th>
              </tr>
            </thead>
            <tbody className="mt-2 divide-y divide-slate-800 text-slate-200">
              <tr>
                <td className="py-3">$0 - 499.99</td>
                <td className="py-3">Not available</td>
                <td className="py-3">Not available</td>
              </tr>
              <tr>
                <td className="py-3">$500 - 1499.99</td>
                <td className="py-3">$150</td>
                <td className="py-3">$400</td>
              </tr>
              <tr>
                <td className="py-3">$1500 - 1999.99</td>
                <td className="py-3">$200</td>
                <td className="py-3">$500</td>
              </tr>
              <tr>
                <td className="py-3">$2000+</td>
                <td className="py-3">$200</td>
                <td className="py-3">$600</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [form, setForm] = useState({
    laptopPrice: 1299,
    deviceType: 'pc',
    termMonths: 36,
    adminFee: 130,
    isMember: false,
    protectionPlan: 'none',
    protectionCost: 0,
  })

  const handleChange = (key) => (event) => {
    setForm((previous) => ({ ...previous, [key]: event.target.value }))
  }

  const handlePlanChange = (event) => {
    const nextPlan = event.target.value
    setForm((previous) => ({
      ...previous,
      protectionPlan: nextPlan,
      protectionCost: nextPlan === 'none' ? 0 : previous.protectionCost || 15,
    }))
  }

  const lease = useMemo(
    () =>
      calculateLease({
        laptopPrice: Number(form.laptopPrice),
        deviceType: form.deviceType,
        termMonths: Number(form.termMonths),
        adminFee: Number(form.adminFee),
        isMember: form.isMember,
        protectionPlan: form.protectionPlan,
        protectionCost: Number(form.protectionCost),
      }),
    [form],
  )

  const [showKttInfo, setShowKttInfo] = useState(false)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(135deg,_#020617,_#111827)] text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8 lg:py-16">
        <header className="rounded-[2rem] border border-cyan-400/20 bg-slate-900/70 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Msub lease calculator
              </p>
              <div className="flex items-center gap-3">
                <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
                  Break down the monthly Msub cost and the add-ons in one place.
                </h1>
                <button
                  aria-label="KTT info"
                  onClick={() => setShowKttInfo(true)}
                  className="rounded-full bg-slate-800/40 px-2 py-1 text-sm text-cyan-200"
                >
                  KTT info
                </button>
              </div>
              <p className="mt-4 text-lg text-slate-300">
                This view follows the Msub model: the KTT is removed from the laptop price, the remaining amount is spread over 36 months, and the admin fee is the only finance charge. Warranty coverage is shown as a monthly equivalent even when it is paid in full upfront.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-cyan-100">
              <p className="text-sm text-cyan-200">Estimated monthly payment</p>
              <p className="mt-2 text-3xl font-semibold">{currency.format(lease.monthlyPayment)}</p>
              <p className="mt-1 text-sm text-cyan-100/80">Includes 5% tax</p>
            </div>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="order-2 rounded-[2rem] border border-slate-800 bg-slate-900/70 p-8 shadow-xl shadow-black/20 backdrop-blur lg:order-none">
            <h2 className="text-2xl font-semibold">Lease breakdown</h2>
            <p className="mt-2 text-slate-400">
              The monthly lease is based on the laptop price minus the KTT, spread evenly across 36 months. The admin fee is the only extra cost, and the warranty is shown as a monthly equivalent when selected. The displayed monthly payment includes 5% tax.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <MetricCard title="Laptop price" value={currency.format(Number(form.laptopPrice) || 0)} />
              <MetricCard title="KTT amount" value={currency.format(lease.kttAmount)} />
              <MetricCard title="Price after KTT" value={currency.format(lease.financedAmount)} />
              <MetricCard title="Monthly lease" value={currency.format(lease.monthlyLease)} accent="text-cyan-300" />
              <MetricCard title="Admin fee monthly" value={currency.format(lease.adminFeeMonthly)} />
            </div>

            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
                  Monthly payment (includes 5% tax)
                </span>
                <span className="text-4xl font-semibold text-cyan-300">
                  {currency.format(lease.monthlyPayment)}
                </span>
              </div>
              <div className="mt-6 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Lease amount</span>
                  <span>{currency.format(lease.monthlyLease)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin fee spread over 36 months</span>
                  <span>{currency.format(lease.adminFeeMonthly)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    {form.protectionPlan === 'bbpplus'
                      ? 'BBP+ '
                      : 'Protection plan monthly equivalent'}
                  </span>
                  <span>{currency.format(lease.protectionMonthly)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax (5%)</span>
                  <span>{currency.format(lease.taxAmount)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-base font-semibold text-white">
                  <span>Total cost over 36 months</span>
                  <span>{currency.format(lease.totalWithTax)}</span>
                </div>
                {lease.totalLeaseCost < Number(form.laptopPrice) ? (
                  <div className="flex items-center justify-between text-sm text-emerald-300">
                    <span>Total savings</span>
                    <span>{currency.format(Number(form.laptopPrice) - lease.totalLeaseCost)}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="order-1 rounded-[2rem] border border-slate-800 bg-slate-900/70 p-8 shadow-xl shadow-black/20 backdrop-blur lg:order-none">
            <h2 className="text-2xl font-semibold">Adjust your terms</h2>
            <div className="mt-6 grid gap-4">
              <InputField
                label="Laptop price"
                value={form.laptopPrice}
                onChange={handleChange('laptopPrice')}
                min="0"
                step="100"
                suffix="CAD"
              />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Device type</span>
                <select
                  value={form.deviceType}
                  onChange={(e) => setForm((p) => ({ ...p, deviceType: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white outline-none"
                >
                  <option value="pc">PC Laptop</option>
                  <option value="mac">Apple MacBook</option>
                </select>
              </label>
              {/* KTT percentage removed — KTT is determined from device type and price */}
              <InputField
                label="Admin fee"
                value={form.adminFee}
                onChange={handleChange('adminFee')}
                min="0"
                step="1"
                suffix="CAD"
              />

              <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isMember}
                  onChange={(event) => setForm((previous) => ({ ...previous, isMember: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-400"
                />
                Member? Waives the admin fee.
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Protection plan</span>
                <select
                  value={form.protectionPlan}
                  onChange={handlePlanChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white outline-none"
                >
                  <option value="none">No protection</option>
                  <option value="bbpplus">BBP+</option>
                  <option value="bbppd">BBPPD</option>
                </select>
              </label>

              {form.protectionPlan !== 'none' ? (
                <InputField
                  label={form.protectionPlan === 'bbppd' ? 'Full Protection cost' : 'Monthly protection cost'}
                  value={form.protectionCost}
                  onChange={handleChange('protectionCost')}
                  min="0"
                  step="1"
                  suffix="CAD"
                />
              ) : null}
            </div>

            <p className="mt-6 text-sm leading-6 text-slate-400">
              BBP+ and BBPPD are shown as monthly equivalents for clarity. They are still billed as full-term coverage, but this view helps customers understand the monthly impact.
            </p>
          </section>
        </main>
      </div>
      {showKttInfo ? <KttInfo onClose={() => setShowKttInfo(false)} /> : null}
    </div>
  )
}

export default App
