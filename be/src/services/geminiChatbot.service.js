const axios = require('axios');
const { Product, Category, sequelize } = require('../models');
const { Op } = require('sequelize');
const vectorStoreService = require('./vectorStore.service');

class GeminiChatbotService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = 'google/gemini-2.0-flash-001';
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.initializeChatbot();
  }

  initializeChatbot() {
    try {
      if (this.apiKey && this.apiKey !== 'demo-key') {
        console.info(
          `✅ OpenRouter AI initialized successfully with model: ${this.model} `
        );
      } else {
        console.warn('⚠️  OpenRouter API key not found, using fallback responses');
      }
    } catch (error) {
      console.error(
        '❌ Failed to initialize Chatbot:',
        error.message || error
      );
    }
  }

  /**
   * Main chatbot handler with AI intelligence (RAG Architecture)
   */
  async handleMessage(message, context = {}) {
    try {
      // Step 1: SEARCH Vector Database (Retrieval)
      console.log(`🔍 Searching Vector Store for: "${message}"`);
      let relevantProducts = [];
      try {
        const searchResults = await vectorStoreService.search(message, 10);
        relevantProducts = searchResults.map(res => ({
          ...res.metadata,
          score: res.score
        }));
      } catch (vectorError) {
        console.warn('⚠️ Vector store search failed, falling back to basic products:', vectorError.message);
        relevantProducts = await this.getAllProducts();
        relevantProducts = relevantProducts.slice(0, 10);
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(`📦 Found ${relevantProducts.length} relevant products via RAG`);
      }

      // Step 2: Use AI with ONLY the relevant products (Augmentation & Generation)
      const aiResponse = await this.getAIResponse(
        message,
        relevantProducts,
        context
      );

      return aiResponse;
    } catch (error) {
      console.error('Chatbot error:', error);
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Get AI response using OpenRouter
   */
  async getAIResponse(userMessage, products, context) {
    if (!this.apiKey || this.apiKey === 'demo-key') {
      return this.getFallbackResponse(userMessage);
    }

    try {
      // Create a comprehensive prompt for AI
      const prompt = this.createPrompt(userMessage, products, context);
      if (process.env.NODE_ENV !== 'production') {
        console.log('🤖 Sending request to OpenRouter API (RAG mode)...');
      }

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Bạn là một nhân viên bán hàng chuyên nghiệp, thân thiện và am hiểu của cửa hàng chúng tôi.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey} `,
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'Shopmini E-commerce Chatbot',
            'Content-Type': 'application/json'
          }
        }
      );

      const aiText = response.data.choices[0].message.content;

      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Received response from OpenRouter API');
      }

      // Parse AI response to extract product recommendations
      const parsedResponse = this.parseAIResponse(aiText, products, userMessage);

      return parsedResponse;
    } catch (error) {
      console.error('❌ OpenRouter API error details:', error.response?.data || error.message);

      // Fallback to local keyword matching if AI fails
      return this.simpleKeywordMatch(userMessage, products);
    }
  }

  /**
   * Create comprehensive prompt for AI
   */
  createPrompt(userMessage, products, context) {
    const productList = products
      .map(
        (p) =>
          `- ${p.name} (${p.category || 'Sản phẩm'}): ${p.shortDescription || 'Mô tả đang cập nhật'} - Giá: ${p.price?.toLocaleString('vi-VN')} đ - Còn lại: ${p.stockQuantity !== undefined ? p.stockQuantity : (p.inStock ? 'Còn hàng' : 'Hết hàng')}`
      )
      .join('\n');

    return `
Nhiệm vụ của bạn là hỗ trợ khách hàng tìm kiếm sản phẩm, giải đáp thắc mắc và tư vấn bán hàng dựa trên dữ liệu thực tế.

KHẢ NĂNG CỦA BẠN:
1. Tra cứu và gợi ý sản phẩm chính xác từ danh sách được cung cấp.
2. Tư vấn sản phẩm phù hợp với nhu cầu của khách hàng.
3. Giải đáp thắc mắc về giá cả, tình trạng hàng hóa.
4. Trò chuyện tự nhiên, lịch sự như một nhân viên thực thụ.
5. Xử lý các câu hỏi ngoài lề một cách khéo léo, vui vẻ đưa câu chuyện về sản phẩm của cửa hàng.

DANH SÁCH SẢN PHẨM HIỆN CÓ(Dữ liệu thực tế):
${productList}

THÔNG TIN CỬA HÀNG:
- Chính sách: Đổi trả và bảo hành theo quy định của từng sản phẩm.
- Giao hàng: Hỗ trợ giao hàng toàn quốc.
- Hỗ trợ: Luôn sẵn sàng hỗ trợ khách hàng.

TIN NHẮN KHÁCH HÀNG: "${userMessage}"
CONTEXT: ${JSON.stringify(context)}

HƯỚNG DẪN TRẢ LỜI:
- Trả lời bằng tiếng Việt.
- Dựa VIỆC ĐẦU TIÊN là tìm kiếm trong "DANH SÁCH SẢN PHẨM HIỆN CÓ" để trả lời.
- Tuyệt đối KHÔNG ĐƯỢC tự ý bịa ra tên sản phẩm, thông số hoặc giá bán nếu không có trong danh sách được cung cấp ở trên. Sự trung thực về dữ liệu là ưu tiên số 1.
- Nếu khách hỏi sản phẩm có trong danh sách: Giới thiệu chi tiết, giá bán và ưu điểm (có thể liệt kê nhiều sản phẩm phù hợp).
- Nếu khách hỏi sản phẩm KHÔNG có: Xin lỗi lịch sự, khẳng định cửa hàng hiện chưa có mẫu đó và gợi ý các sản phẩm tương tự đang có sẵn trong danh sách.
- Luôn xưng hô là "mình" hoặc "em" và gọi khách là "bạn" hoặc "anh/chị" tùy ngữ cảnh.
- Trả lời ngắn gọn, súc tích, đi thẳng vào vấn đề nhưng vẫn giữ thái độ niềm nở.

Hãy trả lời THEO ĐÚNG ĐỊNH DẠNG JSON SAU:
{
  "response": "Câu trả lời chi tiết, thân thiện của nhân viên bán hàng (dùng emoji phù hợp)",
    "matchedProducts": ["tên sản phẩm 1", "tên sản phẩm 2"(chỉ liệt kê nếu có trong danh sách cung cấp)],
      "suggestions": ["Câu trả lời mẫu 1", "Câu trả lời mẫu 2"(Các câu ngắn gọn người dùng có thể chọn để trả lời bạn.VD: "Gaming", "Văn phòng", "Dưới 20 triệu".LƯU Ý: Đây là gợi ý cho Người dùng nói, KHÔNG phải câu hỏi của AI)],
        "intent": "product_search|pricing|policy|support|complaint|general|off_topic"
}
`;
  }

  /**
   * Parse AI response and match with actual products
   */
  parseAIResponse(aiText, products, userMessage) {
    try {
      // Try to parse JSON response from AI
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Find actual product objects based on AI recommendations
        const matchedProducts = [];
        if (parsed.matchedProducts && Array.isArray(parsed.matchedProducts)) {
          parsed.matchedProducts.forEach((productName) => {
            const product = products.find(
              (p) =>
                p.name.toLowerCase().includes(productName.toLowerCase()) ||
                productName.toLowerCase().includes(p.name.toLowerCase())
            );
            if (product) {
              matchedProducts.push({
                id: product.id,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                thumbnail: product.thumbnail,
                inStock: product.inStock !== undefined ? product.inStock : true, // Default to true if not specified
                stockQuantity: product.stockQuantity,
                rating: 4.5, // Default rating as most products don't have it yet
              });
            }
          });
        }

        return {
          response:
            parsed.response || 'Tôi có thể giúp bạn tìm sản phẩm phù hợp!',
          products: matchedProducts,
          suggestions: parsed.suggestions || [
            'Xem tất cả sản phẩm',
            'Sản phẩm khuyến mãi',
            'Hỗ trợ mua hàng',
            'Liên hệ tư vấn',
          ],
          intent: parsed.intent || 'general',
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error.message || error);
    }

    // Fallback: simple keyword matching
    return this.simpleKeywordMatch(userMessage, products);
  }

  /**
   * Simple keyword matching fallback
   */
  simpleKeywordMatch(userMessage, products) {
    const lowerMessage = userMessage.toLowerCase().trim();
    let matchedProducts = [];

    // Extract search terms from user message
    const searchTerms = lowerMessage
      .split(' ')
      .filter((term) => term.length > 2); // Filter short words
    searchTerms.push(lowerMessage);

    // Search through products
    products.forEach((product) => {
      let matchScore = 0;
      const productName = product.name?.toLowerCase() || '';
      const productDesc = product.shortDescription?.toLowerCase() || '';

      // Direct match
      searchTerms.forEach((term) => {
        if (productName.includes(term)) {
          matchScore += 10;
        }
        if (productDesc.includes(term)) {
          matchScore += 5;
        }
      });

      if (matchScore > 0) {
        matchedProducts.push({ ...product, matchScore });
      }
    });

    // Sort by score
    matchedProducts.sort((a, b) => b.matchScore - a.matchScore);

    // Unique
    const uniqueProducts = matchedProducts.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.id === product.id)
    );

    if (uniqueProducts.length > 0) {
      const topProducts = uniqueProducts.slice(0, 5);
      const productList = topProducts
        .map((p) => `• ${p.name} - ${p.price?.toLocaleString('vi-VN')} đ`)
        .join('\n');

      return {
        response: `🔍 Mình tìm thấy một số sản phẩm phù hợp với yêu cầu của bạn nè: \n\n${productList} \n\nBạn muốn xem kỹ hơn sản phẩm nào không ? `,
        products: topProducts.slice(0, 3).map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          thumbnail: product.thumbnail,
          inStock: product.inStock,
          rating: 4.5,
        })),
        suggestions: [
          'Xem chi tiết',
          'Sản phẩm khác',
          'Tư vấn thêm',
        ],
        intent: 'product_search',
      };
    }

    // Check for "new products" intent
    if (
      lowerMessage.includes('sản phẩm mới') ||
      lowerMessage.includes('hàng mới') ||
      lowerMessage.includes('mới nhất') ||
      lowerMessage.includes('new')
    ) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Identified "new products" intent');
      }

      const newProducts = products.slice(0, 5); // Assuming products are already sorted by createdAt DESC

      const productList = newProducts
        .map((p) => `• ${p.name} - ${p.price?.toLocaleString('vi-VN')} đ`)
        .join('\n');

      return {
        response: `🌟 Đây là những sản phẩm mới nhất vừa cập bến cửa hàng mình nè: \n\n${productList} \n\nBạn ưng ý mẫu nào không ? `,
        products: newProducts.slice(0, 3).map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          thumbnail: product.thumbnail,
          inStock: product.inStock,
          rating: 4.5,
        })),
        suggestions: [
          'Xem chi tiết',
          'Sản phẩm khuyến mãi',
          'Tư vấn thêm',
        ],
        intent: 'product_search',
      };
    }

    return this.getFallbackResponse(userMessage);
  }

  /**
   * Get all products from database (for fallback)
   */
  async getAllProducts() {
    try {
      const products = await Product.findAll({
        where: {
          status: 'active',
          inStock: true,
        },
        include: [
          {
            model: Category,
            attributes: ['name'],
            as: 'categories', // Correct alias matching model definition
          },
        ],
        attributes: [
          'id',
          'name',
          'shortDescription',
          'description',
          'price',
          'compareAtPrice',
          'thumbnail',
          'inStock',
          'searchKeywords',
          'createdAt',
        ],
        limit: 100,
        order: [['createdAt', 'DESC']],
      });

      return products.map((p) => p.toJSON());
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  /**
   * Enhanced fallback response for various scenarios
   */
  getFallbackResponse(userMessage) {
    return {
      response:
        'Chào bạn! Mình là nhân viên hỗ trợ của cửa hàng. Mình có thể giúp gì cho bạn hôm nay? Bạn đang tìm kiếm sản phẩm nào hay cần tư vấn gì không nè? 😊',
      suggestions: [
        'Xem sản phẩm mới',
        'Sản phẩm khuyến mãi',
        'Hỗ trợ mua hàng',
        'Tư vấn sản phẩm',
      ],
      intent: 'general',
    };
  }
}

module.exports = new GeminiChatbotService();
