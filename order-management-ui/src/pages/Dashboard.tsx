import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, Truck, ShoppingCart, Warehouse, AlertTriangle } from 'lucide-react';
import { productApi, supplierApi, customerApi, orderApi, inventoryApi } from '../services/api';
import type { Inventory } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, suppliers: 0, customers: 0, orders: 0, inventory: 0 });
  const [lowStock, setLowStock] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productApi.getAll(0, 1),
      supplierApi.getAll(0, 1),
      customerApi.getAll(0, 1),
      orderApi.getAll(0, 1),
      inventoryApi.getAll(0, 1),
      inventoryApi.getLowStock(),
    ]).then(([p, s, c, o, i, ls]) => {
      setStats({
        products: p.data.totalElements,
        suppliers: s.data.totalElements,
        customers: c.data.totalElements,
        orders: o.data.totalElements,
        inventory: i.data.totalElements,
      });
      setLowStock(ls.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Products', count: stats.products, icon: Package, to: '/products', color: 'bg-blue-500' },
    { label: 'Suppliers', count: stats.suppliers, icon: Truck, to: '/suppliers', color: 'bg-purple-500' },
    { label: 'Customers', count: stats.customers, icon: Users, to: '/customers', color: 'bg-amber-500' },
    { label: 'Orders', count: stats.orders, icon: ShoppingCart, to: '/orders', color: 'bg-emerald-500' },
    { label: 'Inventory', count: stats.inventory, icon: Warehouse, to: '/inventory', color: 'bg-cyan-500' },
  ];

  if (loading) return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(({ label, count, icon: Icon, to, color }) => (
          <Link
            key={label}
            to={to}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
              <div className={`${color} p-3 rounded-lg text-white`}>
                <Icon size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-amber-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">SKU</th>
                  <th className="pb-2 font-medium">Qty On Hand</th>
                  <th className="pb-2 font-medium">Reorder Level</th>
                  <th className="pb-2 font-medium">Warehouse</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2 font-medium text-gray-900">{item.productName}</td>
                    <td className="py-2 text-gray-600">{item.productSku}</td>
                    <td className="py-2">
                      <span className="text-red-600 font-semibold">{item.quantityOnHand}</span>
                    </td>
                    <td className="py-2 text-gray-600">{item.reorderLevel}</td>
                    <td className="py-2 text-gray-600">{item.warehouseLocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
