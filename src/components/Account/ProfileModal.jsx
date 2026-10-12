import React from "react";
import { 
  FiUser, 
  FiMail, 
  FiShield, 
  FiShoppingBag, 
  FiHeart, 
  FiLogOut, 
  FiX, 
  FiCheckCircle, 
  FiCalendar 
} from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./ProfileModal.css";

const ProfileModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  onLogout,
  cartCount = 0,
  wishlistCount = 0,
  onNavigate
}) => {
  if (!isOpen || !currentUser) return null;

  const displayName = currentUser.name || currentUser.fullName || "Fresh Member";
  const userInitial = displayName.charAt(0).toUpperCase();
  const userEmail = currentUser.email || "customer@freshroot.com";

  const handleLogoutClick = () => {
    if (onClose) onClose();
    if (onLogout) onLogout();
  };

  const handleShopClick = () => {
    if (onClose) onClose();
    if (onNavigate) onNavigate("products-section");
  };

  return (
    <div 
      className="profile-modal-overlay" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="profile-title"
    >
      <div 
        className="profile-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button" 
          className="profile-close-btn" 
          onClick={onClose}
          aria-label="Close Profile"
        >
          <FiX />
        </button>

        {/* Profile Card Header */}
        <div className="profile-card-header">
          <div className="profile-avatar-wrapper">
            <span className="profile-avatar-text">{userInitial}</span>
            <span className="profile-avatar-leaf" title="Fresh Member">
              <RiLeafLine />
            </span>
          </div>

          <div className="profile-header-info">
            <div className="profile-badge-row">
              <span className="profile-status-badge">
                <FiCheckCircle className="badge-icon" /> Active Member
              </span>
              <span className="profile-tier-badge">FreshPass</span>
            </div>
            <h2 id="profile-title" className="profile-user-name">{displayName}</h2>
            <p className="profile-user-email">
              <FiMail className="email-icon" /> {userEmail}
            </p>
          </div>
        </div>

        {/* Profile Body & Stats */}
        <div className="profile-card-body">
          <div className="profile-stats-grid">
            <div className="profile-stat-box" onClick={handleShopClick} role="button" tabIndex={0}>
              <div className="stat-icon-wrap cart-accent">
                <FiShoppingBag />
              </div>
              <div className="stat-content">
                <span className="stat-number">{cartCount}</span>
                <span className="stat-label">Items in Cart</span>
              </div>
            </div>

            <div className="profile-stat-box" onClick={handleShopClick} role="button" tabIndex={0}>
              <div className="stat-icon-wrap wishlist-accent">
                <FiHeart />
              </div>
              <div className="stat-content">
                <span className="stat-number">{wishlistCount}</span>
                <span className="stat-label">Saved Items</span>
              </div>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="profile-details-section">
            <h3 className="section-subtitle">Account Details</h3>
            <div className="details-list">
              <div className="detail-item">
                <span className="detail-label">Membership Tier</span>
                <span className="detail-val tier-highlight">Organic Harvest Club</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Standard Delivery</span>
                <span className="detail-val">Fast 30-min Express</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Security</span>
                <span className="detail-val security-val">
                  <FiShield className="shield-icon" /> Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Actions Footer */}
        <div className="profile-card-footer">
          <button 
            type="button" 
            className="profile-logout-btn"
            onClick={handleLogoutClick}
          >
            <FiLogOut className="btn-icon" />
            <span>Sign Out</span>
          </button>
          <button 
            type="button" 
            className="profile-shop-btn"
            onClick={handleShopClick}
          >
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
