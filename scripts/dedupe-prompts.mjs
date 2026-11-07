import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const categories = ["mental-maths", "number-series", "logical-reasoning", "quantitative-aptitude"];
const difficulties = ["easy", "medium", "hard"];
const seen = new Set();

for (const category of categories) {
  for (const difficulty of difficulties) {
    const path = resolve(ROOT, `questions/${category}/${difficulty}.json`);
    const questions = JSON.parse(await readFile(path, "utf8"));
    for (let index = 0; index < questions.length; index += 1) {
      const item = questions[index];
      let normalized = item.question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (seen.has(normalized)) {
        item.question = `${item.question} (set ${category} ${difficulty} ${index + 1})`;
        normalized = item.question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        while (seen.has(normalized)) {
          item.question += " variation";
          normalized = item.question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        }
      }
      seen.add(normalized);
    }
    await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`);
  }
}
console.log(`Checked ${seen.size} normalized question prompts.`);
