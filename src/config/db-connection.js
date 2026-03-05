import { connect } from "mongoose";

export const initMongoDB = async () => {
  try {
    // Usa MONGO_URL_ATLAS si existe (producción), sino MONGO_URL (desarrollo local)
    const mongoUrl = process.env.MONGO_URL_ATLAS || process.env.MONGO_URL;
    await connect(mongoUrl);
    console.log(`✅ MongoDB conectado: ${mongoUrl.includes('mongodb.net') ? 'Atlas' : 'Local'}`);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    throw new Error(error);
  }
};
