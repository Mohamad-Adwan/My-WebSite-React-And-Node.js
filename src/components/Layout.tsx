
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import LiveChat from './LiveChat';
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow w-full max-w-screen-2xl mx-auto">
        {children}
      </main>
      <LiveChat />
      <Footer />
    </div>
  );
};

export default Layout;
