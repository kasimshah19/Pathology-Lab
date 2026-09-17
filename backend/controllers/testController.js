import Test from '../models/Test.js';

// @desc    Create new test
// @route   POST /api/tests
// @access  Private/Admin
export const createTest = async (req, res) => {
  try {
    const { testName, testCode, category, price, normalRange, unit, sampleType } = req.body;
    
    // Check if testCode already exists
    const testExists = await Test.findOne({ testCode });
    if (testExists) {
      return res.status(400).json({ 
        success: false, 
        message: "Test with this code already exists" 
      });
    }
    
    const test = await Test.create({ 
      testName, 
      testCode, 
      category, 
      price, 
      normalRange, 
      unit, 
      sampleType 
    });
    
    return res.status(201).json({ 
      success: true, 
      message: "Test created successfully", 
      data: test 
    });
  } catch (error) {
    console.error("Create Test Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Server error while creating test" 
    });
  }
};

// @desc    Get all tests
// @route   GET /api/tests
// @access  Private
export const getAllTests = async (req, res) => {
  try {
    const { search, category, includeInactive } = req.query;
    const query = {};
    
    // Only return tests where isActive is true unless includeInactive is passed
    if (includeInactive !== 'true') {
      query.isActive = true;
    }
    
    // Search by testName
    if (search) {
      query.testName = { $regex: search, $options: 'i' };
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Sort by testName alphabetically
    const tests = await Test.find(query).sort({ testName: 1 });
    
    return res.status(200).json({ 
      success: true, 
      message: "Tests retrieved successfully", 
      data: tests 
    });
  } catch (error) {
    console.error("Get All Tests Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while retrieving tests" 
    });
  }
};

// @desc    Get test by ID
// @route   GET /api/tests/:id
// @access  Private
export const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Test retrieved successfully", 
      data: test 
    });
  } catch (error) {
    console.error("Get Test By ID Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while retrieving test" 
    });
  }
};

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Private/Admin
export const updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Test updated successfully", 
      data: test 
    });
  } catch (error) {
    console.error("Update Test Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Server error while updating test" 
    });
  }
};

// @desc    Delete test (Soft Delete)
// @route   DELETE /api/tests/:id
// @access  Private/Admin
export const deleteTest = async (req, res) => {
  try {
    // Instead of actually deleting, set isActive to false
    const test = await Test.findByIdAndUpdate(
      req.params.id, 
      { isActive: false }, 
      { new: true }
    );
    
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Test deactivated successfully" 
    });
  } catch (error) {
    console.error("Delete Test Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while deactivating test" 
    });
  }
};
