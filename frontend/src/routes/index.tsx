import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage.js';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
