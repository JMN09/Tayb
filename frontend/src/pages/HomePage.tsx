// src/pages/HomePage.tsx
import React from 'react';
import TopBar from '../components/TopBar';
import './HomePage.css';
import { useEffect, useState } from 'react';
import { getRestaurants } from '../services/api';




const HomePage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);

  useEffect(() => {
    getRestaurants().then(setRestaurants);
  }, []);
    

  return (
    <div className="home-container">
      <video autoPlay loop muted className="background-video">
        <source src="/logo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
    </video>
      <TopBar />
      <div className="scroll-columns">
        <div className="left-column scroll-wrapper">
            <div className="scroll-content">
            {restaurants.concat(restaurants).map((r, i) => (
                <img
                key={`left-${i}-${r.id}`}
                src={r.image_url}
                alt={r.name}
                className="restaurant-image"
                />
            ))}
            </div>
        </div>

        <div className="right-column scroll-wrapper">
            <div className="scroll-content">
            {restaurants.concat(restaurants).map((r, i) => (
                <img
                key={`right-${i}-${r.id}`}
                src={r.image_url}
                alt={r.name}
                className="restaurant-image"
                />
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;