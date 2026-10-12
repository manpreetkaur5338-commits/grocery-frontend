import { useEffect } from "react";
import { FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import "./Toast.css";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-banner toast-${type}`} role="status" aria-live="polite">
      <div className="toast-icon">
        {type === "success" ? <FiCheckCircle /> : <FiInfo />}
      </div>
      <span className="toast-text">{message}</span>
      <button 
        type="button" 
        className="toast-close-btn" 
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <FiX />
      </button>
    </div>
  );
};

export default Toast;
