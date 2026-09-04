// ---------------------------------------------------------------------------
// TOPIC 1 - POPULATION STUDIES
// Everything a student sees for this topic comes from this file.
// To add a card, a blank or a drag-and-drop set, append to the arrays below.
// ---------------------------------------------------------------------------

export const glossary = [
  { term: 'Birth rate', def: 'The number of live births per 1,000 people in a population per year.' },
  { term: 'Death rate', def: 'The number of deaths per 1,000 people in a population per year.' },
  { term: 'Natural increase', def: 'Birth rate minus death rate. It excludes migration.' },
  { term: 'Population growth', def: 'Natural increase + net migration.' },
  { term: 'Infant mortality rate (IMR)', def: 'The number of deaths of children under one year old per 1,000 live births per year.' },
  { term: 'Life expectancy', def: 'The average number of years a person is expected to live.' },
  { term: 'Replacement level', def: 'The total fertility rate needed to keep a population stable without migration: 2.1 children per woman.' },
  { term: 'Total fertility rate (TFR)', def: 'The average number of children a woman is expected to have in her lifetime.' },
  { term: 'Population density', def: 'The number of people living per unit area, e.g. persons per square kilometre.' },
  { term: 'Population distribution', def: 'How people are spread out across an area.' },
  { term: 'Dependency ratio', def: 'The ratio of dependants (aged 0-14 and 65+) to the working-age population (15-64).' },
  { term: 'Rural-urban migration', def: 'Internal movement of people from rural areas to cities, usually for jobs or education.' },
];

export const flashcards = [
  // --- Core definitions ---
  { id: 'p-f1', front: 'Population growth = ?', back: 'Natural increase + net migration. Natural increase is birth rate minus death rate; net migration is immigration minus emigration.' },
  { id: 'p-f2', front: 'What is the replacement level TFR, and why does it matter?', back: '2.1 children per woman. Below this, a population shrinks over time without migration, because not every child survives to reproduce.' },
  { id: 'p-f3', front: 'Dependency ratio: which age bands?', back: 'Dependants = 0-14 and 65+. Working population = 15-64. A high ratio means fewer workers supporting more dependants.' },
  { id: 'p-f4', front: 'Population density vs population distribution', back: 'Density = number of people per unit area (e.g. persons/km2). Distribution = how people are spread out across an area.' },
  { id: 'p-f5', front: 'Infant mortality rate - definition and why it links to TFR', back: 'Deaths of children under one year per 1,000 live births per year. Where IMR is high, e.g. Sub-Saharan Africa, families have more children to replace those who die, so TFR is also high.' },

  // --- City vs rural, sustainable cities ---
  { id: 'p-f6', front: 'Four characteristics of a city (vs a rural area)', back: 'Large population; high population density; mostly built-up land; a wide range of functions. Rural areas are sparsely populated and focused on agriculture.' },
  { id: 'p-f7', front: 'How are cities and rural areas interdependent?', back: 'Cities provide services rural areas need: hospitals, education, governance. Rural areas provide the food cities cannot grow for themselves.' },
  { id: 'p-f8', front: 'What is a sustainable city?', back: 'A city that meets present needs (housing, transport, jobs, education) while safeguarding future generations by protecting the environment and conserving resources.' },
  { id: 'p-f9', front: 'Which framework sets out sustainable city goals, and when?', back: 'The UN Sustainable Development Goals, adopted in 2015 as part of the 2030 Agenda, with the principle "leave no one behind".' },
  { id: 'p-f10', front: 'What is "peak child"? (Hans Rosling)', back: 'The point at which the number of children in the world stops growing. Per UN data the world passed peak child in 2017: the number of children has plateaued, so future growth comes from people living longer, not from more children.' },

  // --- Population issues comparison ---
  { id: 'p-f11', front: 'Overpopulation - definition, cause, typical location', back: 'Population is too large for the resources available. Caused by high natural increase. Typically found in less developed countries (LDCs).' },
  { id: 'p-f12', front: 'Underpopulation - definition, cause, typical location', back: 'Population is too small to fully utilise the resources available. Caused by low natural increase combined with negative net migration. Typically found in developed countries.' },
  { id: 'p-f13', front: 'Ageing population - definition, cause, typical location', back: 'The median age of the population is rising. Caused by a combination of longer life expectancy and a lower birth rate. Typically found in developed countries.' },

  // --- Birth rate: socio-cultural increasing ---
  { id: 'p-f14', front: 'Socio-cultural factor: children as a status or wealth symbol', back: 'Large families were historically a symbol of status and wealth, seen in the large families of historical Asian tycoons. More children signalled the ability to support them.' },
  { id: 'p-f15', front: 'Socio-cultural factor: replacing children who died', back: 'Where infant mortality is high, parents have more children so that some survive. In Sub-Saharan Africa, a high IMR correlates with a high TFR.' },
  { id: 'p-f16', front: 'Religious beliefs and birth rate - which country?', back: 'The Philippines: over 86% Catholic, and the Catholic Church discourages artificial contraception. It has the highest birth rate in Southeast Asia.' },
  { id: 'p-f17', front: 'Son preference and birth rate - which country and why?', back: 'India. Sons are needed to light the funeral pyre in Hindu tradition, so couples keep having children until they have a son, raising the birth rate.' },
  { id: 'p-f18', front: 'Lack of family planning education - which country and evidence?', back: 'Nigeria. Avogo and Somefun (2019) found that educated women have fewer children, so where family planning education is lacking, birth rates stay high.' },
  { id: 'p-f19', front: 'Cultural or zodiac beliefs and birth rate - Singapore example', back: 'Singapore recorded a TFR of 1.04 in 2022, a record low, partly attributed to it being a Tiger year in the Chinese zodiac, a year some couples avoid having children.' },
  { id: 'p-f20', front: 'Early marriage and birth rate - which country?', back: 'Niger has the world highest TFR. Early marriage gives women more childbearing years than in Nigeria or Burkina Faso, so more children are born per woman.' },

  // --- Birth rate: socio-cultural decreasing ---
  { id: 'p-f21', front: 'Later and fewer marriages - Japan evidence', back: 'The number of marriages in Japan fell to a post-war low in 2018. Fewer and later marriages shorten the childbearing period and lower the birth rate.' },
  { id: 'p-f22', front: 'Later marriage - Singapore evidence (2018)', back: 'In 2018 the median age at first marriage in Singapore was 30.2 for grooms and 28.5 for brides. Marrying later leaves fewer childbearing years.' },
  { id: 'p-f23', front: 'Preference for smaller families - Singapore', back: 'The DINK trend (double income, no kids) and a general preference for smaller families: most Singaporean families now have between 0 and 2 children.' },

  // --- Birth rate: economic ---
  { id: 'p-f24', front: 'Economic factor increasing birth rate: need for farm labour', back: 'In rural Vietnam, Thailand, Cambodia and China, children are an extra pair of hands on the family farm, so larger families raise household output.' },
  { id: 'p-f25', front: 'Economic factor increasing birth rate: old-age insurance', back: 'In the rural Mekong Delta, there is no state pension, so parents have more children to support them in old age. Children are the retirement plan.' },
  { id: 'p-f26', front: 'Economic factor decreasing birth rate: cost of living', back: 'Raising one child in Singapore was estimated at about $670,000 in 2019, so couples have fewer children than they might otherwise want.' },

  // --- Death rate ---
  { id: 'p-f27', front: 'Better standard of living lowers death rate - Singapore evidence', back: 'Singapore death rate halved between 1989 and 2009, through improved hygiene and sanitation, vaccination programmes, better healthcare and reliable food access.' },
  { id: 'p-f28', front: 'Poor standard of living raises death rate - which country?', back: 'South Sudan, where only 10% of the population has access to safe sanitation, so waterborne disease spreads and the death rate stays high.' },
  { id: 'p-f29', front: 'Diseases and epidemics raise death rate - evidence', back: 'COVID-19 accounted for 5.6% of all deaths in the United States over 2020-2021.' },
  { id: 'p-f30', front: 'War and conflict raise death rate - which case study?', back: 'The Cambodian genocide, 1975-79: between 1.5 and 3 million people were killed, roughly 25% of the population.' },
  { id: 'p-f31', front: 'Natural disasters raise death rate - which case study?', back: 'The 2004 Indian Ocean Tsunami killed about 230,000 people in total. In Aceh, Indonesia, about 16,000 died, roughly 5% of the local population.' },

  // --- Migration ---
  { id: 'p-f32', front: 'Push vs pull: economic opportunity', back: 'Push: low pay and few jobs in the origin. Pull: better pay and more jobs in the destination.' },
  { id: 'p-f33', front: 'Push vs pull: standard of living / quality of life', back: 'Push: poor quality of life, social strife, lack of services. Pull: good quality of life, a tolerant society, better services.' },
  { id: 'p-f34', front: 'Push vs pull: environmental conditions', back: 'Push: disaster-prone areas and undesirable climate. Pull: a safe physical environment.' },
  { id: 'p-f35', front: 'Push vs pull: political issues', back: 'Push: unstable government and the threat of war. Pull: peace and political stability.' },

  // --- Ageing: impacts ---
  { id: 'p-f36', front: 'Ageing population - economic impact: underused facilities', back: 'Facilities built for young dependants become underused. Schools may have to shut or become costly to maintain as enrolment falls.' },
  { id: 'p-f37', front: 'Ageing population - economic impact: labour shortage', back: 'A shrinking workforce makes it harder to maintain living standards, develop resources and achieve economic growth, and it pushes labour costs up.' },
  { id: 'p-f38', front: 'Ageing population - economic impact: investment', back: 'The country becomes less attractive to investors, who may perceive an older workforce as less innovative.' },
  { id: 'p-f39', front: 'Ageing population - economic impact: government spending', back: 'Taxes must rise to maintain government services, while healthcare and social spending increase because elderly people are more prone to health problems.' },
  { id: 'p-f40', front: 'Ageing population - social impact', back: 'The working population is strained by higher taxes needed to support a growing elderly population.' },

  // --- Ageing: strategies ---
  { id: 'p-f41', front: 'Ageing strategy: raising the retirement age - Singapore', back: 'Singapore is raising the retirement age progressively to 65 by 2030, keeping experienced workers in the labour force for longer.' },
  { id: 'p-f42', front: 'Ageing strategy: pro-natal policy - Singapore Baby Bonus', back: 'The Baby Bonus gives $11,000 in cash for the 1st and 2nd child and $13,000 for each subsequent child, offsetting the cost of raising children.' },
  { id: 'p-f43', front: 'Ageing strategy: migration - Singapore categories', back: 'Since the 1990s Singapore has encouraged inflows in two categories: "foreign talent" (university-qualified, higher-paid sectors) and "foreign worker" (semi-skilled or lower-skilled, e.g. domestic workers and construction workers).' },
  { id: 'p-f44', front: 'Ageing strategy: active ageing - Singapore evidence', back: 'Active Ageing Centres (AACs) and Active Ageing Programmes (AAPs) keep seniors healthy and socially engaged. There were 154 AACs as of 2023.' },

  // --- Supplementary (student-sourced) ---
  { id: 'p-f45', front: 'Legal restriction on family size - two examples', back: 'China One Child Policy, and Singapore historical "Stop at Two" policy. Both capped family size to slow population growth. [Student-sourced supplementary material]', supplementary: true },
  { id: 'p-f46', front: 'Family planning education campaign - example', back: 'India "Hum Do, Hamare Do" ("We two, our two") campaign, alongside subsidised contraceptive access; Bangladesh ran similar family planning programmes. [Student-sourced supplementary material]', supplementary: true },
];

export const fillBlanks = [
  { id: 'p-b1', text: "Singapore's total fertility rate fell to a record low of ___ in ___, partly attributed to it being a Tiger year.", blanks: [{ answers: ['1.04'], hint: '2 decimal places' }, { answers: ['2022'], hint: 'a year' }] },
  { id: 'p-b2', text: 'The replacement level total fertility rate is ___ children per woman.', blanks: [{ answers: ['2.1'], hint: '1 decimal place' }] },
  { id: 'p-b3', text: 'Over ___% of the population of the ___ is Catholic, and it has the highest birth rate in Southeast Asia.', blanks: [{ answers: ['86', '86%'], hint: 'a percentage' }, { answers: ['philippines', 'the philippines'], hint: 'a country' }] },
  { id: 'p-b4', text: 'Raising one child in Singapore was estimated to cost about $___ in ___.', blanks: [{ answers: ['670,000', '670000'], hint: 'six figures' }, { answers: ['2019'], hint: 'a year' }] },
  { id: 'p-b5', text: "Singapore's death rate halved between ___ and ___ because of a better standard of living.", blanks: [{ answers: ['1989'], hint: 'a year' }, { answers: ['2009'], hint: 'a year' }] },
  { id: 'p-b6', text: 'In South Sudan, only ___% of the population has access to safe sanitation, keeping the death rate high.', blanks: [{ answers: ['10', '10%'], hint: 'a percentage' }] },
  { id: 'p-b7', text: 'COVID-19 accounted for ___% of all deaths in the United States over 2020-2021.', blanks: [{ answers: ['5.6', '5.6%'], hint: '1 decimal place' }] },
  { id: 'p-b8', text: 'The Cambodian genocide of ___-___ killed between 1.5 and ___ million people, about 25% of the population.', blanks: [{ answers: ['1975'], hint: 'start year' }, { answers: ['79', '1979'], hint: 'end year' }, { answers: ['3'], hint: 'a whole number' }] },
  { id: 'p-b9', text: 'The 2004 Indian Ocean Tsunami killed roughly ___ people in total, including about 16,000 in ___, Indonesia.', blanks: [{ answers: ['230,000', '230000'], hint: 'six figures' }, { answers: ['aceh'], hint: 'a province' }] },
  { id: 'p-b10', text: "Singapore's Baby Bonus gives $___ for the first and second child and $___ for each subsequent child.", blanks: [{ answers: ['11,000', '11000'], hint: 'five figures' }, { answers: ['13,000', '13000'], hint: 'five figures' }] },
  { id: 'p-b11', text: 'Singapore is raising the retirement age progressively to ___ by ___.', blanks: [{ answers: ['65'], hint: 'an age' }, { answers: ['2030'], hint: 'a year' }] },
  { id: 'p-b12', text: 'As of ___ there were ___ Active Ageing Centres in Singapore.', blanks: [{ answers: ['2023'], hint: 'a year' }, { answers: ['154'], hint: 'three figures' }] },
  { id: 'p-b13', text: 'In 2018 the median age at first marriage in Singapore was ___ for grooms and ___ for brides.', blanks: [{ answers: ['30.2'], hint: '1 decimal place' }, { answers: ['28.5'], hint: '1 decimal place' }] },
  { id: 'p-b14', text: 'According to UN data, the world passed "peak child" in ___, the point at which the number of children stopped growing.', blanks: [{ answers: ['2017'], hint: 'a year' }] },
  { id: 'p-b15', text: 'The UN Sustainable Development Goals were adopted in ___ as part of the ___ Agenda, under the principle "leave no one behind".', blanks: [{ answers: ['2015'], hint: 'a year' }, { answers: ['2030'], hint: 'a year' }] },
  { id: 'p-b16', text: '___ has the world highest total fertility rate, partly because early marriage gives women more childbearing years.', blanks: [{ answers: ['niger'], hint: 'a West African country' }] },
  { id: 'p-b17', text: 'Avogo and Somefun (___) found that educated women in ___ have fewer children.', blanks: [{ answers: ['2019'], hint: 'a year' }, { answers: ['nigeria'], hint: 'a country' }] },
  { id: 'p-b18', text: 'Population growth = ___ increase + net ___.', blanks: [{ answers: ['natural'], hint: 'one word' }, { answers: ['migration'], hint: 'one word' }] },
  { id: 'p-b19', text: 'The dependency ratio compares people aged 0-___ and ___+ to the working population aged 15-64.', blanks: [{ answers: ['14'], hint: 'a number' }, { answers: ['65'], hint: 'a number' }] },
];

export const dragDrop = [
  {
    id: 'p-d1', type: 'match', title: 'Concept to definition',
    prompt: 'Drag each definition onto the matching concept.',
    pairs: [
      { left: 'Birth rate', right: 'Live births per 1,000 people per year' },
      { left: 'Death rate', right: 'Deaths per 1,000 people per year' },
      { left: 'Natural increase', right: 'Birth rate minus death rate' },
      { left: 'Dependency ratio', right: 'Dependants (0-14 and 65+) compared with the working population (15-64)' },
      { left: 'Total fertility rate', right: 'Average number of children a woman is expected to have' },
      { left: 'Infant mortality rate', right: 'Deaths under age one per 1,000 live births per year' },
    ],
  },
  {
    id: 'p-d2', type: 'match', title: 'Case study to place',
    prompt: 'Match each piece of evidence to the place it belongs to.',
    pairs: [
      { left: 'Over 86% Catholic, highest birth rate in SEA', right: 'Philippines' },
      { left: 'Sons needed to light the funeral pyre', right: 'India' },
      { left: 'World highest TFR, early marriage', right: 'Niger' },
      { left: 'Only 10% have access to safe sanitation', right: 'South Sudan' },
      { left: 'Genocide 1975-79, about 25% of population killed', right: 'Cambodia' },
      { left: 'About 16,000 tsunami deaths, roughly 5% of the population', right: 'Aceh, Indonesia' },
      { left: 'Baby Bonus of $11,000 for a first child', right: 'Singapore' },
      { left: 'Old-age insurance drives larger rural families', right: 'Mekong Delta, Vietnam' },
    ],
  },
  {
    id: 'p-d3', type: 'categorise', title: 'Socio-cultural vs economic birth-rate factors',
    prompt: 'Sort each factor into the correct column.',
    categories: [{ id: 'socio', label: 'Socio-cultural' }, { id: 'econ', label: 'Economic' }],
    items: [
      { text: 'Religious beliefs discourage contraception (Philippines)', category: 'socio' },
      { text: 'Son preference (India)', category: 'socio' },
      { text: 'Early marriage lengthens childbearing years (Niger)', category: 'socio' },
      { text: 'Zodiac beliefs, e.g. a Tiger year (Singapore, 2022)', category: 'socio' },
      { text: 'Lack of family planning education (Nigeria)', category: 'socio' },
      { text: 'Later and fewer marriages (Japan, 2018)', category: 'socio' },
      { text: 'Children needed as farm labour (rural Vietnam and Cambodia)', category: 'econ' },
      { text: 'Children as old-age insurance (rural Mekong Delta)', category: 'econ' },
      { text: 'High cost of raising a child, about $670,000 (Singapore)', category: 'econ' },
    ],
  },
  {
    id: 'p-d4', type: 'categorise', title: 'Push vs pull migration factors',
    prompt: 'Decide whether each factor pushes people out or pulls people in.',
    categories: [{ id: 'push', label: 'Push (origin)' }, { id: 'pull', label: 'Pull (destination)' }],
    items: [
      { text: 'Low pay and few jobs', category: 'push' },
      { text: 'Better pay and more jobs', category: 'pull' },
      { text: 'Poor quality of life and lack of services', category: 'push' },
      { text: 'Tolerant society and better services', category: 'pull' },
      { text: 'Disaster-prone area or undesirable climate', category: 'push' },
      { text: 'Safe physical environment', category: 'pull' },
      { text: 'Unstable government and threat of war', category: 'push' },
      { text: 'Peace and political stability', category: 'pull' },
    ],
  },
  {
    id: 'p-d5', type: 'categorise', title: 'Overpopulation, underpopulation or ageing?',
    prompt: 'Sort each description into the correct population issue.',
    categories: [
      { id: 'over', label: 'Overpopulation' },
      { id: 'under', label: 'Underpopulation' },
      { id: 'ageing', label: 'Ageing population' },
    ],
    items: [
      { text: 'Population too large for the resources available', category: 'over' },
      { text: 'Caused by high natural increase', category: 'over' },
      { text: 'Typically found in LDCs', category: 'over' },
      { text: 'Population too small to utilise the resources available', category: 'under' },
      { text: 'Low natural increase plus negative net migration', category: 'under' },
      { text: 'Median age of the population is rising', category: 'ageing' },
      { text: 'Longer life expectancy combined with a lower birth rate', category: 'ageing' },
    ],
  },
  {
    id: 'p-d6', type: 'sequence', title: 'Order the demographic chain',
    prompt: 'Put the steps in order, from cause to national consequence.',
    items: [
      'Standard of living improves and healthcare gets better',
      'Life expectancy rises while the birth rate falls',
      'The median age of the population rises',
      'The dependency ratio increases',
      'The government faces higher healthcare and social spending',
    ],
  },
];
