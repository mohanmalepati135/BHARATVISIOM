const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    platformName: { type: String, default: 'BharatVision' },
    allowRegistrations: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    contactEmail: { type: String, default: 'research@joshtalks.ai' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
