# MindSprint Question Bank

Independent question data repository for MindSprint mental maths and aptitude practice.

## Status

Phase 1 foundation. Question generation begins in Phase 2 with 10-question samples for each category and difficulty.

## Structure

```text
questions/
  mental-maths/{easy,medium,hard}.json
  number-series/{easy,medium,hard}.json
  logical-reasoning/{easy,medium,hard}.json
  quantitative-aptitude/{easy,medium,hard}.json
scripts/
  validate-bank.mjs
reports/
progress/
```

Each question file will contain a JSON array of 50 questions after generation is complete. The repository target is 600 original questions: 150 per category and 50 per difficulty within each category.

## Question Contract

Each question must contain:

- `id`: globally unique string
- `category`: one of the four manifest categories
- `topic`: specific subject area
- `difficulty`: `easy`, `medium`, or `hard`
- `question`: non-empty question text
- `options`: exactly four options with IDs `A`, `B`, `C`, and `D`
- `correctAnswer`: one option ID
- `explanation`: meaningful solution or reasoning
- `source`: `generated` for original generated content
- `verified`: `true` only after independent verification

Mathematical questions must be checked deterministically where practical. Logical questions that cannot be mechanically disambiguated will be flagged for manual review.

## Validation

From this repository root:

```powershell
node scripts/validate-bank.mjs
```
During the sample phase, where each file intentionally contains 10 questions,
run:

```powershell
node scripts/validate-bank.mjs --sample
```

The validator checks JSON syntax, required fields, allowed values, IDs, options, answer references, duplicate question text, expected counts, and verification status. It writes reports to `reports/` when question data exists.

## License

The proposed license is Creative Commons Attribution 4.0 International (CC BY 4.0). It permits reuse and adaptation of this original question data with attribution. It does not grant rights to any third-party material. See `LICENSE` for the repository’s current license notice.
