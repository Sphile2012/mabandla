export const PRACTICE_TOPICS = ['Algebra', 'Functions', 'Trigonometry', 'Calculus', 'Geometry', 'Statistics', 'Probability'];

// answer is an index into options. numeric questions can also be answered by typing.
export const PRACTICE_QUESTIONS = [
  {
    id: 'g10-alg-1', grade: 'Grade 10', topic: 'Algebra', numeric: true,
    q: 'Solve for x: 3x − 7 = 11',
    options: ['4', '5', '6', '7'], answer: 2,
    steps: ['Add 7 to both sides: 3x = 18', 'Divide both sides by 3: x = 6', 'Check: 3(6) − 7 = 11 ✓'],
  },
  {
    id: 'g10-alg-2', grade: 'Grade 10', topic: 'Algebra',
    q: 'Factorise fully: x² − 9',
    options: ['(x − 3)²', '(x − 3)(x + 3)', '(x − 9)(x + 1)', 'x(x − 9)'], answer: 1,
    steps: ['Recognise a difference of two squares: x² − 3²', 'Use a² − b² = (a − b)(a + b)', 'x² − 9 = (x − 3)(x + 3)'],
  },
  {
    id: 'g10-fn-1', grade: 'Grade 10', topic: 'Functions', numeric: true,
    q: 'If f(x) = 2x + 3, what is f(4)?',
    options: ['8', '9', '11', '14'], answer: 2,
    steps: ['Substitute x = 4 into f(x) = 2x + 3', 'f(4) = 2(4) + 3', 'f(4) = 8 + 3 = 11'],
  },
  {
    id: 'g10-trig-1', grade: 'Grade 10', topic: 'Trigonometry',
    q: 'In a right-angled triangle the side opposite θ is 3 and the hypotenuse is 5. What is sin θ?',
    options: ['3/4', '4/5', '3/5', '5/3'], answer: 2,
    steps: ['Recall sin θ = opposite ÷ hypotenuse', 'Substitute: sin θ = 3 ÷ 5', 'sin θ = 3/5'],
  },
  {
    id: 'g10-geo-1', grade: 'Grade 10', topic: 'Geometry', numeric: true,
    q: 'Two angles of a triangle are 50° and 60°. What is the third angle (in degrees)?',
    options: ['60', '70', '80', '90'], answer: 1,
    steps: ['Angles in a triangle add up to 180°', 'Third angle = 180° − 50° − 60°', 'Third angle = 70°'],
  },
  {
    id: 'g10-stat-1', grade: 'Grade 10', topic: 'Statistics', numeric: true,
    q: 'Calculate the mean of 4; 8; 6; 10; 12.',
    options: ['6', '7', '8', '9'], answer: 2,
    steps: ['Add the values: 4 + 8 + 6 + 10 + 12 = 40', 'Divide by the number of values (5)', 'Mean = 40 ÷ 5 = 8'],
  },
  {
    id: 'g10-prob-1', grade: 'Grade 10', topic: 'Probability',
    q: 'A fair die is rolled once. What is the probability of getting an even number?',
    options: ['1/6', '1/3', '1/2', '2/3'], answer: 2,
    steps: ['Even outcomes: 2, 4, 6 → 3 outcomes', 'Total outcomes: 6', 'P(even) = 3/6 = 1/2'],
  },
  {
    id: 'g11-alg-1', grade: 'Grade 11', topic: 'Algebra',
    q: 'Solve for x: x² − 5x + 6 = 0',
    options: ['x = 1 or x = 6', 'x = 2 or x = 3', 'x = −2 or x = −3', 'x = 5 or x = 1'], answer: 1,
    steps: ['Find two numbers with product 6 and sum −5: −2 and −3', 'Factorise: (x − 2)(x − 3) = 0', 'x − 2 = 0 or x − 3 = 0', 'x = 2 or x = 3'],
  },
  {
    id: 'g11-fn-1', grade: 'Grade 11', topic: 'Functions',
    q: 'What is the range of y = x² + 1?',
    options: ['y ≥ 0', 'y ≥ 1', 'y ≤ 1', 'y ∈ ℝ'], answer: 1,
    steps: ['x² is never negative, so x² ≥ 0', 'Add 1 to both sides: x² + 1 ≥ 1', 'The range is y ≥ 1'],
  },
  {
    id: 'g11-trig-1', grade: 'Grade 11', topic: 'Trigonometry',
    q: 'Simplify: sin²θ + cos²θ',
    options: ['0', '1', 'tan θ', '2'], answer: 1,
    steps: ['This is the Pythagorean identity', 'sin²θ + cos²θ = 1 for every angle θ'],
  },
  {
    id: 'g11-geo-1', grade: 'Grade 11', topic: 'Geometry', numeric: true,
    q: 'Find the distance between A(1; 2) and B(4; 6).',
    options: ['4', '5', '6', '7'], answer: 1,
    steps: ['Use d = √[(x₂ − x₁)² + (y₂ − y₁)²]', 'd = √[(4 − 1)² + (6 − 2)²] = √(9 + 16)', 'd = √25 = 5'],
  },
  {
    id: 'g11-stat-1', grade: 'Grade 11', topic: 'Statistics', numeric: true,
    q: 'Find the median of 3; 7; 1; 9; 5.',
    options: ['3', '5', '7', '9'], answer: 1,
    steps: ['Order the data: 1; 3; 5; 7; 9', 'There are 5 values, so the median is the 3rd value', 'Median = 5'],
  },
  {
    id: 'g11-prob-1', grade: 'Grade 11', topic: 'Probability', numeric: true,
    q: 'A and B are independent events with P(A) = 0.3 and P(B) = 0.4. Find P(A and B).',
    options: ['0.07', '0.12', '0.7', '0.1'], answer: 1,
    steps: ['For independent events P(A and B) = P(A) × P(B)', 'P(A and B) = 0.3 × 0.4', 'P(A and B) = 0.12'],
  },
  {
    id: 'g12-calc-1', grade: 'Grade 12', topic: 'Calculus', numeric: true,
    q: 'If f(x) = x³ − 3x, find f′(2).',
    options: ['2', '6', '9', '12'], answer: 2,
    steps: ['Differentiate: f′(x) = 3x² − 3', 'Substitute x = 2: f′(2) = 3(4) − 3', 'f′(2) = 12 − 3 = 9'],
  },
  {
    id: 'g12-calc-2', grade: 'Grade 12', topic: 'Calculus',
    q: 'Differentiate y = 5x⁴ with respect to x.',
    options: ['5x³', '20x³', '20x⁴', '4x⁵'], answer: 1,
    steps: ['Power rule: d/dx (axⁿ) = n·a·xⁿ⁻¹', 'dy/dx = 4 × 5 × x³', 'dy/dx = 20x³'],
  },
  {
    id: 'g12-alg-1', grade: 'Grade 12', topic: 'Algebra', numeric: true,
    q: 'Find the sum of the first 10 terms of the arithmetic series 2 + 5 + 8 + …',
    options: ['145', '150', '155', '160'], answer: 2,
    steps: ['a = 2 and d = 3', 'Sₙ = n/2 [2a + (n − 1)d]', 'S₁₀ = 5[4 + 27] = 5 × 31', 'S₁₀ = 155'],
  },
  {
    id: 'g12-fn-1', grade: 'Grade 12', topic: 'Functions', numeric: true,
    q: 'Find the sum of the first 5 terms of the geometric series 3 + 6 + 12 + …',
    options: ['45', '63', '93', '96'], answer: 2,
    steps: ['a = 3 and r = 2', 'Sₙ = a(rⁿ − 1)/(r − 1)', 'S₅ = 3(2⁵ − 1)/(2 − 1) = 3 × 31', 'S₅ = 93'],
  },
  {
    id: 'g12-trig-1', grade: 'Grade 12', topic: 'Trigonometry', numeric: true,
    q: 'Solve 2 sin x = 1 for 0° ≤ x ≤ 90°. (answer in degrees)',
    options: ['15', '30', '45', '60'], answer: 1,
    steps: ['Divide by 2: sin x = 1/2', 'Take the inverse: x = sin⁻¹(1/2)', 'x = 30°'],
  },
  {
    id: 'g12-geo-1', grade: 'Grade 12', topic: 'Geometry', numeric: true,
    q: 'Find the gradient of the line through (2; 3) and (6; 11).',
    options: ['1', '2', '3', '4'], answer: 1,
    steps: ['m = (y₂ − y₁)/(x₂ − x₁)', 'm = (11 − 3)/(6 − 2) = 8/4', 'm = 2'],
  },
  {
    id: 'g12-stat-1', grade: 'Grade 12', topic: 'Statistics', numeric: true,
    q: 'The data 2; 4; 6; 8 has a mean of 5. Find the variance (population).',
    options: ['4', '5', '6', '7'], answer: 1,
    steps: ['Deviations from the mean: −3; −1; 1; 3', 'Squares: 9; 1; 1; 9 → sum = 20', 'Variance = 20 ÷ 4 = 5'],
  },
  {
    id: 'g12-prob-1', grade: 'Grade 12', topic: 'Probability', numeric: true,
    q: 'In how many different ways can the letters of the word MATHS be arranged?',
    options: ['24', '60', '120', '720'], answer: 2,
    steps: ['MATHS has 5 different letters', 'Arrangements = 5!', '5! = 5 × 4 × 3 × 2 × 1 = 120'],
  },
];

export const PAPERS = [
  { id: 'p1', name: 'Paper 1 style', blurb: 'Algebra, Functions, Calculus', topics: ['Algebra', 'Functions', 'Calculus'] },
  { id: 'p2', name: 'Paper 2 style', blurb: 'Trigonometry, Geometry, Statistics, Probability', topics: ['Trigonometry', 'Geometry', 'Statistics', 'Probability'] },
];
