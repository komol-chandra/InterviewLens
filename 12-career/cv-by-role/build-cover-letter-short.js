// Short, minimal cover letter (key points) — same visual style as the role CVs.
// Yellow-highlighted text = fill in per company before sending.
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, ExternalHyperlink, BorderStyle, LevelFormat, AlignmentType } = require("docx");

const OUT = process.argv[2] || ".";
const FONT = "Noto Sans", NAVY = "1F2B4D", LINK = "1155CC", SZ = 21;
const r = (text, o = {}) => new TextRun({ text, font: FONT, size: SZ, ...o });
const fill = (text) => r(text, { highlight: "yellow" });
const kp = (label, text) => new Paragraph({
  numbering: { reference: "bul", level: 0 },
  spacing: { after: 80, line: 264 },
  children: [r(label + ": ", { bold: true }), r(text)],
});
const p = (children, after = 160) => new Paragraph({ spacing: { after, line: 264 }, children });

const children = [
  new Paragraph({ spacing: { after: 20 }, children: [r("KOMOL CHANDRA DEVNATH", { bold: true, size: 40, color: NAVY })] }),
  new Paragraph({ spacing: { after: 0 }, children: [r("Software Engineer | Backend, Full-Stack and AI", { bold: true, size: 22 })] }),
  new Paragraph({ spacing: { after: 0 }, children: [r("Dhaka, Bangladesh | +880 1874303467 | komolnath67@gmail.com")] }),
  new Paragraph({
    spacing: { after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 4 } },
    children: [
      r("GitHub: "),
      new ExternalHyperlink({ link: "https://github.com/komol-chandra", children: [r("github.com/komol-chandra", { color: LINK, underline: {} })] }),
      r(" | LinkedIn: "),
      new ExternalHyperlink({ link: "https://linkedin.com/in/komol-chandra", children: [r("linkedin.com/in/komol-chandra", { color: LINK, underline: {} })] }),
    ],
  }),

  p([fill("[Date]")], 120),
  p([r("Hiring Team, "), fill("[Company Name]")], 0),
  p([r("Re: "), fill("[Role Title]")], 200),

  p([r("Dear Hiring Team,")]),

  p([
    r("I am a Software Engineer with 5+ years of experience building production systems, applying for the "),
    fill("[Role Title]"),
    r(" role at "),
    fill("[Company Name]"),
    r(". In short:"),
  ], 100),

  kp("Journey", "From a networking diploma to intern, promoted to Software Engineer in one month; then e-commerce platforms, and since 2023 a multi-tenant SaaS used by 100+ enterprise clients, while completing my BSc in CSE."),
  kp("Impact", "Reports up to 85% faster, zero cross-tenant data leakage, a React and Next.js rewrite in two months (+30% engagement), and 65% faster issue resolution as primary on-call engineer."),
  kp("How I work", "I own features end to end, write the spec before the code, and keep learning every day, from system design and AWS to applied AI with LLMs and RAG."),
  kp("Goal", "Grow into a senior engineer who designs large systems, mentors others and connects technical decisions to product outcomes."),

  new Paragraph({ spacing: { before: 120, after: 160, line: 264 }, children: [fill("[One sentence on why this company and how my experience fits the role.]")] }),

  p([
    r("I would welcome a conversation about how I can contribute. Thank you for your time."),
  ], 240),

  p([r("Sincerely,")], 0),
  p([r("Komol Chandra Devnath", { bold: true })], 0),
];

const doc = new Document({
  creator: "Komol Chandra Devnath",
  title: "Komol Chandra Devnath - Cover Letter",
  numbering: { config: [{ reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 220 } } } }] }] },
  styles: { default: { document: { run: { font: FONT, size: SZ } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1000, right: 1000 } } },
    children,
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync(path.join(OUT, "Komol_Cover_Letter_Short.docx"), b);
  console.log("wrote Komol_Cover_Letter_Short.docx");
});
