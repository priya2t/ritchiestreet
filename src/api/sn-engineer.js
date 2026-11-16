// src/api/sn-engineer.js
// Service Network engineer auth + dashboard API client.
// Uses a bearer token issued by the WordPress backend after login.
import axios from 'axios';

const WP_URL = process.env.REACT_APP_WORDPRESS_URL || 'http://localhost/rich/rich_wordpress';
const SN_API = `${WP_URL}/wp-json/custom/v1/sn`;

const TOKEN_KEY = 'sn_engineer_token';

export const getEngineerToken = () => localStorage.getItem(TOKEN_KEY);
export const setEngineerToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

const authed = () => ({
  headers: { Authorization: `Bearer ${getEngineerToken()}` }
});

// ---------- Public ----------

export const engineerLogin = async (identifier, password) => {
  const res = await axios.post(`${SN_API}/engineer-login`, { identifier, password });
  return res.data;
};

export const engineerActivate = async (rid, token, password, passwordConfirm) => {
  const res = await axios.post(`${SN_API}/engineer-activate`, {
    rid, token, password, password_confirm: passwordConfirm
  });
  return res.data;
};

export const submitPaymentDetails = async ({ registrationId, email, utr, screenshotBase64 }) => {
  const body = {
    registration_id: registrationId,
    email,
    upi_transaction_id: utr
  };
  if (screenshotBase64) body.screenshot_base64 = screenshotBase64;
  const res = await axios.post(`${SN_API}/payment-submit`, body);
  return res.data;
};

// ---------- Authenticated ----------

export const engineerMe = async () => {
  const res = await axios.get(`${SN_API}/engineer/me`, authed());
  return res.data;
};

export const engineerLogout = async () => {
  try {
    await axios.post(`${SN_API}/engineer/logout`, {}, authed());
  } finally {
    setEngineerToken(null);
  }
};

export const updateEngineerProfile = async (fields) => {
  const res = await axios.post(`${SN_API}/engineer/profile`, fields, authed());
  return res.data;
};

export const uploadProfilePhoto = async (file) => {
  const form = new FormData();
  form.append('photo', file);
  const res = await axios.post(`${SN_API}/engineer/profile-photo`, form, {
    headers: { ...authed().headers, 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getEnquiries = async (filter = 'all') => {
  const res = await axios.get(`${SN_API}/engineer/enquiries`, {
    ...authed(),
    params: { filter }
  });
  return res.data;
};

export const enquiryAction = async (id, action, extra = {}) => {
  const res = await axios.post(`${SN_API}/engineer/enquiries/${id}/action`, { action, ...extra }, authed());
  return res.data;
};

export const getSubscription = async () => {
  const res = await axios.get(`${SN_API}/engineer/subscription`, authed());
  return res.data;
};

export const submitRenewal = async ({ utr, screenshotBase64 }) => {
  const body = { upi_transaction_id: utr };
  if (screenshotBase64) body.screenshot_base64 = screenshotBase64;
  const res = await axios.post(`${SN_API}/engineer/renew`, body, authed());
  return res.data;
};

export const getNotifications = async () => {
  const res = await axios.get(`${SN_API}/engineer/notifications`, authed());
  return res.data;
};

export const markNotificationsRead = async () => {
  const res = await axios.post(`${SN_API}/engineer/notifications/read`, {}, authed());
  return res.data;
};
