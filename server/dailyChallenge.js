const DAY_MS = 24 * 60 * 60 * 1000;

export function createDailyChallenge(now = new Date()) {
  const date = now.toISOString().slice(0, 10);
  const dayNumber = Math.floor(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ) / DAY_MS);
  const firstQuestionDay = Math.floor(Date.UTC(2026, 0, 1) / DAY_MS);
  const dailyVariant = Math.floor((dayNumber - firstQuestionDay) / 4);
  let randomState = dayNumber >>> 0;
  const random = () => {
    randomState = (randomState + 0x6D2B79F5) | 0;
    let value = randomState;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const value = (range) => Math.floor(random() * range);
  const templates = [
    () => {
      const coefficient = value(11) + 2;
      const answer = dailyVariant + 3;
      const constant = value(101) - 50;
      const total = coefficient * answer + constant;
      const signedConstant = constant < 0 ? `- ${Math.abs(constant)}` : `+ ${constant}`;
      return {
        topic: 'Algebra',
        question: `Solve for x: ${coefficient}x ${signedConstant} = ${total}.`,
        answer: String(answer),
        explanation: `${constant < 0 ? `Add ${Math.abs(constant)}` : `Subtract ${constant}`} from both sides, then divide by ${coefficient}. This gives x = ${answer}.`,
      };
    },
    () => {
      const firstTerm = value(80) + 2;
      const difference = value(49) + 2;
      const termNumber = dailyVariant + 8;
      const answer = firstTerm + (termNumber - 1) * difference;
      return {
        topic: 'Number patterns',
        question: `An arithmetic sequence starts ${firstTerm}, ${firstTerm + difference}, ${firstTerm + 2 * difference}, ... What is its ${termNumber}th term?`,
        answer: String(answer),
        explanation: `The common difference is ${difference}. Use a + (n - 1)d: ${firstTerm} + (${termNumber} - 1) × ${difference} = ${answer}.`,
      };
    },
    () => {
      const percentage = [10, 15, 20, 25, 30, 40][value(6)];
      const amount = (dailyVariant + 10) * 10;
      const answer = amount * percentage / 100;
      return {
        topic: 'Percentages',
        question: `What is ${percentage}% of ${amount}?`,
        answer: String(answer),
        explanation: `${percentage}% of ${amount} is ${percentage}/100 × ${amount} = ${answer}.`,
      };
    },
    () => {
      const base = (value(37) + 4) * 2;
      const height = dailyVariant + 5;
      const answer = base * height / 2;
      return {
        topic: 'Geometry',
        question: `A triangle has a base of ${base} cm and a perpendicular height of ${height} cm. What is its area in cm²?`,
        answer: String(answer),
        explanation: `Area = ½ × base × height = ½ × ${base} × ${height} = ${answer} cm².`,
      };
    },
  ];
  const generated = templates[dayNumber % templates.length]();

  return {
    id: `daily-${date}`,
    date,
    title: 'Daily Maths Challenge',
    xp_reward: 20,
    ...generated,
  };
}

export function isCorrectDailyAnswer(answer, expectedAnswer) {
  const normalized = String(answer ?? '').trim().replace(/,/g, '');
  if (!normalized || normalized.length > 40) return false;
  const submittedNumber = Number(normalized);
  const expectedNumber = Number(expectedAnswer);
  return Number.isFinite(submittedNumber) && submittedNumber === expectedNumber;
}
