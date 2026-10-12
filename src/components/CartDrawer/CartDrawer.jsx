import { useMemo } from "react";
import { 
  FiX, 
  FiPlus, 
  FiMinus, 
  FiTrash2, 
  FiShoppingBag, 
  FiArrowRight,
  FiTruck,
  FiCheck
} from "react-icons/fi";
import "./CartDrawer.css";

const CartDrawer = ({
  isOpen = false,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onStartShopping
}) => {
  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const FREE_SHIPPING_THRESHOLD = 50.0;
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 4.99;
  const total = subtotal + shippingFee;

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={onClose} aria-label="Shopping Cart Overlay">
      <aside 
        className="cart-drawer" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true" 
        aria-label="Shopping Cart Drawer"
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <FiShoppingBag className="cart-header-icon" />
            <h3>Your Grocery Basket</h3>
            <span className="cart-items-count">
              ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
            </span>
          </div>
          <button 
            type="button" 
            className="cart-close-btn" 
            onClick={onClose}
            aria-label="Close cart drawer"
          >
            <FiX />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="shipping-progress-box">
          <div className="shipping-progress-text">
            {amountRemaining > 0 ? (
              <>
                <FiTruck className="shipping-icon" />
                <span>
                  Add <strong>${amountRemaining.toFixed(2)}</strong> more for <strong>FREE Delivery</strong>
                </span>
              </>
            ) : (
              <>
                <FiCheck className="shipping-icon-success" />
                <span className="shipping-success-text">
                  You unlocked <strong>FREE Same-Day Delivery!</strong>
                </span>
              </>
            )}
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
            <div 
              className={`progress-fill ${progressPercent === 100 ? "complete" : ""}`} 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Cart Items List or Empty State */}
        <div className="cart-body">
          {cartItems.length > 0 ? (
            <ul className="cart-items-list">
              {cartItems.map((item) => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-img-wrap">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                  </div>

                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <span className="cart-item-cat">{item.category}</span>
                      <button
                        type="button"
                        className="cart-item-remove-btn"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label={`Remove ${item.name} from basket`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <h4 className="cart-item-name">{item.name}</h4>
                    <span className="cart-item-unit">${item.price.toFixed(2)} / {item.unit}</span>

                    <div className="cart-item-actions">
                      <div className="quantity-control" role="group" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <FiMinus />
                        </button>
                        <span className="qty-number" aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <FiPlus />
                        </button>
                      </div>

                      <span className="cart-item-total-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="cart-empty-view">
              <div className="cart-empty-icon-wrap">
                <FiShoppingBag />
              </div>
              <h4 className="cart-empty-title">Your basket is empty</h4>
              <p className="cart-empty-text">
                Explore our crisp harvest, fresh dairy, and pantry favorites to fill your basket.
              </p>
              <button
                type="button"
                className="btn btn-primary start-shopping-btn"
                onClick={() => {
                  onClose();
                  if (onStartShopping) onStartShopping();
                }}
              >
                <span>Start Shopping</span>
                <FiArrowRight />
              </button>
            </div>
          )}
        </div>

        {/* Footer with Calculations */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span className="summary-value">${subtotal.toFixed(2)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Estimated Delivery</span>
              <span className="summary-value">
                {shippingFee === 0 ? (
                  <span className="free-tag">FREE</span>
                ) : (
                  `$${shippingFee.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="cart-summary-total">
              <span>Total</span>
              <span className="total-amount">${total.toFixed(2)}</span>
            </div>

            <button
              type="button"
              className="checkout-btn"
              onClick={onCheckout}
              aria-label="Proceed to checkout"
            >
              <span>Proceed to Checkout</span>
              <FiArrowRight className="checkout-icon" />
              
              
            </button>

            <span className="checkout-guarantee">
              🔒 100% Secure Organic Checkout Guarantee
            </span>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
