import { useEffect, useState, useRef, useCallback } from 'react'
import { PageMeta } from '@/components/PageMeta'
import { toast } from 'sonner'
import {
  Tag,
  Edit3,
  Save,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Box,
  Image as ImageIcon,
  Upload,
  X,
  Package,
  Layers,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAdminAccessToken,
  selectAdminAuthLoading,
  selectIsAdminAuthenticated,
  selectIsAdminInitialized,
} from '@/store/adminSlices/adminAuthSlice'
import {
  createBrand,
  createCatalogProduct,
  refreshProductsPricing,
  selectProductsPricing,
  selectProductsPricingCatalogProducts,
  selectProductsPricingProducts,
  saveBrand,
  setProductsPricingCategory,
  setProductsPricingPage,
  setProductsPricingSearch,
} from '@/store/adminSlices/productsPricingSlice'
import type { Product, Brand } from '@/types/api'
import { getApiError } from '@/lib/api'

/**
 * Image Picker Component (File Upload + Preview)
 */
function ImagePicker({
  selectedUrl,
  onSelectUrl,
}: {
  selectedUrl: string
  onSelectUrl: (url: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onSelectUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#c9d1d9] flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-[#f0f6fc]" />
        Brand Image Selection
      </label>

      <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="w-full sm:w-24 h-24 rounded-lg border border-[#30363d] bg-[#161b22] flex items-center justify-center overflow-hidden shrink-0">
            {selectedUrl && !selectedUrl.includes('default') ? (
              <img src={selectedUrl} alt="Selected Brand" className="w-full h-full object-contain p-2" />
            ) : (
              <Package className="w-11 h-11 text-[#8b949e]" />
            )}
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-[13px] border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/5 gap-1"
              >
                <Upload className="w-3 h-3 text-[#f0f6fc]" />
                <span className="hidden sm:inline">Upload Image</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#8b949e]">
              <span>Upload a file to update the preview.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductsPricingSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading products and pricing" aria-busy="true">
      <div className="overflow-hidden rounded-lg border border-[#30363d] bg-[#161b22]">
        <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-4 p-4 border-b border-[#30363d]">
          {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-4 rounded bg-white/5 animate-pulse" />)}
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 p-4 border-b border-[#30363d] last:border-0">
            <div className="space-y-2"><div className="h-5 w-2/3 rounded bg-white/10 animate-pulse" /><div className="h-3 w-1/3 rounded bg-white/5 animate-pulse" /></div>
            <div className="h-9 rounded bg-white/5 animate-pulse" />
            <div className="h-7 rounded bg-white/5 animate-pulse" />
            <div className="h-5 rounded bg-white/5 animate-pulse" />
            <div className="h-9 rounded bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
export function AdminProductsPricingPage() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAdminAccessToken)
  const isAuthenticated = useAppSelector(selectIsAdminAuthenticated)
  const authLoading = useAppSelector(selectAdminAuthLoading)
  const authInitialized = useAppSelector(selectIsAdminInitialized)
  const products = useAppSelector(selectProductsPricingProducts)
  const catalogProducts = useAppSelector(selectProductsPricingCatalogProducts)
  const { searchQuery, categoryFilter, currentPage, totalPages, totalItems, loading, initialized } = useAppSelector(selectProductsPricing)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCatalogModal, setShowCatalogModal] = useState(false)
  const [managingItem, setManagingItem] = useState<{ product: Product; brand: Brand } | null>(null)

  // Debounced search — fires the redux action 400ms after the user stops typing
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = setTimeout(() => {
        dispatch(setProductsPricingSearch(value))
      }, 400)
    },
    [dispatch]
  )
  const [searchInputValue, setSearchInputValue] = useState(searchQuery)

  // Add Product Form State
  const [selectedCatalogProductId, setSelectedCatalogProductId] = useState('')
  const [newBrandName, setNewBrandName] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('/images/brands/double-a.png')
  const [newStockQty, setNewStockQty] = useState(250)
  const [newInStock, setNewInStock] = useState(true)
  const [newRegularPrice, setNewRegularPrice] = useState(700)
  const [newMerkatoPrice, setNewMerkatoPrice] = useState(650)
  const [newDirectPrice, setNewDirectPrice] = useState(620)
  const [catalogName, setCatalogName] = useState('')
  const [catalogCategory, setCatalogCategory] = useState('Paper Products')
  const [catalogUnit, setCatalogUnit] = useState('Piece')
  const [isSaving, setIsSaving] = useState(false)

  // Edit Item Form State inside Management Modal
  const [editBrandName, setEditBrandName] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editRegularPrice, setEditRegularPrice] = useState(0)
  const [editMerkatoPrice, setEditMerkatoPrice] = useState(0)
  const [editDirectPrice, setEditDirectPrice] = useState(0)
  const [editStockQty, setEditStockQty] = useState(0)
  const [editInStock, setEditInStock] = useState(true)

  const authReady = authInitialized && !authLoading && isAuthenticated && Boolean(accessToken)

  useEffect(() => {
    if (!authReady) return
    dispatch(refreshProductsPricing())
  }, [dispatch, authReady, searchQuery, categoryFilter, currentPage])

  const categories = Array.from(new Set(catalogProducts.map((product) => product.category))).sort((a, b) =>
    a.localeCompare(b)
  )

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCatalogProductId || !newBrandName.trim()) return

    const newBrand: Brand = {
      id: '',
      name: newBrandName.trim(),
      imageUrl: newImageUrl.trim() || '/images/brands/default.png',
      inStock: newInStock,
      stockQuantity: Number(newStockQty),
      price: Number(newDirectPrice),
      merkatoRetailerPrice: Number(newMerkatoPrice),
      regularMarketPrice: Number(newRegularPrice),
      babiPlatformPrice: null,
      supplierCost: null,
    }

    setIsSaving(true)
    try {
      await dispatch(createBrand({ productId: selectedCatalogProductId, brand: newBrand })).unwrap()
      await dispatch(refreshProductsPricing()).unwrap()
      setSelectedCatalogProductId('')
      setNewBrandName('')
      setNewImageUrl('/images/brands/double-a.png')
      setShowAddModal(false)
      toast.success('Brand registered in the catalog.')
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Unable to register the brand. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateCatalogProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const product = await dispatch(createCatalogProduct({
        name: catalogName, category: catalogCategory, unit: catalogUnit,
      })).unwrap()
      await dispatch(refreshProductsPricing()).unwrap()
      setSelectedCatalogProductId(product.id)
      setCatalogName('')
      setShowCatalogModal(false)
      setShowAddModal(true)
      toast.success('Catalog product created! Now add its first brand.')
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Unable to create catalog product. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Open Manage Modal
  const openManageModal = (p: Product, b: Brand) => {
    setManagingItem({ product: p, brand: b })
    setEditBrandName(b.name)
    setEditImageUrl(b.imageUrl || '/images/brands/default.png')
    setEditRegularPrice(b.regularMarketPrice ?? p.regularMarketPrice ?? 900)
    setEditMerkatoPrice(b.merkatoRetailerPrice ?? p.merkatoRetailerPrice ?? 850)
    setEditDirectPrice(b.price ?? p.directPurchasePrice ?? 800)
    setEditStockQty(b.stockQuantity)
    setEditInStock(b.inStock)
  }

  // Save Manage Modal Changes
  const handleSaveManageChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!managingItem) return

    const { brand } = managingItem
    setIsSaving(true)
    try {
      await dispatch(saveBrand({
        brandId: brand.id,
        updates: {
          name: editBrandName,
          imageUrl: editImageUrl,
          inStock: editInStock,
          stockQuantity: editStockQty,
          price: editDirectPrice,
          regularMarketPrice: editRegularPrice,
          merkatoRetailerPrice: editMerkatoPrice,
        },
      })).unwrap()
      await dispatch(refreshProductsPricing()).unwrap()
      setManagingItem(null)
      toast.success('Product pricing & stock saved!')
    } catch (error) {
      toast.error(getApiError(error) || 'Unable to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminLayout>
      <PageMeta
        title="Products & Pricing"
        description="Manage the product catalog, brands, and platform pricing."
        path="/admin/products"
      />
      {!authInitialized || authLoading ? (
        <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
          <ProductsPricingSkeleton />
        </div>
      ) : !authReady ? (
        <div className="max-w-3xl mx-auto">
          <Card className="border-[#30363d] bg-[#161b22]">
            <CardContent className="p-5 sm:px-6 space-y-2">
              <h2 className="text-base sm:text-lg font-semibold text-[#f0f6fc]">Session expired</h2>
              <p className="text-sm text-[#8b949e]">
                The admin session is not authenticated yet, so the products page cannot load securely. Please sign in again.
              </p>
              <Button
                className="mt-2 bg-[#238636] hover:bg-[#2ea043] text-[#f0f6fc]"
                onClick={() => {
                  window.location.href = '/admin/login'
                }}
              >
                Go to admin login
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f0f6fc] flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#f0f6fc]" />
              Products & Pricing Management
            </h1>
            <p className="text-sm text-[#8b949e] mt-0.5">
              Manage product catalog, brand imagery, inventory stock, and market price benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-[#238636] hover:bg-[#2ea043] text-[#ffffff] text-sm font-semibold gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Brand & Pricing</span>
            </Button>
          </div>
        </div>
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8b949e]" />
            <input
              type="text"
              value={searchInputValue}
              onChange={(e) => {
                setSearchInputValue(e.target.value)
                handleSearchChange(e.target.value)
              }}
              placeholder="Search product or brand..."
              className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#f0f6fc]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-[#8b949e]">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  dispatch(setProductsPricingCategory(e.target.value))
                }}
                className="min-w-0 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] px-2 py-2 focus:outline-none focus:border-[#f0f6fc]"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-sm text-[#8b949e] font-mono whitespace-nowrap">
              Total: {totalItems} items
            </span>
          </div>
        </div>

        {/* Product Catalog Ã¢â‚¬â€ Responsive Cards View for Mobile + Clean Desktop List */}
        {loading || !initialized ? <ProductsPricingSkeleton /> : <div className="space-y-3">
          {/* Desktop Table View (Clean, Spacious 5 Columns) */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-[#30363d] bg-[#161b22]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#30363d] text-[#8b949e] font-mono bg-[#0d1117]/50">
                  <th className="p-4">Product & Category</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Regular Market</th>
                  <th className="p-4">Merkato Retailer</th>
                  <th className="p-4">Direct Purchase</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {products.flatMap((p) =>
                  p.brands.map((b) => {
                    const directPrice = b.price ?? p.directPurchasePrice ?? 0
                    const isAvailable = b.inStock && b.stockQuantity > 0

                    return (
                      <tr
                        key={`${p.id}_${b.id}`}
                        onClick={() => openManageModal(p, b)}
                        className="text-[#c9d1d9] hover:bg-[#21262d]/60 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-bold text-[#f0f6fc] text-sm">{p.name}</p>
                          <p className="text-[13px] text-[#8b949e] font-mono">
                            {p.category} {p.unit}
                          </p>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-11 h-11 rounded bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-[#8b949e] shrink-0 font-mono text-sm overflow-hidden">
                              {b.imageUrl && !b.imageUrl.includes('default') ? (
                                <img src={b.imageUrl} alt={b.name} className="w-full h-full object-contain p-0.5" />
                              ) : (
                                b.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <span className="font-semibold text-[#f0f6fc]">{b.name}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className={
                                isAvailable
                                  ? 'bg-[#12261e] text-[#3fb950] border-[#238636] text-xs w-fit'
                                  : 'bg-[#2d171a] text-[#f85149] border-[#f85149] text-xs w-fit'
                              }
                            >
                              {isAvailable ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                            <span className="text-[12px] font-mono text-[#8b949e]">{b.stockQuantity} {p.unit}s</span>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-[#c9d1d9] text-sm">
                          {b.regularMarketPrice != null ? `ETB ${Number(b.regularMarketPrice).toLocaleString()}` : <span className="text-[#8b949e] text-xs">—</span>}
                        </td>

                        <td className="p-4 font-mono text-[#c9d1d9] text-sm">
                          {b.merkatoRetailerPrice != null ? `ETB ${Number(b.merkatoRetailerPrice).toLocaleString()}` : <span className="text-[#8b949e] text-xs">—</span>}
                        </td>

                        <td className="p-4 font-mono font-bold text-[#f0f6fc] text-sm">
                          ETB {directPrice.toLocaleString()}
                        </td>

                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openManageModal(p, b)}
                            className="text-sm border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/5 hover:text-[#ffffff] gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#f0f6fc]" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (100% Mobile Responsive Touch UI) */}
          <div className="md:hidden space-y-3">
            {products.flatMap((p) =>
              p.brands.map((b) => {
                const directPrice = b.price ?? p.directPurchasePrice ?? 0
                const isAvailable = b.inStock && b.stockQuantity > 0

                return (
                  <Card
                    key={`${p.id}_${b.id}`}
                    onClick={() => openManageModal(p, b)}
                    className="border-[#30363d] bg-[#161b22] hover:bg-[#21262d]/80 transition-all cursor-pointer"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-[#f0f6fc]">{p.name}</h3>
                          <p className="text-[13px] text-[#8b949e] font-mono">
                            {p.category} {p.unit}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            isAvailable
                              ? 'bg-[#12261e] text-[#3fb950] border-[#238636] text-sm'
                              : 'bg-[#2d171a] text-[#f85149] border-[#f85149] text-sm'
                          }
                        >
                          {isAvailable ? 'In Stock' : 'Out'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#30363d] text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-[#8b949e] font-mono text-[11px] overflow-hidden">
                            {b.imageUrl && !b.imageUrl.includes('default') ? (
                              <img src={b.imageUrl} alt={b.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              b.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <span className="font-semibold text-[#f0f6fc]">{b.name}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm text-[#8b949e] font-mono block">Direct Price</span>
                          <span className="font-mono font-bold text-[#f0f6fc]">ETB {directPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          openManageModal(p, b)
                        }}
                        className="w-full text-sm border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/5 justify-center gap-1.5 mt-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#f0f6fc]" />
                        <span className="hidden sm:inline">Manage Product & Edit Prices</span>
                        <span className="sm:hidden">Manage & Edit</span>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border border-[#30363d] bg-[#161b22] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm text-[#8b949e] font-mono">
              Showing {products.length} of {totalItems} products
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => dispatch(setProductsPricingPage(Math.max(1, currentPage - 1)))}
                className="text-sm border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => dispatch(setProductsPricingPage(pageNum))}
                    className={`w-8 h-8 rounded text-sm font-mono font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#238636] text-[#f0f6fc] font-bold'
                        : 'bg-[#0d1117] text-[#8b949e] hover:bg-[#21262d] hover:text-[#f0f6fc]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => dispatch(setProductsPricingPage(Math.min(totalPages, currentPage + 1)))}
                className="text-sm border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/5 disabled:opacity-40"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </div>}

        {/* Add Product Modal (with Image Picker) */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-[#0d1117]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <Card className="w-full max-w-xl border-[#30363d] bg-[#161b22] shadow-2xl my-auto">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#30363d] pb-4">
                <div>
                  <CardTitle className="text-base text-[#f0f6fc] font-semibold flex items-center gap-2">
                    <Box className="w-5 h-5 text-[#f0f6fc]" />
                    Add Brand to Catalog Product
                  </CardTitle>
                  <CardDescription className="text-sm text-[#8b949e]">
                    Select the standard product first, then attach its purchasable brand, stock, and prices.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddModal(false)}
                  className="text-[#8b949e] hover:text-[#f0f6fc]"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-2 sm:px-6 space-y-4">
                <form onSubmit={handleAddProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-medium text-[#c9d1d9]">Catalog Product</label>
                        <button
                          type="button"
                          onClick={() => { setShowAddModal(false); setShowCatalogModal(true) }}
                          className="text-[13px] font-medium text-[#f0f6fc] underline underline-offset-4 decoration-[#8b949e] hover:decoration-[#f0f6fc]"
                        >
                          + New catalog product
                        </button>
                      </div>
                      <select
                        required
                        value={selectedCatalogProductId}
                        onChange={(e) => setSelectedCatalogProductId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#f0f6fc]"
                      >
                        <option value="">Choose a standard product</option>
                        {catalogProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} {product.unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-[#c9d1d9]">Brand Name</label>
                      <input
                        type="text"
                        required
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder="e.g. Double A"
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] focus:outline-none focus:border-[#f0f6fc]"
                      />
                    </div>
                  </div>

                  {/* Brand Image Picker */}
                  <ImagePicker selectedUrl={newImageUrl} onSelectUrl={(url) => setNewImageUrl(url)} />

                  {/* Stock Quantity & Status */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-[#c9d1d9]">Initial Stock Qty</label>
                      <input
                        type="number"
                        required
                        value={newStockQty}
                        onChange={(e) => setNewStockQty(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] font-mono focus:outline-none focus:border-[#f0f6fc]"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-sm text-[#c9d1d9] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newInStock}
                          onChange={(e) => setNewInStock(e.target.checked)}
                          className="w-4 h-4 rounded border-[#30363d] bg-[#0d1117] text-[#f0f6fc]"
                        />
                        Immediate In-Stock Status
                      </label>
                    </div>
                  </div>

                  {/* Prices Section */}
                  <div className="border-t border-[#30363d] pt-3 space-y-2">
                    <p className="text-sm font-semibold text-[#f0f6fc]">Configure 3 Price Benchmarks (ETB)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-[#c9d1d9]">1. Regular Market</label>
                        <input
                          type="number"
                          required
                          value={newRegularPrice}
                          onChange={(e) => setNewRegularPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] font-mono focus:outline-none focus:border-[#f0f6fc]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-[#c9d1d9]">2. Merkato Retailer</label>
                        <input
                          type="number"
                          required
                          value={newMerkatoPrice}
                          onChange={(e) => setNewMerkatoPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] font-mono focus:outline-none focus:border-[#f0f6fc]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-[#c9d1d9]">3. Direct Purchase</label>
                        <input
                          type="number"
                          required
                          value={newDirectPrice}
                          onChange={(e) => setNewDirectPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] font-bold font-mono focus:outline-none focus:border-[#f0f6fc]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddModal(false)}
                      className="text-sm border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/5"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={isSaving} className="bg-[#238636] hover:bg-[#2ea043] text-[#f0f6fc] font-semibold text-sm">
                      {isSaving ? 'Saving' : 'Register Brand'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {showCatalogModal && (
          <div className="fixed inset-0 z-50 bg-[#0d1117]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-[#30363d] bg-[#161b22] shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#30363d] pb-4">
                <div>
                  <CardTitle className="text-base text-[#f0f6fc] flex items-center gap-2"><Package className="w-5 h-5 text-[#f0f6fc]" /> New Catalog Product</CardTitle>
                  <CardDescription className="text-sm text-[#8b949e]">Create this only once; future brands select it from the catalog.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowCatalogModal(false)} className="text-[#8b949e] hover:text-[#f0f6fc]"><X className="w-5 h-5" /></Button>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleCreateCatalogProduct} className="space-y-3">
                  <input required value={catalogName} onChange={(e) => setCatalogName(e.target.value)} placeholder="Product name, e.g. A4 Copy Paper" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] focus:outline-none focus:border-[#f0f6fc]" />
                  <input required value={catalogCategory} onChange={(e) => setCatalogCategory(e.target.value)} placeholder="Category" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] focus:outline-none focus:border-[#f0f6fc]" />
                  <input required value={catalogUnit} onChange={(e) => setCatalogUnit(e.target.value)} placeholder="Unit, e.g. Ream (500 sheets)" className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] focus:outline-none focus:border-[#f0f6fc]" />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowCatalogModal(false)} className="text-sm border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/5">Cancel</Button>
                    <Button type="submit" size="sm" disabled={isSaving} className="bg-[#238636] hover:bg-[#2ea043] text-[#f0f6fc] text-sm">{isSaving ? 'Creating...' : 'Create Product'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dedicated "Manage Product & Edit Pricing" Modal */}
        {managingItem && (
          <div className="fixed inset-0 z-50 bg-[#0d1117]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <Card className="w-full max-w-xl border-[#30363d] bg-[#161b22] shadow-2xl my-auto">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[#30363d]">
                <div>
                  <CardTitle className="text-base text-[#f0f6fc] font-semibold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#f0f6fc]" />
                    Manage & Edit Pricing: {managingItem.product.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-[#8b949e]">
                    Brand: {managingItem.brand.name} Unit: {managingItem.product.unit}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setManagingItem(null)}
                  className="text-[#8b949e] hover:text-[#f0f6fc]"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>

              <CardContent className="px-4 sm:px-6 space-y-5">
                <form onSubmit={handleSaveManageChanges} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#c9d1d9]">Brand Name</label>
                    <input
                      type="text"
                      required
                      value={editBrandName}
                      onChange={(e) => setEditBrandName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] focus:outline-none focus:border-[#f0f6fc]"
                    />
                  </div>

                  {/* Brand Image Picker */}
                  <ImagePicker selectedUrl={editImageUrl} onSelectUrl={(url) => setEditImageUrl(url)} />

                  {/* Stock Quantity & Availability */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-[#c9d1d9]">Stock Quantity ({managingItem.product.unit}s)</label>
                      <input
                        type="number"
                        required
                        value={editStockQty}
                        onChange={(e) => setEditStockQty(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] font-mono focus:outline-none focus:border-[#f0f6fc]"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-sm text-[#c9d1d9] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editInStock}
                          onChange={(e) => setEditInStock(e.target.checked)}
                          className="w-4 h-4 rounded border-[#30363d] bg-[#0d1117] text-[#f0f6fc]"
                        />
                        In Stock & Available
                      </label>
                    </div>
                  </div>

                  {/* 3 Admin Editable Prices */}
                  <div className="border-t border-[#30363d] pt-3 space-y-3">
                    <h4 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-wider">
                      Editable Pricing Benchmarks (ETB)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-[#c9d1d9]">1. Regular Market</label>
                        <input
                          type="number"
                          required
                          value={editRegularPrice}
                          onChange={(e) => setEditRegularPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] font-mono focus:outline-none focus:border-[#f0f6fc]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-[#c9d1d9]">2. Merkato Retailer</label>
                        <input
                          type="number"
                          required
                          value={editMerkatoPrice}
                          onChange={(e) => setEditMerkatoPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] font-mono focus:outline-none focus:border-[#f0f6fc]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-[#c9d1d9]">3. Direct Purchase</label>
                        <input
                          type="number"
                          required
                          value={editDirectPrice}
                          onChange={(e) => setEditDirectPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-sm text-[#f0f6fc] font-bold font-mono focus:outline-none focus:border-[#f0f6fc]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-lg border border-[#30363d] bg-[#0d1117] p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-wide">
                        Basket-completion pricing
                      </p>
                      <span className="rounded-full border border-[#30363d] bg-[#161b22] px-2.5 py-1 text-[11px] font-medium text-[#8b949e]">
                        Read only
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3">
                        <p className="text-sm text-[#8b949e]">Babi basket price</p>
                        <p className="mt-1 text-sm font-mono font-semibold text-[#f0f6fc]">
                          {managingItem.brand.babiPlatformPrice != null
                            ? `ETB ${managingItem.brand.babiPlatformPrice}`
                            : 'Not recorded yet'}
                        </p>
                        <p className="mt-1 text-xs text-[#8b949e]">Filled by the basket closeout workflow.</p>
                      </div>
                      <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3">
                        <p className="text-sm text-[#8b949e]">Supplier wholesale cost</p>
                        <p className="mt-1 text-sm font-mono font-semibold text-[#f0f6fc]">
                          {managingItem.brand.supplierCost != null
                            ? `ETB ${managingItem.brand.supplierCost}`
                            : 'Not recorded yet'}
                        </p>
                        <p className="mt-1 text-xs text-[#8b949e]">Stored when the basket is closed, not edited here.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-[#30363d]">
                    {/* <span className="text-[13px] text-[#8b949e]">Changes are saved to the live catalog.</span> */}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setManagingItem(null)}
                        className="text-sm border-[#30363d] !bg-transparent text-[#f0f6fc] hover:!bg-white/5"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSaving}
                        className="bg-[#238636] hover:bg-[#2ea043] text-[#f0f6fc] font-semibold text-sm gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      )}
    </AdminLayout>
  )
}



