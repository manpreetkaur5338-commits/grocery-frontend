import { FiPlus, FiCheck, FiHeart, FiStar } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import "./ProductCard.css";

const ProductCard = ({
  product,
  onAddToCart,
  isInCart = false,
  cartQuantity = 0,
  isWishlisted = false,
  onToggleWishlist
}) => {
  return (
    <article className="product-card" aria-label={product.name}>
      {/* Media & Badges */}
      <div className="product-image-box">
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}

        <button
          type="button"
          className={`wishlist-toggle ${isWishlisted ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist && onToggleWishlist(product);
          }}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          {isWishlisted ? <FaHeart className="wishlist-icon filled" /> : <FiHeart className="wishlist-icon" />}
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="product-info">
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <div className="product-rating" aria-label={`Rating: ${product.rating} out of 5`}>
            <FiStar className="star-icon" aria-hidden="true" />
            <span className="rating-value">{product.rating}</span>
            <span className="reviews-count">({product.reviewsCount})</span>
          </div>
        </div>

        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        <p className="product-desc-snippet">
          {product.description}
        </p>

        {/* Pricing and Action Footer */}
        <div className="product-footer">
          <div className="product-price-wrap">
            <span className="product-price">₹{product.price.toFixed(2)}</span>
            <span className="product-unit">/ {product.unit}</span>
          </div>

          <button
            type="button"
            className={`product-add-btn ${isInCart ? "added" : ""}`}
            onClick={() => onAddToCart && onAddToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            {isInCart ? (
              <>
                <FiCheck className="btn-icon" />
                <span>In Cart ({cartQuantity})</span>
              </>
            ) : (
              <>
                <FiPlus className="btn-icon" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
