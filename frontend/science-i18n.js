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

Object.assign(I18N.en, {
  'a.needPair': 'Two compatible GCOV acquisitions on different dates (or a GUNW interferogram) are needed to run this analysis.',
  'live.imageexpired': 'An image could not load (the server may have restarted). Run the analysis again.'
});
Object.assign(I18N.ru, {
  'a.needPair': 'Для анализа нужны две совместимые GCOV-сцены за разные даты (или интерферограмма GUNW).',
  'live.imageexpired': 'Изображение недоступно или сервер перезапускался. Повтори анализ.'
});
Object.assign(I18N.fr, {
  'a.needPair': 'Deux scènes GCOV compatibles à des dates différentes (ou un interférogramme GUNW) sont nécessaires.',
  'live.imageexpired': 'Image indisponible. Veuillez relancer l’analyse.'
});
Object.assign(I18N.es, {
  'a.needPair': 'Se requieren dos escenas GCOV compatibles de fechas distintas (o un interferograma GUNW).',
  'live.imageexpired': 'Imagen no disponible; repite el análisis.'
});

/* Precomputed NISAR example cards: no remote imagery, no fabricated imagery. */
Object.assign(I18N.ru, {
  'case.event': 'Что произошло:', 'case.cause': 'Причина и интерпретация:',
  'case.satellite': 'Наблюдения NISAR', 'case.archived': 'Предварительно обработано ZORI',
  'case.scienceSource': 'Источник события и научных данных NASA',
  'case.notReady': 'Научные снимки ещё не сохранены в архив ZORI. Нельзя показывать неподтверждённые изображения вместо данных спутника.',
  'case.phase': 'Интерферометрическая фаза GUNW — результат пары наблюдений, не два снимка «до/после».',
  'case.inspect': 'Исследовать это место',
  'case.metricGCOV': 'Медиана изменения: {median} дБ · |Δ| ≥ 3 дБ в {fraction}% действительных пикселей. Это не подтверждённая площадь события.',
  'case.metricGUNW': 'Межквартильный диапазон относительной фазы: {phase} радиан. Это не исправленная карта смещений.'
});
Object.assign(I18N.en, {
  'case.event': 'What happened:', 'case.cause': 'Cause and interpretation:',
  'case.satellite': 'NISAR observations', 'case.archived': 'Precomputed by ZORI',
  'case.scienceSource': 'NASA event and science provenance',
  'case.notReady': 'Real NISAR imagery has not yet been archived for this case. No fabricated or third-party photos are shown.',
  'case.phase': 'GUNW interferometric phase from paired observations, not a before/after photograph.',
  'case.inspect': 'Explore this location',
  'case.metricGCOV': 'Median radar change: {median} dB · |Δ| ≥ 3 dB in {fraction}% of valid pixels. Not a verified event area.',
  'case.metricGUNW': 'Relative-phase interquartile range: {phase} radians; not corrected ground displacement.'
});
Object.assign(I18N.fr, {
  'case.event': 'Événement :', 'case.cause': 'Cause et interprétation :',
  'case.satellite': 'Observations NISAR', 'case.archived': 'Calculé par ZORI',
  'case.scienceSource': 'Source scientifique et événement NASA',
  'case.notReady': 'Les véritables images NISAR ne sont pas encore archivées pour ce cas.',
  'case.phase': 'Phase interférométrique GUNW, issue de deux passages, pas des photos avant/après.',
  'case.inspect': 'Explorer ce lieu',
  'case.metricGCOV': 'Variation médiane : {median} dB · |Δ| ≥ 3 dB sur {fraction}% des pixels valides. Pas une surface vérifiée.',
  'case.metricGUNW': 'Écart interquartile de phase relative : {phase} radians.'
});
Object.assign(I18N.es, {
  'case.event': 'Qué ocurrió:', 'case.cause': 'Causa e interpretación:',
  'case.satellite': 'Observaciones NISAR', 'case.archived': 'Procesado por ZORI',
  'case.scienceSource': 'Fuente científica NASA',
  'case.notReady': 'Las imágenes reales NISAR aún no se han archivado para este caso.',
  'case.phase': 'Fase interferométrica GUNW de dos observaciones, no dos fotos antes/después.',
  'case.inspect': 'Explorar este lugar',
  'case.metricGCOV': 'Cambio mediano: {median} dB · |Δ| ≥ 3 dB en {fraction}% de píxeles válidos; no es un área confirmada.',
  'case.metricGUNW': 'Rango intercuartílico de fase relativa: {phase} radianes.'
});

Object.assign(I18N.ru, { 'case.pending': 'Ожидает предварительной обработки' });
Object.assign(I18N.en, { 'case.pending': 'Awaiting verified radar precomputation' });
Object.assign(I18N.fr, { 'case.pending': 'Calcul scientifique non archivé' });
Object.assign(I18N.es, { 'case.pending': 'Pendiente de procesamiento verificado' });


/* Final launch: common scientific case layout and careful claims for live scans. */
Object.assign(I18N.ru, {
 'case.noArchive': 'Подтверждённые примеры готовятся. Выбери место на глобусе, чтобы выполнить собственный анализ NISAR.',
 'case.liveEventRadar': 'Между двумя датами радар NISAR зарегистрировал изменения обратного рассеяния в выбранном районе. Само событие пока не установлено.',
 'case.liveEventPhase': 'Получена интерферограмма NISAR по паре наблюдений. Она показывает относительную разность радарной фазы, а не подтверждённое смещение земли.',
 'case.liveCause.flood': 'Возможные причины: вода, влажность почвы, растительность и геометрия съёмки. Радар сам по себе не доказывает наводнение.',
 'case.liveCause.forest': 'Возможные причины: изменение растительности, уборка урожая, влажность почвы, сезонность и геометрия съёмки.',
 'case.liveCause.ground': 'Возможные причины: деформация поверхности, атмосфера, ионосфера и орбитальные погрешности. Для оценки смещений нужна дополнительная обработка.',
 'case.liveLimits': 'Наблюдаемое изменение — научный индикатор, а не подтверждённая карта последствий.',
 'case.scanUnavailable': 'Для этой точки не удалось получить подтверждённое радарное изображение. Выбери другую пару наблюдений или период.',
 'case.noConfirmedEvent': 'Анализ не завершился: по этим данным нельзя утверждать, что произошло событие.'
});
Object.assign(I18N.en, {
 'case.noArchive': 'Verified examples are being prepared. Choose a place on the globe to run a real NISAR analysis.',
 'case.liveEventRadar': 'NISAR measured a backscatter difference between two dates at this location. The physical event is not independently confirmed.',
 'case.liveEventPhase': 'NISAR produced an interferometric phase image from paired observations. It is not a certified ground-displacement map.',
 'case.liveCause.flood': 'Possible drivers include water, soil moisture, vegetation and observation geometry. Radar change alone does not prove flooding.',
 'case.liveCause.forest': 'Possible drivers include vegetation growth, harvest, soil moisture, seasonality and acquisition geometry.',
 'case.liveCause.ground': 'Possible drivers include surface motion, atmospheric and ionospheric delay and orbital errors. Further processing is needed for displacement.',
 'case.liveLimits': 'This is a radar-change indicator, not a verified damage or event map.',
 'case.scanUnavailable': 'No verified radar image was produced at this location. Try another location or date range.',
 'case.noConfirmedEvent': 'Analysis was not completed. The available evidence does not establish an event.'
});
Object.assign(I18N.fr, {
 'case.noArchive': 'Les exemples validés sont en préparation. Sélectionnez un lieu sur le globe pour analyser NISAR.',
 'case.liveEventRadar': 'NISAR a mesuré une différence de rétrodiffusion entre deux dates. Aucun événement précis n’est encore confirmé.',
 'case.liveEventPhase': 'NISAR a produit une phase interférométrique issue de deux acquisitions, pas une carte de déplacement certifiée.',
 'case.liveCause.flood': 'Causes possibles : eau, humidité du sol, végétation, géométrie. Le radar seul ne prouve pas une inondation.',
 'case.liveCause.forest': 'Causes possibles : croissance végétale, récolte, humidité, saisonnalité et géométrie.',
 'case.liveCause.ground': 'Causes possibles : déplacement, atmosphère, ionosphère et erreurs orbitales. Une correction est nécessaire.',
 'case.liveLimits': 'Indicateur radar, pas carte officielle des dommages.',
 'case.scanUnavailable': 'Aucune image radar vérifiée produite ici. Essayez d’autres dates ou un autre lieu.',
 'case.noConfirmedEvent': 'Le traitement n’a pas abouti ; aucun événement ne peut être confirmé.'
});
Object.assign(I18N.es, {
 'case.noArchive': 'Los ejemplos verificados están en preparación. Selecciona un lugar para analizar NISAR.',
 'case.liveEventRadar': 'NISAR midió una diferencia de retrodispersión entre dos fechas. El evento no está confirmado.',
 'case.liveEventPhase': 'NISAR produjo una imagen de fase interferométrica de observaciones emparejadas, no un mapa de desplazamiento certificado.',
 'case.liveCause.flood': 'Posibles causas: agua, humedad, vegetación y geometría. El radar no demuestra por sí solo una inundación.',
 'case.liveCause.forest': 'Posibles causas: crecimiento vegetal, cosecha, humedad, estación y geometría de adquisición.',
 'case.liveCause.ground': 'Posibles causas: movimiento, atmósfera, ionosfera y errores orbitales. Se requiere corrección adicional.',
 'case.liveLimits': 'Indicador de cambio radar, no mapa oficial de daños.',
 'case.scanUnavailable': 'No se produjo una imagen radar verificada aquí. Prueba otras fechas u otra ubicación.',
 'case.noConfirmedEvent': 'El análisis no terminó; no se puede confirmar un evento.'
});
