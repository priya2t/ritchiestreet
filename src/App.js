import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './api/Home';
import ProductDetail from './api/ProductDetail';
import Cart from './api/Cart';
import Checkout from './api/Checkout';
import Login from './api/Login';
import LoginNew from './api/LoginNew';
import LoginFlow from './components/LoginFlow';
import ExistingUserLogin from './components/ExistingUserLogin';
import Register from './api/Register';
import ExistingUserRegister from './components/ExistingUserRegister';
import MyAccount from './api/MyAccount';
import OrderSuccess from './api/OrderSuccess';
import About from './components/About';
import Contact from './components/Contact';
import Terms from './components/Terms';
import Services from './components/Services';
import ProductsPage from './api/ProductsPage';
import CategoryProducts from './api/CategoryProducts';
import SearchResults from './api/SearchResults';
import { useUserStore } from './api/userStore';

function App() {
  const { initAuth } = useUserStore();

  // Initialize authentication state on app load
  useEffect(() => {
    initAuth();
  }, [initAuth]);

return (
  <Router basename="/demo">
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
      <Route path="/login" element={<ExistingUserLogin />} />
      <Route path="/register" element={<ExistingUserRegister />} />
      <Route path="/my-account" element={<MyAccount />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/services" element={<Services />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/category/:slug" element={<CategoryProducts />} />
      <Route path="/search" element={<SearchResults />} />
    </Routes>
    <Footer />
  </Router>
);
}

export default App;