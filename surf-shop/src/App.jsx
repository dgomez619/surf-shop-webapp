// 1. Remove the import for './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/admin/Login';
import ProductForm from './pages/admin/ProductForm';

// Layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/client/Home';
import Dashboard from './pages/admin/Dashboard';
import Shop from './pages/client/Shop';
import Rentals from './pages/client/Rentals';
import Surfshack from './pages/client/Surfshack';
import Society from './pages/client/Society';

function App() {
  return (
    <BrowserRouter>
      {/* 2. No className="App" needed anymore. The Router is the root. */}
      <Routes>

        {/* CLIENT SIDE ROUTES */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="rentals" element={<Rentals />} />
          <Route path="surfshack" element={<Surfshack />} />
          <Route path="society" element={<Society />} />
          {/* Add more client routes here later, e.g., <Route path="about" ... /> */}
        </Route>

        {/* ADMIN SIDE ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          {/* Add more admin routes here later, e.g., <Route path="settings" ... /> */}
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/:id/edit" element={<ProductForm />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;