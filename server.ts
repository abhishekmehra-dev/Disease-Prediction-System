import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { DISEASES_DATA } from "./src/symptomsData";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini client (with proper User-Agent header)
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
}) : null;

// Endpoint to return all diseases with details for the information tab
app.get("/api/diseases", (req, res) => {
  res.json(Object.values(DISEASES_DATA));
});

// API endpoint for Disease Prediction
app.post("/api/predict", async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: "Please select at least one symptom." });
    }

    // Filter empty values
    const activeSymptoms = symptoms.filter((s: string) => s && s.trim() !== "");
    if (activeSymptoms.length === 0) {
      return res.status(400).json({ error: "Selected symptoms are invalid." });
    }

    console.log("Analyzing symptoms:", activeSymptoms);

    let predictedDiseaseName = "Common Cold"; // fallback
    let confidence = 85;
    let clinicalSummary = "";
    let severity: "Mild" | "Moderate" | "Critical" = "Mild";
    let recoveryTime = "5-7 Days";
    let differentials: { disease: string; probability: number }[] = [];

    // Check for high-risk warning active symptoms to calculate severity
    const criticalIndicators = ["chest_pain", "breathlessness", "coma", "stomach_bleeding", "altered_sensorium", "fast_heart_rate", "blood_in_sputum"];
    const moderateIndicators = ["high_fever", "vomiting", "weight_loss", "yellowish_skin", "dark_urine", "swelled_lymph_nodes", "dizziness"];
    
    const criticalCount = activeSymptoms.filter(x => criticalIndicators.includes(x)).length;
    const moderateCount = activeSymptoms.filter(x => moderateIndicators.includes(x)).length;

    if (criticalCount > 0) {
      severity = "Critical";
      recoveryTime = "Immediate Clinical Care Required";
    } else if (moderateCount >= 2) {
      severity = "Moderate";
      recoveryTime = "1 - 2 Weeks";
    } else {
      severity = "Mild";
      recoveryTime = "3 - 5 Days";
    }

    if (ai) {
      try {
        const prompt = `Symptoms selected by the patient: ${activeSymptoms.join(", ")}.
Based on the medical symptom classification schema, identify the most probable disease.
Please choose EXACTLY one disease from the following available catalog of matching diseases:
${Object.keys(DISEASES_DATA).join(", ")}.

Provide your response strictly in raw JSON format matching this schema:
{
  "disease": "Exact name of the disease from the list",
  "confidence": 92, // estimated confidence score in percent (integer) from 0 to 100 based on the relevance of selected symptoms
  "clinical_summary": "Short 2-3 sentence clinical explanation of the diagnosis and next steps",
  "differentials": [
    {"disease": "Alternative matching disease 1", "probability": 15},
    {"disease": "Alternative matching disease 2", "probability": 8}
  ],
  "reasoning": "Symptom matching justification"
}
Ensure you ONLY return raw valid JSON (no surrounding markdown code blocks, just pure parsable JSON text).`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        if (response && response.text) {
          try {
            const result = JSON.parse(response.text.trim());
            if (result && result.disease && DISEASES_DATA[result.disease]) {
              predictedDiseaseName = result.disease;
              confidence = Math.max(30, Math.min(100, result.confidence || 85));
              clinicalSummary = result.clinical_summary || "";
              
              if (result.differentials && Array.isArray(result.differentials)) {
                differentials = result.differentials.filter((d: any) => d && d.disease && DISEASES_DATA[d.disease]);
              }
            } else {
              // If AI returns a disease not in our static keys, we find closest match
              const closestMatch = Object.keys(DISEASES_DATA).find(
                d => d.toLowerCase() === (result.disease || "").toLowerCase()
              ) || fallbackLocalPredictor(activeSymptoms).disease;
              predictedDiseaseName = closestMatch;
              confidence = Math.max(30, Math.min(100, result.confidence || 80));
              clinicalSummary = result.clinical_summary || "";
            }
          } catch (jsonErr) {
            console.error("AI returned unparsable JSON, using local matching engine.", jsonErr, response.text);
            const localRes = fallbackLocalPredictor(activeSymptoms);
            predictedDiseaseName = localRes.disease;
            differentials = localRes.differentials;
          }
        }
      } catch (aiErr) {
        console.error("AI Generation failed, running local matching engine:", aiErr);
        const localRes = fallbackLocalPredictor(activeSymptoms);
        predictedDiseaseName = localRes.disease;
        differentials = localRes.differentials;
      }
    } else {
      const localRes = fallbackLocalPredictor(activeSymptoms);
      predictedDiseaseName = localRes.disease;
      differentials = localRes.differentials;
    }

    // If differentials is empty, populate with fallback variations
    if (differentials.length === 0) {
      const localRes = fallbackLocalPredictor(activeSymptoms);
      differentials = localRes.differentials;
    }

    // Resolve the final disease information
    const finalInfo = DISEASES_DATA[predictedDiseaseName] || DISEASES_DATA["Common Cold"];

    res.json({
      disease: finalInfo.disease,
      confidence: confidence,
      description: finalInfo.description,
      precautions: finalInfo.precautions,
      recommendedSpecialist: finalInfo.recommendedSpecialist,
      category: finalInfo.category,
      severity: severity,
      recoveryTime: recoveryTime,
      differentials: differentials.slice(0, 3),
      clinicalSummary: clinicalSummary || `Symptom-based matching algorithm successfully matched your inputs (${activeSymptoms.join(", ")}) with our database catalog.`
    });

  } catch (error: any) {
    console.error("Prediction endpoint failed:", error);
    res.status(500).json({ error: error.message || "Something went wrong during disease prediction." });
  }
});

// Fallback local symptom matching and dynamic differential score calculation
function fallbackLocalPredictor(activeSymptoms: string[]): { disease: string; differentials: { disease: string; probability: number }[] } {
  const symptomMap: Record<string, string[]> = {
    "Fungal infection": ["itching", "skin_rash", "nodal_skin_eruptions", "dischromic_patches"],
    "Allergy": ["continuous_sneezing", "shivering", "chills", "watery_eyes"],
    "GERD": ["stomach_pain", "acidity", "ulcers_on_tongue", "vomiting", "cough"],
    "Chronic cholestasis": ["vomiting", "yellowish_skin", "nausea", "loss_of_appetite", "yellowing_of_eyes"],
    "Drug Reaction": ["itching", "skin_rash", "stomach_pain", "burning_micturition", "spotting_ urination"],
    "Peptic ulcer disease": ["vomiting", "indigestion", "loss_of_appetite", "abdominal_pain"],
    "AIDS": ["muscle_wasting", "patches_in_throat", "high_fever", "extra_marital_contacts"],
    "Diabetes": ["fatigue", "weight_loss", "lethargy", "irregular_sugar_level", "excessive_hunger", "increased_appetite", "polyuria"],
    "Gastroenteritis": ["vomiting", "sunken_eyes", "dehydration", "diarrhoea"],
    "Bronchial Asthma": ["fatigue", "cough", "high_fever", "breathlessness", "family_history", "mucoid_sputum"],
    "Hypertension": ["headache", "chest_pain", "dizziness", "loss_of_balance", "lack_of_concentration"],
    "Migraine": ["acidity", "indigestion", "headache", "blurred_and_distorted_vision", "depression", "irritability", "visual_disturbances"],
    "Cervical spondylosis": ["back_pain", "neck_pain", "dizziness", "loss_of_balance"],
    "Paralysis (brain hemorrhage)": ["vomiting", "headache", "weakness_in_limbs", "altered_sensorium"],
    "Jaundice": ["vomiting", "yellowish_skin", "abdominal_pain", "dark_urine"],
    "Malaria": ["chills", "vomiting", "high_fever", "sweating", "headache", "muscle_pain"],
    "Chicken pox": ["itching", "skin_rash", "fatigue", "lethargy", "high_fever", "headache", "loss_of_appetite", "mild_fever", "swelled_lymph_nodes", "red_spots_over_body"],
    "Dengue": ["skin_rash", "chills", "joint_pain", "vomiting", "high_fever", "headache", "nausea", "loss_of_appetite", "pain_behind_the_eyes", "back_pain", "muscle_pain", "red_spots_over_body"],
    "Typhoid": ["chills", "vomiting", "fatigue", "high_fever", "headache", "nausea", "loss_of_appetite", "constipation", "abdominal_pain", "diarrhoea", "toxic_look_(typhoid)"],
    "Hepatitis A": ["joint_pain", "vomiting", "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "abdominal_pain", "diarrhoea", "mild_fever", "yellowing_of_eyes"],
    "Hepatitis B": ["itching", "fatigue", "yellowish_skin", "dark_urine", "loss_of_appetite", "abdominal_pain", "yellowing_of_eyes", "receiving_blood_transfusion", "receiving_unsterile_injections"],
    "Hepatitis C": ["fatigue", "yellowish_skin", "nausea", "loss_of_appetite", "yellowing_of_eyes", "family_history"],
    "Hepatitis D": ["joint_pain", "vomiting", "fatigue", "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "abdominal_pain", "yellowing_of_eyes"],
    "Hepatitis E": ["joint_pain", "vomiting", "fatigue", "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "abdominal_pain", "diarrhoea", "acute_liver_failure", "yellowing_of_eyes", "coma", "stomach_bleeding"],
    "Alcoholic hepatitis": ["vomiting", "yellowish_skin", "abdominal_pain", "swelling_of_stomach", "distention_of_abdomen", "history_of_alcohol_consumption"],
    "Tuberculosis": ["chills", "vomiting", "fatigue", "weight_loss", "cough", "high_fever", "breathlessness", "sweating", "loss_of_appetite", "mild_fever", "swelled_lymph_nodes", "malaise", "phlegm", "chest_pain", "blood_in_sputum"],
    "Common Cold": ["continuous_sneezing", "chills", "fatigue", "cough", "high_fever", "headache", "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose", "congestion", "chest_pain", "muscle_pain"],
    "Pneumonia": ["chills", "fatigue", "cough", "high_fever", "breathlessness", "sweating", "malaise", "phlegm", "chest_pain", "fast_heart_rate", "rusty_sputum"],
    "Dimorphic hemorrhoids(piles)": ["constipation", "pain_during_bowel_movements", "pain_in_anal_region", "bloody_stool", "irritation_in_anus"],
    "Heart attack": ["vomiting", "breathlessness", "sweating", "chest_pain", "palpitations"],
    "Varicose veins": ["fatigue", "cramps", "bruising", "swollen_legs", "swollen_blood_vessels", "prominent_veins_on_calf"],
    "Hypothyroidism": ["fatigue", "weight_gain", "cold_hands_and_feets", "mood_swings", "lethargy", "dizziness", "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails", "swollen_extremeties", "depression", "irritability", "abnormal_menstruation"],
    "Hyperthyroidism": ["fatigue", "weight_loss", "restlessness", "lethargy", "sweating", "diarrhoea", "fast_heart_rate", "excessive_hunger", "irritability", "abnormal_menstruation"],
    "Hypoglycemia": ["fatigue", "anxiety", "sweating", "headache", "nausea", "blurred_and_distorted_vision", "excessive_hunger", "drying_of_lips_and_throat", "irritability", "palpitations"],
    "Osteoarthristis": ["joint_pain", "neck_pain", "painful_walking"],
    "Arthritis": ["joint_pain", "painful_walking", "swelling_joints"],
    "Acne": ["skin_rash", "pus_filled_pimples", "blackheads", "scurring"],
    "Urinary tract infection": ["burning_micturition", "continuous_feel_of_urine"],
    "Psoriasis": ["skin_rash", "joint_pain", "skin_peeling", "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails"],
    "Impetigo": ["skin_rash", "high_fever", "blister", "red_sore_around_nose", "yellow_crust_ooze"]
  };

  const overlapScores: { disease: string; score: number }[] = [];

  for (const [disease, symptomsList] of Object.entries(symptomMap)) {
    const intersection = activeSymptoms.filter(x => symptomsList.includes(x)).length;
    if (intersection > 0) {
      // Calculate dynamic relative probability percentage
      overlapScores.push({ disease, score: intersection });
    }
  }

  // Sort descending by intersection score
  overlapScores.sort((a, b) => b.score - a.score);

  const primaryDisease = overlapScores.length > 0 ? overlapScores[0].disease : "Common Cold";
  
  // Construct unique, logical alternative differentials
  const differentials: { disease: string; probability: number }[] = [];
  if (overlapScores.length > 1) {
    overlapScores.slice(1, 4).forEach((item, idx) => {
      // assign hypothetical relative matching probabilities
      const baseProb = Math.max(8, Math.min(28, item.score * 15 - idx * 4));
      differentials.push({ disease: item.disease, probability: baseProb });
    });
  }

  // Add generic backup if no other overlap
  if (differentials.length === 0) {
    const parentCat = DISEASES_DATA[primaryDisease]?.category || "Viral Infection";
    const siblings = Object.values(DISEASES_DATA).filter(
      d => d.category === parentCat && d.disease !== primaryDisease
    );
    if (siblings.length > 0) {
      differentials.push({ disease: siblings[0].disease, probability: 18 });
    }
    if (siblings.length > 1) {
      differentials.push({ disease: siblings[1].disease, probability: 11 });
    }
  }

  return {
    disease: primaryDisease,
    differentials: differentials.slice(0, 3)
  };
}

// In-Memory Database for Contact Tickets & Login Audits
interface ContactTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

interface LoginEvent {
  id: string;
  email: string;
  role: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  status: "Success" | "Failed";
}

const contactTickets: ContactTicket[] = [
  {
    id: "TKT-001",
    name: "Abhishek Mehra",
    email: "abhishekmehra1931@gmail.com",
    subject: "Academic Integration Inquiry",
    message: "Need technical feedback on the disease classifier and how we can integrate additional diagnostic layers for the Viva presentation.",
    date: new Date(Date.now() - 3600000 * 2).toLocaleString("en-US") // 2 hours ago
  }
];

const loginEvents: LoginEvent[] = [
  {
    id: "LOG-001",
    email: "system.daemon@clinic.edu",
    role: "System Admin",
    timestamp: new Date(Date.now() - 3600000 * 4).toLocaleString("en-US"), // 4 hours ago
    ip: "127.0.0.1",
    userAgent: "Server Sandbox NodeDaemon",
    status: "Success"
  },
  {
    id: "LOG-002",
    email: "demophysician@clinical.org",
    role: "Medical Reviewer",
    timestamp: new Date(Date.now() - 3600000 * 3).toLocaleString("en-US"), // 3 hours ago
    ip: "192.168.1.15",
    userAgent: "Mozilla Chrome - WebKit",
    status: "Success"
  }
];

// Submit Contact Form API
app.post("/api/contact", (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All form fields are required." });
    }

    const newTicket: ContactTicket = {
      id: `TKT-${String(contactTickets.length + 1).padStart(3, "0")}`,
      name,
      email,
      subject,
      message,
      date: new Date().toLocaleString("en-US")
    };

    contactTickets.unshift(newTicket); // Add to the top of logs

    // Register an audit trace of this ticket submit
    const auditEvent: LoginEvent = {
      id: `LOG-${String(loginEvents.length + 1).padStart(3, "0")}`,
      email: email,
      role: "Guest User (Ticket Submitter)",
      timestamp: new Date().toLocaleString("en-US"),
      ip: req.ip || "Unknown IP",
      userAgent: req.headers["user-agent"] || "Web Browser Client",
      status: "Success"
    };
    loginEvents.unshift(auditEvent);

    res.status(201).json({ success: true, ticket: newTicket });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Could not register contact query." });
  }
});

// Handle Authentication / Logs Login Action
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, role, password } = req.body;
    if (!email || !role || !password) {
      return res.status(400).json({ error: "Email, role, and password are required." });
    }

    // Simple open password criteria or demonstration criteria: 
    // Permit any demo credentials to show easy accessibility while logging trace
    const isSuccess = password.length >= 4;

    const newEvent: LoginEvent = {
      id: `LOG-${String(loginEvents.length + 1).padStart(3, "0")}`,
      email: email,
      role: role || "Demonstration Clinician",
      timestamp: new Date().toLocaleString("en-US"),
      ip: req.ip || "localhost",
      userAgent: req.headers["user-agent"] || "Web Sandbox Agent",
      status: isSuccess ? "Success" : "Failed"
    };

    loginEvents.unshift(newEvent);

    if (!isSuccess) {
      return res.status(401).json({ error: "Invalid password key length. Ensure password is at least 4 chars." });
    }

    res.status(200).json({ 
      success: true, 
      session: {
        email,
        role,
        token: `demo-token-${Date.now()}`
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Auth dispatch failed." });
  }
});

// Get All Support Tickets & Login Logs
app.get("/api/admin/logs", (req, res) => {
  res.json({
    tickets: contactTickets,
    logs: loginEvents
  });
});

// Only bind server and use Vite in non-Vercel environment
if (process.env.VERCEL !== "1") {
  const startServer = async () => {
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

    const PORT = process.env.PORT || 3000;
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  };

  startServer();
}

export default app;
