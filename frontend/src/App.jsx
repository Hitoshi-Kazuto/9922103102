import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TopUsers from './pages/TopUsers';
import TrendingPosts from './pages/TrendingPosts';
import Feed from './pages/Feed';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <Layout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<TopUsers />} />
              <Route path="/trending" element={<TrendingPosts />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
