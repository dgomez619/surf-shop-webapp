// 1. Remove the import for './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/admin/Login';

// Layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/client/Home';
import Shop from './pages/client/Shop';
import Rentals from './pages/client/Rentals';
import Surfshack from './pages/client/Surfshack';
import Society from './pages/client/Society';
import Checkout from './pages/client/Checkout';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import FleetDashboard from './pages/admin/FleetDashboard';
import ShackManager from './pages/admin/ShackManager';
import OrderManager from './pages/admin/OrderManager';

// Admin Components (Forms)
import ProductForm from './components/admin/ProductForm';
import RentalForm from './components/admin/RentalForm';





function App() {
  return (

    <BrowserRouter>
      {/* 2. No className="App" needed anymore. The Router is the root. */}
      <Routes>
        {/* ////////////////////////////////////////////////////////////////////////////// */}
        {/* CLIENT SIDE ROUTES */}

        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="rentals" element={<Rentals />} />
          <Route path="surfshack" element={<Surfshack />} />
          <Route path="society" element={<Society />} />
          <Route path="checkout" element={<Checkout />} />
          {/* Add more client routes here later, e.g., <Route path="about" ... /> */}
        </Route>

        {/* ////////////////////////////////////////////////////////////////////////////// */}
        {/* ADMIN SIDE ROUTES */}
        
        {/* Login Route (No Layout) */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Protected Admin Routes (With Layout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Product Management */}
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />

          {/* Fleet Management */}
          <Route path="fleet" element={<FleetDashboard />} />
          <Route path="fleet/new" element={<RentalForm />} />
          <Route path="fleet/:id/edit" element={<RentalForm />} />
          
          {/* Shack Manager */}
          <Route path="shack" element={<ShackManager />} />

          {/* Order Manager */}
          <Route path="orders" element={<OrderManager />} />
        </Route>

        {/* ////////////////////////////////////////////////////////////////////////////// */}
      </Routes>

    </BrowserRouter>
  );
}

export default App;