// Topic metadata: accent colours per the design system.
// Accents are used sparingly (headers, active states, progress fills) on a light ground.
export const TOPICS = [
  {
    id: 'population',
    name: 'Population Studies',
    short: 'Population',
    accent: '#7FA88E',        // soft sage / teal green
    accentDeep: '#5C8570',
    accentSoft: '#EAF1EC',
    accentTint: '#F4F8F5',
    blurb: 'Birth and death rates, migration, ageing populations and sustainable cities.',
  },
  {
    id: 'housing',
    name: 'Housing in Cities',
    short: 'Housing',
    accent: '#D9A679',        // warm terracotta / clay
    accentDeep: '#B27F52',
    accentSoft: '#F7EDE2',
    accentTint: '#FCF7F1',
    blurb: 'Sense of place, formal vs informal housing, impacts and sustainable management.',
  },
  {
    id: 'transport',
    name: 'Transport Systems in Cities',
    short: 'Transport',
    accent: '#7B9EC2',        // dusty blue
    accentDeep: '#5A7FA6',
    accentSoft: '#E9EFF6',
    accentTint: '#F4F7FB',
    blurb: 'Networks and nodes, why transport systems exist, impacts and sustainable strategies.',
  },
];

export const topicById = (id) => TOPICS.find((t) => t.id === id);
