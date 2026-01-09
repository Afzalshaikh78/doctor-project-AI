import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are a knowledgeable and empathetic AI health assistant. Your role is to:

1. Listen carefully to patient symptoms
2. Ask clarifying questions when needed
3. Provide evidence-based health information
4. Suggest appropriate self-care measures
5. Recommend when to seek professional care
6. ALWAYS include medical disclaimers
7. Identify emergency situations immediately

RESPOND IN JSON FORMAT with this structure:
{
  "analysis": "Brief analysis of symptoms",
  "conditions": [
    {
      "name": "Condition name",
      "confidence": "High/Moderate/Low",
      "description": "Brief description"
    }
  ],
  "recommendations": {
    "self_care": ["list of self-care measures"],
    "medications": [
      {
        "name": "Medicine name",
        "dosage": "Recommended dosage",
        "purpose": "What it treats"
      }
    ],
    "lifestyle": ["lifestyle recommendations"]
  },
  "urgency": "low/moderate/high/emergency",
  "when_to_see_doctor": ["list of warning signs"],
  "is_emergency": false
}

EMERGENCY KEYWORDS requiring immediate attention:
- Chest pain, Difficulty breathing, Severe bleeding
- Loss of consciousness, Stroke symptoms (FAST)
- Severe allergic reaction, Suicidal thoughts

Always end with: "This information is for educational purposes only. Please consult a healthcare provider for proper diagnosis and treatment."`;

export async function POST(request) {
  try {
    const { message, conversationHistory, userId } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check for emergency keywords (fast first-pass)
    const emergencyKeywords = [
      "chest pain",
      "difficulty breathing",
      "can't breathe",
      "severe bleeding",
      "unconscious",
      "stroke",
      "heart attack",
      "suicide",
      "kill myself",
      "severe allergic",
      "anaphylaxis",
    ];

    const isEmergency = emergencyKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword)
    );

    if (isEmergency) {
      const emergencyResponse = {
        is_emergency: true,
        emergency_message: "⚠️ SEEK EMERGENCY MEDICAL ATTENTION IMMEDIATELY",
        actions: [
          "Call 911 or your local emergency number NOW",
          "Do not drive yourself to the hospital",
          "Stay on the line with emergency services",
          "If alone, unlock your door for emergency responders",
        ],
        analysis: "Your symptoms indicate a potential medical emergency.",
        urgency: "emergency",
        disclaimer:
          "This is an emergency situation. Seek immediate medical help.",
      };

      // Save to database if userId provided
      if (userId) {
        try {
          await db.healthChat.create({
            data: {
              userId,
              messages: [
                { role: "user", content: message, timestamp: new Date() },
                {
                  role: "assistant",
                  content: JSON.stringify(emergencyResponse),
                  timestamp: new Date(),
                },
              ],
              symptoms: [message],
              isEmergency: true,
              urgencyLevel: "emergency",
              recommendations: emergencyResponse,
            },
          });
        } catch (dbError) {
          console.error("Database error:", dbError);
        }
      }

      return NextResponse.json({ response: emergencyResponse });
    }

    // Build conversation context for Groq
    const messages = [{ role: "system", content: SYSTEM_PROMPT }];

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    messages.push({ role: "user", content: message });

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const aiResponse = completion.choices[0]?.message?.content || "";

    // Parse JSON response
    let parsedResponse;
    try {
      // Try to extract JSON from response (Groq sometimes adds markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(aiResponse);
      }
    } catch (e) {
      console.error("JSON parsing error:", e);
      // Fallback response if JSON parsing fails
      parsedResponse = {
        analysis: aiResponse,
        urgency: "low",
        is_emergency: false,
        conditions: [],
        recommendations: {
          self_care: ["Rest and stay hydrated"],
          medications: [],
          lifestyle: [],
        },
        when_to_see_doctor: ["If symptoms worsen or persist"],
      };
    }

    // Extract symptoms from message
    const extractSymptoms = (text) => {
      const commonSymptoms = [
        "headache",
        "fever",
        "cough",
        "sore throat",
        "fatigue",
        "nausea",
        "vomiting",
        "diarrhea",
        "pain",
        "ache",
        "dizzy",
        "runny nose",
        "congestion",
        "shortness of breath",
        "chest pain",
      ];
      const lowerText = text.toLowerCase();
      return commonSymptoms.filter((symptom) => lowerText.includes(symptom));
    };

    // Add disclaimer if not present
    if (!parsedResponse.disclaimer) {
      parsedResponse.disclaimer =
        "This information is for educational purposes only. Please consult a healthcare provider for proper diagnosis and treatment.";
    }

    // Save conversation to database if userId provided
    if (userId) {
      try {
        await db.healthChat.create({
          data: {
            userId,
            messages: [
              { role: "user", content: message, timestamp: new Date() },
              {
                role: "assistant",
                content: JSON.stringify(parsedResponse),
                timestamp: new Date(),
              },
            ],
            symptoms: extractSymptoms(message),
            isEmergency: parsedResponse.is_emergency || false,
            urgencyLevel: parsedResponse.urgency || "low",
            recommendations: parsedResponse,
          },
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    }

    return NextResponse.json({ response: parsedResponse });
  } catch (error) {
    console.error("Groq API error:", error);

    // Specific error handling
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        {
          error: "Invalid Groq API key. Please check your GROQ_API_KEY.",
          hint: "Get your free API key at https://console.groq.com/keys",
        },
        { status: 401 }
      );
    }

    if (error.message?.includes("quota") || error.status === 429) {
      return NextResponse.json(
        { error: "Groq API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process your request. Please try again." },
      { status: 500 }
    );
  }
}
