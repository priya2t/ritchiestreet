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

export const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248783.14652415624!2d79.84599848671878!3d13.020595500000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526162c6fe9de9%3A0xb3a12f1400dcab4a!2sF1%20Tekno%20Solutions!5e0!3m2!1sen!2sin!4v1765988025468!5m2!1sen!2sin';
