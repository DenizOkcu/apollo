// 7-segment display encoding
// Segment layout:
//   ──a──
//  |     |
//  f     b
//  |     |
//   ──g──
//  |     |
//  e     c
//  |     |
//   ──d──

export type Segment = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';

// Which segments are active for each digit
const DIGIT_SEGMENTS: Record<number, Segment[]> = {
  0: ['a', 'b', 'c', 'd', 'e', 'f'],
  1: ['b', 'c'],
  2: ['a', 'b', 'd', 'e', 'g'],
  3: ['a', 'b', 'c', 'd', 'g'],
  4: ['b', 'c', 'f', 'g'],
  5: ['a', 'c', 'd', 'f', 'g'],
  6: ['a', 'c', 'd', 'e', 'f', 'g'],
  7: ['a', 'b', 'c'],
  8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  9: ['a', 'b', 'c', 'd', 'f', 'g'],
};

export function getSegments(digit: number | null): Segment[] {
  if (digit === null || digit < 0 || digit > 9) return [];
  return DIGIT_SEGMENTS[digit] || [];
}

export function createDigitElement(initialDigit: number | null = null): HTMLElement {
  const container = document.createElement('div');
  container.className = 'seg-digit';

  const segments: Segment[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  for (const seg of segments) {
    const el = document.createElement('div');
    el.className = `seg seg-${seg}`;
    el.dataset.segment = seg;
    container.appendChild(el);
  }

  if (initialDigit !== null) {
    setDigitValue(container, initialDigit);
  }

  return container;
}

export function setDigitValue(container: HTMLElement, digit: number | null): void {
  const activeSegments = getSegments(digit);
  const allSegments = container.querySelectorAll('.seg');

  allSegments.forEach((el) => {
    const seg = (el as HTMLElement).dataset.segment as Segment;
    if (activeSegments.includes(seg)) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

export function createSignElement(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'seg-sign';

  const plus = document.createElement('div');
  plus.className = 'sign-plus';
  // Plus sign: horizontal bar + vertical bar
  const ph = document.createElement('div');
  ph.className = 'sign-bar sign-h';
  const pv = document.createElement('div');
  pv.className = 'sign-bar sign-v';
  plus.appendChild(ph);
  plus.appendChild(pv);

  const minus = document.createElement('div');
  minus.className = 'sign-minus';
  const mh = document.createElement('div');
  mh.className = 'sign-bar sign-h';
  minus.appendChild(mh);

  container.appendChild(plus);
  container.appendChild(minus);

  return container;
}

export function setSignValue(container: HTMLElement, sign: '+' | '-' | null): void {
  const plus = container.querySelector('.sign-plus') as HTMLElement;
  const minus = container.querySelector('.sign-minus') as HTMLElement;

  if (plus) plus.classList.toggle('active', sign === '+');
  if (minus) minus.classList.toggle('active', sign === '-');
}
