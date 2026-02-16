import type { AGCState } from '../stores/agc';
import { formatMETForDisplay, formatMinSec } from './clock';

export type FormatType =
  | 'octal'       // xxxxx (no sign)
  | 'whole'       // +xxxxx integer
  | 'degrees'     // +xxx.xx
  | 'hours'       // +00XXX
  | 'minutes'     // +000XX
  | 'seconds_cs'  // +XXX.XX (seconds.centiseconds)
  | 'min_sec'     // +MMbSS (minutes blank seconds)
  | 'velocity'    // +xxxx.x ft/sec
  | 'distance_nm' // +xxxx.x nautical miles
  | 'feet'        // +xxxxx feet
  | 'fractional'; // +.xxxxx

export interface NounDef {
  desc: string;
  components: number;
  formats: FormatType[];
  get: (state: AGCState) => (number | null)[];
  readOnly?: boolean;
}

// Format a value according to format type, returning { sign, raw5digits }
export function formatNounValue(
  value: number | null,
  format: FormatType
): { sign: '+' | '-' | null; digits: (number | null)[] } {
  if (value === null) {
    return { sign: null, digits: [null, null, null, null, null] };
  }

  if (format === 'octal') {
    const oct = Math.abs(Math.round(value));
    const str = oct.toString(8).padStart(5, '0').slice(-5);
    return { sign: null, digits: str.split('').map(Number) };
  }

  const sign: '+' | '-' = value >= 0 ? '+' : '-';
  const absVal = Math.abs(value);
  let raw: number;

  switch (format) {
    case 'whole':
    case 'hours':
    case 'minutes':
    case 'feet':
      raw = Math.round(absVal);
      break;
    case 'degrees':
      // xxx.xx → store as xxxxx with implicit decimal at position 3
      raw = Math.round(absVal * 100);
      break;
    case 'seconds_cs':
      // xxx.xx seconds → store as xxxxx
      raw = Math.round(absVal);
      break;
    case 'velocity':
    case 'distance_nm':
      // xxxx.x → store as xxxxx with implicit decimal at position 4
      raw = Math.round(absVal * 10);
      break;
    case 'min_sec': {
      const ms = formatMinSec(Math.round(absVal * 100));
      // MMbSS → digits: [M, M, blank, S, S]
      const minStr = ms.min.toString().padStart(2, '0');
      const secStr = ms.sec.toString().padStart(2, '0');
      return {
        sign,
        digits: [
          Number(minStr[0]),
          Number(minStr[1]),
          null,  // blank separator
          Number(secStr[0]),
          Number(secStr[1]),
        ],
      };
    }
    case 'fractional':
      raw = Math.round(absVal * 100000);
      break;
    default:
      raw = Math.round(absVal);
  }

  const str = raw.toString().padStart(5, '0').slice(-5);
  return { sign, digits: str.split('').map(Number) };
}

export const NOUNS: Record<number, NounDef> = {
  9: {
    desc: 'Alarm codes',
    components: 3,
    formats: ['octal', 'octal', 'octal'],
    readOnly: true,
    get: (s) => [s.failreg[0], s.failreg[1], s.failreg[2]],
  },

  36: {
    desc: 'AGC clock time (HH:MM:SS.cs)',
    components: 3,
    formats: ['hours', 'minutes', 'seconds_cs'],
    readOnly: true,
    get: (s) => {
      const [h, m, scs] = formatMETForDisplay();
      void s; // uses global clock
      return [h, m, scs];
    },
  },

  43: {
    desc: 'Latitude / Longitude / Altitude',
    components: 3,
    formats: ['degrees', 'degrees', 'distance_nm'],
    readOnly: true,
    get: (s) => [s.nav.latitude, s.nav.longitude, s.nav.altitude / 6076.12],
  },

  60: {
    desc: 'Horizontal velocity / Altitude rate / Altitude',
    components: 3,
    formats: ['velocity', 'velocity', 'feet'],
    readOnly: true,
    get: (s) => [s.nav.horizontalVelocity, s.nav.altitudeRate, s.nav.altitude],
  },

  62: {
    desc: 'Absolute velocity / Time from ignition / Delta-V',
    components: 3,
    formats: ['velocity', 'min_sec', 'velocity'],
    readOnly: true,
    get: (s) => [s.nav.absVelocity, s.nav.timeFromIgnition / 100, s.nav.deltaV],
  },

  63: {
    desc: 'Absolute velocity / Altitude rate / Altitude',
    components: 3,
    formats: ['velocity', 'velocity', 'feet'],
    readOnly: true,
    get: (s) => [s.nav.absVelocity, s.nav.altitudeRate, s.nav.altitude],
  },

  64: {
    desc: 'LPD angle / Altitude rate / Altitude',
    components: 3,
    formats: ['whole', 'velocity', 'feet'],
    readOnly: true,
    get: (s) => {
      // LPD angle: approximate from altitude and range
      const lpdAngle = s.nav.altitude > 0 ? Math.round(Math.atan2(s.nav.altitude, s.nav.range * 6076.12) * 180 / Math.PI) : 0;
      return [lpdAngle, s.nav.altitudeRate, s.nav.altitude];
    },
  },

  68: {
    desc: 'Slant range / Time to go / LR alt - computed alt',
    components: 3,
    formats: ['distance_nm', 'min_sec', 'feet'],
    readOnly: true,
    get: (s) => [s.nav.range, s.nav.timeFromIgnition / 100, s.nav.altitude],
  },
};

export function getNounDef(nounCode: number): NounDef | undefined {
  return NOUNS[nounCode];
}
