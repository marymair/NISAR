/* Verified source stories, but all visible science images MUST come from ZORI's
 * own precomputed ASF NISAR HDF5 output, locally packaged in /assets/cases/.
 * Reference source URLs are text links only: no external pictures are embedded.
 * Case-data.js adds actual processed images + measurements after the seed step.
 */
const SAMPLES = [
  {
    id: 'venezuela', type: 'ground', lat: 10.55, lng: -66.9, zoom: 8,
    analysisKind: 'gunw',
    event: {
      ru: '24 июня 2026 года два сильных землетрясения сотрясли север Венесуэлы, включая районы Каракаса и Ла-Гуайры.',
      en: 'On June 24, 2026, two powerful earthquakes struck northern Venezuela near Caracas and La Guaira.',
      it: 'Il 24 giugno 2026, due forti terremoti hanno colpito il nord del Venezuela.',
      fr: 'Le 24 juin 2026, deux violents séismes ont frappé le nord du Venezuela.',
      es: 'El 24 de junio de 2026, dos fuertes terremotos sacudieron el norte de Venezuela.'
    },
    cause: {
      ru: 'Причина: резкое смещение пород вдоль тектонических разломов. Интерферограмма NISAR показывает разницу радарной фазы, а не две фотографии смещения.',
      en: 'Cause: abrupt tectonic fault slip. NISAR interferometric phase is a derived pair result, not two photographs of displacement.',
      it: 'Causa: scorrimento lungo faglie tettoniche. La fase InSAR non è una coppia di fotografie.',
      fr: 'Cause : rupture le long de failles tectoniques. La phase InSAR n’est pas deux photos.',
      es: 'Causa: ruptura de fallas tectónicas. La fase InSAR no son dos fotografías.'
    },
    from: '2026-06-17', to: '2026-07-08',
    sourceUrl: 'https://science.nasa.gov/earth/earth-observatory/where-venezuelas-earthquakes-shifted-the-ground/',
    credit: 'NASA Earth Observatory / Lauren Dauphin; NISAR science team and Eric Fielding',
    title: {
      it: 'Venezuela — terremoti di giugno 2026',
      en: 'Venezuela — June 2026 earthquakes',
      ru: 'Венесуэла — землетрясения июня 2026',
      fr: 'Venezuela — séismes de juin 2026',
      es: 'Venezuela — terremotos de junio de 2026'
    },
    text: {
      it: 'La NASA ha pubblicato una mappa dello spostamento del terreno dopo i terremoti del 24 giugno. Le immagini prima e dopo mostrano la deformazione; la mappa ufficiale è un riferimento scientifico.',
      en: 'NASA published a NISAR ground-displacement map after the June 24 earthquakes. Acquisitions on June 13 and 18 preceded the earthquakes; June 25 and 30 followed them. This is a curated NASA example, not a new on-demand displacement estimate.',
      ru: 'NASA опубликовало карту смещений после землетрясений 24 июня. Для неё использованы съёмки 13 и 18 июня до события, 25 и 30 июня — после. Это проверенный пример NASA, а не новая автоматическая оценка смещений.',
      fr: 'NASA a publié une carte de déplacement après les séismes du 24 juin à partir des scènes des 13, 18, 25 et 30 juin. Il s’agit d’une étude de référence, pas d’une nouvelle estimation automatique.',
      es: 'NASA publicó un mapa de desplazamiento después de los terremotos del 24 de junio utilizando escenas del 13, 18, 25 y 30 de junio. Es un estudio de referencia, no una nueva estimación automática.'
    }
  },
  {
    id: 'maize', type: 'forest', lat: -28.5, lng: 27.0, zoom: 8,
    analysisKind: 'gcov',
    event: {
      ru: 'В сельскохозяйственном районе ЮАР поля менялись в течение посевного сезона 2025–2026 годов.',
      en: 'South Africa’s farm fields changed during the 2025–2026 growing season.',
      it: 'I campi agricoli sudafricani sono cambiati durante la stagione di crescita 2025–2026.',
      fr: 'Les champs sud-africains ont évolué pendant la saison agricole 2025–2026.',
      es: 'Los campos sudafricanos cambiaron durante la temporada de cultivo 2025–2026.'
    },
    cause: {
      ru: 'Возможные причины радарных изменений: рост и уборка растений, влажность почвы и сезонные условия. Без наземной проверки это не классификация урожая.',
      en: 'Potential radar-change drivers: crop growth and harvest, soil moisture and seasonal conditions; not a verified crop classification.',
      it: 'Possibili cause: crescita, raccolto, umidità del suolo e stagionalità; non una classificazione verificata.',
      fr: 'Causes possibles : croissance, récolte, humidité du sol et saisonnalité.',
      es: 'Causas posibles: crecimiento, cosecha, humedad del suelo y estación.'
    },
    from: '2025-11-22', to: '2026-03-10',
    sourceUrl: 'https://science.nasa.gov/earth/earth-observatory/painting-the-growing-season-in-the-maize-triangle/',
    credit: 'NASA Earth Observatory / Paul Siqueira (UMass Amherst), NISAR GCOV',
    title: {
      it: 'Sudafrica — Triangolo del mais',
      en: 'South Africa — the Maize Triangle',
      ru: 'ЮАР — «Кукурузный треугольник»',
      fr: 'Afrique du Sud — Triangle du maïs',
      es: 'Sudáfrica — Triángulo del maíz'
    },
    text: {
      it: 'Questo mosaico GCOV della NASA mostra campi, vegetazione e variazioni stagionali nel 2025–2026. È una visualizzazione scientifica pubblicata.',
      en: 'An official NASA GCOV multi-pass composite illustrates vegetation, bare soil and how fields evolved during the 2025–2026 growing season. A scientific reference case rather than a newly computed classification.',
      ru: 'Официальный пример NASA: многовременной композит GCOV показывает растительность, открытые почвы и изменения полей в сезон 2025–2026. Это научный пример, а не автоматически построенная классификация.',
      fr: 'Composite GCOV officiel de la NASA sur la végétation, les sols nus et les changements agricoles de la saison 2025–2026.',
      es: 'Compuesto GCOV oficial de NASA sobre vegetación, suelo desnudo y cambios agrícolas durante la temporada 2025–2026.'
    }
  },
  {
    id: 'mozambique', type: 'flood', lat: -24.5, lng: 33.2, zoom: 8,
    analysisKind: 'gcov',
    event: {
      ru: 'В январе 2026 года разливы рек Лимпопо и Инкомати вызвали масштабные затопления на юге Мозамбика.',
      en: 'In January 2026, overflowing Limpopo and Incomati rivers flooded southern Mozambique.',
      it: 'Nel gennaio 2026, la piena dei fiumi Limpopo e Incomati ha allagato il Mozambico meridionale.',
      fr: 'En janvier 2026, la crue du Limpopo et de l’Incomati a inondé le sud du Mozambique.',
      es: 'En enero de 2026, el desbordamiento del Limpopo y del Incomati inundó el sur de Mozambique.'
    },
    cause: {
      ru: 'Причина события — сильные дожди и выход рек из берегов. Изменения яркости радара могут также зависеть от влажности, растительности и геометрии съёмки.',
      en: 'Cause: heavy rainfall and river overflow. Radar brightness also depends on moisture, vegetation and viewing geometry.',
      it: 'Causa: forti piogge e fiumi in piena; il radar risente anche di umidità e vegetazione.',
      fr: 'Cause : fortes pluies et débordements des rivières. Le radar réagit aussi à l’humidité.',
      es: 'Causa: fuertes lluvias y desbordamiento de ríos; el radar también responde a humedad y vegetación.'
    },
    from: '2025-12-25', to: '2026-02-01',
    sourceUrl: 'https://svs.gsfc.nasa.gov/5661/',
    credit: 'NASA Scientific Visualization Studio / Zoey N. Armstrong; NISAR GCOV',
    title: {
      it: 'Mozambico — alluvioni di gennaio 2026',
      en: 'Mozambique — January 2026 floods',
      ru: 'Мозамбик — наводнения января 2026',
      fr: 'Mozambique — inondations de janvier 2026',
      es: 'Mozambique — inundaciones de enero de 2026'
    },
    text: {
      it: 'La NASA ha confrontato le immagini radar NISAR del 5 e 17 gennaio nel bacino del Limpopo e dell’Incomati, rivelando le inondazioni anche sotto le nuvole.',
      en: 'NASA compared NISAR radar scenes from January 5 and 17 over the Limpopo and Incomati basins. The official before/after visualizations reveal flooding despite cloud cover. Follow the source link to view the real imagery.',
      ru: 'NASA сравнило радарные съёмки NISAR от 5 и 17 января вдоль рек Лимпопо и Инкомати. Официальное сравнение до/после показывает затопления сквозь облака. Открой источник для настоящих изображений.',
      fr: 'NASA compare les scènes radar NISAR des 5 et 17 janvier sur les bassins du Limpopo et de l’Incomati. Consultez la source pour les images authentiques.',
      es: 'NASA comparó escenas NISAR del 5 y 17 de enero en las cuencas del Limpopo y del Incomati. Abre la fuente para ver imágenes reales.'
    }
  }
];
