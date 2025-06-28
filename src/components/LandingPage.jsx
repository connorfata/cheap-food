// src/components/LandingPage.jsx

import React, { useState } from 'react';
import { MapPin, Star, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

function LandingPage({ onStartSearch }) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    if (searchInput.trim()) {
      onStartSearch(searchInput.trim());
    }
  };

  const quickNeighborhoods = ['SoHo', 'Harlem', 'Williamsburg', 'Chinatown'];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-4xl mb-4">🍕</div>
          <h1 className="text-3xl font-bold mb-3">Find NYC's Best<br />Cheap Eats</h1>
          <p className="text-gray-600 text-lg mb-6">
            Discover amazing meals under your budget in every NYC neighborhood. From $5 pizza slices to authentic ethnic cuisine.
          </p>
          <div className="relative mb-3">
            <MapPin className="icon-absolute" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter neighborhood (e.g., SoHo, Williamsburg)"
              className="input-field"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchInput.trim()}
            className="btn-primary w-full"
          >
            Find Food
          </button>
          <div className="mt-4 text-sm text-orange-600">🥚 1,247 searches this week</div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 px-4 text-center">
          <div>
            <DollarSign className="mx-auto mb-2 text-primary-500" size={32} />
            <h3 className="font-semibold text-lg mb-1">Save Money</h3>
            <p className="text-gray-600">Find meals under $10 that satisfy your cravings.</p>
          </div>
          <div>
            <MapPin className="mx-auto mb-2 text-primary-500" size={32} />
            <h3 className="font-semibold text-lg mb-1">Explore by Neighborhood</h3>
            <p className="text-gray-600">Search by SoHo, Harlem, and more.</p>
          </div>
          <div>
            <Star className="mx-auto mb-2 text-primary-500" size={32} />
            <h3 className="font-semibold text-lg mb-1">Top Rated</h3>
            <p className="text-gray-600">Curated eats with 4.5+ Yelp ratings.</p>
          </div>
        </div>
      </section>

      {/* Quick Launch */}
      <section className="py-12 bg-gray-100 border-t text-center">
        <h2 className="text-2xl font-semibold mb-6">Jump into a Neighborhood</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {quickNeighborhoods.map((hood) => (
            <button
              key={hood}
              onClick={() => onStartSearch(hood)}
              className="px-4 py-2 rounded-full bg-primary-50 text-primary-600 font-semibold hover:bg-primary-100 transition"
            >
              {hood}
            </button>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-white border-t text-center">
        <h2 className="text-2xl font-semibold mb-6">Why Choose Cheap Eats NYC?</h2>
        <div className="max-w-2xl mx-auto space-y-6 px-4">
          <blockquote className="text-gray-700 italic">
            “I found a life-changing $4 dumpling spot 2 blocks from me. Game changer.”
          </blockquote>
          <blockquote className="text-gray-700 italic">
            “Way better than scrolling Yelp for 45 minutes.”
          </blockquote>
          <blockquote className="text-gray-700 italic">
            “Cheap Eats NYC is my go-to lunch hack. Period.”
          </blockquote>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-12 bg-gray-50 text-center border-t">
        <h3 className="text-xl font-semibold mb-4">Ready to find your next favorite bite?</h3>
        <button
          onClick={handleSearch}
          disabled={!searchInput.trim()}
          className="btn-primary"
        >
          Start Searching
        </button>
      </footer>
    </div>
  );
}

export default LandingPage;
