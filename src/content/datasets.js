// ---------------------------------------------------------------------------
// DRQ DATASETS
//
// DATA INTEGRITY RULE FOR THIS FILE:
// Only values actually stated in the source paper / answer key are recorded.
// Years the source did not supply are stored as null and drawn as a dashed
// bridge on the chart, with a visible note. Nothing here is interpolated or
// invented to make a line look smoother. `approx: true` marks values the
// source itself gave as approximations ("around 840 million").
// ---------------------------------------------------------------------------

export const DATASETS = {
  englandHomeless: {
    id: 'englandHomeless',
    title: 'Unsheltered homeless people in England, 2010-2016',
    yLabel: 'Number of people',
    xLabel: 'Year',
    unit: 'people',
    source: 'Figures as given in the DRQ answer key.',
    series: [{
      name: 'England',
      points: [
        { x: 2010, y: 1750 }, { x: 2011, y: 2200 }, { x: 2012, y: 2200 },
        { x: 2013, y: null }, { x: 2014, y: 2750 }, { x: 2015, y: 3550 },
        { x: 2016, y: 4125 },
      ],
    }],
    missingNote: 'The source material does not supply a 2013 value, so that segment is shown dashed.',
  },

  laHomeless: {
    id: 'laHomeless',
    title: 'Homeless people in LA County, 2011-2019',
    yLabel: 'Number of people',
    xLabel: 'Year',
    unit: 'people',
    source: 'Figures as given in the DRQ answer key.',
    series: [{
      name: 'LA County',
      points: [
        { x: 2011, y: 39400 }, { x: 2012, y: 36540 }, { x: 2013, y: null },
        { x: 2014, y: null }, { x: 2015, y: null }, { x: 2016, y: 46240 },
        { x: 2017, y: 54780 }, { x: 2018, y: null }, { x: 2019, y: 58900 },
      ],
    }],
    missingNote: 'The source supplies 2011, 2012, 2016, 2017 and 2019 only. Gaps are shown dashed.',
  },

  shanghaiPopulation: {
    id: 'shanghaiPopulation',
    title: 'Population of Shanghai, 1980-2035 (2020 onwards projected)',
    yLabel: 'Population (millions)',
    xLabel: 'Year',
    unit: 'million',
    source: 'Figures as given in the DRQ stimulus and answer key.',
    projectedFrom: 2020,
    series: [{
      name: 'Shanghai',
      points: [
        { x: 1980, y: 5.93 }, { x: 1985, y: 7.1 }, { x: 1990, y: 8.61 },
        { x: 1995, y: 11.07 }, { x: 2000, y: 14.25 }, { x: 2005, y: 17.06 },
        { x: 2010, y: 20.31 }, { x: 2015, y: 23.48 },
        { x: 2020, y: 27.06, projected: true },
        { x: 2025, y: null }, { x: 2030, y: null },
        { x: 2035, y: 34.34, projected: true },
      ],
    }],
    missingNote: '2025 and 2030 values are not supplied by the source, so that stretch is dashed.',
  },

  chinaRural: {
    id: 'chinaRural',
    title: 'Rural population of China, 1950-2030',
    yLabel: 'Rural population (millions)',
    xLabel: 'Year',
    unit: 'million',
    source: 'Approximate values as read off Fig. 2 in the answer key.',
    approxAll: true,
    series: [{
      name: 'Rural China',
      points: [
        { x: 1950, y: 500, approx: true }, { x: 1965, y: 600, approx: true },
        { x: 1975, y: 750, approx: true }, { x: 1990, y: 840, approx: true },
        { x: 2010, y: null }, { x: 2030, y: 540, approx: true },
      ],
    }],
    missingNote: 'Only the values quoted in the answer key are plotted; all are approximate readings off the original graph.',
  },

  indonesiaSlums: {
    id: 'indonesiaSlums',
    title: 'Urban population living in slums, Indonesia, 1990-2025',
    yLabel: '% of urban population',
    xLabel: 'Year',
    unit: '%',
    source: 'Values as given in the answer key.',
    projectedFrom: 2025,
    series: [{
      name: 'Indonesia',
      points: [
        { x: 1990, y: 50 }, { x: 1995, y: null }, { x: 2000, y: null },
        { x: 2005, y: null }, { x: 2010, y: null },
        { x: 2015, y: 21, approx: true }, { x: 2020, y: 31 },
        { x: 2025, y: 31, projected: true },
      ],
    }],
    missingNote: 'The source gives 1990, 2015, 2020 and 2025 only. The 1990-2015 decline is shown dashed.',
  },

  slumsPanamaBelize: {
    id: 'slumsPanamaBelize',
    title: 'Urban population living in slums: Panama and Belize, 1995-2020',
    yLabel: '% of urban population',
    xLabel: 'Year',
    unit: '%',
    source: 'Values as given in the answer key; 2010 values are approximate.',
    series: [
      {
        name: 'Belize',
        points: [
          { x: 1995, y: 32.4 }, { x: 2000, y: 34.9 }, { x: 2005, y: 36.1 },
          { x: 2010, y: 27, approx: true }, { x: 2015, y: 16.7 }, { x: 2020, y: 16.7 },
        ],
      },
      {
        name: 'Panama',
        points: [
          { x: 1995, y: 30.8 }, { x: 2000, y: 31.4 }, { x: 2005, y: 33 },
          { x: 2010, y: 23.3, approx: true }, { x: 2015, y: 11.5 }, { x: 2020, y: 12.5 },
        ],
      },
    ],
  },
};

// The world under-5 figure is deliberately NOT charted. The source material
// describes its shape but supplies only three anchor values, so drawing a
// smooth line would mean inventing the rest. It is presented as a described
// stimulus instead.
export const DESCRIBED_STIMULI = {
  worldUnderFive: {
    id: 'worldUnderFive',
    title: 'Number of children under age 5 in the world, 1950-2100',
    note: 'The original figure is described here rather than redrawn, because the source supplies only these anchor points. Describe the trend from the description.',
    anchors: [
      'About 340 million children under 5 in 1950.',
      'A peak of about 560 million around 2015-2020.',
      'A projected decline from the peak through to 2100.',
    ],
    features: [
      'The rise is not smooth: there is a slight decrease in the late 1990s to early 2000s before it rises again.',
      'A further small fluctuation appears in the 2030s-2040s, a slight rise before the overall decline continues.',
    ],
  },
  tfrComparison: {
    id: 'tfrComparison',
    title: 'Total fertility rate: Singapore, East Asian societies and Nordic countries',
    note: 'Kept as a comparative discussion prompt. The original figure data could not be sourced, and inventing a dataset would defeat the purpose of a data-response question.',
    anchors: [
      "Singapore's TFR was 1.04 in 2022, a record low and far below the replacement level of 2.1.",
    ],
    features: [
      'Discuss why East Asian societies with similar socio-cultural pressures (later marriage, high cost of living, long working hours) tend to cluster at low TFRs.',
      'Discuss why Nordic countries, with extensive parental leave and childcare support, tend to sustain higher TFRs, and whether that is a fair comparison given different social norms.',
    ],
  },
};
