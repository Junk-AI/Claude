// ---------------------------------------------------------------------------
// TOPIC 2 - HOUSING IN CITIES
// ---------------------------------------------------------------------------

export const glossary = [
  { term: 'Sustainable urban neighbourhood', def: 'A neighbourhood that is economically, socially and environmentally sustainable at the same time.' },
  { term: 'Sense of place', def: 'The meaning and attachment people develop towards a place through repeated encounters and memorable events.' },
  { term: 'Region', def: 'An area defined by a shared characteristic, which may be environmental, human or geographical.' },
  { term: 'Spatial pattern', def: 'The arrangement of features in space: shapes, clusters or regular intervals.' },
  { term: 'Spatial association', def: 'Two or more features that are consistently found together in the same place.' },
  { term: 'Formal housing', def: 'Planned housing built by the government or private developers, with legal land rights, basic services and high-quality materials.' },
  { term: 'Informal housing', def: 'Self-built, unplanned housing with no legal right to the land, lacking basic services and built from poor materials.' },
  { term: 'Precinct', def: 'A cluster of 400 to 800 residential units.' },
  { term: 'Neighbourhood', def: 'A few precincts together, housing about 4,000 to 6,000 residents.' },
  { term: 'Town', def: 'A few neighbourhoods arranged around a town centre.' },
];

export const flashcards = [
  // --- Sustainability ---
  { id: 'h-f1', front: 'Economic sustainability of a neighbourhood - two requirements', back: 'Population density must be high enough to support local businesses, and high enough to make transport and infrastructure cost-efficient to provide.' },
  { id: 'h-f2', front: 'Social sustainability of a neighbourhood - two requirements', back: 'The community must be small enough for residents to interact regularly, and small enough for collective decision-making to work.' },
  { id: 'h-f3', front: 'Environmental sustainability of a neighbourhood - three features', back: 'Protection of nature; minimisation of waste and recycling; energy-efficient and water-efficient design.' },

  // --- Sense of place ---
  { id: 'h-f4', front: 'Sense of place, way 1: repeated encounters', back: 'Repeated encounters with the same objects and people along familiar paths build recall and meaning. People become attached to everyday places such as the shops at a town centre, and sensory details reinforce the memory.' },
  { id: 'h-f5', front: 'Sense of place, way 2: significant events at landmarks', back: 'Memorable events at landmarks or gathering places create attachment, because landmarks are visible and memorable and may hold symbolic or historical value. Example: the Truss Bridges at Bukit Timah, built in 1932, associated with Singapore railway history.' },

  // --- Regions, patterns, associations ---
  { id: 'h-f6', front: 'Three kinds of region, with examples', back: 'Environmental (Little Guilin nature park); human (Jurong commercial vs residential zones); geographical (Singapore 5 regions in the URA Master Plan 2014). Town Council service areas and electoral divisions are also regions.' },
  { id: 'h-f7', front: 'Three kinds of spatial pattern, with examples', back: 'Shapes and geometry (the Circle Line); clusters (heavy industry in Tuas and Pioneer); regular intervals (bus stops about 400m apart).' },
  { id: 'h-f8', front: 'What is a spatial association? Give examples.', back: 'Two features consistently found together: lifts paired with stairwells, train stations paired with bus interchanges.' },
  { id: 'h-f9', front: 'The five spatial scales, smallest to largest', back: 'Local (Sentosa), district (Central region), country (Singapore), region (Southeast Asia), global.' },
  { id: 'h-f10', front: 'The spatial hierarchy of a Singapore town', back: 'Residential Unit, then Precinct (400-800 units), then Neighbourhood (4,000-6,000 residents, a few precincts), then Town (a few neighbourhoods around a town centre).' },
  { id: 'h-f11', front: 'How many towns and estates does Singapore have?', back: '24 towns and 3 estates, spread across the North, Northeast, East, West and Central regions.' },

  // --- Town planning aims ---
  { id: 'h-f12', front: 'Town planning aim 1: serving residents and nature', back: 'Planning serves residents and nature at precinct, neighbourhood and town level. Woodlands is planned around 5 sub-themed areas: Nature, Discovery, Community, Urban and Wellness.' },
  { id: 'h-f13', front: 'Town planning aim 2: connections and synergies', back: 'Planning creates connections between land uses. The URA Long-Term Plan looks 50 years ahead and is reviewed every 10 years. The Senoko Waste-to-Energy Plant near Woodlands and Sembawang manages pollution while creating jobs and education opportunities.' },

  // --- Humans and nature ---
  { id: 'h-f14', front: 'How do humans depend on nature in a city?', back: 'Nature provides clean air and water, pollination through bees, and recreation and wellbeing, e.g. the NParks Therapeutic Gardens.' },
  { id: 'h-f15', front: 'Positive human impact on nature - example', back: 'Reforestation enhances biodiversity and improves human wellbeing at the same time.' },
  { id: 'h-f16', front: 'Negative human impact on nature - Bukit Timah', back: 'In 2014 soil erosion and habitat degradation at Bukit Timah Nature Reserve were serious enough that public access was limited for two years.' },
  { id: 'h-f17', front: 'Planning decision that protected nature - which MRT line?', back: 'The Cross Island MRT Line was rerouted around the Central Catchment Nature Reserve to protect the primary rainforest.' },

  // --- Formal vs informal housing ---
  { id: 'h-f18', front: 'Formal housing - location characteristics', back: 'Built on desirable land: low pollution, near greenery, amenities and infrastructure.' },
  { id: 'h-f19', front: 'Informal housing - location characteristics', back: 'Near locally unwanted land uses such as landfills, sewage plants and polluting industry, or beside large developments so residents can piggyback on existing infrastructure.' },
  { id: 'h-f20', front: 'Formal housing - four characteristics', back: 'Built by government (public or subsidised) or private developers (premium); legal right to the land, so it can be sold or leased; access to basic services; high-quality materials such as concrete, metal and hardwood.' },
  { id: 'h-f21', front: 'Informal housing - four characteristics', back: 'Self-built and unplanned; no legal right to the land (squatter settlements); lacks basic services, so residents tap electricity illegally, extract water and dispose of sanitary waste illegally; poor materials such as scavenged zinc sheets and recycled lumber, giving collapse, flood and fire risk.' },
  { id: 'h-f22', front: 'Informal housing in LDCs - what does it look like and where?', back: 'Slums: self-built from flimsy materials, sometimes legally permitted. Examples: Dharavi in Mumbai, Rocinha in Rio de Janeiro, Kibera in Nairobi, Tondo in Manila.' },
  { id: 'h-f23', front: 'Informal housing in DCs - what does it look like and where?', back: 'Tent cities and occupied abandoned buildings. Less permanent and routinely cleared by authorities. Example: Skid Row, Los Angeles.' },

  // --- Location factors ---
  { id: 'h-f24', front: 'Location factor: land-use planning and zoning', back: 'Governments zone land for particular uses. In Jurong, commercial uses are concentrated in the west and south while residential areas are in the east and north.' },
  { id: 'h-f25', front: 'Location factor: type of developer', back: 'Private developers are profit-driven, so they build on commercially viable sites. Public developers are needs-driven, so they build where housing is needed.' },
  { id: 'h-f26', front: 'Location factor: land prices', back: 'Land prices are higher in the city centre. Where formal housing becomes unaffordable, informal housing springs up instead.' },
  { id: 'h-f27', front: 'Location factor: housing subsidies', back: 'Subsidies lower building costs and prevent housing shortages. Where subsidies are absent, more informal settlements appear.' },

  // --- Impacts on the environment ---
  { id: 'h-f28', front: 'Housing impact on the environment: resource use', back: 'WWF estimates about 18.7 million acres of forest are lost each year, mostly to urbanisation.' },
  { id: 'h-f29', front: 'Housing impact: soil and waste pollution - Singapore evidence', back: "Singapore's waste rose 7-fold in 40 years, reaching 7.7 million tonnes in 2017, equivalent to 15,000 Olympic swimming pools. Semakau Landfill is projected to be full by 2035." },
  { id: 'h-f30', front: 'Housing impact: water pollution - which river?', back: 'The River Ciliwung in Jakarta, the longest and most polluted river there, carries untreated sewage from slums along its banks.' },
  { id: 'h-f31', front: 'Housing impact: air pollution - which city?', back: 'Chennai, where slum households rely on firewood for cooking, releasing smoke and particulates.' },

  // --- Impacts on people ---
  { id: 'h-f32', front: 'Housing impact on people: poor living conditions - evidence', back: 'In Nairobi, Kenya, the under-5 death rate is 2.5 times higher in slums than elsewhere in the city (WHO, 2008 data).' },
  { id: 'h-f33', front: 'Housing impact on people: quality of life - evidence', back: 'In Dhaka, Bangladesh, about 40,000 people were evicted from informal homes in 2012, causing social tension between the government and its people.' },

  // --- Sustainable management ---
  { id: 'h-f34', front: 'Sustainable management: integrated land-use planning', back: 'Multi-stakeholder coordination of housing with amenities, transport and services. Example: Tengah, Singapore, a self-contained town. Advantage: convenience, reduced travel and emissions. Disadvantage: it does not work where stakeholders disagree.' },
  { id: 'h-f35', front: 'Sustainable management: inclusive public housing', back: 'Housing that caters to all ages and abilities: senior activity areas, youth spaces and accessible playgrounds in Singapore estates. Advantage: inclusivity. Disadvantage: costly for resource-poor cities.' },
  { id: 'h-f36', front: 'Sustainable management: environmental features', back: 'Singapore aims to install solar panels on more than 10,000 HDB blocks by 2026. Advantage: reduces environmental impact and saves government cost in the long run. Disadvantage: expensive to implement.' },
  { id: 'h-f37', front: 'Sustainable management: slum improvement via self-help', back: 'The Rocinha Project in Rio de Janeiro raised electricity access from 30% to 75%. Advantage: lower construction cost and improved living conditions. Disadvantage: slower construction, because residents can only work at weekends and in their free time.' },
  { id: 'h-f38', front: 'Sustainable management: government-NGO partnership', back: 'The Kenyan government worked with UN-HABITAT on a Nairobi upgrading project, temporarily relocating residents during upgrading. Advantage: greater improvement and more efficient resource management. Disadvantage: some residents struggle to afford the new housing costs.' },
];

export const fillBlanks = [
  { id: 'h-b1', text: 'A precinct contains ___ to ___ residential units.', blanks: [{ answers: ['400'], hint: 'three figures' }, { answers: ['800'], hint: 'three figures' }] },
  { id: 'h-b2', text: 'A neighbourhood houses about ___ to ___ residents.', blanks: [{ answers: ['4,000', '4000'], hint: 'four figures' }, { answers: ['6,000', '6000'], hint: 'four figures' }] },
  { id: 'h-b3', text: 'Singapore has ___ towns and ___ estates.', blanks: [{ answers: ['24'], hint: 'two figures' }, { answers: ['3'], hint: 'one figure' }] },
  { id: 'h-b4', text: "The URA's Long-Term Plan looks ___ years ahead and is reviewed every ___ years.", blanks: [{ answers: ['50'], hint: 'two figures' }, { answers: ['10'], hint: 'two figures' }] },
  { id: 'h-b5', text: "Rocinha's electricity access rose from ___% to ___% under the self-help upgrading project.", blanks: [{ answers: ['30', '30%'], hint: 'a percentage' }, { answers: ['75', '75%'], hint: 'a percentage' }] },
  { id: 'h-b6', text: "In Nairobi, the under-5 death rate is ___ times higher in slums than elsewhere in the city.", blanks: [{ answers: ['2.5'], hint: '1 decimal place' }] },
  { id: 'h-b7', text: 'In Dhaka, Bangladesh, about ___ people were evicted from informal homes in ___.', blanks: [{ answers: ['40,000', '40000'], hint: 'five figures' }, { answers: ['2012'], hint: 'a year' }] },
  { id: 'h-b8', text: "Singapore's waste rose 7-fold in 40 years to ___ million tonnes in ___, and Semakau Landfill is projected to be full by ___.", blanks: [{ answers: ['7.7'], hint: '1 decimal place' }, { answers: ['2017'], hint: 'a year' }, { answers: ['2035'], hint: 'a year' }] },
  { id: 'h-b9', text: 'WWF estimates that about ___ million acres of forest are lost each year, mostly to urbanisation.', blanks: [{ answers: ['18.7'], hint: '1 decimal place' }] },
  { id: 'h-b10', text: 'Singapore aims to install solar panels on more than ___ HDB blocks by ___.', blanks: [{ answers: ['10,000', '10000'], hint: 'five figures' }, { answers: ['2026'], hint: 'a year' }] },
  { id: 'h-b11', text: 'The Truss Bridges at Bukit Timah were built in ___ and are associated with Singapore railway history.', blanks: [{ answers: ['1932'], hint: 'a year' }] },
  { id: 'h-b12', text: 'In ___, soil erosion at Bukit Timah Nature Reserve led to public access being limited for ___ years.', blanks: [{ answers: ['2014'], hint: 'a year' }, { answers: ['2', 'two'], hint: 'a number' }] },
  { id: 'h-b13', text: 'The ___ Island MRT Line was rerouted around the Central Catchment Nature Reserve to protect primary rainforest.', blanks: [{ answers: ['cross'], hint: 'one word' }] },
  { id: 'h-b14', text: "Singapore's 5 regions were set out in the URA Master Plan of ___.", blanks: [{ answers: ['2014'], hint: 'a year' }] },
  { id: 'h-b15', text: 'Bus stops in Singapore are placed at regular intervals of about ___ metres apart.', blanks: [{ answers: ['400'], hint: 'three figures' }] },
  { id: 'h-b16', text: 'The Kenyan government partnered with ___ on a slum upgrading project in Nairobi.', blanks: [{ answers: ['un-habitat', 'un habitat', 'unhabitat'], hint: 'a UN agency' }] },
  { id: 'h-b17', text: '___, in Singapore, is planned as a self-contained town with amenities, transport and services built in.', blanks: [{ answers: ['tengah'], hint: 'a town' }] },
  { id: 'h-b18', text: 'Woodlands is planned around 5 sub-themed areas: Nature, Discovery, ___, Urban and ___.', blanks: [{ answers: ['community'], hint: 'one word' }, { answers: ['wellness'], hint: 'one word' }] },
];

export const dragDrop = [
  {
    id: 'h-d1', type: 'match', title: 'Slum to city',
    prompt: 'Match each informal settlement to the city it is in.',
    pairs: [
      { left: 'Dharavi', right: 'Mumbai' },
      { left: 'Rocinha', right: 'Rio de Janeiro' },
      { left: 'Kibera', right: 'Nairobi' },
      { left: 'Tondo', right: 'Manila' },
      { left: 'Skid Row', right: 'Los Angeles' },
    ],
  },
  {
    id: 'h-d2', type: 'match', title: 'Evidence to place',
    prompt: 'Match each piece of evidence to its place.',
    pairs: [
      { left: 'Under-5 death rate 2.5x higher in slums', right: 'Nairobi, Kenya' },
      { left: 'About 40,000 evicted from informal homes in 2012', right: 'Dhaka, Bangladesh' },
      { left: 'Longest and most polluted river, untreated slum sewage', right: 'River Ciliwung, Jakarta' },
      { left: 'Slum households rely on firewood for cooking', right: 'Chennai, India' },
      { left: 'Electricity access rose from 30% to 75%', right: 'Rocinha, Rio de Janeiro' },
      { left: 'Self-contained new town with built-in amenities', right: 'Tengah, Singapore' },
    ],
  },
  {
    id: 'h-d3', type: 'sequence', title: 'Spatial hierarchy',
    prompt: 'Order the spatial hierarchy from smallest to largest.',
    items: ['Residential Unit', 'Precinct (400-800 units)', 'Neighbourhood (4,000-6,000 residents)', 'Town (a few neighbourhoods around a town centre)'],
  },
  {
    id: 'h-d4', type: 'sequence', title: 'Spatial scales',
    prompt: 'Order the spatial scales from smallest to largest.',
    items: ['Local (Sentosa)', 'District (Central region)', 'Country (Singapore)', 'Region (Southeast Asia)', 'Global'],
  },
  {
    id: 'h-d5', type: 'categorise', title: 'Formal vs informal housing',
    prompt: 'Sort each characteristic into formal or informal housing.',
    categories: [{ id: 'formal', label: 'Formal housing' }, { id: 'informal', label: 'Informal housing' }],
    items: [
      { text: 'Built by government or private developers', category: 'formal' },
      { text: 'Legal right to the land, can be sold or leased', category: 'formal' },
      { text: 'Access to basic services', category: 'formal' },
      { text: 'Concrete, metal and hardwood materials', category: 'formal' },
      { text: 'Located on desirable land near greenery and amenities', category: 'formal' },
      { text: 'Self-built and unplanned', category: 'informal' },
      { text: 'No legal right to the land', category: 'informal' },
      { text: 'Illegal electrical tapping and water extraction', category: 'informal' },
      { text: 'Scavenged zinc sheets and recycled lumber', category: 'informal' },
      { text: 'Located near landfills, sewage plants or polluting industry', category: 'informal' },
    ],
  },
  {
    id: 'h-d6', type: 'categorise', title: 'Three pillars of neighbourhood sustainability',
    prompt: 'Sort each requirement under the correct pillar.',
    categories: [
      { id: 'econ', label: 'Economic' },
      { id: 'social', label: 'Social' },
      { id: 'env', label: 'Environmental' },
    ],
    items: [
      { text: 'Density high enough to support local businesses', category: 'econ' },
      { text: 'Cost-efficient transport and infrastructure provision', category: 'econ' },
      { text: 'Community small enough for regular interaction', category: 'social' },
      { text: 'Community small enough for collective decision-making', category: 'social' },
      { text: 'Protection of nature', category: 'env' },
      { text: 'Waste minimisation and recycling', category: 'env' },
      { text: 'Energy-efficient and water-efficient design', category: 'env' },
    ],
  },
  {
    id: 'h-d7', type: 'categorise', title: 'Region, spatial pattern or spatial association?',
    prompt: 'Sort each example into the right relationship type.',
    categories: [
      { id: 'region', label: 'Region' },
      { id: 'pattern', label: 'Spatial pattern' },
      { id: 'assoc', label: 'Spatial association' },
    ],
    items: [
      { text: 'Little Guilin nature park', category: 'region' },
      { text: "Singapore's 5 regions in the URA Master Plan 2014", category: 'region' },
      { text: 'Jurong commercial vs residential zones', category: 'region' },
      { text: 'The Circle Line', category: 'pattern' },
      { text: 'Heavy industry clustered in Tuas and Pioneer', category: 'pattern' },
      { text: 'Bus stops about 400m apart', category: 'pattern' },
      { text: 'Lifts found beside stairwells', category: 'assoc' },
      { text: 'Train stations found beside bus interchanges', category: 'assoc' },
    ],
  },
];
