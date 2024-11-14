// models/Subscription.js
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  planId: { type: String, required: true },
  planType: { type: String, required: true },
  planStartDate: { type: Date },
  planEndDate: { type: Date },
  planDuration: { type: Number },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
