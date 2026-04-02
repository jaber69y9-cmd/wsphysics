import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

const Layout = () => {
  const outlet = useOutlet();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 overflow-x-hidden">
        {outlet}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
