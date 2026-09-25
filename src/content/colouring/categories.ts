import type { CategoryId } from './types';

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  blurb: string;
  accent: string;
  /** Colours offered first for pages in this category. */
  colours: string[];
}

export const CATEGORIES: Category[] = [
  { id: 'rockets', name: 'Indian Rockets', emoji: '🚀', blurb: 'PSLV, GSLV, LVM3, SSLV and the rockets that came first', accent: '#FF9933', colours: ['#FFFFFF', '#FF9933', '#A7A9B4', '#E4572E', '#FFC93C'] },
  { id: 'isro', name: 'ISRO Missions', emoji: '🇮🇳', blurb: 'Chandrayaan, Aditya-L1, Mangalyaan, Gaganyaan and satellites', accent: '#138808', colours: ['#FFC93C', '#1F3FA8', '#A7A9B4', '#FFFFFF', '#E4572E'] },
  { id: 'private', name: 'Indian Private Space', emoji: '🏢', blurb: 'Rockets and satellites built by Indian space start-ups', accent: '#8A5CF6', colours: ['#23263A', '#FFFFFF', '#FF9933', '#35D0BA', '#8A5CF6'] },
  { id: 'moon', name: 'Moon', emoji: '🌙', blurb: 'Craters, phases and India on the Moon', accent: '#A7A9B4', colours: ['#A7A9B4', '#D8D9E2', '#FFC93C', '#1F3FA8', '#FFFFFF'] },
  { id: 'planets', name: 'Planets', emoji: '🪐', blurb: 'The Sun and all eight planets', accent: '#35D0BA', colours: ['#D2552E', '#E8C07A', '#2B6FD6', '#D9B38C', '#9FE3E8'] },
  { id: 'astronauts', name: 'Astronauts', emoji: '🧑‍🚀', blurb: 'Gaganyatris, spacewalks and life in orbit', accent: '#6FD3FF', colours: ['#FFFFFF', '#FF9933', '#1F3FA8', '#6FD3FF', '#A7A9B4'] },
  { id: 'deep', name: 'Deep Space', emoji: '🌌', blurb: 'Galaxies, nebulas, comets and black holes', accent: '#FF6FB1', colours: ['#8A5CF6', '#FF6FB1', '#6FD3FF', '#FFC93C', '#23263A'] },
  { id: 'simple', name: 'Simple Kids Colouring', emoji: '👶', blurb: 'Big friendly shapes for little hands', accent: '#FFC93C', colours: ['#FFC93C', '#FF6FB1', '#6FD3FF', '#2FBF71', '#FF9933'] },
  { id: 'learn', name: 'Learn & Colour', emoji: '📚', blurb: 'Labelled diagrams: colour while you learn', accent: '#6FD3FF', colours: ['#FF9933', '#FFFFFF', '#138808', '#1F3FA8', '#FFC93C'] },
];

export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id);
