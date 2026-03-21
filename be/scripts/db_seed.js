const {
  sequelize, Brand, Category, AttributeGroup, AttributeValue, Product, ProductCategory,
  ProductAttribute, ProductAttributeGroup, ProductVariant, ProductSpecification, Collection, ProductCollection,
  News, WarrantyPackage, DiscountCode
} = require('../src/models');

const ADMIN_ID = '5b81697f-ff56-4aa3-bb80-1b3a444e5af5';

const specTemplates = {
  'Điện thoại': [
    { name: 'Màn hình', value: 'LTPO Super Retina XDR OLED, 120Hz' },
    { name: 'Chipset', value: 'Apple A17 Pro / Snapdragon 8 Gen 3' },
    { name: 'RAM', value: '8GB / 12GB' },
    { name: 'Camera sau', value: 'Chính 48MP & Phụ 12MP, 12MP' },
    { name: 'Pin', value: '4.441 mAh, Sạc nhanh 25W' },
    { name: 'Hệ điều hành', value: 'iOS 17 / Android 14' },
  ],
  'Laptop': [
    { name: 'CPU', value: 'Apple M3 Pro / Intel Core i7-13700H' },
    { name: 'RAM', value: '16GB DDR5 / LPDDR5X' },
    { name: 'Ổ cứng', value: '512GB / 1TB SSD NVMe' },
    { name: 'Màn hình', value: '14.2-inch Liquid Retina XDR / OLED 2.8K' },
    { name: 'Card đồ họa', value: 'Apple GPU / RTX 4050' },
    { name: 'Trọng lượng', value: '1.4kg - 1.6kg' },
  ],
  'Máy tính bảng': [
    { name: 'Màn hình', value: '11.0 inches, Liquid Retina IPS LCD, 120Hz' },
    { name: 'Chipset', value: 'Apple M2 / Snapdragon 8 Gen 2' },
    { name: 'RAM', value: '8GB' },
    { name: 'Pin', value: '7538 mAh' },
    { name: 'Tính năng', value: 'Hỗ trợ Apple Pencil / S-Pen' },
  ],
  'Đồng hồ thông minh': [
    { name: 'Màn hình', value: 'Always-On Retina OLED, 2000 nits' },
    { name: 'Pin', value: 'Lên đến 18 giờ / 36 giờ (chế độ tiết kiệm)' },
    { name: 'Chống nước', value: 'IP6X, WR50 (50 mét)' },
    { name: 'Theo dõi sức khỏe', value: 'Nhịp tim, ECG, SpO2, Giấc ngủ' },
  ],
  'Tai nghe': [
    { name: 'Kết nối', value: 'Bluetooth 5.3, Công nghệ LE Audio' },
    { name: 'Chống ồn', value: 'Chống ồn chủ động thích ứng (ANC)' },
    { name: 'Thời lượng pin', value: 'Đến 30 giờ (bật ANC)' },
    { name: 'Kháng nước', value: 'IPX4' },
  ],
  'Phụ kiện': [
    { name: 'Công suất', value: '20W - 65W' },
    { name: 'Cổng kết nối', value: 'USB-C to Lightning / USB-C to USB-C' },
    { name: 'Tính năng', value: 'Sạc nhanh PD, An toàn thông minh' },
    { name: 'Độ dài', value: '1m / 2m' },
  ],
  'Tivi': [
    { name: 'Độ phân giải', value: '4K Ultra HD (3840 x 2160)' },
    { name: 'Tần số quét', value: '120Hz / 144Hz' },
    { name: 'Hệ điều hành', value: 'Google TV / WebOS / Tizen' },
    { name: 'Âm thanh', value: 'Dolby Atmos, 40W' },
    { name: 'Cổng kết nối', value: '4 x HDMI 2.1, 2 x USB' },
  ],
  'Đồng hồ': [
    { name: 'Chất liệu mặt', value: 'Kính Sapphire chống trầy' },
    { name: 'Bộ máy', value: 'Quartz / Automatic (Cơ tự động)' },
    { name: 'Chống nước', value: '10 ATM (100m)' },
    { name: 'Chất liệu dây', value: 'Thép không gỉ 316L / Da cao cấp' },
  ],
};

const categoryAttributeSets = {
  'Điện thoại': [
    { name: 'Màu sắc', type: 'color', values: [
      { name: 'Đen', value: 'Black', colorCode: '#000000', adjustment: 0 },
      { name: 'Trắng', value: 'White', colorCode: '#FFFFFF', adjustment: 0 },
      { name: 'Bạc', value: 'Silver', colorCode: '#C0C0C0', adjustment: 500000 }
    ]},
    { name: 'Dung lượng', type: 'size', values: [
      { name: '128GB', value: '128GB', adjustment: 0 },
      { name: '256GB', value: '256GB', adjustment: 2000000 },
      { name: '512GB', value: '512GB', adjustment: 5000000 }
    ]}
  ],
  'Laptop': [
    { name: 'Màu sắc', type: 'color', values: [
      { name: 'Xám', value: 'Gray', colorCode: '#808080', adjustment: 0 },
      { name: 'Bạc', value: 'Silver', colorCode: '#C0C0C0', adjustment: 0 }
    ]},
    { name: 'RAM', type: 'custom', values: [
      { name: '8GB', value: '8GB', adjustment: 0 },
      { name: '16GB', value: '16GB', adjustment: 2500000 },
      { name: '32GB', value: '32GB', adjustment: 6000000 }
    ]}
  ],
  'Phụ kiện': [
    { name: 'Màu sắc', type: 'color', values: [
      { name: 'Đen', value: 'Black', colorCode: '#000000', adjustment: 0 },
      { name: 'Trắng', value: 'White', colorCode: '#FFFFFF', adjustment: 0 },
      { name: 'Bạc', value: 'Silver', colorCode: '#C0C0C0', adjustment: 0 }
    ]},
    { name: 'Bộ kèm theo', type: 'custom', values: [
      { name: 'Chỉ sản phẩm', value: 'Only', adjustment: 0 },
      { name: 'Kèm cáp 1m', value: 'Cable1m', adjustment: 150000 },
      { name: 'Kèm cáp 2m', value: 'Cable2m', adjustment: 250000 }
    ]}
  ],
  'Smartwatch': [
    { name: 'Màu sắc', type: 'color', values: [
      { name: 'Đen', value: 'Black', colorCode: '#000000', adjustment: 0 },
      { name: 'Bạc', value: 'Silver', colorCode: '#C0C0C0', adjustment: 0 }
    ]},
    { name: 'Kích thước', type: 'size', values: [
      { name: '40mm', value: '40mm', adjustment: 0 },
      { name: '44mm', value: '44mm', adjustment: 1000000 }
    ]}
  ]
};

async function seed() {
  console.log('--- Bắt đầu Seed dữ liệu TOÀN DIỆN & BIẾN THỂ TỔ HỢP ---');
  const transaction = await sequelize.transaction();

  try {
    // 1. Seed Brands
    const brandNames = ['Apple', 'Samsung', 'Xiaomi', 'Sony', 'Asus', 'Dell', 'HP', 'Garmin', 'LG', 'OPPO', 'Lenovo', 'JBL', 'Anker', 'Baseus', 'Casio', 'Orient', 'Seiko', 'Citizen'];
    const brands = {};
    for (const name of brandNames) {
      const created = await Brand.create({ name, description: `Thương hiệu ${name} chính hãng` }, { transaction });
      brands[name] = created.id;
    }

    // 2. Seed Categories
    const categoryNames = ['Điện thoại', 'Laptop', 'Máy tính bảng', 'Đồng hồ thông minh', 'Tai nghe', 'Phụ kiện', 'Tivi', 'Đồng hồ'];
    const categories = {};
    for (const name of categoryNames) {
      const created = await Category.create({ name, description: `Danh mục ${name}` }, { transaction });
      categories[name] = created.id;
    }

    // 3. Seed Global Attribute Groups & Values for Variant Hooks
    const attrGroups = {};
    const groupMap = {
      'Màu sắc': 'color',
      'Dung lượng': 'storage',
      'RAM': 'config',
      'Kích thước': 'size',
      'Bộ kèm theo': 'custom'
    };

    for (const [gName, gType] of Object.entries(groupMap)) {
      attrGroups[gName] = await AttributeGroup.create({ name: gName, type: gType, isRequired: true }, { transaction });
    }

    const valueMap = {}; // name -> id
    const allValues = [];
    Object.values(categoryAttributeSets).forEach(set => set.forEach(attr => allValues.push(...attr.values.map(v => ({...v, group: attr.name})))));
    
    // Unique values to avoid duplicate creation
    const uniqueValues = [...new Map(allValues.map(item => [item.group + item.name, item])).values()];

    for (const v of uniqueValues) {
      const created = await AttributeValue.create({
        name: v.name,
        value: v.value,
        colorCode: v.colorCode,
        attributeGroupId: attrGroups[v.group].id,
        affectsName: true,
        nameTemplate: v.name,
        priceAdjustment: v.adjustment
      }, { transaction });
      valueMap[v.group + v.name] = created.id;
    }

    // 4. Helper Cartesian Product
    function generateCombinations(attrSet) {
      if (attrSet.length === 0) return [[]];
      const result = [];
      const first = attrSet[0];
      const rest = generateCombinations(attrSet.slice(1));
      for (const val of first.values) {
        for (const r of rest) {
          result.push([{ 
            attrName: first.name, 
            ...val, 
            groupId: attrGroups[first.name].id,
            valueId: valueMap[first.name + val.name]
          }, ...r]);
        }
      }
      return result;
    }

    // 5. Helper Create Product
    async function createP(data) {
      // Chuẩn bị thông số kỹ thuật từ template
      const specs = specTemplates[data.cat] || [];
      const productSpecs = specs.map(s => ({ name: s.name, value: s.value }));

      const product = await Product.create({
        name: data.name, 
        baseName: data.name,
        description: data.desc || data.name, 
        shortDescription: data.short || data.name,
        price: data.price, 
        compareAtPrice: data.price * 1.2, 
        inStock: true, 
        stockQuantity: 500,
        status: 'active', 
        featured: data.featured || false, 
        brandId: brands[data.brand],
        isVariantProduct: true, 
        thumbnail: data.img, 
        images: [data.img, data.img], // Pass as array, setter will stringify
        specifications: productSpecs, // Pass as array, setter will stringify
        searchKeywords: [data.name, data.brand, data.cat]
      }, { transaction });

      // Nạp vào bảng ProductSpecification (đây là bảng riêng, nạp từng dòng)
      for (const [idx, s] of specs.entries()) {
        await ProductSpecification.create({
          productId: product.id,
          name: s.name,
          value: s.value,
          category: 'Cấu hình chi tiết',
          sortOrder: idx
        }, { transaction });
      }

      await ProductCategory.create({ productId: product.id, categoryId: categories[data.cat] }, { transaction });
      
      const attrSet = categoryAttributeSets[data.cat] || [];
      
      // Nạp ProductAttribute cho FE selection
      for (const attr of attrSet) {
        const validTypes = ['color', 'size', 'material', 'custom'];
        await ProductAttribute.create({
          productId: product.id,
          name: attr.name,
          type: validTypes.includes(attr.type) ? attr.type : 'custom',
          values: attr.values.map(v => v.name),
          required: true
        }, { transaction });
        
        // Cũng nạp vào ProductAttributeGroup cho BE relation
        await ProductAttributeGroup.create({
          productId: product.id,
          attributeGroupId: attrGroups[attr.name].id
        }, { transaction });
      }

      // Tạo tổ hợp biến thể
      const combinations = generateCombinations(attrSet);
      
      for (const [idx, combo] of combinations.entries()) {
        const variantPrice = data.price + combo.reduce((sum, v) => sum + v.adjustment, 0);
        const comboNames = combo.map(v => v.name);
        const attributesJson = {};
        const attributeValuesJson = {};
        
        combo.forEach(v => {
          attributesJson[v.attrName] = v.name;
          attributeValuesJson[v.attrName.toLowerCase() + 'Id'] = v.valueId; // key style used in some parts
          attributeValuesJson[v.groupId] = v.valueId; // key style used in other parts
        });

        await ProductVariant.create({
          productId: product.id,
          name: `${data.name} ${comboNames.join(' ')}`,
          displayName: comboNames.join(' '),
          sku: `${data.sku}-${comboNames.join('-')}`.toUpperCase(),
          price: variantPrice,
          compareAtPrice: variantPrice * 1.1,
          stockQuantity: 100,
          isDefault: idx === 0,
          attributes: attributesJson, // JSON field, pass object
          attributeValues: attributeValuesJson, // JSON field, pass object
          isAvailable: true,
          images: [data.img] // JSON field, pass array
        }, { transaction });
      }
      
      return product;
    }

    // 6. Seed Products (Lấy mẫu đa dạng)
    console.log('Đang nạp sản phẩm mẫu...');
    
    // --- DIEN THOAI (10) ---
    const phoneBase = [
      { name: 'iPhone 15 Pro Max', brand: 'Apple', price: 29990000, sku: 'IP15PM', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d256e' },
      { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', price: 26990000, sku: 'S24U', img: 'https://images.unsplash.com/photo-1610945415295-d9baf0602165' },
      { name: 'Xiaomi 14 Ultra', brand: 'Xiaomi', price: 21990000, sku: 'XM14U', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9' },
      { name: 'OPPO Find X7 Ultra', brand: 'OPPO', price: 19990000, sku: 'OPX7U', img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd' },
      { name: 'iPhone 15', brand: 'Apple', price: 19990000, sku: 'IP15', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d256e' },
      { name: 'Samsung A55', brand: 'Samsung', price: 9990000, sku: 'A55', img: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f' },
      { name: 'Xiaomi Redmi Note 13', brand: 'Xiaomi', price: 5990000, sku: 'RN13', img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97' },
      { name: 'OPPO Reno11', brand: 'OPPO', price: 10990000, sku: 'RN11', img: 'https://images.unsplash.com/photo-1565849906461-0e443ba2e163' },
      { name: 'iPhone 13', brand: 'Apple', price: 13990000, sku: 'IP13', img: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179' },
      { name: 'Samsung Galaxy Z Fold5', brand: 'Samsung', price: 34990000, sku: 'ZFOLD5', img: 'https://images.unsplash.com/photo-1610945415295-d9baf0602165' },
    ];
    for (const p of phoneBase) await createP({ ...p, cat: 'Điện thoại' });

    // --- LAPTOP (10) ---
    const laptopBase = [
      { name: 'MacBook Pro M3 14', brand: 'Apple', price: 39990000, sku: 'MBPM3', img: 'https://images.unsplash.com/photo-1517336714460-457885b30052' },
      { name: 'Dell XPS 13 Plus', brand: 'Dell', price: 35990000, sku: 'XPS13P', img: 'https://images.unsplash.com/photo-1593642632823-8f785bc67251' },
      { name: 'Asus ROG Zephyrus G14', brand: 'Asus', price: 32990000, sku: 'G14', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302' },
      { name: 'HP Spectre x360', brand: 'HP', price: 31990000, sku: 'SPEC360', img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef' },
      { name: 'Lenovo Legion 5 Pro', brand: 'Lenovo', price: 28990000, sku: 'L5PRO', img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed' },
      { name: 'MSI Katana 15', brand: 'Asus', price: 22990000, sku: 'MSIK15', img: 'https://images.unsplash.com/photo-1591760972221-311217c3bec2' },
      { name: 'MacBook Air M2', brand: 'Apple', price: 24990000, sku: 'MBAM2', img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9' },
      { name: 'Dell Inspiron 15', brand: 'Dell', price: 15990000, sku: 'INS15', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853' },
      { name: 'HP Pavilion 14', brand: 'HP', price: 16990000, sku: 'PAV14', img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8' },
      { name: 'Asus Vivobook 15', brand: 'Asus', price: 14990000, sku: 'VIVO15', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853' },
    ];
    for (const p of laptopBase) await createP({ ...p, cat: 'Laptop' });

    // --- PHU KIEN (10) ---
    const accBase = [
      { name: 'Anker PowerCore Slim 20000 PD', brand: 'Anker', price: 1200000, sku: 'AK-SLIM', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0' },
      { name: 'Sạc Samsung 45W Type-C', brand: 'Samsung', price: 450000, sku: 'SS-45W', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0' },
      { name: 'Cáp Apple USB-C 1m', brand: 'Apple', price: 590000, sku: 'AP-C1M', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0' },
      { name: 'Sạc Sony Quick Charge', brand: 'Sony', price: 850000, sku: 'SN-QC', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0' },
      { name: 'Pin dự phòng Xiaomi 10000mAh', brand: 'Xiaomi', price: 400000, sku: 'XM-PB', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0' },
      { name: 'OtterBox iPhone 15 Case', brand: 'Apple', price: 990000, sku: 'OB-CASE', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0' },
      { name: 'Chuột Logitech MX Master 3', brand: 'Asus', price: 2500000, sku: 'LG-MX3', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0' },
      { name: 'Bàn phím cơ Keychron K2', brand: 'Asus', price: 1800000, sku: 'KC-K2', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0' },
      { name: 'Củ sạc Anker 65W GaN', brand: 'Anker', price: 1100000, sku: 'AK-65W', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0' },
      { name: 'Lót chuột Razer Goliathus', brand: 'Sony', price: 500000, sku: 'RZ-PAD', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0' },
    ];
    for (const p of accBase) await createP({ ...p, cat: 'Phụ kiện' });

    // --- SMARTWATCH (10) ---
    const watchBase = [
      { name: 'Apple Watch Series 9', brand: 'Apple', price: 10490000, sku: 'AW9', img: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882' },
      { name: 'Galaxy Watch6 Classic', brand: 'Samsung', price: 8490000, sku: 'GW6', img: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882' },
      { name: 'Garmin Fenix 7 Pro', brand: 'Garmin', price: 18990000, sku: 'GF7', img: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882' },
      { name: 'Apple Watch Ultra 2', brand: 'Apple', price: 21990000, sku: 'AWU2', img: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882' },
      { name: 'Xiaomi Watch S3', brand: 'Xiaomi', price: 3490000, sku: 'XW-S3', img: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882' },
      { name: 'Huawei Watch GT 4', brand: 'Samsung', price: 5990000, sku: 'HW-GT4', img: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882' },
      { name: 'Garmin Forerunner 965', brand: 'Garmin', price: 14990000, sku: 'GF-965', img: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882' },
      { name: 'Amazfit T-Rex 2', brand: 'Xiaomi', price: 4490000, sku: 'AZ-TR', img: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882' },
      { name: 'Apple Watch SE 2023', brand: 'Apple', price: 6390000, sku: 'AW-SE', img: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882' },
      { name: 'Samsung Galaxy Watch6', brand: 'Samsung', price: 6990000, sku: 'GW6-STD', img: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882' },
    ];
    for (const p of watchBase) await createP({ ...p, cat: 'Đồng hồ thông minh' });

    // Lấp đầy các danh mục khác để đủ số lượng (10 mỗi loại)
    const otherCats = ['Tai nghe', 'Máy tính bảng', 'Tivi', 'Đồng hồ'];
    for (const cat of otherCats) {
      for(let i=0; i<10; i++) {
        const brand = brandNames[Math.floor(Math.random() * brandNames.length)];
        await createP({
          name: `${cat} ${brand} Gen ${i+1}`, brand: brands[brand] ? brand : 'Apple', price: 2000000 * (i+1), cat,
          sku: `${cat.slice(0,2)}${i}`, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        });
      }
    }

    // 7. News, Collections, Warranty, Discount
    console.log('Seed News, Collections, Warranty, Discount...');
    const newsData = Array.from({ length: 5 }).map((_, i) => ({
      title: `Khai trương cửa hàng mới tại TP.HCM #${i+1}`, content: 'Chào mừng quý khách đến với hệ thống cửa hàng mới...',
      slug: `khai-truong-${i+1}`, userId: ADMIN_ID, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
    }));
    await News.bulkCreate(newsData, { transaction });

    const collectionNames = ['Siêu hội Samsung', 'Hệ sinh thái Apple', 'Gaming Laptops'];
    for (const name of collectionNames) {
      const col = await Collection.create({ name, description: `Bộ sưu tập ${name}`, isActive: true }, { transaction });
      const randomProducts = await Product.findAll({ limit: 3, order: sequelize.random() });
      for (const p of randomProducts) await ProductCollection.create({ productId: p.id, collectionId: col.id }, { transaction });
    }

    await WarrantyPackage.bulkCreate([
      { name: 'Bảo hành Standard 12 tháng', durationMonths: 12, price: 0, coverage: 'Lỗi nhà sản xuất', terms: 'Áp dụng toàn quốc', isActive: true },
      { name: 'Bảo hành Gold 24 tháng', durationMonths: 24, price: 1500000, coverage: 'Rơi vỡ, Vào nước', terms: 'Đổi mới trong 30 ngày', isActive: true },
    ], { transaction });

    await DiscountCode.create({ 
      code: 'HELLO2024', type: 'percent', value: 20, minOrderAmount: 0, 
      description: 'Giảm 20% đơn đầu tiên', isActive: true, usageLimit: 100,
      startDate: new Date(), endDate: new Date(Date.now() + 30*24*60*60*1000)
    }, { transaction });

    await transaction.commit();
    console.log('\n--- SEED DỮ LIỆU HOÀN THÀNH ---');
    process.exit(0);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('\nLỖI KHI SEED DỮ LIỆU:');
    console.error('Message:', error.message);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error(`- Field: ${err.path}, Value: ${err.value}, Type: ${err.type}`);
      });
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

seed();
