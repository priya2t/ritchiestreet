import { useState, useCallback, useRef } from 'react';
import { fetchPriceComparison } from '../services/priceComparison';

/**
 * React hook for lazy-loading a product's price comparison data.
 */
export const usePriceComparison = (productId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const fetch = useCallback(async () => {
    if (!productId || hasFetched.current) {
      return data;
    }
    hasFetched.current = true;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPriceComparison(productId);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [productId, data]);

  const reset = useCallback(() => {
    hasFetched.current = false;
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, fetch, reset };
};
