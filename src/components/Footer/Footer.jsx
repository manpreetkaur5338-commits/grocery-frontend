import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiInstagram, 
  FiFacebook, 
  FiTwitter,
  FiArrowUp
} from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./Footer.css";

const Footer = ({ onCategoryClick }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer-root" id="footer-section" aria-label="FreshRoot Footer">
      <div className="container footer-container">
        {/* Top Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand Story */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-logo">
              <div className="footer-brand-icon">
                <RiLeafLine />
              </div>
              <span className="footer-brand-text">
                FRESH<span className="footer-brand-accent">ROOT</span>
              </span>
            </div>

            <p className="footer-about">
              Connecting conscious kitchens directly with regenerative family farms. 
              Pure, honest, wholesome groceries delivered fresh daily.
            </p>

            <div className="footer-socials" aria-label="Social links">
              <a href="#instagram" className="social-icon-link" aria-label="Instagram">
                <FiInstagram />
              </a>
              <a href="#facebook" className="social-icon-link" aria-label="Facebook">
                <FiFacebook />
              </a>
              <a href="#twitter" className="social-icon-link" aria-label="Twitter">
                <FiTwitter />
              </a>
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Shop</h4>
            <ul className="footer-links">
              <li>
                <button type="button" onClick={() => onCategoryClick && onCategoryClick("Fruits")}>
                  Fresh Produce
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onCategoryClick && onCategoryClick("Pantry")}>
                  Organic Pantry
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onCategoryClick && onCategoryClick("Dairy")}>
                  Dairy & Eggs
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onCategoryClick && onCategoryClick("Bakery")}>
                  Artisan Bakery
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onCategoryClick && onCategoryClick("Deals")}>
                  Fresh Deals
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About FreshRoot</a></li>
              <li><a href="#story">Our Farm Story</a></li>
              <li><a href="#sustainability">Regenerative Soil</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press & Media</a></li>
            </ul>
          </div>

          {/* Column 4: Help */}
          <div className="footer-col">
            <h4 className="footer-col-title">Help</h4>
            <ul className="footer-links">
              <li><a href="#faq">Frequently Asked Questions</a></li>
              <li><a href="#shipping">Shipping & Cold Chain</a></li>
              <li><a href="#returns">Freshness Guarantee</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 5: Contact */}
          <div className="footer-col footer-col-contact">
            <h4 className="footer-col-title">Contact</h4>
            <ul className="footer-contact-list">
              <li>
                <FiMail className="contact-icon" />
                <a href="mailto:hello@freshroot.com">hello@freshroot.com</a>
              </li>
              <li>
                <FiPhone className="contact-icon" />
                <a href="tel:+18005553737">+1 (800) 555-3737</a>
              </li>
              <li>
                <FiMapPin className="contact-icon" />
                <span>482 Orchard Lane, Hudson Valley, NY 12534</span>
              </li>
            </ul>
            <div className="footer-hours">
              <span>Customer Care: Mon–Sun 7am–9pm EST</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © 2026 FreshRoot. All rights reserved. Crafted with organic integrity.
          </p>

          <button 
            type="button" 
            className="scroll-top-btn" 
            onClick={scrollToTop}
            aria-label="Scroll back to top of page"
          >
            <span>Back to top</span>
            <FiArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
