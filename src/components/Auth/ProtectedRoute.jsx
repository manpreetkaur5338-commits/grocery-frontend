import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiLoader, FiShield } from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="protected-loading-screen" role="status" aria-live="polite">
        <div className="protected-loading-card">
          <div className="brand-badge-mini">
            <RiLeafLine className="badge-icon" />
            <span>FRESHROOT SECURITY</span>
          </div>
          <div className="spinner-wrap">
            <FiLoader className="auth-spinner" />
          </div>
          <h3>Verifying Secure Session</h3>
          <p>Please wait while we confirm your authenticated account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the intended destination in router location state & search param
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`} 
        state={{ from: location.pathname, reason: "checkout_requires_auth" }} 
        replace 
      />
    );
  }

  return children;
};

export default ProtectedRoute;
