import mongoose from 'mongoose';

const labSettingsSchema = new mongoose.Schema(
  {
    labName: {
      type: String,
      default: 'XYZ Diagnostic Lab',
    },
    address: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
    },
    reportFooterText: {
      type: String,
      default: 'This is a computer generated report',
    },
  },
  {
    timestamps: true,
  }
);

const LabSettings = mongoose.model('LabSettings', labSettingsSchema);

export default LabSettings;
