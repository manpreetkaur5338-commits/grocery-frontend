import { useState, useEffect, useRef } from "react";
import { 
  FiSearch as FiSearchIcon, 
  FiUser as FiUserIcon, 
  FiShoppingBag as FiShoppingBagIcon, 
  FiMenu as FiMenuIcon, 
  FiX as FiXIcon, 
  FiHeart as FiHeartIcon,
  FiLogOut as FiLogOutIcon,
  FiLogIn as FiLogInIcon,
  FiUserPlus as FiUserPlusIcon,
  FiCheckCircle as FiCheckCircleIcon,
  FiPackage as FiPackageIcon,
  FiShield as FiShieldIcon,
  FiTruck as FiTruckIcon
} from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./Navbar.css";

const Navbar = ({
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenAccount,
  onOpenProfile,
  onOpenOrders,
  onOpenAdmin,
  onLogout,
  currentUser = null,
  searchQuery = "",
  setSearchQuery,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleNavClick("products-section");
  };

  // Dropdown Action Handlers
  const handleProfileClick = () => {
    setUserDropdownOpen(false);
    if (onOpenProfile) onOpenProfile();
  };

  const handleOrdersClick = () => {
    setUserDropdownOpen(false);
    if (onOpenOrders) onOpenOrders();
  };

  const handleAdminClick = () => {
    setUserDropdownOpen(false);
    if (onOpenAdmin) onOpenAdmin();
  };

  const handleLogoutClick = () => {
    setUserDropdownOpen(false);
    if (onLogout) onLogout();
  };

  const handleLoginClick = () => {
    setUserDropdownOpen(false);
    if (onOpenAccount) onOpenAccount("login");
  };

  const handleRegisterClick = () => {
    setUserDropdownOpen(false);
    if (onOpenAccount) onOpenAccount("register");
  };

  const displayName = currentUser ? (currentUser.name || currentUser.fullName || currentUser.email.split("@")[0]) : "";
  const displayInitial = displayName ? displayName.charAt(0).toUpperCase() : "U";

  return (
    <header className="navbar-header">
      <nav className="navbar-container" aria-label="Main Navigation">
        {/* Brand Logo */}
        <a 
          href="#hero-section" 
          className="navbar-brand" 
          onClick={(e) => { e.preventDefault(); handleNavClick("hero-section"); }}
          aria-label="FreshRoot Home"
        >
          <div className="brand-icon-wrapper">
            <RiLeafLine className="brand-leaf-icon" />
          </div>
          <span className="brand-name">
            FRESH<span className="brand-name-accent">ROOT</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <ul className="navbar-links" role="menubar">
          <li role="none">
            <button 
              type="button" 
              className="nav-link-btn" 
              onClick={() => handleNavClick("hero-section")}
              role="menuitem"
            >
              Home
            </button>
          </li>
          <li role="none">
            <button 
              type="button" 
              className="nav-link-btn" 
              onClick={() => handleNavClick("products-section")}
              role="menuitem"
            >
              Shop
            </button>
          </li>
          <li role="none">
            <button 
              type="button" 
              className="nav-link-btn" 
              onClick={() => handleNavClick("categories-section")}
              role="menuitem"
            >
              Categories
            </button>
          </li>
          <li role="none">
            <button 
              type="button" 
              className="nav-link-btn" 
              onClick={() => handleNavClick("deals-section")}
              role="menuitem"
            >
              Deals
            </button>
          </li>
          <li role="none">
            <button 
              type="button" 
              className="nav-link-btn track-orders-nav-btn" 
              onClick={() => {
                if (onOpenOrders) onOpenOrders();
              }}
              role="menuitem"
            >
              Track Orders
            </button>
          </li>
          <li role="none">
            <button 
              type="button" 
              className="nav-link-btn" 
              onClick={() => handleNavClick("why-us-section")}
              role="menuitem"
            >
              About
            </button>
          </li>
          <li role="none">
            <button 
              type="button" 
              className="nav-link-btn" 
              onClick={() => handleNavClick("footer-section")}
              role="menuitem"
            >
              Contact
            </button>
          </li>
        </ul>

        {/* Desktop Search Bar */}
        <form 
          className="navbar-search" 
          onSubmit={handleSearchSubmit} 
          role="search"
        >
          <FiSearchIcon className="search-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search fresh harvest, organics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search for products"
          />
          {searchQuery && (
            <button 
              type="button" 
              className="search-clear-btn" 
              onClick={() => setSearchQuery && setSearchQuery("")}
              aria-label="Clear search query"
            >
              <FiXIcon />
            </button>
          )}
        </form>

        {/* Right Actions: Wishlist, Account Dropdown, Cart, Mobile Toggle */}
        <div className="navbar-actions">
          {/* Mobile search toggle */}
          <button 
            type="button" 
            className="action-btn mobile-search-toggle"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Toggle search field"
          >
            <FiSearchIcon className="action-icon" />
          </button>

          {/* Wishlist Icon */}
          <button 
            type="button" 
            className="action-btn wishlist-btn"
            onClick={() => handleNavClick("products-section")}
            aria-label={`Wishlist items: ${wishlistCount}`}
            title="Wishlist"
          >
            <FiHeartIcon className="action-icon" />
            {wishlistCount > 0 && (
              <span className="badge wishlist-badge" aria-hidden="true">{wishlistCount}</span>
            )}
          </button>

          {/* User Account with Interactive Dropdown */}
          <div className="navbar-user-dropdown-wrapper" ref={userDropdownRef}>
            <button 
              type="button" 
              className={`action-btn user-btn ${userDropdownOpen ? "active" : ""} ${currentUser ? "is-logged-in" : ""}`}
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              aria-label={currentUser ? `Account menu for ${displayName}` : "User Account menu"}
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
              title={currentUser ? `Signed in as ${displayName}` : "Account"}
            >
              {currentUser ? (
                <div className="user-avatar-initial">
                  {displayInitial}
                </div>
              ) : (
                <FiUserIcon className="action-icon" />
              )}
              {currentUser && (
                <span className="badge user-badge-active" aria-label="Active user" title="Signed in">✓</span>
              )}
            </button>

            {/* Dropdown Menu Box */}
            {userDropdownOpen && (
              <div className="user-dropdown-menu" role="menu" aria-label="User Account Menu">
                {currentUser ? (
                  // Logged In Dropdown View
                  <>
                    <div className="dropdown-user-header">
                      <div className="dropdown-avatar">
                        <span>{displayInitial}</span>
                      </div>
                      <div className="dropdown-user-details">
                        <span className="dropdown-user-name">{displayName}</span>
                        <span className="dropdown-user-email">{currentUser.email}</span>
                        <span className="dropdown-user-badge">
                          <FiCheckCircleIcon className="badge-icon" /> Active Member
                        </span>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <div className="dropdown-menu-items">
                      <button 
                        type="button" 
                        className="dropdown-item profile-item" 
                        onClick={handleProfileClick}
                        role="menuitem"
                      >
                        <div className="dropdown-item-icon profile-icon">
                          <FiUserIcon />
                        </div>
                        <div className="dropdown-item-text">
                          <span className="item-title">Profile</span>
                          <span className="item-sub">View account details</span>
                        </div>
                      </button>

                      <button 
                        type="button" 
                        className="dropdown-item orders-item" 
                        onClick={handleOrdersClick}
                        role="menuitem"
                      >
                        <div className="dropdown-item-icon orders-icon">
                          <FiPackageIcon />
                        </div>
                        <div className="dropdown-item-text">
                          <span className="item-title">My Orders</span>
                          <span className="item-sub">Live tracking & past history</span>
                        </div>
                      </button>

                      <button 
                        type="button" 
                        className="dropdown-item admin-item" 
                        onClick={handleAdminClick}
                        role="menuitem"
                      >
                        <div className="dropdown-item-icon admin-icon">
                          <FiShieldIcon />
                        </div>
                        <div className="dropdown-item-text">
                          <span className="item-title">Store Admin</span>
                          <span className="item-sub">Manage & update orders</span>
                        </div>
                      </button>

                      <div className="dropdown-divider" />

                      <button 
                        type="button" 
                        className="dropdown-item logout-item" 
                        onClick={handleLogoutClick}
                        role="menuitem"
                      >
                        <div className="dropdown-item-icon logout-icon">
                          <FiLogOutIcon />
                        </div>
                        <div className="dropdown-item-text">
                          <span className="item-title">Logout</span>
                          <span className="item-sub">Sign out of your session</span>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  // Logged Out Dropdown View
                  <>
                    <div className="dropdown-guest-header">
                      <div className="guest-header-icon">
                        <RiLeafLine />
                      </div>
                      <div className="guest-header-text">
                        <span className="guest-title">Welcome to FreshRoot</span>
                        <span className="guest-sub">Sign in for fresh deals & fast delivery</span>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <div className="dropdown-menu-items">
                      <button 
                        type="button" 
                        className="dropdown-item login-item" 
                        onClick={handleLoginClick}
                        role="menuitem"
                      >
                        <div className="dropdown-item-icon login-icon">
                          <FiLogInIcon />
                        </div>
                        <div className="dropdown-item-text">
                          <span className="item-title">Login</span>
                          <span className="item-sub">Access your existing account</span>
                        </div>
                      </button>

                      <button 
                        type="button" 
                        className="dropdown-item register-item" 
                        onClick={handleRegisterClick}
                        role="menuitem"
                      >
                        <div className="dropdown-item-icon register-icon">
                          <FiUserPlusIcon />
                        </div>
                        <div className="dropdown-item-text">
                          <span className="item-title">Register</span>
                          <span className="item-sub">Create a new FreshRoot account</span>
                        </div>
                      </button>

                      <div className="dropdown-divider" />

                      <button 
                        type="button" 
                        className="dropdown-item orders-item" 
                        onClick={handleOrdersClick}
                        role="menuitem"
                      >
                        <div className="dropdown-item-icon orders-icon">
                          <FiPackageIcon />
                        </div>
                        <div className="dropdown-item-text">
                          <span className="item-title">Track Orders</span>
                          <span className="item-sub">Track harvest deliveries</span>
                        </div>
                      </button>

                      <button 
                        type="button" 
                        className="dropdown-item admin-item" 
                        onClick={handleAdminClick}
                        role="menuitem"
                      >
                        <div className="dropdown-item-icon admin-icon">
                          <FiShieldIcon />
                        </div>
                        <div className="dropdown-item-text">
                          <span className="item-title">Store Admin</span>
                          <span className="item-sub">Manage store orders</span>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Shopping Bag / Cart */}
          <button 
            type="button" 
            className="action-btn cart-btn"
            onClick={onOpenCart}
            aria-label={`Shopping Cart, ${cartCount} items`}
            title="Shopping Cart"
          >
            <div className="cart-icon-wrapper">
              <FiShoppingBagIcon className="action-icon" />
              {cartCount > 0 && (
                <span className="badge cart-badge" aria-hidden="true">{cartCount}</span>
              )}
            </div>
            <span className="cart-btn-label">Cart</span>
          </button>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button 
            type="button" 
            className="action-btn hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FiXIcon className="action-icon" /> : <FiMenuIcon className="action-icon" />}
          </button>
        </div>
      </nav>

      {/* Expandable Mobile Search Row */}
      {searchOpen && (
        <div className="mobile-search-row">
          <form className="navbar-search mobile-search-form" onSubmit={handleSearchSubmit}>
            <FiSearchIcon className="search-icon" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={() => setSearchQuery && setSearchQuery("")}
              >
                <FiXIcon />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="brand-name">
                FRESH<span className="brand-name-accent">ROOT</span>
              </div>
              <button 
                type="button" 
                className="close-drawer-btn" 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <FiXIcon />
              </button>
            </div>

            <ul className="mobile-menu-links">
              <li>
                <button type="button" onClick={() => handleNavClick("hero-section")}>
                  Home
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavClick("products-section")}>
                  Shop All Products
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavClick("categories-section")}>
                  Featured Categories
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavClick("deals-section")}>
                  Fresh Deals
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { setMobileMenuOpen(false); if (onOpenOrders) onOpenOrders(); }}>
                  Track My Orders
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavClick("why-us-section")}>
                  Why Shop With Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavClick("newsletter-section")}>
                  Newsletter & Offers
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavClick("footer-section")}>
                  Contact & Support
                </button>
              </li>
            </ul>

            <div className="mobile-menu-secondary-actions">
              <button 
                type="button" 
                className="mobile-drawer-btn"
                onClick={() => { setMobileMenuOpen(false); handleNavClick("products-section"); }}
              >
                <FiHeartIcon className="drawer-btn-icon" />
                <span>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
              </button>

              <button 
                type="button" 
                className="mobile-drawer-btn"
                onClick={() => { setMobileMenuOpen(false); if (onOpenOrders) onOpenOrders(); }}
              >
                <FiPackageIcon className="drawer-btn-icon" />
                <span>My Orders & Tracking</span>
              </button>

              <button 
                type="button" 
                className="mobile-drawer-btn"
                onClick={() => { setMobileMenuOpen(false); if (onOpenAdmin) onOpenAdmin(); }}
              >
                <FiShieldIcon className="drawer-btn-icon" />
                <span>Store Admin Portal</span>
              </button>

              {currentUser ? (
                <>
                  <button 
                    type="button" 
                    className="mobile-drawer-btn"
                    onClick={() => { setMobileMenuOpen(false); onOpenProfile && onOpenProfile(); }}
                  >
                    <FiUserIcon className="drawer-btn-icon" />
                    <span>My Profile ({displayName})</span>
                  </button>
                  <button 
                    type="button" 
                    className="mobile-drawer-btn mobile-drawer-logout-btn"
                    onClick={() => { setMobileMenuOpen(false); onLogout && onLogout(); }}
                  >
                    <FiLogOutIcon className="drawer-btn-icon" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="button" 
                    className="mobile-drawer-btn"
                    onClick={() => { setMobileMenuOpen(false); onOpenAccount && onOpenAccount("login"); }}
                  >
                    <FiLogInIcon className="drawer-btn-icon" />
                    <span>Login</span>
                  </button>
                  <button 
                    type="button" 
                    className="mobile-drawer-btn"
                    onClick={() => { setMobileMenuOpen(false); onOpenAccount && onOpenAccount("register"); }}
                  >
                    <FiUserPlusIcon className="drawer-btn-icon" />
                    <span>Register</span>
                  </button>
                </>
              )}
            </div>

            <div className="mobile-menu-footer">
              <p className="mobile-menu-note">Fresh organic groceries, delivered to your door.</p>
              <button 
                type="button" 
                className="mobile-cart-cta"
                onClick={() => { setMobileMenuOpen(false); onOpenCart(); }}
              >
                <FiShoppingBagIcon /> View Cart ({cartCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
