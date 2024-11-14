import React, { useEffect, useState } from 'react';
import axios from 'axios';

const dummyUserId = 'dummyUserId123';

const Success = () => {
  const [subscriptionConfirmed, setSubscriptionConfirmed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserAndConfirmPayment = async () => {
      try {
        // Step 1: Get user by userId
        const { data: userData } = await axios.get(
          `http://localhost:5000/api/v1/subscription/${dummyUserId}`
        );
        setUser(userData);  // Store user data in state

        // Step 2: If user is found, check subscription and confirm payment
        if (userData) {
          const { data: subscription } = await axios.get(
            `http://localhost:5000/api/v1/subscription/${dummyUserId}`
          );

          // Ensure that subscription data exists and matches
          if (subscription) {
            // Assuming sessionId or other relevant data is inside subscription
            const sessionId = subscription.sessionId; // Use the correct field

            // Step 3: Confirm payment if subscription exists and sessionId matches
            await axios.post('http://localhost:5000/api/v1/payment-success', {
              sessionId,
              userId: dummyUserId,
            });
            setSubscriptionConfirmed(true);
          } else {
            console.error('Subscription not found or session ID mismatch');
          }
        }
      } catch (error) {
        console.error('Error retrieving user or subscription:', error);
      }
    };

    getUserAndConfirmPayment();
  }, []);

  return (
    <div className="text-center">
      {subscriptionConfirmed ? (
        <>
          <h2 className="text-2xl font-bold">Payment Successful!</h2>
          <p className="mt-2">Thank you for subscribing!</p>
        </>
      ) : (
        <p>Loading subscription and user details...</p>
      )}
    </div>
  );
};

export default Success;
