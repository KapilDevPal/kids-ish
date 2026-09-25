import { Pen, type Anchors } from './pen';
import type { El } from './types';
import { ROCKETS, drawRocket, drawShuttle } from './rockets';
import { SATS, drawAstronaut, drawBicycle, drawBoat, drawCapsule, drawEngine, drawLander, drawOrbiter, drawParachutes, drawRobot, drawRover, drawSatellite, drawStation } from './craft';
import { drawAsteroid, drawBeam, drawBlackHole, drawComet, drawConstellation, drawDebris, drawEarth, drawFace, drawGalaxy, drawMoon, drawNebula, drawOrbit, drawPlanet, drawStars, drawSun } from './sky';
import { drawArrow, drawCloud, drawCrater, drawDish, drawFlag, drawGround, drawNumber, drawPad, drawPalm, drawPlant, drawTag, drawTelescope, drawTower } from './props';

/** Easy pages get chunky lines and big shapes; tricky ones get finer lines and more detail. */
export const LINE_WIDTH: Record<1 | 2 | 3, number> = { 1: 12, 2: 9, 3: 7 };

export interface Art {
  art: El[];
  level: 1 | 2 | 3;
  /** Printed small at the bottom so a saved picture says what (and whose) it is. */
  caption?: string;
}

function el(p: Pen, e: El) {
  switch (e.k) {
    case 'rocket': {
      const spec = typeof e.v === 'string' ? ROCKETS[e.v] : e.v;
      return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawRocket(p, spec, { flame: e.flame, parts: e.parts }), e.flip);
    }
    case 'shuttle': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawShuttle(p, e.flame), e.flip);
    case 'satellite': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawSatellite(p, SATS[e.v], e.parts), e.flip);
    case 'lander': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawLander(p, e.parts, e.ramp), e.flip);
    case 'rover': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawRover(p, e.parts), e.flip);
    case 'orbiter': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawOrbiter(p, e.parts), e.flip);
    case 'capsule': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawCapsule(p, e.tower, e.service), e.flip);
    case 'parachutes': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawParachutes(p, e.n), e.flip);
    case 'station': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawStation(p, e.modules), e.flip);
    case 'astronaut':
      if (e.tether) {
        const [tx, ty] = e.tether;
        p.see(() => p.path((c) => { c.moveTo(e.x, e.y); c.bezierCurveTo((e.x + tx) / 2, e.y + 160, tx - 60, ty - 80, tx, ty); }, false, 0.8));
      }
      return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawAstronaut(p, e.pose, e.face), e.flip);
    case 'robot': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawRobot(p), e.flip);
    case 'engine': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawEngine(p), e.flip);
    case 'bicycle': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawBicycle(p), e.flip);
    case 'boat': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawBoat(p), e.flip);
    case 'stars': return drawStars(p, e.at, e.style);
    case 'dots': return e.at.forEach(([x, y, r]) => p.dot(x, y, r));
    case 'star': return p.star(e.x, e.y, e.r, e.n ?? 5, e.inner ?? 0.45);
    case 'planet': return drawPlanet(p, e);
    case 'moon': {
      drawMoon(p, e);
      return p.anchor(e.id, e.x - e.r * 0.4, e.y + e.r * 0.5);
    }
    case 'sun': return drawSun(p, e);
    case 'earth': return drawEarth(p, e);
    case 'galaxy': return drawGalaxy(p, e);
    case 'nebula': return drawNebula(p, e);
    case 'comet': return drawComet(p, e);
    case 'asteroid': return drawAsteroid(p, e);
    case 'blackhole': return drawBlackHole(p, e);
    case 'constellation': return drawConstellation(p, e.pts, e.links, e.r);
    case 'orbit': return drawOrbit(p, e);
    case 'beam': return drawBeam(p, e);
    case 'debris': return drawDebris(p, e.at);
    case 'ground': return drawGround(p, e.y, e.style, e.seed);
    case 'pad': return drawPad(p, e.x, e.y, e.w);
    case 'tower': return drawTower(p, e.x, e.top, e.base, e.w, e.arms, e.side);
    case 'cloud': return drawCloud(p, e.x, e.y, e.w, e.h, e.n);
    case 'palm': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawPalm(p), e.flip);
    case 'flag': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawFlag(p, e.pole ?? true), e.flip);
    case 'dish': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawDish(p), e.flip);
    case 'telescope': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawTelescope(p), e.flip);
    case 'plant': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawPlant(p), e.flip);
    case 'crater': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => drawCrater(p, e.r), e.flip);
    case 'face': return drawFace(p, e.x, e.y, e.r * (e.s ?? 1));
    case 'tag': return drawTag(p, e.t, e.x, e.y, e.to, e.size, e.align);
    case 'number': return drawNumber(p, e.n, e.x, e.y, e.r);
    case 'text': return p.text(e.t, e.x, e.y, e.size ?? 60, { outline: e.outline, rot: e.rot });
    case 'arrow': return drawArrow(p, e.from, e.to);
    case 'svg': return p.at(e.x, e.y, e.s ?? 1, e.rot ?? 0, () => p.svg(e.d), e.flip);
  }
}

/**
 * Draw a page's line art onto a transparent canvas of size w x h.
 * Returns part anchors in canvas pixels, used to carry a child's colours into the 3D model.
 */
export function renderArt(ctx: CanvasRenderingContext2D, page: Art, w: number, h: number): Anchors {
  const k = Math.min(w, h) / 1080;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(k, k);
  const pen = new Pen(ctx, LINE_WIDTH[page.level], w / 2 / k, h / 2 / k);
  for (const e of page.art) el(pen, e);
  if (page.caption) {
    const portrait = h > w;
    const y = portrait ? 650 : 512, size = portrait ? 34 : 24;
    ctx.font = `700 ${size}px 'Baloo 2', 'Nunito', ui-rounded, system-ui, sans-serif`;
    const tw = ctx.measureText(page.caption).width;
    pen.trace((c) => c.roundRect(-tw / 2 - 16, y - size * 0.75, tw + 32, size * 1.5, size * 0.75));
    pen.erase();
    pen.text(page.caption, 0, y, size, { weight: 700 });
  }
  ctx.restore();
  return pen.anchors;
}
