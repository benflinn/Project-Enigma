import { ALPHABET_SIZE, REFLECTOR_DEFINITIONS } from './constants';
import { ReflectorDefinition, ReflectorType } from './types';

/**
 * Reflector (Umkehrwalze / UKW) implementation for the Enigma.
 * Reversible pairwise involution (never maps a letter to itself).
 */
export class Reflector {
  private definition: ReflectorDefinition;
  private wiringMap: number[];

  constructor(type: ReflectorType = 'B') {
    const def = REFLECTOR_DEFINITIONS[type];
    if (!def) {
      throw new Error(`Invalid reflector type: ${type}`);
    }
    this.definition = def;
    this.wiringMap = new Array(ALPHABET_SIZE);

    for (let i = 0; i < ALPHABET_SIZE; i++) {
      const targetChar = def.wiring[i];
      this.wiringMap[i] = targetChar.charCodeAt(0) - 65;
    }
  }

  public getType(): ReflectorType {
    return this.definition.type;
  }

  public getName(): string {
    return this.definition.name;
  }

  public forward(inputPin: number): { outputPin: number } {
    const normalizedInput = ((inputPin % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE;
    return { outputPin: this.wiringMap[normalizedInput] };
  }
}
