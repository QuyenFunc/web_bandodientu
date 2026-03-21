const {
  Product,
  Category,
  Brand,
  ProductAttribute,
  ProductVariant,
  ProductSpecification,
  sequelize,
} = require('../src/models');
const { v4: uuidv4 } = require('uuid');

async function addIPhone() {
  const transaction = await sequelize.transaction();
  try {
    console.log('🚀 Đang thêm sản phẩm iPhone 15 Pro Max...');

    // 1. Đảm bảo Category 'Điện thoại' tồn tại
    let [category] = await Category.findOrCreate({
      where: { name: 'Điện thoại' },
      defaults: {
        slug: 'dien-thoai',
        description: 'Điện thoại thông minh và phụ kiện',
      },
      transaction,
    });

    // 2. Đảm bảo Brand 'Apple' tồn tại
    let [brand] = await Brand.findOrCreate({
      where: { name: 'Apple' },
      defaults: {
        slug: 'apple',
        description: 'Apple Inc. - Designed in California',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
      },
      transaction,
    });

    // 3. Thông tin sản phẩm
    const productData = {
      name: 'iPhone 15 Pro Max',
      shortDescription: 'Chiếc iPhone mạnh mẽ nhất với khung Titan và chip A17 Pro.',
      description: 'iPhone 15 Pro Max với thiết kế khung Titan cấp độ hàng không vũ trụ, chip A17 Pro mang lại hiệu năng chơi game đỉnh cao, hệ thống camera 48MP với khả năng quay video chuyên nghiệp và cổng kết nối USB-C chuẩn USB 3. Nút Tác Vụ mới giúp bạn tùy chỉnh trải nghiệm sử dụng linh hoạt.',
      price: 34990000,
      compareAtPrice: 36990000,
      thumbnail: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&h=400&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1695048133051-71e84fa18d36?w=800&h=800&fit=crop'
      ],
      status: 'active',
      featured: true,
      brandId: brand.id,
      condition: 'new',
      isVariantProduct: true,
      specifications: {
        'Chip': 'Apple A17 Pro (3nm)',
        'Màn hình': '6.7 inch, Super Retina XDR OLED, 120Hz (ProMotion)',
        'Camera sau': '48MP (Chính) + 12MP (Góc siêu rộng) + 12MP (Tele 5x)',
        'Camera trước': '12MP TrueDepth',
        'Pin': '4422 mAh, Sạc nhanh 20W (50% trong 30 phút)',
        'Kết nối': '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C (USB 3.0)',
        'Hệ điều hành': 'iOS 17',
        'Vật liệu': 'Khung Titan mặt sau kính mờ',
        'Trọng lượng': '221g'
      },
      faqs: [
        {
          question: 'Khung Titan của iPhone 15 Pro Max có gì đặc biệt?',
          answer: 'Đây là khung Titan cấp độ hàng không vũ trụ, cùng loại hợp kim được sử dụng cho các tàu vũ trụ trong nhiệm vụ thám hiểm Sao Hỏa. Nó giúp máy cực kỳ bền bỉ nhưng lại nhẹ hơn đáng kể so với các thế hệ trước.'
        },
        {
          question: 'Chip A17 Pro mạnh mẽ như thế nào?',
          answer: 'A17 Pro là chip 3nm đầu tiên trong ngành, mang lại hiệu năng GPU nhanh hơn đến 20% và hỗ trợ Ray Tracing bằng phần cứng, cho phép chơi các tựa game console đỉnh cao ngay trên điện thoại.'
        },
        {
          question: 'Cổng USB-C của máy có hỗ trợ chuyển dữ liệu nhanh không?',
          answer: 'Có, iPhone 15 Pro Max hỗ trợ chuẩn USB 3, cho tốc độ truyền dữ liệu lên đến 10Gbps, nhanh gấp 20 lần so với chuẩn USB 2 trên các mẫu cũ.'
        }
      ]
    };

    // 4. Tạo Product
    const product = await Product.create({
      ...productData,
      sku: `IPHONE15PM-${Date.now()}`,
      baseName: 'iPhone 15 Pro Max'
    }, { transaction });

    // Gắn Category
    await product.setCategories([category], { transaction });

    // 5. Tạo Specifications
    const specs = Object.entries(productData.specifications).map(([name, value], index) => ({
      productId: product.id,
      name,
      value,
      category: 'Thông số kỹ thuật',
      sortOrder: index
    }));
    await ProductSpecification.bulkCreate(specs, { transaction });

    // 6. Tạo Attributes
    const dungLuongAttr = await ProductAttribute.create({
      productId: product.id,
      name: 'Dung lượng',
      values: ['256GB', '512GB', '1TB']
    }, { transaction });

    const mauSacAttr = await ProductAttribute.create({
      productId: product.id,
      name: 'Màu sắc',
      values: ['Titan tự nhiên', 'Titan xanh', 'Titan trắng', 'Titan đen']
    }, { transaction });

    // 7. Tạo Variants
    const variantsData = [
      {
        name: 'iPhone 15 Pro Max 256GB - Titan tự nhiên',
        displayName: '256GB - Titan tự nhiên',
        attributes: { 'Dung lượng': '256GB', 'Màu sắc': 'Titan tự nhiên' },
        price: 34990000,
        stock: 50,
        isDefault: true
      },
      {
        name: 'iPhone 15 Pro Max 512GB - Titan xanh',
        displayName: '512GB - Titan xanh',
        attributes: { 'Dung lượng': '512GB', 'Màu sắc': 'Titan xanh' },
        price: 40990000,
        stock: 30
      },
      {
        name: 'iPhone 15 Pro Max 1TB - Titan trắng',
        displayName: '1TB - Titan trắng',
        attributes: { 'Dung lượng': '1TB', 'Màu sắc': 'Titan trắng' },
        price: 46990000,
        stock: 15
      }
    ];

    for (const v of variantsData) {
      const variantSku = `IP15PM-${v.attributes['Dung lượng']}-${v.attributes['Màu sắc'].replace(/\s+/g, '').toUpperCase()}`;
      await ProductVariant.create({
        productId: product.id,
        name: v.name,
        sku: variantSku,
        attributes: v.attributes,
        price: v.price,
        stockQuantity: v.stock,
        isDefault: v.isDefault || false,
        isAvailable: true,
        displayName: v.displayName
      }, { transaction });
    }

    // Cập nhật tổng stock
    const totalStock = variantsData.reduce((sum, v) => sum + v.stock, 0);
    await product.update({ stockQuantity: totalStock }, { transaction });

    await transaction.commit();
    console.log('✅ Đã thêm iPhone 15 Pro Max thành công!');
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Lỗi khi thêm sản phẩm:', error);
    process.exit(1);
  }
}

addIPhone();
