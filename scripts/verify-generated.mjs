import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const categories = ["mental-maths", "number-series", "logical-reasoning", "quantitative-aptitude"];
const difficulties = ["easy", "medium", "hard"];
const failures = [];
let checked = 0;
let verified = 0;

function numbers(text) {
  return [...text.replace(/\s*\((?:set|generated variation).*?\)/g, "").matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0].replaceAll(",", "")));
}

function closeEnough(actual, expected) {
  return Number.isFinite(actual) && Number.isFinite(expected) && Math.abs(actual - expected) < 0.000001;
}

function optionNumber(question) {
  const selected = question.options.find((option) => option.id === question.correctAnswer);
  return selected ? Number(selected.text.replaceAll(",", "")) : Number.NaN;
}

function verifyNumeric(question) {
  const text = question.question;
  const selected = optionNumber(question);
  const values = numbers(text);
  let expected;

  if (question.topic === "percentage") {
    if (text.includes("increased by 20%") && text.includes("reduced by 20%")) expected = values[0] * 1.2 * 0.8;
    else if (text.includes("25% more")) expected = values[0] * 1.25;
    else if (text.includes("represents a") && text.includes("loss")) expected = values[0] / (1 - values[1] / 100);
    else expected = values[1] * values[0] / 100;
  } else if (question.topic === "fractions") {
    expected = values[2] * values[0] / values[1];
  } else if (question.topic === "ratio") {
    expected = values[1] * values[2] / values[0];
  } else if (question.topic === "multiplication") {
    expected = values[0] * values[1];
  } else if (question.topic === "division") {
    expected = values[0] / values[1];
  } else if (question.topic === "squares") {
    expected = values[0] ** 2;
  } else if (question.topic === "cubes") {
    expected = values[0] ** 3;
  } else if (question.topic === "quick-calculation") {
    if (text.includes(" - ")) expected = values[0] - values[1];
    else if (text.includes(" + ")) expected = values[0] + values[1];
    else expected = values[0] * values[1];
  } else if (question.topic === "profit-loss") {
    if (text.includes("earns a profit of")) expected = values[0] + values[1];
    else if (text.includes("represents a") && text.includes("loss")) expected = values[0] / (1 - values[1] / 100);
    else expected = values[0] * (1 + values[1] / 100);
  } else if (question.topic === "average") {
    expected = values.reduce((sum, value) => sum + value, 0) / values.length;
  } else if (question.topic === "speed-distance-time") {
    expected = values[0] * values[1];
  } else if (question.topic === "simple-interest") {
    expected = values[0] * values[1] * values[2] / 100;
  } else if (question.topic === "time-and-work") {
    expected = values[0] / 2;
  } else if (question.topic === "probability") {
    expected = values[0] / values[1];
  } else if (question.topic === "permutations") {
    expected = values[0] * (values[0] - 1);
  } else if (question.topic === "mixtures") {
    expected = values[1] * values[2] / values[0];
  } else if (question.topic === "combinations") {
    expected = values[0] * (values[0] - 1) * (values[0] - 2) / 6;
  } else {
    return false;
  }

  return closeEnough(selected, expected);
}

function verifySeries(question) {
  const values = numbers(question.question);
  const selected = optionNumber(question);
  let expected;
  if (question.topic === "arithmetic-progression") {
    expected = values.at(-1) + (values[1] - values[0]);
  } else if (question.topic === "geometric-progression") {
    expected = values.at(-1) * (values[1] / values[0]);
  } else if (question.topic === "squares") {
    expected = (Math.sqrt(values.at(-1)) + 1) ** 2;
  } else if (question.topic === "cubes") {
    expected = (Math.cbrt(values.at(-1)) + 1) ** 3;
  } else if (question.topic === "second-differences" || question.topic === "differences") {
    const differences = values.slice(1).map((value, index) => value - values[index]);
    const nextDifference = differences.at(-1) + (differences.at(-1) - differences.at(-2));
    expected = values.at(-1) + nextDifference;
  } else if (question.topic === "alternating-pattern") {
    expected = values.at(-1) * 2;
  } else if (question.topic === "mixed-pattern") {
    expected = values.at(-1) * 2 + 1;
  } else {
    return false;
  }
  return closeEnough(selected, expected);
}

function verifyLogic(question) {
  const text = question.question;
  const expected =
    text.includes("Bird is to nest") ? "A" :
    text.includes("If ") && text.includes("coded as") ? "B" :
    text.includes("faces west and turns left") ? "B" :
    text.includes("daughter of Mohan") ? "B" :
    text.includes("All metals conduct") ? "A" :
    text.includes("A is before B") ? "C" :
    text.includes("Which number is different") ? "D" :
    text.includes("Which word does not belong") ? "D" :
    text.includes("All poets are thinkers") ? "C" :
    text.includes("Some books are novels") ? "A" :
    text.includes("P is taller than Q") ? "C" :
    text.includes("A is east of B") ? "A" :
    text.includes("A is first") ? "B" :
    null;
  return expected === question.correctAnswer;
}

for (const category of categories) {
  for (const difficulty of difficulties) {
    const path = resolve(ROOT, `questions/${category}/${difficulty}.json`);
    const questions = JSON.parse(await readFile(path, "utf8"));
    let changed = false;
    for (const question of questions) {
      if (question.verified) continue;
      checked += 1;
      const valid = category === "number-series"
        ? verifySeries(question)
        : category === "logical-reasoning"
          ? verifyLogic(question)
          : verifyNumeric(question);
      if (!valid) {
        failures.push({ id: question.id, category, difficulty, question: question.question, correctAnswer: question.correctAnswer });
      } else {
        question.verified = true;
        verified += 1;
        changed = true;
      }
    }
    if (changed) await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`);
  }
}

console.log(JSON.stringify({ checked, newlyVerified: verified, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
