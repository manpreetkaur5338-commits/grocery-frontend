import { useState } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";

// Component & Page Imports
import Navbar from "./components/Navbar/Navbar";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import Toast from "./components/Toast/Toast";
import ProfileModal from "./components/Account/ProfileModal";
import MyOrdersModal from "./components/Orders/MyOrdersModal";
import AdminOrdersModal from "./components/Orders/AdminOrdersModal";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";

import "./App.css";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication Context
  const { currentUser, isAuthenticated, logout, setSessionFromAuth } = useAuth();

  // Cart Context
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeItem,
    totalCartCount
  } = useCart();

  // Navigation & Modals State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState(null);
  const [isAdminOrdersOpen, setIsAdminOrdersOpen] = useState(false);

  // Storefront Filter States
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: "", type: "success" });
  };

  // Sign out handler
  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    showToast("You have been signed out successfully.", "info");
    if (location.pathname === "/checkout") {
      navigate("/");
    }
  };

  // Open account handler (navigates to Login or Register page)
  const handleOpenAccount = (mode = "login") => {
    if (mode === "register") {
      navigate("/register");
    } else {
      navigate("/login");
    }
  };

  const handleOpenProfile = () => {
    setIsProfileOpen(true);
  };

  const handleOpenOrders = (orderId = null) => {
    setSelectedTrackingOrderId(orderId);
    setIsOrdersOpen(true);
  };

  const handleOpenAdminOrders = () => {
    setIsAdminOrdersOpen(true);
  };

  // =========================================================================
  // REQUIREMENT 1: Check Login Status on "Proceed to Checkout" in Cart Drawer
  // =========================================================================
  const handleStartCheckout = () => {
    setIsCartOpen(false);

    if (isAuthenticated) {
      // If logged in, navigate directly to Checkout/Payment page
      navigate("/checkout");
    } else {
      // If not logged in, redirect to beautiful Login/Register page
      showToast("Please sign in or create an account to proceed to checkout.", "info");
      navigate("/login?redirect=/checkout", {
        state: { from: "/checkout", reason: "checkout_requires_auth" }
      });
    }
  };

  // Wishlist operations
  const handleToggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        showToast(`Removed "${product.name}" from Wishlist.`, "info");
        return prevWishlist.filter((item) => item.id !== product.id);
      } else {
        showToast(`Saved "${product.name}" to Wishlist!`);
        return [...prevWishlist, product];
      }
    });
  };

  // Smooth scroll
  const scrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectCategory = (categoryName) => {
    setActiveCategory(categoryName);
    scrollToSection("products-section");
  };

  const handleViewAll = () => {
    setActiveCategory("All");
    setSearchQuery("");
    scrollToSection("products-section");
  };

  const handleDealClick = (target) => {
    if (target === "All") {
      setIsCartOpen(true);
    } else {
      setActiveCategory(target);
      scrollToSection("products-section");
    }
  };

  // Check if current page is AuthPage or CheckoutPage to conditionally hide general Navbar
  const isDedicatedAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isDedicatedCheckoutPage = location.pathname === "/checkout";

  return (
    <div className="freshroot-app">
      {/* Header Navigation (shown on Storefront & pages where appropriate) */}
      {!isDedicatedAuthPage && !isDedicatedCheckoutPage && (
        <Navbar
          cartCount={totalCartCount}
          wishlistCount={wishlist.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAccount={handleOpenAccount}
          onOpenProfile={handleOpenProfile}
          onOpenOrders={() => handleOpenOrders(null)}
          onOpenAdmin={handleOpenAdminOrders}
          onLogout={handleLogout}
          currentUser={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNavigate={scrollToSection}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Application Routing */}
      <Routes>
        {/* Home & Storefront Page */}
        <Route
          path="/"
          element={
            <HomePage
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              cartItems={cartItems}
              onAddToCart={addToCart}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onOpenCart={() => setIsCartOpen(true)}
              onSelectCategory={handleSelectCategory}
              onViewAll={handleViewAll}
              onDealClick={handleDealClick}
              scrollToSection={scrollToSection}
              showToast={showToast}
            />
          }
        />

        {/* Dedicated Login Page */}
        <Route
          path="/login"
          element={<AuthPage initialTab="login" />}
        />

        {/* Dedicated Create Account Page */}
        <Route
          path="/register"
          element={<AuthPage initialTab="register" />}
        />

        {/* Protected Checkout & Payment Page */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage onTrackOrder={handleOpenOrders} />
            </ProtectedRoute>
          }
        />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Slide-over Cart Drawer (accessible across the storefront) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleStartCheckout}
        onStartShopping={() => {
          setIsCartOpen(false);
          scrollToSection("products-section");
        }}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onNavigate={scrollToSection}
      />

      {/* My Orders Modal */}
      <MyOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        currentUser={currentUser}
        initialOrderId={selectedTrackingOrderId}
        onStartShopping={() => {
          setIsOrdersOpen(false);
          scrollToSection("products-section");
        }}
      />

      {/* Store Admin Orders Modal */}
      <AdminOrdersModal
        isOpen={isAdminOrdersOpen}
        onClose={() => setIsAdminOrdersOpen(false)}
        onOrderStatusUpdated={(updatedOrder) => {
          showToast(`Order #${updatedOrder.orderId} updated to "${updatedOrder.orderStatus}"`);
        }}
      />

      {/* Global Notification Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
};

export default App;
