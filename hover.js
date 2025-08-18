// ====== カーソル制御 ======

// 補間
const lerp = (a, b, n) => (1 - n) * a + n * b;

// マウス座標を取得
const getCursorPos = ev => ({ x: ev.clientX, y: ev.clientY });

// グローバルカーソル座標
let cursor = {x: 0, y: 0};
window.addEventListener('mousemove', ev => cursor = getCursorPos(ev));

class Cursor {
  DOM = { elements: null }
  cursorElements = [];

  constructor(Dom_elems, triggerSelector = 'a') {
    this.DOM.elements = Dom_elems;
    [...this.DOM.elements].forEach(el => this.cursorElements.push(new CursorElement(el)));

    // トリガー要素に hover イベント付与
    [...document.querySelectorAll(triggerSelector)].forEach(link => {
      link.addEventListener('mouseenter', () => this.enter());
      link.addEventListener('mouseleave', () => this.leave());
    });
  }
  enter() { for (const el of this.cursorElements) el.enter(); }
  leave() { for (const el of this.cursorElements) el.leave(); }
}

class CursorElement {
  DOM = { el: null, inner: null, feTurbulence: null }
  radiusOnEnter = 40;
  opacityOnEnter = 1;
  radius;
  renderedStyles = {
    tx: {previous: 0, current: 0, amt: 0.15},
    ty: {previous: 0, current: 0, amt: 0.15},
    radius: {previous: 20, current: 20, amt: 0.15},
    opacity: {previous: 1, current: 1, amt: 0.15}
  };
  bounds;
  filterId = '#cursor-filter';
  primitiveValues = {turbulence: 0};
  filterTimeline;

  constructor(DOM_el) {
    this.DOM.el = DOM_el;
    this.DOM.inner = this.DOM.el.querySelector('.cursor__inner');
    this.DOM.feTurbulence = document.querySelector(`${this.filterId} > feTurbulence`);

    this.createFilterTimeline();
    this.opacity = this.DOM.el.style.opacity;
    this.DOM.el.style.opacity = 0;

    this.bounds = this.DOM.el.getBoundingClientRect();
    this.radius = this.DOM.inner.getAttribute('r');
    this.renderedStyles['radius'].previous = this.renderedStyles['radius'].current = this.radius;
    this.renderedStyles['opacity'].previous = this.renderedStyles['opacity'].current = this.opacity;

    const onMouseMoveEv = () => {
      this.renderedStyles.tx.previous = this.renderedStyles.tx.current = cursor.x - this.bounds.width/2;
      this.renderedStyles.ty.previous = this.renderedStyles.ty.current = cursor.y - this.bounds.height/2;
      this.DOM.el.style.opacity = this.opacity;
      requestAnimationFrame(() => this.render());
      window.removeEventListener('mousemove', onMouseMoveEv);
    };
    window.addEventListener('mousemove', onMouseMoveEv);
  }

  enter() {
    this.renderedStyles['radius'].current = this.radiusOnEnter;
    this.renderedStyles['opacity'].current = this.opacityOnEnter;
    this.filterTimeline.restart();
  }

  leave() {
    this.renderedStyles['radius'].current = this.radius;
    this.renderedStyles['opacity'].current = this.opacity;
    this.filterTimeline.progress(1).kill();
  }

  createFilterTimeline() {
    this.filterTimeline = gsap.timeline({
      paused: true,
      onStart: () => { this.DOM.inner.style.filter = `url(${this.filterId}`; },
      onUpdate: () => { this.DOM.feTurbulence.setAttribute('baseFrequency', this.primitiveValues.turbulence); },
      onComplete: () => { this.DOM.inner.style.filter = 'none'; }
    })
    .to(this.primitiveValues, { 
      duration: 0.5,
      ease: 'sine.in',
      startAt: {turbulence: 1},
      turbulence: 0
    });
  }

  render() {
    this.renderedStyles['tx'].current = cursor.x - this.bounds.width/2;
    this.renderedStyles['ty'].current = cursor.y - this.bounds.height/2;

    for (const key in this.renderedStyles) {
      this.renderedStyles[key].previous = lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].amt);
    }

    this.DOM.el.style.transform = `translateX(${this.renderedStyles.tx.previous}px) translateY(${this.renderedStyles.ty.previous}px)`;
    this.DOM.inner.setAttribute('r', this.renderedStyles.radius.previous);
    this.DOM.el.style.opacity = this.renderedStyles.opacity.previous;

    requestAnimationFrame(() => this.render());
  }
}

// カスタムカーソルを初期化
const customCursor = new Cursor(document.querySelectorAll('.cursor'));
