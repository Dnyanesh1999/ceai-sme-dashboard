export const TOPICS = {
  identify: {
    prompt: "How can I identify my tape format?",
    response: "Check the label and size of the cassette. Full-size VHS tapes are about 19 cm wide. VHS-C is much smaller but normally carries the VHS-C mark. MiniDV is a compact cassette labelled MiniDV, while Video8 and Hi8 tapes usually show 8 or Hi8 on the case. If the label is missing, do not force the tape into any player; a clear photo can be reviewed by the team."
  },
  packaging: {
    prompt: "How should I package my VHS tapes?",
    response: "Package your tapes in three steps:\n\n1. **Use a strong box** - choose sturdy cardboard, not a soft mailing bag.\n2. **Wrap each tape** - keep tapes in their cases and add bubble wrap or clean paper.\n3. **Fill empty space** - add packing material so nothing moves when the box is gently shaken.\n\nAdd your name and order reference inside the box before sealing it."
  },
  pricing: {
    prompt: "How does pricing work?",
    response: "Standard digitisation starts from EUR 15 per tape. The final price depends on the tape format, recording length and physical condition. Damaged or mould-affected media needs inspection before a quote. You will always receive the quote before any extra restoration work begins."
  },
  tracking: {
    prompt: "Can I track my order?",
    response: "Yes. Enter your ReelRevive reference in the format RR-1048. This classroom prototype recognises the sample order RR-1048; other references need a human support check."
  },
  privacy: {
    prompt: "How do you protect private recordings?",
    response: "Recordings are treated as confidential customer material. Only the staff handling the restoration should access them, and delivery links should be shared only with the customer. Please do not type sensitive personal details into this chat. Privacy, deletion or access requests should be passed to a human team member."
  }
};

const INTENTS = [
  { topic: "packaging", words: ["pack", "box", "wrap", "post", "ship", "send"] },
  { topic: "identify", words: ["identify", "format", "type", "mini dv", "minidv", "vhs-c", "hi8", "video8"] },
  { topic: "pricing", words: ["price", "pricing", "cost", "euro", "quote", "charge"] },
  { topic: "tracking", words: ["track", "tracking", "status", "order", "rr-"] },
  { topic: "privacy", words: ["privacy", "private", "secure", "security", "delete", "data", "confidential"] }
];

export function localReply(input) {
  const text = input.trim().toLowerCase();

  if (!text) {
    return "Please enter a question about your tapes or order.";
  }

  if (/\brr[- ]?1048\b/i.test(text)) {
    return "Sample order RR-1048 is at the quality-check stage. The tapes have been digitised and the files are being reviewed before delivery. This is demonstration data, not a live customer record.";
  }

  if (/\b(damaged|mould|mold|broken|snapped|wet)\b/i.test(text)) {
    return "Damaged, wet or mould-affected media should not be played or cleaned at home. Keep it separate from other tapes and request human support so the condition can be assessed safely.";
  }

  const match = INTENTS
    .map((intent) => ({ ...intent, score: intent.words.filter((word) => text.includes(word)).length }))
    .sort((a, b) => b.score - a.score)[0];

  if (match?.score > 0) {
    return TOPICS[match.topic].response;
  }

  return "I could not match that question to the ReelRevive support guide. I can help with tape identification, packaging, pricing, order tracking or privacy. For anything else, choose human support.";
}

