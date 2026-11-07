import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const difficulties = ["easy", "medium", "hard"];
const optionIds = ["A", "B", "C", "D"];

function numbers(text) {
  return [...text.replace(/\s*\(set .*?\)$/, "").matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
}
function options(answer) {
  const delta = Math.max(2, Math.round(Math.abs(answer) * 0.1));
  return [answer + delta, Math.max(0, answer - delta), answer + delta * 2, answer].map((text, index) => ({ id: optionIds[index], text: String(text) }));
}

for (const difficulty of difficulties) {
  const path = resolve(ROOT, `questions/number-series/${difficulty}.json`);
  const questions = JSON.parse(await readFile(path, "utf8"));
  for (const question of questions.slice(10)) {
    const values = numbers(question.question);
    let answer;
    if (question.topic === "squares") answer = (Math.sqrt(values.at(-1)) + 1) ** 2;
    else if (question.topic === "cubes") answer = (Math.cbrt(values.at(-1)) + 1) ** 3;
    else if (question.topic === "second-differences" || question.topic === "differences") {
      const differences = values.slice(1).map((value, index) => value - values[index]);
      const nextDifference = differences.at(-1) + (differences.at(-1) - differences.at(-2));
      answer = values.at(-1) + nextDifference;
    } else if (question.topic === "alternating-pattern") answer = values.at(-1) * 2;
    else if (question.topic === "mixed-pattern") answer = values.at(-1) * 2 + 1;
    else continue;

    question.correctAnswer = "D";
    question.options = options(answer);
    question.explanation = `The pattern continues to give ${answer}.`;
  }
  await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`);
}
console.log("Repaired generated series answer calculations.");
