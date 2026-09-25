import { lazy } from 'react';
import type { ModelDefinition } from './types';

/**
 * The model registry. Adding a new spacecraft = one entry here + one component file.
 * Components are lazy so each model's code only loads when a child opens it.
 */
export const MODELS: ModelDefinition[] = [
  {
    id: 'pslv',
    name: 'PSLV',
    tagline: 'India’s trusty workhorse rocket',
    family: 'rocket',
    glyph: 'rocket',
    accent: '#FF9933',
    camera: { position: [6.2, 3.6, 7.4], target: [0, 2.8, 0], min: 4, max: 16 },
    action: { kind: 'launch', label: 'Launch', duration: 7.5, success: 'Your PSLV reached orbit!' },
    options: [
      {
        id: 'boosters', label: 'Strap‑on boosters', type: 'choice', default: 6,
        choices: [
          { value: 0, label: 'CA', hint: 'No boosters' },
          { value: 2, label: 'DL', hint: '2 boosters' },
          { value: 4, label: 'QL', hint: '4 boosters' },
          { value: 6, label: 'XL', hint: '6 boosters' },
        ],
      },
    ],
    parts: [
      { id: 'fairing', label: 'Payload fairing', color: '#FFFFFF', fact: 'This nose cone keeps the satellite safe from wind and heat, then splits open in space like a clamshell.' },
      { id: 'stage4', label: 'Fourth stage', color: '#A7A9B4', finish: 'metal', fact: 'The small top stage puts satellites exactly where they need to be. After its job it can even become a tiny space lab!' },
      { id: 'stage3', label: 'Third stage', color: '#FFFFFF', fact: 'A solid rocket motor that fires high up where the air is very thin.' },
      { id: 'stage2', label: 'Second stage', color: '#FF9933', fact: 'It uses the Vikas engine, named after Vikram Sarabhai, the father of India’s space programme.' },
      { id: 'core', label: 'First stage', color: '#FFFFFF', fact: 'One of the biggest solid rocket motors in the world. It gives the first mighty push off the ground.' },
      { id: 'boosters', label: 'Strap‑on boosters', color: '#E4572E', fact: 'PSLV can wear 0, 2, 4 or 6 boosters. More boosters give more push for heavier satellites.' },
      { id: 'engine', label: 'Nozzle', color: '#23263A', finish: 'metal', fact: 'Hot gas rushes out of this bell super fast. The gas goes down, so the rocket goes up!' },
    ],
    Component: lazy(() => import('./models/PslvModel')),
  },
  {
    id: 'lvm3',
    name: 'LVM3',
    tagline: 'India’s most powerful rocket',
    family: 'rocket',
    glyph: 'rocket',
    accent: '#35D0BA',
    camera: { position: [6.8, 3.8, 8], target: [0, 3, 0], min: 4, max: 17 },
    action: { kind: 'launch', label: 'Launch', duration: 7.5, success: 'LVM3 is on its way to space!' },
    options: [{ id: 'crew', label: 'Gaganyaan crew capsule', type: 'toggle', default: false }],
    parts: [
      { id: 'nose', label: 'Nose', color: '#FFFFFF', fact: 'Carry a big satellite under the fairing, or switch on the crew capsule for Gaganyaan astronauts, with an escape tower on top for safety.' },
      { id: 'upper', label: 'Cryogenic stage', color: '#FFFFFF', fact: 'Its fuel is liquid hydrogen, kept colder than minus 250 °C. Super cold fuel gives super strong push.' },
      { id: 'core', label: 'Core stage', color: '#FF9933', fact: 'The middle stage has two Vikas engines that light up high in the sky.' },
      { id: 'boosters', label: 'S200 boosters', color: '#A7A9B4', fact: 'Two giant solid boosters lift the rocket off the pad, then drop away.' },
      { id: 'engine', label: 'Vikas engines', color: '#23263A', finish: 'metal', fact: 'Two engines side by side, working together like a team.' },
    ],
    Component: lazy(() => import('./models/Lvm3Model')),
  },
  {
    id: 'vikram',
    name: 'Vikram & Pragyan',
    tagline: 'The Chandrayaan‑3 Moon lander and rover',
    family: 'lander',
    glyph: 'lander',
    accent: '#FF6FB1',
    camera: { position: [4.4, 3, 5.2], target: [0, 0.9, 0.3], min: 2.5, max: 12 },
    action: { kind: 'land', label: 'Land', duration: 8.6, success: 'Vikram landed and Pragyan is exploring!' },
    parts: [
      { id: 'body', label: 'Lander body', color: '#FFC93C', finish: 'metal', fact: 'Vikram is wrapped in shiny gold foil. It works like a blanket, protecting against the Moon’s big hot and cold swings.' },
      { id: 'deck', label: 'Top deck', color: '#A7A9B4', fact: 'Antennas up here send messages all the way back to Earth.' },
      { id: 'solar', label: 'Solar panels', color: '#1F3FA8', fact: 'Solar panels turn sunlight into electricity. No sun, no power!' },
      { id: 'legs', label: 'Landing legs', color: '#A7A9B4', finish: 'metal', fact: 'Four strong legs soaked up the bump of landing, like knees bending when you jump.' },
      { id: 'rover', label: 'Pragyan rover', color: '#FFFFFF', fact: 'Pragyan means wisdom. This little rover checked what the Moon’s soil is made of.' },
      { id: 'wheels', label: 'Rover wheels', color: '#23263A', fact: 'Six wheels help Pragyan roll over bumpy, dusty Moon ground.' },
    ],
    Component: lazy(() => import('./models/VikramModel')),
  },
  {
    id: 'mangalyaan',
    name: 'Mangalyaan',
    tagline: 'India’s Mars orbiter',
    family: 'orbiter',
    glyph: 'orbiter',
    accent: '#E4572E',
    camera: { position: [3.6, 2.4, 4.6], target: [0.8, 0, 0], min: 2.5, max: 14 },
    action: { kind: 'orbit', label: 'Orbit Mars', duration: 9.4, success: 'Mangalyaan is circling Mars!' },
    parts: [
      { id: 'bus', label: 'Main body', color: '#FFC93C', finish: 'metal', fact: 'This box holds the computer, fuel and science instruments. It is about the size of a small car.' },
      { id: 'dish', label: 'Big dish antenna', color: '#FFFFFF', fact: 'The dish points at Earth to send pictures of Mars from more than 200 million kilometres away.' },
      { id: 'solar', label: 'Solar wing', color: '#1F3FA8', fact: 'Mars is far from the Sun, so the solar panels need to catch every bit of sunlight.' },
      { id: 'thruster', label: 'Engine', color: '#A7A9B4', finish: 'metal', fact: 'After a 300 day trip, this engine fired to slow down so Mars could catch the spacecraft in orbit.' },
    ],
    Component: lazy(() => import('./models/MangalyaanModel')),
  },
  {
    id: 'planet',
    name: 'Planet Maker',
    tagline: 'Invent a brand new world',
    family: 'planet',
    glyph: 'planet',
    accent: '#35D0BA',
    camera: { position: [0, 1.4, 7.2], target: [0, 0, 0], min: 3, max: 14 },
    action: { kind: 'spin', label: 'Spin it', duration: 3, success: 'Wheee! Your world is spinning.' },
    options: [
      {
        id: 'style', label: 'World type', type: 'choice', default: 'ocean',
        choices: [
          { value: 'ocean', label: 'Ocean' },
          { value: 'rocky', label: 'Rocky' },
          { value: 'gas', label: 'Gas giant' },
          { value: 'ice', label: 'Ice' },
          { value: 'lava', label: 'Lava' },
        ],
      },
      { id: 'size', label: 'Size', type: 'choice', default: 'medium', choices: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'big', label: 'Big' }] },
      { id: 'rings', label: 'Rings', type: 'toggle', default: true },
      { id: 'clouds', label: 'Clouds', type: 'toggle', default: true },
      { id: 'moons', label: 'Moons', type: 'stepper', min: 0, max: 3, default: 1 },
    ],
    parts: [
      { id: 'surface', label: 'Surface', color: '#35D0BA', finish: 'matte', fact: 'Rocky planets like Earth and Mars have solid ground. Gas giants like Jupiter are mostly swirling gas.' },
      { id: 'clouds', label: 'Clouds', color: '#FFFFFF', fact: 'Clouds form when water or other gases cool into tiny drops. Venus is covered in thick yellow clouds.' },
      { id: 'glow', label: 'Atmosphere glow', color: '#6FD3FF', fact: 'An atmosphere is a blanket of gas. Earth’s looks blue because air scatters blue sunlight the most.' },
      { id: 'rings', label: 'Rings', color: '#FFC93C', fact: 'Saturn, Jupiter, Uranus and Neptune all have rings. Saturn’s are the brightest.' },
      { id: 'moons', label: 'Moons', color: '#D8D9E2', fact: 'Jupiter and Saturn have close to 100 moons each. Earth has just one.' },
    ],
    Component: lazy(() => import('./models/PlanetModel')),
  },
];

export function getModel(id: string | undefined): ModelDefinition | undefined {
  return MODELS.find((m) => m.id === id);
}
