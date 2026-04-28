const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['fire', 'medical', 'security', 'other'],
      required: [true, 'Incident type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['reported', 'in_progress', 'resolved'],
      default: 'reported',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'high',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);
