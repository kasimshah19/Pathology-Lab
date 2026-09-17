import LabSettings from '../models/LabSettings.js';

// @desc    Get lab settings (creates default if none exists)
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    let settings = await LabSettings.findOne();

    if (!settings) {
      settings = await LabSettings.create({});
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching settings",
    });
  }
};

// @desc    Update lab settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const { labName, address, phone, email, logoUrl, reportFooterText } = req.body;

    let settings = await LabSettings.findOne();

    if (!settings) {
      settings = await LabSettings.create({
        labName, address, phone, email, logoUrl, reportFooterText
      });
    } else {
      settings.labName = labName !== undefined ? labName : settings.labName;
      settings.address = address !== undefined ? address : settings.address;
      settings.phone = phone !== undefined ? phone : settings.phone;
      settings.email = email !== undefined ? email : settings.email;
      settings.logoUrl = logoUrl !== undefined ? logoUrl : settings.logoUrl;
      settings.reportFooterText = reportFooterText !== undefined ? reportFooterText : settings.reportFooterText;

      await settings.save();
    }

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating settings",
    });
  }
};
