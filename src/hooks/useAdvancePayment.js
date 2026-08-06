import { useCallback, useEffect, useMemo, useState } from 'react';

const ACK_STORAGE_KEY = 'ritchie_advance_payment_ack';

/**
 * Create a stable fingerprint of the cart contents.
 * This is used to detect when cart items or quantities change,
 * so an existing acknowledgement is invalidated when the cart changes.
 */
function getCartHash(cart) {
  if (!cart || cart.length === 0) return '';
  return cart
    .map(item => {
      const id = item.id ?? '';
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price || 0).toFixed(2);
      return `${id}:${qty}:${price}`;
    })
    .sort()
    .join('|');
}

function getStoredAck() {
  try {
    const raw = sessionStorage.getItem(ACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredAck(value) {
  try {
    sessionStorage.setItem(ACK_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage errors (e.g. private browsing)
  }
}

function clearStoredAck() {
  try {
    sessionStorage.removeItem(ACK_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Manages the advance payment acknowledgement state.
 *
 * @param {Array} cart - Current cart items
 * @param {Function} getGrandTotal - Function that returns the cart grand total
 * @returns {{ isRequired: boolean, acknowledged: boolean, grandTotal: number, setAcknowledged: Function }}
 */
export function useAdvancePayment(cart, getGrandTotal) {
  const cartHash = useMemo(() => getCartHash(cart), [cart]);

  // Initialize acknowledgement from sessionStorage on first render so other
  // components (e.g. Checkout redirect guard) see the correct value immediately.
  const [acknowledged, setAcknowledged] = useState(() => {
    const stored = getStoredAck();
    if (stored && stored.acknowledged === true && stored.cartHash === cartHash) {
      return true;
    }
    return false;
  });

  const [initialized, setInitialized] = useState(false);

  const grandTotal = useMemo(() => getGrandTotal(), [cart, getGrandTotal]);
  const isRequired = grandTotal > 10000;

  const acceptance = useMemo(() => {
    if (!isRequired || !acknowledged) {
      return isRequired ? null : { required: false, accepted: 'no', percentage: 50 };
    }
    const stored = getStoredAck();
    return {
      required: true,
      accepted: 'yes',
      percentage: stored?.percentage || 50,
      accepted_at: stored?.acceptedAt || new Date().toISOString(),
    };
  }, [isRequired, acknowledged]);

  // Persist or clear acknowledgement when the user toggles the checkbox
  const storeAck = useCallback(
    (value) => {
      if (value) {
        setStoredAck({
          acknowledged: true,
          required: isRequired,
          percentage: 50,
          acceptedAt: new Date().toISOString(),
          cartHash,
          timestamp: Date.now(),
        });
      } else {
        clearStoredAck();
      }
    },
    [cartHash, isRequired]
  );

  const setAcknowledgedWithStorage = useCallback(
    (value) => {
      setAcknowledged(!!value);
      storeAck(!!value);
    },
    [storeAck]
  );

  // Sync acknowledgement from sessionStorage whenever the cart or total changes
  useEffect(() => {
    if (!isRequired) {
      // No longer applicable; clear any saved acknowledgement
      setAcknowledged(false);
      clearStoredAck();
      setInitialized(true);
      return;
    }

    const stored = getStoredAck();
    if (stored && stored.acknowledged === true && stored.cartHash === cartHash) {
      setAcknowledged(true);
    } else {
      setAcknowledged(false);
      // Stored acknowledgement does not match current cart — remove it
      if (stored) {
        clearStoredAck();
      }
    }
    setInitialized(true);
  }, [isRequired, cartHash]);

  return {
    isRequired,
    acknowledged,
    isReady: initialized,
    grandTotal,
    acceptance,
    setAcknowledged: setAcknowledgedWithStorage,
  };
}
