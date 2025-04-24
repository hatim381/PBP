export function generatePools(teams) {
  const shuffled = [...teams].sort(() => 0.5 - Math.random());
  const n = shuffled.length;
  let group4Count = 0, group3Count = 0;
  
  // Trouver x et y tels que 4*x + 3*y = n
  // Parcours décroissant pour maximiser les groupes de 4
  for (let p4 = Math.floor(n / 4); p4 >= 0; p4--) {
    const remaining = n - (p4 * 4);
    if (remaining % 3 === 0) {
      const p3 = remaining / 3;
      if ((p4 * 2 + p3 * 2) % 2 === 0) { // Vérifie que le total de qualifiés est pair
        group4Count = p4;
        group3Count = p3;
        break;
      }
    }
  }
  
  const result = [];
  const waitingList = [];
  let index = 0;
  
  if (4 * group4Count + 3 * group3Count === n) {
    // Former exactement group4Count assembles of 4
    for (let i = 0; i < group4Count; i++) {
      result.push(shuffled.slice(index, index + 4));
      index += 4;
    }
    // Former group3Count assembles of 3
    for (let i = 0; i < group3Count; i++) {
      result.push(shuffled.slice(index, index + 3));
      index += 3;
    }
  } else {
    // fallback: assign as many as possible in groups of 4, then of 3; remainder goes to waiting list
    while (shuffled.length >= 4) {
      result.push(shuffled.splice(0, 4));
    }
    while (shuffled.length >= 3) {
      result.push(shuffled.splice(0, 3));
    }
    if (shuffled.length > 0) {
      waitingList.push(...shuffled);
    }
  }
  
  return { pools: result, waitingList };
}
