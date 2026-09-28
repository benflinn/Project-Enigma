/**
 * Crib Analysis Engine.
 * Tests suspected plaintext fragments ("cribs") against ciphertext using
 * the fundamental Enigma property that no character can ever encrypt to itself.
 */

export interface CribClash {
  cribIndex: number;
  cipherIndex: number;
  letter: string;
}

export interface CribAlignmentResult {
  offset: number;
  isPlausible: boolean;
  clashCount: number;
  clashes: CribClash[];
  alignedCipherSegment: string;
  alignedCribText: string;
}

export interface CribAnalysisSummary {
  ciphertext: string;
  cribText: string;
  totalPositionsEvaluated: number;
  plausibleCount: number;
  eliminatedCount: number;
  eliminationPercentage: number;
  alignments: CribAlignmentResult[];
}

/**
 * Evaluates a single crib placement offset against ciphertext.
 */
export function evaluateCribOffset(
  ciphertext: string,
  crib: string,
  offset: number
): CribAlignmentResult {
  const cleanCipher = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanCrib = crib.toUpperCase().replace(/[^A-Z]/g, '');

  if (offset < 0 || offset + cleanCrib.length > cleanCipher.length) {
    throw new Error(`Invalid offset ${offset} for crib length ${cleanCrib.length} and ciphertext length ${cleanCipher.length}`);
  }

  const segment = cleanCipher.substring(offset, offset + cleanCrib.length);
  const clashes: CribClash[] = [];

  for (let k = 0; k < cleanCrib.length; k++) {
    const cipherChar = segment[k];
    const cribChar = cleanCrib[k];

    if (cipherChar === cribChar) {
      clashes.push({
        cribIndex: k,
        cipherIndex: offset + k,
        letter: cipherChar,
      });
    }
  }

  return {
    offset,
    isPlausible: clashes.length === 0,
    clashCount: clashes.length,
    clashes,
    alignedCipherSegment: segment,
    alignedCribText: cleanCrib,
  };
}

/**
 * Drags a suspected crib across all possible positions of a ciphertext,
 * identifying all plausible (surviving) and impossible (eliminated) offsets.
 */
export function analyzeCribPlacements(
  ciphertext: string,
  crib: string
): CribAnalysisSummary {
  const cleanCipher = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanCrib = crib.toUpperCase().replace(/[^A-Z]/g, '');

  if (cleanCrib.length === 0 || cleanCipher.length === 0 || cleanCrib.length > cleanCipher.length) {
    return {
      ciphertext: cleanCipher,
      cribText: cleanCrib,
      totalPositionsEvaluated: 0,
      plausibleCount: 0,
      eliminatedCount: 0,
      eliminationPercentage: 0,
      alignments: [],
    };
  }

  const maxOffset = cleanCipher.length - cleanCrib.length;
  const alignments: CribAlignmentResult[] = [];
  let plausibleCount = 0;

  for (let offset = 0; offset <= maxOffset; offset++) {
    const result = evaluateCribOffset(cleanCipher, cleanCrib, offset);
    if (result.isPlausible) {
      plausibleCount++;
    }
    alignments.push(result);
  }

  const total = alignments.length;
  const eliminated = total - plausibleCount;
  const eliminationPercentage = total > 0 ? (eliminated / total) * 100 : 0;

  return {
    ciphertext: cleanCipher,
    cribText: cleanCrib,
    totalPositionsEvaluated: total,
    plausibleCount,
    eliminatedCount: eliminated,
    eliminationPercentage,
    alignments,
  };
}
