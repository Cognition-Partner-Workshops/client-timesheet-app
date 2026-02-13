import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { customerApi } from '../services/api';
import type { Customer } from '../services/api';

const emptyForm = { name: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', country: '', businessName: '', creditLimit: '', active: true };

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (search) {
        const res = await customerApi.search(search);
        setCustomers(res.data); setTotalPages(1);
      } else {
        const res = await customerApi.getAll(page, 10);
        setCustomers(res.data.content); setTotalPages(res.data.totalPages);
      }
    } catch { setCustomers([]); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (c: Customer) => {
    setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address || '', city: c.city || '', state: c.state || '', zipCode: c.zipCode || '', country: c.country || '', businessName: c.businessName || '', creditLimit: c.creditLimit ? String(c.creditLimit) : '', active: c.active });
    setEditingId(c.id); setError(''); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const payload = { ...form, creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined };
    try {
      if (editingId) await customerApi.update(editingId, payload);
      else await customerApi.create(payload);
      setShowModal(false); load();
    } catch (err: any) {
      setError(err.response?.data?.message || JSON.stringify(err.response?.data?.errors || 'Failed'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this customer?')) return;
    try { await customerApi.delete(id); load(); } catch { }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium"><Plus size={16} /> Add Customer</button>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search customers..." className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}
        </div>
      </div>
      {loading ? <div className="text-center py-8 text-gray-500">Loading...</div> : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Business</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Credit Limit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.businessName || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{c.creditLimit ? `$${Number(c.creditLimit).toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${c.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 p-1 ml-1"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No customers found</td></tr>}
            </tbody>
          </table>
          {!search && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
              <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Customer' : 'New Customer'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label><input value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">State</label><input value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label><input value={form.zipCode} onChange={e => setForm({...form, zipCode: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Country</label><input value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label><input type="number" step="0.01" value={form.creditLimit} onChange={e => setForm({...form, creditLimit: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                <div className="flex items-center gap-2 pt-5"><input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="rounded" /><label className="text-sm text-gray-700">Active</label></div>
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
