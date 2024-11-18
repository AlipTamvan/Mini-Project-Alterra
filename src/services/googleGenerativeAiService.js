import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI( //Objek ini adalah instance yang mengelola koneksi ke Google Generative AI menggunakan API Key.
  import.meta.env.VITE_GOOGLE_GENERATIVE_AI_KEY
);

const generateContent = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); //Inisialisasi Model
    const result = await model.generateContent(prompt); //Pemanggilan API (Generate Content)
    return result.response.text(); //Mengembalikan Hasil
  } catch (error) {
    console.error("Error calling Google Generative AI API:", error);
    return null;
  }
};

export default generateContent;
