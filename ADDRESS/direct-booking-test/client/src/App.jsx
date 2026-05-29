import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import BookingPage from './pages/BookingPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="*"        element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

