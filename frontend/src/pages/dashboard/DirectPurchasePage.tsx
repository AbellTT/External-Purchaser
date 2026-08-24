import { useState, useEffect, useRef, useCallback } from 'react'
import { PageMeta } from '@/components/PageMeta'
import { Link } from 'react-router-dom'
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
  FileText,
  Clock,
  PhoneCall,
  Truck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchProducts,
  createDirectPurchaseOrder,
  selectAllProducts,
  selectProductsLoading,
  selectOrderLoading,
  selectOrderResult,
  clearOrderResult,
} from '@/store/slices/productsSlice'
import { selectUser } from '@/store/slices/authSlice'

interface CartItem {
  productId: string
  productName: string
  brandId: string
  brand: string
  quantity: number
  unitPrice: number
  unit: string
}

type Step = 'cart' | 'review' | 'success'

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function DirectPurchaseSkeleton() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="h-6 w-36 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded-md" />
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="h-24 bg-muted rounded-lg" />
              <div className="h-24 bg-muted rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export function DirectPurchasePage() {
  const dispatch = useAppDispatch()
  const productsFromRedux = useAppSelector(selectAllProducts)
  const productsLoading = useAppSelector(selectProductsLoading)
  const isSubmitting = useAppSelector(selectOrderLoading)
  const orderResult = useAppSelector(selectOrderResult)
  const currentUser = useAppSelector(selectUser)

  const [step, setStep] = useState<Step>('cart')
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInputValue, setSearchInputValue] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedBrandId, setSelectedBrandId] = useState('')
  const [selectedBrandName, setSelectedBrandName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [completedCart, setCompletedCart] = useState<CartItem[]>([])

  // Debounced backend search
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInputValue(value)
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = setTimeout(() => {
        setSearchQuery(value)
        // Send search to the backend — resets local product page
        dispatch(fetchProducts({ search: value || undefined, pageSize: 100, includeUnavailable: false }))
        setProductPage(1)
      }, 400)
    },
    [dispatch]
  )

  // Initial load and background refresh on mount
  useEffect(() => {
    dispatch(fetchProducts({ pageSize: 100, includeUnavailable: false }))
  }, [dispatch])

  const [productPage, setProductPage] = useState(1)
  const PRODUCT_PAGE_SIZE = 6

  // Map Redux products to UI format
  // A product is available if it is inStock and has at least one inStock brand
  const PRODUCT_CATEGORIES = productsFromRedux.map((product) => {
    const hasAvailableBrand = product.brands.some((b) => b.inStock && b.stockQuantity > 0)
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      unit: product.unit,
      available: product.inStock && hasAvailableBrand,
    }
  })

  const availableProductsList = PRODUCT_CATEGORIES.filter((p) => p.available)
  const totalProductPages = Math.max(1, Math.ceil(availableProductsList.length / PRODUCT_PAGE_SIZE))
  const paginatedUserProducts = availableProductsList.slice(
    (productPage - 1) * PRODUCT_PAGE_SIZE,
    productPage * PRODUCT_PAGE_SIZE
  )

  // Map brands with ID, availability, stockQuantity, and brand-specific pricing info
  const BRANDS: Record<
    string,
    Array<{ id: string; name: string; imageUrl: string; available: boolean; stockQuantity: number; price: number }>
  > = {}
  productsFromRedux.forEach((product) => {
    BRANDS[product.id] = product.brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      imageUrl: brand.imageUrl || '/images/brands/default.png',
      available: brand.inStock && (brand.stockQuantity ?? 100) > 0,
      stockQuantity: brand.stockQuantity ?? 100,
      price: brand.price,
    }))
  })

  // Show backend-searched results when there's an active query;
  // the backend already filters by brand name, product name, and category
  const searchResults: Array<{
    productId: string
    brandId: string
    brandName: string
    productName: string
    available: boolean
    price: number
  }> = []

  if (searchQuery) {
    productsFromRedux.forEach((product) => {
      product.brands.forEach((brand) => {
        const bInfo = (BRANDS[product.id] || []).find((b) => b.id === brand.id)
        if (bInfo) {
          searchResults.push({
            productId: product.id,
            brandId: brand.id,
            brandName: brand.name,
            productName: product.name,
            available: bInfo.available,
            price: brand.price,
          })
        }
      })
    })
  }

  const selectedProduct = PRODUCT_CATEGORIES.find((p) => p.id === selectedProductId)
  const availableBrands = selectedProductId ? BRANDS[selectedProductId] || [] : []

  // Add to Cart handler (merges duplicate brand selections into single cart item)
  const addToCart = () => {
    if (!selectedProduct || !selectedBrandId || !selectedBrandName || !quantity || parseInt(quantity) < 1)
      return

    const chosenBrandObj = availableBrands.find((b) => b.id === selectedBrandId)
    const unitPrice = chosenBrandObj?.price || 0
    const addedQty = parseInt(quantity)

    const existingIndex = cart.findIndex(
      (item) => item.productId === selectedProduct.id && item.brandId === selectedBrandId
    )

    if (existingIndex > -1) {
      const updatedCart = [...cart]
      updatedCart[existingIndex].quantity += addedQty
      setCart(updatedCart)
    } else {
      const newItem: CartItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        brandId: selectedBrandId,
        brand: selectedBrandName,
        quantity: addedQty,
        unitPrice,
        unit: selectedProduct.unit,
      }
      setCart([...cart, newItem])
    }

    setSelectedProductId('')
    setSelectedBrandId('')
    setSelectedBrandName('')
    setQuantity('')
    setSearchQuery('')
    setSearchInputValue('')
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

  // Exact brand-based pricing & savings calculations across ALL items in cart
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const regularMarketTotal = cart.reduce((sum, item) => {
    const prod = productsFromRedux.find((p) => p.id === item.productId)
    const brand = prod?.brands.find((b) => b.id === item.brandId)
    const regPrice = brand?.regularMarketPrice != null ? Number(brand.regularMarketPrice) : Math.round(item.unitPrice * 1.15)
    return sum + item.quantity * regPrice
  }, 0)
  const merkatoRetailerTotal = cart.reduce((sum, item) => {
    const prod = productsFromRedux.find((p) => p.id === item.productId)
    const brand = prod?.brands.find((b) => b.id === item.brandId)
    const merkPrice = brand?.merkatoRetailerPrice != null ? Number(brand.merkatoRetailerPrice) : Math.round(item.unitPrice * 1.08)
    return sum + item.quantity * merkPrice
  }, 0)
  const regularSavings = Math.max(0, regularMarketTotal - cartTotal)
  const merkatoSavings = Math.max(0, merkatoRetailerTotal - cartTotal)

  // Totals for the completed order receipt screen
  const completedTotal = completedCart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const completedRegularSavings = completedCart.reduce((sum, item) => {
    const prod = productsFromRedux.find((p) => p.id === item.productId)
    const brand = prod?.brands.find((b) => b.id === item.brandId)
    const regPrice = brand?.regularMarketPrice != null ? Number(brand.regularMarketPrice) : Math.round(item.unitPrice * 1.15)
    return sum + item.quantity * (regPrice - item.unitPrice)
  }, 0)
  const completedMerkatoSavings = completedCart.reduce((sum, item) => {
    const prod = productsFromRedux.find((p) => p.id === item.productId)
    const brand = prod?.brands.find((b) => b.id === item.brandId)
    const merkPrice = brand?.merkatoRetailerPrice != null ? Number(brand.merkatoRetailerPrice) : Math.round(item.unitPrice * 1.08)
    return sum + item.quantity * (merkPrice - item.unitPrice)
  }, 0)

  // Handle Order Submit
  const handleSubmit = async () => {
    if (cart.length === 0) return

    const orderPayload = {
      items: cart.map((item) => ({
        productId: item.productId,
        brandId: item.brandId,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      notes: notes.trim() ? notes.trim() : undefined,
    }

    setCompletedCart([...cart])
    const res = await dispatch(createDirectPurchaseOrder(orderPayload))

    if (createDirectPurchaseOrder.fulfilled.match(res)) {
      // Re-fetch products so inventory & stock availability stay fresh in Redux
      dispatch(fetchProducts())
      setCart([])
      setStep('success')
    } else {
      const errorMsg = (res.payload as string) || 'Unable to place direct purchase order.'
      toast.error('Order Submission Failed', {
        description: errorMsg,
        duration: 6000,
      })
    }
  }

  const resetOrder = () => {
    dispatch(clearOrderResult())
    setStep('cart')
    setCart([])
    setCompletedCart([])
    setSelectedProductId('')
    setSelectedBrandId('')
    setSelectedBrandName('')
    setQuantity('')
    setNotes('')
  }

  if (productsLoading && productsFromRedux.length === 0) {
    return <DirectPurchaseSkeleton />
  }

  const userPhone = currentUser?.phoneNumber || '0911234567'

  return (
    <DashboardLayout>
      <PageMeta
        title="Direct Purchase"
        description="Order stationery products immediately at competitive prices for urgent procurement needs."
        path="/dashboard/direct-purchase"
      />
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            Direct Purchase
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-1 font-medium">
            Order immediately at competitive wholesale pricing without waiting for a basket.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Success / Order Confirmation Receipt Screen */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Receipt Card */}
              <Card className="border-border shadow-lg overflow-hidden">
                {/* Header Banner */}
                <div className="bg-success/10 border-b border-success/20 p-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-success text-success-foreground rounded-full flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-50 duration-300">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Direct Purchase Order Confirmed!</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your order has been recorded and is currently pending dispatcher verification.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border text-xs font-mono">
                    <span className="text-muted-foreground">Order Reference:</span>
                    <strong className="text-primary font-bold">{orderResult?.orderNumber || 'ORD-2026/08/13-9812'}</strong>
                    <Badge variant="outline" className="text-[10px] bg-warning-bg border-warning/40 text-warning uppercase">
                      {orderResult?.status || 'Pending'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Order Items Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      Purchased Items ({completedCart.length})
                    </h3>
                    <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                      {completedCart.map((item, idx) => (
                        <div key={idx} className="p-3.5 bg-surface-muted/30 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-subtle text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">
                                Brand: <strong className="text-foreground">{item.brand}</strong> · {item.quantity} {item.unit}(s) × ETB {item.unitPrice.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-mono font-bold text-foreground">
                            ETB {(item.quantity * item.unitPrice).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Savings Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Financial Summary */}
                    <div className="bg-surface-muted/50 border border-border p-4 rounded-xl space-y-2 text-xs">
                      <p className="font-mono font-semibold uppercase text-muted-foreground mb-1">
                        Pricing Summary
                      </p>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Items Total ({completedCart.length} line items)</span>
                        <span className="font-mono text-foreground font-semibold">ETB {completedTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery Fee</span>
                        <span className="font-mono text-success font-semibold">Included</span>
                      </div>
                      <div className="border-t border-border pt-2 flex justify-between text-sm font-bold text-foreground">
                        <span>Grand Total</span>
                        <span className="font-mono text-primary text-base">
                          ETB {(orderResult?.total || completedTotal).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Savings Achieved */}
                    <div className="bg-success-bg/60 border border-success/30 p-4 rounded-xl space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-success">
                        <Sparkles className="w-4 h-4" />
                        Wholesale Savings Achieved
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">vs Regular Market:</span>
                          <span className="font-mono font-bold text-success">
                            ETB {completedRegularSavings.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">vs Merkato Retailers:</span>
                          <span className="font-mono font-bold text-success">
                            ETB {completedMerkatoSavings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps Fulfillment Timeline */}
                  <div className="border-t border-border pt-5 space-y-3">
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      What Happens Next?
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-surface-muted/40 rounded-lg border border-border flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                          1
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">Order Logged</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Recorded in your Order History.</p>
                        </div>
                      </div>
                      <div className="p-3 bg-surface-muted/40 rounded-lg border border-border flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-info-bg text-info flex items-center justify-center shrink-0 text-xs font-bold">
                          2
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                            <PhoneCall className="w-3 h-3 text-info" /> Verification
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Team calls <strong>{userPhone}</strong> within 24h.
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-surface-muted/40 rounded-lg border border-border flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-success-bg text-success flex items-center justify-center shrink-0 text-xs font-bold">
                          3
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                            <Truck className="w-3 h-3 text-success" /> Dispatch
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Delivered directly to your organization.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button variant="outline" onClick={resetOrder} className="flex-1 gap-2">
                      <Plus className="w-4 h-4" /> Place Another Order
                    </Button>
                    <Button asChild className="flex-1 gap-2">
                      <Link to="/dashboard/orders">
                        View in Order History <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Shopping Cart Step */}
          {step === 'cart' && (
            <motion.div
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              {/* Step-by-step Selection Card */}
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
                        value={searchInputValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    {/* Search Results */}
                    {searchQuery && searchResults.length > 0 && (
                      <div className="border border-border rounded-lg p-3 bg-card space-y-2 max-h-64 overflow-y-auto">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Found {searchResults.length} brand(s)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full min-w-0 max-w-full overflow-hidden">
                          {searchResults.map((result, idx) => (
                            <button
                              key={idx}
                              type="button"
                              disabled={!result.available}
                              onClick={() => {
                                if (result.available) {
                                  setSelectedProductId(result.productId)
                                  setSelectedBrandId(result.brandId)
                                  setSelectedBrandName(result.brandName)
                                  setSearchQuery('')
                                  setSearchInputValue('')
                                  dispatch(fetchProducts({ pageSize: 100, includeUnavailable: false }))
                                  setQuantity('')
                                }
                              }}
                              className={`p-3 rounded-lg border text-left transition-all w-full min-w-0 max-w-full overflow-hidden ${
                                !result.available
                                  ? 'border-border bg-surface-muted opacity-50 cursor-not-allowed'
                                  : 'border-border bg-card hover:bg-surface-muted/40 hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-start gap-2 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                                  <Package className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate">{result.brandName}</p>
                                  <p className="text-xs text-muted-foreground truncate">{result.productName}</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-xs font-mono mt-1">
                                <span className="font-bold text-primary">ETB {result.price.toLocaleString()}</span>
                                {!result.available && (
                                  <Badge variant="outline" className="text-[10px] border-error text-error">
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchQuery && searchResults.length === 0 && (
                      <div className="p-4 border border-border rounded-lg bg-surface-muted text-center">
                        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No brands found matching "{searchInputValue}"</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 space-y-5">
                    {/* Step 1: Select Product */}
                    {!selectedProductId && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                              1
                            </div>
                            <Label className="text-sm font-semibold">Select Product</Label>
                          </div>
                          {totalProductPages > 1 && (
                            <span className="text-xs text-muted-foreground font-mono">
                              Page {productPage} of {totalProductPages}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full min-w-0 max-w-full overflow-hidden">
                          {paginatedUserProducts.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedProductId(p.id)
                                setSelectedBrandId('')
                                setSelectedBrandName('')
                                setQuantity('')
                              }}
                              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-surface-muted/40 hover:border-primary/50 text-left transition-all group w-full min-w-0 max-w-full overflow-hidden"
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0 overflow-hidden">
                                <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-surface-muted text-muted-foreground group-hover:bg-primary-subtle group-hover:text-primary transition-colors">
                                  <Package className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <p className="text-sm sm:text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                    {p.name}
                                  </p>
                                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{p.category}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Product Pagination Bar */}
                        {totalProductPages > 1 && (
                          <div className="pt-3 border-t border-border">
                            {/* Mobile Pagination (Clean single line) */}
                            <div className="flex sm:hidden items-center justify-between gap-2 w-full">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={productPage === 1}
                                onClick={() => setProductPage((prev) => Math.max(1, prev - 1))}
                                className="text-xs gap-1 h-9 px-3"
                              >
                                <ChevronLeft className="w-4 h-4" /> Previous
                              </Button>

                              <span className="text-xs font-mono font-semibold text-muted-foreground">
                                Page {productPage} of {totalProductPages}
                              </span>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={productPage === totalProductPages}
                                onClick={() => setProductPage((prev) => Math.min(totalProductPages, prev + 1))}
                                className="text-xs gap-1 h-9 px-3"
                              >
                                Next <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Desktop Pagination */}
                            <div className="hidden sm:flex items-center justify-between gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={productPage === 1}
                                onClick={() => setProductPage((prev) => Math.max(1, prev - 1))}
                                className="text-xs gap-1"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" /> Previous
                              </Button>

                              <div className="flex items-center gap-1.5 py-1">
                                {Array.from({ length: totalProductPages }, (_, i) => i + 1).map((pg) => (
                                  <button
                                    key={pg}
                                    type="button"
                                    onClick={() => setProductPage(pg)}
                                    className={`w-7 h-7 rounded-md text-xs font-mono transition-colors shrink-0 ${
                                      productPage === pg
                                        ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                                        : 'bg-surface-muted text-muted-foreground hover:bg-border'
                                    }`}
                                  >
                                    {pg}
                                  </button>
                                ))}
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={productPage === totalProductPages}
                                onClick={() => setProductPage((prev) => Math.min(totalProductPages, prev + 1))}
                                className="text-xs gap-1"
                              >
                                Next <ChevronRight className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedProductId && !selectedBrandId && (
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
                                setSelectedBrandId('')
                                setSelectedBrandName('')
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

                        {!selectedBrandId ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                            {availableBrands.map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                disabled={!b.available}
                                onClick={() => {
                                  if (b.available) {
                                    setSelectedBrandId(b.id)
                                    setSelectedBrandName(b.name)
                                  }
                                }}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                  !b.available
                                    ? 'border-border bg-surface-muted opacity-50 cursor-not-allowed'
                                    : 'border-border bg-card hover:bg-surface-muted/40 hover:border-primary/50'
                                }`}
                              >
                                <div className="flex flex-col items-center mb-2">
                                  <div className="w-12 h-12 rounded-lg bg-primary-subtle text-primary flex items-center justify-center overflow-hidden">
                                    {b.imageUrl && !b.imageUrl.includes('default') ? (
                                      <img src={b.imageUrl} alt={b.name} className="w-full h-full object-contain p-1" />
                                    ) : (
                                      <Package className="w-6 h-6" />
                                    )}
                                  </div>
                                </div>
                                <p className={`text-base sm:text-lg font-bold text-center truncate ${!b.available ? 'text-muted-foreground' : 'text-foreground'}`}>
                                  {b.name}
                                </p>
                                <p className="text-sm sm:text-base font-mono font-black text-primary text-center mt-0.5">
                                  ETB {b.price.toLocaleString()}
                                </p>
                                <div className="flex items-center justify-center mt-1 pt-1 border-t border-border/50">
                                  <Badge
                                    variant="outline"
                                    className={`text-[9px] py-0 px-1 ${
                                      b.available ? 'bg-success-bg text-success border-success/30' : 'bg-error-bg text-error border-error/30'
                                    }`}
                                  >
                                    {b.available ? 'In Stock' : 'Out of Stock'}
                                  </Badge>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg border border-primary bg-primary-subtle/30">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-foreground">{selectedBrandName}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Brand selected · ETB{' '}
                                    <strong className="text-foreground font-mono">
                                      {availableBrands.find((b) => b.id === selectedBrandId)?.price.toLocaleString()}
                                    </strong>
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setSelectedBrandId('')
                                  setSelectedBrandName('')
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
                    {selectedProduct && selectedBrandId && (
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
                            <Plus className="w-4 h-4" /> Add to Cart
                          </Button>
                        </div>
                        {quantity && parseInt(quantity) > 0 && (
                          <div className="p-3 rounded-lg bg-surface-muted border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                            <p className="text-lg font-bold text-primary font-mono">
                              ETB{' '}
                              {(
                                parseInt(quantity) *
                                (availableBrands.find((b) => b.id === selectedBrandId)?.price || 0)
                              ).toLocaleString()}
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
                        className="text-error hover:text-error hover:bg-error-bg text-xs"
                      >
                        Clear All
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {cart.map((item, index) => {
                        const itemTotal = item.quantity * item.unitPrice
                        return (
                          <div
                            key={index}
                            className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3 bg-surface-muted/60 rounded-lg border border-border"
                          >
                            <div className="flex-1 min-w-[140px]">
                              <p className="text-base sm:text-lg font-bold text-foreground truncate">{item.productName}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">Brand: <strong className="text-foreground">{item.brand}</strong></p>
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
                              <span className="text-sm font-mono font-semibold min-w-12 text-center whitespace-nowrap">
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
                            <div className="text-right ml-auto sm:ml-0">
                              <p className="text-sm font-bold text-primary font-mono whitespace-nowrap">
                                ETB {itemTotal.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">@ETB {item.unitPrice.toLocaleString()}</p>
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
                        <span className="font-mono font-semibold text-foreground">
                          ETB {cartTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">vs Regular Market</span>
                        <span className="font-mono text-muted-foreground line-through">
                          ETB {regularMarketTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">vs Merkato Retailers</span>
                        <span className="font-mono text-muted-foreground line-through">
                          ETB {merkatoRetailerTotal.toLocaleString()}
                        </span>
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

                    <Button onClick={() => setStep('review')} className="w-full gap-1.5">
                      Proceed to Review <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {cart.length === 0 && (
                <Card className="border-border">
                  <CardContent className="py-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      Your cart is empty. Add products above to get started.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Review Order Step */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              <Card className="border-border">
                <CardContent className="p-5 space-y-5">
                  <div>
                    <CardTitle className="text-base mb-1">Review Your Order</CardTitle>
                    <CardDescription>Confirm order details and add optional delivery notes before placing.</CardDescription>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <p className="text-xs font-mono font-semibold text-muted-foreground uppercase">
                      Order Items ({cart.length})
                    </p>
                    {cart.map((item, index) => {
                      const itemTotal = item.quantity * item.unitPrice
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center gap-3 p-3 bg-surface-muted/60 rounded-lg text-sm border border-border"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {item.productName} ({item.brand})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} {item.unit}(s) × ETB {item.unitPrice.toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-primary font-mono shrink-0 whitespace-nowrap">
                            ETB {itemTotal.toLocaleString()}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Optional Order Notes */}
                  <div className="space-y-1.5 border-t border-border pt-4">
                    <Label htmlFor="notes" className="text-xs font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      Order Notes / Delivery Instructions (Optional)
                    </Label>
                    <Input
                      id="notes"
                      placeholder="e.g. Please deliver to Gate 2, Main Administration Building..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="text-xs"
                    />
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
                    Our procurement team will call <strong>{userPhone}</strong> within 24 hours to confirm delivery details.
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep('cart')}
                      className="flex-1 gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back to Cart
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Confirm Order
                        </>
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
