import { ALPHABET, DEFAULT_ENIGMA_CONFIG } from './constants';
import { Plugboard } from './plugboard';
import { Reflector } from './reflector';
import { Rotor } from './rotor';
import {
  EnigmaMachineConfig,
  EncryptionResult,
  MessageEncryptionResult,
  SerializedEnigmaConfig,
  SignalPathStep,
  SteppingState,
} from './types';

/**
 * Historical German Military Enigma I (Wehrmacht / Luftwaffe) Machine Implementation.
 * 
 * Features:
 * - 3 interchangeable rotors from standard pool (I, II, III, IV, V)
 * - Configurable ring settings (Ringstellung) 1-26
 * - Configurable rotor positions (Grundstellung) 'A'-'Z'
 * - Authentic turnover notch and middle rotor double-stepping mechanics
 * - Interchangeable reflectors (A, B, C)
 * - Configurable plugboard (Steckerbrett) with pairwise swapping
 * - Deterministic, reciprocal encryption
 * - Full step-by-step electrical signal path generation for explanation / visualization
 * - Configuration serialization and restoration
 */
export class EnigmaMachine {
  private rotors: [Rotor, Rotor, Rotor]; // [Left (0), Middle (1), Right (2)]
  private reflector: Reflector;
  private plugboard: Plugboard;
  private initialConfig: EnigmaMachineConfig;

  constructor(config: Partial<EnigmaMachineConfig> = {}) {
    const fullConfig: EnigmaMachineConfig = {
      rotors: config.rotors || [
        { ...DEFAULT_ENIGMA_CONFIG.rotors[0] },
        { ...DEFAULT_ENIGMA_CONFIG.rotors[1] },
        { ...DEFAULT_ENIGMA_CONFIG.rotors[2] },
      ],
      reflector: config.reflector || DEFAULT_ENIGMA_CONFIG.reflector,
      plugboard: config.plugboard ? [...config.plugboard] : [...DEFAULT_ENIGMA_CONFIG.plugboard],
    };

    this.validateConfig(fullConfig);
    this.initialConfig = this.cloneConfig(fullConfig);

    this.rotors = [
      new Rotor(fullConfig.rotors[0].type, fullConfig.rotors[0].position, fullConfig.rotors[0].ringSetting),
      new Rotor(fullConfig.rotors[1].type, fullConfig.rotors[1].position, fullConfig.rotors[1].ringSetting),
      new Rotor(fullConfig.rotors[2].type, fullConfig.rotors[2].position, fullConfig.rotors[2].ringSetting),
    ];

    this.reflector = new Reflector(fullConfig.reflector);
    this.plugboard = new Plugboard(fullConfig.plugboard);
  }

  /**
   * Validate configuration consistency:
   * - Exactly 3 rotors
   * - Valid rotor types without duplicates in the 3 slots
   * - Positions A-Z
   * - Ring settings 1-26
   * - Plugboard no duplicates
   */
  public validateConfig(config: EnigmaMachineConfig): void {
    if (!config.rotors || config.rotors.length !== 3) {
      throw new Error('Enigma I requires exactly 3 rotors.');
    }

    const types = config.rotors.map((r) => r.type);
    const uniqueTypes = new Set(types);
    if (uniqueTypes.size !== 3) {
      throw new Error('All 3 rotors in the machine must be distinct.');
    }

    for (let i = 0; i < 3; i++) {
      const r = config.rotors[i];
      const pos = r.position.toUpperCase();
      if (pos.length !== 1 || pos < 'A' || pos > 'Z') {
        throw new Error(`Invalid rotor position "${r.position}" at slot ${i}. Must be A-Z.`);
      }
      if (r.ringSetting < 1 || r.ringSetting > 26) {
        throw new Error(`Invalid ring setting ${r.ringSetting} at slot ${i}. Must be 1-26.`);
      }
    }

    if (!['A', 'B', 'C'].includes(config.reflector)) {
      throw new Error(`Invalid reflector: ${config.reflector}`);
    }

    // Plugboard validation is also enforced by Plugboard class
    new Plugboard(config.plugboard);
  }

  /**
   * Clone a machine configuration object.
   */
  private cloneConfig(config: EnigmaMachineConfig): EnigmaMachineConfig {
    return {
      rotors: [
        { ...config.rotors[0] },
        { ...config.rotors[1] },
        { ...config.rotors[2] },
      ],
      reflector: config.reflector,
      plugboard: [...config.plugboard],
    };
  }

  /**
   * Returns the current machine configuration.
   */
  public getConfig(): EnigmaMachineConfig {
    return {
      rotors: [
        {
          type: this.rotors[0].getType(),
          position: this.rotors[0].getPositionLetter(),
          ringSetting: this.rotors[0].getRingSetting(),
        },
        {
          type: this.rotors[1].getType(),
          position: this.rotors[1].getPositionLetter(),
          ringSetting: this.rotors[1].getRingSetting(),
        },
        {
          type: this.rotors[2].getType(),
          position: this.rotors[2].getPositionLetter(),
          ringSetting: this.rotors[2].getRingSetting(),
        },
      ],
      reflector: this.reflector.getType(),
      plugboard: this.plugboard.getPairs(),
    };
  }

  /**
   * Reconfigures the machine completely and saves this new state as the initial state.
   */
  public setConfig(config: EnigmaMachineConfig): void {
    this.validateConfig(config);
    this.initialConfig = this.cloneConfig(config);

    this.rotors = [
      new Rotor(config.rotors[0].type, config.rotors[0].position, config.rotors[0].ringSetting),
      new Rotor(config.rotors[1].type, config.rotors[1].position, config.rotors[1].ringSetting),
      new Rotor(config.rotors[2].type, config.rotors[2].position, config.rotors[2].ringSetting),
    ];
    this.reflector = new Reflector(config.reflector);
    this.plugboard = new Plugboard(config.plugboard);
  }

  /**
   * Resets the machine's rotor positions back to the initial starting positions (Grundstellung)
   * without changing rotor types, ring settings, or plugboard.
   */
  public resetToInitialPositions(): void {
    this.rotors[0].setPosition(this.initialConfig.rotors[0].position);
    this.rotors[1].setPosition(this.initialConfig.rotors[1].position);
    this.rotors[2].setPosition(this.initialConfig.rotors[2].position);
  }

  /**
   * Sets the initial positions baseline to the current positions.
   */
  public setInitialPositions(positions: [string, string, string]): void {
    this.initialConfig.rotors[0].position = positions[0].toUpperCase();
    this.initialConfig.rotors[1].position = positions[1].toUpperCase();
    this.initialConfig.rotors[2].position = positions[2].toUpperCase();
    this.rotors[0].setPosition(positions[0]);
    this.rotors[1].setPosition(positions[1]);
    this.rotors[2].setPosition(positions[2]);
  }

  /**
   * Set positions directly without updating the baseline initial config.
   */
  public setPositions(positions: [string, string, string]): void {
    this.rotors[0].setPosition(positions[0]);
    this.rotors[1].setPosition(positions[1]);
    this.rotors[2].setPosition(positions[2]);
  }

  public getPositions(): [string, string, string] {
    return [
      this.rotors[0].getPositionLetter(),
      this.rotors[1].getPositionLetter(),
      this.rotors[2].getPositionLetter(),
    ];
  }

  public getInitialPositions(): [string, string, string] {
    return [
      this.initialConfig.rotors[0].position,
      this.initialConfig.rotors[1].position,
      this.initialConfig.rotors[2].position,
    ];
  }

  public getRotors(): [Rotor, Rotor, Rotor] {
    return this.rotors;
  }

  public getReflector(): Reflector {
    return this.reflector;
  }

  public getPlugboard(): Plugboard {
    return this.plugboard;
  }

  /**
   * Advances the rotors according to historical Enigma mechanics.
   * 
   * Mechanical rules:
   * 1. The right rotor (fast rotor) ALWAYS advances on every key stroke.
   * 2. The middle rotor advances if the right rotor is at its turnover notch.
   * 3. The double-stepping anomaly:
   *    If the middle rotor is at its turnover notch, on the NEXT stroke its pawl
   *    engages both its own ratchet AND the left rotor's ratchet.
   *    Consequently, the middle rotor steps AGAIN and the left rotor steps!
   */
  public stepRotors(): SteppingState {
    const leftRotor = this.rotors[0];
    const middleRotor = this.rotors[1];
    const rightRotor = this.rotors[2];

    const middleAtNotch = middleRotor.isAtNotch();
    const rightAtNotch = rightRotor.isAtNotch();

    const leftStepped = middleAtNotch;
    const middleStepped = middleAtNotch || rightAtNotch;
    const rightStepped = true;

    if (leftStepped) {
      leftRotor.step();
    }
    if (middleStepped) {
      middleRotor.step();
    }
    if (rightStepped) {
      rightRotor.step();
    }

    return {
      leftStepped,
      middleStepped,
      rightStepped,
    };
  }

  /**
   * Encrypts a single character.
   * Performs rotor stepping first, then traces the complete electrical signal
   * through Plugboard -> ETW -> Right -> Middle -> Left -> Reflector -> Left -> Middle -> Right -> ETW -> Plugboard -> Lampboard.
   */
  public encryptChar(char: string): EncryptionResult {
    const upper = char.toUpperCase();
    if (upper < 'A' || upper > 'Z' || upper.length !== 1) {
      throw new Error(`Enigma can only encrypt single letters A-Z. Received: "${char}"`);
    }

    const previousPositions: [string, string, string] = [
      this.rotors[0].getPositionLetter(),
      this.rotors[1].getPositionLetter(),
      this.rotors[2].getPositionLetter(),
    ];

    // Stepping happens BEFORE the electrical contact closes
    const stepping = this.stepRotors();

    const currentPositions: [string, string, string] = [
      this.rotors[0].getPositionLetter(),
      this.rotors[1].getPositionLetter(),
      this.rotors[2].getPositionLetter(),
    ];

    const signalPath: SignalPathStep[] = [];

    // Stage 1: Key Pressed
    const keyPin = upper.charCodeAt(0) - 65;
    signalPath.push({
      stage: 'KEYBOARD',
      name: 'Keyboard',
      inputChar: upper,
      outputChar: upper,
      inputPin: keyPin,
      outputPin: keyPin,
      description: `Key '${upper}' pressed (Pin ${keyPin})`,
    });

    // Stage 2: Plugboard Input
    const plugboardInChar = this.plugboard.forward(upper);
    const plugboardInPin = plugboardInChar.charCodeAt(0) - 65;
    const isSteckeredIn = plugboardInChar !== upper;
    signalPath.push({
      stage: 'PLUGBOARD_IN',
      name: 'Plugboard (Entry)',
      inputChar: upper,
      outputChar: plugboardInChar,
      inputPin: keyPin,
      outputPin: plugboardInPin,
      description: isSteckeredIn
        ? `Plugboard swapped '${upper}' -> '${plugboardInChar}'`
        : `Unconnected in plugboard ('${upper}' unchanged)`,
    });

    // Stage 3: ETW (Entry Wheel)
    const etwInPin = plugboardInPin;
    const etwInChar = ALPHABET[etwInPin];
    signalPath.push({
      stage: 'ETW_IN',
      name: 'Entry Wheel (ETW)',
      inputChar: plugboardInChar,
      outputChar: etwInChar,
      inputPin: plugboardInPin,
      outputPin: etwInPin,
      description: `Direct straight-through entry at Pin ${etwInPin} ('${etwInChar}')`,
    });

    // Stage 4: Right Rotor Forward
    const rightRotor = this.rotors[2];
    const rightFwd = rightRotor.forward(etwInPin);
    const rightFwdChar = ALPHABET[rightFwd.outputPin];
    signalPath.push({
      stage: 'ROTOR_RIGHT_FWD',
      name: `Right Rotor (${rightRotor.getType()}) [Fwd]`,
      inputChar: etwInChar,
      outputChar: rightFwdChar,
      inputPin: etwInPin,
      outputPin: rightFwd.outputPin,
      rotorType: rightRotor.getType(),
      rotorPosition: rightRotor.getPositionLetter(),
      ringSetting: rightRotor.getRingSetting(),
      description: `Rotor ${rightRotor.getType()} (Pos ${rightRotor.getPositionLetter()}, Ring ${rightRotor.getRingSetting()}): Pin ${etwInPin} -> Pin ${rightFwd.outputPin} ('${rightFwdChar}')`,
    });

    // Stage 5: Middle Rotor Forward
    const midRotor = this.rotors[1];
    const midFwd = midRotor.forward(rightFwd.outputPin);
    const midFwdChar = ALPHABET[midFwd.outputPin];
    signalPath.push({
      stage: 'ROTOR_MID_FWD',
      name: `Middle Rotor (${midRotor.getType()}) [Fwd]`,
      inputChar: rightFwdChar,
      outputChar: midFwdChar,
      inputPin: rightFwd.outputPin,
      outputPin: midFwd.outputPin,
      rotorType: midRotor.getType(),
      rotorPosition: midRotor.getPositionLetter(),
      ringSetting: midRotor.getRingSetting(),
      description: `Rotor ${midRotor.getType()} (Pos ${midRotor.getPositionLetter()}, Ring ${midRotor.getRingSetting()}): Pin ${rightFwd.outputPin} -> Pin ${midFwd.outputPin} ('${midFwdChar}')`,
    });

    // Stage 6: Left Rotor Forward
    const leftRotor = this.rotors[0];
    const leftFwd = leftRotor.forward(midFwd.outputPin);
    const leftFwdChar = ALPHABET[leftFwd.outputPin];
    signalPath.push({
      stage: 'ROTOR_LEFT_FWD',
      name: `Left Rotor (${leftRotor.getType()}) [Fwd]`,
      inputChar: midFwdChar,
      outputChar: leftFwdChar,
      inputPin: midFwd.outputPin,
      outputPin: leftFwd.outputPin,
      rotorType: leftRotor.getType(),
      rotorPosition: leftRotor.getPositionLetter(),
      ringSetting: leftRotor.getRingSetting(),
      description: `Rotor ${leftRotor.getType()} (Pos ${leftRotor.getPositionLetter()}, Ring ${leftRotor.getRingSetting()}): Pin ${midFwd.outputPin} -> Pin ${leftFwd.outputPin} ('${leftFwdChar}')`,
    });

    // Stage 7: Reflector (UKW)
    const refResult = this.reflector.forward(leftFwd.outputPin);
    const refChar = ALPHABET[refResult.outputPin];
    signalPath.push({
      stage: 'REFLECTOR',
      name: `Reflector (${this.reflector.getType()})`,
      inputChar: leftFwdChar,
      outputChar: refChar,
      inputPin: leftFwd.outputPin,
      outputPin: refResult.outputPin,
      description: `Reflector ${this.reflector.getType()} reflected Pin ${leftFwd.outputPin} -> Pin ${refResult.outputPin} ('${refChar}')`,
    });

    // Stage 8: Left Rotor Reverse
    const leftRev = leftRotor.reverse(refResult.outputPin);
    const leftRevChar = ALPHABET[leftRev.outputPin];
    signalPath.push({
      stage: 'ROTOR_LEFT_REV',
      name: `Left Rotor (${leftRotor.getType()}) [Rev]`,
      inputChar: refChar,
      outputChar: leftRevChar,
      inputPin: refResult.outputPin,
      outputPin: leftRev.outputPin,
      rotorType: leftRotor.getType(),
      rotorPosition: leftRotor.getPositionLetter(),
      ringSetting: leftRotor.getRingSetting(),
      description: `Rotor ${leftRotor.getType()} [Reverse]: Pin ${refResult.outputPin} -> Pin ${leftRev.outputPin} ('${leftRevChar}')`,
    });

    // Stage 9: Middle Rotor Reverse
    const midRev = midRotor.reverse(leftRev.outputPin);
    const midRevChar = ALPHABET[midRev.outputPin];
    signalPath.push({
      stage: 'ROTOR_MID_REV',
      name: `Middle Rotor (${midRotor.getType()}) [Rev]`,
      inputChar: leftRevChar,
      outputChar: midRevChar,
      inputPin: leftRev.outputPin,
      outputPin: midRev.outputPin,
      rotorType: midRotor.getType(),
      rotorPosition: midRotor.getPositionLetter(),
      ringSetting: midRotor.getRingSetting(),
      description: `Rotor ${midRotor.getType()} [Reverse]: Pin ${leftRev.outputPin} -> Pin ${midRev.outputPin} ('${midRevChar}')`,
    });

    // Stage 10: Right Rotor Reverse
    const rightRev = rightRotor.reverse(midRev.outputPin);
    const rightRevChar = ALPHABET[rightRev.outputPin];
    signalPath.push({
      stage: 'ROTOR_RIGHT_REV',
      name: `Right Rotor (${rightRotor.getType()}) [Rev]`,
      inputChar: midRevChar,
      outputChar: rightRevChar,
      inputPin: midRev.outputPin,
      outputPin: rightRev.outputPin,
      rotorType: rightRotor.getType(),
      rotorPosition: rightRotor.getPositionLetter(),
      ringSetting: rightRotor.getRingSetting(),
      description: `Rotor ${rightRotor.getType()} [Reverse]: Pin ${midRev.outputPin} -> Pin ${rightRev.outputPin} ('${rightRevChar}')`,
    });

    // Stage 11: ETW Output
    const etwOutPin = rightRev.outputPin;
    const etwOutChar = ALPHABET[etwOutPin];
    signalPath.push({
      stage: 'ETW_OUT',
      name: 'Entry Wheel (ETW Return)',
      inputChar: rightRevChar,
      outputChar: etwOutChar,
      inputPin: etwOutPin,
      outputPin: etwOutPin,
      description: `Return signal passed Pin ${etwOutPin} ('${etwOutChar}')`,
    });

    // Stage 12: Plugboard Output
    const plugboardOutChar = this.plugboard.forward(etwOutChar);
    const plugboardOutPin = plugboardOutChar.charCodeAt(0) - 65;
    const isSteckeredOut = plugboardOutChar !== etwOutChar;
    signalPath.push({
      stage: 'PLUGBOARD_OUT',
      name: 'Plugboard (Exit)',
      inputChar: etwOutChar,
      outputChar: plugboardOutChar,
      inputPin: etwOutPin,
      outputPin: plugboardOutPin,
      description: isSteckeredOut
        ? `Plugboard swapped '${etwOutChar}' -> '${plugboardOutChar}'`
        : `Unconnected in plugboard ('${etwOutChar}' unchanged)`,
    });

    // Stage 13: Lampboard
    signalPath.push({
      stage: 'LAMPBOARD',
      name: 'Lampboard',
      inputChar: plugboardOutChar,
      outputChar: plugboardOutChar,
      inputPin: plugboardOutPin,
      outputPin: plugboardOutPin,
      description: `Lamp '${plugboardOutChar}' illuminates`,
    });

    return {
      inputChar: upper,
      outputChar: plugboardOutChar,
      previousPositions,
      currentPositions,
      stepping,
      signalPath,
    };
  }

  /**
   * Encrypts a whole message string. Non-alphabetical characters can either be ignored or cause an error.
   */
  public encryptMessage(message: string, skipInvalid: boolean = true): MessageEncryptionResult {
    const initialPositions = this.getPositions();
    const charResults: EncryptionResult[] = [];
    let outputText = '';

    for (let i = 0; i < message.length; i++) {
      const ch = message[i].toUpperCase();
      if (ch >= 'A' && ch <= 'Z') {
        const result = this.encryptChar(ch);
        charResults.push(result);
        outputText += result.outputChar;
      } else if (!skipInvalid) {
        throw new Error(`Invalid character "${message[i]}" at index ${i}`);
      }
    }

    return {
      inputText: message,
      outputText,
      charResults,
      initialPositions,
      finalPositions: this.getPositions(),
    };
  }

  /**
   * Serialize configuration to a JSON-compatible object.
   */
  public serialize(): SerializedEnigmaConfig {
    return {
      version: 1,
      rotors: {
        left: {
          type: this.rotors[0].getType(),
          ringSetting: this.rotors[0].getRingSetting(),
          position: this.rotors[0].getPositionLetter(),
        },
        middle: {
          type: this.rotors[1].getType(),
          ringSetting: this.rotors[1].getRingSetting(),
          position: this.rotors[1].getPositionLetter(),
        },
        right: {
          type: this.rotors[2].getType(),
          ringSetting: this.rotors[2].getRingSetting(),
          position: this.rotors[2].getPositionLetter(),
        },
      },
      reflector: this.reflector.getType(),
      plugboard: this.plugboard.getPairs(),
    };
  }

  /**
   * Restores machine configuration from serialized format.
   */
  public static fromSerialized(serialized: SerializedEnigmaConfig): EnigmaMachine {
    const config: EnigmaMachineConfig = {
      rotors: [
        {
          type: serialized.rotors.left.type,
          position: serialized.rotors.left.position,
          ringSetting: serialized.rotors.left.ringSetting,
        },
        {
          type: serialized.rotors.middle.type,
          position: serialized.rotors.middle.position,
          ringSetting: serialized.rotors.middle.ringSetting,
        },
        {
          type: serialized.rotors.right.type,
          position: serialized.rotors.right.position,
          ringSetting: serialized.rotors.right.ringSetting,
        },
      ],
      reflector: serialized.reflector,
      plugboard: serialized.plugboard,
    };

    return new EnigmaMachine(config);
  }

  /**
   * Clones this machine with exact internal state.
   */
  public clone(): EnigmaMachine {
    const m = new EnigmaMachine(this.getConfig());
    m.initialConfig = this.cloneConfig(this.initialConfig);
    return m;
  }
}
