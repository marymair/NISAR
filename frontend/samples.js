/* Verified NASA story cards. These are curated references, NOT locally computed results.
 * Always cite NASA story URLs and avoid missing local images or invented metrics.
 */
const SAMPLES = [
  {
    id: 'venezuela', type: 'ground', lat: 10.55, lng: -66.9, zoom: 8,
    from: '2026-06-17', to: '2026-07-08',
    sourceUrl: 'https://science.nasa.gov/earth/earth-observatory/where-venezuelas-earthquakes-shifted-the-ground/',
    credit: 'NASA Earth Observatory / Lauren Dauphin; NISAR science team and Eric Fielding',
    title: {
      en: 'Venezuela — June 2026 earthquakes',
      ru: 'Венесуэла — землетрясения июня 2026',
      fr: 'Venezuela — séismes de juin 2026',
      es: 'Venezuela — terremotos de junio de 2026'
    },
    text: {
      en: 'NASA published a NISAR ground-displacement map after the June 24 earthquakes. Acquisitions on June 13 and 18 preceded the earthquakes; June 25 and 30 followed them. This is a curated NASA example, not a new on-demand displacement estimate.',
      ru: 'NASA опубликовало карту смещений после землетрясений 24 июня. Для неё использованы съёмки 13 и 18 июня до события, 25 и 30 июня — после. Это проверенный пример NASA, а не новая автоматическая оценка смещений.',
      fr: 'NASA a publié une carte de déplacement après les séismes du 24 juin à partir des scènes des 13, 18, 25 et 30 juin. Il s’agit d’une étude de référence, pas d’une nouvelle estimation automatique.',
      es: 'NASA publicó un mapa de desplazamiento después de los terremotos del 24 de junio utilizando escenas del 13, 18, 25 y 30 de junio. Es un estudio de referencia, no una nueva estimación automática.'
    }
  },
  {
    id: 'maize', type: 'forest', lat: -28.5, lng: 27.0, zoom: 8,
    from: '2025-11-22', to: '2026-03-10',
    sourceUrl: 'https://science.nasa.gov/earth/earth-observatory/painting-the-growing-season-in-the-maize-triangle/',
    credit: 'NASA Earth Observatory / Paul Siqueira (UMass Amherst), NISAR GCOV',
    title: {
      en: 'South Africa — the Maize Triangle',
      ru: 'ЮАР — «Кукурузный треугольник»',
      fr: 'Afrique du Sud — Triangle du maïs',
      es: 'Sudáfrica — Triángulo del maíz'
    },
    text: {
      en: 'An official NASA GCOV multi-pass composite illustrates vegetation, bare soil and how fields evolved during the 2025–2026 growing season. A scientific reference case rather than a newly computed classification.',
      ru: 'Официальный пример NASA: многовременной композит GCOV показывает растительность, открытые почвы и изменения полей в сезон 2025–2026. Это научный пример, а не автоматически построенная классификация.',
      fr: 'Composite GCOV officiel de la NASA sur la végétation, les sols nus et les changements agricoles de la saison 2025–2026.',
      es: 'Compuesto GCOV oficial de NASA sobre vegetación, suelo desnudo y cambios agrícolas durante la temporada 2025–2026.'
    }
  },
  {
    id: 'mozambique', type: 'flood', lat: -24.5, lng: 33.2, zoom: 8,
    from: '2025-12-25', to: '2026-02-01',
    sourceUrl: 'https://svs.gsfc.nasa.gov/5661/',
    credit: 'NASA Scientific Visualization Studio / Zoey N. Armstrong; NISAR GCOV',
    title: {
      en: 'Mozambique — January 2026 floods',
      ru: 'Мозамбик — наводнения января 2026',
      fr: 'Mozambique — inondations de janvier 2026',
      es: 'Mozambique — inundaciones de enero de 2026'
    },
    text: {
      en: 'NASA compared NISAR radar scenes from January 5 and 17 over the Limpopo and Incomati basins. The official before/after visualizations reveal flooding despite cloud cover. Follow the source link to view the real imagery.',
      ru: 'NASA сравнило радарные съёмки NISAR от 5 и 17 января вдоль рек Лимпопо и Инкомати. Официальное сравнение до/после показывает затопления сквозь облака. Открой источник для настоящих изображений.',
      fr: 'NASA compare les scènes radar NISAR des 5 et 17 janvier sur les bassins du Limpopo et de l’Incomati. Consultez la source pour les images authentiques.',
      es: 'NASA comparó escenas NISAR del 5 y 17 de enero en las cuencas del Limpopo y del Incomati. Abre la fuente para ver imágenes reales.'
    }
  }
];
