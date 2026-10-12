import { FiArrowRight } from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./PromoBanner.css";

const PromoBanner = ({ onShopNow }) => {
  return (
    <section className="promo-section" aria-label="Good Food Good Mood Promotion">
      <div className="container">
        <div className="promo-card">
          {/* Subtle Decorative Elements */}
          <div className="promo-glow" aria-hidden="true"></div>

          {/* Left Editorial Copy */}
          <div className="promo-content">
            <div className="promo-eyebrow">
              <RiLeafLine className="promo-leaf-icon" />
              <span>THE ART OF CONSCIOUS EATING</span>
            </div>

            <h2 className="promo-headline">
              GOOD FOOD.<br />
              <span className="promo-headline-accent">GOOD MOOD.</span>
            </h2>

            <p className="promo-subtext">
              Fresh ingredients for every table. Harvested at the peak of flavor, 
              delivered straight to your kitchen with love and care.
            </p>

            <div className="promo-features">
              <div className="promo-pill">Zero Preservatives</div>
              <div className="promo-pill">100% Traceable</div>
              <div className="promo-pill">Plastic Neutral</div>
            </div>

            <button
              type="button"
              className="promo-btn"
              onClick={onShopNow}
              aria-label="Shop now for fresh organic ingredients"
            >
              <span>Shop Now</span>
              <FiArrowRight className="promo-btn-icon" />
            </button>
          </div>

          {/* Right Editorial Image */}
          <div className="promo-media">
            <div className="promo-img-wrapper">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                alt="Colorful fresh organic produce arrangement with green vegetables and herbs"
                className="promo-image"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
