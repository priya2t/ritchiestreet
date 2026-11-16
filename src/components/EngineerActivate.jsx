import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../api/Layout';
import { engineerActivate } from '../api/sn-engineer';
import './EngineerAuth.css';

const EngineerActivate = () => {
  const [params] = useSearchParams();
  const rid = params.get('rid') || '';
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const linkInvalid = !rid || !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await engineerActivate(rid, token, password, password2);
      if (res.success) {
        setDone(true);
      } else {
        setError(res.message || 'Activation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Activation failed. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Activate Engineer Account - Ritchie Street"
      description="Set your password to activate your Ritchie Street service engineer account."
    >
      <div className="sna-auth-page">
        <div className="sna-auth-card">
          {done ? (
            <>
              <h1>Account Activated</h1>
              <p className="sna-auth-sub">
                Your password has been set successfully. You can now log in to your
                engineer dashboard.
              </p>
              <Link to="/engineer-login" className="sna-auth-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Go to Engineer Login
              </Link>
            </>
          ) : linkInvalid ? (
            <>
              <h1>Invalid Activation Link</h1>
              <p className="sna-auth-sub">
                This activation link is missing required information. Please use the
                link from your activation email, or contact support.
              </p>
              <Link to="/engineer-login">Go to Engineer Login</Link>
            </>
          ) : (
            <>
              <h1>Activate Your Account</h1>
              <p className="sna-auth-sub">
                Set a password for your service engineer account.
              </p>
              <form onSubmit={handleSubmit} noValidate>
                <div className="sna-auth-field">
                  <label htmlFor="sna-new-pass">New Password</label>
                  <input
                    id="sna-new-pass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div className="sna-auth-field">
                  <label htmlFor="sna-new-pass2">Confirm Password</label>
                  <input
                    id="sna-new-pass2"
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                </div>
                {error && <div className="sna-auth-error">{error}</div>}
                <button type="submit" className="sna-auth-submit" disabled={loading}>
                  {loading ? 'Activating...' : 'Set Password & Activate'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EngineerActivate;
