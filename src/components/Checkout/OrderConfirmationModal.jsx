import { useState, useEffect } from "react";
import { 
  FiCopy, 
  FiCheck, 
  FiTruck, 
  FiShoppingBag, 
  FiX, 
  FiMapPin, 
  FiClock, 
  FiCreditCard,
  FiArrowRight
} from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./OrderConfirmationModal.css";

const CONFETTI_VEGGIES = [
  { emoji: "🥑", top: "12%", left: "8%", delay: "0s", duration: "3.2s" },
  { emoji: "🥦", top: "18%", right: "10%", delay: "0.2s", duration: "3.6s" },
  { emoji: "🍎", top: "72%", left: "6%", delay: "0.4s", duration: "3.4s" },
  { emoji: "🥕", top: "76%", right: "8%", delay: "0.1s", duration: "3.8s" },
  { emoji: "🍇", top: "35%", left: "4%", delay: "0.5s", duration: "4.0s" },
  { emoji: "🥬", top: "42%", right: "5%", delay: "0.3s", duration: "3.5s" },
  { emoji: "🍓", top: "85%", left: "20%", delay: "0.6s", duration: "3.3s" },
  { emoji: "🍋", top: "82%", right: "22%", delay: "0.4s", duration: "3.7s" }
];

const OrderConfirmationModal = ({
  isOpen,
  onClose,
  order,
  onTrackOrder,
  onContinueShopping
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleCopyOrderId = () => {
    if (order?.orderId) {
      navigator.clipboard.writeText(order.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrackClick = () => {
    if (onTrackOrder) {
      onTrackOrder(order);
    } else if (onClose) {
      onClose();
    }
  };

  const handleContinueShoppingClick = () => {
    if (onContinueShopping) {
      onContinueShopping();
    } else if (onClose) {
      onClose();
    }
  };

  const isCod = order.paymentMethod === "COD";
  const isPaid = order.paymentStatus === "Paid";

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div 
      className="success-modal-overlay" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="success-modal-title"
    >
      {/* Floating Fresh Veggies & Confetti Elements */}
      <div className="confetti-container" aria-hidden="true">
        {CONFETTI_VEGGIES.map((item, idx) => (
          <span
            key={idx}
            className="floating-veggie"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              animationDelay: item.delay,
              animationDuration: item.duration
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      {/* Main Animated Success Card */}
      <div 
        className="success-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button" 
          className="success-modal-close-btn" 
          onClick={onClose}
          aria-label="Close success popup"
        >
          <FiX />
        </button>

        {/* Animated Celebration Banner */}
        <div className="success-header-section">
          {/* Top Brand Tag */}
          <div className="success-brand-pill">
            <RiLeafLine className="leaf-pill-icon" />
            <span>FRESHROOT ORGANICS</span>
          </div>

          {/* Animated Icons Container (Smiling Emoji + Drawing SVG Checkmark) */}
          <div className="success-animation-wrapper">
            <div className="smiling-emoji-badge" title="Thank you!">
              <span className="smiling-emoji">😊</span>
            </div>

            {/* SVG Circle Drawing Checkmark */}
            <div className="svg-checkmark-container">
              <svg className="checkmark-svg" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="23" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
          </div>

          {/* Primary Success Heading */}
          <h2 id="success-modal-title" className="success-title">
            Thank You for Shopping with FreshRoot!
          </h2>

          {/* Friendly Success Subtitle */}
          <p className="success-message">
            Your order has been placed successfully. Thank you for choosing FreshRoot for your fresh grocery needs! 🥑🥦🍎
          </p>
        </div>

        {/* Order Details & Summary Card */}
        <div className="success-details-box">
          <div className="details-meta-grid">
            {/* Order ID */}
            <div className="detail-meta-cell">
              <span className="meta-cell-label">Order ID</span>
              <div className="order-id-row">
                <strong className="order-id-code">{order.orderId}</strong>
                <button 
                  type="button" 
                  className="order-id-copy-btn" 
                  onClick={handleCopyOrderId}
                  title="Copy Order ID"
                >
                  {copied ? <FiCheck className="copied-check" /> : <FiCopy />}
                  <span className="copy-text">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Total Amount */}
            <div className="detail-meta-cell">
              <span className="meta-cell-label">Total Amount</span>
              <strong className="total-amount-val">₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
            </div>

            {/* Payment Method & Status */}
            <div className="detail-meta-cell">
              <span className="meta-cell-label">Payment Method</span>
              <span className="meta-cell-val">
                {order.paymentMethod === "COD" && "💵 Cash on Delivery"}
                {order.paymentMethod === "UPI" && "📱 UPI / QR Code"}
                {order.paymentMethod === "Card" && "💳 Credit / Debit Card"}
                {order.paymentMethod === "NetBanking" && "🏦 Net Banking"}
              </span>
            </div>

            {/* Order Status / Payment Confirmation */}
            <div className="detail-meta-cell">
              <span className="meta-cell-label">Status</span>
              <span className={`status-highlight-pill ${isPaid ? "pill-paid" : "pill-cod"}`}>
                {isCod 
                  ? "Order Confirmed — Payment Pending" 
                  : isPaid 
                  ? "✓ Payment Verified & Paid" 
                  : "Order Confirmed"}
              </span>
            </div>
          </div>

          {/* Delivery Snapshot Row */}
          <div className="delivery-snapshot-row">
            <div className="snapshot-item">
              <FiClock className="snapshot-icon text-green" />
              <div>
                <span className="snapshot-label">Estimated Delivery</span>
                <span className="snapshot-val">{order.estimatedDelivery || "Within 30-45 minutes"}</span>
              </div>
            </div>

            <div className="snapshot-divider" />

            <div className="snapshot-item">
              <FiMapPin className="snapshot-icon text-terracotta" />
              <div>
                <span className="snapshot-label">Delivery Location</span>
                <span className="snapshot-val">
                  {order.customerDetails?.street || "Home Delivery"}, {order.customerDetails?.city || "Express Zone"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Primary Action Buttons */}
        <div className="success-modal-actions">
          {/* 1. Track My Order */}
          <button 
            type="button" 
            className="action-btn-track"
            onClick={handleTrackClick}
          >
            <FiTruck className="btn-icon" />
            <span>Track My Order</span>
            <FiArrowRight className="btn-arrow" />
          </button>

          {/* 2. Continue Shopping */}
          <button 
            type="button" 
            className="action-btn-continue"
            onClick={handleContinueShoppingClick}
          >
            <FiShoppingBag className="btn-icon" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
