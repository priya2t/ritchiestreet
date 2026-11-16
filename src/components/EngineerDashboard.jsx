import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import Layout from '../api/Layout';
import {
  getEngineerToken,
  setEngineerToken,
  engineerMe,
  engineerLogout,
  updateEngineerProfile,
  uploadProfilePhoto,
  getEnquiries,
  enquiryAction,
  getSubscription,
  submitRenewal,
  getNotifications,
  markNotificationsRead
} from '../api/sn-engineer';
import './EngineerDashboard.css';

const SECTIONS = [
  { key: 'overview', label: 'Dashboard Overview' },
  { key: 'profile', label: 'My Profile' },
  { key: 'new', label: 'New Enquiries' },
  { key: 'accepted', label: 'Accepted Enquiries' },
  { key: 'subscription', label: 'Subscription' },
  { key: 'notifications', label: 'Notifications' }
];

const ENQUIRY_STATUSES = ['accepted', 'contacted', 'in_progress', 'completed', 'cancelled'];
const STATUS_LABELS = {
  accepted: 'Accepted',
  contacted: 'Contacted Customer',
  in_progress: 'Service In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
  new: 'New'
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const EngineerDashboard = () => {
  const navigate = useNavigate();
  const [engineer, setEngineer] = useState(null);
  const [section, setSection] = useState('overview');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);

  const [enquiries, setEnquiries] = useState({ new: [], accepted: [], all: [] });
  const [subscription, setSubscription] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Profile form
  const [profileForm, setProfileForm] = useState(null);
  const [profileMsg, setProfileMsg] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  // Enquiry action state
  const [actionMsg, setActionMsg] = useState('');

  // Renewal form
  const [renewUtr, setRenewUtr] = useState('');
  const [renewShot, setRenewShot] = useState(null);
  const [renewMsg, setRenewMsg] = useState('');
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewQr, setRenewQr] = useState('');

  const loadEnquiries = useCallback(async () => {
    try {
      const [n, a, all] = await Promise.all([
        getEnquiries('new'),
        getEnquiries('accepted'),
        getEnquiries('all')
      ]);
      setEnquiries({
        new: n.enquiries || [],
        accepted: a.enquiries || [],
        all: all.enquiries || []
      });
    } catch (e) {
      console.error('enquiries load failed', e);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await getNotifications();
      const list = res.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (e) {
      console.error('notifications load failed', e);
    }
  }, []);

  useEffect(() => {
    if (!getEngineerToken()) {
      navigate('/engineer-login');
      return;
    }
    (async () => {
      try {
        const res = await engineerMe();
        setEngineer(res.engineer);
        setProfileForm({ ...res.engineer });
        loadEnquiries();
        loadNotifications();
        try {
          const sub = await getSubscription();
          setSubscription(sub);
        } catch (e) { /* subscription optional */ }
      } catch (e) {
        setEngineerToken(null);
        navigate('/engineer-login');
        return;
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await engineerLogout();
    navigate('/engineer-login');
  };

  // ---------- Profile ----------
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      const res = await updateEngineerProfile({
        business_name: profileForm.business_name,
        whatsapp: profileForm.whatsapp,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
        pincode: profileForm.pincode,
        service_areas: profileForm.service_areas,
        specialization: profileForm.specialization,
        experience_years: profileForm.experience_years,
        description: profileForm.description,
        working_hours: profileForm.working_hours
      });
      if (res.success) {
        setEngineer(res.engineer);
        setProfileForm({ ...res.engineer });
        setProfileMsg('Profile updated successfully.');
      } else {
        setProfileMsg(res.message || 'Update failed.');
      }
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Update failed.');
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    try {
      const res = await uploadProfilePhoto(photoFile);
      if (res.success) {
        setEngineer((prev) => ({ ...prev, profile_photo: res.photo }));
        setProfileForm((prev) => ({ ...prev, profile_photo: res.photo }));
        setProfileMsg('Profile photo updated.');
      }
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Photo upload failed.');
    }
  };

  // ---------- Enquiries ----------
  const doEnquiryAction = async (id, action, extra = {}) => {
    setActionMsg('');
    try {
      await enquiryAction(id, action, extra);
      await loadEnquiries();
      setActionMsg('Enquiry updated.');
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Action failed.');
    }
  };

  // ---------- Subscription / Renewal ----------
  useEffect(() => {
    if (section === 'subscription' && subscription?.payment_info) {
      const info = subscription.payment_info;
      QRCode.toDataURL(
        `Ritchie Street - Engineer Subscription | Fee: ${info.currency || 'INR'} ${info.fee} | Payee: ${info.payee_name || 'Ritchie Street'} | Note: ${info.payment_note || 'Monthly Subscription'}`,
        { width: 320, margin: 1 }
      ).then(setRenewQr).catch(() => setRenewQr(''));
    }
  }, [section, subscription]);

  const handleRenew = async (e) => {
    e.preventDefault();
    setRenewMsg('');
    if (!renewUtr.trim()) {
      setRenewMsg('Please enter the UPI transaction ID (UTR).');
      return;
    }
    setRenewLoading(true);
    try {
      let shot = null;
      if (renewShot) shot = await fileToBase64(renewShot);
      const res = await submitRenewal({ utr: renewUtr.trim(), screenshotBase64: shot });
      setRenewMsg(res.message || 'Renewal submitted.');
      setRenewUtr('');
      setRenewShot(null);
      const sub = await getSubscription();
      setSubscription(sub);
    } catch (err) {
      setRenewMsg(err.response?.data?.message || 'Renewal submission failed.');
    } finally {
      setRenewLoading(false);
    }
  };

  // ---------- Notifications ----------
  const handleMarkRead = async () => {
    await markNotificationsRead();
    loadNotifications();
  };

  if (loading) {
    return (
      <Layout title="Engineer Dashboard - Ritchie Street" description="Service engineer dashboard.">
        <div className="snd-page"><div className="snd-loading">Loading dashboard...</div></div>
      </Layout>
    );
  }

  if (authError || !engineer) {
    return (
      <Layout title="Engineer Dashboard - Ritchie Street" description="Service engineer dashboard.">
        <div className="snd-page"><div className="snd-loading">Redirecting to login...</div></div>
      </Layout>
    );
  }

  const stats = {
    total: enquiries.all.length,
    fresh: enquiries.new.length,
    accepted: enquiries.accepted.length,
    completed: enquiries.all.filter((e) => e.status === 'completed').length
  };

  const photoUrl = engineer.profile_photo
    ? `${process.env.REACT_APP_WORDPRESS_URL || 'http://localhost/rich/rich_wordpress'}/wp-content/uploads/${engineer.profile_photo}`
    : null;

  const renderEnquiryCard = (eq, showActions) => (
    <div className="snd-enquiry-card" key={eq.id}>
      <div className="snd-enquiry-head">
        <span className="snd-enquiry-id">Enquiry #{eq.id}</span>
        <span className={`snd-status snd-status--${eq.status}`}>{STATUS_LABELS[eq.status] || eq.status}</span>
      </div>
      <div className="snd-enquiry-grid">
        <div><strong>Customer:</strong> {eq.customer_name}</div>
        <div><strong>Phone:</strong> {eq.customer_phone}</div>
        <div><strong>Service:</strong> {eq.service_category}</div>
        <div><strong>Location:</strong> {eq.customer_location || '—'}</div>
        <div className="snd-enquiry-full"><strong>Problem:</strong> {eq.problem_description || '—'}</div>
        <div><strong>Booking Date:</strong> {eq.booking_date}</div>
        {eq.preferred_date && <div><strong>Preferred Date:</strong> {eq.preferred_date}</div>}
      </div>
      {showActions && (
        <div className="snd-enquiry-actions">
          {eq.status === 'new' && (
            <>
              <button className="snd-btn snd-btn--primary" onClick={() => doEnquiryAction(eq.id, 'accept')}>Accept Enquiry</button>
              <button className="snd-btn snd-btn--ghost" onClick={() => doEnquiryAction(eq.id, 'decline')}>Decline</button>
            </>
          )}
          {['accepted', 'contacted', 'in_progress'].includes(eq.status) && (
            <select
              className="snd-status-select"
              value={eq.status}
              onChange={(e) => doEnquiryAction(eq.id, 'status_update', { status: e.target.value })}
            >
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Layout
      title="Engineer Dashboard - Ritchie Street"
      description="Ritchie Street service engineer dashboard."
    >
      <div className="snd-page">
        <div className="snd-shell">
          {/* Sidebar */}
          <aside className="snd-sidebar">
            <div className="snd-brand">
              <strong>Ritchie Street</strong>
              <span>Service Network</span>
            </div>
            <nav className="snd-nav">
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  className={`snd-nav-item ${section === s.key ? 'active' : ''}`}
                  onClick={() => setSection(s.key)}
                >
                  {s.label}
                  {s.key === 'notifications' && unreadCount > 0 && (
                    <span className="snd-badge-count">{unreadCount}</span>
                  )}
                </button>
              ))}
            </nav>
            <button className="snd-nav-item snd-nav-logout" onClick={handleLogout}>
              Log Out
            </button>
          </aside>

          {/* Main */}
          <main className="snd-main">
            {actionMsg && <div className="snd-toast">{actionMsg}</div>}

            {section === 'overview' && (
              <div>
                <h1 className="snd-h1">Welcome, {engineer.name}</h1>
                <div className="snd-stat-grid">
                  <div className="snd-stat"><span>Account Status</span><strong>{engineer.registration_status}</strong></div>
                  <div className="snd-stat"><span>Subscription</span><strong>{engineer.subscription_active ? 'Active' : 'Inactive'}</strong></div>
                  <div className="snd-stat"><span>Expiry Date</span><strong>{engineer.subscription_end || '—'}</strong></div>
                  <div className="snd-stat"><span>Total Enquiries</span><strong>{stats.total}</strong></div>
                  <div className="snd-stat"><span>New Enquiries</span><strong>{stats.fresh}</strong></div>
                  <div className="snd-stat"><span>Accepted</span><strong>{stats.accepted}</strong></div>
                  <div className="snd-stat"><span>Completed Jobs</span><strong>{stats.completed}</strong></div>
                </div>
                {!engineer.subscription_active && (
                  <div className="snd-alert snd-alert--warn">
                    Your subscription is inactive. You cannot receive or accept new enquiries until it is renewed and verified.
                    <button className="snd-btn snd-btn--primary" style={{ marginLeft: 12 }} onClick={() => setSection('subscription')}>
                      Go to Subscription
                    </button>
                  </div>
                )}
              </div>
            )}

            {section === 'profile' && profileForm && (
              <div>
                <h1 className="snd-h1">My Profile</h1>
                <div className="snd-profile-head">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="snd-avatar" />
                  ) : (
                    <div className="snd-avatar snd-avatar--empty">{(engineer.name || 'E')[0]}</div>
                  )}
                  <div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhotoFile(e.target.files[0])} />
                    <button className="snd-btn snd-btn--ghost" onClick={handlePhotoUpload} disabled={!photoFile}>
                      Upload Photo
                    </button>
                  </div>
                </div>
                {profileMsg && <div className="snd-toast">{profileMsg}</div>}
                <form className="snd-form" onSubmit={handleProfileSubmit}>
                  <div className="snd-form-grid">
                    <div className="snd-field"><label>Full Name</label><input value={engineer.name} disabled /></div>
                    <div className="snd-field"><label>Business Name</label><input name="business_name" value={profileForm.business_name || ''} onChange={handleProfileChange} /></div>
                    <div className="snd-field"><label>Mobile</label><input name="phone" value={profileForm.phone || ''} onChange={handleProfileChange} /></div>
                    <div className="snd-field"><label>WhatsApp</label><input name="whatsapp" value={profileForm.whatsapp || ''} onChange={handleProfileChange} /></div>
                    <div className="snd-field"><label>Email</label><input value={engineer.email} disabled /></div>
                    <div className="snd-field"><label>City</label><input name="city" value={profileForm.city || ''} onChange={handleProfileChange} /></div>
                    <div className="snd-field"><label>Pincode</label><input name="pincode" value={profileForm.pincode || ''} onChange={handleProfileChange} /></div>
                    <div className="snd-field"><label>Specialization</label><input name="specialization" value={profileForm.specialization || ''} onChange={handleProfileChange} /></div>
                    <div className="snd-field"><label>Experience</label><input name="experience_years" value={profileForm.experience_years || ''} onChange={handleProfileChange} /></div>
                    <div className="snd-field"><label>Working Hours</label><input name="working_hours" value={profileForm.working_hours || ''} onChange={handleProfileChange} /></div>
                    <div className="snd-field snd-field--full"><label>Service Locations (comma separated)</label><input name="service_areas" value={profileForm.service_areas || ''} onChange={handleProfileChange} placeholder="e.g. Chennai, Ambattur, Porur" /></div>
                    <div className="snd-field snd-field--full"><label>Address</label><textarea name="address" rows="2" value={profileForm.address || ''} onChange={handleProfileChange} /></div>
                    <div className="snd-field snd-field--full"><label>Description</label><textarea name="description" rows="3" value={profileForm.description || ''} onChange={handleProfileChange} /></div>
                  </div>
                  <button type="submit" className="snd-btn snd-btn--primary">Save Profile</button>
                </form>
              </div>
            )}

            {section === 'new' && (
              <div>
                <h1 className="snd-h1">New Enquiries</h1>
                {!engineer.subscription_active && (
                  <div className="snd-alert snd-alert--warn">Subscription inactive — you cannot accept new enquiries until renewal is verified.</div>
                )}
                {enquiries.new.length === 0 && <p className="snd-empty">No new enquiries.</p>}
                {enquiries.new.map((eq) => renderEnquiryCard(eq, true))}
              </div>
            )}

            {section === 'accepted' && (
              <div>
                <h1 className="snd-h1">Accepted Enquiries</h1>
                {enquiries.all.filter((e) => e.status !== 'new').length === 0 && <p className="snd-empty">No accepted enquiries.</p>}
                {enquiries.all.filter((e) => e.status !== 'new').map((eq) => renderEnquiryCard(eq, true))}
              </div>
            )}

            {section === 'subscription' && subscription && (
              <div>
                <h1 className="snd-h1">Subscription Management</h1>
                <div className="snd-sub-grid">
                  <div className="snd-sub-card">
                    <h3>Monthly Subscription: ₹1</h3>
                    <table className="snd-sub-table">
                      <tbody>
                        <tr><td>Start Date</td><td>{engineer.subscription_start || '—'}</td></tr>
                        <tr><td>Expiry Date</td><td>{engineer.subscription_end || '—'}</td></tr>
                        <tr><td>Days Remaining</td><td>{engineer.subscription_active ? engineer.subscription_days_left : 0}</td></tr>
                        <tr><td>Status</td><td><span className={`snd-status ${engineer.subscription_active ? 'snd-status--completed' : 'snd-status--declined'}`}>{engineer.subscription_active ? 'Active' : 'Expired'}</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="snd-sub-card">
                    <h3>Renew Subscription</h3>
                    <p className="snd-sub-note">
                      Pay ₹1 via UPI and submit the transaction ID. Your subscription is
                      extended only after our team verifies the payment.
                    </p>
                    {renewQr && <img src={renewQr} alt="Payment QR" className="snd-qr" />}
                    <form onSubmit={handleRenew}>
                      <div className="snd-field">
                        <label>UPI Transaction ID (UTR)</label>
                        <input value={renewUtr} onChange={(e) => setRenewUtr(e.target.value)} placeholder="e.g. 123456789012" />
                      </div>
                      <div className="snd-field">
                        <label>Payment Screenshot (optional)</label>
                        <input type="file" accept="image/*" onChange={(e) => setRenewShot(e.target.files[0])} />
                      </div>
                      {renewMsg && <div className="snd-toast">{renewMsg}</div>}
                      <button type="submit" className="snd-btn snd-btn--primary" disabled={renewLoading}>
                        {renewLoading ? 'Submitting...' : 'Submit Renewal Payment'}
                      </button>
                    </form>
                  </div>
                </div>

                <h3 className="snd-h3">Renewal History</h3>
                {(subscription.renewals || []).length === 0 && <p className="snd-empty">No renewals yet.</p>}
                {(subscription.renewals || []).map((r) => (
                  <div className="snd-renewal-row" key={r.id}>
                    <span>#{r.id} — ₹{r.amount} — UTR: {r.utr || '—'}</span>
                    <span className={`snd-status snd-status--${r.status}`}>{r.status}</span>
                    <small>{r.created_at}</small>
                  </div>
                ))}
              </div>
            )}

            {section === 'notifications' && (
              <div>
                <div className="snd-notif-head">
                  <h1 className="snd-h1">Notifications</h1>
                  {unreadCount > 0 && <button className="snd-btn snd-btn--ghost" onClick={handleMarkRead}>Mark all read</button>}
                </div>
                {notifications.length === 0 && <p className="snd-empty">No notifications.</p>}
                {notifications.map((n) => (
                  <div className={`snd-notif ${n.is_read ? '' : 'snd-notif--unread'}`} key={n.id}>
                    <div>{n.message}</div>
                    <small>{n.created_at}</small>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default EngineerDashboard;
