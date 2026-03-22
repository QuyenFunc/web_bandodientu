require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ['embedding-001', 'text-embedding-004', 'models/embedding-001', 'models/text-embedding-004'];
    for (const modelName of models) {
        try {
            console.log(`Testing model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.embedContent('test');
            if (result && result.embedding) {
                console.log(`✅ Model ${modelName} is working!`);
            } else {
                console.log(`❌ Model ${modelName} returned invalid result`);
            }
        } catch (e) {
            console.log(`❌ Model ${modelName} failed: ${e.message}`);
        }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
