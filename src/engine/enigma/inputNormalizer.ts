export interface NormalizationOptions {
  preserveSpaces?: boolean;
  replaceGermanLetters?: boolean; // Ä->AE, Ö->OE, Ü->UE, ß->SS
  replaceNumbers?: boolean;       // 1->EINS, 2->ZWEI, etc.
  groupSize?: number;             // e.g. 5 for historical 5-character groups
}

const NUMBER_MAP: Record<string, string> = {
  '0': 'NULL',
  '1': 'EINS',
  '2': 'ZWEI',
  '3': 'DREI',
  '4': 'VIER',
  '5': 'FUENF',
  '6': 'SECHS',
  '7': 'SIEBEN',
  '8': 'ACHT',
  '9': 'NEUN',
};

/**
 * Validates if a single character is an encryptable Enigma letter (A-Z).
 */
export function isValidEnigmaChar(char: string): boolean {
  if (!char || char.length !== 1) return false;
  const upper = char.toUpperCase();
  return upper >= 'A' && upper <= 'Z';
}

/**
 * Normalizes an arbitrary text string for Enigma machine encryption.
 * Enigma only operates on the 26 Latin letters A-Z.
 */
export function normalizeInput(text: string, options: NormalizationOptions = {}): string {
  let processed = text;

  if (options.replaceGermanLetters) {
    processed = processed
      .replace(/ä/g, 'ae')
      .replace(/Ä/g, 'AE')
      .replace(/ö/g, 'oe')
      .replace(/Ö/g, 'OE')
      .replace(/ü/g, 'ue')
      .replace(/Ü/g, 'UE')
      .replace(/ß/g, 'SS')
      .replace(/ẞ/g, 'SS');
  }

  processed = processed.toUpperCase();

  if (options.replaceNumbers) {
    processed = processed.replace(/[0-9]/g, (match) => NUMBER_MAP[match] || '');
  }

  if (options.preserveSpaces) {
    // Keep A-Z and spaces, collapse multiple spaces
    processed = processed.replace(/[^A-Z\s]/g, '').replace(/\s+/g, ' ');
  } else {
    // Strip everything except A-Z
    processed = processed.replace(/[^A-Z]/g, '');
  }

  if (options.groupSize && options.groupSize > 0) {
    const lettersOnly = processed.replace(/[^A-Z]/g, '');
    return formatMilitaryGroups(lettersOnly, options.groupSize);
  }

  return processed;
}

/**
 * Groups ciphertext or plaintext into standard 5-character groups (e.g. "ABCDE FGHIJ")
 */
export function formatMilitaryGroups(text: string, groupSize: number = 5): string {
  const lettersOnly = text.toUpperCase().replace(/[^A-Z]/g, '');
  const chunks: string[] = [];
  for (let i = 0; i < lettersOnly.length; i += groupSize) {
    chunks.push(lettersOnly.substring(i, i + groupSize));
  }
  return chunks.join(' ');
}
