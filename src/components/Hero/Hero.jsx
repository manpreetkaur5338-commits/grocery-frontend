import { FiArrowRight, FiShield, FiTruck, FiStar } from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./Hero.css";

const Hero = ({ onShopClick, onCategoriesClick }) => {
  return (
    <section className="hero-section" id="hero-section" aria-label="Hero Section">
      <div className="container hero-container">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>FRESH • NATURAL • LOCAL</span>
          </div>

          <h1 className="hero-title">
            Fresh groceries, <br />
            <span className="hero-title-highlight">straight to your door.</span>
          </h1>

          <p className="hero-description">
            Discover fresh produce, pantry essentials and everyday favorites, 
            carefully selected for your home from certified organic local growers.
          </p>

          <div className="hero-actions">
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={onShopClick}
              aria-label="Shop fresh groceries"
            >
              <span>Shop Fresh</span>
              <FiArrowRight className="btn-icon" />
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCategoriesClick}
              aria-label="Explore grocery categories"
            >
              <span>Explore Categories</span>
            </button>
          </div>

          {/* Social Proof & Trust Badges */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <div className="trust-icon-box">
                <FiTruck />
              </div>
              <div className="trust-text">
                <strong>Same-Day Delivery</strong>
                <span>Free on orders over $50</span>
              </div>
            </div>

            <div className="trust-divider" aria-hidden="true"></div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <FiShield />
              </div>
              <div className="trust-text">
                <strong>100% Organic</strong>
                <span>Certified eco-farms</span>
              </div>
            </div>

            <div className="trust-divider" aria-hidden="true"></div>

            <div className="trust-item">
              <div className="trust-icon-box trust-star">
                <FiStar />
              </div>
              <div className="trust-text">
                <strong>4.9 / 5 Rating</strong>
                <span>12k+ happy homes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Visual Composition */}
        <div className="hero-media-wrapper">
          <div className="hero-image-backdrop" aria-hidden="true"></div>
          
          <div className="hero-image-container">
            <img 
              src="/grocery3.png" 
              alt="Artisan wicker basket filled with fresh crisp vegetables, broccoli, carrots, and tomatoes" 
              className="hero-main-image"
              loading="eager"
            />

            {/* Floating Organic Quality Card */}
            <div className="floating-badge badge-top-right">
              <div className="floating-icon">
                <RiLeafLine />
              </div>
              <div className="floating-info">
                <span className="floating-sub">Fresh Pick</span>
                <span className="floating-main">100% Natural</span>
              </div>
            </div>

            {/* Floating Fresh Delivery Card */}
            <div className="floating-badge badge-bottom-left">
              <div className="floating-icon-delivery">
                <FiTruck />
              </div>
              <div className="floating-info">
                <span className="floating-sub">Express 45-Min</span>
                <span className="floating-main">Doorstep Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
