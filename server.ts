import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, query, where, limit } from "firebase/firestore";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to detect repetitive loops or low-quality echo patterns while ignoring links and tags
  function hasBadRepetition(text: string): boolean {
    if (!text) return true; // Treat empty as bad to trigger correction
    const trimmed = text.trim();
    if (trimmed.length < 5) return true;

    // Strip markdown links and URLs so they don't trigger repetition flags or screw diversity ratios
    let cleanedText = trimmed.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
    // Strip common structural template nouns to avoid false metrics on list details
    cleanedText = cleanedText.replace(/premium trust certified/gi, "");
    cleanedText = cleanedText.replace(/vetted expert/gi, "");
    cleanedText = cleanedText.replace(/properties/gi, "");
    cleanedText = cleanedText.replace(/professionals/gi, "");

    // 1. Check duplicate consecutive word chains of size 3+ consecutively (e.g. "guri guri guri")
    const consecutiveMatch = cleanedText.match(/\b(\w+)(?:\s+\1){2,}\b/gi);
    if (consecutiveMatch) return true;

    // 2. Check for exact sequential duplicate line patterns
    const lines = cleanedText.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length >= 3) {
      for (let i = 0; i < lines.length - 2; i++) {
        if (lines[i].length > 5 && lines[i] === lines[i+1] && lines[i] === lines[i+2]) {
          return true;
        }
      }
    }

    // 3. Check overall word diversity for medium-long responses, filtering out small structural prepositions (length < 3)
    const words = cleanedText.toLowerCase().match(/\b[a-z]{3,}\b/g);
    if (words && words.length > 15) {
      const uniqueWords = new Set(words);
      const ratio = uniqueWords.size / words.length;
      if (ratio < 0.18) {
        return true;
      }
    }

    return false;
  }

  // Fallback to instantly compile real-time context into magnificent pure Somali or English
  function generateLocalFallback(message: string, contextData: any): string {
    const queryLower = message.toLowerCase();
    
    // Choose beautiful luxury starting message in pure Somali/English instead of robotic intros
    let response = "Kusoo dhawaada AmaanEstate AI Concierge! Waxaan kuu hayaa xogta ugu dambeysay ee ugu tayada sarreysa ee salka ku haysa raadintaada:\n\n";

    const matchesListings: string[] = [];
    const lines = contextData.listingsStr.split("\n");
    for (const line of lines) {
      if (line.toLowerCase().includes("no listings")) continue;
      
      const hasJigjiga = queryLower.includes("jigjiga");
      const hasDhul = queryLower.includes("dhul") || queryLower.includes("land");
      const hasGuri = queryLower.includes("guri") || queryLower.includes("house") || queryLower.includes("apart");
      const hasKiro = queryLower.includes("kiro") || queryLower.includes("rent");
      const hasBaabuur = queryLower.includes("gaari") || queryLower.includes("baabuur") || queryLower.includes("vehicle") || queryLower.includes("car");

      let match = false;
      if (hasJigjiga && line.toLowerCase().includes("jigjiga")) match = true;
      if (hasDhul && (line.toLowerCase().includes("land") || line.toLowerCase().includes("dhul"))) match = true;
      if (hasGuri && (line.toLowerCase().includes("property") || line.toLowerCase().includes("guri") || line.toLowerCase().includes("house"))) match = true;
      if (hasBaabuur && (line.toLowerCase().includes("vehicle") || line.toLowerCase().includes("gaari") || line.toLowerCase().includes("car"))) match = true;

      if (!match && (queryLower.length < 5 || line.toLowerCase().includes("featured") || line.toLowerCase().includes("verified"))) {
        match = true;
      }

      if (match) {
        const idMatch = line.match(/ID:\s*([^\s|]+)/);
        const titleMatch = line.match(/Title:\s*([^|]+)/);
        const priceMatch = line.match(/Price:\s*([^|]+)/);
        const cityMatch = line.match(/City:\s*([^|]+)/);
        const catMatch = line.match(/Cat:\s*([^|]+)/);

        if (idMatch && titleMatch) {
          const id = idMatch[1].trim();
          const title = titleMatch[1].trim();
          const price = priceMatch ? priceMatch[1].trim() : "";
          const city = cityMatch ? cityMatch[1].trim() : "";
          const cat = catMatch ? catMatch[1].trim() : "property";
          const path = cat === "vehicle" ? `/vehicles/${id}` : `/properties/${id}`;
          matchesListings.push(`🏠 **[${title}](${path})** - Qiimaha: $${price} oo ku yaal ${city} (Premium Trust Certified)`);
        }
      }
    }

    if (matchesListings.length > 0) {
      response += "Waxaan kuu helay hantidan tooska ah oo aad u xiiseyn karto:\n" + matchesListings.slice(0, 4).join("\n") + "\n\n";
    } else {
      response += "Fadlan kaga bogo dhamaan guryaha iyo dhulka tooska ah adoo gujinaya halkan: [Kala dooro Guryaha](/properties).\n\n";
    }

    const matchesPros: string[] = [];
    const proLines = contextData.prosStr.split("\n");
    for (const line of proLines) {
      if (line.toLowerCase().includes("no certified")) continue;
      const hasProQuery = queryLower.includes("electric") || queryLower.includes("engineer") || queryLower.includes("koronto") || queryLower.includes("farsamo") || queryLower.includes("pro") || queryLower.includes("adaal");
      if (hasProQuery || line.toLowerCase().includes("certified")) {
        const nameMatch = line.match(/Name:\s*([^|]+)/);
        const titleMatch = line.match(/Service Title:\s*([^|]+)/);
        const providerIdMatch = line.match(/ID\/ProviderID:\s*([^\s(]+)/);
        if (nameMatch && titleMatch) {
          const name = nameMatch[1].trim();
          const title = titleMatch[1].trim();
          const pId = providerIdMatch ? providerIdMatch[1].trim() : "list";
          matchesPros.push(`🛠️ **[Madaale ${name} - ${title}](/professionals/${pId})** (Premium Vetted Expert)`);
        }
      }
    }

    if (matchesPros.length > 0) {
      response += "Sidoo kale, waxaan haynaa madaaliyiin iyo khubaro la aqoonsaday oo diyaar kuugu ah:\n" + matchesPros.slice(0, 3).join("\n") + "\n\n";
    } else {
      response += "Waxaad sidoo kale raadsan kartaa khubaradayada halkan: [Madaaliyiinta certified-ka ah](/services).\n\n";
    }

    response += "Waxaan diyaar u nahay inaan kugu caawino talo iyo guryo heersare ah wakhti kasta!";
    return response;
  }

  // API Routes go here FIRST
  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let contextData = {
      listingsStr: "No listings active.",
      prosStr: "No certified professionals active.",
      articlesStr: "No news articles active."
    };

    // Load database context
    try {
      contextData = await fetchDatabaseContext();
    } catch (dbErr) {
      console.error("Error pre-fetching firestore context:", dbErr);
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      console.warn("Gemini client initialization failed (API key may be missing). Using real-time local compiler fallback:", err.message);
      const fallbackText = generateLocalFallback(message, contextData);
      return res.json({ text: fallbackText + "\n\n*(Ogaysiis: Furaha API key hadda lama helin. Waxaa laguu soo bandhigay buug-hagaha tooska ah ee madaalkeena)*" });
    }

    try {
      const systemInstruction = `You are the AmaanEstate AI Concierge, a prestigious, luxury multilingual real estate advisor and professional services concierge for the Somali Region.
Your primary objective is to dynamically assist users in discovering authentic, certified, active properties, rentals, vehicles, or top experts directly fetched from our live Firestore database.

--- LIVE CONTEXT DATA (DO NOT HALLUCINATE ITEMS BEYOND THIS LIST) ---
DATABASE LIQUID ASSETS (PROPERTIES / LAND / RENTALS / VEHICLES):
${contextData.listingsStr}

CERTIFIED ACTIVE REGISTERED PROFESSIONALS (EXPERTS / SERVICES):
${contextData.prosStr}

LATEST PORTAL INTEL & ARTICLES:
${contextData.articlesStr}
----------------------------------

--- LIVE DYNAMIC FILTERING & RELEVANCY RULE ---
Act as a premium directory index filter and a world-class luxury search concierge (like Zillow or Bayut AI).
- Retrieve ONLY matching listings based on user search criteria (location e.g. Jigjiga, listing category e.g. land/house, or rent vs sell intent).
- Do NOT output unrelated properties. Never dump the raw database if a user specifies a filters.
- If there are no listings matching their specific query (e.g. they wanted a vehicle in Hargeisa but none is active above), explain this elegantly in Somali or English, and suggest alternative active listings or invite them to browse all listings at /properties.

AI STYLE & MULTILINGUAL GRAMMAR RULES:
1. PURE SOMALI LANGUAGE PREFERENCE (SOMAALI PURE):
   When the user communicates in Somali, you MUST respond in elegant, natural, fluent, and professional Somali.
   Avoid word repetitions or empty conversational loops. Speak in beautiful, complete Somali sentences.
2. HYBRID MULTILINGUAL & ENGLISH SUPPORT:
   If the user queries in English or uses mixed Somali-English, adapt gracefully. Respond elegantly matching their tone.
3. CONVENIENT MARKDOWN LINKS:
   Always structure listings/pros with exact relative links using standard markdown! Example: "[Title](/properties/[id]) - Qiimaha: $500". Never fabricate links.
   - For Properties: /properties/[id]
   - For Vehicles: /vehicles/[id]
   - For Pros/Experts: /professionals/[providerId] or /services
   - For Articles: /news/[id]
4. FORBID REPETITION:
   Under no circumstances generate consecutive repetitive phrases or duplicate chunks. Keep it concise, luxury, and premium.`;

      // Sanitise history to prevent feeding loop turns back to Gemini!
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          if (turn.text && !hasBadRepetition(turn.text)) {
            contents.push({
              role: turn.role === "user" ? "user" : "model",
              parts: [{ text: turn.text }]
            });
          }
        }
      }
      
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Helper to execute generation with a strict 9.5-second timeout protection and fallback model resiliency
      const generateWithTimeout = async (contentsList: any[], temp: number) => {
        const invokeApi = async () => {
          try {
            return await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: contentsList,
              config: {
                systemInstruction,
                temperature: temp,
              }
            });
          } catch (modelErr: any) {
            console.warn("Primary model gemini-2.5-flash failed or was throttled, trying basic fallback model gemini-3-flash-preview:", modelErr.message);
            return await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: contentsList,
              config: {
                systemInstruction,
                temperature: temp,
              }
            });
          }
        };

        return Promise.race([
          invokeApi(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("API timeout after 9.5 seconds - triggering luxury compiler fallback")), 9500))
        ]);
      };

      // Try 1: Balanced temperature first (0.6) for fluent but governed output
      let response = await generateWithTimeout(contents, 0.6);

      let finalResponseText = response.text || "";

      // Check for repetition loop or low quality
      if (hasBadRepetition(finalResponseText)) {
        console.warn("Repetition or low quality detected in Try 1. Triggering Corrective Self-Healing Try 2...");
        
        // Try 2: Self-healing request with high temperature
        const healingContents = [
          ...contents,
          {
            role: "model",
            parts: [{ text: finalResponseText || "Ciwaankaygu waa diyaar..." }]
          },
          {
            role: "user",
            parts: [{ text: "Fadlan dib u qor jawaabta kor ku xusan adigoo adeegsanaya af-soomaali dabiici ah oo saafi ah, ha sameyn wax ku celcelis ah haba yaraatee." }]
          }
        ];

        try {
          const healingResponse = await generateWithTimeout(healingContents, 0.82);
          
          if (healingResponse.text && !hasBadRepetition(healingResponse.text)) {
            finalResponseText = healingResponse.text;
          } else {
            console.warn("Try 2 failed quality inspection. Invoking real-time database local compiler fallback...");
            finalResponseText = generateLocalFallback(message, contextData);
          }
        } catch (healErr) {
          console.error("Self-healing model error:", healErr);
          finalResponseText = generateLocalFallback(message, contextData);
        }
      }

      res.json({ text: finalResponseText });
    } catch (error: any) {
      const errMsg = error.message || "Unknown API issue";
      const cleanedMsg = errMsg.replace(/AIzaSy[A-Za-z0-9_\-]{33}/g, "[REDACTED_API_KEY]");
      console.error("AI Assistant API error gracefully handled:", cleanedMsg);

      let customerNotice = "";
      if (cleanedMsg.toLowerCase().includes("timeout")) {
        customerNotice = "\n\n*(Fadlan ogow: Adeegga AI wuxuu qaatay waqti ka badan intii loogu talagalay. Halkan waxaa lagugu soo bandhigay hantida tooska ah ee la xaqiijiyay)*";
      } else if (cleanedMsg.toLowerCase().includes("api key") || cleanedMsg.toLowerCase().includes("authorized") || cleanedMsg.toLowerCase().includes("not found")) {
        customerNotice = "\n\n*(Fadlan ogow: Furaha geliye ee API-ga ayaa u baahan in lagu xaqiijiyo Settings. Waxaan halkan kuugu diyaarinay xogta saxda ah ee tooska ah)*";
      } else if (cleanedMsg.toLowerCase().includes("quota") || cleanedMsg.toLowerCase().includes("exhausted") || cleanedMsg.toLowerCase().includes("limit") || cleanedMsg.includes("429")) {
        customerNotice = "\n\n*(Fadlan ogow: Adeegga AI wuxuu gaaray xaddiga ugu sarreeya ee codsiyada. Waxaan halkan kuugu diyaarinay xogta saxda ah ee tooska ah)*";
      }

      try {
        const fallbackText = generateLocalFallback(message, contextData);
        res.json({ text: fallbackText + customerNotice });
      } catch (innerErr) {
        res.status(500).json({ error: "Unable to process message stream safely context" });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Initialize Gemini Client Lazily using secure system variable
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please go to Settings > Secrets to configure it.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Initialize Firebase client for backend
let db: any = null;
function getDb() {
  if (!db) {
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (!fs.existsSync(configPath)) {
        console.warn("firebase-applet-config.json not found. Database features will be mocked.");
        return null;
      }
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const app = initializeApp(firebaseConfig);
      db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
      }, (firebaseConfig as any).firestoreDatabaseId);
    } catch (err) {
      console.error("Failed to initialize Firebase in server:", err);
      return null;
    }
  }
  return db;
}

// Fetch and compile database context in real-time
async function fetchDatabaseContext() {
  const firestoreDb = getDb();
  if (!firestoreDb) {
    return {
      listingsStr: "No active listings database connection.",
      prosStr: "No certified professional registry database connection.",
      articlesStr: "No news intelligence database connection."
    };
  }

  let listingsStr = "No listings active.";
  let prosStr = "No certified professionals active.";
  let articlesStr = "No news articles active.";

  try {
    // 1. Get Listings
    const listRef = collection(firestoreDb, "listings");
    const listingsQ = query(listRef, where("status", "==", "active"), limit(50));
    const listingsSnap = await getDocs(listingsQ);
    if (!listingsSnap.empty) {
      const items = listingsSnap.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        let detail = `ID: ${docSnapshot.id} | Title: ${d.title} | Type: ${d.listingType} | Cat: ${d.category} | Price: ${d.price} ${d.currency || "USD"} | City: ${d.city} | Location: ${d.location}`;
        if (d.category === "property") {
          detail += ` | Beds: ${d.beds || "N/A"}, Baths: ${d.baths || "N/A"}, Size: ${d.size || "N/A"}`;
        } else if (d.category === "vehicle") {
          detail += ` | Year: ${d.year || "N/A"}, Mileage: ${d.mileage || "N/A"}, Fuel: ${d.fuelType || "N/A"}, Trans: ${d.transmission || "N/A"}`;
        }
        if (d.isVerified) detail += ` [VERIFIED TRUSTED]`;
        if (d.isFeatured) detail += ` [FEATURED]`;
        return `- ${detail}`;
      });
      listingsStr = items.join("\n");
    }
  } catch (err) {
    console.error("Error fetching listings context in backend:", err);
  }

  try {
    // 2. Get Professional Services
    const proRef = collection(firestoreDb, "professionalServices");
    const prosQ = query(proRef, where("status", "==", "active"), limit(50));
    const prosSnap = await getDocs(prosQ);
    if (!prosSnap.empty) {
      const items = prosSnap.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        return `- ID/ProviderID: ${d.providerId || docSnapshot.id} (Category: ${d.category}) | Name: ${d.providerName || "Certified Specialist"} | Service Title: ${d.title} | City: ${d.city} | Details: ${d.description || ""}`;
      });
      prosStr = items.join("\n");
    }
  } catch (err) {
    console.error("Error fetching professionals context in backend:", err);
  }

  try {
    // 3. Get Articles
    const articleRef = collection(firestoreDb, "articles");
    const articleQ = query(articleRef, where("published", "==", true), limit(30));
    const articleSnap = await getDocs(articleQ);
    if (!articleSnap.empty) {
      const items = articleSnap.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        return `- ID: ${docSnapshot.id} | Title: ${d.title} | Category: ${d.category} | Language: ${d.language} | Summary: ${d.summary}`;
      });
      articlesStr = items.join("\n");
    }
  } catch (err) {
    console.error("Error fetching articles context in backend:", err);
  }

  return { listingsStr, prosStr, articlesStr };
}

startServer();
