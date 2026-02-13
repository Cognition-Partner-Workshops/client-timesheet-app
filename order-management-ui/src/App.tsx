import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="customers" element={<Customers />} />
          <Route path="orders" element={<Orders />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
