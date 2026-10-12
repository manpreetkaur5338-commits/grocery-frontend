import { useState, useEffect } from "react";
import { 
  FiX, 
  FiShield, 
  FiSearch, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiTruck, 
  FiPackage, 
  FiShoppingBag, 
  FiDollarSign,
  FiUser,
  FiEdit2,
  FiFilter
} from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./AdminOrdersModal.css";

const ALL_STATUSES = [
  "Order Placed",
  "Confirmed",
  "Processing",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

const AdminOrdersModal = ({ isOpen, onClose, onOrderStatusUpdated }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Edit Form state
  const [editStatus, setEditStatus] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const fetchAdminOrders = async () => {
    setLoading(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      let url = "http://localhost:3000/api/orders/admin/all";
      const params = [];
      if (statusFilter !== "All") params.push(`status=${encodeURIComponent(statusFilter)}`);
      if (searchQuery.trim()) params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.orders?.length > 0 && !selectedOrder) {
          setSelectedOrder(data.orders[0]);
          setEditStatus(data.orders[0].orderStatus);
          setEditPaymentStatus(data.orders[0].paymentStatus);
        }
      } else {
        // Fallback to localStorage
        const local = JSON.parse(localStorage.getItem("freshroot_orders") || "[]");
        setOrders(local);
        if (local.length > 0 && !selectedOrder) {
          setSelectedOrder(local[0]);
          setEditStatus(local[0].orderStatus);
          setEditPaymentStatus(local[0].paymentStatus);
        }
      }
    } catch (err) {
      console.warn("Using local orders fallback:", err);
      const local = JSON.parse(localStorage.getItem("freshroot_orders") || "[]");
      setOrders(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminOrders();
    }
  }, [isOpen, statusFilter]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setEditStatus(order.orderStatus);
    setEditPaymentStatus(order.paymentStatus);
    setCustomNote("");
    setAlert({ show: false, type: "", message: "" });
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSaving(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      const response = await fetch(`http://localhost:3000/api/orders/admin/${selectedOrder.orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: editStatus,
          paymentStatus: editPaymentStatus,
          note: customNote.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status.");
      }

      // Update in state
      setOrders((prev) =>
        prev.map((ord) => (ord.orderId === selectedOrder.orderId ? data.order : ord))
      );
      setSelectedOrder(data.order);

      // Sync with localStorage
      const local = JSON.parse(localStorage.getItem("freshroot_orders") || "[]");
      const updatedLocal = local.map((ord) =>
        ord.orderId === selectedOrder.orderId ? data.order : ord
      );
      localStorage.setItem("freshroot_orders", JSON.stringify(updatedLocal));

      setAlert({
        show: true,
        type: "success",
        message: `Order #${selectedOrder.orderId} updated to "${editStatus}" successfully!`
      });

      setCustomNote("");

      if (onOrderStatusUpdated) {
        onOrderStatusUpdated(data.order);
      }

    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err.message || "Error saving status."
      });
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const inProgressCount = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.orderStatus)).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "Delivered").length;

  if (!isOpen) return null;

  return (
    <div className="admin-orders-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <div className="admin-orders-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" className="admin-close-btn" onClick={onClose} aria-label="Close Admin Dashboard">
          <FiX />
        </button>

        {/* Header */}
        <div className="admin-header">
          <div className="admin-brand-tag">
            <FiShield className="shield-icon" /> FRESHROOT STORE ADMIN & LOGISTICS
          </div>
          <div className="admin-header-row">
            <div>
              <h2 id="admin-modal-title" className="admin-title">Store Order Management</h2>
              <p className="admin-subtitle">
                Manage live grocery orders, advance delivery pipelines, verify payments, and log dispatch notes.
              </p>
            </div>
            <button type="button" className="admin-refresh-btn" onClick={fetchAdminOrders} disabled={loading}>
              <FiRefreshCw className={`refresh-icon ${loading ? "spinning" : ""}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="admin-metrics-grid">
            <div className="metric-pill">
              <span className="metric-label">Total Orders</span>
              <strong className="metric-val">{orders.length}</strong>
            </div>
            <div className="metric-pill">
              <span className="metric-label">Active Dispatches</span>
              <strong className="metric-val text-amber">{inProgressCount}</strong>
            </div>
            <div className="metric-pill">
              <span className="metric-label">Delivered Harvests</span>
              <strong className="metric-val text-green">{deliveredCount}</strong>
            </div>
            <div className="metric-pill">
              <span className="metric-label">Gross Store Volume</span>
              <strong className="metric-val text-gold">${totalRevenue.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="admin-controls-bar">
          <div className="admin-filter-group">
            <FiFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-status-select"
            >
              <option value="All">All Statuses ({orders.length})</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="admin-search-box">
            <FiSearch className="search-icon" />
            <input
              type="search"
              placeholder="Search by ID, name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchAdminOrders()}
            />
          </div>
        </div>

        {/* Alert Banner */}
        {alert.show && (
          <div className={`admin-alert ${alert.type}`}>
            {alert.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{alert.message}</span>
            <button type="button" onClick={() => setAlert({ show: false, type: "", message: "" })}>
              <FiX />
            </button>
          </div>
        )}

        {/* Main Body Split */}
        <div className="admin-body-layout">
          {/* Left: Orders Table/List */}
          <div className="admin-orders-list-col">
            <ul className="admin-orders-list">
              {orders.map((ord) => {
                const isSelected = selectedOrder?.orderId === ord.orderId;
                return (
                  <li
                    key={ord.orderId}
                    className={`admin-order-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectOrder(ord)}
                  >
                    <div className="item-top-row">
                      <strong className="admin-ord-id">{ord.orderId}</strong>
                      <span className={`admin-status-tag ${ord.orderStatus.toLowerCase().replace(/\s+/g, "-")}`}>
                        {ord.orderStatus}
                      </span>
                    </div>

                    <div className="item-cust-row">
                      <span>{ord.customerDetails?.fullName || ord.userName}</span>
                      <span className="cust-phone">{ord.customerDetails?.phone}</span>
                    </div>

                    <div className="item-bottom-row">
                      <span className="item-method">{ord.paymentMethod}</span>
                      <span className={`payment-mini-tag ${ord.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                        {ord.paymentStatus}
                      </span>
                      <span className="item-total">${Number(ord.totalAmount).toFixed(2)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right: Order Status Management Panel */}
          <div className="admin-management-col">
            {selectedOrder ? (
              <form className="admin-edit-form" onSubmit={handleSaveStatus}>
                <div className="edit-form-header">
                  <div>
                    <h3 className="edit-form-title">Manage Order #{selectedOrder.orderId}</h3>
                    <span className="edit-form-sub">
                      Customer: {selectedOrder.customerDetails?.fullName} ({selectedOrder.userEmail})
                    </span>
                  </div>
                </div>

                <div className="edit-fields-grid">
                  {/* Order Status Selector */}
                  <div className="edit-field">
                    <label htmlFor="admin-order-status">Update Order Pipeline Status</label>
                    <select
                      id="admin-order-status"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="admin-field-select"
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Status Selector */}
                  <div className="edit-field">
                    <label htmlFor="admin-payment-status">Update Payment Status</label>
                    <select
                      id="admin-payment-status"
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value)}
                      className="admin-field-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid (Verified / Collected)</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Dispatch/Tracking Note */}
                <div className="edit-field">
                  <label htmlFor="admin-custom-note">Add Tracking Note / Dispatch Update</label>
                  <input
                    id="admin-custom-note"
                    type="text"
                    placeholder="e.g. Assigned to delivery partner Dave, in transit via Bike #4"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="admin-field-input"
                  />
                </div>

                {/* Quick Advance Buttons */}
                <div className="quick-advance-row">
                  <span className="quick-label">1-Click Fast Advance:</span>
                  <button
                    type="button"
                    className="quick-status-btn"
                    onClick={() => setEditStatus("Processing")}
                  >
                    📦 Processing
                  </button>
                  <button
                    type="button"
                    className="quick-status-btn"
                    onClick={() => setEditStatus("Out for Delivery")}
                  >
                    🚚 Out for Delivery
                  </button>
                  <button
                    type="button"
                    className="quick-status-btn quick-delivered"
                    onClick={() => {
                      setEditStatus("Delivered");
                      setEditPaymentStatus("Paid");
                    }}
                  >
                    🏡 Delivered & Paid
                  </button>
                </div>

                {/* Save Button */}
                <div className="edit-actions-row">
                  <button type="submit" className="admin-save-btn" disabled={saving}>
                    {saving ? "Updating Status..." : "Save & Broadcast Order Update"}
                  </button>
                </div>

                {/* Order Summary Reference */}
                <div className="admin-order-summary-ref">
                  <h4 className="ref-title">Order Items & Delivery Details</h4>
                  <ul className="ref-items-list">
                    {selectedOrder.items?.map((item, idx) => (
                      <li key={idx} className="ref-item">
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="ref-address-box">
                    <strong>Delivery Address:</strong> {selectedOrder.customerDetails?.street}, {selectedOrder.customerDetails?.city} - {selectedOrder.customerDetails?.pincode}
                  </div>
                </div>
              </form>
            ) : (
              <div className="admin-no-selection">
                <FiPackage className="icon-empty" />
                <p>Select an order from the list on the left to edit its status.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersModal;
