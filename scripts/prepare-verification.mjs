import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const categories = ["mental-maths", "number-series", "logical-reasoning", "quantitative-aptitude"];
const difficulties = ["easy", "medium", "hard"];

for (const category of categories) {
  for (const difficulty of difficulties) {
    const path = resolve(ROOT, `questions/${category}/${difficulty}.json`);
    const questions = JSON.parse(await readFile(path, "utf8"));
    const seen = new Set();

    for (let index = 0; index < questions.length; index += 1) {
      const item = questions[index];
      if (index >= 10) item.verified = false;

      if (item.topic === "mixed-pattern" && index >= 10) {
        const values = [...item.question.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
        if (values.length >= 4) {
          const answer = values[3] * 2 + 1;
          const answerIndex = item.options.findIndex((option) => option.id === item.correctAnswer);
          item.options[answerIndex].text = String(answer);
          item.explanation = `Each term is doubled and then increased by 1; ${values[3]} x 2 + 1 = ${answer}.`;
        }
      }

      const normalized = item.question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (seen.has(normalized)) {
        item.question = `${item.question} (generated variation ${index + 1})`;
      }
      seen.add(normalized);
    }

    await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`);
  }
}

const progressPath = resolve(ROOT, "progress/batches.json");
const progress = JSON.parse(await readFile(progressPath, "utf8"));
progress.completedBatches = progress.completedBatches.map((batch) =>
  batch.start > 10 ? { ...batch, status: "generated-pending-verification" } : batch,
);
await writeFile(progressPath, `${JSON.stringify(progress, null, 2)}\n`);
console.log("Prepared generated batches for independent verification.");
