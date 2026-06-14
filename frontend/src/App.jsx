import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import ShippingPage from './pages/ShippingPage'
import PaymentPage from './pages/PaymentPage'
import PlaceOrderPage from './pages/PlaceOrderPage'
import OrderPage from "./pages/OrderPage"
import TrackOrderPage from "./pages/TrackOrderPage"

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRoles from './pages/admin/AdminRoles'
import AdminPermissions from './pages/admin/AdminPermissions'
import AdminCategories from './pages/admin/AdminCategories'
import AdminReturns from './pages/admin/AdminReturns'

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/orders" element={<AdminOrders />} />
      <Route path="/returns" element={<AdminReturns />} />
      <Route path="/products" element={<AdminProducts />} />
      <Route path="/stock" element={<AdminProducts />} />
      <Route path="/users" element={<AdminUsers />} />
      <Route path="/roles" element={<AdminRoles />} />
      <Route path="/permissions" element={<AdminPermissions />} />
      <Route path="/categories" element={<AdminCategories />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin layout (sidebar, custom header, no container) */}
        <Route path="/admin-panel/*" element={<AdminRoutes />} />

        {/* Client layout (standard navigation, container, footer) */}
        <Route path="*" element={
          <>
            <Header />
            <main className="py-3">
              <Container fluid="xl">
                <Routes>
                  <Route path="/" element={<HomePage />} exact />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/shipping" element={<ShippingPage />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/placeorder" element={<PlaceOrderPage />} />
                  <Route path="/order/:id" element={<OrderPage />} />
                  <Route path="/track-order/:id" element={<TrackOrderPage />} />
                  <Route path="/product/:id" element={<ProductPage/>}/>
                  <Route path="/cart/:id?" element={<CartPage/>} />
                </Routes>
              </Container>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
