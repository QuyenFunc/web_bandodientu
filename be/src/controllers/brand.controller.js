const { Brand, Product, sequelize } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

// Get all brands
const getAllBrands = async (req, res, next) => {
  try {
    const { isActive, categoryId } = req.query;
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Filter brands by category if categoryId is provided
    if (categoryId) {
      const { ProductCategory } = require('../models');
      // Step 1: Get all product IDs in this category
      const productCategories = await ProductCategory.findAll({
        where: { categoryId },
        attributes: ['productId'],
        raw: true,
      });
      const productIds = productCategories.map((pc) => pc.productId);

      // Step 2: Get unique brand IDs for these products
      const products = await Product.findAll({
        where: {
          id: { [Op.in]: productIds },
          status: 'active',
        },
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('brand_id')), 'brandId']],
        raw: true,
      });

      const brandIds = products.map((p) => p.brandId).filter((id) => !!id);
      where.id = { [Op.in]: brandIds };
    }

    const brands = await Brand.findAll({
      where,
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      status: 'success',
      data: brands,
    });
  } catch (error) {
    next(error);
  }
};

// Get brand by slug
const getBrandBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const brand = await Brand.findOne({
      where: { slug },
    });

    if (!brand) {
      throw new AppError('Không tìm thấy thương hiệu', 404);
    }

    res.status(200).json({
      status: 'success',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// Create brand (Admin)
const createBrand = async (req, res, next) => {
  try {
    const { name, logo, description, website, isActive } = req.body;
    const brand = await Brand.create({
      name,
      logo,
      description,
      website,
      isActive,
    });

    res.status(201).json({
      status: 'success',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// Update brand (Admin)
const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);

    if (!brand) {
      throw new AppError('Không tìm thấy thương hiệu', 404);
    }

    await brand.update(req.body);

    res.status(200).json({
      status: 'success',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// Delete brand (Admin)
const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);

    if (!brand) {
      throw new AppError('Không tìm thấy thương hiệu', 404);
    }

    // Check if brand has products
    const productCount = await Product.count({ where: { brandId: id } });
    if (productCount > 0) {
      throw new AppError('Không thể xóa thương hiệu đang có sản phẩm', 400);
    }

    await brand.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Xóa thương hiệu thành công',
    });
  } catch (error) {
    next(error);
  }
};

// Get products by brand
const getProductsByBrand = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query;

    const brand = await Brand.findOne({ where: { slug } });
    if (!brand) {
      throw new AppError('Không tìm thấy thương hiệu', 404);
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: { brandId: brand.id, status: 'active' },
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sort, order]],
    });

    res.status(200).json({
      status: 'success',
      data: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  getProductsByBrand,
};
