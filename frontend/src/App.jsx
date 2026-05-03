import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Status from './pages/Status';
import OrderManagement from './pages/OrderManagement';
import StockPage from './pages/StockPage';

const BackgroundMarquee = () => (
  <div className="fixed inset-0 z-0 opacity-10 pointer-events-none flex flex-col justify-center gap-12 overflow-hidden py-20">
    <div className="flex animate-marquee whitespace-nowrap gap-12">
      {[1, 2, 3, 4].map((i) => (
        <img key={i} alt={`food-${i}`} className="h-64 w-96 object-cover rounded-3xl grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf3BvFJQ2crxWFt16o3247zeHSHEroiGAWud7xHzJSv19uGv5tDvNdS1Hqq0XSYChaY3Wiu0ga-44hdJwWZwyLJ5EuSc0v7mpZ3ZqQNMTLXlzlMGpy3kK4CjRj6xzR66_LF_2_ZmBI1Xxp0z7nzL4bOBesKayF-sQk05kyuU2tRS92Fj9j9UdT2UDTCtip1O_Sy7sUeFDOs9kC3VM5gxMh9HswbePAnOpl0FdDk4gwPVaieGSixNA5IIva6tk2EAi4PI1rECd-O1ND"/>
      ))}
    </div>
    <div className="flex animate-marquee whitespace-nowrap gap-12" style={{ animationDirection: 'reverse', animationDuration: '60s' }}>
      {[2, 3, 4, 1].map((i) => (
        <img key={i} alt={`food-${i}`} className="h-48 w-80 object-cover rounded-3xl grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXg-cTyhWCkgH-nqSSrOdCnl9lFZTNZfOp7LokaMxqb1e7ken6H0YAZ1fx2MMlRqoHYEXx8D6Kh5jvFp4X4g5aMTc882Zqg36-yCrMJ4h9Kq0xDevcD1bkIMPS_ey8hWzDPjbNS-DJtKc9vezNh1zheY2tRwt4Oc2lupDVxLWeHoRdi9qUSO1Kh0PhvarnXyvu8-z3xaYpMoJZcAi2p325VO_Kx4q2usYjWsOS6qadXffIP2pxkRHTqbElAnwRMxpAlU6F8gCEmYc5"/>
      ))}
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-[#131313] selection:bg-[#ef4d23] selection:text-white overflow-x-hidden">
        <BackgroundMarquee />
        <Navbar />
        <main className="relative z-10 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/management" element={<OrderManagement />} />
            <Route path="/status" element={<Status />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/stock" element={<StockPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
