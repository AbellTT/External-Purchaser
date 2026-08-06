import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Package,
  Tag,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const PRODUCTS = [
  { id: 'a4paper',  name: 'Sinar Line A4 Paper',   unit: 'ream',       platformPrice: 820,  marketPrice: 985  },
  { id: 'hptoner',  name: '05A HP Toner Ink',       unit: 'cartridge',  platformPrice: 2050, marketPrice: 2450 },
  { id: 'boxfile',  name: 'Box File Kent',           unit: 'piece',      platformPrice: 118,  marketPrice: 145  },
  { id: 'ledger',   name: 'Ledger Book',             unit: 'piece',      platformPrice: 348,  marketPrice: 420  },
  { id: 'ballpen',  name: 'Ballpoint Pen (Box/50)',  unit: 'box',        platformPrice: 195,  marketPrice: 240  },
  { id: 'stapler',  name: 'Heavy Duty Stapler',      unit: 'piece',      platformPrice: 580,  marketPrice: 710  },
]

const BRANDS: Record<string, string[]> = {
  a4paper: ['Sinar Line', 'Double A', 'Chamex', 'Navigator'],
  hptoner: ['HP Original', 'HP Compatible', 'Canon'],
  boxfile: ['Kent', 'Marlin', 'Local Brand'],
  ledger:  ['Standard', 'Premium Hardcover'],
  ballpen: ['Bic', 'Pilot', 'Pentel', 'Local'],
  stapler: ['Kangaro', 'Rapesco', 'Local Brand'],
}

type Step = 1 | 2 | 3 | 4

export function DirectPurchasePage() {
  const [step, setStep] = useState<Step>(1)
  const [productId, setProductId] = useState('')
  const [brand, setBrand] = useState('')
  const [quantity, setQuantity] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const product = PRODUCTS.find((p) => p.id === productId)
  const qty = parseInt(quantity) || 0
  const total = product ? qty * product.platformPrice : 0
  const marketTotal = product ? qty * product.marketPrice : 0
  const savings = marketTotal - total

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsSubmitting(false)
    setIsSuccess(true)
  }

  const STEPS = [
    { n: 1, label: 'Select Item' },
    { n: 2, label: 'Choose Brand' },
    { n: 3, label: 'Quantity' },
    { n: 4, label: 'Confirm' },
  ]

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Direct Purchase
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Order immediately at competitive wholesale pricing without waiting for a basket.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                s.n < step ? 'bg-primary text-primary-foreground' :
                s.n === step ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2' :
                'bg-surface-muted text-muted-foreground border border-border'
              }`}>
                {s.n < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${s.n === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <Card className="border-border">
          <CardContent className="p-6">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-6"
              >
                <div className="w-14 h-14 bg-success-bg text-success rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Order Placed!</h2>
                <p className="text-sm text-muted-foreground">
                  Your order for <strong>{qty} {product?.unit}(s)</strong> of <strong>{product?.name}</strong> has been submitted.
                  Our procurement team will call to confirm delivery.
                </p>
                <div className="bg-success-bg border border-success/20 rounded-lg p-3 text-sm text-success font-semibold">
                  You saved ETB {savings.toLocaleString()} vs Merkato market price
                </div>
                <Button onClick={() => { setStep(1); setProductId(''); setBrand(''); setQuantity(''); setIsSuccess(false) }}>
                  Place Another Order
                </Button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {/* Step 1 */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                    <div>
                      <CardTitle className="text-base mb-1">Select a Product</CardTitle>
                      <CardDescription>Choose the stationery item you need to purchase.</CardDescription>
                    </div>
                    <div className="grid gap-2">
                      {PRODUCTS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setProductId(p.id); setBrand('') }}
                          className={`flex items-center justify-between p-4 rounded-lg border text-left transition-all hover:border-primary/50 ${
                            productId === p.id ? 'border-primary bg-primary-subtle ring-1 ring-primary/20' : 'border-border bg-card hover:bg-surface-muted/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${productId === p.id ? 'bg-primary text-primary-foreground' : 'bg-surface-muted text-muted-foreground'}`}>
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">per {p.unit}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary font-mono">ETB {p.platformPrice}</p>
                            <p className="text-[11px] text-muted-foreground line-through font-mono">ETB {p.marketPrice}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={() => setStep(2)} disabled={!productId} className="gap-1.5">
                        Continue <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                    <div>
                      <CardTitle className="text-base mb-1">Choose Brand</CardTitle>
                      <CardDescription>Select your preferred brand for {product?.name}.</CardDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(BRANDS[productId] || []).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBrand(b)}
                          className={`p-3 rounded-lg border text-sm font-semibold text-left transition-all ${
                            brand === b ? 'border-primary bg-primary-subtle text-primary' : 'border-border bg-card hover:bg-surface-muted/40 text-foreground'
                          }`}
                        >
                          <Tag className={`w-3.5 h-3.5 mb-1 ${brand === b ? 'text-primary' : 'text-muted-foreground'}`} />
                          <br />{b}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                        <ChevronLeft className="w-4 h-4" />Back
                      </Button>
                      <Button onClick={() => setStep(3)} disabled={!brand} className="gap-1.5">
                        Continue <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                    <div>
                      <CardTitle className="text-base mb-1">Specify Quantity</CardTitle>
                      <CardDescription>How many {product?.unit}(s) of {product?.name} do you need?</CardDescription>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qty" className="font-mono text-xs font-semibold text-foreground">
                        Quantity ({product?.unit}s) *
                      </Label>
                      <Input
                        id="qty"
                        type="number"
                        min={1}
                        placeholder={`e.g. 50`}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="h-10 text-sm font-mono"
                      />
                    </div>

                    {qty > 0 && product && (
                      <div className="bg-surface-muted rounded-lg border border-border p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Platform price:</span>
                          <span className="font-mono font-semibold text-foreground">ETB {product.platformPrice} × {qty}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                          <span className="text-foreground">Total</span>
                          <span className="text-primary font-mono">ETB {total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">vs Merkato market:</span>
                          <span className="text-muted-foreground line-through font-mono">ETB {marketTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-success">
                          <span>You save:</span>
                          <span className="font-mono">ETB {savings.toLocaleString()} ({Math.round((savings/marketTotal)*100)}%)</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <Button variant="outline" onClick={() => setStep(2)} className="gap-1.5">
                        <ChevronLeft className="w-4 h-4" />Back
                      </Button>
                      <Button onClick={() => setStep(4)} disabled={qty < 1} className="gap-1.5">
                        Review Order <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4 */}
                {step === 4 && product && (
                  <motion.div key="s4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                    <div>
                      <CardTitle className="text-base mb-1">Confirm Order</CardTitle>
                      <CardDescription>Review your order before submitting.</CardDescription>
                    </div>

                    <div className="bg-surface-muted rounded-lg border border-border p-4 space-y-2 text-sm divide-y divide-border">
                      {[
                        ['Product',   product.name],
                        ['Brand',     brand],
                        ['Quantity',  `${qty} ${product.unit}(s)`],
                        ['Unit Price', `ETB ${product.platformPrice}`],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between py-1.5 first:pt-0 last:pb-0">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="font-semibold text-foreground">{v}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-1.5 font-bold text-base">
                        <span>Total</span>
                        <span className="text-primary font-mono">ETB {total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1.5 text-success font-semibold text-xs">
                        <span>Savings vs market</span>
                        <span className="font-mono">ETB {savings.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-info-bg border border-info/20 rounded-md p-3">
                      <AlertCircle className="w-4 h-4 text-info shrink-0" />
                      Our procurement team will call <strong>0911234567</strong> to confirm delivery details within 24 hours.
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button variant="outline" onClick={() => setStep(3)} className="gap-1.5">
                        <ChevronLeft className="w-4 h-4" />Back
                      </Button>
                      <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-1.5 px-6">
                        {isSubmitting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" />Placing Order...</>
                        ) : (
                          <><CheckCircle2 className="w-4 h-4" />Place Order</>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
