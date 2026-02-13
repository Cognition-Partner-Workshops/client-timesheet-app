import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, X, Eye, ChevronDown } from 'lucide-react';
import { orderApi, customerApi, supplierApi, productApi } from '../services/api';
import type { Order, Customer, Supplier, Product } from '../services/api';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  PROCESSING: 'bg-indigo-50 text-indigo-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  IN_TRANSIT: 'bg-cyan-50 text-cyan-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

interface OrderItemForm { productId: string; quantity: string; unitPrice: string; }

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [form, setForm] = useState({ customerId: '', supplierId: '', shippingAddress: '', deliveryDate: '', notes: '' });
  const [items, setItems] = useState<OrderItemForm[]>([{ productId: '', quantity: '1', unitPrice: '' }]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (statusFilter) {
        const res = await orderApi.getByStatus(statusFilter);
        setOrders(res.data); setTotalPages(1);
      } else {
        const res = await orderApi.getAll(page, 10);
        setOrders(res.data.content); setTotalPages(res.data.totalPages);
      }
    } catch { setOrders([]); }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    Promise.all([
      customerApi.getActive(),
      supplierApi.getActive(),
      productApi.getAll(0, 100),
    ]).then(([c, s, p]) => {
      setCustomers(c.data);
      setSuppliers(s.data);
      setProducts(p.data.content);
    }).catch(() => {});
  }, []);

  const openCreate = () => {
    setForm({ customerId: '', supplierId: '', shippingAddress: '', deliveryDate: '', notes: '' });
    setItems([{ productId: '', quantity: '1', unitPrice: '' }]);
    setError(''); setShowModal(true);
  };

  const addItem = () => setItems([...items, { productId: '', quantity: '1', unitPrice: '' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof OrderItemForm, val: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: val };
    if (field === 'productId' && val) {
      const prod = products.find(p => p.id === parseInt(val));
      if (prod) updated[i].unitPrice = String(prod.price);
    }
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const validItems = items.filter(i => i.productId && i.quantity && i.unitPrice);
    if (validItems.length === 0) { setError('At least one item is required'); return; }
    try {
      await orderApi.create({
        customerId: parseInt(form.customerId),
        supplierId: form.supplierId ? parseInt(form.supplierId) : undefined,
        items: validItems.map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity), unitPrice: parseFloat(i.unitPrice) })),
        shippingAddress: form.shippingAddress || undefined,
        deliveryDate: form.deliveryDate || undefined,
        notes: form.notes || undefined,
      });
      setShowModal(false); load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try { await orderApi.updateStatus(id, status); load(); } catch { }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this order?')) return;
    try { await orderApi.delete(id); load(); } catch { }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium"><Plus size={16} /> New Order</button>
      </div>
      <div className="flex gap-2">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {loading ? <div className="text-center py-8 text-gray-500">Loading...</div> : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Supplier</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{o.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{o.supplierName || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block group">
                      <span className={`px-2 py-1 rounded text-xs font-medium cursor-pointer inline-flex items-center gap-1 ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}`}>
                        {o.status} <ChevronDown size={12} />
                      </span>
                      <div className="hidden group-hover:block absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-32">
                        {STATUSES.filter(s => s !== o.status).map(s => (
                          <button key={s} onClick={() => updateStatus(o.id, s)} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50">{s}</button>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">${Number(o.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setShowDetail(o)} className="text-blue-600 hover:text-blue-800 p-1"><Eye size={15} /></button>
                    <button onClick={() => handleDelete(o.id)} className="text-red-600 hover:text-red-800 p-1 ml-1"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>}
            </tbody>
          </table>
          {!statusFilter && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
              <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Order {showDetail.orderNumber}</h2>
              <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{showDetail.customerName}</span></div>
                <div><span className="text-gray-500">Supplier:</span> <span className="font-medium">{showDetail.supplierName || '-'}</span></div>
                <div><span className="text-gray-500">Status:</span> <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[showDetail.status]}`}>{showDetail.status}</span></div>
                <div><span className="text-gray-500">Total:</span> <span className="font-bold text-lg">${Number(showDetail.totalAmount).toFixed(2)}</span></div>
                {showDetail.shippingAddress && <div className="col-span-2"><span className="text-gray-500">Shipping:</span> <span className="font-medium">{showDetail.shippingAddress}</span></div>}
                {showDetail.notes && <div className="col-span-2"><span className="text-gray-500">Notes:</span> <span className="font-medium">{showDetail.notes}</span></div>}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Items</h3>
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-gray-500"><th className="text-left pb-2">Product</th><th className="text-left pb-2">SKU</th><th className="text-right pb-2">Qty</th><th className="text-right pb-2">Unit Price</th><th className="text-right pb-2">Subtotal</th></tr></thead>
                  <tbody>
                    {showDetail.items?.map((item, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 font-medium">{item.productName}</td>
                        <td className="py-2 font-mono text-xs text-gray-500">{item.productSku}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                        <td className="py-2 text-right font-medium">${Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">New Order</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                  <select required value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="">Select customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select value={form.supplierId} onChange={e => setForm({...form, supplierId: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="">Select supplier (optional)</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label><input value={form.shippingAddress} onChange={e => setForm({...form, shippingAddress: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label><input type="date" value={form.deliveryDate} onChange={e => setForm({...form, deliveryDate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Order Items</h3>
                  <button type="button" onClick={addItem} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-1">
                        {i === 0 && <label className="block text-xs text-gray-500 mb-1">Product</label>}
                        <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="">Select product</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                      </div>
                      <div className="w-20">
                        {i === 0 && <label className="block text-xs text-gray-500 mb-1">Qty</label>}
                        <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                      <div className="w-28">
                        {i === 0 && <label className="block text-xs text-gray-500 mb-1">Unit Price</label>}
                        <input type="number" step="0.01" min="0.01" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                      {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={15} /></button>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
