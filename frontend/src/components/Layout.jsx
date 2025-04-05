import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200">
                  SocialApp
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
                <Link
                  to="/"
                  className={`btn-primary ${isActive('/') ? 'bg-primary-600' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                >
                  Top Users
                </Link>
                <Link
                  to="/trending"
                  className={`btn-primary ${isActive('/trending') ? 'bg-primary-600' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                >
                  Trending Posts
                </Link>
                <Link
                  to="/feed"
                  className={`btn-primary ${isActive('/feed') ? 'bg-primary-600' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                >
                  Feed
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Beta
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 SocialApp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 