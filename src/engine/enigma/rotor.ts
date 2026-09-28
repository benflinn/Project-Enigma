import { ALPHABET, ALPHABET_SIZE, ROTOR_DEFINITIONS } from './constants';
import { RotorDefinition, RotorType } from './types';

/**
 * Rotor (Walze) implementation for the German Military Enigma.
 * Handles:
 * - Rotor position (Grundstellung): 0-25 ('A'-'Z')
 * - Ring setting (Ringstellung): 1-26 (where 1 = 'A' = 0 offset)
 * - Forward signal pass (Right to Left / Keyboard towards Reflector)
 * - Reverse signal pass (Left to Right / Reflector towards Lampboard)
 * - Turnover notch engagement (engages when window shows notch letter)
 */
export class Rotor {
  private definition: RotorDefinition;
  private wiringMap: number[];        // Forward wiring array: index -> output pin
  private inverseWiringMap: number[]; // Reverse wiring array: output pin -> index
  private positionIndex: number;      // 0..25 (0 = 'A')
  private ringOffset: number;         // 0..25 (ringSetting - 1)
  private notchIndex: number;         // 0..25 index of the notch letter

  constructor(type: RotorType, position: string | number = 'A', ringSetting: number = 1) {
    const def = ROTOR_DEFINITIONS[type];
    if (!def) {
      throw new Error(`Invalid rotor type: ${type}`);
    }
    this.definition = def;
    this.wiringMap = new Array(ALPHABET_SIZE);
    this.inverseWiringMap = new Array(ALPHABET_SIZE);

    for (let i = 0; i < ALPHABET_SIZE; i++) {
      const targetChar = def.wiring[i];
      const targetIndex = targetChar.charCodeAt(0) - 65;
      this.wiringMap[i] = targetIndex;
      this.inverseWiringMap[targetIndex] = i;
    }

    this.notchIndex = def.notch.charCodeAt(0) - 65;
    this.ringOffset = (ringSetting - 1 + ALPHABET_SIZE) % ALPHABET_SIZE;
    this.positionIndex = typeof position === 'string' ? position.toUpperCase().charCodeAt(0) - 65 : position % ALPHABET_SIZE;
  }

  public getType(): RotorType {
    return this.definition.type;
  }

  public getName(): string {
    return this.definition.name;
  }

  public getNotchLetter(): string {
    return this.definition.notch;
  }

  public getPositionIndex(): number {
    return this.positionIndex;
  }

  public getPositionLetter(): string {
    return ALPHABET[this.positionIndex];
  }

  public setPosition(pos: string | number): void {
    if (typeof pos === 'string') {
      const clean = pos.toUpperCase();
      if (clean.length === 1 && clean >= 'A' && clean <= 'Z') {
        this.positionIndex = clean.charCodeAt(0) - 65;
      } else {
        throw new Error(`Invalid position character: ${pos}`);
      }
    } else {
      this.positionIndex = ((pos % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE;
    }
  }

  public getRingSetting(): number {
    return this.ringOffset + 1;
  }

  public setRingSetting(ringSetting: number): void {
    if (ringSetting < 1 || ringSetting > 26) {
      throw new Error(`Ring setting must be between 1 and 26. Received: ${ringSetting}`);
    }
    this.ringOffset = ringSetting - 1;
  }

  /**
   * Advances the rotor position by one step (modulo 26).
   */
  public step(): void {
    this.positionIndex = (this.positionIndex + 1) % ALPHABET_SIZE;
  }

  /**
   * Check if the rotor is currently aligned at its turnover notch position.
   * On Enigma I, the notch is tied to the alphabet ring so that when the
   * window displays the notch letter, the pawl drops in to trigger stepping.
   */
  public isAtNotch(): boolean {
    return this.positionIndex === this.notchIndex;
  }

  /**
   * Forward signal pass through rotor (Right face to Left face).
   * 
   * Calculation:
   * Shift = (position - ringOffset + 26) % 26
   * internalPinIn = (inputPin + Shift) % 26
   * internalPinOut = wiring[internalPinIn]
   * outputPin = (internalPinOut - Shift + 26) % 26
   */
  public forward(inputPin: number): {
    outputPin: number;
    internalPinIn: number;
    internalPinOut: number;
  } {
    const shift = (this.positionIndex - this.ringOffset + ALPHABET_SIZE) % ALPHABET_SIZE;
    const internalPinIn = (inputPin + shift) % ALPHABET_SIZE;
    const internalPinOut = this.wiringMap[internalPinIn];
    const outputPin = (internalPinOut - shift + ALPHABET_SIZE) % ALPHABET_SIZE;

    return { outputPin, internalPinIn, internalPinOut };
  }

  /**
   * Reverse signal pass through rotor (Left face to Right face, returning from Reflector).
   */
  public reverse(inputPin: number): {
    outputPin: number;
    internalPinIn: number;
    internalPinOut: number;
  } {
    const shift = (this.positionIndex - this.ringOffset + ALPHABET_SIZE) % ALPHABET_SIZE;
    const internalPinIn = (inputPin + shift) % ALPHABET_SIZE;
    const internalPinOut = this.inverseWiringMap[internalPinIn];
    const outputPin = (internalPinOut - shift + ALPHABET_SIZE) % ALPHABET_SIZE;

    return { outputPin, internalPinIn, internalPinOut };
  }

  public clone(): Rotor {
    const cloned = new Rotor(this.definition.type, this.positionIndex, this.ringOffset + 1);
    return cloned;
  }
}
