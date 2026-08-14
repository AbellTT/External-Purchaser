import { useState } from 'react'
import { Truck, Plus, Star, Phone, MapPin, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAdminSuppliers, addSupplier } from '@/store/slices/adminSlice'

export function AdminSuppliersPage() {
  const dispatch = useAppDispatch()
  const suppliers = useAppSelector(selectAdminSuppliers)

  const [showAddModal, setShowAddModal] = useState(false)
  const [supplierName, setSupplierName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [location, setLocation] = useState('')
  const [categories, setCategories] = useState('')
  const [discount, setDiscount] = useState(10)
  const [addedSuccess, setAddedSuccess] = useState(false)

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierName.trim()) return

    dispatch(
      addSupplier({
        name: supplierName,
        contactPerson,
        phoneNumber,
        locationInMerkato: location,
        suppliedCategories: categories
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        performanceRating: 4.0,
        negotiatedDiscountPercent: Number(discount),
        totalFulfilledOrders: 0,
      })
    )

    setSupplierName('')
    setContactPerson('')
    setPhoneNumber('')
    setLocation('')
    setCategories('')
    setDiscount(10)
    setShowAddModal(false)
    setAddedSuccess(true)
    setTimeout(() => setAddedSuccess(false), 2500)
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" />
              Merkato Wholesale Supplier Directory
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage negotiated wholesale relationships and supplier performance ratings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {addedSuccess && (
              <div className="p-2 px-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Supplier added!
              </div>
            )}
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Supplier
            </Button>
          </div>
        </div>

        {/* Add Supplier Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-lg border-slate-800 bg-slate-900 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-base text-white font-semibold">Register New Wholesale Supplier</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Add Merkato wholesale suppliers with negotiated discount rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSupplier} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-medium text-slate-300">Supplier/Business Name</label>
                      <input
                        type="text"
                        required
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        placeholder="e.g. Merkato Wholesale Paper PLC"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Contact Person</label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-medium text-slate-300">Location in Merkato</label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Tana Supermarket area, Shop #14"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-medium text-slate-300">Product Categories Supplied (comma-separated)</label>
                      <input
                        type="text"
                        value={categories}
                        onChange={(e) => setCategories(e.target.value)}
                        placeholder="Paper Products, Notebooks, Office Supplies"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Negotiated Discount (%)</label>
                      <input
                        type="number"
                        required
                        value={discount}
                        min={1}
                        max={50}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-emerald-400 font-bold font-mono focus:outline-none focus:border-blue-500"
                      />
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
                      Register Supplier
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Suppliers Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <Card key={sup.id} className="border-slate-800 bg-slate-900 hover:bg-slate-800/80 transition-all">
              <CardContent className="p-5 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white leading-tight">{sup.name}</h3>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= Math.round(sup.performanceRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-mono text-amber-400 font-semibold">{sup.performanceRating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{sup.contactPerson} — {sup.phoneNumber}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{sup.locationInMerkato}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {sup.suppliedCategories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="text-[10px] bg-slate-950 text-slate-300 border-slate-800"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Negotiated Discount</p>
                    <p className="text-sm font-bold text-emerald-400 font-mono">{sup.negotiatedDiscountPercent}% off wholesale</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Orders Fulfilled</p>
                    <p className="text-sm font-bold text-white font-mono">{sup.totalFulfilledOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
