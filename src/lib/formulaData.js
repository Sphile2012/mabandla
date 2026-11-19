// Every formula has: what it says in plain words (simple), when to use it, and a worked example.
export const TOPIC_INTROS = {
  Algebra: 'Algebra uses letters (like x) to stand for numbers we do not know yet. These rules help you tidy up, expand, factorise and solve.',
  Geometry: 'Geometry is about shapes: how long their sides are, how much space they cover (area) and how far around they go (perimeter).',
  Trigonometry: 'Trigonometry links the angles of a triangle to the lengths of its sides. SOH-CAH-TOA is your best friend.',
  Finance: 'Finance maths shows how money grows (or shrinks) over time when interest is added.',
  Functions: 'A function is a machine: put a number x in, get exactly one number y out. The formula tells you how the machine works.',
  'Analytical Geometry': 'Analytical geometry puts shapes on a grid (x and y axes) so we can use numbers to measure them.',
  Calculus: 'Calculus measures change. A derivative tells you how fast something is changing (the slope); an integral adds up small pieces.',
  Probability: 'Probability tells you how likely something is, from 0 (impossible) to 1 (certain).',
  Statistics: 'Statistics helps you describe a set of numbers: what is typical, and how spread out they are.',
};

export const FORMULAS = {
  'Grade 10': {
    Algebra: [
      { name: 'Quadratic Formula', formula: 'x = (−b ± √(b² − 4ac)) ÷ 2a', simple: 'A recipe that always solves an equation of the form ax² + bx + c = 0. Put in a, b and c and you get the answers for x.', when: 'When the equation will not factorise easily.', example: 'x² + 5x + 6 = 0 → a=1, b=5, c=6. √(25−24)=1, so x = (−5 ± 1)/2 → x = −2 or x = −3.' },
      { name: 'Difference of Squares', formula: 'a² − b² = (a + b)(a − b)', simple: 'If you subtract one perfect square from another, it splits into a “plus” bracket times a “minus” bracket.', when: 'Factorising something like x² − 9 or 4x² − 25.', example: 'x² − 16 = (x + 4)(x − 4).' },
      { name: 'Perfect Square Trinomial', formula: '(a ± b)² = a² ± 2ab + b²', simple: 'Squaring a bracket means multiplying it by itself. The middle term is always twice the two parts multiplied.', when: 'Expanding (x + 3)² — a common mistake is forgetting the middle term!', example: '(x + 3)² = x² + 6x + 9.' },
      { name: 'Multiplying Exponents', formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ', simple: 'Same base? Keep the base and ADD the powers.', when: 'Simplifying things like x³ · x⁴.', example: '2³ × 2⁴ = 2⁷ = 128.' },
      { name: 'Dividing Exponents', formula: 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ', simple: 'Same base? Keep the base and SUBTRACT the powers.', when: 'Simplifying fractions like x⁵ / x².', example: 'x⁵ ÷ x² = x³.' },
      { name: 'Power of a Power', formula: '(aᵐ)ⁿ = aᵐⁿ', simple: 'A power raised to another power? MULTIPLY the powers.', when: 'Simplifying (x²)³.', example: '(x²)³ = x⁶.' },
    ],
    Geometry: [
      { name: 'Pythagoras’ Theorem', formula: 'a² + b² = c²', simple: 'In a right-angled triangle, the two short sides squared and added equal the longest side (hypotenuse) squared.', when: 'You know two sides of a right-angled triangle and need the third.', example: 'Sides 3 and 4: c² = 9 + 16 = 25, so c = 5.' },
      { name: 'Area of a Rectangle', formula: 'A = l × w', simple: 'How much flat space it covers: length times width.', when: 'Floors, walls, paper — any rectangle.', example: '5 cm × 3 cm = 15 cm².' },
      { name: 'Area of a Triangle', formula: 'A = ½ × b × h', simple: 'A triangle is half of a rectangle. Use the base and the straight-up height (not the slanted side).', when: 'Any triangle where you know the base and the perpendicular height.', example: 'b = 6, h = 4 → A = ½ × 6 × 4 = 12.' },
      { name: 'Area of a Circle', formula: 'A = πr²', simple: 'Square the radius (the distance from the centre to the edge), then multiply by π (≈ 3,14).', when: 'You need the space inside a circle.', example: 'r = 5 → A = 3,14 × 25 ≈ 78,5.' },
      { name: 'Circumference', formula: 'C = 2πr', simple: 'The distance around a circle: twice the radius, times π.', when: 'You need the “perimeter” of a circle.', example: 'r = 5 → C = 2 × 3,14 × 5 ≈ 31,4.' },
      { name: 'Perimeter of a Rectangle', formula: 'P = 2(l + w)', simple: 'Walk all the way around: two lengths and two widths.', when: 'Fencing, borders, edges.', example: 'l = 5, w = 3 → P = 2(8) = 16.' },
    ],
    Trigonometry: [
      { name: 'Sine (SOH)', formula: 'sin θ = opposite ÷ hypotenuse', simple: 'Compare the side across from the angle with the longest side.', when: 'You know the angle and the hypotenuse, or the opposite and hypotenuse.', example: 'Opposite = 3, hypotenuse = 5 → sin θ = 0,6.' },
      { name: 'Cosine (CAH)', formula: 'cos θ = adjacent ÷ hypotenuse', simple: 'Compare the side next to the angle with the longest side.', when: 'You involve the adjacent side and the hypotenuse.', example: 'Adjacent = 4, hypotenuse = 5 → cos θ = 0,8.' },
      { name: 'Tangent (TOA)', formula: 'tan θ = opposite ÷ adjacent', simple: 'Compare the side across from the angle with the side next to it.', when: 'The hypotenuse is not involved.', example: 'Opposite = 3, adjacent = 4 → tan θ = 0,75.' },
      { name: 'Square Identity', formula: 'sin²θ + cos²θ = 1', simple: 'For any angle, sin squared plus cos squared always equals 1.', when: 'Swapping sin² for cos² (or the other way round) to simplify.', example: 'If sin²θ = 0,36 then cos²θ = 0,64.' },
    ],
    Finance: [
      { name: 'Simple Interest', formula: 'A = P(1 + in)', simple: 'Interest is earned only on the money you started with. A is the final amount, P the starting amount, i the rate (as a decimal), n the years.', when: 'The question says “simple interest”.', example: 'R1 000 at 10% for 3 years: 1 000(1 + 0,1×3) = R1 300.' },
      { name: 'Compound Interest', formula: 'A = P(1 + i)ⁿ', simple: 'You earn interest on your interest too, so money grows faster. The rate i is per period; n is the number of periods.', when: 'The question says “compound interest”.', example: 'R1 000 at 10% for 3 years: 1 000(1,1)³ = R1 331.' },
      { name: 'Profit', formula: 'Profit = Selling price − Cost price', simple: 'What you sold it for minus what it cost you.', when: 'Working out if a business made money.', example: 'Bought for R80, sold for R100 → profit R20.' },
      { name: 'Percentage Change', formula: '% change = (new − old) ÷ old × 100', simple: 'Find how much it changed, divide by where you started, make it a percentage.', when: 'Price increases, discounts, marks improving.', example: 'R50 → R60: (10 ÷ 50) × 100 = 20% increase.' },
    ],
  },
  'Grade 11': {
    Algebra: [
      { name: 'Quadratic Formula', formula: 'x = (−b ± √(b² − 4ac)) ÷ 2a', simple: 'Solves any equation ax² + bx + c = 0 once it is written equal to zero.', when: 'Factorising does not work.', example: '2x² − 3x − 5 = 0 → x = (3 ± 7)/4 → x = 2,5 or x = −1.' },
      { name: 'Discriminant', formula: 'Δ = b² − 4ac', simple: 'The number under the square root. It tells you what kind of answers you will get BEFORE you solve.', when: 'Asked about the “nature of the roots”. Δ > 0: two real answers. Δ = 0: one answer. Δ < 0: no real answers.', example: 'x² + 2x + 5: Δ = 4 − 20 = −16 → no real roots.' },
      { name: 'Sum of Roots', formula: 'α + β = −b ÷ a', simple: 'Add the two answers of a quadratic and you get −b divided by a.', when: 'Checking answers or finding an unknown.', example: 'x² − 5x + 6: roots 2 and 3 add to 5 = −(−5)/1.' },
      { name: 'Product of Roots', formula: 'αβ = c ÷ a', simple: 'Multiply the two answers and you get c divided by a.', when: 'Checking answers or finding an unknown.', example: 'x² − 5x + 6: 2 × 3 = 6 = 6/1.' },
      { name: 'Exponential Growth', formula: 'A = P(1 + r)ᵗ', simple: 'Something grows by the same percentage every period.', when: 'Populations, investments, bacteria.', example: '1 000 growing 5% a year for 2 years: 1 000(1,05)² = 1 102,50.' },
      { name: 'Exponential Decay', formula: 'A = P(1 − r)ᵗ', simple: 'Something shrinks by the same percentage every period.', when: 'Depreciation, radioactive decay.', example: 'R10 000 losing 10% a year for 2 years: 10 000(0,9)² = R8 100.' },
    ],
    Functions: [
      { name: 'Linear Function', formula: 'y = mx + c', simple: 'A straight line. m is how steep it is (gradient); c is where it crosses the y-axis.', when: 'Sketching or reading straight-line graphs.', example: 'y = 2x + 1 goes up 2 for every 1 across and cuts the y-axis at 1.' },
      { name: 'Quadratic Function', formula: 'y = ax² + bx + c', simple: 'A U-shaped curve (parabola). If a > 0 it smiles; if a < 0 it frowns.', when: 'Sketching parabolas; turning point is at x = −b ÷ 2a.', example: 'y = x² − 4x + 3: turning point at x = 2.' },
      { name: 'Exponential Function', formula: 'y = a·bˣ', simple: 'A curve that grows (or shrinks) very quickly and never touches the x-axis.', when: 'Growth and decay graphs.', example: 'y = 2ˣ: x = 3 gives y = 8.' },
      { name: 'Inverse Function', formula: 'swap x and y, then solve for y', simple: 'The inverse undoes the function. To find it: swap x and y, then make y the subject.', when: 'Asked for f⁻¹(x).', example: 'y = 2x + 3 → x = 2y + 3 → y = (x − 3)/2.' },
    ],
    Trigonometry: [
      { name: 'Sine Rule', formula: 'a ÷ sin A = b ÷ sin B = c ÷ sin C', simple: 'In any triangle, each side divided by the sine of the angle opposite it gives the same number.', when: 'You know a side and its opposite angle plus one other piece of information.', example: 'a = 6, A = 30°, B = 90° → b = 6 sin 90° ÷ sin 30° = 12.' },
      { name: 'Cosine Rule', formula: 'a² = b² + c² − 2bc·cos A', simple: 'Pythagoras with a correction for triangles that are NOT right-angled.', when: 'You know two sides and the angle between them, or all three sides.', example: 'b = 5, c = 6, A = 60° → a² = 25 + 36 − 30 = 31.' },
      { name: 'Area Rule', formula: 'Area = ½·a·b·sin C', simple: 'Half of two sides multiplied, times the sine of the angle between them.', when: 'You do not know the height of the triangle.', example: 'a = 4, b = 5, C = 30° → ½ × 4 × 5 × 0,5 = 5.' },
      { name: 'Double Angle (sine)', formula: 'sin 2θ = 2 sin θ cos θ', simple: 'The sine of a doubled angle can be written using sin and cos of the single angle.', when: 'Simplifying or proving identities.', example: 'θ = 30° → 2(0,5)(0,866) = 0,866 = sin 60°.' },
      { name: 'Double Angle (cosine)', formula: 'cos 2θ = cos²θ − sin²θ', simple: 'Also equals 2cos²θ − 1 or 1 − 2sin²θ. Pick the version that matches what you have.', when: 'Simplifying or solving equations.', example: 'θ = 30° → 0,75 − 0,25 = 0,5 = cos 60°.' },
    ],
    'Analytical Geometry': [
      { name: 'Distance Formula', formula: 'd = √[(x₂ − x₁)² + (y₂ − y₁)²]', simple: 'It is Pythagoras on a grid: how far across, how far up, then find the diagonal.', when: 'Length between two points.', example: 'A(1;2), B(4;6): √(9 + 16) = 5.' },
      { name: 'Midpoint Formula', formula: 'M = ((x₁ + x₂)/2 ; (y₁ + y₂)/2)', simple: 'Average the x-values and average the y-values to find the point exactly in the middle.', when: 'Finding the centre of a line segment.', example: 'A(1;2), B(5;6) → M(3;4).' },
      { name: 'Gradient', formula: 'm = (y₂ − y₁) ÷ (x₂ − x₁)', simple: 'How steep a line is: “rise over run”.', when: 'Steepness, parallel lines (same m) or perpendicular lines (m₁ × m₂ = −1).', example: 'A(1;2), B(3;8) → m = 6 ÷ 2 = 3.' },
      { name: 'Equation of a Line', formula: 'y − y₁ = m(x − x₁)', simple: 'If you know one point on the line and the gradient, plug them in to get the equation.', when: 'Writing the equation of a line.', example: 'Point (1;2), m = 3 → y − 2 = 3(x − 1) → y = 3x − 1.' },
    ],
  },
  'Grade 12': {
    Calculus: [
      { name: 'Power Rule', formula: 'd/dx (xⁿ) = n·xⁿ⁻¹', simple: 'Bring the power down in front, then reduce the power by 1.', when: 'Differentiating any term like x⁵.', example: 'f(x) = x⁴ → f′(x) = 4x³.' },
      { name: 'Constant Rule', formula: 'd/dx (c) = 0', simple: 'A plain number does not change, so its rate of change is zero.', when: 'Any term without an x.', example: 'd/dx (7) = 0.' },
      { name: 'Sum Rule', formula: 'd/dx (f + g) = f′ + g′', simple: 'Differentiate each term separately, then put them back together.', when: 'Polynomials with several terms.', example: 'f(x) = x³ + 2x → f′(x) = 3x² + 2.' },
      { name: 'Gradient at a Point', formula: 'gradient = f′(a)', simple: 'The derivative gives the slope of the curve. Put in the x-value to get the slope at that exact point.', when: 'Finding tangent gradients and turning points (set f′(x) = 0).', example: 'f(x) = x² at x = 3 → f′(3) = 6.' },
      { name: 'Integration (Power)', formula: '∫ xⁿ dx = xⁿ⁺¹ ÷ (n + 1) + C', simple: 'The opposite of differentiating: add 1 to the power, then divide by the new power. Never forget + C.', when: 'Finding area under a curve or the original function.', example: '∫ x² dx = x³/3 + C.' },
    ],
    Trigonometry: [
      { name: 'Compound Angle (sine)', formula: 'sin(α + β) = sin α cos β + cos α sin β', simple: 'Splits the sine of a sum into pieces you can calculate.', when: 'Exact values such as sin 75° = sin(45° + 30°).', example: 'sin 90° = sin 60° cos 30° + cos 60° sin 30° = 0,75 + 0,25 = 1.' },
      { name: 'Compound Angle (cosine)', formula: 'cos(α + β) = cos α cos β − sin α sin β', simple: 'Same idea for cosine, but notice the MINUS sign in the middle.', when: 'Exact values such as cos 75°.', example: 'cos 90° = cos 60° cos 30° − sin 60° sin 30° = 0,433 − 0,433 = 0.' },
      { name: 'Double Angle (sine)', formula: 'sin 2θ = 2 sin θ cos θ', simple: 'The sine of twice the angle.', when: 'Simplifying and solving equations.', example: 'sin 2θ = 2(0,6)(0,8) = 0,96 if sin θ = 0,6.' },
      { name: 'Double Angle (cosine)', formula: 'cos 2θ = 2cos²θ − 1', simple: 'One of three equivalent forms. Choose the one that leaves you with just one trig ratio.', when: 'Solving equations with cos 2θ and cos θ.', example: 'cos 2θ = 2(0,64) − 1 = 0,28 if cos θ = 0,8.' },
    ],
    Geometry: [
      { name: 'Equation of a Circle', formula: '(x − a)² + (y − b)² = r²', simple: 'All points that are exactly r away from the centre (a ; b).', when: 'A circle on the grid. Watch the signs: centre is (a ; b), not (−a ; −b).', example: '(x − 2)² + (y + 1)² = 9 has centre (2 ; −1) and radius 3.' },
      { name: 'Tangent to a Circle', formula: 'tangent ⟂ radius at the point of contact', simple: 'A tangent only touches the circle once and meets the radius at a right angle. Use m₁ × m₂ = −1.', when: 'Finding the equation of a tangent.', example: 'Radius gradient 2 → tangent gradient −½.' },
      { name: 'Area of a Sector', formula: 'A = (θ ÷ 360°) × πr²', simple: 'A slice of the circle: take the fraction of the full turn, then multiply by the full circle’s area.', when: 'Pizza-slice shaped areas.', example: 'θ = 90°, r = 4 → ¼ × π × 16 ≈ 12,57.' },
    ],
    Probability: [
      { name: 'Basic Probability', formula: 'P(A) = n(A) ÷ n(S)', simple: 'Number of ways it can happen divided by the total number of possible outcomes.', when: 'Any simple chance question.', example: 'Rolling an even number: 3 ÷ 6 = 0,5.' },
      { name: 'Complement', formula: 'P(not A) = 1 − P(A)', simple: 'The chance it does NOT happen is 1 minus the chance it does.', when: '“At least one” questions — easier to find the opposite.', example: 'P(rain) = 0,3 → P(no rain) = 0,7.' },
      { name: 'Addition Rule', formula: 'P(A or B) = P(A) + P(B) − P(A and B)', simple: 'Add the two chances, then take away the overlap so it is not counted twice.', when: 'Events that can happen together.', example: '0,5 + 0,3 − 0,1 = 0,7.' },
      { name: 'Independent Events', formula: 'P(A and B) = P(A) × P(B)', simple: 'If one event does not affect the other, multiply their chances.', when: 'Two coins, two dice, replacing items.', example: 'Two heads: ½ × ½ = ¼.' },
    ],
    Statistics: [
      { name: 'Mean', formula: 'x̄ = Σx ÷ n', simple: 'The average: add all the numbers and divide by how many there are.', when: 'Finding the “typical” value.', example: '2, 4, 9 → 15 ÷ 3 = 5.' },
      { name: 'Standard Deviation', formula: 'σ = √[Σ(x − x̄)² ÷ n]', simple: 'How spread out the numbers are from the mean. Small = bunched together; large = spread out.', when: 'Comparing consistency of two data sets.', example: '2, 4, 9 (mean 5): √[(9 + 1 + 16) ÷ 3] ≈ 2,94.' },
      { name: 'Least Squares Line', formula: 'ŷ = a + bx', simple: 'The straight “line of best fit” through scatter points, used to predict y from x.', when: 'Predicting values or describing a trend (use your calculator’s regression mode).', example: 'ŷ = 2 + 3x → x = 4 predicts y = 14.' },
    ],
  },
};
