const C = {
  HF: 'YOUR_HUGGINGFACE_TOKEN',
  IG: 'YOUR INSTAGRAM_BUSINESS_ACCOUNT',
  FB: 'YOUR FACEBOOK TOKEN ID'
};



// Switching to the highly stable DeepSeek-V3 model
const MODEL_ID = "deepseek-ai/DeepSeek-V3";

// We can safely use the standard HF router now, 
// as V3 is fully recognized as a chat model by the Hub
const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions"; 

/**
 * 1. Researches a trending topic using DeepSeek-V3.
 */
function getDeepSeekResearch(query) {
  const prompt = `Research a specific trending news item for "${query}". Provide a concise one-sentence title.`;

  const payload = {
    model: MODEL_ID,
    messages:[
      { role: "system", content: "You are a tech news researcher." },
      { role: "user", content: prompt }
    ],
    max_tokens: 60
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + C.HF },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(HF_ROUTER_URL, options);
    const json = JSON.parse(response.getContentText());
    if (json.choices && json.choices.length > 0) {
      return json.choices[0].message.content.trim();
    }
    Logger.log("Research API Error: " + response.getContentText());
    return "New JavaScript Features Released";
  } catch (e) {
    Logger.log("Research Exception: " + e.toString());
    return "New JavaScript Features Released";
  }
}

/**
 * 2. Focuses on the LOGO using DeepSeek-V3.
 */
function getDeepSeekVisualPrompt(topic) {
  const prompt = `Topic: "${topic}". Identify the main logo or symbol associated with this tech.
Describe a high-quality, professional 3D render where that specific LOGO is the central focus.
The logo should be made of premium materials like glowing glass or neon.
STRICTLY NO TEXT, NO LETTERS. Just the visual logo/icon.`;

  const payload = {
    model: MODEL_ID,
    messages:[
      { role: "system", content: "You are a professional graphic designer." },
      { role: "user", content: prompt }
    ],
    max_tokens: 120
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + C.HF },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(HF_ROUTER_URL, options);
    const json = JSON.parse(response.getContentText());
    if (json.choices && json.choices.length > 0) {
      return json.choices[0].message.content.trim();
    }
    Logger.log("Visual Prompt API Error: " + response.getContentText());
    return "The iconic yellow JavaScript logo shield, 3D glass render, 8k resolution.";
  } catch (e) {
    Logger.log("Visual Prompt Exception: " + e.toString());
    return "The iconic yellow JavaScript logo shield, 3D glass render, 8k resolution.";
  }
}

/**
 * 3. Generates the Instagram caption using DeepSeek-V3.
 */
function getDeepSeekDescription(topic) {
  const prompt = `Topic: "${topic}". Write a professional Instagram caption explaining why this is important. Use emojis and 5 hashtags.`;

  const payload = {
    model: MODEL_ID,
    messages:[
      { role: "system", content: "You are an expert tech influencer." },
      { role: "user", content: prompt }
    ]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + C.HF },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(HF_ROUTER_URL, options);
    const resText = response.getContentText();
    const json = JSON.parse(resText);
    
    if (json.choices && json.choices.length > 0 && json.choices[0].message) {
      return json.choices[0].message.content;
    } else {
      Logger.log("Description API Error: " + resText);
      return `Exciting news about ${topic}! 🚀 #TechNews #Coding #Developer #Innovation #Software`;
    }
  } catch (e) {
    Logger.log("Description Exception: " + e.toString());
    return `Updates in ${topic}! 💻 #Tech #Programming #CodingLife #WebDev #TechTrends`;
  }
}

/**
 * Main function to run the process.
 */
function run() {
  const queries =['JavaScript coding news 2026', 'Python programming updates', 'React framework news', 'Next.js features', 'AI engineering tools'];
  const q = queries[Math.floor(Math.random() * queries.length)];

  // 1. Research Topic
  const researchedTopic = getDeepSeekResearch(q);
  Logger.log("Topic: " + researchedTopic);

  // 2. Get Visual Prompt
  const visualPrompt = getDeepSeekVisualPrompt(researchedTopic);
  Logger.log("Visual Prompt: " + visualPrompt);

  // 3. Generate Image via Pollinations
  const finalImagePrompt = `${visualPrompt}, high-end product photography, masterpiece, 8k, photorealistic, clean composition, no text, no words, no letters.`;
  const freeImgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalImagePrompt)}?width=1080&height=1080&nologo=true&seed=${Date.now()}`;
  Logger.log("Image URL: " + freeImgUrl);

  // 4. Detailed Description
  const detailedDescription = getDeepSeekDescription(researchedTopic);

  // 5. Upload to Instagram
  const igMediaUrl = `https://graph.facebook.com/v21.0/${C.IG}/media`;
  const igMediaResponse = UrlFetchApp.fetch(igMediaUrl, {
    method: 'post',
    payload: {
      image_url: freeImgUrl,
      caption: detailedDescription,
      access_token: C.FB
    },
    muteHttpExceptions: true
  });

  const mediaData = JSON.parse(igMediaResponse.getContentText());
  const mediaId = mediaData.id;

  if (!mediaId) {
    return Logger.log("Upload Error: " + igMediaResponse.getContentText());
  }

  Logger.log("Processing image (waiting 30s)...");
  Utilities.sleep(30000); 

  // 6. Publish
  const igPublishUrl = `https://graph.facebook.com/v21.0/${C.IG}/media_publish`;
  const igPublishResponse = UrlFetchApp.fetch(igPublishUrl, {
    method: 'post',
    payload: {
      creation_id: mediaId,
      access_token: C.FB
    },
    muteHttpExceptions: true
  });

  if (igPublishResponse.getResponseCode() === 200) {
    Logger.log('✅ Success! Posted: ' + researchedTopic);
  } else {
    Logger.log('❌ Failed: ' + igPublishResponse.getContentText());
  }
}
