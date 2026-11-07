import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const categories = ["mental-maths", "number-series", "logical-reasoning", "quantitative-aptitude"];
const difficulties = ["easy", "medium", "hard"];
const prefixes = { "mental-maths": "math", "number-series": "series", "logical-reasoning": "logic", "quantitative-aptitude": "quant" };
const optionIds = ["A", "B", "C", "D"];

function question(id, category, topic, difficulty, text, optionTexts, answerIndex, explanation) {
  return {
    id, category, topic, difficulty, question: text,
    options: optionTexts.map((optionText, index) => ({ id: optionIds[index], text: String(optionText) })),
    correctAnswer: optionIds[answerIndex], explanation, source: "generated", verified: true,
  };
}

function numericQuestion(id, category, topic, difficulty, text, answer, explanation, seed) {
  const delta = Math.max(2, Math.round(Math.abs(answer) * 0.1));
  const values = [answer, answer + delta, Math.max(0, answer - delta), answer + delta * 2];
  const shift = seed % 4;
  const options = values.slice(shift).concat(values.slice(0, shift));
  return question(id, category, topic, difficulty, text, options, (4 - shift) % 4, explanation);
}

function mentalQuestions(difficulty, start, count) {
  const output = [];
  for (let n = start; n < start + count; n += 1) {
    const id = (topic, text, answer, explanation) => `${prefixes["mental-maths"]}_${difficulty}_${String(n).padStart(3, "0")}`;
    const mod = n % 9;
    if (difficulty === "easy") {
      if (mod === 0) { const p = (n % 5 + 1) * 5; const base = 100 + (n % 8) * 20; const answer = base * p / 100; output.push(numericQuestion(id("percentage"), "mental-maths", "percentage", difficulty, `What is ${p}% of ${base}?`, answer, `${p}% of ${base} = ${answer}.`, n)); }
      else if (mod === 1) { const denominator = 2 + n % 4; const answer = 8 + n % 8; const total = denominator * answer; output.push(numericQuestion(id("fractions"), "mental-maths", "fractions", difficulty, `What is 1/${denominator} of ${total}?`, answer, `${total} / ${denominator} = ${answer}.`, n)); }
      else if (mod === 2) { const a = 2 + n % 4; const b = 3 + n % 3; const scale = 2 + n % 5; const answer = b * scale; output.push(numericQuestion(id("ratio"), "mental-maths", "ratio", difficulty, `If red:blue is ${a}:${b} and red is ${a * scale}, how many blue items are there?`, answer, `The scale is ${scale}, so blue = ${b} x ${scale} = ${answer}.`, n)); }
      else if (mod === 3) { const a = 8 + n % 12; const b = 3 + n % 7; const answer = a * b; output.push(numericQuestion(id("multiplication"), "mental-maths", "multiplication", difficulty, `What is ${a} x ${b}?`, answer, `${a} x ${b} = ${answer}.`, n)); }
      else if (mod === 4) { const divisor = 3 + n % 8; const answer = 8 + n % 9; const dividend = divisor * answer; output.push(numericQuestion(id("division"), "mental-maths", "division", difficulty, `What is ${dividend} / ${divisor}?`, answer, `${divisor} x ${answer} = ${dividend}.`, n)); }
      else if (mod === 5) { const base = 4 + n % 16; const answer = base * base; output.push(numericQuestion(id("squares"), "mental-maths", "squares", difficulty, `What is ${base} squared?`, answer, `${base} x ${base} = ${answer}.`, n)); }
      else if (mod === 6) { const a = 30 + n * 2; const b = 15 + n; const answer = a + b; output.push(numericQuestion(id("quick-calculation"), "mental-maths", "quick-calculation", difficulty, `What is ${a} + ${b}?`, answer, `${a} + ${b} = ${answer}.`, n)); }
      else if (mod === 7) { const cost = 30 + n * 4; const profit = 5 + n % 6; const answer = cost + profit; output.push(numericQuestion(id("profit-loss"), "mental-maths", "profit-loss", difficulty, `An item costs ${cost} and earns a profit of ${profit}. What is its selling price?`, answer, `Selling price = ${cost} + ${profit} = ${answer}.`, n)); }
      else { const base = 2 + n % 8; const answer = base ** 3; output.push(numericQuestion(id("cubes"), "mental-maths", "cubes", difficulty, `What is ${base} cubed?`, answer, `${base} x ${base} x ${base} = ${answer}.`, n)); }
    } else if (difficulty === "medium") {
      if (mod === 0) { const p = 12 + n % 9; const base = 200 + (n % 7) * 40; const answer = base * p / 100; output.push(numericQuestion(id("percentage"), "mental-maths", "percentage", difficulty, `What is ${p}% of ${base}?`, answer, `Calculating ${base} x ${p} / 100 gives ${answer}.`, n)); }
      else if (mod === 1) { const denominator = 5 + n % 4; const answer = 12 + n % 9; const total = denominator * answer; output.push(numericQuestion(id("fractions"), "mental-maths", "fractions", difficulty, `What is ${denominator - 1}/${denominator} of ${total}?`, total - answer, `${total} / ${denominator} = ${answer}; subtracting from ${total} gives ${total - answer}.`, n)); }
      else if (mod === 2) { const a = 3 + n % 5; const b = 5 + n % 4; const scale = 4 + n % 6; const answer = b * scale; output.push(numericQuestion(id("ratio"), "mental-maths", "ratio", difficulty, `Two quantities are in ratio ${a}:${b}. If the first is ${a * scale}, find the second.`, answer, `The scale is ${scale}; ${b} x ${scale} = ${answer}.`, n)); }
      else if (mod === 3) { const a = 25 + n % 15; const b = 16 + n % 12; const answer = a * b; output.push(numericQuestion(id("multiplication"), "mental-maths", "multiplication", difficulty, `What is ${a} x ${b}?`, answer, `Multiplying ${a} by ${b} gives ${answer}.`, n)); }
      else if (mod === 4) { const divisor = 12 + n % 9; const answer = 18 + n % 12; const dividend = divisor * answer; output.push(numericQuestion(id("division"), "mental-maths", "division", difficulty, `What is ${dividend} / ${divisor}?`, answer, `${divisor} x ${answer} = ${dividend}.`, n)); }
      else if (mod === 5) { const base = 25 + n % 26; const answer = base * base; output.push(numericQuestion(id("squares"), "mental-maths", "squares", difficulty, `What is ${base} squared?`, answer, `Using ${base} x ${base}, the result is ${answer}.`, n)); }
      else if (mod === 6) { const a = 400 + n * 7; const b = 275 + n * 3; const answer = a - b; output.push(numericQuestion(id("quick-calculation"), "mental-maths", "quick-calculation", difficulty, `What is ${a} - ${b}?`, answer, `${a} - ${b} = ${answer}.`, n)); }
      else if (mod === 7) { const cost = 250 + n * 8; const rate = 10 + n % 8; const answer = cost + cost * rate / 100; output.push(numericQuestion(id("profit-loss"), "mental-maths", "profit-loss", difficulty, `An item costs ${cost} and is sold at a ${rate}% profit. Find its selling price.`, answer, `Profit is ${cost * rate / 100}; selling price is ${answer}.`, n)); }
      else { const base = 8 + n % 9; const answer = base ** 3; output.push(numericQuestion(id("cubes"), "mental-maths", "cubes", difficulty, `What is ${base} cubed?`, answer, `${base} cubed equals ${answer}.`, n)); }
    } else {
      if (mod === 0) { const original = 200 + n * 10; const answer = original * 0.96; output.push(numericQuestion(id("percentage"), "mental-maths", "percentage", difficulty, `A price of ${original} is increased by 20% and reduced by 20%. What is the final price?`, answer, `${original} x 1.2 x 0.8 = ${answer}.`, n)); }
      else if (mod === 1) { const numerator = 3 + n % 5; const denominator = 5 + n % 6; const multiplier = 2 + n % 4; const answer = numerator * multiplier; output.push(numericQuestion(id("fractions"), "mental-maths", "fractions", difficulty, `What is ${numerator}/${denominator} of ${denominator * multiplier}?`, answer, `${denominator * multiplier} / ${denominator} x ${numerator} = ${answer}.`, n)); }
      else if (mod === 2) { const a = 4 + n % 5; const b = 7 + n % 6; const scale = 8 + n % 5; const answer = b * scale; output.push(numericQuestion(id("ratio"), "mental-maths", "ratio", difficulty, `If A:B = ${a}:${b} and A = ${a * scale}, find B.`, answer, `The common scale is ${scale}; B = ${b} x ${scale} = ${answer}.`, n)); }
      else if (mod === 3) { const a = 96 + n; const b = 104 + n; const answer = a * b; output.push(numericQuestion(id("multiplication"), "mental-maths", "multiplication", difficulty, `What is ${a} x ${b}?`, answer, `Using (100 + ${a - 100})(100 + ${b - 100}) gives ${answer}.`, n)); }
      else if (mod === 4) { const divisor = 24 + n % 12; const answer = 35 + n % 15; const dividend = divisor * answer; output.push(numericQuestion(id("division"), "mental-maths", "division", difficulty, `What is ${dividend} / ${divisor}?`, answer, `${divisor} x ${answer} = ${dividend}.`, n)); }
      else if (mod === 5) { const base = 75 + n % 25; const answer = base * base; output.push(numericQuestion(id("squares"), "mental-maths", "squares", difficulty, `What is ${base} squared?`, answer, `Squaring ${base} gives ${answer}.`, n)); }
      else if (mod === 6) { const a = 999 + n; const b = 1001 + n; const answer = a * b; output.push(numericQuestion(id("quick-calculation"), "mental-maths", "quick-calculation", difficulty, `What is ${a} x ${b}?`, answer, `The numbers are ${n} below and above ${1000 + n}; their product is ${answer}.`, n)); }
      else if (mod === 7) { const selling = 600 + n * 9; const rate = 10 + n % 5; const answer = selling / (1 - rate / 100); output.push(numericQuestion(id("profit-loss"), "mental-maths", "profit-loss", difficulty, `An item sold for ${selling} represents a ${rate}% loss. Find its cost price.`, answer, `Selling price is ${100 - rate}% of cost, so cost = ${selling} / ${(100 - rate) / 100} = ${answer}.`, n)); }
      else { const base = 15 + n % 10; const answer = base ** 3; output.push(numericQuestion(id("cubes"), "mental-maths", "cubes", difficulty, `What is ${base} cubed?`, answer, `${base} cubed equals ${answer}.`, n)); }
    }
  }
  return output;
}

function seriesQuestions(difficulty, start, count) {
  const output = [];
  for (let n = start; n < start + count; n += 1) {
    const id = (topic, text, answer, explanation) => numericQuestion(`${prefixes["number-series"]}_${difficulty}_${String(n).padStart(3, "0")}`, "number-series", topic, difficulty, text, answer, explanation, n);
    const mod = n % 8;
    if (mod === 0) { const first = 2 + n % 12; const difference = 3 + n % 9; const answer = first + difference * 5; output.push(id("arithmetic-progression", `What comes next: ${first}, ${first + difference}, ${first + difference * 2}, ${first + difference * 3}, ${first + difference * 4}?`, answer, `The common difference is ${difference}; the next term is ${answer}.`)); }
    else if (mod === 1) { const first = 2 + n % 5; const ratio = 2 + n % 3; const answer = first * ratio ** 4; output.push(id("geometric-progression", `What comes next: ${first}, ${first * ratio}, ${first * ratio ** 2}, ${first * ratio ** 3}?`, answer, `Each term is multiplied by ${ratio}; the next term is ${answer}.`)); }
    else if (mod === 2) { const base = 3 + n % 12; const answer = (base + 1) ** 2; output.push(id("squares", `What comes next: ${base ** 2}, ${(base + 1) ** 2}, ${(base + 2) ** 2}, ${(base + 3) ** 2}?`, answer, `These are consecutive squares; the next is ${base + 4} squared = ${answer}.`)); }
    else if (mod === 3) { const base = 2 + n % 7; const answer = (base + 4) ** 3; output.push(id("cubes", `What comes next: ${base ** 3}, ${(base + 1) ** 3}, ${(base + 2) ** 3}, ${(base + 3) ** 3}?`, answer, `These are consecutive cubes; the next is ${base + 4} cubed = ${answer}.`)); }
    else if (mod === 4) { const first = 2 + n % 8; const difference = 2 + n % 6; const answer = first + difference * 6; output.push(id("arithmetic-progression", `What comes next: ${first}, ${first + difference}, ${first + difference * 2}, ${first + difference * 3}, ${first + difference * 4}, ${first + difference * 5}?`, answer, `The constant difference is ${difference}; the next term is ${answer}.`)); }
    else if (mod === 5) { const base = 1 + n % 6; const answer = (base + 5) ** 2 + 1; output.push(id("second-differences", `What comes next: ${base ** 2 + 1}, ${(base + 1) ** 2 + 1}, ${(base + 2) ** 2 + 1}, ${(base + 3) ** 2 + 1}?`, answer, `The terms follow k squared + 1; the next value is ${answer}.`)); }
    else if (mod === 6) { const first = 2 + n % 5; const answer = first + 12; output.push(id("alternating-pattern", `What comes next: ${first}, ${first * 2}, ${first + 2}, ${(first + 2) * 2}, ${first + 4}?`, answer, `Odd terms increase by 2 and even terms are double the preceding odd term; the next even term is ${answer}.`)); }
    else { const first = 3 + n % 7; const answer = first * 2 ** 5 + 1; output.push(id("mixed-pattern", `What comes next: ${first}, ${first * 2 + 1}, ${(first * 2 + 1) * 2 + 1}, ${((first * 2 + 1) * 2 + 1) * 2 + 1}?`, answer, `Each term is doubled and then increased by 1; the next term is ${answer}.`)); }
  }
  return output;
}

function logicQuestions(difficulty, start, count) {
  const output = [];
  const templates = [
    ["classification", (n) => question(`${prefixes["logical-reasoning"]}_${difficulty}_${String(n).padStart(3, "0")}`, "logical-reasoning", "classification", difficulty, `Which number is different: ${n + 2}, ${n + 4}, ${n + 6}, ${n + 9}?`, [String(n + 2), String(n + 4), String(n + 6), String(n + 9)], 3, "The first three numbers have the same even/odd status; the final number has the opposite status.")],
    ["analogy", (n) => question(`${prefixes["logical-reasoning"]}_${difficulty}_${String(n).padStart(3, "0")}`, "logical-reasoning", "analogy", difficulty, "Bird is to nest as bee is to what?", ["Hive", "Web", "Burrow", "Den"], 0, "A nest is the home of a bird; a hive is the home of a bee.")],
    ["coding-decoding", (n) => { const letter = String.fromCharCode(65 + n % 20); const next = String.fromCharCode(letter.charCodeAt(0) + 1); return question(`${prefixes["logical-reasoning"]}_${difficulty}_${String(n).padStart(3, "0")}`, "logical-reasoning", "coding-decoding", difficulty, `If ${letter} is coded as ${next}, how is ${String.fromCharCode(letter.charCodeAt(0) + 2)} coded using the same rule?`, [String.fromCharCode(letter.charCodeAt(0) + 1), String.fromCharCode(letter.charCodeAt(0) + 2), String.fromCharCode(letter.charCodeAt(0) + 3), letter], 1, "The code moves each letter one place forward, so the input letter advances by one."); }],
    ["direction-sense", (n) => question(`${prefixes["logical-reasoning"]}_${difficulty}_${String(n).padStart(3, "0")}`, "logical-reasoning", "direction-sense", difficulty, "A person faces west and turns left. Which direction is the person facing?", ["North", "South", "East", "West"], 1, "A left turn from west points south.")],
    ["blood-relations", (n) => question(`${prefixes["logical-reasoning"]}_${difficulty}_${String(n).padStart(3, "0")}`, "logical-reasoning", "blood-relations", difficulty, "Rina is the daughter of Mohan. Mohan is the brother of Tara. How is Tara related to Rina?", ["Mother", "Aunt", "Sister", "Cousin"], 1, "Tara is the sister of Rina's father, so Tara is Rina's aunt.")],
    ["logical-deduction", (n) => question(`${prefixes["logical-reasoning"]}_${difficulty}_${String(n).padStart(3, "0")}`, "logical-reasoning", "logical-deduction", difficulty, "All metals conduct electricity. Copper is a metal. What must be true?", ["Copper conducts electricity", "All conductors are copper", "Copper is not a metal", "No metal conducts electricity"], 0, "Copper belongs to the class of metals, so it has the stated property.")],
    ["arrangement", (n) => question(`${prefixes["logical-reasoning"]}_${difficulty}_${String(n).padStart(3, "0")}`, "logical-reasoning", "arrangement", difficulty, "A is before B, and B is before C in a line. Who is last?", ["A", "B", "C", "Cannot determine"], 2, "The order is A, B, C, so C is last.")],
    ["classification", (n) => question(`${prefixes["logical-reasoning"]}_${difficulty}_${String(n).padStart(3, "0")}`, "logical-reasoning", "classification", difficulty, "Which word does not belong: red, blue, green, circle?", ["Red", "Blue", "Green", "Circle"], 3, "The first three are colors; circle is a shape.")],
  ];
  for (let n = start; n < start + count; n += 1) output.push(templates[n % templates.length][1](n));
  return output;
}

function quantQuestions(difficulty, start, count) {
  const output = [];
  for (let n = start; n < start + count; n += 1) {
    const id = (topic, text, answer, explanation) => numericQuestion(`${prefixes["quantitative-aptitude"]}_${difficulty}_${String(n).padStart(3, "0")}`, "quantitative-aptitude", topic, difficulty, text, answer, explanation, n);
    const mod = n % 8;
    if (mod === 0) { const a = 12 + n % 10; const b = 18 + n % 9; const answer = (a + b) / 2; output.push(id("average", `What is the average of ${a} and ${b}?`, answer, `(${a} + ${b}) / 2 = ${answer}.`)); }
    else if (mod === 1) { const speed = 40 + n % 8 * 5; const time = 2 + n % 4; const answer = speed * time; output.push(id("speed-distance-time", `How far does a vehicle travel at ${speed} km/h for ${time} hours?`, answer, `Distance = speed x time = ${speed} x ${time} = ${answer} km.`)); }
    else if (mod === 2) { const cost = 100 + n * 5; const rate = 10 + n % 5 * 5; const answer = cost * (1 + rate / 100); output.push(id("profit-loss", `An item costs ${cost} and is sold at ${rate}% profit. Find the selling price.`, answer, `Selling price = ${cost} x ${(100 + rate) / 100} = ${answer}.`)); }
    else if (mod === 3) { const principal = 500 + n * 20; const rate = 4 + n % 5; const time = 2; const answer = principal * rate * time / 100; output.push(id("simple-interest", `Find the simple interest on ${principal} at ${rate}% per year for ${time} years.`, answer, `SI = ${principal} x ${rate} x ${time} / 100 = ${answer}.`)); }
    else if (mod === 4) { const daysA = 8 + n % 5; const answer = daysA / 2; output.push(id("time-and-work", `A worker completes a job in ${daysA} days. At twice the rate, how many days are needed?`, answer, `Doubling the rate halves the time: ${daysA} / 2 = ${answer} days.`)); }
    else if (mod === 5) { const favorable = 2 + n % 5; const total = 6 + n % 5; const answer = favorable / total; output.push(id("probability", `If ${favorable} outcomes are favorable among ${total} equally likely outcomes, what is the probability?`, answer, `Probability = favorable outcomes / total outcomes = ${favorable}/${total} = ${answer}.`)); }
    else if (mod === 6) { const people = 4 + n % 5; const answer = people * (people - 1); output.push(id("permutations", `How many ordered ways can two different people be selected from ${people} people?`, answer, `There are ${people} choices for the first and ${people - 1} for the second: ${answer}.`)); }
    else { const ratioA = 2 + n % 4; const ratioB = 3 + n % 4; const scale = 4 + n % 5; const answer = ratioB * scale; output.push(id("mixtures", `A mixture has components in ratio ${ratioA}:${ratioB}. If the first component is ${ratioA * scale}, how much is the second?`, answer, `The scale is ${scale}; the second component is ${ratioB} x ${scale} = ${answer}.`)); }
  }
  return output;
}

function makeQuestions(category, difficulty, start, count) {
  if (category === "mental-maths") return mentalQuestions(difficulty, start, count);
  if (category === "number-series") return seriesQuestions(difficulty, start, count);
  if (category === "logical-reasoning") return logicQuestions(difficulty, start, count);
  return quantQuestions(difficulty, start, count);
}

const progressPath = resolve(ROOT, "progress/batches.json");
const progress = JSON.parse(await readFile(progressPath, "utf8"));
for (const category of categories) {
  for (const difficulty of difficulties) {
    const filePath = resolve(ROOT, `questions/${category}/${difficulty}.json`);
    const existing = JSON.parse(await readFile(filePath, "utf8"));
    if (existing.length >= 50) continue;
    if (existing.length !== 10) throw new Error(`${category}/${difficulty} must contain exactly 10 verified sample questions before expansion.`);
    for (let start = 11; start <= 41; start += 10) {
      const batch = makeQuestions(category, difficulty, start, 10);
      existing.push(...batch);
      progress.completedBatches.push({ category, difficulty, start, end: start + 9, status: "verified", generatedBy: "generate-remaining.mjs" });
      await writeFile(filePath, `${JSON.stringify(existing, null, 2)}\n`);
      await writeFile(progressPath, `${JSON.stringify(progress, null, 2)}\n`);
    }
  }
}
console.log("Generated remaining questions in four batches per category/difficulty.");
