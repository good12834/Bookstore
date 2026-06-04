import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer";
import CacheManager from "./components/CacheManager";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Shop from "./pages/Shope/Shop";
import BookDetails from "./pages/BookDetails";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Orders from "./pages/Orders/Orders";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import EmailPreferences from "./pages/Email/EmailPreferences";


import Wishlist from "./pages/Wishlist";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="app-wrapper">
              <Navbar />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/books/:id" element={<BookDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />

                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route
                    path="/email-preferences"
                    element={<EmailPreferences />}
                  />

                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </main>
              <Footer />
              <CacheManager />
            </div>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
