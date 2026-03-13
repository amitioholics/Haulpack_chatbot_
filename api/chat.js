const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const HAULPACK_KNOWLEDGE_BASE = `
You are the official HaulPack AI assistant chatbot.

Your job is to answer questions about HaulPack using the knowledge base provided below, but you are also a smart, fully capable AI. You should be conversational and answer general questions about marketing, content creation, social media, and related topics gracefully to be helpful to the user.

Guidelines:
- When answering specific questions about HaulPack's rules, requirements, or features, use ONLY the information from the knowledge base.
- When asked general questions related to our industry (like "what is marketing", "what is a creator", etc.), use your full AI intelligence to answer them helpfully.
- Be clear, helpful, conversational, and friendly.
- Keep answers concise and easy to understand.
- If a user asks a highly specific question about *HaulPack* that isn't in the knowledge base (like specific missing features or account issues), politely tell them to contact HaulPack support at cs@haulpack.com.
- If users ask how to join, always provide the application link: www.haulpack.com/apply

------------------------------------
HAULPACK KNOWLEDGE BASE
------------------------------------

1. What is HaulPack?
HaulPack is an Affiliate Marketing and Influencer Marketing platform where creators monetize their content by promoting products from brands like Myntra, Meesho, Flipkart, Amazon, Ajio, Urbanic and more.
Creators earn commissions when people purchase through their affiliate links. HaulPack also provides whitelisting opportunities to creators who actively create content and share it.

2. How can I earn from HaulPack?
To start earning commissions:
1. Choose a product or multiple products
2. Place an order for the selected products
3. Create a collection by adding these products (affiliate link gets generated automatically)
4. Create and share a video featuring the products
5. Link your reel with your collection
6. Return the product
Whenever someone purchases through your affiliate link, you earn a commission.

3. Who can join HaulPack?
Creators can join HaulPack if they have:
• At least 1,000 Instagram followers  
OR  
• At least 500 YouTube subscribers
If you do not meet the requirements yet, you can apply later once you reach the criteria.
Apply here: www.haulpack.com/apply

4. Does HaulPack offer paid collaborations?
Yes, HaulPack offers paid collaborations based on brand requirements.
However, performance-based affiliate earnings often allow creators to earn more consistently compared to traditional paid deals.
Creators can monetize all their videos through affiliate marketing and increase their income.

5. Difference between Affiliate Marketing and Influencer Marketing
Affiliate Marketing:
Creators promote products using affiliate links and earn commission only when sales happen through their link.
Influencer Marketing:
Brands pay creators for promoting their products. The focus is usually on brand awareness, reach, and engagement rather than direct sales.

6. Partnership and flexibility differences
Influencer Marketing:
Usually short-term campaigns with specific posting requirements from the brand.
Affiliate Marketing:
Often long-term and more flexible. Creators can decide when and how often they want to promote products.

7. Focus of Influencer Marketing vs Affiliate Marketing
Influencer Marketing:
Focuses on brand awareness, reach, and engagement.
Affiliate Marketing:
Focuses on sales and conversions through affiliate links.

8. Can I pick any brand for video creation?
Yes. Creators can choose brands of their choice from the brands available on the HaulPack platform.

9. Where can I check commission rates?
To check commission rates:
1. Log in to HaulPack
2. Go to the "Stores" section
3. View the commission rates listed for each brand

10. Which brands are available on HaulPack?
HaulPack has 50+ brands including:
Amazon, Myntra, Meesho, Flipkart, Ajio, Urbanic and many more.
Apply here if you want to monetize your content:
www.haulpack.com/apply

11. Support
If users still have questions, they can contact HaulPack support.
Support email: cs@haulpack.com
`;

module.exports = async function handler(req, res) {
    // CORS headers for Vercel
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { message, history } = req.body;

        let promptContext = HAULPACK_KNOWLEDGE_BASE + "\\n\\nHere is the recent conversation history:\\n";

        // Add conversation history
        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                promptContext += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
            });
        }

        // Add new user message
        promptContext += `\nUser: ${message}\nAssistant:`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptContext,
            config: {
                temperature: 0.5,
            }
        });

        res.status(200).json({ response: response.text });
    } catch (error) {
        console.error("Error calling Gemini:", error);
        res.status(500).json({ error: "Sorry, I am having trouble connecting to my brain right now. Please try again." });
    }
};
