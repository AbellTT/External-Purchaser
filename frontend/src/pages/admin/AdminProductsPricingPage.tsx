import { useState, useRef } from 'react'
import {
  Tag,
  Edit3,
  Save,
  CheckCircle2,
  Plus,
  Info,
  Search,
  Trash2,
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
  selectAllProducts,
  addProduct,
  updateProductPrices,
  updateBrandStock,
  deleteProduct,
} from '@/store/slices/productsSlice'
import type { Product, Brand } from '@/types/api'

const PAGE_SIZE = 6

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
      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
        Brand Image Selection
      </label>

      {/* Preview & Upload Area */}
      <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded border border-slate-800">
        <div className="w-12 h-12 rounded bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
          {selectedUrl && !selectedUrl.includes('default') ? (
            <img src={selectedUrl} alt="Selected Brand" className="w-full h-full object-contain p-1" />
          ) : (
            <Package className="w-6 h-6 text-slate-500" />
          )}
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-[11px] text-slate-300 font-medium truncate">
            {selectedUrl.startsWith('data:') ? 'Custom Uploaded Image' : selectedUrl.split('/').pop() || 'Default Logo'}
          </p>
          <div className="flex gap-2">
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
              className="text-[11px] h-7 border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 gap-1"
            >
              <Upload className="w-3 h-3 text-blue-400" /> Upload Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminProductsPricingPage() {
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectAllProducts)

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Modals & Notifications
  const [showAddModal, setShowAddModal] = useState(false)
  const [managingItem, setManagingItem] = useState<{ product: Product; brand: Brand } | null>(null)
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null)

  // Add Product Form State
  const [newProductName, setNewProductName] = useState('')
  const [newCategory, setNewCategory] = useState('Paper Products')
  const [newUnit, setNewUnit] = useState('Ream (500 sheets)')
  const [newBrandName, setNewBrandName] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('/images/brands/double-a.png')
  const [newStockQty, setNewStockQty] = useState(250)
  const [newInStock, setNewInStock] = useState(true)
  const [newRegularPrice, setNewRegularPrice] = useState(700)
  const [newMerkatoPrice, setNewMerkatoPrice] = useState(650)
  const [newDirectPrice, setNewDirectPrice] = useState(620)

  // Edit Item Form State inside Management Modal
  const [editBrandName, setEditBrandName] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editRegularPrice, setEditRegularPrice] = useState(0)
  const [editMerkatoPrice, setEditMerkatoPrice] = useState(0)
  const [editDirectPrice, setEditDirectPrice] = useState(0)
  const [editStockQty, setEditStockQty] = useState(0)
  const [editInStock, setEditInStock] = useState(true)

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase()
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brands.some((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Unique categories for dropdown
  const categories = Array.from(new Set(products.map((p) => p.category)))

  // Handle Add Product Submit
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProductName.trim() || !newBrandName.trim()) return

    const brandId = `brand_${Date.now()}`
    const productId = `prod_${Date.now()}`

    const newBrand: Brand = {
      id: brandId,
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

    const newProductItem: Product = {
      id: productId,
      name: newProductName.trim(),
      category: newCategory,
      unit: newUnit.trim(),
      inStock: newInStock,
      brands: [newBrand],
      regularMarketPrice: Number(newRegularPrice),
      merkatoRetailerPrice: Number(newMerkatoPrice),
      directPurchasePrice: Number(newDirectPrice),
      babiPlatformPrice: null,
      supplierCost: null,
    }

    dispatch(addProduct(newProductItem))

    // Reset Form
    setNewProductName('')
    setNewBrandName('')
    setNewImageUrl('/images/brands/double-a.png')
    setNewStockQty(250)
    setNewRegularPrice(700)
    setNewMerkatoPrice(650)
    setNewDirectPrice(620)
    setShowAddModal(false)

    setSavedSuccess('New product & brand registered!')
    setTimeout(() => setSavedSuccess(null), 3000)
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
  const handleSaveManageChanges = (e: React.FormEvent) => {
    e.preventDefault()
    if (!managingItem) return

    const { product, brand } = managingItem

    dispatch(
      updateProductPrices({
        productId: product.id,
        brandId: brand.id,
        regularMarketPrice: editRegularPrice,
        merkatoRetailerPrice: editMerkatoPrice,
        directPurchasePrice: editDirectPrice,
      })
    )

    dispatch(
      updateBrandStock({
        productId: product.id,
        brandId: brand.id,
        stockQuantity: editStockQty,
        inStock: editInStock,
      })
    )

    setManagingItem(null)
    setSavedSuccess('Product pricing & stock saved!')
    setTimeout(() => setSavedSuccess(null), 2500)
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-400" />
              Products & Pricing Management
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage product catalog, brand imagery, inventory stock, and market price benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <div className="p-2 px-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" /> {savedSuccess}
              </div>
            )}
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Pricing Rules Notice Banner */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-3.5 sm:p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-blue-400">Pricing & Inventory Guidelines</p>
              <p className="text-slate-400 leading-relaxed text-[11px] sm:text-xs">
                • <strong className="text-slate-200">Admin Managed:</strong> Regular Market Price, Merkato Retailers Price, and Direct Purchase Price.<br />
                • <strong className="text-slate-200">Basket Managed (Auto-Filled):</strong> Babi Basket Price and Supplier Wholesale Cost automatically populate upon basket completion.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search product or brand..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="bg-slate-950 border border-slate-800 rounded text-xs text-white px-2 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Total: {filteredProducts.length} items
            </span>
          </div>
        </div>

        {/* Product Catalog — Responsive Cards View for Mobile + Clean Desktop List */}
        <div className="space-y-3">
          {/* Desktop Table View (Clean, Spacious 5 Columns) */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-950/50">
                  <th className="p-4">Product & Category</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4">Direct Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedProducts.flatMap((p) =>
                  p.brands.map((b) => {
                    const directPrice = b.price ?? p.directPurchasePrice ?? 0
                    const isAvailable = b.inStock && b.stockQuantity > 0

                    return (
                      <tr
                        key={`${p.id}_${b.id}`}
                        onClick={() => openManageModal(p, b)}
                        className="text-slate-300 hover:bg-slate-800/60 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-bold text-white text-sm">{p.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {p.category} • {p.unit}
                          </p>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 font-mono text-[10px] overflow-hidden">
                              {b.imageUrl && !b.imageUrl.includes('default') ? (
                                <img src={b.imageUrl} alt={b.name} className="w-full h-full object-contain p-0.5" />
                              ) : (
                                b.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <span className="font-semibold text-slate-100">{b.name}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                isAvailable
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30 text-[10px]'
                              }
                            >
                              {isAvailable ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                            <span className="text-[11px] font-mono text-slate-400">
                              ({b.stockQuantity} {p.unit}s)
                            </span>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                          ETB {directPrice.toLocaleString()}
                        </td>

                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openManageModal(p, b)}
                            className="text-xs border-slate-700 bg-foreground text-background hover:bg-slate-700 hover:text-white gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                            Manage & Edit
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
            {paginatedProducts.flatMap((p) =>
              p.brands.map((b) => {
                const directPrice = b.price ?? p.directPurchasePrice ?? 0
                const isAvailable = b.inStock && b.stockQuantity > 0

                return (
                  <Card
                    key={`${p.id}_${b.id}`}
                    onClick={() => openManageModal(p, b)}
                    className="border-slate-800 bg-slate-900 hover:bg-slate-800/80 transition-all cursor-pointer"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-white">{p.name}</h3>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {p.category} • {p.unit}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            isAvailable
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]'
                              : 'bg-red-500/10 text-red-400 border-red-500/30 text-[10px]'
                          }
                        >
                          {isAvailable ? 'In Stock' : 'Out'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 font-mono text-[9px]">
                            {b.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-200">{b.name}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-mono block">Direct Price</span>
                          <span className="font-mono font-bold text-emerald-400">ETB {directPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          openManageModal(p, b)
                        }}
                        className="w-full text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 justify-center gap-1.5 mt-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        Manage Product & Edit Prices
                      </Button>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border border-slate-800 bg-slate-900 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded text-xs font-mono font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white'
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Add Product Modal (with Image Picker) */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <Card className="w-full max-w-xl border-slate-800 bg-slate-900 shadow-2xl my-auto">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <CardTitle className="text-base text-white font-semibold flex items-center gap-2">
                    <Box className="w-5 h-5 text-blue-400" />
                    Register New Product & Brand
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Add new items to the stationery catalog for Direct Purchase & Basket Pooling
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <form onSubmit={handleAddProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Product Name</label>
                      <input
                        type="text"
                        required
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="e.g. A4 Copy Paper"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Category</label>
                      <input
                        type="text"
                        required
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="e.g. Paper Products"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Unit Description</label>
                      <input
                        type="text"
                        required
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                        placeholder="e.g. Ream (500 sheets)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Brand Name</label>
                      <input
                        type="text"
                        required
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder="e.g. Double A"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Brand Image Picker */}
                  <ImagePicker selectedUrl={newImageUrl} onSelectUrl={(url) => setNewImageUrl(url)} />

                  {/* Stock Quantity & Status */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Initial Stock Qty</label>
                      <input
                        type="number"
                        required
                        value={newStockQty}
                        onChange={(e) => setNewStockQty(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newInStock}
                          onChange={(e) => setNewInStock(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-500"
                        />
                        Immediate In-Stock Status
                      </label>
                    </div>
                  </div>

                  {/* Prices Section */}
                  <div className="border-t border-slate-800 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-blue-400">Configure 3 Price Benchmarks (ETB)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">1. Regular Market</label>
                        <input
                          type="number"
                          required
                          value={newRegularPrice}
                          onChange={(e) => setNewRegularPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">2. Merkato Retailer</label>
                        <input
                          type="number"
                          required
                          value={newMerkatoPrice}
                          onChange={(e) => setNewMerkatoPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">3. Direct Purchase</label>
                        <input
                          type="number"
                          required
                          value={newDirectPrice}
                          onChange={(e) => setNewDirectPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-emerald-400 font-bold font-mono focus:outline-none focus:border-blue-500"
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
                      className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs">
                      Register Product
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dedicated "Manage Product & Edit Pricing" Modal */}
        {managingItem && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <Card className="w-full max-w-xl border-slate-800 bg-slate-900 shadow-2xl my-auto">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <CardTitle className="text-base text-white font-semibold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    Manage & Edit Pricing: {managingItem.product.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Brand: {managingItem.brand.name} • Unit: {managingItem.product.unit}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setManagingItem(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-5">
                <form onSubmit={handleSaveManageChanges} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Brand Name</label>
                    <input
                      type="text"
                      required
                      value={editBrandName}
                      onChange={(e) => setEditBrandName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Brand Image Picker */}
                  <ImagePicker selectedUrl={editImageUrl} onSelectUrl={(url) => setEditImageUrl(url)} />

                  {/* Stock Quantity & Availability */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Stock Quantity ({managingItem.product.unit}s)</label>
                      <input
                        type="number"
                        required
                        value={editStockQty}
                        onChange={(e) => setEditStockQty(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editInStock}
                          onChange={(e) => setEditInStock(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-500"
                        />
                        In Stock & Available
                      </label>
                    </div>
                  </div>

                  {/* 3 Admin Editable Prices */}
                  <div className="border-t border-slate-800 pt-3 space-y-3">
                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                      Editable Pricing Benchmarks (ETB)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">1. Regular Market</label>
                        <input
                          type="number"
                          required
                          value={editRegularPrice}
                          onChange={(e) => setEditRegularPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">2. Merkato Retailer</label>
                        <input
                          type="number"
                          required
                          value={editMerkatoPrice}
                          onChange={(e) => setEditMerkatoPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">3. Direct Purchase</label>
                        <input
                          type="number"
                          required
                          value={editDirectPrice}
                          onChange={(e) => setEditDirectPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-emerald-400 font-bold font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2 Auto-Filled Basket Prices Info */}
                  <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      Basket Auto-Filled Prices (Historical)
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] block">4. Babi Basket Price:</span>
                        <span className="text-blue-400 font-bold">
                          {managingItem.brand.babiPlatformPrice
                            ? `ETB ${managingItem.brand.babiPlatformPrice}`
                            : 'Auto-filled on Basket Complete'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">5. Supplier Wholesale Cost:</span>
                        <span className="text-purple-400 font-bold">
                          {managingItem.brand.supplierCost
                            ? `ETB ${managingItem.brand.supplierCost}`
                            : 'Auto-filled on Basket Complete'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${managingItem.product.name}?`)) {
                          dispatch(deleteProduct(managingItem.product.id))
                          setManagingItem(null)
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300 hover:bg-slate-800 gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Product
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setManagingItem(null)}
                        className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
