import { useState, useEffect } from "react";
import { 
  FiX, 
  FiShoppingBag, 
  FiPackage, 
  FiCheckCircle, 
  FiClock, 
  FiTruck, 
  FiHome, 
  FiAlertCircle, 
  FiSearch, 
  FiRefreshCw, 
  FiChevronDown, 
  FiChevronUp, 
  FiMapPin, 
  FiCreditCard, 
  FiDollarSign, 
  FiSmartphone, 
  FiGlobe,
  FiSlash
} from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./MyOrdersModal.css";

// The 5 standard positive milestones in order tracking
const TRACKING_STEPS = [
  { id: "Order Placed", label: "Order Placed", icon: FiShoppingBag, desc: "Order received by store" },
  { id: "Confirmed", label: "Confirmed", icon: FiCheckCircle, desc: "Payment & stock confirmed" },
  { id: "Processing", label: "Processing", icon: FiPackage, desc: "Farm-fresh packing underway" },
  { id: "Out for Delivery", label: "Out for Delivery", icon: FiTruck, desc: "Courier partner on the way" },
  { id: "Delivered", label: "Delivered", icon: FiHome, desc: "Freshly delivered at doorstep" }
];

const getStepIndex = (status) => {
  switch (status) {
    case "Order Placed": return 0;
    case "Confirmed": return 1;
    case "Processing": return 2;
    case "Out for Delivery": return 3;
    case "Delivered": return 4;
    default: return -1;
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Order Placed": return "badge-placed";
    case "Confirmed": return "badge-confirmed";
    case "Processing": return "badge-processing";
    case "Out for Delivery": return "badge-out";
    case "Delivered": return "badge-delivered";
    case "Cancelled": return "badge-cancelled";
    default: return "badge-default";
  }
};

const MyOrdersModal = ({
  isOpen,
  onClose,
  currentUser = null,
  initialOrderId = null,
  onStartShopping
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
  const [activeTab, setActiveTab] = useState("All"); // "All", "Active", "Delivered", "Cancelled"
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("Change of mind / Need to modify items");
  const [cancelling, setCancelling] = useState(false);
  const [actionAlert, setActionAlert] = useState({ show: false, type: "", message: "" });

  // Fetch orders from backend and sync with localStorage
  const fetchOrders = async () => {
    setLoading(true);
    setActionAlert({ show: false, type: "", message: "" });

    try {
      let fetchedOrders = [];
      const userEmail = currentUser?.email;

      if (userEmail) {
        const response = await fetch(`https://grocery-backend-1-hf2l.onrender.com/api/orders/user/${encodeURIComponent(userEmail)}`);
        if (response.ok) {
          const data = await response.json();
          fetchedOrders = data.orders || [];
        }
      }

      // Merge with localStorage orders
      const localOrders = JSON.parse(localStorage.getItem("freshroot_orders") || "[]");
      const combinedMap = new Map();

      // Put fetched orders first
      fetchedOrders.forEach((o) => combinedMap.set(o.orderId, o));
      // Add local orders if not already present
      localOrders.forEach((o) => {
        if (!combinedMap.has(o.orderId)) {
          if (!userEmail || o.userEmail === userEmail || o.customerDetails?.email === userEmail) {
            combinedMap.set(o.orderId, o);
          }
        }
      });

      const finalOrders = Array.from(combinedMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setOrders(finalOrders);

      // Select initial order if provided or default to the most recent active order
      if (initialOrderId) {
        setSelectedOrderId(initialOrderId);
      } else if (finalOrders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(finalOrders[0].orderId);
      }

    } catch (err) {
      console.warn("Could not fetch remote orders, using local fallback:", err);
      const localOrders = JSON.parse(localStorage.getItem("freshroot_orders") || "[]");
      setOrders(localOrders);
      if (localOrders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(localOrders[0].orderId);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
      if (initialOrderId) {
        setSelectedOrderId(initialOrderId);
      }
    }
  }, [isOpen, currentUser, initialOrderId]);

  // Handle Cancel Order
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setCancelling(true);

    try {
      const response = await fetch(`https://grocery-backend-1-hf2l.onrender.com/api/orders/${orderToCancel.orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel order.");
      }

      // Update local state
      setOrders((prev) =>
        prev.map((ord) => (ord.orderId === orderToCancel.orderId ? data.order : ord))
      );

      // Update localStorage
      const localOrders = JSON.parse(localStorage.getItem("freshroot_orders") || "[]");
      const updatedLocal = localOrders.map((ord) =>
        ord.orderId === orderToCancel.orderId ? data.order : ord
      );
      localStorage.setItem("freshroot_orders", JSON.stringify(updatedLocal));

      setActionAlert({
        show: true,
        type: "success",
        message: `Order #${orderToCancel.orderId} was cancelled successfully.`
      });

      setCancelModalOpen(false);
      setOrderToCancel(null);

    } catch (err) {
      setActionAlert({
        show: true,
        type: "error",
        message: err.message || "Unable to cancel order."
      });
    } finally {
      setCancelling(false);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (activeTab === "Active") {
      if (["Delivered", "Cancelled"].includes(order.orderStatus)) return false;
    } else if (activeTab === "Delivered") {
      if (order.orderStatus !== "Delivered") return false;
    } else if (activeTab === "Cancelled") {
      if (order.orderStatus !== "Cancelled") return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = order.orderId?.toLowerCase().includes(q);
      const matchItems = order.items?.some((i) => i.name.toLowerCase().includes(q));
      return matchId || matchItems;
    }

    return true;
  });

  const selectedOrder = orders.find((o) => o.orderId === selectedOrderId) || orders[0] || null;

  if (!isOpen) return null;

  return (
    <div className="orders-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="my-orders-title">
      <div className="orders-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button 
          type="button" 
          className="orders-close-btn" 
          onClick={onClose}
          aria-label="Close My Orders"
        >
          <FiX />
        </button>

        {/* Header */}
        <div className="orders-header">
          <div className="orders-brand-tag">
            <RiLeafLine className="leaf-icon" /> FRESHROOT ORDER TRACKING
          </div>
          <div className="orders-header-row">
            <div>
              <h2 id="my-orders-title" className="orders-title">My Orders & Live Tracking</h2>
              <p className="orders-subtitle">
                Track your farm-to-table delivery in real time, view receipt details, and manage past orders.
              </p>
            </div>
            <button 
              type="button" 
              className="refresh-orders-btn" 
              onClick={fetchOrders}
              disabled={loading}
              title="Refresh tracking status"
            >
              <FiRefreshCw className={`refresh-icon ${loading ? "spinning" : ""}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Search & Tabs */}
          <div className="orders-controls-bar">
            <div className="orders-tabs">
              {["All", "Active", "Delivered", "Cancelled"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`orders-tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span>{tab}</span>
                  <span className="tab-count">
                    {tab === "All" && orders.length}
                    {tab === "Active" && orders.filter((o) => !["Delivered", "Cancelled"].includes(o.orderStatus)).length}
                    {tab === "Delivered" && orders.filter((o) => o.orderStatus === "Delivered").length}
                    {tab === "Cancelled" && orders.filter((o) => o.orderStatus === "Cancelled").length}
                  </span>
                </button>
              ))}
            </div>

            <div className="orders-search-box">
              <FiSearch className="search-icon" />
              <input
                type="search"
                placeholder="Search by Order ID or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionAlert.show && (
          <div className={`orders-alert-banner ${actionAlert.type}`}>
            {actionAlert.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{actionAlert.message}</span>
            <button type="button" onClick={() => setActionAlert({ show: false, type: "", message: "" })}>
              <FiX />
            </button>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="orders-content-layout">
          {/* Left Column: Orders List */}
          <aside className="orders-sidebar" aria-label="Orders list">
            {loading && orders.length === 0 ? (
              <div className="orders-loading-view">
                <FiRefreshCw className="loading-spinner" />
                <span>Loading your harvest orders...</span>
              </div>
            ) : filteredOrders.length > 0 ? (
              <ul className="orders-sidebar-list">
                {filteredOrders.map((ord) => {
                  const isSelected = ord.orderId === selectedOrderId;
                  const dateStr = new Date(ord.createdAt || Date.now()).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                  });

                  return (
                    <li 
                      key={ord.orderId} 
                      className={`order-card-compact ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedOrderId(ord.orderId)}
                    >
                      <div className="order-compact-top">
                        <span className="order-compact-id">{ord.orderId}</span>
                        <span className={`status-badge ${getStatusBadgeClass(ord.orderStatus)}`}>
                          {ord.orderStatus}
                        </span>
                      </div>

                      <div className="order-compact-items">
                        <span className="items-summary-text">
                          {ord.items?.map((i) => i.name).join(", ") || "Fresh Groceries"}
                        </span>
                      </div>

                      <div className="order-compact-footer">
                        <span className="compact-date">{dateStr}</span>
                        <span className="compact-amount">${Number(ord.totalAmount).toFixed(2)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="orders-empty-state">
                <FiShoppingBag className="empty-icon" />
                <h4>No orders found</h4>
                <p>You have no {activeTab !== "All" ? activeTab.toLowerCase() : ""} orders yet.</p>
                <button
                  type="button"
                  className="btn-start-shopping"
                  onClick={() => {
                    onClose();
                    if (onStartShopping) onStartShopping();
                  }}
                >
                  Browse Harvest Catalog
                </button>
              </div>
            )}
          </aside>

          {/* Right Column: Detailed Live Tracking & Order View */}
          <section className="order-detail-pane" aria-label="Order tracking and details">
            {selectedOrder ? (
              <div className="order-detail-view">
                {/* Detail Header */}
                <div className="detail-header-card">
                  <div className="detail-header-left">
                    <div className="detail-id-row">
                      <h3 className="detail-order-id">{selectedOrder.orderId}</h3>
                      <span className={`status-badge-lg ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus}
                      </span>
                    </div>
                    <span className="detail-order-date">
                      Placed on {new Date(selectedOrder.createdAt || Date.now()).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  {/* Cancel Button if eligible */}
                  {!["Delivered", "Cancelled"].includes(selectedOrder.orderStatus) && (
                    <button
                      type="button"
                      className="cancel-order-btn"
                      onClick={() => {
                        setOrderToCancel(selectedOrder);
                        setCancelModalOpen(true);
                      }}
                    >
                      <FiSlash className="cancel-icon" />
                      <span>Cancel Order</span>
                    </button>
                  )}
                </div>

                {/* ====================================================
                    VISUAL ORDER TRACKING PROGRESS BAR
                   ==================================================== */}
                <div className="tracking-visualizer-card">
                  <div className="visualizer-header">
                    <div className="eta-block">
                      <FiTruck className="truck-icon" />
                      <div>
                        <span className="eta-title">
                          {selectedOrder.orderStatus === "Delivered"
                            ? "Delivered Successfully"
                            : selectedOrder.orderStatus === "Cancelled"
                            ? "Order Cancelled"
                            : "Estimated Arrival"}
                        </span>
                        <strong className="eta-timer">
                          {selectedOrder.orderStatus === "Delivered"
                            ? "Enjoy your fresh harvest!"
                            : selectedOrder.orderStatus === "Cancelled"
                            ? "This order was cancelled."
                            : selectedOrder.estimatedDelivery || "Within 30-45 minutes"}
                        </strong>
                      </div>
                    </div>
                    <span className="live-pulse-badge">
                      <span className="pulse-dot" /> LIVE TRACKING
                    </span>
                  </div>

                  {selectedOrder.orderStatus === "Cancelled" ? (
                    <div className="cancelled-state-banner">
                      <FiAlertCircle className="cancel-banner-icon" />
                      <div>
                        <strong>Order #{selectedOrder.orderId} has been cancelled</strong>
                        <p>
                          {selectedOrder.statusHistory?.find((h) => h.status === "Cancelled")?.note ||
                            "Payment refunded (if collected). No items will be dispatched."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="tracking-progress-wrapper">
                      {/* Step Connectors & Progress Fill */}
                      {(() => {
                        const currentIdx = getStepIndex(selectedOrder.orderStatus);
                        const progressPercent = currentIdx >= 0 ? (currentIdx / (TRACKING_STEPS.length - 1)) * 100 : 0;

                        return (
                          <>
                            <div className="track-bar-background">
                              <div
                                className="track-bar-fill"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>

                            <div className="tracking-steps-grid">
                              {TRACKING_STEPS.map((step, idx) => {
                                const isCompleted = idx <= currentIdx;
                                const isCurrent = idx === currentIdx;
                                const StepIcon = step.icon;

                                return (
                                  <div
                                    key={step.id}
                                    className={`tracking-step-item ${isCompleted ? "completed" : ""} ${
                                      isCurrent ? "current" : ""
                                    }`}
                                  >
                                    <div className="step-icon-bubble">
                                      <StepIcon />
                                    </div>
                                    <span className="step-item-title">{step.label}</span>
                                    <span className="step-item-desc">{step.desc}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Status Timeline History */}
                  {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                    <div className="status-timeline-section">
                      <h4 className="timeline-title">Activity Timeline</h4>
                      <ul className="timeline-list">
                        {selectedOrder.statusHistory.map((hist, idx) => (
                          <li key={idx} className="timeline-item">
                            <span className="timeline-bullet" />
                            <div className="timeline-info">
                              <span className="timeline-step-name">{hist.status}</span>
                              <p className="timeline-note">{hist.note}</p>
                            </div>
                            <span className="timeline-time">
                              {new Date(hist.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Items & Address Split Grid */}
                <div className="detail-split-grid">
                  {/* Ordered Items Table */}
                  <div className="detail-items-card">
                    <h4 className="card-section-title">
                      <FiShoppingBag className="sec-icon" />
                      <span>Items in Harvest Basket ({selectedOrder.items?.length || 0})</span>
                    </h4>

                    <ul className="detail-items-list">
                      {selectedOrder.items?.map((item, idx) => (
                        <li key={idx} className="detail-item-row">
                          <img src={item.image} alt={item.name} className="item-thumb" />
                          <div className="item-main">
                            <span className="item-name">{item.name}</span>
                            <span className="item-unit">
                              ${Number(item.price).toFixed(2)} / {item.unit || "pack"}
                            </span>
                          </div>
                          <span className="item-qty">Qty: {item.quantity}</span>
                          <span className="item-total">
                            ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Financial Breakdown */}
                    <div className="detail-cost-breakdown">
                      <div className="cost-line">
                        <span>Subtotal</span>
                        <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="cost-line">
                        <span>Delivery Fee</span>
                        <span>{selectedOrder.shippingFee === 0 ? "FREE" : `$${Number(selectedOrder.shippingFee).toFixed(2)}`}</span>
                      </div>
                      <div className="cost-line total-line">
                        <span>Total Paid / Due</span>
                        <span className="grand-total">${Number(selectedOrder.totalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address & Payment Info Card */}
                  <div className="detail-info-card">
                    {/* Delivery Address */}
                    <div className="info-sub-block">
                      <h4 className="card-section-title">
                        <FiMapPin className="sec-icon" />
                        <span>Delivery Address</span>
                      </h4>
                      <div className="address-content">
                        <strong>{selectedOrder.customerDetails?.fullName}</strong>
                        <p>{selectedOrder.customerDetails?.street}</p>
                        <p>{selectedOrder.customerDetails?.city}, {selectedOrder.customerDetails?.state} - {selectedOrder.customerDetails?.pincode}</p>
                        <p className="phone-line">Phone: {selectedOrder.customerDetails?.phone}</p>
                        {selectedOrder.customerDetails?.deliveryNotes && (
                          <p className="note-text"><em>Instructions: {selectedOrder.customerDetails.deliveryNotes}</em></p>
                        )}
                      </div>
                    </div>

                    <div className="card-sub-divider" />

                    {/* Payment Info */}
                    <div className="info-sub-block">
                      <h4 className="card-section-title">
                        <FiCreditCard className="sec-icon" />
                        <span>Payment Details</span>
                      </h4>
                      <div className="payment-info-content">
                        <div className="info-row">
                          <span className="info-k">Method</span>
                          <span className="info-v">
                            {selectedOrder.paymentMethod === "COD" && "💵 Cash on Delivery"}
                            {selectedOrder.paymentMethod === "UPI" && "📱 UPI Instant"}
                            {selectedOrder.paymentMethod === "Card" && "💳 Credit/Debit Card"}
                            {selectedOrder.paymentMethod === "NetBanking" && "🏦 Net Banking"}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="info-k">Payment Status</span>
                          <span className={`payment-pill ${selectedOrder.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                            {selectedOrder.paymentStatus === "Paid" ? "✓ Paid" : "⏳ Pending"}
                          </span>
                        </div>
                        {selectedOrder.paymentDetails?.transactionId && (
                          <div className="info-row">
                            <span className="info-k">Transaction ID</span>
                            <span className="info-v mono">{selectedOrder.paymentDetails.transactionId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-order-selected-view">
                <FiPackage className="placeholder-icon" />
                <p>Select an order from the list to view live tracking details.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {cancelModalOpen && orderToCancel && (
        <div className="cancel-confirm-overlay" onClick={() => setCancelModalOpen(false)}>
          <div className="cancel-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-header">
              <FiAlertCircle className="warning-icon" />
              <h3>Cancel Order #{orderToCancel.orderId}?</h3>
            </div>
            <p className="cancel-message">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>

            <div className="cancel-reason-field">
              <label htmlFor="cancel-reason-select">Reason for cancellation:</label>
              <select
                id="cancel-reason-select"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="Change of mind / Need to modify items">Change of mind / Need to modify items</option>
                <option value="Placed duplicate order by mistake">Placed duplicate order by mistake</option>
                <option value="Incorrect delivery address entered">Incorrect delivery address entered</option>
                <option value="Expected delivery time is unsuitable">Expected delivery time is unsuitable</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="cancel-actions-row">
              <button
                type="button"
                className="btn-cancel-abort"
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelling}
              >
                Keep My Order
              </button>
              <button
                type="button"
                className="btn-cancel-proceed"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersModal;
