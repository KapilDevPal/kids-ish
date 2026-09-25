/**
 * Indian private space companies featured in the colouring library.
 * Kept to what they build, in words a child can follow; no claims about future launch dates.
 */
export interface Company {
  id: string;
  name: string;
  city: string;
  what: string;
}

export const COMPANIES: Company[] = [
  { id: 'skyroot', name: 'Skyroot Aerospace', city: 'Hyderabad', what: 'Builds the Vikram series of rockets, named after Dr Vikram Sarabhai.' },
  { id: 'agnikul', name: 'Agnikul Cosmos', city: 'Chennai', what: 'Builds the Agnibaan rocket and 3D-printed rocket engines.' },
  { id: 'pixxel', name: 'Pixxel', city: 'Bengaluru', what: 'Builds satellites with special cameras that see many more colours than our eyes.' },
  { id: 'digantara', name: 'Digantara', city: 'Bengaluru', what: 'Watches and tracks satellites and space junk so spacecraft can stay safe.' },
  { id: 'bellatrix', name: 'Bellatrix Aerospace', city: 'Bengaluru', what: 'Builds thrusters that push satellites around in space, and a space taxi to move them.' },
  { id: 'dhruva', name: 'Dhruva Space', city: 'Hyderabad', what: 'Builds small satellites, the parts that hold them together, and ground stations to talk to them.' },
  { id: 'galaxeye', name: 'GalaxEye', city: 'Bengaluru', what: 'Builds satellites that can see the ground even through clouds, day or night.' },
  { id: 'spacekidz', name: 'Space Kidz India', city: 'Chennai', what: 'Helps school students build real satellites, like AzaadiSAT.' },
];

export const companyById = (id: string | undefined) => COMPANIES.find((c) => c.id === id);
