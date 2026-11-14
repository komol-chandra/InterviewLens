// Story-driven cover letter (v3) — same visual style as the role CVs.
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

  p([r("Dear Hiring Team,")]),

  p([r("I did not come into software through the usual door. I started with a diploma in engineering, not a computer science degree, and my first job was an internship at a small company. Within weeks I was promoted to Software Engineer, and soon I was shipping a SaaS product sold on the CodeCanyon marketplace. Real buyers reported real bugs, and I learned early that every line of code is a promise to someone on the other side.")]),

  p([r("That lesson has guided me ever since. I built e-commerce platforms where real money and real stock moved through my code. Since 2023 I have worked on a multi-tenant SaaS platform that 100+ enterprise companies run their distribution business on every day. When heavy reports over millions of records became a bottleneck for our clients, I rebuilt the pipeline and made them up to 85% faster. I designed tenant isolation so that no client could ever see another client's data, and it has held with zero leaks. As the primary on-call engineer for six production apps, I learned to stay calm when things break, and we cut issue resolution time by 65%. All of this happened while I was completing my BSc in Computer Science and Engineering alongside full-time work.")]),

  p([r("I have never waited for a role to tell me what to learn next. Today I am deepening system design, preparing for the AWS Solutions Architect certification, and building with LLMs and RAG. I built my own retrieval-based memory tool because I wanted to understand how these systems work, not just use them.")]),

  p([r("My goal is to become a senior engineer who designs systems that last and helps the people around me grow. I am looking for a team that builds products people depend on, takes ownership seriously and values engineers who keep learning. That is the kind of team I want to grow with, and where I believe I can add real value from day one.")]),

  p([r("I would be glad to talk about how I can contribute to your team. Thank you for reading my story.")], 240),

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
  fs.writeFileSync(path.join(OUT, "Komol_Cover_Letter_Story.docx"), b);
  console.log("wrote Komol_Cover_Letter_Story.docx");
});
