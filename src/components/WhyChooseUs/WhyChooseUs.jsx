import { FiTruck, FiShield, FiRefreshCw, FiSun } from "react-icons/fi";
import "./WhyChooseUs.css";

const WhyChooseUs = () => {
  const benefits = [
    {
      id: "fresh",
      icon: <FiSun />,
      heading: "Fresh Every Day",
      description: "Picked at dawn and delivered within hours to keep vital nutrients intact."
    },
    {
      id: "fast",
      icon: <FiTruck />,
      heading: "Fast Delivery",
      description: "Flexible morning and evening courier slots with live temperature tracking."
    },
    {
      id: "quality",
      icon: <FiShield />,
      heading: "Quality Guaranteed",
      description: "100% certified organic soil standards and rigorous quality inspection."
    },
    {
      id: "returns",
      icon: <FiRefreshCw />,
      heading: "Easy Returns",
      description: "Not 100% satisfied with your harvest? Instant refund with zero hassle."
    }
  ];

  return (
    <section className="why-section" id="why-us-section" aria-label="Why Shop With Us">
      <div className="container">
        <div className="section-header why-header">
          <div className="section-title-wrap">
            <span className="section-eyebrow">Our Promise</span>
            <h2 className="section-title">Why shop with us?</h2>
          </div>
          <p className="why-header-sub">
            Built on transparent relationships with family farms and sustainable food stewardship.
          </p>
        </div>

        <div className="why-grid">
          {benefits.map((item) => (
            <div key={item.id} className="why-card">
              <div className="why-icon-box">
                {item.icon}
              </div>
              <h3 className="why-heading">{item.heading}</h3>
              <p className="why-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
