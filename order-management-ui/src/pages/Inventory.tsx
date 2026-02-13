import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, PackagePlus, AlertTriangle } from 'lucide-react';
import { inventoryApi, productApi } from '../services/api';
import type { Inventory as InventoryType, Product } from '../services/api';

const emptyForm = { productId: '', quantityOnHand: '', reorderLevel: '', reorderQuantity: '', warehouseLocation: '' };

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryType[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRestock, setShowRestock] = useState<InventoryType | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [restockQty, setRestockQty] = useState('');
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    productApi.getAll(0, 100).then(r => setProducts(r.data.content)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (showLowStock) {
        const res = await inventoryApi.getLowStock();
        setInventory(res.data); setTotalPages(1);
      } else {
        const res = await inventoryApi.getAll(page, 10);
        setInventory(res.data.content); setTotalPages(res.data.totalPages);
      }
    } catch { setInventory([]); }
    setLoading(false);
  }, [page, showLowStock]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (inv: InventoryType) => {
    setForm({ productId: String(inv.productId), quantityOnHand: String(inv.quantityOnHand), reorderLevel: String(inv.reorderLevel), reorderQuantity: String(inv.reorderQuantity), warehouseLocation: inv.warehouseLocation || '' });
    setEditingId(inv.id); setError(''); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const payload = { productId: parseInt(form.productId), quantityOnHand: parseInt(form.quantityOnHand), reorderLevel: parseInt(form.reorderLevel), reorderQuantity: parseInt(form.reorderQuantity), warehouseLocation: form.warehouseLocation };
    try {
      if (editingId) await inventoryApi.update(editingId, payload);
      else await inventoryApi.create(payload);
      setShowModal(false); load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRestock) return;
    try {
      await inventoryApi.restock(showRestock.id, parseInt(restockQty));
      setShowRestock(null); setRestockQty(''); load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to restock');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this inventory record?')) return;
    try { await inventoryApi.delete(id); load(); } catch { }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium"><Plus size={16} /> Add Inventory</button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setShowLowStock(!showLowStock); setPage(0); }} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showLowStock ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
          <AlertTriangle size={16} /> {showLowStock ? 'Show All' : 'Low Stock Only'}
        </button>
      </div>
      {loading ? <div className="text-center py-8 text-gray-500">Loading...</div> : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">SKU</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Qty On Hand</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Reorder Level</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Reorder Qty</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Warehouse</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(inv => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{inv.productName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{inv.productSku}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${inv.quantityOnHand <= inv.reorderLevel ? 'text-red-600' : 'text-gray-900'}`}>
                      {inv.quantityOnHand}
                    </span>
                    {inv.quantityOnHand <= inv.reorderLevel && <AlertTriangle size={14} className="inline ml-1 text-amber-500" />}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{inv.reorderLevel}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{inv.reorderQuantity}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.warehouseLocation}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => { setShowRestock(inv); setRestockQty(String(inv.reorderQuantity)); setError(''); }} className="text-emerald-600 hover:text-emerald-800 p-1" title="Restock"><PackagePlus size={15} /></button>
                    <button onClick={() => openEdit(inv)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(inv.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No inventory records found</td></tr>}
            </tbody>
          </table>
          {!showLowStock && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
              <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}

      {showRestock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Restock: {showRestock.productName}</h2>
              <button onClick={() => setShowRestock(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleRestock} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
              <div className="text-sm text-gray-600">Current stock: <span className="font-medium">{showRestock.quantityOnHand}</span></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restock Quantity *</label>
                <input required type="number" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowRestock(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Restock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Inventory' : 'New Inventory Record'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                  <select required value={form.productId} onChange={e => setForm({...form, productId: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="">Select product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity On Hand *</label><input required type="number" min="0" value={form.quantityOnHand} onChange={e => setForm({...form, quantityOnHand: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level *</label><input required type="number" min="0" value={form.reorderLevel} onChange={e => setForm({...form, reorderLevel: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Reorder Quantity *</label><input required type="number" min="1" value={form.reorderQuantity} onChange={e => setForm({...form, reorderQuantity: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Location</label><input value={form.warehouseLocation} onChange={e => setForm({...form, warehouseLocation: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
