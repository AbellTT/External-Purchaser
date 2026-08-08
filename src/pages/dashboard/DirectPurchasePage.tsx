import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Package,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Search,
  X,
  Plus,
  Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

// Product Categories (no brand in product name)
const PRODUCT_CATEGORIES = [
  { 
    id: 'a4paper',
    name: 'Paper',
    category: 'Paper Products',
    unit: 'ream',
    directPrice: 920,
    regularMarketPrice: 1100,
    merkatoRetailerPrice: 950,
    available: true
  },
  { 
    id: 'hptoner',
    name: 'Printer Toner',
    category: 'Printer Supplies',
    unit: 'cartridge',
    directPrice: 2050,
    regularMarketPrice: 2600,
    merkatoRetailerPrice: 2280,
    available: true
  },
  { 
    id: 'boxfile',
    name: 'Box File',
    category: 'Filing & Storage',
    unit: 'piece',
    directPrice: 118,
    regularMarketPrice: 155,
    merkatoRetailerPrice: 132,
    available: true
  },
  { 
    id: 'ledger',
    name: 'Ledger Book',
    category: 'Books & Notebooks',
    unit: 'piece',
    directPrice: 348,
    regularMarketPrice: 445,
    merkatoRetailerPrice: 390,
    available: true
  },
  { 
    id: 'ballpen',
    name: 'Ballpoint Pen',
    category: 'Writing Instruments',
    unit: 'box',
    directPrice: 195,
    regularMarketPrice: 260,
    merkatoRetailerPrice: 225,
    available: true
  },
  { 
    id: 'stapler',
    name: 'Heavy Duty Stapler',
    category: 'Office Equipment',
    unit: 'piece',
    directPrice: 580,
    regularMarketPrice: 750,
    merkatoRetailerPrice: 660,
    available: false  // Out of stock
  },
  { 
    id: 'notebook',
    name: 'Notebook',
    category: 'Books & Notebooks',
    unit: 'piece',
    directPrice: 68,
    regularMarketPrice: 90,
    merkatoRetailerPrice: 78,
    available: true
  },
  { 
    id: 'marker',
    name: 'Marker',
    category: 'Writing Instruments',
    unit: 'piece',
    directPrice: 45,
    regularMarketPrice: 58,
    merkatoRetailerPrice: 52,
    available: true
  },
]

// Brands for each product (separate from product selection)
const BRANDS: Record<string, Array<{name: string, available: boolean}>> = {
  a4paper: [
    { name: 'Sinar Line', available: true },
    { name: 'Double A', available: true },
    { name: 'Chamex', available: false },
    { name: 'Navigator', available: true }
  ],
  hptoner: [
    { name: 'HP Original', available: true },
    { name: 'HP Compatible', available: true },
    { name: 'Canon', available: false }
  ],
  boxfile: [
    { name: 'Kent', available: true },
    { name: 'Marlin', available: true },
    { name: 'Local Brand', available: true }
  ],
  ledger: [
    { name: 'Standard', available: true },
    { name: 'Premium Hardcover', available: true }
  ],
  ballpen: [
    { name: 'Bic', available: true },
    { name: 'Pilot', available: true },
    { name: 'Pentel', available: false },
    { name: 'Local', available: true }
  ],
  stapler: [
    { name: 'Kangaro', available: false },
    { name: 'Rapesco', available: false },
    { name: 'Local Brand', available: false }
  ],
  notebook: [
    { name: 'Premium', available: true },
    { name: 'Standard', available: true }
  ],
  marker: [
    { name: 'Artline', available: true },
    { name: 'Sharpie', available: false },
    { name: 'Local', available: true }
  ],
}

interface CartItem {
  productId: string
  productName: string
  brand: string
  quantity: number
  unitPrice: number
  unit: string
}

type Step = 'cart' | 'review' | 'success'

export function DirectPurchasePage() {
  const [step, setStep] = useState<Step>('cart')
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [quantity, setQuantity] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Search works on brands only - searches across all products' brands
  const searchResults: Array<{productId: string, brandName: string, productName: string, available: boolean}> = []
  if (searchQuery) {
    Object.entries(BRANDS).forEach(([productId, brands]) => {
      brands.forEach(brand => {
        if (brand.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          const product = PRODUCT_CATEGORIES.find(p => p.id === productId)
          if (product && product.available) {
            searchResults.push({
              productId,
              brandName: brand.name,
              productName: product.name,
              available: brand.available
            })
          }
        }
      })
    })
  }
  
  const selectedProduct = PRODUCT_CATEGORIES.find(p => p.id === selectedProductId)
  const availableBrands = selectedProductId ? BRANDS[selectedProductId] || [] : []

  const addToCart = () => {
    if (!selectedProduct || !selectedBrand || !quantity || parseInt(quantity) < 1) return
    
    const newItem: CartItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      brand: selectedBrand,
      quantity: parseInt(quantity),
      unitPrice: selectedProduct.directPrice,
      unit: selectedProduct.unit,
    }
    
    setCart([...cart, newItem])
    setSelectedProductId('')
    setSelectedBrand('')
    setQuantity('')
    setSearchQuery('')
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart]
    const newQty = newCart[index].quantity + delta
    if (newQty > 0) {
      newCart[index].quantity = newQty
      setCart(newCart)
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const regularMarketTotal = cart.reduce((sum, item) => {
    const product = PRODUCT_CATEGORIES.find(p => p.id === item.productId)
    return sum + (item.quantity * (product?.regularMarketPrice || 0))
  }, 0)
  const merkatoRetailerTotal = cart.reduce((sum, item) => {
    const product = PRODUCT_CATEGORIES.find(p => p.id === item.productId)
    return sum + (item.quantity * (product?.merkatoRetailerPrice || 0))
  }, 0)
  const regularSavings = regularMarketTotal - cartTotal
  const merkatoSavings = merkatoRetailerTotal - cartTotal

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setIsSubmitting(false)
    setStep('success')
  }

  const resetOrder = () => {
    setStep('cart')
    setCart([])
    setSelectedProductId('')
    setSelectedBrand('')
    setQuantity('')
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-6">
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

        <AnimatePresence mode="wait">
          {/* Success Screen */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-12"
            >
              <div className="w-16 h-16 bg-success-bg text-success rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Order Placed Successfully!</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your order for <strong>{cart.length} product(s)</strong> has been submitted.
                Our procurement team will call to confirm delivery details within 24 hours.
              </p>
              <div className="bg-success-bg border border-success/20 rounded-lg p-4 max-w-md mx-auto space-y-2">
                <p className="text-sm font-semibold text-success">Total Savings</p>
                <p className="text-xs text-muted-foreground">vs Regular Market: ETB {regularSavings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">vs Merkato Retailers: ETB {merkatoSavings.toLocaleString()}</p>
              </div>
              <Button onClick={resetOrder} className="mt-4">
                Place Another Order
              </Button>
            </motion.div>
          )}

          {/* Shopping Cart */}
          {step === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              {/* Step-by-step Selection */}
              <Card className="border-border">
                <CardContent className="p-5 space-y-5">
                  <div>
                    <CardTitle className="text-base mb-1">Add Items to Cart</CardTitle>
                    <CardDescription>Follow the 3-step process to add products.</CardDescription>
                  </div>

                  {/* Optional Brand Search */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Search Brand (Optional)</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by brand name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    
                    {/* Search Results */}
                    {searchQuery && searchResults.length > 0 && (
                      <div className="border border-border rounded-lg p-3 bg-card space-y-2 max-h-64 overflow-y-auto">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Found {searchResults.length} brand(s)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {searchResults.map((result, idx) => (
                            <button
                              key={idx}
                              type="button"
                              disabled={!result.available}
                              onClick={() => {
                                if (result.available) {
                                  setSelectedProductId(result.productId)
                                  setSelectedBrand(result.brandName)
                                  setSearchQuery('')
                                  setQuantity('')
                                }
                              }}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                !result.available
                                  ? 'border-border bg-surface-muted opacity-50 cursor-not-allowed'
                                  : 'border-border bg-card hover:bg-surface-muted/40 hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-start gap-2 mb-2">
                                <div className="w-12 h-12 rounded-lg bg-card border-2 border-border flex flex-col items-center justify-center shrink-0">
                                  <Package className="w-5 h-5 text-muted-foreground mb-0.5" />
                                  <span className="text-[8px] text-muted-foreground font-mono">Placeholder</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">{result.brandName}</p>
                                  <p className="text-xs text-muted-foreground">{result.productName}</p>
                                </div>
                              </div>
                              {!result.available && (
                                <Badge variant="outline" className="text-[10px] border-error text-error">
                                  Out of Stock
                                </Badge>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {searchQuery && searchResults.length === 0 && (
                      <div className="p-4 border border-border rounded-lg bg-surface-muted text-center">
                        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No brands found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 space-y-5">
                    {/* Step 1: Select Product (only shown if no search or no product selected) */}
                    {!selectedProductId && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            1
                          </div>
                          <Label className="text-sm font-semibold">Select Product</Label>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                          {PRODUCT_CATEGORIES.filter(p => p.available).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedProductId(p.id)
                                setSelectedBrand('')
                                setQuantity('')
                              }}
                              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-surface-muted/40 hover:border-primary/50 text-left transition-all"
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-surface-muted text-muted-foreground">
                                  <Package className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                                  <p className="text-xs text-muted-foreground">{p.category}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProductId && !selectedBrand && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            1
                          </div>
                          <Label className="text-sm font-semibold">Selected Product</Label>
                        </div>
                        <div className="p-3 rounded-lg border border-primary bg-primary-subtle/30">
                          <div className="flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{selectedProduct?.name}</p>
                                <p className="text-xs text-muted-foreground">{selectedProduct?.category}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setSelectedProductId('')
                                setSelectedBrand('')
                                setQuantity('')
                              }}
                            >
                              Change
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Select Brand */}
                    {selectedProductId && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            2
                          </div>
                          <Label className="text-sm font-semibold">Select Brand for {selectedProduct?.name}</Label>
                        </div>
                        
                        {!selectedBrand ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                            {availableBrands.map((b) => (
                              <button
                                key={b.name}
                                type="button"
                                disabled={!b.available}
                                onClick={() => {
                                  if (b.available) {
                                    setSelectedBrand(b.name)
                                  }
                                }}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                  !b.available
                                    ? 'border-border bg-surface-muted opacity-50 cursor-not-allowed'
                                    : 'border-border bg-card hover:bg-surface-muted/40 hover:border-primary/50'
                                }`}
                              >
                                <div className="flex flex-col items-center mb-2">
                                  <div className="w-16 h-16 rounded-lg bg-card border-2 border-border flex flex-col items-center justify-center">
                                    <Package className="w-6 h-6 text-muted-foreground mb-0.5" />
                                    <span className="text-[8px] text-muted-foreground font-mono">Placeholder</span>
                                  </div>
                                </div>
                                <p className={`text-sm font-semibold text-center ${!b.available ? 'text-muted-foreground' : 'text-foreground'}`}>
                                  {b.name}
                                </p>
                                {!b.available && (
                                  <div className="text-[10px] text-error mt-1 text-center">Out of Stock</div>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg border border-primary bg-primary-subtle/30">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-20 h-20 rounded-lg bg-card border-2 border-border flex flex-col items-center justify-center shrink-0">
                                  <Package className="w-8 h-8 text-muted-foreground mb-1" />
                                  <span className="text-[10px] text-muted-foreground font-mono">Placeholder</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <p className="text-sm font-semibold text-foreground">{selectedBrand}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">Brand selected</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setSelectedBrand('')
                                  setQuantity('')
                                }}
                              >
                                Change
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Enter Quantity */}
                    {selectedProduct && selectedBrand && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            3
                          </div>
                          <Label htmlFor="qty" className="text-sm font-semibold">
                            Enter Quantity ({selectedProduct.unit}s)
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            id="qty"
                            type="number"
                            min={1}
                            placeholder="Enter quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="flex-1 font-mono"
                          />
                          <Button 
                            onClick={addToCart}
                            disabled={!quantity || parseInt(quantity) < 1}
                            className="gap-1.5"
                          >
                            <Plus className="w-4 h-4" />Add to Cart
                          </Button>
                        </div>
                        {quantity && parseInt(quantity) > 0 && (
                          <div className="p-3 rounded-lg bg-surface-muted border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                            <p className="text-lg font-bold text-primary font-mono">
                              ETB {(parseInt(quantity) * selectedProduct.directPrice).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Cart Items */}
              {cart.length > 0 && (
                <Card className="border-border">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Shopping Cart ({cart.length} items)</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCart([])}
                        className="text-error hover:text-error hover:bg-error-bg"
                      >
                        Clear All
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {cart.map((item, index) => {
                        const itemTotal = item.quantity * item.unitPrice
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg border border-border">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">Brand: {item.brand}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => updateQuantity(index, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm font-mono font-semibold w-12 text-center">
                                {item.quantity} {item.unit}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => updateQuantity(index, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-primary font-mono">ETB {itemTotal.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">@ETB {item.unitPrice}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-error hover:text-error hover:bg-error-bg"
                              onClick={() => removeFromCart(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>

                    {/* Cart Summary */}
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Platform Direct Price</span>
                        <span className="font-mono font-semibold text-foreground">ETB {cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">vs Regular Market</span>
                        <span className="font-mono text-muted-foreground line-through">ETB {regularMarketTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">vs Merkato Retailers</span>
                        <span className="font-mono text-muted-foreground line-through">ETB {merkatoRetailerTotal.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-border pt-2 space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-success">
                          <span>Savings vs Regular Market</span>
                          <span className="font-mono">ETB {regularSavings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-success">
                          <span>Savings vs Merkato</span>
                          <span className="font-mono">ETB {merkatoSavings.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setStep('review')} 
                      className="w-full gap-1.5"
                    >
                      Proceed to Review <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {cart.length === 0 && (
                <Card className="border-border">
                  <CardContent className="py-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">Your cart is empty. Add products above to get started.</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Review Order */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              <Card className="border-border">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <CardTitle className="text-base mb-1">Review Your Order</CardTitle>
                    <CardDescription>Confirm the details before placing your order.</CardDescription>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {cart.map((item, index) => {
                      const itemTotal = item.quantity * item.unitPrice
                      return (
                        <div key={index} className="flex justify-between items-center p-3 bg-surface-muted rounded-lg text-sm">
                          <div>
                            <p className="font-semibold text-foreground">{item.productName} ({item.brand})</p>
                            <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}(s) × ETB {item.unitPrice}</p>
                          </div>
                          <p className="font-bold text-primary font-mono">ETB {itemTotal.toLocaleString()}</p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Price Summary */}
                  <div className="border-t border-border pt-4 space-y-2 text-sm">
                    <div className="flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span className="text-primary font-mono text-lg">ETB {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-success font-semibold">
                      <span>Total Savings vs Regular Market</span>
                      <span className="font-mono">ETB {regularSavings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-success font-semibold">
                      <span>Total Savings vs Merkato</span>
                      <span className="font-mono">ETB {merkatoSavings.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-info-bg border border-info/20 rounded-md p-3">
                    <AlertCircle className="w-4 h-4 text-info shrink-0" />
                    Our procurement team will call <strong>0911234567</strong> within 24 hours to confirm delivery details.
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep('cart')} 
                      className="flex-1 gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />Back to Cart
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting} 
                      className="flex-1 gap-1.5"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Placing Order...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" />Confirm Order</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
