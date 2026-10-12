import { useState, useEffect } from "react";
import { 
  FiX, 
  FiTruck, 
  FiShield, 
  FiCreditCard, 
  FiSmartphone, 
  FiDollarSign, 
  FiGlobe, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiLoader, 
  FiArrowRight, 
  FiArrowLeft,
  FiMapPin,
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiInfo
} from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./CheckoutModal.css";

const POPULAR_BANKS = [
  { id: "HDFC", name: "HDFC Bank" },
  { id: "ICICI", name: "ICICI Bank" },
  { id: "SBI", name: "State Bank of India" },
  { id: "AXIS", name: "Axis Bank" },
  { id: "KOTAK", name: "Kotak Mahindra Bank" },
  { id: "PNB", name: "Punjab National Bank" }
];

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", icon: "🟢" },
  { id: "phonepe", name: "PhonePe", icon: "🟣" },
  { id: "paytm", name: "Paytm UPI", icon: "🔵" },
  { id: "bhim", name: "BHIM UPI", icon: "🟠" }
];

const CheckoutModal = ({
  isOpen,
  onClose,
  cartItems = [],
  currentUser = null,
  onOrderPlaced,
  onRequireAuth
}) => {
  // Step State: 1 = Shipping & Address, 2 = Payment Selection & Review
  const [step, setStep] = useState(1);

  // Address & Contact form
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "NY",
    pincode: "",
    deliveryNotes: ""
  });

  // Payment method: "COD", "UPI", "Card", "NetBanking"
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Online Payment Specific Fields
  const [upiMethod, setUpiMethod] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  
  const [cardDetails, setCardDetails] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });

  const [selectedBank, setSelectedBank] = useState("HDFC");

  // UI & Loading states
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [gatewayMessage, setGatewayMessage] = useState("");
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  // Sync with currentUser info when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAlert({ show: false, type: "", message: "" });
      setErrors({});
      setGatewayMessage("");
      
      if (currentUser) {
        setShippingForm((prev) => ({
          ...prev,
          fullName: prev.fullName || currentUser.name || currentUser.fullName || "",
          email: prev.email || currentUser.email || ""
        }));
      }
    }
  }, [isOpen, currentUser]);

  // Order Totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 50.0;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 4.99;
  const discount = 0.0;
  const totalAmount = subtotal + shippingFee - discount;

  // Form Validation
  const validateAddress = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\s-]{7,15}$/;

    if (!shippingForm.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!shippingForm.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(shippingForm.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!shippingForm.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(shippingForm.phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!shippingForm.street.trim()) newErrors.street = "Delivery street address is required";
    if (!shippingForm.city.trim()) newErrors.city = "City is required";
    if (!shippingForm.pincode.trim()) newErrors.pincode = "Pincode / ZIP is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors = {};

    if (paymentMethod === "UPI") {
      if (upiMethod === "custom" && (!upiId.trim() || !upiId.includes("@"))) {
        newErrors.upiId = "Please enter a valid UPI ID (e.g., username@okhdfcbank)";
      }
    } else if (paymentMethod === "Card") {
      if (!cardDetails.cardholderName.trim()) {
        newErrors.cardholderName = "Cardholder name is required";
      }
      const rawCard = cardDetails.cardNumber.replace(/\s+/g, "");
      if (!rawCard || rawCard.length < 15 || rawCard.length > 16) {
        newErrors.cardNumber = "Enter a valid 15 or 16 digit card number";
      }
      if (!cardDetails.expiryDate || !cardDetails.expiryDate.includes("/")) {
        newErrors.expiryDate = "Valid MM/YY required";
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        newErrors.cvv = "3-digit CVV required";
      }
    } else if (paymentMethod === "NetBanking") {
      if (!selectedBank) {
        newErrors.selectedBank = "Please select a bank";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateAddress()) {
      setStep(2);
      setAlert({ show: false, type: "", message: "" });
    }
  };

  // Process Place Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validatePayment()) return;

    setLoading(true);
    setAlert({ show: false, type: "", message: "" });
    setGatewayMessage("");

    try {
      let paymentData = {};

      // 1. Online Payment Sandbox Server Verification
      if (paymentMethod !== "COD") {
        setGatewayMessage(`Connecting to ${paymentMethod} Test Gateway...`);
        
        const verifyRes = await fetch("http://localhost:3000/api/orders/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethod,
            amount: totalAmount,
            paymentDetails: {
              upiId: upiMethod === "custom" ? upiId : `${shippingForm.fullName.replace(/\s+/g, "").toLowerCase()}@${upiMethod}`,
              cardLast4: cardDetails.cardNumber ? cardDetails.cardNumber.slice(-4) : "4242",
              bankName: selectedBank
            }
          })
        });

        const verifyJson = await verifyRes.json();
        if (!verifyRes.ok || !verifyJson.verified) {
          throw new Error(verifyJson.message || "Payment authorization failed by gateway.");
        }

        paymentData = {
          isVerified: true,
          transactionId: verifyJson.transactionId,
          cardLast4: cardDetails.cardNumber ? cardDetails.cardNumber.slice(-4) : "4242",
          bankName: selectedBank,
          upiId: upiMethod === "custom" ? upiId : `${shippingForm.fullName.replace(/\s+/g, "").toLowerCase()}@${upiMethod}`
        };

        setGatewayMessage("Payment authorized! Finalizing harvest order...");
      }

      // 2. Create Order on Backend
      const orderPayload = {
        userId: currentUser ? (currentUser.id || currentUser._id) : null,
        userEmail: shippingForm.email.trim(),
        userName: shippingForm.fullName.trim(),
        customerDetails: { ...shippingForm },
        items: cartItems.map((item) => ({
          productId: String(item.id),
          name: item.name,
          price: item.price,
          unit: item.unit || "pack",
          quantity: item.quantity,
          image: item.image,
          category: item.category || "Organic"
        })),
        subtotal,
        shippingFee,
        discount,
        totalAmount,
        paymentMethod,
        paymentData
      };

      const orderRes = await fetch("http://localhost:3000/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      const orderJson = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderJson.message || "Unable to save order. Please try again.");
      }

      // Save order to localStorage fallback for fast offline access
      try {
        const localOrders = JSON.parse(localStorage.getItem("freshroot_orders") || "[]");
        localStorage.setItem("freshroot_orders", JSON.stringify([orderJson.order, ...localOrders]));
      } catch (err) {
        console.warn("Local storage write warning:", err);
      }

      if (onOrderPlaced) {
        onOrderPlaced(orderJson.order);
      }

    } catch (err) {
      console.error("Order error:", err);
      setAlert({
        show: true,
        type: "error",
        message: err.message || "Failed to process order. Please ensure the backend is running."
      });
    } finally {
      setLoading(false);
      setGatewayMessage("");
    }
  };

  // Helper to fill Sandbox Card Test Details
  const fillTestCard = () => {
    setCardDetails({
      cardholderName: shippingForm.fullName || "Jane Doe",
      cardNumber: "4532 8920 1024 4242",
      expiryDate: "12/28",
      cvv: "888"
    });
    setErrors((prev) => ({ ...prev, cardNumber: "", expiryDate: "", cvv: "", cardholderName: "" }));
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="checkout-modal-title">
      <div className="checkout-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          type="button" 
          className="checkout-close-btn" 
          onClick={onClose}
          aria-label="Close Checkout"
        >
          <FiX />
        </button>

        {/* Modal Header */}
        <div className="checkout-header">
          <div className="checkout-brand-tag">
            <RiLeafLine className="brand-tag-icon" />
            <span>FRESHROOT CHECKOUT</span>
          </div>
          <h2 id="checkout-modal-title" className="checkout-title">
            {step === 1 ? "Delivery & Contact Info" : "Payment & Order Review"}
          </h2>
          <p className="checkout-subtitle">
            {step === 1 
              ? "Provide your delivery address for farm-fresh delivery in 30-45 minutes." 
              : "Select your preferred payment method. 100% secure checkout."}
          </p>

          {/* Stepper Progress Bar */}
          <div className="checkout-stepper">
            <div className={`step-node ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
              <span className="step-circle">{step > 1 ? "✓" : "1"}</span>
              <span className="step-text">Delivery Address</span>
            </div>
            <div className={`step-connector ${step === 2 ? "active" : ""}`} />
            <div className={`step-node ${step === 2 ? "active" : ""}`}>
              <span className="step-circle">2</span>
              <span className="step-text">Payment Options</span>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {alert.show && (
          <div className={`checkout-alert ${alert.type}`} role="alert">
            {alert.type === "error" ? <FiAlertCircle className="alert-icon" /> : <FiCheckCircle className="alert-icon" />}
            <span>{alert.message}</span>
          </div>
        )}

        <div className="checkout-body-grid">
          {/* Main Form Left Column */}
          <div className="checkout-form-column">
            
            {/* =======================================================
                STEP 1: SHIPPING & ADDRESS
               ======================================================= */}
            {step === 1 && (
              <form className="address-form" onSubmit={handleNextStep}>
                <div className="form-section-title">
                  <FiMapPin className="section-icon" />
                  <span>Where should we deliver your groceries?</span>
                </div>

                <div className="form-grid-2">
                  <div className={`form-field ${errors.fullName ? "has-error" : ""}`}>
                    <label htmlFor="chk-fullname">Full Name *</label>
                    <div className="field-input-wrap">
                      <FiUser className="field-icon" />
                      <input
                        id="chk-fullname"
                        type="text"
                        placeholder="Jane Doe"
                        value={shippingForm.fullName}
                        onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                      />
                    </div>
                    {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                  </div>

                  <div className={`form-field ${errors.phone ? "has-error" : ""}`}>
                    <label htmlFor="chk-phone">Phone Number *</label>
                    <div className="field-input-wrap">
                      <FiPhone className="field-icon" />
                      <input
                        id="chk-phone"
                        type="tel"
                        placeholder="+1 (555) 019-2834"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                      />
                    </div>
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                </div>

                <div className={`form-field ${errors.email ? "has-error" : ""}`}>
                  <label htmlFor="chk-email">Email Address (for order tracking updates) *</label>
                  <div className="field-input-wrap">
                    <FiMail className="field-icon" />
                    <input
                      id="chk-email"
                      type="email"
                      placeholder="jane@example.com"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                    />
                  </div>
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className={`form-field ${errors.street ? "has-error" : ""}`}>
                  <label htmlFor="chk-street">Street Address & Flat / Door No. *</label>
                  <div className="field-input-wrap">
                    <FiMapPin className="field-icon" />
                    <input
                      id="chk-street"
                      type="text"
                      placeholder="Apt 4B, 742 Evergreen Terrace"
                      value={shippingForm.street}
                      onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                    />
                  </div>
                  {errors.street && <span className="error-text">{errors.street}</span>}
                </div>

                <div className="form-grid-3">
                  <div className={`form-field ${errors.city ? "has-error" : ""}`}>
                    <label htmlFor="chk-city">City *</label>
                    <input
                      id="chk-city"
                      type="text"
                      placeholder="Brooklyn"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                      className="plain-input"
                    />
                    {errors.city && <span className="error-text">{errors.city}</span>}
                  </div>

                  <div className="form-field">
                    <label htmlFor="chk-state">State</label>
                    <input
                      id="chk-state"
                      type="text"
                      placeholder="NY"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                      className="plain-input"
                    />
                  </div>

                  <div className={`form-field ${errors.pincode ? "has-error" : ""}`}>
                    <label htmlFor="chk-pincode">Pincode / ZIP *</label>
                    <input
                      id="chk-pincode"
                      type="text"
                      placeholder="11201"
                      value={shippingForm.pincode}
                      onChange={(e) => setShippingForm({ ...shippingForm, pincode: e.target.value })}
                      className="plain-input"
                    />
                    {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="chk-notes">Special Delivery Instructions (Optional)</label>
                  <textarea
                    id="chk-notes"
                    rows="2"
                    placeholder="Leave with front desk, gate code #4092, etc."
                    value={shippingForm.deliveryNotes}
                    onChange={(e) => setShippingForm({ ...shippingForm, deliveryNotes: e.target.value })}
                    className="notes-textarea"
                  />
                </div>

                <div className="form-actions-row">
                  <button type="button" className="btn-secondary" onClick={onClose}>
                    Return to Basket
                  </button>
                  <button type="submit" className="btn-primary proceed-btn">
                    <span>Continue to Payment</span>
                    <FiArrowRight />
                  </button>
                </div>
              </form>
            )}

            {/* =======================================================
                STEP 2: PAYMENT METHOD SELECTION
               ======================================================= */}
            {step === 2 && (
              <div className="payment-selection-flow">
                <div className="form-section-title">
                  <FiCreditCard className="section-icon" />
                  <span>Choose Your Payment Method</span>
                </div>

                {/* 4 Payment Options Tabs */}
                <div className="payment-options-grid">
                  
                  {/* 1. Cash on Delivery (COD) */}
                  <label className={`payment-method-card ${paymentMethod === "COD" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                    />
                    <div className="method-icon-wrap cod-accent">
                      <FiDollarSign />
                    </div>
                    <div className="method-info">
                      <div className="method-title-row">
                        <span className="method-name">Cash on Delivery</span>
                        <span className="method-tag tag-cod">No Fee</span>
                      </div>
                      <span className="method-desc">Pay with cash or UPI upon package arrival at doorstep.</span>
                    </div>
                  </label>

                  {/* 2. UPI (GPay, PhonePe, Paytm) */}
                  <label className={`payment-method-card ${paymentMethod === "UPI" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={() => setPaymentMethod("UPI")}
                    />
                    <div className="method-icon-wrap upi-accent">
                      <FiSmartphone />
                    </div>
                    <div className="method-info">
                      <div className="method-title-row">
                        <span className="method-name">UPI / QR Code</span>
                        <span className="method-tag tag-fast">Instant</span>
                      </div>
                      <span className="method-desc">Google Pay, PhonePe, Paytm, BHIM & UPI ID.</span>
                    </div>
                  </label>

                  {/* 3. Credit / Debit Card */}
                  <label className={`payment-method-card ${paymentMethod === "Card" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Card"
                      checked={paymentMethod === "Card"}
                      onChange={() => setPaymentMethod("Card")}
                    />
                    <div className="method-icon-wrap card-accent">
                      <FiCreditCard />
                    </div>
                    <div className="method-info">
                      <div className="method-title-row">
                        <span className="method-name">Credit / Debit Card</span>
                        <span className="method-tag tag-secure">256-bit SSL</span>
                      </div>
                      <span className="method-desc">Visa, Mastercard, RuPay & Amex accepted.</span>
                    </div>
                  </label>

                  {/* 4. Net Banking */}
                  <label className={`payment-method-card ${paymentMethod === "NetBanking" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="NetBanking"
                      checked={paymentMethod === "NetBanking"}
                      onChange={() => setPaymentMethod("NetBanking")}
                    />
                    <div className="method-icon-wrap netbank-accent">
                      <FiGlobe />
                    </div>
                    <div className="method-info">
                      <div className="method-title-row">
                        <span className="method-name">Net Banking</span>
                        <span className="method-tag tag-bank">Direct Bank</span>
                      </div>
                      <span className="method-desc">All major verified banks supported.</span>
                    </div>
                  </label>
                </div>

                {/* Sub-form based on selected payment method */}
                <div className="payment-subform-box">
                  
                  {/* COD Subform */}
                  {paymentMethod === "COD" && (
                    <div className="cod-info-view">
                      <div className="info-banner">
                        <FiInfo className="info-icon" />
                        <div>
                          <strong>Cash on Delivery (COD) Selected</strong>
                          <p>You can pay via Cash, Card or UPI QR scanner when the FreshRoot delivery partner arrives. Payment status will be set to <em>Pending</em> until delivery.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI Subform */}
                  {paymentMethod === "UPI" && (
                    <div className="upi-subform">
                      <label className="subform-label">Select UPI App or Enter ID</label>
                      <div className="upi-app-selector">
                        {UPI_APPS.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            className={`upi-app-btn ${upiMethod === app.id ? "active" : ""}`}
                            onClick={() => setUpiMethod(app.id)}
                          >
                            <span className="upi-app-icon">{app.icon}</span>
                            <span>{app.name}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          className={`upi-app-btn ${upiMethod === "custom" ? "active" : ""}`}
                          onClick={() => setUpiMethod("custom")}
                        >
                          <span className="upi-app-icon">@</span>
                          <span>Other UPI ID</span>
                        </button>
                      </div>

                      {upiMethod === "custom" && (
                        <div className={`form-field ${errors.upiId ? "has-error" : ""}`}>
                          <label htmlFor="chk-upi-id">Enter UPI ID (VPA)</label>
                          <input
                            id="chk-upi-id"
                            type="text"
                            placeholder="e.g. yourname@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="plain-input"
                          />
                          {errors.upiId && <span className="error-text">{errors.upiId}</span>}
                        </div>
                      )}

                      <div className="sandbox-badge">
                        <FiShield className="shield-icon" />
                        <span>Sandbox Test Gateway Active — Verified instantly on server.</span>
                      </div>
                    </div>
                  )}

                  {/* Card Subform */}
                  {paymentMethod === "Card" && (
                    <div className="card-subform">
                      <div className="subform-header-row">
                        <label className="subform-label">Card Details</label>
                        <button type="button" className="test-card-fill-btn" onClick={fillTestCard}>
                          ⚡ Fill Test Card
                        </button>
                      </div>

                      <div className={`form-field ${errors.cardholderName ? "has-error" : ""}`}>
                        <label htmlFor="chk-cardholder">Cardholder Name</label>
                        <input
                          id="chk-cardholder"
                          type="text"
                          placeholder="Jane Doe"
                          value={cardDetails.cardholderName}
                          onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                          className="plain-input"
                        />
                        {errors.cardholderName && <span className="error-text">{errors.cardholderName}</span>}
                      </div>

                      <div className={`form-field ${errors.cardNumber ? "has-error" : ""}`}>
                        <label htmlFor="chk-cardnum">Card Number</label>
                        <div className="field-input-wrap">
                          <FiCreditCard className="field-icon" />
                          <input
                            id="chk-cardnum"
                            type="text"
                            maxLength="19"
                            placeholder="4532 8920 1024 4242"
                            value={cardDetails.cardNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                              const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                              setCardDetails({ ...cardDetails, cardNumber: formatted });
                            }}
                          />
                        </div>
                        {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                      </div>

                      <div className="form-grid-2">
                        <div className={`form-field ${errors.expiryDate ? "has-error" : ""}`}>
                          <label htmlFor="chk-cardexp">Expiry (MM/YY)</label>
                          <input
                            id="chk-cardexp"
                            type="text"
                            maxLength="5"
                            placeholder="MM/YY"
                            value={cardDetails.expiryDate}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                              if (val.length >= 3) {
                                val = `${val.slice(0, 2)}/${val.slice(2)}`;
                              }
                              setCardDetails({ ...cardDetails, expiryDate: val });
                            }}
                            className="plain-input"
                          />
                          {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
                        </div>

                        <div className={`form-field ${errors.cvv ? "has-error" : ""}`}>
                          <label htmlFor="chk-cardcvv">CVV</label>
                          <div className="field-input-wrap">
                            <FiLock className="field-icon" />
                            <input
                              id="chk-cardcvv"
                              type="password"
                              maxLength="4"
                              placeholder="•••"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                            />
                          </div>
                          {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                        </div>
                      </div>

                      <div className="sandbox-badge">
                        <FiShield className="shield-icon" />
                        <span>PCI-DSS Compliant Test Mode. Raw card numbers are never stored in database.</span>
                      </div>
                    </div>
                  )}

                  {/* Net Banking Subform */}
                  {paymentMethod === "NetBanking" && (
                    <div className="netbank-subform">
                      <label className="subform-label">Select Your Bank</label>
                      <div className="bank-options-grid">
                        {POPULAR_BANKS.map((bank) => (
                          <button
                            key={bank.id}
                            type="button"
                            className={`bank-select-btn ${selectedBank === bank.id ? "active" : ""}`}
                            onClick={() => setSelectedBank(bank.id)}
                          >
                            <span className="bank-radio-bullet">{selectedBank === bank.id ? "●" : "○"}</span>
                            <span>{bank.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="sandbox-badge">
                        <FiShield className="shield-icon" />
                        <span>Direct Sandbox Bank Gateway Simulation.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation and Order Confirmation Action */}
                <div className="form-actions-row">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    <FiArrowLeft />
                    <span>Back to Address</span>
                  </button>

                  <button 
                    type="button" 
                    className="btn-primary place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FiLoader className="btn-spinner" />
                        <span>{gatewayMessage || "Processing Order..."}</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {paymentMethod === "COD" 
                            ? `Confirm & Place Order ($${totalAmount.toFixed(2)})` 
                            : `Authorize & Pay $${totalAmount.toFixed(2)}`}
                        </span>
                        <FiArrowRight />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar Right Column */}
          <aside className="checkout-summary-column" aria-label="Order Summary">
            <div className="summary-sticky-card">
              <h3 className="summary-title">Basket Summary ({cartItems.length} items)</h3>
              
              <ul className="summary-items-list">
                {cartItems.map((item) => (
                  <li key={item.id} className="summary-item-row">
                    <div className="summary-item-left">
                      <img src={item.image} alt={item.name} className="summary-item-thumb" />
                      <div className="summary-item-text">
                        <span className="summary-item-name">{item.name}</span>
                        <span className="summary-item-qty">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <span className="summary-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="summary-divider" />

              <div className="summary-costs">
                <div className="cost-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cost-row">
                  <span>Estimated Delivery</span>
                  <span>
                    {shippingFee === 0 ? <span className="free-pill">FREE</span> : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="cost-row discount-row">
                    <span>FreshPromo Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-divider" />
                <div className="cost-row total-row">
                  <span>Grand Total</span>
                  <span className="total-value">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Guarantee Pill */}
              <div className="delivery-guarantee-box">
                <FiTruck className="guarantee-icon" />
                <div>
                  <strong>30-Minute Farm Express</strong>
                  <p>Guaranteed 100% fresh organic produce at your doorstep.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
