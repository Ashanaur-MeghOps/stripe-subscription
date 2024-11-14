require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
const Subscription = require('./models/Subscription');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((error) => console.error('MongoDB connection error:', error));

// Define Stripe prices
const [basic, pro, business] = [
  'price_1QKfqvRw2QKYIanT6eXYCMUm', 
  'price_1QKftYRw2QKYIanTZ8gvFye9', 
  'price_1QKh9vRw2QKYIanTjuKN54GW'
];

// Helper function to create Stripe checkout session
const stripeSession = async (plan) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        { price: plan, quantity: 1 },
      ],
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel'
    });
    return session;
  } catch (e) {
    return e;
  }
};

// Create subscription session
app.post('/api/v1/create-subscription-checkout-session', async (req, res) => {
  const { plan, customerId } = req.body;

  console.log("first",req.body)

  let planId = null;
  let planType = '';

  if (plan == 10) {
    planId = basic;
    planType = 'basic';
  } else if (plan == 50) {
    planId = pro;
    planType = 'pro';
  } else if (plan == 100) {
    planId = business;
    planType = 'business';
  }

  try {
    const session = await stripeSession(planId);
    console.log("session",session)
    // Save pending subscription to MongoDB
    const newSubscription = new Subscription({
      userId: customerId, 
      sessionId: session.id,
      planId: planId,
      planType: planType,
      planStartDate: null, // updated after payment
      planEndDate: null, // updated after payment
      planDuration: null // updated after payment
    });
    await newSubscription.save();

    res.json({ session });
  } catch (error) {
    res.send(error);
  }
});

// Handle payment success and update subscription details
app.post('/api/v1/payment-success', async (req, res) => {
  const { sessionId, userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("session",session)
    if (session.payment_status === 'paid') {
      const subscriptionId = session.subscription;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const planId = subscription.plan.id;
      const planType = subscription.plan.amount === 50000 ? 'basic' : 'pro';
      const startDate = moment.unix(subscription.current_period_start).toDate();
      const endDate = moment.unix(subscription.current_period_end).toDate();
      const durationInSeconds = subscription.current_period_end - subscription.current_period_start;
      const durationInDays = moment.duration(durationInSeconds, 'seconds').asDays();

      // Update subscription in MongoDB
      const updated = await Subscription.findOneAndUpdate(
        { userId: userId, sessionId: sessionId },
        {
          planId: planId,
          planType: planType,
          planStartDate: startDate,
          planEndDate: endDate,
          planDuration: durationInDays
        }
      );
      console.log("updated",updated)
      res.json({ message: 'Payment successful' });
    } else {
      res.json({ message: 'Payment failed' });
    }
  } catch (error) {
    res.send(error);
  }
});

// Get subscription details by userId
app.get('/api/v1/subscription/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const subscription = await Subscription.findOne({ userId });
      if (subscription) {
        res.json(subscription);
      } else {
        res.status(404).json({ message: 'Subscription not found for this user.' });
      }
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
