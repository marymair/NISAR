/* ============ samples.js — ready-made "Explore a sample" cases ============
   type:    'flood' | 'forest' | 'ground'
   image:   one picture (put the file into the img/ folder)
   before/after (optional): two pictures -> before/after slider with "difference" view
   overlay (optional): { url:'img/flood_change.png', coordinates:[[lon,lat] TL, TR, BR, BL] }
                       -> your own change map drawn on top of the globe (made by make_overlay.py)
*/
const SAMPLES = [
  {
    id: 'venezuela', type: 'ground', lat: 10.55, lng: -66.9, zoom: 8,
    image: 'img/venezuela.jpg',
    credit: 'NASA Earth Observatory / Lauren Dauphin, from NISAR data (June 13 and 18 before, June 25 and 30 after the quakes)',
    title: {
      en: 'Venezuela earthquakes, June 2026', ru: 'Землетрясения в Венесуэле, июнь 2026',
      es: 'Terremotos en Venezuela, junio de 2026', fr: 'Séismes au Venezuela, juin 2026'
    },
    text: {
      en: 'Two earthquakes hit on June 24, 2026. Radar passes before and after were compared, and the colored fringes show how far the ground shifted, especially near Caracas and La Guaira.',
      ru: '24 июня 2026 года произошли два землетрясения. Сравнили радарные пролёты до и после: цветные полосы показывают, насколько сдвинулась земля, особенно рядом с Каракасом и Ла-Гуайрой.',
      es: 'Dos terremotos ocurrieron el 24 de junio de 2026. Se compararon pasadas de radar antes y después; las franjas de colores muestran cuánto se movió el suelo, sobre todo cerca de Caracas y La Guaira.',
      fr: 'Deux séismes ont eu lieu le 24 juin 2026. Les passages radar avant et après ont été comparés ; les franges colorées montrent de combien le sol a bougé, surtout près de Caracas et de La Guaira.'
    }
  },
  {
    id: 'southafrica', type: 'forest', lat: -27.0, lng: 27.0, zoom: 6.5,
    image: 'img/southafrica.jpg',
    credit: 'NASA Earthdata, false-color composite derived from NISAR data, 2025–2026 growing season',
    title: {
      en: 'A growing season in South Africa', ru: 'Сезон роста в Южной Африке',
      es: 'Una temporada de cultivo en Sudáfrica', fr: 'Une saison de culture en Afrique du Sud'
    },
    text: {
      en: 'In this false-color composite, green marks vegetated areas, red marks unvegetated surfaces, and blue marks how fast vegetation changed during the season. Most pixels mix these colors.',
      ru: 'На этом ложноцветном снимке зелёный показывает растительность, красный голую поверхность, а синий скорость изменения растительности за сезон. Большинство пикселей смешивают эти цвета.',
      es: 'En este compuesto en falso color, el verde marca zonas con vegetación, el rojo superficies sin vegetación y el azul la rapidez con que cambió la vegetación en la temporada. La mayoría de los píxeles mezclan estos colores.',
      fr: 'Dans ce composite en fausses couleurs, le vert marque les zones végétalisées, le rouge les surfaces nues et le bleu la rapidité de changement de la végétation durant la saison. La plupart des pixels mélangent ces couleurs.'
    }
  },
  {
    /* REPLACE this one with YOUR flood case (see Step 7 of the guide). Until then it is a placeholder. */
    id: 'flood', type: 'flood', lat: 24.9, lng: 89.6, zoom: 7,
    image: 'img/flood.png',
    /* overlay: { url: 'img/flood_change.png', coordinates: [[88.9,25.5],[90.3,25.5],[90.3,24.3],[88.9,24.3]] }, */
    credit: 'Your analysis of NISAR GCOV data (ASF DAAC)',
    title: {
      en: 'Your flood case (replace me)', ru: 'Твой пример наводнения (замени меня)',
      es: 'Tu caso de inundación (reemplázame)', fr: 'Ton cas d’inondation (remplace-moi)'
    },
    text: {
      en: 'Replace this text with the real event you analyzed: where it happened, which two dates you compared and what the dark and bright patches mean.',
      ru: 'Замени этот текст описанием реального события: где это было, какие две даты ты сравнила и что означают тёмные и яркие пятна.',
      es: 'Reemplaza este texto con el evento real que analizaste: dónde ocurrió, qué dos fechas comparaste y qué significan las manchas oscuras y brillantes.',
      fr: 'Remplace ce texte par l’événement réel que tu as analysé : où il a eu lieu, quelles deux dates tu as comparées et ce que signifient les taches sombres et claires.'
    }
  }
];
