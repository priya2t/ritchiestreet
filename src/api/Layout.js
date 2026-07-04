import React from 'react';
import Seo from './Seo';

const Layout = ({ children, title, description }) => {
  return (
    <>
      <Seo title={title} description={description} />
      {children}
    </>
  );
};

export default Layout;
