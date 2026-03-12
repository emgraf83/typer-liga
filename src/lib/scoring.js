/**
 * 3 pts – exact score
 * 1 pt  – correct winner / draw
 * 0 pts – wrong
 */
export function calcPoints(predHome, predAway, realHome, realAway) {
  if (predHome == null || predAway == null) return 0;
  if (realHome == null || realAway == null) return 0;

  const pH = parseInt(predHome), pA = parseInt(predAway);
  const rH = parseInt(realHome), rA = parseInt(realAway);

  if (pH === rH && pA === rA) return 3;
  if (Math.sign(pH - pA) === Math.sign(rH - rA)) return 1;
  return 0;
}

export function isExact(predHome, predAway, realHome, realAway) {
  return calcPoints(predHome, predAway, realHome, realAway) === 3;
}
