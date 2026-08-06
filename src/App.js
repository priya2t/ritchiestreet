import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import BrandAnnouncer from './components/BrandAnnouncer';
import PriceComparisonModal from './components/PriceComparisonModal';
import { useUserStore } from './api/userStore';

const Home = React.lazy(() => import('./api/Home'));
const ProductsPage = React.lazy(() => import('./api/ProductsPage'));
const ProductDetail = React.lazy(() => import('./api/ProductDetail'));
const Cart = React.lazy(() => import('./api/Cart'));
const Checkout = React.lazy(() => import('./api/Checkout'));
const OrderSuccess = React.lazy(() => import('./api/OrderSuccess'));
const ExistingUserLogin = React.lazy(() => import('./components/ExistingUserLogin'));
const ExistingUserRegister = React.lazy(() => import('./components/ExistingUserRegister'));
const MyAccount = React.lazy(() => import('./api/MyAccount'));
const About = React.lazy(() => import('./components/About'));
const Contact = React.lazy(() => import('./components/Contact'));
const Services = React.lazy(() => import('./components/Services'));
const Terms = React.lazy(() => import('./components/Terms'));
const CategoryProducts = React.lazy(() => import('./api/CategoryProducts'));
const SearchResults = React.lazy(() => import('./api/SearchResults'));

function App() {
  const { initAuth } = useUserStore();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [isComparisonOpen, setComparisonOpen] = useState(false);

  // Initialize authentication state on app load
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handlePriceCompare = (product, price) => {
    setSelectedProduct(product);
    setSelectedPrice(price);
    setComparisonOpen(true);
  };

  const handleCloseComparison = () => {
    setComparisonOpen(false);
    setSelectedProduct(null);
    setSelectedPrice(0);
  };

  return (
  <Router basename="/" useTransitions>
    <Header />
    <Suspense fallback={<div className="page-loader" aria-live="polite">Loading page...</div>}>
      <Routes>
        <Route path="/" element={<Home onPriceCompare={handlePriceCompare} />} />
        <Route path="/products" element={<ProductsPage onPriceCompare={handlePriceCompare} />} />
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
        <Route path="/category/:slug" element={<CategoryProducts onPriceCompare={handlePriceCompare} />} />
        <Route path="/search" element={<SearchResults onPriceCompare={handlePriceCompare} />} />
      </Routes>
    </Suspense>
    <BrandAnnouncer />
    <Footer />
    <PriceComparisonModal
      key={selectedProduct?.id || 'modal'}
      isOpen={isComparisonOpen}
      onClose={handleCloseComparison}
      product={selectedProduct}
      price={selectedPrice}
    />
  </Router>
);
}

export default App;