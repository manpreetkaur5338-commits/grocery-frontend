import { useState } from "react";
import { FiMail, FiCheck, FiArrowRight } from "react-icons/fi";
import "./Newsletter.css";

const Newsletter = ({ onNotify }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    fetch("https://grocery-backend-1-hf2l.onrender.com/api/subscriber",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email ,name:email.split("@")[0]}),
    }).then((res)=>res.json()).then((data)=>{
      console.log(data);
      setSubmitted(true);
    }).catch((err)=>console.log(err));
    
    setSubmitted(true);
    if (onNotify) {
      onNotify(`Thank you! ${email} has been subscribed to FreshRoot updates.`);
    }
  };

  return (
    <section className="newsletter-section" id="newsletter-section" aria-label="Newsletter Subscription">
      <div className="container">
        <div className="newsletter-card">
          <div className="newsletter-icon-wrap" aria-hidden="true">
            <FiMail />
          </div>

          <div className="newsletter-text-wrap">
            <h2 className="newsletter-heading">
              Fresh updates, straight to your inbox.
            </h2>
            <p className="newsletter-description">
              Get seasonal picks, new arrivals, chef's recipes and exclusive member offers.
            </p>
          </div>

          {submitted ? (
            <div className="newsletter-success">
              <div className="success-icon-box">
                <FiCheck />
              </div>
              <div className="success-content">
                <strong>You're on the list!</strong>
                <span>We sent a welcome gift of 15% off to {email}.</span>
              </div>
              <button 
                type="button" 
                className="reset-btn"
                onClick={() => { setSubmitted(false); setEmail(""); }}
              >
                Subscribe another
              </button>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <input
                  type="email"
                  className={`newsletter-input ${error ? "has-error" : ""}`}
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  aria-label="Email address for newsletter"
                />
                <button 
                  type="submit" 
                  className="newsletter-btn"
                  aria-label="Subscribe to newsletter"
                >
                  <span>Subscribe</span>
                  <FiArrowRight className="nl-btn-icon" />
                </button>
              </div>
              {error && <span className="newsletter-error">{error}</span>}
              <span className="newsletter-disclaimer">
                No spam ever. Unsubscribe at any time with one click.
              </span>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
