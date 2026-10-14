"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  XMarkIcon,
  MinusIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  FolderIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  TrophyIcon,
  EnvelopeIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { NexusPlanetIcon } from "./nexus-icons";
import { NexusChatMessage, ChatMessage } from "./nexus-chat-message";

interface NexusChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  {
    id: "projects",
    title: "Tell me about the projects",
    query: "Tell me about Ayush's key projects and AI/ML implementations.",
    icon: FolderIcon,
  },
  {
    id: "skills",
    title: "What are Ayush's technical skills?",
    query: "What programming languages, frameworks, and AI/ML tools does Ayush specialize in?",
    icon: CodeBracketIcon,
  },
  {
    id: "education",
    title: "Education and experience",
    query: "Tell me about Ayush's education and technical experience.",
    icon: AcademicCapIcon,
  },
  {
    id: "certifications",
    title: "Certifications and achievements",
    query: "What certifications, credentials, and achievements has Ayush earned?",
    icon: TrophyIcon,
  },
  {
    id: "contact",
    title: "How can I contact Ayush?",
    query: "How can I contact Ayush for job opportunities or collaborations?",
    icon: EnvelopeIcon,
  },
];

function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export const NexusChatWindow = ({ isOpen, onClose }: NexusChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draftBackup, setDraftBackup] = useState("");
  const [isEphemeral, setIsEphemeral] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll on mobile while open
  useEffect(() => {
    if (isOpen) {
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        document.body.style.overflow = "hidden";
      }
      setTimeout(() => {
        textareaRef.current?.focus();
        scrollToBottom(false);
      }, 150);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, scrollToBottom]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isGenerating, isOpen, scrollToBottom]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isGenerating) return;

    setDraftBackup(textToSend);
    setInput("");

    const now = formatTime();
    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    // Add user message immediately + empty assistant placeholder
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: textToSend, timestamp: now },
      { id: assistantMsgId, role: "assistant", content: "", timestamp: now },
    ]);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 429) {
          const retrySec = errorData?.retryAfter || response.headers.get("retry-after") || 60;
          throw new Error(`Rate limit reached: Please wait ${retrySec} seconds before sending another message.`);
        }
        throw new Error(errorData?.error || "Unable to reach Nexus AI at the moment.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream response received.");

      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload.type === "meta") {
                if (payload.conversationId) {
                  setConversationId(payload.conversationId);
                }
                if (typeof payload.isEphemeral === "boolean") {
                  setIsEphemeral(payload.isEphemeral);
                }
              } else if (payload.type === "chunk" && payload.text) {
                accumulatedText += payload.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              } else if (payload.type === "error") {
                throw new Error(payload.message || "An interruption occurred while streaming.");
              }
            } catch {
              // Ignore partial JSON in stream chunk
            }
          }
        }
      }
    } catch (err) {
      console.error("Nexus AI Chat error:", err);
      // Restore draft if user was typing
      if (!queryText && draftBackup) {
        setInput(draftBackup);
      }
      const errorMessage =
        err instanceof Error ? err.message : "Unable to reach Nexus AI at the moment.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                isError: true,
                content: `⚠️ ${errorMessage}\n\nYou can also reach out directly to Ayush at [ayushofficaluse@gmail.com](mailto:ayushofficaluse@gmail.com) or on [WhatsApp](https://wa.me/919589981849).`,
              }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setConversationId(null);
    setInput("");
    setDraftBackup("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const showWelcome = messages.length === 0;

  return (
    <div
      ref={windowRef}
      id="nexus-chat-window"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nexus-chat-title"
      className="fixed inset-x-3 bottom-3 top-16 z-50 flex flex-col overflow-hidden rounded-2xl border border-violet-400/35 bg-[#0c0628]/95 shadow-[0_0_35px_rgba(112,66,248,0.35)] backdrop-blur-xl sm:inset-x-auto sm:top-auto sm:bottom-24 sm:right-6 sm:h-[580px] sm:max-h-[85vh] sm:w-[410px] transition-all duration-300 motion-reduce:transition-none"
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-violet-500/25 bg-gradient-to-r from-[#170938]/90 via-[#0d0626]/95 to-[#170938]/90 px-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/40 bg-gradient-to-tr from-[#2A0E61] via-[#1a0a3a] to-[#0c0728] shadow-[0_0_12px_rgba(6,182,212,0.35)]">
            <NexusPlanetIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span id="nexus-chat-title" className="text-sm font-semibold text-white">
                Nexus AI
              </span>
              {isEphemeral ? (
                <span
                  title="Database migration pending; conversations are retained for this session only"
                  className="flex items-center gap-1 rounded-full bg-amber-950/60 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/30"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Ephemeral Session
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-violet-950/60 px-2 py-0.5 text-[10px] font-medium text-cyan-300 border border-violet-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Portfolio Guide
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400">Personal AI for Ayush Singh</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-gray-400">
          <button
            type="button"
            onClick={handleReset}
            title="Start new conversation"
            aria-label="Start new conversation"
            className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Minimize chat"
            aria-label="Minimize chat"
            className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close chat window"
            aria-label="Close chat window"
            className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Body (Welcome View vs Message History) */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hidden"
        aria-live="polite"
      >
        {showWelcome ? (
          <div className="flex flex-col gap-4 py-2">
            {/* Welcome Greeting Card */}
            <div className="rounded-2xl border border-violet-400/25 bg-[#120a2e]/70 p-4 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👋</span>
                <h3 className="text-sm font-semibold text-white">Hey! I&apos;m Nexus AI.</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                I can help you explore Ayush&apos;s projects, technical skills, certifications, and AI/ML experience.
              </p>
              <p className="mt-2 text-xs font-medium text-cyan-300">
                What would you like to know?
              </p>
            </div>

            {/* 5 Stacked Suggested Prompt Cards */}
            <div className="flex flex-col gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => {
                const IconComponent = prompt.icon;
                return (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => handleSendMessage(prompt.query)}
                    className="group flex w-full items-center justify-between rounded-xl border border-violet-500/25 bg-[#11092a]/80 p-2.5 text-left transition-all duration-200 hover:border-cyan-400/60 hover:bg-[#1a0f40]/90 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-violet-400/30 bg-violet-950/60 text-cyan-300 group-hover:border-cyan-400/50 group-hover:text-cyan-200 transition-colors">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors">
                        {prompt.title}
                      </span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <NexusChatMessage
                key={msg.id}
                message={msg}
                onRetry={msg.isError ? () => handleSendMessage(draftBackup) : undefined}
              />
            ))}

            {/* Thinking / Loading Indicator */}
            {isGenerating && messages[messages.length - 1]?.content === "" && (
              <div className="flex items-center gap-2.5 my-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-gradient-to-tr from-[#2A0E61] via-[#1a0a3a] to-[#0c0728] shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  <NexusPlanetIcon className="h-5 w-5" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-violet-400/25 bg-[#0d0724]/90 px-4 py-2.5 text-xs text-gray-300 shadow-sm flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce motion-reduce:animate-none" />
                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce motion-reduce:animate-none [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce motion-reduce:animate-none [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[11px] text-gray-400 ml-1">Nexus is thinking...</span>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="shrink-0 border-t border-violet-500/20 bg-[#070318]/95 p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-violet-500/35 bg-[#12082f]/90 px-3 py-1.5 focus-within:border-cyan-400/70 focus-within:ring-1 focus-within:ring-cyan-400/40 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Nexus AI anything..."
            maxLength={2000}
            disabled={isGenerating}
            className="w-full resize-none bg-transparent py-1 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 max-h-24 scrollbar-hidden"
          />

          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            aria-label="Send message"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed motion-reduce:transform-none shadow-md shadow-purple-900/30"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between px-1 text-[10px] text-gray-500 select-none">
          <span>Powered by Groq</span>
          <span>{input.length} / 2000</span>
        </div>
      </form>
    </div>
  );
};
