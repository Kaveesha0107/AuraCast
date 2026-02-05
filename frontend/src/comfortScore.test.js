const { getComfortScore } = require('./index.js');

describe('Comfort Score Calculation', () => {
  test('Perfect conditions should give high score', () => {
    const score = getComfortScore(22, 45, 10000);
    expect(score).toBeGreaterThan(95);
  });

  test('Extreme temperature should lower score', () => {
    const hotScore = getComfortScore(40, 45, 10000);
    const coldScore = getComfortScore(5, 45, 10000);
    expect(hotScore).toBeLessThan(50);
    expect(coldScore).toBeLessThan(50);
  });

  test('High humidity should lower score', () => {
    const score = getComfortScore(22, 80, 10000);
    expect(score).toBeLessThan(80);
  });

  test('Low visibility should lower score', () => {
    const score = getComfortScore(22, 45, 500);
    expect(score).toBeLessThan(70);
  });

  test('Score should be between 0 and 100', () => {
    const extremeScore = getComfortScore(100, 100, 0);
    expect(extremeScore).toBeGreaterThanOrEqual(0);
    expect(extremeScore).toBeLessThanOrEqual(100);
  });
});