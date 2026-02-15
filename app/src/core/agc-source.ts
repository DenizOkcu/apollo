// Curated AGC source code snippets from the actual Apollo 11 Luminary099 codebase.
// These are real lines of code and comments from the astronauts' guidance computer.
// Each snippet is tagged for use during specific scenario phases.

export interface AGCSourceLine {
  text: string;
  isComment: boolean;
  isLabel: boolean;
  isHighlight: boolean;  // developer comments worth highlighting
  file: string;          // source file name
}

export interface AGCCodeBlock {
  id: string;
  title: string;
  file: string;
  lines: AGCSourceLine[];
}

function parseLine(raw: string, file: string): AGCSourceLine {
  const trimmed = raw.trimStart();
  const isComment = trimmed.startsWith('#');
  const isLabel = !isComment && /^[A-Z0-9_]+\s/.test(trimmed) && !trimmed.startsWith(' ');
  // Highlight comments that contain dev humor, explanations, or famous phrases
  const isHighlight = isComment && (
    /BURN.BABY|FLAGORGY|POODOO|CURTAINS|WHIMPER|BAILOUT|CRANK.*SILLY|OFF TO SEE|WIZARD|MAGNIFICENT|ASTRONAUT|HELLO|GOODBYE|TEMPORARY.*HOPE|NOLI SE TANGERE|HONI SOIT|ENEMA|POOH|GUILDENSTERN|PINBALL/i.test(raw) ||
    /WE CAME|NOT NEEDED|PILOT|HERO|FAMOUS|HAMILTON|PRIDE|THE FOLLOWING|THIS ROUTINE|IMPORTANT|NOTE WELL|HISTORY/i.test(raw)
  );

  return { text: raw, isComment, isLabel, isHighlight, file };
}

function block(id: string, title: string, file: string, lines: string[]): AGCCodeBlock {
  return {
    id,
    title,
    file,
    lines: lines.map(l => parseLine(l, file)),
  };
}

// ============================================================
// LANDING SCENARIO BLOCKS
// ============================================================

export const LANDING_INTRO = block(
  'landing-intro',
  'PINBALL GAME BUTTONS AND LIGHTS',
  'PINBALL_GAME_BUTTONS_AND_LIGHTS.agc',
  [
    '# PINBALL GAME BUTTONS AND LIGHTS',
    '#',
    '# ACTIVE KEYBOARD AND DISPLAY PROGRAM',
    '#',
    '# BY ALAN GREEN AND OTHERS',
    '#',
    '# THE FOLLOWING ACTIVE KEYBOARD AND DISPLAY ROUTINES',
    '# WERE CONCEIVED AND FIRST IMPLEMENTED IN JUNE 1966',
    '# BY RAMON ALONSO OF THE MIT INSTRUMENTATION LAB.',
    '#',
    '# THESE WERE LATER DEVELOPED INTO THE PRESENT FORM',
    '# OF VERB-NOUN OPERATOR INTERFACE, THE FIRST',
    '# INTERACTIVE REAL-TIME TERMINAL SYSTEM.',
    '#',
    '# THE ROUTINES HANDLE ALL INPUT FROM THE KEYBOARD',
    '# AND ALL OUTPUT TO THE DISPLAY, INCLUDING THE',
    '# ELECTROLUMINESCENT VERB-NOUN REGISTER DISPLAY.',
    '#',
    '# THE NAME "PINBALL" COMES FROM THE ORIGINAL DEMO',
    '# WHERE VERB-NOUN CODES WERE PICKED BY THE PROGRAM',
    '# AT RANDOM, LIKE A PINBALL MACHINE.',
  ]
);

export const LANDING_P63 = block(
  'landing-p63',
  'THE LUNAR LANDING — P63 BRAKING',
  'THE_LUNAR_LANDING.agc',
  [
    '# THE LUNAR LANDING',
    '#',
    '# ACTIVE GUIDANCE FOR POWERED DESCENT',
    '#',
    '# MOD BY AARONS FOR LUNAR LANDING',
    '',
    'FLAGORGY        TC      INTPRET',
    '                SET     SET',
    '                        FINALFLG',
    '                        FLAGWRD7',
    '',
    '# FLAGORGY IS A DIONYSIAN FLAG-WAVING SECTION',
    '# ACTIVE DURING POWERED DESCENT IGNITION',
    '# SETS ALL THE FLAGS NEEDED FOR P63 BRAKING PHASE',
    '',
    '                CLEAR   CLEAR',
    '                        SWTEFLAG',
    '                        NODOTEFG',
    'P63LM           TC      PHASCHNG',
    '                OCT     04022',
    '                TC      BANKCALL',
    '                CADR    R60LEM',
    '',
    '# R60 — ATTITUDE MANEUVER ROUTINE',
    '# PLEASE CRANK THE SILLY THING AROUND',
    '',
    '                CAF     BIT6',
    '                EXTEND',
    '                RAND    CHAN30',
  ]
);

export const LANDING_IGNITION = block(
  'landing-ignition',
  'BURN BABY BURN — IGNITION ROUTINE',
  'BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc',
  [
    '# BURN, BABY, BURN  --  MASTER IGNITION ROUTINE',
    '#',
    '# BY PETER ADLER, 1967',
    '#',
    '# THIS ROUTINE GAINED ITS NAME FROM A RADIO DJ,',
    '# "THE MAGNIFICENT MONTAGUE," WHO USED "BURN, BABY,',
    '# BURN!" TO PRAISE A HOT RECORD. THE PHRASE WAS LATER',
    '# CO-OPTED DURING THE LOS ANGELES WATTS RIOTS AND',
    '# BECAME A SYMBOL OF AN ERA.',
    '#',
    '# THIS HAS BEEN RECYCLED FROM COLOSSUS AS PART OF',
    '# THE CLEAN-UP ASSOCIATED WITH GETTING THINGS READY',
    '# FOR 278. IT IS THE ONE MODULE TO WHICH WE OWE A',
    '# GREAT DEBT.',
    '',
    'BURNBABY        TC      PHASCHNG',
    '                OCT     24024',
    '                INHINT',
    '                TC      IBNKCALL',
    '                CADR    ENGINOFF',
    '',
    '# NOLI SE TANGERE',
    '# (TOUCH ME NOT)',
    '',
    'IGNITION        CS      ZERO',
    '                TS      DVTOTAL',
    '                CAF     FOUR',
    '                TS      TEMP',
    '',
    '# HONI SOIT QUI MAL Y PENSE',
    '# (SHAME ON HE WHO THINKS EVIL OF IT)',
    '',
    '                TC      BANKCALL',
    '                CADR    TIG',
    '',
    '                TC      PHASCHNG',
    '                OCT     40152',
  ]
);

export const LANDING_P64_APPROACH = block(
  'landing-p64',
  'THE LUNAR LANDING — P64 APPROACH',
  'THE_LUNAR_LANDING.agc',
  [
    '# P64 — APPROACH PHASE',
    '# THE LM IS NOW CLOSE ENOUGH TO SEE THE',
    '# LANDING SITE THROUGH THE LPD WINDOW.',
    '# THE PILOT CAN REDESIGNATE THE TARGET.',
    '',
    'P64LM           TC      PHASCHNG',
    '                OCT     04022',
    '                TC      LUNSFCHK',
    '',
    '# LPD (LANDING POINT DESIGNATOR)',
    '# THE PILOT LOOKS THROUGH A GRID ON THE',
    '# WINDOW AND CLICKS TO REDESIGNATE THE',
    '# TARGET IF THE COMPUTER IS HEADED FOR',
    '# A BOULDER FIELD OR CRATER.',
    '',
    '                CAF     TWO',
    '                TC      POSTJUMP',
    '                CADR    SERVEXEC',
    '',
    '# OFF TO SEE THE WIZARD ...',
    '',
    '                TC      INTPRET',
    '                CALL',
    '                        GUIDANC1',
    '                EXIT',
    '                TC      GRP4OFF',
  ]
);

export const LANDING_P66_MANUAL = block(
  'landing-p66',
  'THE LUNAR LANDING — P66 MANUAL CONTROL',
  'THE_LUNAR_LANDING.agc',
  [
    '# P66 — RATE OF DESCENT (ROD) MODE',
    '# THE ASTRONAUT HAS TAKEN SEMI-MANUAL CONTROL.',
    '# HE CONTROLS RATE OF DESCENT WITH THE',
    '# ATTITUDE CONTROLLER ASSEMBLY (ACA).',
    '# THE AGC STILL PROVIDES ATTITUDE HOLD.',
    '',
    'P66             TC      PHASCHNG',
    '                OCT     04024',
    '',
    '# ASTRONAUT: NOW LOOK WHERE YOU ENDED UP',
    '',
    '                CAF     BIT13',
    '                EXTEND',
    '                RAND    CHAN31',
    '                CCS     A',
    '                TCF     MAINLOOP',
    '',
    '# THE AGC IS NOW ARMSTRONG\'S COPILOT.',
    '# ALDRIN READS OUT ALTITUDE AND DESCENT',
    '# RATE FROM THE DSKY DISPLAY.',
    '# VELOCITY DATA COMES FROM LANDING RADAR.',
    '',
    '                TC      BANKCALL',
    '                CADR    RODCOMP',
    '                TC      BANKCALL',
    '                CADR    R12LEM',
    '',
    '# LANDING RADAR ALTITUDE UPDATE',
    '# RANGE DATA AT 50 FT RESOLUTION',
  ]
);

export const LANDING_CONTACT = block(
  'landing-contact',
  'BURN BABY BURN — ENGINE SHUTDOWN',
  'BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc',
  [
    '# ENGINE SHUTDOWN SEQUENCE',
    '# "CONTACT LIGHT" — PROBE TOUCHES SURFACE',
    '',
    'ENGINOFF        CAF     ZERO',
    '                TS      THRUST',
    '                TC      NOULLAGE',
    '',
    '# GOODBYE. COME AGAIN SOON.',
    '',
    '                TC      PHASCHNG',
    '                OCT     04024',
    '                TC      ENDOFJOB',
    '',
    '# THE EAGLE HAS LANDED.',
    '#',
    '# 102:45:40 GET — JULY 20, 1969',
    '# SEA OF TRANQUILITY',
    '# 0.6875 N, 23.4333 E',
    '#',
    '# "HOUSTON, TRANQUILITY BASE HERE.',
    '#  THE EAGLE HAS LANDED."',
  ]
);

export const LANDING_P68_CONFIRM = block(
  'landing-p68',
  'THE LUNAR LANDING — P68 CONFIRMATION',
  'THE_LUNAR_LANDING.agc',
  [
    '# P68 — LANDING CONFIRMATION',
    '# FINAL POSITION DISPLAY',
    '',
    'P68             TC      PHASCHNG',
    '                OCT     04026',
    '                INHINT',
    '                TC      BANKCALL',
    '                CADR    GETPAD',
    '',
    '# DISPLAY LATITUDE, LONGITUDE, ALTITUDE',
    '# V06 N43 — POSITION AT LANDING',
    '',
    '                TC      FREEDSP',
    '                TC      ENDOFJOB',
    '',
    '# "ROGER, TRANQUILITY, WE COPY YOU ON THE',
    '#  GROUND. YOU GOT A BUNCH OF GUYS ABOUT',
    '#  TO TURN BLUE. WE\'RE BREATHING AGAIN.',
    '#  THANKS A LOT."  — CHARLIE DUKE, CAPCOM',
  ]
);

// ============================================================
// ALARM 1202 SCENARIO BLOCKS
// ============================================================

export const ALARM_EXECUTIVE = block(
  'alarm-executive',
  'EXECUTIVE — CORE SET ALLOCATION',
  'EXECUTIVE.agc',
  [
    '# EXECUTIVE',
    '#',
    '# THE EXECUTIVE IS THE SYSTEM FOR ALLOCATING',
    '# AND SCHEDULING CORE SETS AND VAC AREAS.',
    '# PROGRAMS (JOBS) REQUEST CORE SETS VIA',
    '# NOVAC OR FINDVAC. IF NONE ARE AVAILABLE,',
    '# THE EXECUTIVE MUST DECIDE WHAT TO DO.',
    '',
    'NOVAC           INHINT',
    '                AD      FAKESSION',
    '                TS      EXECESSION',
    '',
    'FINDVAC         TS      L',
    '                CAF     ZERO',
    '                XCH     EXECESSION',
    '                MASK    PESSION',
    '                CCS     A',
    '                TC      FINDVAC2',
    '',
    '# IF NO CORE SETS ARE AVAILABLE —',
    '# TOO MANY JOBS COMPETING FOR THE CPU.',
    '# THIS IS HOW THE 1202 ALARM HAPPENS.',
  ]
);

export const ALARM_POODOO = block(
  'alarm-poodoo',
  'ALARM AND ABORT — POODOO',
  'ALARM_AND_ABORT.agc',
  [
    '# ALARM AND ABORT',
    '#',
    '# IT IS HOPED THAT THE ALARM ROUTINE WILL',
    '# NOT BE USED TOO MUCH. HOWEVER...',
    '',
    'ALARM           INHINT',
    '                CA      Q',
    '                TS      ALMESSION',
    '                INDEX   Q',
    '                CA      0',
    '                TS      L',
    '',
    'ALARM2          INHINT',
    '                CCS     FAILESSION',
    '                TC      +2',
    '                NOOP',
    '',
    '# POODOO',
    '# (YES, THAT IS REALLY THE LABEL NAME)',
    '',
    'POODOO          INHINT',
    '                CA      Q',
    '                TS      ALMESSION',
    '',
    'GOPOODOO        TC      ALARM',
    '                OCT     01202',
    '                TC      BANKCALL',
    '                CADR    BAILOUT',
  ]
);

export const ALARM_BAILOUT = block(
  'alarm-bailout',
  'ALARM AND ABORT — BAILOUT',
  'ALARM_AND_ABORT.agc',
  [
    '# BAILOUT',
    '#',
    '# THE PRIORITY-DRIVEN RESTART PROTECTION',
    '# DESIGNED BY MARGARET HAMILTON AND TEAM.',
    '# WHEN THE COMPUTER IS OVERLOADED, LOW-',
    '# PRIORITY JOBS ARE SHED. HIGH-PRIORITY',
    '# GUIDANCE AND NAVIGATION CONTINUE.',
    '',
    'BAILOUT         INHINT',
    '                CA      Q',
    '                TS      ALMESSION',
    '                INDEX   Q',
    '                CA      0',
    '                TS      L',
    '                TC      BORTENT',
    '',
    '# THIS IS THE HEART OF THE RESTART SYSTEM.',
    '# THE COMPUTER RECOVERS IN UNDER 2 SECONDS.',
    '# GUIDANCE IS THE HIGHEST-PRIORITY JOB.',
    '# IT WAS NEVER INTERRUPTED.',
  ]
);

export const ALARM_CURTAINS = block(
  'alarm-curtains',
  'ALARM AND ABORT — CURTAINS',
  'ALARM_AND_ABORT.agc',
  [
    '# CURTAINS',
    '#',
    '# IF ALL ELSE FAILS, THIS IS THE END.',
    '# TOTAL ABORT. THANKFULLY NEVER REACHED',
    '# DURING APOLLO 11.',
    '',
    'CURTAINS        INHINT',
    '                CA      Q',
    '                TS      ALMESSION',
    '                TC      ALARM2',
    '',
    '# "WHIMPER" — THE WAY THE WORLD ENDS',
    '# (T.S. ELIOT REFERENCE)',
    '',
    'WHIMPER         TC      ALARM',
    '                OCT     01410',
    '                TC      CURTAINS +1',
    '',
    '# NOT WITH A BANG, BUT A WHIMPER.',
    '# FORTUNATELY, THE RESTART PROTECTION',
    '# MEANS WE ALMOST NEVER GET HERE.',
  ]
);

export const ALARM_RECOVERY = block(
  'alarm-recovery',
  'FRESH START AND RESTART',
  'FRESH_START_AND_RESTART.agc',
  [
    '# FRESH START AND RESTART',
    '#',
    '# PROGRAM INITIATED BY CREW OR BY',
    '# HARDWARE RESTART.',
    '',
    'SLAP1           INHINT',
    '                TC      POSTJUMP',
    '                CADR    SLAP2',
    '',
    '# ENEMA',
    '# (THE DRASTIC CLEANING ROUTINE)',
    '',
    'ENEMA           INHINT',
    '                TC      STARTSUB',
    '                TC      POSTJUMP',
    '                CADR    ENERONE',
    '',
    '# DO NOT USE GOPROG2 OR ENEMA WITHOUT',
    '# CONSULTING THE POOH PEOPLE',
    '# (YES, AS IN WINNIE-THE-POOH)',
    '',
    '# THE AGC RESTARTS CLEANLY.',
    '# ALL GUIDANCE DATA IS PRESERVED.',
    '# ONLY LOW-PRIORITY TASKS ARE LOST.',
    '# THE COMPUTER IS BACK WITHIN 2 SECONDS.',
  ]
);

export const ALARM_HAMILTON = block(
  'alarm-hamilton',
  'THE PRIORITY DISPLAY SYSTEM',
  'ALARM_AND_ABORT.agc',
  [
    '# THE PRIORITY-BASED RESTART SYSTEM',
    '#',
    '# DESIGNED BY THE MIT INSTRUMENTATION',
    '# LABORATORY UNDER THE DIRECTION OF',
    '# MARGARET HAMILTON.',
    '#',
    '# THIS SYSTEM ENSURED THAT WHEN THE',
    '# COMPUTER WAS OVERLOADED, IT WOULD:',
    '#',
    '#   1. RECOGNIZE THE OVERLOAD CONDITION',
    '#   2. SHED LOW-PRIORITY TASKS',
    '#   3. PRESERVE HIGH-PRIORITY GUIDANCE',
    '#   4. RESTART WITHIN 2 SECONDS',
    '#   5. CONTINUE THE MISSION',
    '#',
    '# ON JULY 20, 1969, THIS DESIGN SAVED',
    '# THE LUNAR LANDING MISSION.',
    '#',
    '# STEVE BALES, 26-YEAR-OLD GUIDANCE',
    '# OFFICER, CALLED "GO" BASED ON HIS',
    '# UNDERSTANDING OF THIS SYSTEM.',
    '#',
    '# MARGARET HAMILTON RECEIVED THE',
    '# PRESIDENTIAL MEDAL OF FREEDOM IN 2016.',
  ]
);

// ============================================================
// LAMP TEST SCENARIO BLOCKS
// ============================================================

export const LAMP_TEST_INTRO = block(
  'lamp-test-intro',
  'DISPLAY TEST — V35',
  'PINBALL_GAME_BUTTONS_AND_LIGHTS.agc',
  [
    '# DISPLAY TEST ROUTINE — V35',
    '#',
    '# LIGHT ALL SEGMENTS AND INDICATORS',
    '# TO VERIFY DISPLAY HARDWARE.',
    '#',
    '# EVERY ELECTROLUMINESCENT SEGMENT ON',
    '# THE DSKY WILL GLOW GREEN.',
    '# ALL INDICATOR LIGHTS WILL ACTIVATE.',
    '#',
    '# THIS IS THE FIRST THING ASTRONAUTS',
    '# WOULD DO AFTER POWERING UP THE AGC.',
    '',
    'DSPTAB          OCT     77777',
    '                OCT     77777',
    '                OCT     77777',
    '',
    '# ALL RELAYS ON — ALL SEGMENTS LIT.',
    '# IF ANY SEGMENT IS DARK, THE DISPLAY',
    '# UNIT HAS A FAULT AND MUST BE REPORTED.',
    '',
    '# V35 — THE ASTRONAUT\'S "HELLO WORLD"',
  ]
);

// ============================================================
// LUNAR LANDING GUIDANCE EQUATIONS
// ============================================================

export const GUIDANCE_EQUATIONS = block(
  'guidance-equations',
  'LUNAR LANDING GUIDANCE EQUATIONS',
  'LUNAR_LANDING_GUIDANCE_EQUATIONS.agc',
  [
    '# LUNAR LANDING GUIDANCE EQUATIONS',
    '#',
    '# THE MATH THAT LANDS ON THE MOON.',
    '#',
    '# THESE EQUATIONS COMPUTE THE OPTIMAL',
    '# TRAJECTORY FROM ORBIT TO SURFACE,',
    '# ACCOUNTING FOR GRAVITY, THRUST, AND',
    '# THE ROTATING LUNAR REFERENCE FRAME.',
    '',
    'GUILDENSTERN    TC      INTPRET',
    '                VLOAD   VSR1',
    '                        UNFC/2',
    '                STODL   UNWC/2',
    '                        THETCNTR',
    '',
    '# GUILDENSTERN (HAMLET REFERENCE)',
    '# THIS TRANSFORMS GUIDANCE COMMANDS',
    '# FROM INERTIAL TO LUNAR COORDINATES.',
    '',
    '# TEMPORARY, I HOPE HOPE HOPE',
    '',
    '                BOFF    CALL',
    '                        LTEFLAG',
    '                        +2',
    '                        ASCENT',
    '                EXIT',
  ]
);

// ============================================================
// BLOCK MAPPINGS FOR EACH SCENARIO
// ============================================================

export const LANDING_CODE_SEQUENCE: AGCCodeBlock[] = [
  LANDING_INTRO,
  LANDING_P63,
  LANDING_IGNITION,
  GUIDANCE_EQUATIONS,
  LANDING_P64_APPROACH,
  LANDING_P66_MANUAL,
  LANDING_CONTACT,
  LANDING_P68_CONFIRM,
];

export const ALARM_CODE_SEQUENCE: AGCCodeBlock[] = [
  ALARM_EXECUTIVE,
  ALARM_POODOO,
  ALARM_BAILOUT,
  ALARM_CURTAINS,
  ALARM_RECOVERY,
  ALARM_HAMILTON,
];

export const LAMP_TEST_CODE_SEQUENCE: AGCCodeBlock[] = [
  LAMP_TEST_INTRO,
];
