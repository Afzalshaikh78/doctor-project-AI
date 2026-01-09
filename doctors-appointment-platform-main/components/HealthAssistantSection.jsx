"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2 } from "lucide-react";

const quickSymptoms = [
  "Headache",
  "Fever",
  "Cough",
  "Sore Throat",
  "Fatigue",
  "Nausea",
  "Body Aches",
  "Runny Nose",
];

function getUrgencyColor(urgency) {
  if (urgency === "emergency")
    return "bg-red-900/20 border-red-800/40 text-red-400";
  if (urgency === "high")
    return "bg-yellow-900/20 border-yellow-800/40 text-yellow-400";
  if (urgency === "moderate")
    return "bg-amber-900/20 border-amber-800/40 text-amber-400";
  if (urgency === "low")
    return "bg-emerald-900/20 border-emerald-800/40 text-emerald-400";
  return "bg-slate-900/20 border-slate-800/40 text-slate-400";
}

function getUrgencyBadgeText(urgency) {
  if (urgency === "emergency") return "🚨 Emergency - Seek Immediate Care";
  if (urgency === "high") return "⚠️ High Urgency - See Doctor Soon";
  if (urgency === "moderate") return "⏰ Moderate - Monitor Symptoms";
  if (urgency === "low") return "✅ Low - Home Care Sufficient";
  return urgency;
}

export default function HealthAssistantSection() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  function handleQuickSymptom(symptom) {
    handleSendMessage(symptom);
  }

  async function handleSendMessage(messageText) {
    const text = messageText || input;
    if (!text.trim()) return;

    const userMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/health-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages,
          userId: null,
        }),
      });

      const data = await response.json();
      const aiResponse = data.response;

      const assistantMessage = {
        role: "assistant",
        content: JSON.stringify(aiResponse),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setShowResponse(true);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        role: "assistant",
        content: JSON.stringify({
          analysis: "Sorry, I encountered an error. Please try again.",
        }),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function getLatestResponse() {
    if (messages.length === 0) return null;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "assistant") {
      try {
        return JSON.parse(lastMessage.content);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  const latestResponse = getLatestResponse();

  return (
    <section className="py-20 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="bg-emerald-900/30 border-emerald-700/30 px-4 py-2 text-emerald-400 text-sm font-medium mb-4 inline-flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI Health Assistant
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ask Your Health Assistant
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Describe your symptoms and get instant health insights powered by
            AI. Available 24/7 to provide personalized medical guidance.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-950/50 border-emerald-900/30 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-emerald-900/20">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                Health Assistant Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Chat Messages */}
              <div className="h-[200px] overflow-y-auto mb-6 space-y-4 scroll-smooth rounded-lg bg-slate-900/30 p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Start describing your symptoms...</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-emerald-600 text-white rounded-br-none"
                            : "bg-slate-800 text-muted-foreground rounded-bl-none"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="text-sm">
                            {(() => {
                              try {
                                const parsed = JSON.parse(message.content);
                                return (
                                  <div className="space-y-2">
                                    {parsed.analysis && (
                                      <p className="text-sm text-white">
                                        {parsed.analysis}
                                      </p>
                                    )}
                                  </div>
                                );
                              } catch {
                                return <p>{message.content}</p>;
                              }
                            })()}
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-muted-foreground px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI is analyzing...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Response Display */}
              {showResponse && latestResponse && (
                <div className="mb-6 space-y-4 bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {/* Emergency Alert */}
                  {latestResponse.is_emergency && (
                    <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-4 mb-4">
                      <p className="text-red-400 font-bold text-lg">
                        🚨 {latestResponse.emergency_message}
                      </p>
                      <div className="mt-3 space-y-2">
                        {latestResponse.actions?.map((action, idx) => (
                          <p
                            key={idx}
                            className="text-red-300 text-sm flex items-start gap-2"
                          >
                            <span className="font-bold mt-0.5">•</span>
                            <span>{action}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Urgency Badge */}
                  {latestResponse.urgency && !latestResponse.is_emergency && (
                    <div
                      className={`p-3 rounded-lg border ${getUrgencyColor(
                        latestResponse.urgency
                      )}`}
                    >
                      <p className="font-semibold text-sm">
                        {getUrgencyBadgeText(latestResponse.urgency)}
                      </p>
                    </div>
                  )}

                  {/* Possible Conditions */}
                  {latestResponse.conditions &&
                    latestResponse.conditions.length > 0 && (
                      <div>
                        <p className="text-white font-semibold text-sm mb-2">
                          Possible Conditions:
                        </p>
                        <div className="space-y-2">
                          {latestResponse.conditions.map((condition, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-800/50 rounded p-2 border border-emerald-900/20"
                            >
                              <p className="text-white text-sm font-medium">
                                {condition.name}
                                <span className="text-emerald-400 text-xs ml-2">
                                  ({condition.confidence})
                                </span>
                              </p>
                              <p className="text-muted-foreground text-xs mt-1">
                                {condition.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Self-Care */}
                  {latestResponse.recommendations?.self_care && (
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">
                        Self-Care Measures:
                      </p>
                      <ul className="space-y-1">
                        {latestResponse.recommendations.self_care.map(
                          (care, idx) => (
                            <li
                              key={idx}
                              className="text-muted-foreground text-xs flex items-start gap-2"
                            >
                              <span className="text-emerald-400 mt-0.5">✓</span>
                              <span>{care}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Medications */}
                  {latestResponse.recommendations?.medications && (
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">
                        Recommended Medications:
                      </p>
                      <div className="space-y-2">
                        {latestResponse.recommendations.medications.map(
                          (med, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-900/50 rounded p-2 border border-emerald-900/20"
                            >
                              <p className="text-emerald-400 text-xs font-semibold">
                                {med.name}
                              </p>
                              <p className="text-muted-foreground text-xs mt-1">
                                <span className="font-semibold">Dosage:</span>{" "}
                                {med.dosage}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                <span className="font-semibold">Purpose:</span>{" "}
                                {med.purpose}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* When to See Doctor */}
                  {latestResponse.when_to_see_doctor &&
                    latestResponse.when_to_see_doctor.length > 0 && (
                      <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-lg p-3">
                        <p className="text-yellow-400 font-semibold text-sm mb-2">
                          ⚠️ When to See a Doctor:
                        </p>
                        <ul className="space-y-1">
                          {latestResponse.when_to_see_doctor.map(
                            (warning, idx) => (
                              <li
                                key={idx}
                                className="text-yellow-300 text-xs flex items-start gap-2"
                              >
                                <span className="mt-0.5">•</span>
                                <span>{warning}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )}

              {/* Quick Symptoms */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-3">
                  Quick symptoms:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => handleQuickSymptom(symptom)}
                      disabled={loading}
                      className="px-3 py-1 text-xs rounded-full border border-emerald-900/40 bg-emerald-900/10 text-emerald-400 hover:bg-emerald-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !loading) {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Describe your symptoms..."
                  disabled={loading}
                  className="flex-1 bg-slate-900/50 border border-emerald-900/30 rounded-lg px-4 py-2 text-white placeholder-muted-foreground focus:outline-none focus:border-emerald-600/50 focus:ring-1 focus:ring-emerald-600/30 disabled:opacity-50"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={loading || !input.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-white">Disclaimer:</span>{" "}
                  This AI assistant provides general health information only and
                  is not a substitute for professional medical advice. Always
                  consult a healthcare provider for proper diagnosis and
                  treatment. In case of emergency, seek medical help.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-emerald-950/20 border-emerald-900/30 hover:border-emerald-800/50 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">🕐</div>
                <h3 className="text-white font-semibold mb-2">
                  24/7 Available
                </h3>
                <p className="text-muted-foreground text-sm">
                  Get health guidance anytime, day or night
                </p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-950/20 border-emerald-900/30 hover:border-emerald-800/50 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="text-white font-semibold mb-2">
                  Evidence-Based
                </h3>
                <p className="text-muted-foreground text-sm">
                  Powered by medical knowledge and AI
                </p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-950/20 border-emerald-900/30 hover:border-emerald-800/50 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-white font-semibold mb-2">
                  Privacy Protected
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your health data is secure and confidential
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
