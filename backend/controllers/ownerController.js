const OwnerService = require('../services/ownerService');

exports.getDashboard = async (req, res, next) => {
  try {
    const dashboardData = await OwnerService.getDashboard(req.user.id);
    
    if (!dashboardData) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No store assigned to this owner yet.'
      });
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};
