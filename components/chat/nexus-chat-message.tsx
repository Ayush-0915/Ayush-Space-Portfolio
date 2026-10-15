"use client";

import React from "react";
import { UserIcon } from "@heroicons/react/24/solid";
import { NexusPlanetIcon } from "./nexus-icons";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  isError?: boolean;
}

interface NexusChatMessageProps {
  message: ChatMessage;
  onRetry?: () => void;
}

/**
 * Lightweight, safe parser for portfolio assistant markdown:
 * Supports code blocks, inline code, bold text, links, and list items.
 */
function renderMarkdownContent(text: string) {
  // Check for code blocks ```...```
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(renderTextWithInlineStyles(text.slice(lastIndex, match.index), `text-${lastIndex}`));
    }
    const codeContent = match[1].trim();
    // Optional language tag on first line
    const firstNewline = codeContent.indexOf("\n");
    let displayCode = codeContent;
    let language = "";
    if (firstNewline !== -1 && !codeContent.slice(0, firstNewline).includes(" ")) {
      language = codeContent.slice(0, firstNewline);
      displayCode = codeContent.slice(firstNewline + 1);
    }

    segments.push(
      <div key={`code-block-${match.index}`} className="my-2.5 overflow-hidden rounded-lg border border-violet-500/30 bg-[#060217]">
        {language && (
          <div className="flex items-center justify-between border-b border-violet-500/20 bg-violet-950/40 px-3 py-1 text-[10px] font-mono text-cyan-300 uppercase tracking-wider">
            <span>{language}</span>
          </div>
        )}
        <pre className="p-3 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
          <code>{displayCode}</code>
        </pre>
      </div>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push(renderTextWithInlineStyles(text.slice(lastIndex), `text-${lastIndex}`));
  }

  return segments;
}

function renderTextWithInlineStyles(rawText: string, keyPrefix: string) {
  const lines = rawText.split("\n");

  return (
    <React.Fragment key={keyPrefix}>
      {lines.map((line, lineIndex) => {
        // Bullet list item
        const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
        const lineContent = isBullet ? line.trim().slice(2) : line;

        // Markdown links [text](url)
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g;
        const lineParts: React.ReactNode[] = [];
        let linkLastIndex = 0;
        let linkMatch: RegExpExecArray | null;

        while ((linkMatch = linkRegex.exec(lineContent)) !== null) {
          if (linkMatch.index > linkLastIndex) {
            lineParts.push(lineContent.slice(linkLastIndex, linkMatch.index));
          }
          const label = linkMatch[1];
          const href = linkMatch[2];
          lineParts.push(
            <a
              key={`link-${lineIndex}-${linkMatch.index}`}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-cyan-300 underline underline-offset-2 hover:text-cyan-200 transition-colors"
            >
              {label}
            </a>
          );
          linkLastIndex = linkMatch.index + linkMatch[0].length;
        }

        if (linkLastIndex < lineContent.length) {
          lineParts.push(lineContent.slice(linkLastIndex));
        }

        // Inline code and bold parsing
        const styledParts = lineParts.map((part, partIndex) => {
          if (typeof part !== "string") return part;

          // Inline code `...`
          const codeSplits = part.split(/(`[^`]+`)/g);
          return codeSplits.map((codeSeg, codeIndex) => {
            if (codeSeg.startsWith("`") && codeSeg.endsWith("`") && codeSeg.length > 2) {
              return (
                <code
                  key={`inline-code-${lineIndex}-${partIndex}-${codeIndex}`}
                  className="rounded border border-violet-500/25 bg-[#170a36] px-1.5 py-0.5 font-mono text-xs text-cyan-300"
                >
                  {codeSeg.slice(1, -1)}
                </code>
              );
            }

            // Bold **...**
            const boldSplits = codeSeg.split(/(\*\*[^*]+\*\*)/g);
            return boldSplits.map((boldSeg, boldIndex) => {
              if (boldSeg.startsWith("**") && boldSeg.endsWith("**") && boldSeg.length > 4) {
                return (
                  <strong
                    key={`b-${lineIndex}-${partIndex}-${codeIndex}-${boldIndex}`}
                    className="font-semibold text-white"
                  >
                    {boldSeg.slice(2, -2)}
                  </strong>
                );
              }
              return boldSeg;
            });
          });
        });

        if (isBullet) {
          return (
            <div key={`bullet-${lineIndex}`} className="flex items-start gap-2 my-1 pl-1">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              <div className="flex-1">{styledParts}</div>
            </div>
          );
        }

        return (
          <React.Fragment key={`line-${lineIndex}`}>
            {lineIndex > 0 && <br />}
            {styledParts}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
}

export const NexusChatMessage = ({ message, onRetry }: NexusChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`group flex w-full gap-2.5 my-2.5 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Nexus AI Avatar on Left */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-gradient-to-tr from-[#2A0E61] via-[#1a0a3a] to-[#0c0728] shadow-[0_0_12px_rgba(6,182,212,0.35)]">
          <NexusPlanetIcon className="h-5 w-5" />
        </div>
      )}

      {/* Message Bubble + Timestamp Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`font-sans rounded-2xl px-4 py-3 text-sm leading-[1.65] transition-all break-words ${
            isUser
              ? "rounded-tr-sm border border-violet-400/30 bg-gradient-to-r from-[#2c135c]/95 via-[#1d144e]/95 to-[#131b46]/95 text-white shadow-md shadow-purple-950/40"
              : message.isError
              ? "rounded-tl-sm border border-rose-500/40 bg-[#1c0817]/95 text-rose-200 shadow-md shadow-rose-950/30"
              : "rounded-tl-sm border border-violet-400/25 bg-[#0d0724]/90 text-gray-200 shadow-[0_0_20px_rgba(112,66,248,0.15)] backdrop-blur-md"
          }`}
        >
          {renderMarkdownContent(message.content)}

          {message.isError && onRetry && (
            <div className="mt-3 pt-2 border-t border-rose-500/20 flex items-center gap-3">
              <button
                type="button"
                onClick={onRetry}
                className="font-sans text-xs font-medium text-cyan-300 hover:text-cyan-200 underline underline-offset-2 transition-colors"
              >
                Retry question
              </button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <span className="font-mono mt-1 px-1 text-[10px] text-gray-400 select-none">
            {message.timestamp}
          </span>
        )}
      </div>

      {/* User Avatar on Right */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-400/40 bg-gradient-to-tr from-[#3b1274] to-[#121c4b] shadow-[0_0_10px_rgba(167,139,250,0.3)]">
          <UserIcon className="h-4 w-4 text-purple-200" />
        </div>
      )}
    </div>
  );
};
