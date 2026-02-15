export interface RegisterValue {
  sign: '+' | '-' | null;
  digits: (number | null)[];  // 5 digits
}

export interface DSKYLights {
  compActy: boolean;
  uplinkActy: boolean;
  noAtt: boolean;
  stby: boolean;
  keyRel: boolean;
  oprErr: boolean;
  temp: boolean;
  gimbalLock: boolean;
  prog: boolean;
  restart: boolean;
  tracker: boolean;
  alt: boolean;
  vel: boolean;
}

export interface NavState {
  altitude: number;
  altitudeRate: number;
  horizontalVelocity: number;
  absVelocity: number;
  latitude: number;
  longitude: number;
  deltaV: number;
  timeFromIgnition: number;  // centiseconds
  range: number;
  rangeRate: number;
  apogee: number;
  perigee: number;
}

export type InputTarget = 'verb' | 'noun' | 'r1' | 'r2' | 'r3' | null;
export type InputMode = 'idle' | 'awaitingVerb' | 'awaitingNoun' | 'awaitingData';

export interface AGCState {
  verb: number | null;
  noun: number | null;
  program: number | null;

  r1: RegisterValue;
  r2: RegisterValue;
  r3: RegisterValue;

  lights: DSKYLights;
  verbNounFlash: boolean;

  inputMode: InputMode;
  inputBuffer: string;
  inputTarget: InputTarget;
  dataLoadQueue: ('r1' | 'r2' | 'r3')[];

  missionElapsedTime: number;  // centiseconds
  clockRunning: boolean;

  failreg: [number, number, number];

  monitorActive: boolean;
  monitorVerb: number | null;
  monitorNoun: number | null;
  monitorInterval: ReturnType<typeof setInterval> | null;

  nav: NavState;

  scenarioActive: boolean;
}

export type StateListener = (state: AGCState, changedKey?: string) => void;

const listeners: StateListener[] = [];

function blankRegister(): RegisterValue {
  return { sign: null, digits: [null, null, null, null, null] };
}

function defaultLights(): DSKYLights {
  return {
    compActy: false,
    uplinkActy: false,
    noAtt: false,
    stby: false,
    keyRel: false,
    oprErr: false,
    temp: false,
    gimbalLock: false,
    prog: false,
    restart: false,
    tracker: false,
    alt: false,
    vel: false,
  };
}

function defaultNav(): NavState {
  return {
    altitude: 0,
    altitudeRate: 0,
    horizontalVelocity: 0,
    absVelocity: 0,
    latitude: 0.6875,
    longitude: 23.4333,
    deltaV: 0,
    timeFromIgnition: 0,
    range: 0,
    rangeRate: 0,
    apogee: 60,
    perigee: 9,
  };
}

export function createInitialState(): AGCState {
  return {
    verb: null,
    noun: null,
    program: null,

    r1: blankRegister(),
    r2: blankRegister(),
    r3: blankRegister(),

    lights: defaultLights(),
    verbNounFlash: false,

    inputMode: 'idle',
    inputBuffer: '',
    inputTarget: null,
    dataLoadQueue: [],

    missionElapsedTime: 36900000,  // ~102:30:00 GET (landing time)
    clockRunning: true,

    failreg: [0, 0, 0],

    monitorActive: false,
    monitorVerb: null,
    monitorNoun: null,
    monitorInterval: null,

    nav: defaultNav(),

    scenarioActive: false,
  };
}

export const state: AGCState = createInitialState();

export function subscribe(listener: StateListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function notify(changedKey?: string): void {
  for (const listener of listeners) {
    listener(state, changedKey);
  }
}

export function resetState(): void {
  Object.assign(state, createInitialState());
  notify();
}

export function setRegister(
  reg: 'r1' | 'r2' | 'r3',
  sign: '+' | '-' | null,
  value: number,
  format: 'decimal' | 'octal' | 'blank' = 'decimal'
): void {
  if (format === 'blank') {
    state[reg] = blankRegister();
  } else {
    const absVal = Math.abs(Math.round(value));
    const str = absVal.toString().padStart(5, '0').slice(-5);
    state[reg] = {
      sign,
      digits: str.split('').map(Number),
    };
  }
  notify(reg);
}

export function blankReg(reg: 'r1' | 'r2' | 'r3'): void {
  state[reg] = blankRegister();
  notify(reg);
}
