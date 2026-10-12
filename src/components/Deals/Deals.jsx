import { FiArrowRight } from "react-icons/fi";
import "./Deals.css";

const Deals = ({ onDealClick }) => {
  const dealCards = [
    {
      id: "fruits-deal",
      badge: "Weekend Special",
      discount: "20% OFF",
      title: "Fresh Orchard Fruits",
      description: "Hand-picked crisp apples, berries, and ripe citrus at seasonal savings.",
      accentClass: "deal-terracotta",
      categoryTarget: "Fruits",
      cta: "Shop Fruits",
      image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "veg-deal",
      badge: "Farm To Table",
      discount: "BUY 2 GET 1",
      title: "Organic Vegetables",
      description: "Crisp greens, vine tomatoes & root vegetables straight from local soil.",
      accentClass: "deal-green",
      categoryTarget: "Vegetables",
      cta: "Claim Offer",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "shipping-deal",
      badge: "Express Perks",
      discount: "FREE DELIVERY",
      title: "Orders Over $50",
      description: "Enjoy temperature-guaranteed contactless home delivery at zero charge.",
      accentClass: "deal-gold",
      categoryTarget: "All",
      cta: "Fill Your Cart",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <section className="deals-section" id="deals-section" aria-label="Fresh Deals">
      <div className="container">
        <div className="section-header">
          <div className="section-title-wrap">
            <span className="section-eyebrow">Limited Time Offers</span>
            <h2 className="section-title">Fresh Deals of the Week</h2>
          </div>
          <p className="deals-header-sub">
            Save on seasonal organic harvests and daily household pantry staples.
          </p>
        </div>

        <div className="deals-grid">
          {dealCards.map((deal) => (
            <div key={deal.id} className={`deal-card ${deal.accentClass}`}>
              <div className="deal-content">
                <span className="deal-badge">{deal.badge}</span>
                <span className="deal-discount">{deal.discount}</span>
                <h3 className="deal-title">{deal.title}</h3>
                <p className="deal-description">{deal.description}</p>
                <button
                  type="button"
                  className="deal-btn"
                  onClick={() => onDealClick && onDealClick(deal.categoryTarget)}
                  aria-label={`${deal.cta} for ${deal.title}`}
                >
                  <span>{deal.cta}</span>
                  <FiArrowRight className="deal-btn-icon" />
                </button>
              </div>
              <div className="deal-media">
                <img src={deal.image} alt={deal.title} className="deal-image" loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Deals;
