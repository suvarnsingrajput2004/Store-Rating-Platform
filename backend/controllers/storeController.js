const StoreService = require('../services/storeService');

exports.getStores = async (req, res, next) => {
  try {
    const params = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search || '',
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await StoreService.getStoresForUser(params, req.user.id);
    
    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: result.total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(result.total / params.limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getStoreById = async (req, res, next) => {
  try {
    const store = await StoreService.getStoreById(req.params.id);
    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error) {
    next(error);
  }
};
