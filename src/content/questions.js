// ---------------------------------------------------------------------------
// EXAM QUESTION BANK
//
// Every question carries its own mark scheme. The marker in src/lib/marking.js
// reads these objects; it never applies a generic rubric.
//
// Mark-scheme vocabulary used below:
//   kind: 'gse'    -> data-response trend question, marked G / S / E against
//                     the real seeded dataset in content/datasets.js
//   kind: 'points' -> short answer, marked point by point. Each point is
//                     awarded when EVERY group in `all` has at least one hit.
//   kind: 'essay'  -> 9-mark LDQ, marked against the L1/L2/L3 descriptors.
// ---------------------------------------------------------------------------

// Place names the marker recognises as "place-based examples".
export const PLACE_TERMS = [
  'singapore', 'tengah', 'woodlands', 'jurong', 'tampines', 'sembawang', 'seletar',
  'sentosa', 'tuas', 'pioneer', 'bukit timah', 'semakau', 'senoko', 'sungei kadut',
  'changi', 'raffles place', 'city hall', 'bayfront', 'ntu',
  'nairobi', 'kibera', 'kenya', 'un-habitat', 'un habitat',
  'mumbai', 'dharavi', 'india', 'chennai', 'rio de janeiro', 'rocinha', 'brazil',
  'manila', 'tondo', 'philippines', 'los angeles', 'skid row', 'usa', 'united states',
  'jakarta', 'ciliwung', 'indonesia', 'aceh', 'dhaka', 'bangladesh',
  'china', 'shanghai', 'japan', 'niger', 'nigeria', 'burkina faso', 'south sudan',
  'cambodia', 'vietnam', 'thailand', 'mekong', 'stockholm', 'sweden', 'sydney',
  'australia', 'mexico city', 'hong kong', 'chek lap kok', 'uk', 'england',
  'europe', 'panama', 'belize', 'shanghai', 'la county',
];

export const QUESTIONS = [
  // =========================================================================
  // DRQs - GSE marked against the seeded datasets
  // =========================================================================
  {
    id: 'drq-england', topic: 'housing', type: 'drq', marks: 3,
    prompt: 'Describe the trend of unsheltered homeless people in England from 2010 to 2016.',
    dataset: 'englandHomeless',
    marking: { kind: 'gse', dataset: 'englandHomeless', series: 'England' },
    modelAnswer:
      'From 2010 to 2016, there was an overall increase in the number of unsheltered homeless people from 1750 to 4125 people [G]. From 2014 to 2015, there was the sharpest increase from 2750 to 3550 people [S]. From 2011 to 2012, there was no change, remaining at 2200 people [E].',
  },
  {
    id: 'drq-la', topic: 'housing', type: 'drq', marks: 3,
    prompt: 'Describe the change in the number of homeless people in LA County from 2011 to 2019.',
    dataset: 'laHomeless',
    marking: { kind: 'gse', dataset: 'laHomeless', series: 'LA County' },
    modelAnswer:
      'From 2011 to 2019, there was an overall increase from 39,400 to 58,900 people. From 2016 to 2017, the sharpest increase occurred, from 46,240 to 54,780 people. From 2011 to 2012, there was the biggest decrease, from 39,400 to 36,540 people.',
  },
  {
    id: 'drq-shanghai', topic: 'population', type: 'drq', marks: 3,
    prompt: "Describe Shanghai's population trend from 1980 to 2035.",
    dataset: 'shanghaiPopulation',
    marking: { kind: 'gse', dataset: 'shanghaiPopulation', series: 'Shanghai' },
    modelAnswer:
      'Generally, the population of Shanghai increases, from 5.93 million in 1980 to a projected 34.34 million in 2035 [G]. From 2015 to 2020 there is the sharpest projected increase, from 23.48 to 27.06 million [S]. The growth is not even, however: from 1980 to 1985 there was the most gradual increase, from 5.93 to 7.1 million [E]. [Adapted from the student model answer]',
    studentSourced: true,
  },
  {
    id: 'drq-china-rural', topic: 'population', type: 'drq', marks: 2,
    prompt: 'Using the figure, describe the changes in the rural population in China from 1950 to 2030.',
    dataset: 'chinaRural',
    marking: { kind: 'gse', dataset: 'chinaRural', series: 'Rural China', marksOverride: 2 },
    modelAnswer:
      'From 1950 to 1990, there was an overall increase in the rural population from around 500 million to around 840 million. From 1990 to 2030, there was an overall decrease from around 840 million to around 540 million. There was the sharpest increase from 1965 to 1975, from around 600 million to around 750 million. [Student model answer]',
    studentSourced: true,
  },
  {
    id: 'drq-indonesia', topic: 'housing', type: 'drq', marks: 3,
    prompt: 'Describe the trend in the percentage of the urban population living in slums in Indonesia from 1990 to 2025 (projected).',
    dataset: 'indonesiaSlums',
    marking: { kind: 'gse', dataset: 'indonesiaSlums', series: 'Indonesia' },
    modelAnswer:
      'From 1990 to 2025 there is an overall decrease from 50% to 31%. Within this, there is a decrease from 1990 to 2015, from 50% to around 21%, before the sharpest change of all: an increase from 21% to 31% between 2015 and 2020. From 2020 to 2025 the data remains constant at 31%. [Student model answer]',
    studentSourced: true,
  },
  {
    id: 'drq-panama-belize', topic: 'housing', type: 'drq', marks: 3,
    prompt: 'Compare the urban population living in slums in Panama and Belize from 1995 to 2020.',
    dataset: 'slumsPanamaBelize',
    marking: { kind: 'gse', dataset: 'slumsPanamaBelize', series: 'Belize', compareSeries: 'Panama' },
    modelAnswer:
      'From 1995 to 2020, there was an overall decrease in both, but Panama had the greater overall decrease, from 30.8% to 12.5%, a fall of 18.3 percentage points. From 1995 to 2005, both increased: Belize from 32.4% to 36.1% and Panama from 30.8% to 33%. From 2005 to 2015, there was a sharp decrease for both: Belize from 36.1% to 16.7% and Panama from 33% to 11.5%. From 2015 to 2020, Belize remained constant at 16.7% while Panama had a slight increase from 11.5% to 12.5%. [Student model answer]',
    studentSourced: true,
  },
  {
    id: 'drq-under5', topic: 'population', type: 'drq', marks: 3,
    prompt: 'Using the described figure, describe the trend in the number of children under age 5 in the world from 1950 to 2100.',
    describedStimulus: 'worldUnderFive',
    marking: {
      kind: 'points', marks: 3,
      points: [
        { id: 'g', label: 'General trend with evidence: an increase from about 340 million in 1950 to a peak of about 560 million around 2015-2020.', all: [['increas', 'rise', 'rose', 'grew', 'growth'], ['340', '560', 'peak']] },
        { id: 's', label: 'Specific feature: a projected decline after the peak, through to 2100.', all: [['decline', 'decreas', 'fall', 'fell', 'drop'], ['2100', 'project', 'after the peak', 'peak']] },
        { id: 'e', label: 'Exception or fluctuation: the slight dip in the late 1990s to early 2000s, or the small fluctuation in the 2030s-2040s.', all: [['fluctuat', 'dip', 'slight decrease', 'slight decline', 'slight fall', 'not smooth', 'small'], ['1990s', '2000s', '2030s', '2040s']] },
      ],
    },
    modelAnswer:
      'The number of children under age 5 increased from about 340 million in 1950 to a peak of about 560 million around 2015-2020, before a projected decline to 2100. The rise is not smooth: there is a slight decrease in the late 1990s to early 2000s before it rises again, and another small fluctuation in the 2030s-2040s.',
  },

  // =========================================================================
  // SHORT ANSWER - point-by-point mark schemes
  // =========================================================================
  {
    id: 'sa-sustainability', topic: 'housing', type: 'short', marks: 6,
    prompt: 'Explain what is meant by economic, social and environmental sustainability.',
    marking: {
      kind: 'points', marks: 6,
      points: [
        { id: 'e1', label: 'Economic: population density high enough to support local businesses.', all: [['densit', 'population'], ['business', 'shop', 'enterprise', 'econom']] },
        { id: 'e2', label: 'Economic: cost-efficient transport and infrastructure provision.', all: [['cost', 'efficien', 'affordab'], ['transport', 'infrastructure']] },
        { id: 's1', label: 'Social: community small enough for regular interaction.', all: [['small', 'size', 'compact'], ['interact', 'know each other', 'communit', 'social']] },
        { id: 's2', label: 'Social: community small enough for collective decision-making.', all: [['collective', 'together', 'joint', 'shared', 'participat'], ['decision', 'decide', 'govern']] },
        { id: 'v1', label: 'Environmental: protection of nature (or waste minimisation and recycling).', all: [['protect', 'conserv', 'preserv', 'recycl', 'waste'], ['nature', 'natural', 'green', 'environment', 'waste', 'biodiversit']] },
        { id: 'v2', label: 'Environmental: energy-efficient and water-efficient design.', all: [['energ', 'water'], ['efficien', 'saving', 'conserv', 'design']] },
      ],
    },
    modelAnswer:
      'Economic sustainability means the population density is high enough to support local businesses, and high enough for transport and infrastructure to be provided cost-efficiently. Social sustainability means the community is small enough for residents to interact regularly and to make decisions collectively. Environmental sustainability means nature is protected, waste is minimised and recycled, and buildings are designed to be energy-efficient and water-efficient.',
  },
  {
    id: 'sa-sense-of-place', topic: 'housing', type: 'short', marks: 4,
    prompt: 'Explain two ways in which people develop a sense of place in their neighbourhoods.',
    marking: {
      kind: 'options', marks: 4, perOption: 2, maxOptions: 2,
      options: [
        {
          id: 'w1', label: 'Repeated encounters with objects or people along familiar paths',
          identify: ['repeat', 'daily', 'everyday', 'routine', 'familiar path', 'familiar', 'regular'],
          develop: ['recall', 'memor', 'meaning', 'attach', 'belong', 'shop', 'town centre', 'sensory', 'smell', 'sound'],
          developNote: 'Explain that repetition builds recall and meaning, and name an everyday place such as the shops at a town centre.',
        },
        {
          id: 'w2', label: 'Significant or memorable events at landmarks and gathering places',
          identify: ['event', 'landmark', 'gathering', 'memorable', 'celebrat', 'occasion'],
          develop: ['truss', 'bukit timah', '1932', 'railway', 'symbol', 'histor', 'heritage', 'visible', 'memorable'],
          developNote: 'Explain that landmarks are visible and may carry symbolic or historical value, and name one, e.g. the Truss Bridges at Bukit Timah, 1932.',
        },
      ],
    },
    modelAnswer:
      'First, people develop a sense of place through repeated encounters with the same objects and people along familiar paths. Seeing the same shops at the town centre every day builds recall and meaning, and sensory details such as smells and sounds reinforce the attachment. Second, significant or memorable events at landmarks or gathering places create attachment. Landmarks are visible and memorable and may hold symbolic or historical value, such as the Truss Bridges at Bukit Timah, built in 1932 and associated with Singapore railway history.',
  },
  {
    id: 'sa-formal-informal', topic: 'housing', type: 'short', marks: 4,
    prompt: 'Using evidence from the figures, compare formal and informal housing by explaining two differences.',
    marking: {
      kind: 'options', marks: 4, perOption: 2, maxOptions: 2, requiresComparative: true,
      options: [
        {
          id: 'd1', label: 'Difference in how the housing is built and laid out',
          identify: ['plan', 'high-rise', 'block', 'organised', 'orderly', 'irregular', 'haphazard', 'self-built', 'self built', 'unplanned'],
          develop: ['whereas', 'while', 'in contrast', 'compared', 'unlike', 'however', 'developer', 'government'],
          developNote: 'State it as a comparison: planned high-rise blocks built by developers, WHEREAS informal housing is irregular and self-built.',
        },
        {
          id: 'd2', label: 'Difference in materials and open space',
          identify: ['material', 'concrete', 'zinc', 'scaveng', 'recycled', 'greener', 'landscap', 'open space', 'packed', 'dense'],
          develop: ['whereas', 'while', 'in contrast', 'compared', 'unlike', 'however', 'quality', 'flimsy', 'poor'],
          developNote: 'State it as a comparison: landscaped greenery and concrete, WHEREAS informal housing is closely packed with scavenged materials.',
        },
      ],
    },
    modelAnswer:
      'One difference is that formal housing is planned, consisting of high-rise blocks built by the government or private developers, whereas informal housing in the figure is irregular and haphazard, made up of self-built dwellings. A second difference is that the formal housing has landscaped greenery and organised common space, with high-quality materials such as concrete, whereas the informal housing is closely packed with little open space and is built from poor, scavenged materials such as zinc sheets.',
  },
  {
    id: 'sa-housing-location', topic: 'housing', type: 'short', marks: 4,
    prompt: 'Explain two factors that influence where different types of housing are located in cities.',
    marking: {
      kind: 'options', marks: 4, perOption: 2, maxOptions: 2,
      options: [
        {
          id: 'zoning', label: 'Land-use planning and zoning',
          identify: ['zon', 'land-use', 'land use', 'planning', 'master plan'],
          develop: ['jurong', 'commercial', 'residential', 'industrial', 'designat', 'west', 'east'],
          developNote: 'Develop it with the Jurong example: commercial uses in the west and south, residential in the east and north.',
        },
        {
          id: 'prices', label: 'Land prices',
          identify: ['land price', 'land cost', 'price of land', 'expensive land', 'property price', 'cost of land'],
          develop: ['city centre', 'central', 'downtown', 'cbd', 'unafford', 'cannot afford', 'informal', 'squatter', 'slum'],
          developNote: 'Develop it: land is dearer towards the city centre, so where formal housing is unaffordable, informal housing appears instead.',
        },
        {
          id: 'developer', label: 'Type of developer',
          identify: ['developer', 'private sector', 'public sector'],
          develop: ['profit', 'commercial', 'viable', 'need', 'needs-driven', 'subsidis'],
          developNote: 'Develop it: private developers are profit-driven and choose commercially viable sites, public developers are needs-driven.',
        },
        {
          id: 'subsidies', label: 'Housing subsidies',
          identify: ['subsid'],
          develop: ['lower', 'reduce', 'cheaper', 'afford', 'shortage', 'informal', 'settlement'],
          developNote: 'Develop it: subsidies lower building costs and prevent shortages; without them, more informal settlements appear.',
        },
      ],
    },
    modelAnswer:
      'One factor is land-use planning and zoning. Governments designate land for particular uses, so in Jurong commercial activity is concentrated in the west and south while residential areas are in the east and north. A second factor is land prices. Land is more expensive in the city centre, so lower-income residents cannot afford formal housing there and informal housing springs up instead.',
  },
  {
    id: 'sa-housing-impacts', topic: 'housing', type: 'short', marks: 5,
    prompt: 'Using one place-based example for each, explain (a) one negative impact of housing on the natural environment and (b) one negative impact on people. Which do you think is more serious?',
    marking: {
      kind: 'points', marks: 5,
      points: [
        { id: 'a1', label: 'A negative environmental impact of housing is identified.', all: [['pollut', 'deforest', 'waste', 'erosion', 'habitat', 'resource'], ['water', 'air', 'soil', 'forest', 'land', 'river', 'landfill']] },
        { id: 'a2', label: 'Environmental impact supported with a place-based example (e.g. River Ciliwung, Jakarta; Semakau, Singapore; Chennai).', all: [['ciliwung', 'jakarta', 'semakau', 'singapore', 'chennai', 'wwf']] },
        { id: 'b1', label: 'A negative impact on people is identified.', all: [['health', 'death', 'die', 'disease', 'quality of life', 'evict', 'tension', 'living condition']] },
        { id: 'b2', label: 'Impact on people supported with a place-based example (e.g. Nairobi under-5 death rate 2.5x; Dhaka evictions 2012).', all: [['nairobi', 'kenya', 'dhaka', 'bangladesh', 'kibera']] },
        { id: 'j1', label: 'A reasoned judgement on which is more serious (either direction is acceptable if justified).', all: [['more serious', 'most serious', 'i think', 'in my opinion', 'i believe', 'more significant', 'worse'], ['because', 'since', 'as it', 'therefore', 'this is']] },
      ],
    },
    modelAnswer:
      'One negative impact of housing on the natural environment is water pollution. In Jakarta, untreated sewage from slums along the River Ciliwung is discharged directly into it, making it the longest and most polluted river there and killing aquatic life. One negative impact on people is poor living conditions. In Nairobi, Kenya, the under-5 death rate is 2.5 times higher in slums than elsewhere in the city, because residents lack clean water and sanitation. I consider the impact on people more serious, because a child death is irreversible whereas a polluted river can be cleaned over time with investment.',
  },
  {
    id: 'sa-eoy-q1a', topic: 'population', type: 'short', marks: 3, source: 'EOY 2025 Q1',
    prompt: 'State the demographic challenge Singapore is facing and explain how it affects Singapore.',
    marking: {
      kind: 'points', marks: 3,
      points: [
        { id: 'p1', label: 'Ageing population correctly identified (rising median age, more people aged 65+).', all: [['ageing', 'aging', 'older', 'elderly', 'greying'], ['population', 'median age', '65', 'society']] },
        { id: 'p2', label: 'An economic effect explained, e.g. labour shortage, rising labour costs, higher healthcare and social spending, higher taxes.', all: [['labour', 'workforce', 'worker', 'tax', 'healthcare', 'spending', 'cost', 'growth'], ['shortage', 'shrink', 'fewer', 'rise', 'increas', 'higher', 'strain', 'burden']] },
        { id: 'p3', label: 'The effect is linked back to Singapore specifically, or the dependency ratio is used.', all: [['singapore', 'dependency ratio', 'dependency', 'working population', 'working-age']] },
      ],
    },
    modelAnswer:
      'Singapore is facing an ageing population, meaning its median age is rising as life expectancy lengthens while the birth rate falls. This raises the dependency ratio, so a shrinking working-age population must support more elderly dependants. That creates a labour shortage that makes it harder for Singapore to sustain economic growth, and it forces taxes up to fund rising healthcare and social spending.',
  },
  {
    id: 'sa-eoy-q1b', topic: 'population', type: 'short', marks: 4, source: 'EOY 2025 Q1',
    prompt: 'With specific examples, explain how governments can manage this demographic issue.',
    marking: {
      kind: 'options', marks: 4, perOption: 2, maxOptions: 2,
      options: [
        {
          id: 'retire', label: 'Raising the retirement age',
          identify: ['retirement age', 'retire later', 'work longer'],
          develop: ['65', '2030', 'workforce', 'labour force', 'experienc', 'labour shortage'],
          developNote: 'Add the figure and the mechanism: progressively to 65 by 2030, keeping experienced workers in the labour force.',
        },
        {
          id: 'natal', label: 'Pro-natal policy',
          identify: ['baby bonus', 'pro-natal', 'pronatal', 'pro natal', 'cash incentive', 'baby grant'],
          develop: ['11,000', '11000', '13,000', '13000', 'birth rate', 'fertility', 'cost of raising', 'offset'],
          developNote: 'Add the figures and the mechanism: $11,000 for the 1st and 2nd child, $13,000 thereafter, offsetting the cost of raising a child.',
        },
        {
          id: 'migration', label: 'Migration policy',
          identify: ['migration', 'immigra', 'foreign talent', 'foreign worker', 'foreigners'],
          develop: ['1990s', 'university', 'semi-skilled', 'lower-skilled', 'domestic worker', 'construction', 'workforce', 'labour force'],
          developNote: 'Add the two categories: "foreign talent" (university-qualified, higher-paid sectors) and "foreign worker" (semi-skilled, e.g. construction), encouraged since the 1990s.',
        },
        {
          id: 'active', label: 'Active ageing programmes',
          identify: ['active ageing', 'active aging', 'aac', 'senior activit', 'aap'],
          develop: ['154', '2023', 'healthy', 'independen', 'social', 'engag', 'healthcare cost'],
          developNote: 'Add the figure and the mechanism: 154 Active Ageing Centres as of 2023, keeping seniors healthy and socially engaged.',
        },
      ],
    },
    modelAnswer:
      'One strategy is raising the retirement age. Singapore is raising it progressively to 65 by 2030, which keeps experienced workers in the labour force for longer and offsets the labour shortage. A second strategy is pro-natal policy. The Baby Bonus gives $11,000 in cash for the first and second child and $13,000 for each subsequent child, which offsets the high cost of raising a child in Singapore and encourages couples to have more children, raising the birth rate over the long run.',
  },
  {
    id: 'sa-eoy-q2b', topic: 'housing', type: 'short', marks: 4, source: 'EOY 2025 Q2',
    prompt: 'Explain how the presence of slums can hinder the sustainable development of countries.',
    marking: {
      kind: 'points', marks: 4,
      points: [
        { id: 'q1', label: 'One way identified with a feature of slums (e.g. no sanitation, poor materials, untreated sewage, firewood cooking).', all: [['sanitation', 'sewage', 'waste', 'water', 'firewood', 'material', 'overcrowd', 'no legal', 'illegal']] },
        { id: 'q2', label: 'A consequence chain is shown, not just a description (feature leads to a specific outcome).', all: [['because', 'so that', 'this leads', 'leads to', 'causes', 'resulting', 'as a result', 'therefore', 'which means', 'so']] },
        { id: 'q3', label: 'Explicitly linked to sustainable development (environmental, social or economic pillar).', all: [['sustainab', 'future generation', 'long term', 'long-term'], ['environment', 'social', 'econom', 'development', 'resource']] },
        { id: 'q4', label: 'Supported with a place-based example (Nairobi, Jakarta, Chennai, Dhaka, Mumbai, Rio).', all: [['nairobi', 'kenya', 'jakarta', 'ciliwung', 'chennai', 'dhaka', 'mumbai', 'dharavi', 'rio', 'rocinha', 'kibera']] },
      ],
    },
    modelAnswer:
      'Slums hinder environmental sustainability because they lack basic services, so sanitary waste is disposed of illegally. In Jakarta, untreated sewage from slums along the River Ciliwung has made it the most polluted river there, degrading a water resource that future generations will need. Slums also hinder social sustainability: in Nairobi the under-5 death rate is 2.5 times higher in slums than elsewhere in the city, so a large part of the population cannot reach the health and education outcomes that long-term development depends on.',
  },
  {
    id: 'sa-eoy-q3', topic: 'transport', type: 'short', marks: 4, source: 'EOY 2025 Q3',
    prompt: 'With reference to examples you have learnt, evaluate a policy or law on transport used to reduce the demand for private car ownership in cities.',
    marking: {
      kind: 'points', marks: 4, requiresEvaluation: true,
      points: [
        { id: 'e1', label: 'A relevant policy identified and explained (road pricing or vehicle quota system).', all: [['road pricing', 'congestion charg', 'congestion pricing', 'quota', 'coe', 'certificate of entitlement', 'erp']] },
        { id: 'e2', label: 'Supported with a specific place-based example and data (Stockholm 2017, traffic down 20%; COE 1990, 10-year right).', all: [['stockholm', 'singapore', '20%', '20 per cent', '1990', '2017', '318,000', '10-year', '10 year']] },
        { id: 'e3', label: 'A genuine strength stated (e.g. traffic reduced, revenue funds public transport).', all: [['advantage', 'strength', 'benefit', 'effective', 'success', 'works well'], ['reduc', 'fund', 'revenue', 'fell', 'decreas', 'discourag']] },
        { id: 'e4', label: 'A genuine limitation stated AND an explicit evaluation criterion used (scale of impact, affordability/equity, or availability of alternatives).', all: [['however', 'but', 'limitation', 'disadvantage', 'drawback', 'weakness'], ['equit', 'afford', 'fair', 'scale', 'cost', 'alternative', 'priced out', 'divert', 'discontent', 'low-income', 'poorer']] },
      ],
    },
    modelAnswer:
      "One policy is Singapore's vehicle quota system. The Certificate of Entitlement, introduced in 1990, caps annual car sales and requires bidding for a 10-year right to own a vehicle, which makes ownership very expensive and so directly suppresses demand. Its strength is that it works at national scale and the revenue raised funds public transport, so demand falls and the alternative improves at the same time. Judged on equity, however, it is weaker: households that need a car for work or for caring responsibilities can be priced out entirely, and because the price is set by bidding rather than by need, the burden falls hardest on lower-income buyers. Compared with road pricing in Stockholm, which cut traffic into the city centre by about 20% while charging only for the journeys people actually make, the COE is a blunter instrument.",
  },

  // =========================================================================
  // 9-MARK LDQ ESSAYS
  // =========================================================================
  {
    id: 'ldq-birthrate', topic: 'population', type: 'essay', marks: 9,
    prompt: 'To what extent do you agree that economic factors are the main causes of high birth rates in countries?',
    marking: {
      kind: 'essay', marks: 9,
      givenFactorLabel: 'Economic factors',
      factors: [
        { id: 'econ', label: 'Economic factors (farm labour, old-age insurance, cost of living)', terms: ['farm', 'labour', 'agricultur', 'old-age', 'old age', 'pension', 'insurance', 'cost of living', 'income', 'economic'] },
        { id: 'socio', label: 'Socio-cultural factors (religion, son preference, early marriage, education)', terms: ['religio', 'catholic', 'son preference', 'funeral pyre', 'early marriage', 'zodiac', 'tiger', 'family planning', 'education', 'culture', 'cultural', 'tradition'] },
      ],
      exampleTerms: ['vietnam', 'thailand', 'cambodia', 'mekong', 'china', 'philippines', 'india', 'niger', 'nigeria', 'burkina faso', 'singapore', 'japan'],
      criteriaTerms: ['scale', 'time', 'long term', 'long-term', 'cost', 'suitab', 'persist', 'develop'],
    },
    modelAnswer:
      "I agree only to a limited extent that economic factors are the main cause of high birth rates. Economic factors clearly matter. In rural Vietnam, Thailand and Cambodia, children are an extra pair of hands on the family farm, so a larger family directly raises household output and parents have more children. In the rural Mekong Delta there is no state pension, so children function as old-age insurance and couples have more of them to guarantee support in later life. These are real, measurable pressures on family size.\n\nHowever, socio-cultural factors are ultimately more powerful. In the Philippines, over 86% of the population is Catholic and the Church discourages artificial contraception, and the country has the highest birth rate in Southeast Asia. In India, sons are needed to light the funeral pyre, so couples continue having children until a son is born. In Niger, which has the world's highest TFR, early marriage extends the childbearing period well beyond that of Nigeria or Burkina Faso. None of these depends on the household's economic calculation.\n\nOn balance, socio-cultural factors are usually the more important reason, judged on persistence over time. Economic incentives to have children weaken as a country develops: mechanisation removes the need for farm labour and state pensions replace children as old-age insurance. Socio-cultural norms, by contrast, persist through economic development, which is why religious and gender-preference effects still hold birth rates high in countries whose incomes have risen. Economic factors therefore explain part of the picture, but socio-cultural factors explain why high birth rates endure.",
  },
  {
    id: 'ldq-deathrate', topic: 'population', type: 'essay', marks: 9,
    prompt: "To what extent do you agree that a country's standard of living is the main factor affecting its death rate?",
    marking: {
      kind: 'essay', marks: 9,
      givenFactorLabel: 'Standard of living',
      factors: [
        { id: 'living', label: 'Standard of living (sanitation, healthcare, vaccination, food access)', terms: ['standard of living', 'sanitation', 'hygiene', 'healthcare', 'health care', 'vaccin', 'food', 'nutrition', 'medical'] },
        { id: 'other', label: 'Other factors (disease and epidemics, war and conflict, natural disasters)', terms: ['disease', 'epidemic', 'pandemic', 'covid', 'war', 'conflict', 'genocide', 'disaster', 'tsunami', 'earthquake'] },
      ],
      exampleTerms: ['singapore', 'south sudan', 'united states', 'usa', 'us', 'cambodia', 'aceh', 'indonesia'],
      criteriaTerms: ['scale', 'time', 'long term', 'long-term', 'frequen', 'predictab', 'sustain', 'cost', 'suitab', 'duration'],
    },
    modelAnswer:
      "[No official answer key was supplied for this question. Use the birth-rate essay as your structural template and the death-rate factor table as your content source: standard of living (Singapore's death rate halving between 1989 and 2009; only 10% of South Sudan with safe sanitation) against event-driven factors (COVID-19 at 5.6% of US deaths in 2020-21; the Cambodian genocide killing about 25% of the population; the 2004 tsunami killing about 16,000 in Aceh, some 5% of that population). A strong conclusion would judge on duration and frequency: standard of living acts continuously on the whole population every year, whereas wars and disasters are severe but episodic.]",
    noOfficialKey: true,
  },
  {
    id: 'ldq-housing', topic: 'housing', type: 'essay', marks: 9,
    prompt: 'Integrated land-use planning is the most effective strategy for managing housing sustainably in cities. To what extent do you agree?',
    marking: {
      kind: 'essay', marks: 9,
      givenFactorLabel: 'Integrated land-use planning',
      factors: [
        { id: 'ilup', label: 'Integrated land-use planning (Tengah)', terms: ['integrated land', 'land-use planning', 'land use planning', 'tengah', 'self-contained', 'self contained', 'coordinat'] },
        { id: 'alt', label: 'An alternative strategy (slum upgrading, self-help schemes, inclusive public housing, environmental features)', terms: ['slum upgrad', 'upgrading', 'un-habitat', 'un habitat', 'nairobi', 'rocinha', 'self-help', 'self help', 'inclusive', 'solar', 'public housing'] },
      ],
      exampleTerms: ['tengah', 'singapore', 'nairobi', 'kenya', 'un-habitat', 'un habitat', 'rocinha', 'rio', 'kibera'],
      criteriaTerms: ['scale', 'time', 'long term', 'long-term', 'cost', 'suitab', 'city-wide', 'city wide', 'scope'],
    },
    modelAnswer:
      "I agree to a large extent that integrated land-use planning is the most effective strategy for managing housing sustainably.\n\nIntegrated land-use planning coordinates housing with amenities, transport and services from the outset. Tengah in Singapore was planned as a self-contained town, so residents can reach shops, schools and workplaces without long journeys. This reduces travel time and vehicle emissions, and because the infrastructure is designed alongside the housing rather than retrofitted, it is cheaper and less disruptive to provide. Its limitation is that it depends on multiple stakeholders agreeing: where landowners, developers and agencies pull in different directions, an integrated plan cannot be delivered at all.\n\nAn alternative is slum improvement through government-NGO partnership. The Kenyan government worked with UN-HABITAT on an upgrading project in Nairobi, temporarily relocating residents so that housing could be improved in place. This produces a greater improvement per site and manages resources efficiently, and it reaches people who are already living in unsafe housing rather than only future residents. Its limitation is affordability: some residents struggle to meet the costs of the upgraded housing and are effectively displaced by the improvement intended to help them.\n\nJudged on scale and time, integrated land-use planning is the more effective strategy. It operates city-wide and over decades, coordinating housing, transport, amenities and employment together, so it prevents unsustainable housing from forming in the first place. Slum upgrading is valuable and often more urgent, but it is narrower in scope, treating settlements one at a time after the problem has already appeared. Integrated planning is therefore more effective overall, though a city with existing slums needs both: planning for the future and upgrading for the present.",
  },
  {
    id: 'ldq-congestion', topic: 'transport', type: 'essay', marks: 9, source: 'EOY 2025',
    prompt: "'Stress on physical and mental health is the most serious consequence of traffic congestion.' How far do you agree? Explain.",
    marking: {
      kind: 'essay', marks: 9,
      givenFactorLabel: 'Health consequences (air and noise pollution)',
      factors: [
        { id: 'health', label: 'Health consequences: air pollution and noise pollution', terms: ['air pollution', 'emission', 'premature death', 'noise', 'db', 'decibel', 'sleep', 'stress', 'hearing', 'heart', 'mental health'] },
        { id: 'other', label: 'Other consequences: safety risk, lost productivity, economic cost', terms: ['accident', 'safety', 'road accident', 'productiv', 'econom', 'peso', 'lost opportunit', 'time', 'congestion cost'] },
      ],
      exampleTerms: ['uk', 'united kingdom', 'us', 'usa', 'united states', 'europe', 'manila', 'philippines', 'singapore', 'silver zone'],
      criteriaTerms: ['scale', 'duration', 'irreversib', 'number of people', 'reversib', 'permanent', 'long term', 'long-term', 'severity'],
    },
    modelAnswer:
      "I agree to a large extent, provided 'most serious' is judged by irreversibility rather than by cost.\n\nCongestion damages health directly. Vehicle emissions cause roughly 5,000 premature deaths a year in the UK and about 53,000 a year in the US, and a 2020 European Environment Agency report found 1 in 4 Europeans are exposed to noise above 55db against a WHO-recommended maximum of 53db, disturbing sleep and causing stress, hearing impairment and heart-related illness. These effects accumulate over years of daily exposure and fall on residents who do not themselves choose to drive.\n\nThe strongest competing consequence is lost productivity. A 2018 study found congestion in Manila cost 3.5 billion pesos a day in lost opportunities, expected to triple by 2030. Safety is a further consequence, since road accidents make up about 90% of all transport accidents worldwide.\n\nJudged on irreversibility, health is the most serious consequence. Economic losses from congestion are recoverable: Manila's 3.5 billion pesos a day can be recovered through road pricing, better public transport or flexible working hours, and the loss stops when the congestion does. A premature death or permanent hearing damage cannot be reversed by any later policy. If the criterion were instead the number of people affected, the economic argument would be stronger, since every road user loses time while only some suffer measurable health damage. On the criterion of permanence, however, health remains the most serious consequence.",
  },
  {
    id: 'ldq-housing-shortage', topic: 'housing', type: 'essay', marks: 9, source: 'EOY 2025',
    prompt: "'Integrated land-use planning is the best strategy for cities to manage housing shortages sustainably.' To what extent do you agree? Explain.",
    marking: {
      kind: 'essay', marks: 9,
      givenFactorLabel: 'Integrated land-use planning',
      factors: [
        { id: 'ilup', label: 'Integrated land-use planning (Tengah)', terms: ['integrated land', 'land-use planning', 'land use planning', 'tengah', 'self-contained', 'self contained', 'coordinat'] },
        { id: 'alt', label: 'An alternative: provision of public housing, or slum self-help schemes', terms: ['public housing', 'hdb', 'subsidis', 'subsidiz', 'self-help', 'self help', 'rocinha', 'upgrad', 'un-habitat', 'un habitat', 'nairobi'] },
      ],
      exampleTerms: ['tengah', 'singapore', 'rocinha', 'rio', 'nairobi', 'kenya', 'un-habitat', 'un habitat'],
      criteriaTerms: ['scale', 'time', 'long term', 'long-term', 'cost', 'suitab', 'speed', 'urgen', 'scope'],
    },
    modelAnswer:
      "Use the Tengah / Nairobi model essay as your template. For the 'against' case here, the strongest alternatives are the provision of subsidised public housing, which adds supply quickly and directly addresses a shortage, and slum self-help schemes such as the Rocinha Project in Rio de Janeiro, where electricity access rose from 30% to 75% at low construction cost but slowly, because residents could only build at weekends. A top-band conclusion picks one criterion and holds it: on speed, self-help and public housing provision beat integrated planning, since a shortage is an immediate problem and a new town takes decades; on scale and permanence, integrated planning wins, because it prevents the shortage from recurring rather than absorbing the current one.",
    guidanceOnly: true,
  },
];

export const questionsByTopic = (topicId) => QUESTIONS.filter((q) => q.topic === topicId);
export const questionById = (id) => QUESTIONS.find((q) => q.id === id);

// Exam paper structure, mirroring the EOY 2025 paper: 6 + 4 + 4 + 4 + 5 + 9 = 32 marks.
export const EXAM_PAPERS = [
  {
    id: 'eoy-2025',
    name: 'End-of-Year 2025 style paper',
    totalMarks: 32,
    questionIds: ['sa-sustainability', 'sa-sense-of-place', 'sa-formal-informal', 'sa-housing-location', 'sa-housing-impacts', 'ldq-housing-shortage'],
  },
  {
    id: 'mixed-paper',
    name: 'Mixed paper: all three topics',
    totalMarks: 32,
    questionIds: ['drq-shanghai', 'sa-eoy-q1a', 'sa-eoy-q1b', 'drq-indonesia', 'sa-eoy-q3', 'ldq-congestion'],
  },
  {
    id: 'population-housing',
    name: 'Population and Housing paper',
    totalMarks: 32,
    questionIds: ['drq-china-rural', 'sa-eoy-q1a', 'sa-eoy-q2b', 'sa-housing-location', 'sa-housing-impacts', 'ldq-birthrate'],
  },
];

export const EXAM_INSTRUCTIONS = [
  'Write in dark blue or black pen only.',
  'Answer all questions.',
  'Number your answers in the left margin.',
  'Leave 3 lines between answers.',
  'The number of marks is given in brackets [ ] at the end of each question.',
];
