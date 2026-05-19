
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ChevronDown, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import LoginModal from './LoginModal';
import CartDrawer from './CartDrawer';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-pri
          mary">
          <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Logo" width={32} height={32} />
          <span className="text-2xl font-bold text-primary">Tech-Shop</span>
          </div>

          </Link>

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="lg:hidden">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="font-medium hover:text-primary">
                Home
              </Link>
              <Link to="/products" className="font-medium hover:text-primary">
                Products
              </Link>
              <Link to="/our-projects"  className="font-medium hover:text-primary" >
              Our Projects
            </Link>
              <Link to="/order-tracker" className="font-medium hover:text-primary">
                Track Order
              </Link>
              {user && (
                <Link to="/orders" className="font-medium hover:text-primary">
                  My Orders
                </Link>
              )}
              
              {user?.role === 'admin' && (
                <Link to="/admin" className="font-medium hover:text-primary">
                  Admin Dashboard
                </Link>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCartClick}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.email}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-50 bg-white">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="w-full cursor-pointer">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="w-full cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" onClick={handleLoginClick}>
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-3">
            <Link 
              to="/" 
              className="block py-2 px-4 hover:bg-muted rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="block py-2 px-4 hover:bg-muted rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/order-tracker" 
              className="block py-2 px-4 hover:bg-muted rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Track Order
            </Link>
             <Link 
              to="/our-projects" 
              className="block py-2 px-4 hover:bg-muted rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Our Projects
            </Link>
            {user && (
              <Link 
                to="/orders" 
                className="block py-2 px-4 hover:bg-muted rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Orders
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="block py-2 px-4 hover:bg-muted rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
      
      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
