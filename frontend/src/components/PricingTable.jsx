import React from 'react';
import axios from 'axios';

const plans = [
  { name: 'Basic', price: 10, priceId: 'price_1QKfqvRw2QKYIanT6eXYCMUm' },
  { name: 'Pro', price: 50, priceId: 'price_1QKftYRw2QKYIanTZ8gvFye9' },
  { name: 'Business', price: 100, priceId: 'price_1QKh9vRw2QKYIanTjuKN54GW' },
];

const dummyUserId = 'dummyUserId123';

const PricingTable = () => {
  const createSubscriptionSession = async (plan) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/create-subscription-checkout-session',
        {
          plan: plan.price,
          customerId: dummyUserId,
        }
      );
      const checkoutUrl = response.data.session.url;  // Use session.url for redirection
      if (checkoutUrl) {
        window.location.href = checkoutUrl;  // Redirect to Stripe Checkout URL
      } else {
        console.error('Error: Checkout URL not found');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };
  

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      {plans.map((plan) => (
        <div
          key={plan.priceId}
          className="border border-gray-300 rounded-lg p-6 shadow-md"
        >
          <h2 className="text-xl font-semibold">{plan.name}</h2>
          <p className="text-2xl font-bold mt-2">${plan.price}</p>
          <button
            onClick={() => createSubscriptionSession(plan)}
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600"
          >
            Subscribe
          </button>
        </div>
      ))}
    </div>
  );
};

export default PricingTable;
