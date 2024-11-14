import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PricingTable from './components/PricingTable';


// Replace with your actual publishable key
const stripePromise = loadStripe(import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY);

const App = () => {
  return (
    <Elements stripe={stripePromise}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center">Subscription Plans</h1>
        <PricingTable />
      </div>
    </Elements>
  );
};

export default App;
