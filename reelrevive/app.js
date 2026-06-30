import { localReply, TOPICS } from "./knowledge.js";

const API_URL =
  window.REELREVIVE_API_URL ||
  "https://reelrevive-support-chatbot.vercel.app/api/chat";

const messagesEl = document.querySelector("#messages");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const resetButton = document.querySelector("#resetButton");
const connectionStatus = document.querySelector("#connectionStatus");
const rail = document.querySelector("#topicRail");
const backdrop = document.querySelector("#backdrop");
const handoffDialog = document.querySelector("#handoffDialog");
const conversation = [];

function refreshIcons() {
  window.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
}

function escapeHtml(value) {
  const node = document.createElement("div");
  node.textContent = value;
  return node.innerHTML;
}

function formatReply(value) {
  const safe = escapeHtml(value);
  return safe
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

function appendMessage(role, content, options = {}) {
  const article = document.createElement("article");
  article.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;

  if (role === "assistant") {
    article.innerHTML = `
      <div class="message-avatar" aria-hidden="true"><i data-lucide="disc-3"></i></div>
      <div class="message-bubble"><p>${formatReply(content)}</p></div>`;
  } else {
    article.innerHTML = `<div class="message-bubble"><p>${escapeHtml(content)}</p></div>`;
  }

  if (options.className) article.classList.add(options.className);
  messagesEl.append(article);
  refreshIcons();
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return article;
}

function showTyping() {
  const article = document.createElement("article");
  article.className = "message assistant-message typing";
  article.innerHTML = `
    <div class="message-avatar" aria-hidden="true"><i data-lucide="disc-3"></i></div>
    <div class="message-bubble" aria-label="Assistant is typing"><span></span><span></span><span></span></div>`;
  messagesEl.append(article);
  refreshIcons();
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return article;
}

async function requestReply(userMessage) {
  if (!API_URL) {
    return { reply: localReply(userMessage), source: "local" };
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation.slice(-10) })
    });

    if (!response.ok) throw new Error(`Request failed with ${response.status}`);
    const data = await response.json();
    if (!data.reply) throw new Error("Empty assistant response");
    return data;
  } catch (error) {
    console.warn("AI service unavailable; using verified local guidance.", error);
    return { reply: localReply(userMessage), source: "local" };
  }
}

async function sendMessage(text) {
  const value = text.trim();
  if (!value || sendButton.disabled) return;

  appendMessage("user", value);
  conversation.push({ role: "user", content: value });
  input.value = "";
  input.style.height = "auto";
  sendButton.disabled = true;
  connectionStatus.textContent = "Replying";
  const typing = showTyping();

  const result = await requestReply(value);
  typing.remove();
  appendMessage("assistant", result.reply);
  conversation.push({ role: "assistant", content: result.reply });
  connectionStatus.textContent = result.source === "local" ? "Online - verified guide" : "Online";
  sendButton.disabled = false;
  input.focus();
}

function resetChat() {
  conversation.length = 0;
  messagesEl.innerHTML = "";
  appendMessage("assistant", "Hello. I can help with tape formats, packaging, pricing and order tracking. What would you like to know?");
  connectionStatus.textContent = "Online";
  document.querySelectorAll(".topic").forEach((item) => item.classList.remove("active"));
  input.focus();
}

function closeRail() {
  rail.classList.remove("open");
  backdrop.hidden = true;
}

function openRail() {
  rail.classList.add("open");
  backdrop.hidden = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 130)}px`;
});

resetButton.addEventListener("click", resetChat);
document.querySelector("#menuButton").addEventListener("click", openRail);
document.querySelector("#railClose").addEventListener("click", closeRail);
backdrop.addEventListener("click", closeRail);

document.querySelectorAll(".topic").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".topic").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    closeRail();
    sendMessage(TOPICS[button.dataset.topic].prompt);
  });
});

function openHandoff() {
  if (typeof handoffDialog.showModal === "function") handoffDialog.showModal();
}

document.querySelector("#humanTop").addEventListener("click", openHandoff);
document.querySelector("#humanRail").addEventListener("click", openHandoff);
document.querySelector("#confirmHandoff").addEventListener("click", () => {
  appendMessage("assistant", "Your request has been marked for human support in this demonstration. Please keep your order reference ready and do not send sensitive personal details in chat.");
});

refreshIcons();
input.focus();
