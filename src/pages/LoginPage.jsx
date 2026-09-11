import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { IconTooth } from '../components/Icons';

export default function LoginPage() {
  const { handleGoogleSuccess, handleGoogleError, authError, clearAuthError } = useAuth();

  return (
    <div className="login-shell">
      {/* Left panel — branding */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo">
            <IconTooth size={32} />
            <span>DentalCRM</span>
          </div>
          <div className="login-tagline">
            Your practice pipeline,<br />beautifully managed.
          </div>
          <ul className="login-features">
            {[
              'Track every lead from first contact to treatment',
              'Drag-and-drop pipeline with 6 stages',
              'Calendar with follow-up scheduling',
              'Analytics across your whole team',
            ].map(f => (
              <li key={f}>
                <span className="login-feature-dot" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Gradient mesh — hero decoration from DESIGN.md */}
        <div className="login-mesh" aria-hidden="true">
          <div className="mesh-blob mesh-blob-1" />
          <div className="mesh-blob mesh-blob-2" />
          <div className="mesh-blob mesh-blob-3" />
        </div>
      </div>

      {/* Right panel — sign-in form */}
      <div className="login-panel">
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-card-title">Sign in</h1>
            <p className="login-card-sub">
              Use the Gmail account your admin has registered for you.
            </p>
          </div>

          {authError && (
            <div className="login-error" role="alert">
              <div className="login-error-icon">!</div>
              <div>
                <div className="login-error-title">Access denied</div>
                <div className="login-error-body">{authError}</div>
              </div>
              <button
                className="login-error-dismiss"
                onClick={clearAuthError}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <div className="login-google-wrap">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
              width="320"
            />
          </div>

          <p className="login-note">
            Only team members added by an admin can sign in.<br />
            The first person to sign in becomes the admin.
          </p>
        </div>
      </div>
    </div>
  );
}
