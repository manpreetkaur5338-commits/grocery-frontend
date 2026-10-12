import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { 
  FiMapPin, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCreditCard, 
  FiDollarSign, 
  FiSmartphone, 
  FiGlobe, 
  FiShield, 
  FiTruck, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiLoader, 
  FiArrowRight, 
  FiArrowLeft,
  FiShoppingBag,
  FiLock,
  FiInfo
} from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import OrderConfirmationModal from "../../components/Checkout/OrderConfirmationModal";
import "./CheckoutPage.css";

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

const CheckoutPage = ({ onTrackOrder }) => {
  const navigate = useNavigate();
  const { currentUser, token, logout } = useAuth();
  const { cartItems, clearCart, subtotal, shippingFee, total } = useCart();

  // Step 1: Delivery Address & Contact; Step 2: Payment & Review
  const [step, setStep] = useState(1);

  // Form states
  const [shippingForm, setShippingForm] = useState({
    fullName: currentUser?.name || currentUser?.fullName || "",
    email: currentUser?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "NY",
    pincode: "",
    deliveryNotes: ""
  });

  // Keep shippingForm synced with currentUser
  useEffect(() => {
    if (currentUser) {
      setShippingForm((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.name || currentUser.fullName || "",
        email: prev.email || currentUser.email || ""
      }));
    }
  }, [currentUser]);

  // Payment method: "COD", "UPI", "Card", "NetBanking"
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [upiMethod, setUpiMethod] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Status & Feedback states
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [gatewayMessage, setGatewayMessage] = useState("");
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  // Confirmed Order State for Modal
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Address validation
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

  // Payment validation
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Fill test card details
  const fillTestCard = () => {
    setCardDetails({
      cardholderName: shippingForm.fullName || "Jane Doe",
      cardNumber: "4532 8920 1024 4242",
      expiryDate: "12/28",
      cvv: "888"
    });
    setErrors((prev) => ({ ...prev, cardNumber: "", expiryDate: "", cvv: "", cardholderName: "" }));
  };

  // Submit Order
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
        setGatewayMessage(`Connecting to ${paymentMethod} Gateway...`);

        const verifyRes = await fetch("http://localhost:3000/api/orders/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            paymentMethod,
            amount: total,
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

        setGatewayMessage("Payment authorized! Finalizing order...");
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
        discount: 0,
        totalAmount: total,
        paymentMethod,
        paymentData
      };

      const orderRes = await fetch("http://localhost:3000/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const orderJson = await orderRes.json();

      // Check for authentication expiration from backend
      if (orderRes.status === 401) {
        logout();
        navigate("/login?redirect=/checkout", { 
          state: { reason: "session_expired" } 
        });
        return;
      }

      if (!orderRes.ok) {
        throw new Error(orderJson.message || "Unable to save order. Please try again.");
      }

      // Save order to localStorage fallback
      try {
        const localOrders = JSON.parse(localStorage.getItem("freshroot_orders") || "[]");
        localStorage.setItem("freshroot_orders", JSON.stringify([orderJson.order, ...localOrders]));
      } catch (err) {
        console.warn("Local storage write warning:", err);
      }

      // Clear cart
      clearCart();

      // Show confirmation modal
      setConfirmedOrder(orderJson.order);
      setIsConfirmationOpen(true);

    } catch (err) {
      console.error("Order placement error:", err);
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

  // If cart is empty and no confirmed order is active
  if (cartItems.length === 0 && !confirmedOrder) {
    return (
      <div className="checkout-page-root">
        <header className="checkout-page-header">
          <div className="checkout-header-inner">
            <Link to="/" className="checkout-logo">
              <RiLeafLine className="leaf-icon" />
              <span>FRESH<span className="accent">ROOT</span></span>
            </Link>
            <Link to="/" className="exit-checkout-btn">Return to Store</Link>
          </div>
        </header>

        <div className="empty-checkout-container">
          <div className="empty-checkout-card">
            <div className="empty-icon-circle">
              <FiShoppingBag />
            </div>
            <h2>Your basket is empty</h2>
            <p>You don't have any groceries in your cart to checkout right now.</p>
            <Link to="/" className="btn-return-shop">
              <span>Explore Fresh Harvest</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-root">
      {/* Top Header */}
      <header className="checkout-page-header">
        <div className="checkout-header-inner">
          <Link to="/" className="checkout-logo" aria-label="FreshRoot Home">
            <RiLeafLine className="leaf-icon" />
            <span>FRESH<span className="accent">ROOT</span></span>
          </Link>

          <div className="header-auth-pill">
            <FiShield className="shield-icon" />
            <span>Authenticated Checkout: <strong>{currentUser?.name || currentUser?.email}</strong></span>
          </div>

          <Link to="/" className="exit-checkout-btn">
            ← Continue Shopping
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="checkout-main-content">
        <div className="checkout-content-container">
          
          {/* Stepper Header */}
          <div className="checkout-stepper-banner">
            <div className="stepper-title-area">
              <span className="stepper-eyebrow">FRESHROOT SECURE PROCESS</span>
              <h1 className="stepper-main-title">
                {step === 1 ? "1. Delivery Address & Contact" : "2. Payment Method & Review"}
              </h1>
            </div>

            <div className="stepper-indicators">
              <div 
                className={`step-badge ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}
                onClick={() => step > 1 && setStep(1)}
              >
                <span className="badge-num">{step > 1 ? "✓" : "1"}</span>
                <span className="badge-label">Shipping</span>
              </div>
              <div className={`step-divider-line ${step === 2 ? "active" : ""}`} />
              <div className={`step-badge ${step === 2 ? "active" : ""}`}>
                <span className="badge-num">2</span>
                <span className="badge-label">Payment</span>
              </div>
            </div>
          </div>

          {/* Alert Banner */}
          {alert.show && (
            <div className={`checkout-alert-box ${alert.type}`} role="alert">
              {alert.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
              <span>{alert.message}</span>
            </div>
          )}

          {/* Grid Layout: Left Column (Form) & Right Column (Summary) */}
          <div className="checkout-grid-layout">
            
            {/* Left Column */}
            <div className="checkout-form-column">
              
              {/* STEP 1: ADDRESS */}
              {step === 1 && (
                <form className="checkout-step-form" onSubmit={handleNextStep}>
                  <div className="section-legend">
                    <FiMapPin className="legend-icon" />
                    <span>Where should our farm courier deliver your basket?</span>
                  </div>

                  <div className="form-fields-2col">
                    <div className={`form-field ${errors.fullName ? "has-error" : ""}`}>
                      <label htmlFor="chk-pg-name">Full Name *</label>
                      <div className="field-input-box">
                        <FiUser className="box-prefix-icon" />
                        <input
                          id="chk-pg-name"
                          type="text"
                          placeholder="Jane Doe"
                          value={shippingForm.fullName}
                          onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                        />
                      </div>
                      {errors.fullName && <span className="field-error-text">{errors.fullName}</span>}
                    </div>

                    <div className={`form-field ${errors.phone ? "has-error" : ""}`}>
                      <label htmlFor="chk-pg-phone">Phone Number *</label>
                      <div className="field-input-box">
                        <FiPhone className="box-prefix-icon" />
                        <input
                          id="chk-pg-phone"
                          type="tel"
                          placeholder="+1 (555) 234-5678"
                          value={shippingForm.phone}
                          onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        />
                      </div>
                      {errors.phone && <span className="field-error-text">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className={`form-field ${errors.email ? "has-error" : ""}`}>
                    <label htmlFor="chk-pg-email">Email Address (Order confirmation sent here) *</label>
                    <div className="field-input-box">
                      <FiMail className="box-prefix-icon" />
                      <input
                        id="chk-pg-email"
                        type="email"
                        placeholder="jane@example.com"
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                      />
                    </div>
                    {errors.email && <span className="field-error-text">{errors.email}</span>}
                  </div>

                  <div className={`form-field ${errors.street ? "has-error" : ""}`}>
                    <label htmlFor="chk-pg-street">Street Address & Apartment / Unit *</label>
                    <div className="field-input-box">
                      <FiMapPin className="box-prefix-icon" />
                      <input
                        id="chk-pg-street"
                        type="text"
                        placeholder="Apt 4B, 742 Evergreen Terrace"
                        value={shippingForm.street}
                        onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                      />
                    </div>
                    {errors.street && <span className="field-error-text">{errors.street}</span>}
                  </div>

                  <div className="form-fields-3col">
                    <div className={`form-field ${errors.city ? "has-error" : ""}`}>
                      <label htmlFor="chk-pg-city">City *</label>
                      <input
                        id="chk-pg-city"
                        type="text"
                        placeholder="Brooklyn"
                        className="plain-style-input"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                      />
                      {errors.city && <span className="field-error-text">{errors.city}</span>}
                    </div>

                    <div className="form-field">
                      <label htmlFor="chk-pg-state">State</label>
                      <input
                        id="chk-pg-state"
                        type="text"
                        placeholder="NY"
                        className="plain-style-input"
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                      />
                    </div>

                    <div className={`form-field ${errors.pincode ? "has-error" : ""}`}>
                      <label htmlFor="chk-pg-pin">ZIP / Pincode *</label>
                      <input
                        id="chk-pg-pin"
                        type="text"
                        placeholder="11201"
                        className="plain-style-input"
                        value={shippingForm.pincode}
                        onChange={(e) => setShippingForm({ ...shippingForm, pincode: e.target.value })}
                      />
                      {errors.pincode && <span className="field-error-text">{errors.pincode}</span>}
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="chk-pg-notes">Delivery Instructions (Optional)</label>
                    <textarea
                      id="chk-pg-notes"
                      rows="2"
                      placeholder="e.g. Ring apartment buzzer #402, leave at front door"
                      className="plain-style-textarea"
                      value={shippingForm.deliveryNotes}
                      onChange={(e) => setShippingForm({ ...shippingForm, deliveryNotes: e.target.value })}
                    />
                  </div>

                  <div className="form-submit-row">
                    <Link to="/" className="btn-step-back">Return to Shop</Link>
                    <button type="submit" className="btn-step-forward">
                      <span>Continue to Payment</span>
                      <FiArrowRight />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: PAYMENT METHOD */}
              {step === 2 && (
                <div className="checkout-step-payment">
                  <div className="section-legend">
                    <FiCreditCard className="legend-icon" />
                    <span>Select your payment preference</span>
                  </div>

                  {/* Payment Methods Grid */}
                  <div className="methods-selection-grid">
                    
                    {/* COD */}
                    <label className={`method-card ${paymentMethod === "COD" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="checkoutPayment"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                      />
                      <div className="method-icon-circle cod">
                        <FiDollarSign />
                      </div>
                      <div className="method-details">
                        <div className="method-heading">
                          <span className="name">Cash on Delivery</span>
                          <span className="pill green">No Fee</span>
                        </div>
                        <p className="desc">Pay via cash or UPI QR scanner upon delivery arrival.</p>
                      </div>
                    </label>

                    {/* UPI */}
                    <label className={`method-card ${paymentMethod === "UPI" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="checkoutPayment"
                        value="UPI"
                        checked={paymentMethod === "UPI"}
                        onChange={() => setPaymentMethod("UPI")}
                      />
                      <div className="method-icon-circle upi">
                        <FiSmartphone />
                      </div>
                      <div className="method-details">
                        <div className="method-heading">
                          <span className="name">UPI / QR Code</span>
                          <span className="pill gold">Fast</span>
                        </div>
                        <p className="desc">Google Pay, PhonePe, Paytm, BHIM and custom UPI ID.</p>
                      </div>
                    </label>

                    {/* Card */}
                    <label className={`method-card ${paymentMethod === "Card" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="checkoutPayment"
                        value="Card"
                        checked={paymentMethod === "Card"}
                        onChange={() => setPaymentMethod("Card")}
                      />
                      <div className="method-icon-circle card">
                        <FiCreditCard />
                      </div>
                      <div className="method-details">
                        <div className="method-heading">
                          <span className="name">Credit / Debit Card</span>
                          <span className="pill blue">SSL Encrypted</span>
                        </div>
                        <p className="desc">Visa, Mastercard, RuPay & Amex accepted.</p>
                      </div>
                    </label>

                    {/* NetBanking */}
                    <label className={`method-card ${paymentMethod === "NetBanking" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="checkoutPayment"
                        value="NetBanking"
                        checked={paymentMethod === "NetBanking"}
                        onChange={() => setPaymentMethod("NetBanking")}
                      />
                      <div className="method-icon-circle netbank">
                        <FiGlobe />
                      </div>
                      <div className="method-details">
                        <div className="method-heading">
                          <span className="name">Net Banking</span>
                          <span className="pill neutral">All Banks</span>
                        </div>
                        <p className="desc">Direct secure internet banking gateway.</p>
                      </div>
                    </label>

                  </div>

                  {/* Payment Details Subform */}
                  <div className="payment-interactive-subform">
                    {paymentMethod === "COD" && (
                      <div className="subform-cod-box">
                        <FiInfo className="info-icon" />
                        <div>
                          <strong>Cash on Delivery (Doorstep Payment)</strong>
                          <p>Have exact cash or scan the courier's digital QR code upon delivery. Payment status will be confirmed at delivery.</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "UPI" && (
                      <div className="subform-upi-box">
                        <label className="subform-title">Select UPI App or ID</label>
                        <div className="upi-app-buttons">
                          {UPI_APPS.map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              className={`upi-pill-btn ${upiMethod === app.id ? "active" : ""}`}
                              onClick={() => setUpiMethod(app.id)}
                            >
                              <span>{app.icon}</span>
                              <span>{app.name}</span>
                            </button>
                          ))}
                          <button
                            type="button"
                            className={`upi-pill-btn ${upiMethod === "custom" ? "active" : ""}`}
                            onClick={() => setUpiMethod("custom")}
                          >
                            <span>@</span>
                            <span>Custom UPI ID</span>
                          </button>
                        </div>

                        {upiMethod === "custom" && (
                          <div className={`form-field ${errors.upiId ? "has-error" : ""}`} style={{ marginTop: "12px" }}>
                            <label htmlFor="chk-upi-custom">Enter VPA / UPI ID</label>
                            <input
                              id="chk-upi-custom"
                              type="text"
                              placeholder="e.g. yourname@okhdfcbank"
                              className="plain-style-input"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                            />
                            {errors.upiId && <span className="field-error-text">{errors.upiId}</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {paymentMethod === "Card" && (
                      <div className="subform-card-box">
                        <div className="card-top-row">
                          <label className="subform-title">Payment Card Details</label>
                          <button type="button" className="test-card-btn" onClick={fillTestCard}>
                            ⚡ Fill Test Card
                          </button>
                        </div>

                        <div className={`form-field ${errors.cardholderName ? "has-error" : ""}`}>
                          <label htmlFor="chk-card-holder">Cardholder Name</label>
                          <input
                            id="chk-card-holder"
                            type="text"
                            placeholder="Jane Doe"
                            className="plain-style-input"
                            value={cardDetails.cardholderName}
                            onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                          />
                          {errors.cardholderName && <span className="field-error-text">{errors.cardholderName}</span>}
                        </div>

                        <div className={`form-field ${errors.cardNumber ? "has-error" : ""}`}>
                          <label htmlFor="chk-card-number">Card Number</label>
                          <div className="field-input-box">
                            <FiCreditCard className="box-prefix-icon" />
                            <input
                              id="chk-card-number"
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
                          {errors.cardNumber && <span className="field-error-text">{errors.cardNumber}</span>}
                        </div>

                        <div className="form-fields-2col">
                          <div className={`form-field ${errors.expiryDate ? "has-error" : ""}`}>
                            <label htmlFor="chk-card-exp">Expiry (MM/YY)</label>
                            <input
                              id="chk-card-exp"
                              type="text"
                              maxLength="5"
                              placeholder="12/28"
                              className="plain-style-input"
                              value={cardDetails.expiryDate}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                                if (val.length >= 3) {
                                  val = `${val.slice(0, 2)}/${val.slice(2)}`;
                                }
                                setCardDetails({ ...cardDetails, expiryDate: val });
                              }}
                            />
                            {errors.expiryDate && <span className="field-error-text">{errors.expiryDate}</span>}
                          </div>

                          <div className={`form-field ${errors.cvv ? "has-error" : ""}`}>
                            <label htmlFor="chk-card-cvv">CVV</label>
                            <div className="field-input-box">
                              <FiLock className="box-prefix-icon" />
                              <input
                                id="chk-card-cvv"
                                type="password"
                                maxLength="4"
                                placeholder="•••"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                              />
                            </div>
                            {errors.cvv && <span className="field-error-text">{errors.cvv}</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "NetBanking" && (
                      <div className="subform-netbank-box">
                        <label className="subform-title">Select Your Verified Bank</label>
                        <div className="bank-select-grid">
                          {POPULAR_BANKS.map((bank) => (
                            <button
                              key={bank.id}
                              type="button"
                              className={`bank-pill-btn ${selectedBank === bank.id ? "active" : ""}`}
                              onClick={() => setSelectedBank(bank.id)}
                            >
                              <span className="dot">{selectedBank === bank.id ? "●" : "○"}</span>
                              <span>{bank.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="form-submit-row">
                    <button type="button" className="btn-step-back" onClick={() => setStep(1)} disabled={loading}>
                      <FiArrowLeft />
                      <span>Back to Address</span>
                    </button>

                    <button 
                      type="button" 
                      className="btn-step-forward place-order-btn" 
                      onClick={handlePlaceOrder}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <FiLoader className="btn-spin" />
                          <span>{gatewayMessage || "Processing Order..."}</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {paymentMethod === "COD" 
                              ? `Confirm & Place Order ($${total.toFixed(2)})` 
                              : `Authorize & Pay $${total.toFixed(2)}`}
                          </span>
                          <FiArrowRight />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Sticky Basket Summary */}
            <aside className="checkout-summary-column" aria-label="Order Basket Summary">
              <div className="summary-sticky-card">
                <div className="summary-card-header">
                  <h3>Order Basket Summary</h3>
                  <span className="items-count-tag">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
                  </span>
                </div>

                {/* Items List */}
                <ul className="summary-items-scroll">
                  {cartItems.map((item) => (
                    <li key={item.id} className="summary-item-tile">
                      <img src={item.image} alt={item.name} className="item-thumb" />
                      <div className="item-meta">
                        <span className="item-name">{item.name}</span>
                        <span className="item-sub">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                      </div>
                      <span className="item-line-total">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="summary-breakdown">
                  <div className="breakdown-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Farm Express Delivery</span>
                    <span>
                      {shippingFee === 0 ? <span className="free-pill">FREE</span> : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="summary-total-row">
                    <span>Total Amount</span>
                    <span className="grand-price">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="delivery-promise-pill">
                  <FiTruck className="truck-icon" />
                  <div>
                    <strong>30-45 Min Climate Delivery</strong>
                    <p>Harvested cold-stored produce packed safely.</p>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => {
          setIsConfirmationOpen(false);
          navigate("/");
        }}
        order={confirmedOrder}
        onTrackOrder={(order) => {
          setIsConfirmationOpen(false);
          if (onTrackOrder) onTrackOrder(order.orderId);
          navigate("/");
        }}
        onContinueShopping={() => {
          setIsConfirmationOpen(false);
          navigate("/");
        }}
      />
    </div>
  );
};

export default CheckoutPage;
