/* Science labels for the real NASA ASF NISAR processing workflow. */
Object.assign(I18N.en, {
  'live.visualdifference': 'Aligned, geocoded GCOV radar-brightness difference — not a classified disaster map.',
  'live.phase': 'Real GUNW interferometric phase, masked for coherence; not a corrected displacement map.',
  'live.median': 'Median backscatter difference: {n} dB',
  'live.changed': '{n}% of sampled valid pixels differ by at least 3 dB (not affected area)',
  'live.phaseiqr': 'Interquartile range of relative GUNW phase: {n} radians',
  'live.warning': 'Real archived NISAR data, processed on request. Archive latency is typically 36–72 hours; signal differences are not proof of a flood, fire or earthquake. Check the product quality and source scenes.',
  'live.sources': 'Original NASA ASF science products',
  'r.trustd': 'We prefer validated NISAR products and compare only observations with compatible geometry and processing maturity. Radar backscatter may also vary because of soil moisture, season, vegetation and acquisition geometry. Findings are signals to investigate, not automatic hazard confirmations.',
  'd.hint': 'NISAR validated L-band products became available in November 2026, while earlier observations use provisional collections. Different processing maturities must not be mixed blindly.'
});
Object.assign(I18N.ru, {
  'live.visualdifference': 'Разница яркости геопривязанных GCOV-снимков, а не подтверждённая карта стихийного бедствия.',
  'live.phase': 'Реальная интерферометрическая фаза GUNW с маской когерентности; это ещё не скорректированная карта смещений.',
  'live.median': 'Медианное изменение обратного рассеяния: {n} дБ',
  'live.changed': 'У {n}% выбранных действительных пикселей изменение ≥ 3 дБ (не площадь бедствия)',
  'live.phaseiqr': 'Межквартильный размах относительной фазы GUNW: {n} радиан',
  'live.warning': 'Настоящие архивные данные NISAR, обработанные по запросу. Публикация в архиве обычно запаздывает на 36–72 часа. Разница сигнала сама по себе не доказывает наводнение, пожар или землетрясение.',
  'live.sources': 'Исходные научные файлы NASA ASF',
  'r.trustd': 'Мы отдаём приоритет валидированным данным NISAR и сравниваем только наблюдения с совместимой геометрией и степенью обработки. Влажность почвы, сезон и угол съёмки также меняют сигнал. Результат — повод для проверки, а не автоматический диагноз.',
  'd.hint': 'С ноября 2026 доступны валидированные продукты NISAR; более ранние наблюдения относятся к предварительным коллекциям. Их нельзя без проверки смешивать в одном сравнении.'
});
Object.assign(I18N.fr, {
  'live.visualdifference': 'Différence de rétrodiffusion GCOV géocodée, pas une carte confirmée de catastrophe.',
  'live.phase': 'Phase interférométrique GUNW réelle avec masque de cohérence ; pas une carte de déplacement corrigée.',
  'live.median': 'Variation médiane de rétrodiffusion : {n} dB',
  'live.changed': '{n}% des pixels valides échantillonnés varient d’au moins 3 dB (pas une surface sinistrée)',
  'live.phaseiqr': 'Écart interquartile de phase GUNW relative : {n} radians',
  'live.warning': 'Données NISAR réelles traitées sur demande. Leur publication peut prendre 36–72 heures. Un signal différent ne prouve pas à lui seul une inondation, un feu ou un séisme.',
  'live.sources': 'Produits scientifiques sources NASA ASF',
  'r.trustd': 'Nous privilégions les produits NISAR validés, sans mélanger des niveaux de maturité ni des géométries incompatibles. Humidité, saison et géométrie d’acquisition peuvent modifier le signal. Vérification nécessaire.',
  'd.hint': 'Les produits NISAR validés sont disponibles depuis novembre 2026 ; les acquisitions antérieures peuvent être provisoires.'
});
Object.assign(I18N.es, {
  'live.visualdifference': 'Diferencia de retrodispersión GCOV geocodificada, no un mapa de desastre confirmado.',
  'live.phase': 'Fase interferométrica GUNW real con máscara de coherencia; no es un mapa de desplazamiento corregido.',
  'live.median': 'Cambio mediano de retrodispersión: {n} dB',
  'live.changed': 'El {n}% de píxeles válidos muestreados varía al menos 3 dB (no es superficie afectada)',
  'live.phaseiqr': 'Rango intercuartílico de fase GUNW relativa: {n} radianes',
  'live.warning': 'Datos reales de NISAR procesados a petición. Su publicación suele tardar 36–72 horas. Un cambio de señal no demuestra por sí solo una inundación, incendio o terremoto.',
  'live.sources': 'Productos científicos originales de NASA ASF',
  'r.trustd': 'Priorizamos productos NISAR validados y evitamos mezclar madurez y geometrías incompatibles. La humedad, la estación y la geometría de adquisición también modifican la señal. Se requiere verificación.',
  'd.hint': 'Los productos NISAR validados están disponibles desde noviembre de 2026; las observaciones anteriores pueden ser provisionales.'
});

Object.assign(I18N.en, {
 'live.storylink': 'View original NASA study and imagery',
 'live.curated': 'Published NASA case study. This card is a documented reference; an on-demand analysis requires matching public NISAR science files.'
});
Object.assign(I18N.ru, {
 'live.storylink': 'Открыть исследование NASA и исходные изображения',
 'live.curated': 'Опубликованный пример NASA. Эта карточка — проверенный источник; для анализа по запросу нужны подходящие публичные научные файлы NISAR.'
});
Object.assign(I18N.fr, {
 'live.storylink': 'Voir les images et l’étude d’origine de la NASA',
 'live.curated': 'Étude de cas publiée par la NASA. Une analyse à la demande nécessite des données scientifiques NISAR compatibles.'
});
Object.assign(I18N.es, {
 'live.storylink': 'Ver el estudio y las imágenes originales de NASA',
 'live.curated': 'Estudio de caso publicado por NASA. El análisis a petición requiere datos científicos NISAR compatibles.'
});


/* Mission clarity: distinguish archive search from successful processing,
 * preserve reference imagery, and localize the new controls.
 */
Object.assign(I18N.en, {
  'a.btn': 'Analyze this place',
  'a.polar': 'Polar region: this processor supports coordinates from 85°S to 85°N. No verified scene is reported here.',
  'r.science': 'Science details & limitations',
  'r.optical': 'The globe is optical context; the radar result is displayed in the analysis panel.',
  'live.nasaimage': 'Official NASA reference visualization (not computed by ZORI)',
  'live.curated': 'Published NASA science imagery, credited separately. Click Analyze this place for an independent live NISAR calculation.',
  'live.fail': 'The live science calculation did not finish here. Published NASA imagery is shown as a separate reference.',
  'z.theme': 'I changed the colors of our alien control room!',
  'z.map': 'Changing our view of Earth. Same planet, different perspective!',
  'z.language': 'Transmission translated into your Earth language!',
  'z.scan': 'Radar antenna deployed! I am checking the NISAR echoes.'
});
Object.assign(I18N.ru, {
  'a.btn': 'Анализировать место',
  'a.polar': 'Полярный район: эта версия обрабатывает точки от 85° ю. ш. до 85° с. ш. Здесь подтверждённых сцен нет.',
  'r.science': 'Научные пояснения и ограничения',
  'r.optical': 'Глобус показывает обычную карту Земли. Радарные снимки появляются в результатах анализа.',
  'live.nasaimage': 'Официальная иллюстрация NASA (не расчёт ZORI)',
  'live.curated': 'Это реальное изображение NASA с указанием автора. Чтобы получить собственный расчёт ZORI, нажми «Анализировать место».',
  'live.fail': 'Для этой точки научная обработка не завершилась. Ниже показан отдельно подписанный опубликованный снимок NASA.',
  'z.theme': 'Переключаю освещение космической лаборатории!',
  'z.map': 'Меняем ракурс Земли! Новый обзор, тот же сигнал.',
  'z.language': 'Настраиваю переводчик земных языков!',
  'z.scan': 'Радар включён! Слушаю сигналы NISAR.'
});
Object.assign(I18N.fr, {
  'a.btn': 'Analyser ce lieu',
  'a.polar': 'Zone polaire : cet outil accepte les points entre 85°S et 85°N. Aucune scène vérifiée ici.',
  'r.science': 'Explications scientifiques et limites',
  'r.optical': 'Le globe présente le contexte optique. Le radar apparaît dans les résultats.',
  'live.nasaimage': 'Visualisation officielle NASA (pas un calcul ZORI)',
  'live.curated': 'Image scientifique NASA avec attribution. Lancez Analyser ce lieu pour calculer une comparaison NISAR.',
  'live.fail': 'Le traitement scientifique a échoué ici. Une image officielle NASA est indiquée séparément.',
  'z.theme': 'Je change les lumières de la station spatiale !',
  'z.map': 'Nouvelle perspective sur la Terre !',
  'z.language': 'J’ai réglé mon traducteur terrestre !',
  'z.scan': 'Radar activé ! Je cherche les échos NISAR.'
});
Object.assign(I18N.es, {
  'a.btn': 'Analizar este lugar',
  'a.polar': 'Zona polar: este procesador admite puntos de 85°S a 85°N. No hay escenas verificadas aquí.',
  'r.science': 'Detalles científicos y limitaciones',
  'r.optical': 'El globo muestra el contexto óptico. Los resultados radar aparecen en el panel de análisis.',
  'live.nasaimage': 'Visualización oficial NASA (no calculada por ZORI)',
  'live.curated': 'Imagen científica de NASA con créditos. Pulsa Analizar este lugar para calcular un resultado NISAR nuevo.',
  'live.fail': 'No se completó el análisis científico en este lugar. Se muestra una imagen oficial de NASA por separado.',
  'z.theme': '¡Cambio las luces de la nave!',
  'z.map': '¡Una nueva perspectiva de la Tierra!',
  'z.language': '¡Traductor terrestre actualizado!',
  'z.scan': '¡Radar activado! Buscando ecos NISAR.'
});
