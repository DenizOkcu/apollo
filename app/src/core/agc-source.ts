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

export function parseLine(raw: string, file: string = ''): AGCSourceLine {
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

// ============================================================
// LUNAR ASCENT SCENARIO BLOCKS
// ============================================================

export const ASCENT_INTRO = block(
  'ascent-intro',
  'CONTROLLED CONSTANTS — ENGINE PARAMETERS',
  'CONTROLLED_CONSTANTS.agc',
  [
    '# DPS AND APS ENGINE PARAMETERS',
    '#',
    '# *** THE ORDER OF THE FOLLOWING SIX',
    '# CONSTANTS MUST NOT BE CHANGED ***',
    '',
    'FDPS            2DEC    4.3670 B-7',
    '                                        # 9817.5 LBS FORCE (DPS)',
    'MDOTDPS         2DEC    0.1480 B-3',
    '                                        # 32.62 LBS/SEC',
    '',
    'FAPS            2DEC    1.5569 B-7',
    '                                        # 3500 LBS FORCE (APS)',
    'MDOTAPS         2DEC    0.05135 B-3',
    '                                        # 11.32 LBS/SEC',
    '',
    '# THE ASCENT PROPULSION SYSTEM (APS):',
    '# 3500 POUNDS OF THRUST.',
    '# ONE ENGINE. NO BACKUP. NO SECOND CHANCE.',
    '# IF IT DOES NOT IGNITE, THE CREW DIES',
    '# ON THE LUNAR SURFACE.',
  ]
);

export const ASCENT_GUIDANCE_BLOCK = block(
  'ascent-guidance',
  'ASCENT GUIDANCE — ATMAG',
  'ASCENT_GUIDANCE.agc',
  [
    '# ASCENT GUIDANCE',
    '#',
    '# ASSEMBLED JULY 14, 1969',
    '# PAGES 843-856 OF LUMINARY 099',
    '#',
    '# THIS ROUTINE GUIDES THE LUNAR MODULE',
    '# FROM THE SURFACE TO ORBITAL INSERTION.',
    '# THERE IS NO ABORT OPTION DURING ASCENT.',
    '',
    'ATMAG           TC      PHASCHNG',
    '                OCT     00035',
    '                TC      INTPRET',
    '                BON',
    '                        FLRCS',
    '                        ASCENT',
    '                DLOAD   DSU',
    '                        ABDVCONV',
    '                        MINABDV',
    '',
    '# THE GUIDANCE EQUATIONS COMPUTE THE',
    '# OPTIMAL TRAJECTORY TO REACH COLUMBIA',
    '# IN LUNAR ORBIT, 60 NM ABOVE.',
    '# VELOCITY MUST REACH 5537 FT/SEC.',
  ]
);

export const ASCENT_BURNBABY = block(
  'ascent-burnbaby',
  'BURN BABY BURN — P12 IGNITION TABLE',
  'BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc',
  [
    '# BURN, BABY, BURN — MASTER IGNITION ROUTINE',
    '#',
    '# THE MASTER IGNITION ROUTINE IS DESIGNED',
    '# FOR USE BY THE FOLLOWING LEM PROGRAMS:',
    '# P12, P40, P42, P61, P63.',
    '#',
    '# CONCEIVED AND EXECUTED, AND (NOTA BENE)',
    '# IS MAINTAINED BY ADLER AND EYLES.',
    '',
    'P12TABLE        VN      0674',
    '                TCF     ULLGNOT',
    '                TCF     COMFAIL3',
    '                TCF     GOCUTOFF',
    '                TCF     TASKOVER',
    '                TCF     P12SPOT',
    '                DEC     0',
    '                                        # NO ULLAGE FOR APS',
    '',
    '# P12 — ASCENT POWERED FLIGHT.',
    '# THE APS ENGINE HAS NO ULLAGE REQUIREMENT',
    '# BECAUSE IT USES PRESSURE-FED PROPELLANT.',
    '# IGNITION IS INSTANTANEOUS.',
  ]
);

export const ASCENT_RENDEZVOUS = block(
  'ascent-rendezvous',
  'ASCENT GUIDANCE — ORBITAL INSERTION',
  'ASCENT_GUIDANCE.agc',
  [
    '# ORBITAL INSERTION CHECK',
    '#',
    '# THE LM MUST REACH A SPECIFIC VELOCITY',
    '# AND ALTITUDE TO MATCH COLUMBIA\'S ORBIT.',
    '#',
    '# IF INSERTION IS SUCCESSFUL, THE TWO',
    '# SPACECRAFT WILL BE WITHIN RADAR RANGE',
    '# FOR RENDEZVOUS AND DOCKING.',
    '',
    '                CLEAR   SLOAD',
    '                        RENDWFLG',
    '                        BIT3H',
    '                DDV     EXIT',
    '                        ABDVCONV',
    '',
    '# WHEN THE ENGINE CUTS OFF, COLUMBIA',
    '# IS SOMEWHERE ABOVE AND AHEAD.',
    '# THE ASTRONAUTS ARE ON THEIR OWN.',
    '#',
    '# "EAGLE, YOU\'RE LOOKING GREAT."',
    '# — CHARLIE DUKE, CAPCOM',
  ]
);

// ============================================================
// ABORT SCENARIO BLOCKS
// ============================================================

export const ABORT_P70_BLOCK = block(
  'abort-p70',
  'P70-P71 — ABORT PROGRAMS',
  'P70-P71.agc',
  [
    '# P70-P71 — ABORT PROGRAMS',
    '#',
    '# P70 = ABORT FROM POWERED DESCENT',
    '# P71 = ABORT FROM LUNAR SURFACE',
    '#',
    '# ASSEMBLED JULY 14, 1969',
    '# PAGES 829-837 OF LUMINARY 099',
    '',
    'P70             TC      LEGAL?',
    'P70A            CS      ZERO',
    '                TCF     +3',
    'P71             TC      LEGAL?',
    'P71A            CAF     TWO',
    ' +3             TS      Q',
    '                INHINT',
    '                EXTEND',
    '                DCA     CNTABTAD',
    '                DTCB',
    '',
    '# P70 IS THE LAST RESORT DURING LANDING.',
    '# ABORT STAGING: THE DESCENT STAGE IS',
    '# JETTISONED AND THE ASCENT ENGINE FIRES.',
    '# THERE IS NO GOING BACK.',
  ]
);

export const ABORT_CONTABRT = block(
  'abort-contabrt',
  'P70-P71 — ABORT STAGING',
  'P70-P71.agc',
  [
    '# CONTABRT — CONTINUE ABORT',
    '#',
    '# THE ABORT BUTTON HAS BEEN PRESSED.',
    '# DESCENT STAGE SEPARATION COMMANDS FIRE.',
    '# THE LM IS NOW TWO PIECES.',
    '',
    'CONTABRT        CAF     ABRTJADR',
    '                TS      BRUPT',
    '                RESUME',
    '',
    'ABRTJASK        CAF     OCTAL27',
    '                AD      Q',
    '                TS      L',
    '                COM',
    '                DXCH    -PHASE4',
    '',
    '# INSURE DISPDEX IS POSITIVE.',
    '# SET APSFLAG IF P71.',
    '',
    '                CS      FLGWRD10',
    '                MASK    APSFLBIT',
    '                ADS     FLGWRD10',
    '',
    '# THE FOLLOWING ENEMA WILL REMOVE THE',
    '# DISPLAY INERTIAL DATA OUTBIT.',
    '',
    '                TC      POSTJUMP',
    '                CADR    ENEMA',
  ]
);

export const ABORT_GOABORT = block(
  'abort-goabort',
  'P70-P71 — GOABORT',
  'P70-P71.agc',
  [
    '# GOABORT — MAIN ABORT EXECUTION',
    '#',
    '# AT THIS POINT THE DESCENT STAGE',
    '# HAS BEEN JETTISONED. THE ASCENT',
    '# ENGINE IS RUNNING. THE GUIDANCE',
    '# MUST NOW COMPUTE A SAFE TRAJECTORY',
    '# BACK TO ORBITAL ALTITUDE.',
    '',
    'GOABORT         TC      INTPRET',
    '                CALL',
    '                        INITCDUW',
    '                EXIT',
    '                CAF     FOUR',
    '                TS      DVCNTR',
    '',
    'UPTHROT         SET     EXIT',
    '                        FLVR',
    '',
    '                TC      THROTUP',
    '',
    '# INSURE THAT THE ENGINE IS ON, IF ARMED.',
    '# THE ASCENT ENGINE IS NOW AT FULL THRUST.',
    '# 3500 LBS PUSHING THE CREW AWAY FROM',
    '# THE LUNAR SURFACE.',
  ]
);

export const ABORT_CURTAINS_BLOCK = block(
  'abort-curtains',
  'ALARM AND ABORT — THE LAST RESORT',
  'ALARM_AND_ABORT.agc',
  [
    '# CURTAINS',
    '#',
    '# IF ALL ELSE FAILS, THIS IS THE END.',
    '# NAMED AFTER THE THEATRICAL TERM:',
    '# "IT\'S CURTAINS FOR YOU."',
    '#',
    '# THIS ROUTINE IS THE ABSOLUTE LAST',
    '# RESORT. IF GUIDANCE HAS FAILED AND',
    '# CANNOT RECOVER, CURTAINS FIRES THE',
    '# FINAL ALARM AND SUSPENDS THE COMPUTER.',
    '',
    'CURTAINS        INHINT',
    '                CA      Q',
    '                TS      ALMESSION',
    '                TC      ALARM2',
    '',
    '# WHIMPER — THE WAY THE WORLD ENDS',
    '# (T.S. ELIOT: "THE HOLLOW MEN")',
    '#',
    '# "THIS IS THE WAY THE WORLD ENDS',
    '#  NOT WITH A BANG BUT A WHIMPER."',
    '',
    'WHIMPER         TC      ALARM',
    '                OCT     01410',
    '                TC      CURTAINS +1',
    '',
    '# THANKFULLY, APOLLO 11 NEVER REACHED',
    '# CURTAINS OR WHIMPER.',
  ]
);

// ============================================================
// TLI (TRANS-LUNAR INJECTION) SCENARIO BLOCKS
// ============================================================

export const TLI_BURNBABY = block(
  'tli-burnbaby',
  'BURN BABY BURN — MASTER IGNITION',
  'BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc',
  [
    '# BURN, BABY, BURN — MASTER IGNITION ROUTINE',
    '#',
    '# BY PETER ADLER, 1967',
    '#',
    '# IT TRACES BACK TO 1965 AND THE LOS',
    '# ANGELES RIOTS, AND WAS INSPIRED BY',
    '# DISC JOCKEY EXTRAORDINAIRE AND RADIO',
    '# STATION OWNER MAGNIFICENT MONTAGUE.',
    '# MAGNIFICENT MONTAGUE USED THE PHRASE',
    '# "BURN, BABY! BURN!" WHEN SPINNING',
    '# THE HOTTEST NEW RECORDS.',
    '',
    'BURNBABY        TC      PHASCHNG',
    '                OCT     04024',
    '',
    '                CAF     ZERO',
    '                TS      DVTOTAL',
    '                TS      DVTOTAL +1',
    '',
    '# EXTIRPATE JUNK LEFT IN DVTOTAL',
    '',
    '                TC      BANKCALL',
    '                CADR    P40AUTO',
  ]
);

export const TLI_TABLES = block(
  'tli-tables',
  'BURN BABY BURN — P40 SPS TABLE',
  'BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc',
  [
    '# TABLES FOR THE IGNITION ROUTINE',
    '#',
    '# NOLI SE TANGERE',
    '# (TOUCH ME NOT — DO NOT MODIFY THE TABLES)',
    '#',
    '# HONI SOIT QUI MAL Y PENSE',
    '# (SHAME ON HE WHO THINKS EVIL OF IT)',
    '',
    'P40TABLE        VN      0640',
    '                TCF     ULLGNOT',
    '                TCF     COMFAIL4',
    '                TCF     GOPOST',
    '                TCF     TASKOVER',
    '                TCF     P40SPOT',
    '                DEC     2240',
    '                                        # 22.4 SECONDS ULLAGE',
    '',
    '# P40 — DPS/SPS BURN PROGRAM.',
    '# USED FOR TRANS-LUNAR INJECTION,',
    '# LUNAR ORBIT INSERTION, AND ALL',
    '# MAJOR ORBITAL MANEUVERS.',
  ]
);

export const TLI_COUNTDOWN = block(
  'tli-countdown',
  'BURN BABY BURN — TIG COUNTDOWN',
  'BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc',
  [
    '# GENERAL PURPOSE IGNITION ROUTINES',
    '#',
    '# THE COUNTDOWN SEQUENCE:',
    '# TIG-35: BEGIN ATTITUDE MANEUVER',
    '# TIG-30: VERIFY ATTITUDE',
    '# TIG-5:  ARM ENGINE',
    '# TIG-0:  IGNITION',
    '',
    'B*RNB*B*        EXTEND',
    '                DCA     TIG',
    '                DXCH    GOBLTIME',
    '',
    '                INHINT',
    '                TC      IBNKCALL',
    '                CADR    ENGINOF3',
    '                RELINT',
    '',
    '# THE FIVE-SECOND COUNTDOWN:',
    '# THE CREW WATCHES THE DSKY.',
    '# AT TIG-0 THE ENGINE IGNITES.',
    '# THERE IS NO ABORT UNTIL THE BURN',
    '# REACHES MINIMUM IMPULSE.',
  ]
);

export const TLI_ESCAPE = block(
  'tli-escape',
  'LEAVING EARTH ORBIT',
  'BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc',
  [
    '# TRANS-LUNAR INJECTION',
    '#',
    '# THE S-IVB THIRD STAGE FIRES FOR',
    '# APPROXIMATELY 6 MINUTES, ACCELERATING',
    '# APOLLO 11 FROM 25,567 FT/S IN EARTH',
    '# ORBIT TO 35,545 FT/S — ESCAPE VELOCITY.',
    '#',
    '# ONCE THE BURN IS COMPLETE, THE',
    '# SPACECRAFT IS ON A FREE-RETURN',
    '# TRAJECTORY TO THE MOON.',
    '#',
    '# THERE IS NO TURNING BACK.',
    '',
    '# CA      Z',
    '# ASSASSINATE CLOKTASK',
    '',
    '# THE S-IVB IS JETTISONED AFTER TLI.',
    '# FROM HERE, THE CSM FLIES ALONE.',
    '# NEXT STOP: LUNAR ORBIT, 240,000',
    '# MILES AND 3 DAYS AWAY.',
  ]
);

// ============================================================
// FREE-PLAY MODE BLOCKS
// ============================================================

export const FREEPLAY_PROCEED = block(
  'freeplay-proceed',
  'PINBALL — PROCEED (V33)',
  'PINBALL_GAME_BUTTONS_AND_LIGHTS.agc',
  [
    '# PROCEED WITHOUT DATA — V33',
    '#',
    '# WHEN THE AGC FLASHES THE VERB-NOUN',
    '# DISPLAY, IT IS ASKING THE ASTRONAUT',
    '# A QUESTION. THE CREW HAS THREE CHOICES:',
    '#',
    '#   V33 (PRO)  — PROCEED, ACCEPT VALUES',
    '#   V34 (TERM) — TERMINATE, CANCEL REQUEST',
    '#   V32 (RECYCLE) — RE-ENTER DATA',
    '',
    'PROCEED         CAF     ZERO',
    '                TS      REQESSION',
    '                TC      FLASHOFF',
    '',
    '# FLASHOFF CLEARS THE FLASHING DISPLAY.',
    '# THE AGC RESUMES EXECUTION WITH THE',
    '# CURRENT DATA VALUES.',
    '',
    '                TC      POSTJUMP',
    '                CADR    PINBRNCH',
    '',
    '# PINBRNCH — THE PINBALL BRANCH TABLE.',
    '# THE AGC BRANCHES TO THE ROUTINE THAT',
    '# ORIGINALLY REQUESTED THE FLASH.',
    '# ASTRONAUT HAS SAID: "GO AHEAD."',
  ]
);

export const FREEPLAY_TERMINATE = block(
  'freeplay-terminate',
  'PINBALL — TERMINATE (V34)',
  'PINBALL_GAME_BUTTONS_AND_LIGHTS.agc',
  [
    '# TERMINATE — V34',
    '#',
    '# KILL THE CURRENT OPERATION.',
    '# USED TO STOP MONITOR DISPLAYS,',
    '# CANCEL FLASHING REQUESTS, OR',
    '# ABORT A DATA-ENTRY SEQUENCE.',
    '',
    'TERMINATE       CAF     ZERO',
    '                TS      REQESSION',
    '                TC      FLASHOFF',
    '',
    '# KILLMON — KILL ACTIVE MONITOR',
    '# IF A MONITOR VERB (V11-V17) IS',
    '# RUNNING, TERMINATE STOPS THE',
    '# PERIODIC DISPLAY UPDATE.',
    '',
    'KILLMON         CS      FLAGWRD5',
    '                MASK    MONESSION',
    '                ADS     FLAGWRD5',
    '',
    '# THE DISPLAY IS CLEARED.',
    '# THE AGC RETURNS TO IDLE (P00).',
    '# READY FOR THE NEXT COMMAND.',
  ]
);

export const FREEPLAY_CLOCK = block(
  'freeplay-clock',
  'TIME COUNTERS — MISSION CLOCK',
  'TIMER_PROGRAM.agc',
  [
    '# TIMER PROGRAM',
    '#',
    '# TIME2/TIME1 — THE MISSION CLOCK.',
    '# TIME1 INCREMENTS EVERY 10 MS.',
    '# TIME2 INCREMENTS WHEN TIME1 OVERFLOWS.',
    '# TOGETHER THEY FORM A DOUBLE-PRECISION',
    '# COUNTER MEASURING GET (GROUND ELAPSED TIME).',
    '',
    'T3RUPT          CAF     T3RPTS',
    '                TS      T3LOC',
    '                EXTEND',
    '                QXCH    T3TEMP',
    '',
    '# WAITLIST TASK EXECUTION',
    '# TASKS SCHEDULED BY WAITLIST ARE',
    '# DISPATCHED HERE ON T3 INTERRUPTS.',
    '',
    '                CS      TIME1',
    '                AD      +1',
    '                CCS     A',
    '                TCF     T3RUPT2',
    '',
    '# THE AGC CLOCK RUNS AT 1024000 HZ.',
    '# EACH PULSE INCREMENTS A SCALER CHAIN.',
    '# AT THE END: ONE CENTISECOND TICK.',
    '# THE DSKY MISSION TIMER READS FROM',
    '# TIME2/TIME1 VIA THE NOUN TABLES.',
  ]
);

export const FREEPLAY_RENDEZVOUS = block(
  'freeplay-rendezvous',
  'RENDEZVOUS RADAR — RANGE/RATE',
  'RADAR_LEADIN_ROUTINES.agc',
  [
    '# RADAR LEADIN ROUTINES',
    '#',
    '# THE RENDEZVOUS RADAR PROVIDES:',
    '#   - RANGE TO CSM (NOUN 68, R1)',
    '#   - RANGE RATE (CLOSING VELOCITY)',
    '#   - SHAFT AND TRUNNION ANGLES',
    '#',
    '# THE RADAR IS MOUNTED ON TOP OF THE',
    '# ASCENT STAGE AND TRACKS THE CSM',
    '# TRANSPONDER AUTOMATICALLY.',
    '',
    'RRRDOT          TC      BANKCALL',
    '                CADR    RRRANGE',
    '                INDEX   L',
    '                CA      SAMESSION',
    '',
    '# RENDEZVOUS RADAR RANGE/RANGE-RATE',
    '# DATA IS READ VIA CHANNELS 12-14.',
    '# RANGE IS IN HUNDREDTHS OF A NM.',
    '',
    '                TC      BANKCALL',
    '                CADR    RADSTALL',
    '                TCF     RADSTAL1',
    '',
    '# THE CSM TRANSPONDER REPLIES ON',
    '# 9832.8 MHZ. THE LM RADAR TRACKS',
    '# THE REPLY AND COMPUTES RANGE.',
  ]
);

export const FREEPLAY_DATA_LOAD = block(
  'freeplay-data-load',
  'PINBALL — DATA ENTRY',
  'PINBALL_GAME_BUTTONS_AND_LIGHTS.agc',
  [
    '# KEYBOARD AND DISPLAY ROUTINES',
    '#',
    '# VERB 21-25 — DATA LOAD VERBS',
    '# V21: LOAD COMPONENT 1 INTO R1',
    '# V22: LOAD COMPONENT 2 INTO R2',
    '# V23: LOAD COMPONENT 3 INTO R3',
    '# V24: LOAD COMPONENT 1,2 INTO R1,R2',
    '# V25: LOAD COMPONENT 1,2,3 INTO R1,R2,R3',
    '',
    'VBLOADC         CCS     CYR',
    '                TCF     VBLOAD1',
    '                TCF     VBLOAD2',
    '                TCF     VBLOAD3',
    '',
    '# THE VERB-NOUN FLASHING REQUEST',
    '# TELLS THE OPERATOR WHICH REGISTERS',
    '# TO KEY IN DATA. THE CREW ENTERS',
    '# 5-DIGIT NUMBERS WITH A +/- SIGN.',
    '',
    '                CA      NESSION',
    '                TC      DESSION',
    '                TC      FLASHON',
    '',
    '# PINBALL VALIDATES THE INPUT:',
    '# IS IT A LEGAL NUMBER? DOES IT',
    '# FIT THE SCALE FOR THIS NOUN?',
    '# IF NOT — OPR ERR.',
  ]
);

export const FREEPLAY_PROGRAM_CHANGE = block(
  'freeplay-program-change',
  'V37 — PROGRAM CHANGE',
  'FRESH_START_AND_RESTART.agc',
  [
    '# V37 — CHANGE MAJOR MODE (PROGRAM)',
    '#',
    '# V37 IS THE VERB USED TO SELECT',
    '# WHICH PROGRAM THE AGC WILL RUN.',
    '# THE CREW KEYS V37E, THEN THE',
    '# TWO-DIGIT PROGRAM NUMBER, THEN E.',
    '',
    'V37             CAF     ZERO',
    '                TS      MESSION',
    '                TC      POSTJUMP',
    '                CADR    GOPROG',
    '',
    '# GOPROG — TRANSFER TO SELECTED PROGRAM',
    '# THE MAJOR MODE IS SET. ALL MONITORS',
    '# ARE STOPPED. THE PHASE TABLE IS',
    '# CLEANED AND THE NEW PROGRAM STARTS.',
    '',
    '                INDEX   A',
    '                TCF     PREMESSION',
    '',
    '# PROGRAMS INCLUDE:',
    '#   P00: CMC IDLE',
    '#   P12: ASCENT POWERED FLIGHT',
    '#   P63: BRAKING PHASE',
    '#   P64: APPROACH PHASE',
    '#   P66: ROD (MANUAL LANDING)',
    '#   P68: LANDING CONFIRMATION',
  ]
);
