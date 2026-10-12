import { useState, useEffect, useMemo, useCallback } from "react";
import { FiArrowRight, FiSearch, FiRefreshCw, FiAlertTriangle, FiLoader } from "react-icons/fi";
import ProductCard from "../ProductCard/ProductCard";
import "./ProductSection.css";

const ProductSection = ({
  activeCategory = "All",
  onSelectCategory,
  searchQuery = "",
  onClearSearch,
  cartItems = [],
  onAddToCart,
  wishlist = [],
  onToggleWishlist
}) => {
  // State for fetched products, loading, and error
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryTabs = [
    "All",
    "Fruits",
    "Vegetables",
    "Dairy",
    "Bakery",
    "Beverages",
    "Pantry"
  ];

  // Fetch real products from MongoDB backend API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:3000/api/products");

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status} (${response.statusText || "Error"})`);
      }

      const data = await response.json();

      // Adapt to array response or nested data structures
      const rawProducts = Array.isArray(data) ? data : data?.products || data?.data || [];

      // Normalize fields to guarantee consistency with frontend requirements
      const normalizedProducts = rawProducts.map((p) => ({
        id: p.id ?? p._id,
        name: p.name || "",
        category: p.category || "",
        price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
        unit: p.unit || "item",
        rating: typeof p.rating === "number" ? p.rating : Number(p.rating) || 5.0,
        reviewsCount: typeof p.reviewsCount === "number" ? p.reviewsCount : Number(p.reviewsCount) || 0,
        badge: p.badge || "",
        image: p.image || "",
        description: p.description || ""
      }));

      setProducts(normalizedProducts);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(
        err.message || "Failed to load products from MongoDB. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter dynamic products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category match
      let matchesCategory = true;
      if (activeCategory && activeCategory !== "All") {
        const catLower = activeCategory.toLowerCase();
        matchesCategory =
          product.category.toLowerCase().includes(catLower) ||
          catLower.includes(product.category.toLowerCase());
      }

      // Search query match
      let matchesSearch = true;
      if (searchQuery && searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        matchesSearch =
          product.name.toLowerCase().includes(queryLower) ||
          product.category.toLowerCase().includes(queryLower) ||
          product.description.toLowerCase().includes(queryLower);
      }

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // Map cart items for quick lookup
  const cartItemMap = useMemo(() => {
    const map = new Map();
    cartItems.forEach((item) => {
      map.set(item.id, item.quantity);
    });
    return map;
  }, [cartItems]);

  // Wishlist set for O(1) lookup
  const wishlistSet = useMemo(() => {
    return new Set(wishlist.map((item) => item.id));
  }, [wishlist]);

  return (
    <section className="product-section" id="products-section" aria-label="Best Sellers">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-title-wrap">
            <span className="section-eyebrow">Handpicked Freshness</span>
            <h2 className="section-title">Best Sellers</h2>
          </div>
          <button 
            type="button" 
            className="section-link"
            onClick={() => {
              onSelectCategory("All");
              if (onClearSearch) onClearSearch();
            }}
            aria-label="View all best sellers"
          >
            <span>View All</span>
            <FiArrowRight />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="product-filters-bar" role="tablist" aria-label="Product Category Filter">
          {categoryTabs.map((tab) => {
            const isTabActive = 
              (tab === "All" && (!activeCategory || activeCategory === "All")) ||
              activeCategory === tab ||
              (activeCategory.includes(tab) && tab !== "All");

            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isTabActive}
                className={`filter-tab-btn ${isTabActive ? "active" : ""}`}
                onClick={() => onSelectCategory(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search Feedback Banner */}
        {!loading && !error && searchQuery && searchQuery.trim() && (
          <div className="search-status-bar">
            <div className="search-status-text">
              <FiSearch className="status-search-icon" />
              <span>
                Showing results for <strong>"{searchQuery}"</strong> ({filteredProducts.length} items found)
              </span>
            </div>
            <button
              type="button"
              className="clear-search-link"
              onClick={onClearSearch}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="products-loading-state" role="status" aria-live="polite">
            <div className="loading-spinner-box">
              <FiLoader className="spinner-icon" />
            </div>
            <h3 className="empty-title">Loading Fresh Produce...</h3>
            <p className="empty-desc">
              Fetching organic products directly from our database.
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="products-error-state" role="alert">
            <div className="error-icon-box">
              <FiAlertTriangle />
            </div>
            <h3 className="error-title">Unable to Load Products</h3>
            <p className="error-desc">{error}</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={fetchProducts}
            >
              <FiRefreshCw />
              <span>Retry Request</span>
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                isInCart={cartItemMap.has(product.id)}
                cartQuantity={cartItemMap.get(product.id) || 0}
                isWishlisted={wishlistSet.has(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="products-empty-state">
            <div className="empty-icon-box">
              <FiSearch />
            </div>
            <h3 className="empty-title">No products match your criteria</h3>
            <p className="empty-desc">
              We couldn't find any products in "{activeCategory}" matching "{searchQuery}".
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onSelectCategory("All");
                if (onClearSearch) onClearSearch();
              }}
            >
              <FiRefreshCw />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;

