import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const MANIFEST_PATH = resolve(ROOT, "manifest.json");
const REPORT_DIR = resolve(ROOT, "reports");
const sampleMode = process.argv.includes("--sample");

const categories = [
  "mental-maths",
  "number-series",
  "logical-reasoning",
  "quantitative-aptitude",
];
const difficulties = ["easy", "medium", "hard"];
const optionIds = ["A", "B", "C", "D"];

const failures = [];
const duplicateQuestions = [];
const manualReview = [];
const allIds = new Map();
const normalizedQuestions = new Map();
const pendingVerification = [];
const counts = Object.fromEntries(
  categories.map((category) => [category, Object.fromEntries(difficulties.map((difficulty) => [difficulty, 0]))]),
);
let totalQuestions = 0;
let verifiedQuestions = 0;

const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));

for (const category of categories) {
  for (const difficulty of difficulties) {
    const relativePath = `questions/${category}/${difficulty}.json`;
    const filePath = resolve(ROOT, relativePath);
    let questions;

    try {
      questions = JSON.parse(await readFile(filePath, "utf8"));
    } catch (error) {
      failures.push({ file: relativePath, issue: `Invalid or unreadable JSON: ${error.message}` });
      continue;
    }

    if (!Array.isArray(questions)) {
      failures.push({ file: relativePath, issue: "File must contain a JSON array." });
      continue;
    }

    for (const [index, question] of questions.entries()) {
      const location = `${relativePath}[${index}]`;
      totalQuestions += 1;
      counts[category][difficulty] += 1;

      if (!question || typeof question !== "object") {
        failures.push({ file: location, issue: "Question must be an object." });
        continue;
      }

      const required = [
        "id", "category", "topic", "difficulty", "question", "options",
        "correctAnswer", "explanation", "source", "verified",
      ];
      for (const field of required) {
        if (!(field in question)) failures.push({ file: location, issue: `Missing field: ${field}` });
      }

      if (typeof question.id !== "string" || question.id.length === 0) {
        failures.push({ file: location, issue: "ID must be a non-empty string." });
      } else if (allIds.has(question.id)) {
        failures.push({ file: location, issue: `Duplicate ID also found at ${allIds.get(question.id)}.` });
      } else {
        allIds.set(question.id, location);
      }

      if (question.category !== category) failures.push({ file: location, issue: `Category must be ${category}.` });
      if (!difficulties.includes(question.difficulty)) failures.push({ file: location, issue: "Invalid difficulty." });
      if (typeof question.topic !== "string" || question.topic.trim() === "") failures.push({ file: location, issue: "Topic must be non-empty." });
      if (typeof question.question !== "string" || question.question.trim() === "") failures.push({ file: location, issue: "Question text must be non-empty." });
      if (typeof question.explanation !== "string" || question.explanation.trim() === "") failures.push({ file: location, issue: "Explanation must be non-empty." });
      if (question.source !== "generated") failures.push({ file: location, issue: "Source must be generated." });
      if (question.verified !== true) pendingVerification.push({ file: location, issue: "Question is pending independent verification." });
      if (question.verified === true) verifiedQuestions += 1;

      if (!Array.isArray(question.options) || question.options.length !== 4) {
        failures.push({ file: location, issue: "Exactly four options are required." });
      } else {
        const ids = question.options.map((option) => option?.id);
        const texts = question.options.map((option) => option?.text);
        if (JSON.stringify([...ids].sort()) !== JSON.stringify(optionIds)) failures.push({ file: location, issue: "Option IDs must be exactly A, B, C, and D." });
        if (new Set(ids).size !== 4) failures.push({ file: location, issue: "Option IDs must be unique." });
        if (new Set(texts).size !== 4) failures.push({ file: location, issue: "Option text must be unique." });
        if (!optionIds.includes(question.correctAnswer)) failures.push({ file: location, issue: "Correct answer must reference an option ID." });
      }

      const normalized = String(question.question).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (normalizedQuestions.has(normalized)) {
        duplicateQuestions.push({ file: location, duplicateOf: normalizedQuestions.get(normalized) });
      } else {
        normalizedQuestions.set(normalized, location);
      }

      if (question.category === "logical-reasoning") manualReview.push({ file: location, reason: "Logical reasoning requires human ambiguity review." });
    }

    const expected = sampleMode ? 10 : manifest.expectedCounts?.[category]?.[difficulty];
    if (questions.length !== expected) failures.push({ file: relativePath, issue: `Expected ${expected} questions, found ${questions.length}.` });
  }
}

const report = {
  bankVersion: manifest.bankVersion,
  mode: sampleMode ? "sample" : "complete",
  totalQuestions,
  counts,
  expectedTotal: manifest.totalQuestions,
  verifiedQuestions,
  rejectedQuestions: failures.length,
  pendingVerificationCount: pendingVerification.length,
  manualReviewCount: manualReview.length,
  duplicateCount: duplicateQuestions.length,
  failures,
  pendingVerification,
  duplicateQuestions,
  manualReview,
};

await mkdir(REPORT_DIR, { recursive: true });
await writeFile(resolve(REPORT_DIR, "validation-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length > 0 || duplicateQuestions.length > 0 || pendingVerification.length > 0) process.exitCode = 1;
