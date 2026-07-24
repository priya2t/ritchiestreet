const WP_URL = process.env.REACT_APP_WORDPRESS_URL || 'http://localhost/rich/rich_wordpress';
export const phpAssetBase = `${WP_URL}/wp-content/uploads`;

export const asset = (path) => `${phpAssetBase}/${path}`;

export const company = {
  name: 'Ritchie Street Best Online Electronics Hub',
  shortName: 'Ritchie Street',
  email: 'info@ritchiestreet.co.in',
  phone: '+91 86675 07040',
  website: 'www.ritchiestreet.co.in',
  address: '6, 107, Mangadu Rd, next to Niagara Juice Shop, Mangala Nagar, Paraniputhur, Iyyappanthangal, Chennai, Tamil Nadu 600122',
  facebook: 'https://www.facebook.com/profile.php?id=61550673917474',
  twitter: 'https://twitter.com/Ritchistreetchn',
  instagram: 'https://www.instagram.com/ritchiestreet_chn'
};
