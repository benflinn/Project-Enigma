import { ALPHABET, ALPHABET_SIZE } from './constants';

/**
 * Plugboard (Steckerbrett) implementation.
 * Swaps pairs of letters before and after the rotor stack.
 * Historically, up to 10 pairs of plugs were used in standard military operations.
 */
export class Plugboard {
  private wiringMap: number[]; // Index -> swapped index
  private pairs: string[] = [];

  constructor(pairs: string[] = []) {
    this.wiringMap = new Array(ALPHABET_SIZE);
    this.reset();
    this.setPairs(pairs);
  }

  public reset(): void {
    for (let i = 0; i < ALPHABET_SIZE; i++) {
      this.wiringMap[i] = i;
    }
    this.pairs = [];
  }

  public getPairs(): string[] {
    return [...this.pairs];
  }

  public getPairsString(): string {
    return this.pairs.join(' ');
  }

  public isPlugged(letter: string): boolean {
    const clean = letter.toUpperCase();
    return this.pairs.some((p) => p.includes(clean));
  }

  public getPartner(letter: string): string | null {
    const clean = letter.toUpperCase();
    for (const pair of this.pairs) {
      if (pair[0] === clean) return pair[1];
      if (pair[1] === clean) return pair[0];
    }
    return null;
  }

  public setPairs(pairs: string[]): void {
    this.reset();
    for (const pair of pairs) {
      this.addPairInternal(pair);
    }
  }

  public addPair(a: string, b: string): boolean {
    const cleanA = a.toUpperCase();
    const cleanB = b.toUpperCase();

    if (cleanA === cleanB) {
      throw new Error(`Cannot plug letter ${cleanA} to itself.`);
    }

    if (!ALPHABET.includes(cleanA) || !ALPHABET.includes(cleanB)) {
      throw new Error(`Invalid characters for plugboard: ${cleanA}, ${cleanB}`);
    }

    if (this.isPlugged(cleanA)) {
      throw new Error(`Letter ${cleanA} is already connected to ${this.getPartner(cleanA)}.`);
    }

    if (this.isPlugged(cleanB)) {
      throw new Error(`Letter ${cleanB} is already connected to ${this.getPartner(cleanB)}.`);
    }

    if (this.pairs.length >= 13) {
      throw new Error('Maximum of 13 plugboard pairs reached.');
    }

    this.addPairInternal(`${cleanA}${cleanB}`);
    return true;
  }

  private addPairInternal(pairString: string): void {
    const clean = pairString.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length !== 2) {
      throw new Error(`Invalid plugboard pair format: "${pairString}". Must be two letters like "AB".`);
    }

    const a = clean[0];
    const b = clean[1];

    if (a === b) {
      throw new Error(`Cannot plug letter ${a} to itself.`);
    }

    if (this.isPlugged(a) || this.isPlugged(b)) {
      throw new Error(`Duplicate plugboard connection for pair ${clean}`);
    }

    const idxA = a.charCodeAt(0) - 65;
    const idxB = b.charCodeAt(0) - 65;

    this.wiringMap[idxA] = idxB;
    this.wiringMap[idxB] = idxA;
    this.pairs.push(`${a}${b}`);
  }

  public removePair(letter: string): boolean {
    const clean = letter.toUpperCase();
    const pairIndex = this.pairs.findIndex((p) => p.includes(clean));
    if (pairIndex === -1) {
      return false;
    }

    const pair = this.pairs[pairIndex];
    const idxA = pair[0].charCodeAt(0) - 65;
    const idxB = pair[1].charCodeAt(0) - 65;

    this.wiringMap[idxA] = idxA;
    this.wiringMap[idxB] = idxB;
    this.pairs.splice(pairIndex, 1);
    return true;
  }

  public forward(char: string): string {
    const clean = char.toUpperCase();
    const idx = clean.charCodeAt(0) - 65;
    if (idx < 0 || idx >= ALPHABET_SIZE) {
      return char;
    }
    return ALPHABET[this.wiringMap[idx]];
  }

  public forwardPin(pinIndex: number): number {
    const normalized = ((pinIndex % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE;
    return this.wiringMap[normalized];
  }
}
