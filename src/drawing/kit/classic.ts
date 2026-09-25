import { LINE } from './pen';

/**
 * The four colouring pages from the first release, drawn exactly as before so saved drafts
 * and archived drawings that reference them still match.
 */
export const CLASSIC_PAGE_IDS = ['rocket', 'lander', 'astronaut', 'solar'];

export function drawClassicPage(ctx: CanvasRenderingContext2D, id: string, w: number, h: number) {
  const s = Math.min(w, h) / 1080;
  ctx.save();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 8 * s;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const cx = w / 2, cy = h / 2;
  const P = (x: number, y: number): [number, number] => [cx + x * s, cy + y * s];
  const path = (fn: (m: (x: number, y: number) => void, l: (x: number, y: number) => void) => void, close = true) => {
    ctx.beginPath();
    fn((x, y) => ctx.moveTo(...P(x, y)), (x, y) => ctx.lineTo(...P(x, y)));
    if (close) ctx.closePath();
    ctx.stroke();
  };
  const circ = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(...P(x, y), r * s, 0, Math.PI * 2);
    ctx.stroke();
  };
  const ell = (x: number, y: number, rx: number, ry: number, rot = 0) => {
    ctx.beginPath();
    ctx.ellipse(...P(x, y), rx * s, ry * s, rot, 0, Math.PI * 2);
    ctx.stroke();
  };
  const star = (x: number, y: number, r: number) =>
    path((m, l) => {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 === 0 ? r : r * 0.45;
        (i === 0 ? m : l)(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
    });
  const ground = (y: number) => {
    ctx.beginPath();
    ctx.moveTo(0, cy + y * s);
    ctx.lineTo(w, cy + y * s);
    ctx.stroke();
  };

  if (id === 'rocket') {
    ground(420);
    // pad
    path((m, l) => { m(-260, 420); l(-220, 360); l(220, 360); l(260, 420); });
    // tower
    path((m, l) => { m(230, 360); l(230, -300); l(310, -300); l(310, 360); });
    for (let y = -300; y < 360; y += 80) path((m, l) => { m(230, y); l(310, y + 80); }, false);
    path((m, l) => { m(130, -120); l(230, -120); l(230, -100); l(130, -100); });
    // rocket body
    path((m, l) => { m(-70, 340); l(-70, -180); l(70, -180); l(70, 340); });
    path((m, l) => { m(-70, -180); l(-70, -230); l(70, -230); l(70, -180); });
    ctx.beginPath();
    ctx.moveTo(...P(-70, -230));
    ctx.bezierCurveTo(...P(-70, -330), ...P(-20, -400), ...P(0, -420));
    ctx.bezierCurveTo(...P(20, -400), ...P(70, -330), ...P(70, -230));
    ctx.stroke();
    path((m, l) => { m(-70, 80); l(70, 80); }, false);
    circ(0, -60, 40);
    // boosters
    for (const side of [-1, 1]) {
      const x0 = side * 70, x1 = side * 130;
      path((m, l) => { m(x0, 340); l(x1, 340); l(x1, 60); l(x0, 20); });
      path((m, l) => { m(x0 + side * 10, 340); l(x1 - side * 5, 340); l(x1 - side * 5, 360); l(x0 + side * 10, 360); });
    }
    star(-330, -380, 50); star(-200, -470, 30); star(380, -420, 36);
    ell(-330, 200, 90, 50); ell(-360, 250, 70, 40);
  } else if (id === 'lander') {
    ctx.beginPath();
    ctx.moveTo(0, cy + 330 * s);
    ctx.bezierCurveTo(w * 0.3, cy + 300 * s, w * 0.7, cy + 360 * s, w, cy + 320 * s);
    ctx.stroke();
    ell(-340, 420, 90, 26); ell(300, 450, 120, 30); ell(60, 520, 60, 18);
    // lander
    path((m, l) => { m(-190, 150); l(90, 150); l(90, -40); l(-190, -40); });
    path((m, l) => { m(-190, -40); l(-160, -110); l(60, -110); l(90, -40); });
    path((m, l) => { m(-80, -110); l(-80, -190); l(-20, -190); l(-20, -110); });
    circ(-110, 50, 34);
    for (const [a, b] of [[-190, -280], [90, 180]]) {
      path((m, l) => { m(a, 130); l(b, 310); }, false);
      path((m, l) => { m(b - 40, 310); l(b + 40, 310); }, false);
    }
    // ramp and rover
    path((m, l) => { m(90, 140); l(250, 300); }, false);
    path((m, l) => { m(240, 250); l(400, 250); l(400, 190); l(240, 190); });
    path((m, l) => { m(260, 190); l(280, 130); l(360, 130); l(380, 190); });
    circ(270, 280, 30); circ(370, 280, 30);
    path((m, l) => { m(320, 130); l(320, 80); }, false);
    circ(320, 70, 12);
    // Earth and stars
    circ(300, -380, 110);
    path((m, l) => { m(240, -440); l(290, -400); l(260, -340); l(210, -370); });
    star(-320, -400, 44); star(-120, -460, 26); star(60, -330, 30);
  } else if (id === 'astronaut') {
    // planet with ring
    circ(-250, 330, 150);
    ell(-250, 330, 260, 60, -0.25);
    // astronaut
    circ(80, -170, 130);
    ell(80, -180, 90, 70);
    path((m, l) => { m(-40, -60); l(-60, 200); l(220, 200); l(200, -60); });
    path((m, l) => { m(-40, -20); l(-160, 80); l(-130, 120); l(-30, 40); });
    path((m, l) => { m(200, -20); l(320, -120); l(350, -80); l(210, 40); });
    path((m, l) => { m(-30, 200); l(-40, 360); l(40, 360); l(60, 200); });
    path((m, l) => { m(100, 200); l(120, 360); l(200, 360); l(210, 200); });
    path((m, l) => { m(20, 20); l(140, 20); l(140, 110); l(20, 110); });
    // tether
    ctx.beginPath();
    ctx.moveTo(...P(-40, 150));
    ctx.bezierCurveTo(...P(-200, 180), ...P(-330, -60), ...P(-420, -220));
    ctx.stroke();
    star(-300, -420, 50); star(360, -420, 40); star(380, 300, 34); star(200, 460, 26);
  } else if (id === 'solar') {
    circ(-w / (2 * s) + 40, 0, 300);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI - Math.PI / 2;
      const r0 = 330, r1 = 400;
      const x = -w / (2 * s) + 40;
      path((m, l) => { m(x + Math.cos(a) * r0, Math.sin(a) * r0); l(x + Math.cos(a) * r1, Math.sin(a) * r1); }, false);
    }
    const planets: [number, number, number][] = [[-80, -200, 36], [60, 180, 50], [200, -120, 56], [330, 240, 44]];
    planets.forEach(([x, y, r]) => circ(x, y, r));
    ell(330, 240, 90, 22, -0.3);
    star(120, -420, 40); star(380, -300, 30); star(-60, 420, 34);
  }
  ctx.restore();
}
