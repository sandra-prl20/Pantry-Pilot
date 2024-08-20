// functions/index.js
const functions = require("firebase-functions");
const axios = require("axios");

const groqApiKey = functions.config().groq.api_key;
const groqModel = "Llama3-8b-8192";

exports.getAnswer = functions.https.onCall(async (data, context) => {
  const { contextText, input } = data;
  
  const prompt = `
    Answer the questions based on the provided context only.
    Please provide the most accurate response based on the question.
    <context>
    ${contextText}
    <context>
    Questions: ${input}
  `;
  
  try {
    const response = await axios.post(
      "https://api.groq.com/v1/chat",
      { prompt, model: groqModel },
      {
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    return { answer: response.data.answer };
  } catch (error) {
    console.error("Error fetching answer from Groq API:", error);
    throw new functions.https.HttpsError("internal", "Unable to fetch answer from Groq API.");
  }
});
