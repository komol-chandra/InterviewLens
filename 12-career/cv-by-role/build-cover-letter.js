// Common cover / motivation letter — same visual style as the role CVs.
// Yellow-highlighted text = fill in per company before sending.
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, ExternalHyperlink, BorderStyle } = require("docx");

const OUT = process.argv[2] || ".";
const FONT = "Noto Sans", NAVY = "1F2B4D", LINK = "1155CC", SZ = 21;
const r = (text, o = {}) => new TextRun({ text, font: FONT, size: SZ, ...o });
const fill = (text) => r(text, { highlight: "yellow" });
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

  // 1. Hook + who I am
  p([
    r("I am a Software Engineer with 5+ years of experience building production systems, most recently a multi-tenant SaaS platform used by 100+ enterprise clients across 40+ industries. I am applying for the "),
    fill("[Role Title]"),
    r(" role because I want to bring that experience to a team where engineering quality and product impact go hand in hand."),
  ]),

  // 2. Journey
  p([
    r("My path into software was not a straight line. I started with a diploma in Data Telecommunication and Networking, taught myself web development, and joined Am Coders as an intern, where I was promoted to Software Engineer within one month and shipped a SaaS product sold on the CodeCanyon marketplace. At SoftArch I built multi-store e-commerce platforms with POS integration, payments and CI/CD. Since 2023 I have worked at Sokrio while completing my BSc in Computer Science and Engineering at BUBT, learning to balance real production responsibility with formal study."),
  ]),

  // 3. Proof of impact
  p([
    r("At Sokrio I own work end to end. I built tenant isolation and territory-scoped access control with zero cross-tenant data leakage, redesigned heavy reporting over millions of records so reports load up to 85% faster, led a frontend rewrite to React, Next.js and TypeScript in two months that raised user engagement by 30%, and built a FastAPI benchmark and market-intelligence service. As the primary on-call engineer for six production apps, I helped cut issue resolution time by 65%. Before each module I write a technical specification, so product, design and engineering agree before the first line of code."),
  ]),

  // 4. Passion + current effort
  p([
    r("What drives me is turning slow, fragile systems into fast, reliable ones, and finding where new tools change how we build. I use AI-assisted development every day through a multi-agent Claude Code setup I designed, and I built a retrieval-augmented memory tool with hybrid search for my own engineering work. I keep investing in the next level: system design, AWS (working toward the Solutions Architect Associate certification), applied AI engineering with LLMs and RAG, and daily problem-solving practice."),
  ]),

  // 5. Future goal + company fit (customise)
  p([
    r("Over the next few years I want to grow into a senior engineer who can lead the design of large systems, mentor others and connect technical decisions to product outcomes. "),
    fill("[One or two sentences on why this company: its product, its engineering culture, or a specific challenge in the job description, and how my experience fits it.]"),
  ]),

  // 6. Close
  p([
    r("I would welcome the chance to discuss how I can contribute to "),
    fill("[Company Name]"),
    r(". Thank you for your time and consideration."),
  ], 240),

  p([r("Sincerely,")], 0),
  p([r("Komol Chandra Devnath", { bold: true })], 0),
];

const doc = new Document({
  creator: "Komol Chandra Devnath",
  title: "Komol Chandra Devnath - Cover Letter",
  styles: { default: { document: { run: { font: FONT, size: SZ } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1000, right: 1000 } } },
    children,
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync(path.join(OUT, "Komol_Cover_Letter_Common.docx"), b);
  console.log("wrote Komol_Cover_Letter_Common.docx");
});
