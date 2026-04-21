import { LangCode } from './langs';

export interface Strings {
  // MacroView
  macro_subtitle:     string;
  old_testament:      string;
  new_testament:      string;
  select_section:     string;
  language:           string;

  // Section labels (keyed by section id)
  section_law:        string;
  section_history:    string;
  section_wisdom:     string;
  section_prophecy:   string;
  section_gospel:     string;
  section_acts:       string;
  section_epistle:    string;
  section_apocalypse: string;

  // SectionBooksPage
  back_sections:      string;
  books:              string;
  connections_abbr:   string;
  select_book:        string;

  // BookArcView
  connections:        string;
  arcs:               string;
  chapters:           string;
  all:                string;
  loading_arcs:       string;
  hint:               string;
  connections_list:   string;
  prev_page:          string;
  next_page:          string;
  no_explanation_short: string;

  // DetailPanel
  analysis_title:     string;
  no_explanation:     string;
  confidence:         string;
  of:                 string;
  links_word:         string;

  // ChapterView
  no_connections:     string;
  text_no_expl:       string;
  mode_by_chapter:    string;
  mode_by_verse:      string;
  chapter_word:       string;
  chapter_abbr:       string;
  verse_order_badge:  string;
  sort_by:            string;
  sort_score_option:  string;
  sort_verse_option:  string;

  // LoadingScreen
  loading_subtitle:   string;
}

const ALL: Record<LangCode, Strings> = {
  it: {
    macro_subtitle:     'Seleziona una sezione per esplorare',
    old_testament:      'ANTICO TESTAMENTO',
    new_testament:      'NUOVO TESTAMENTO',
    select_section:     'Seleziona una sezione',
    language:           'Lingua',

    section_law:        'Legge',
    section_history:    'Storici',
    section_wisdom:     'Sapienza',
    section_prophecy:   'Profeti',
    section_gospel:     'Vangeli',
    section_acts:       'Atti',
    section_epistle:    'Lettere',
    section_apocalypse: 'Apoc.',

    back_sections:      'Sezioni',
    books:              'libri',
    connections_abbr:   'collegam.',
    select_book:        'Seleziona un libro per esplorare i collegamenti',

    connections:        'CONNESSIONI',
    arcs:               'archi',
    chapters:           'Capitoli',
    all:                'Tutti',
    loading_arcs:       'Caricamento archi…',
    hint:               'Tieni premuto e scorri · Tocca per selezionare',
    connections_list:   'COLLEGAMENTI',
    prev_page:          'Precedenti',
    next_page:          'Successivi',
    no_explanation_short: 'Nessuna spiegazione disponibile',

    analysis_title:     'Analisi del collegamento',
    no_explanation:     'Spiegazione non ancora disponibile per questo collegamento.',
    confidence:         'Conf.',
    of:                 'di',
    links_word:         'collegamenti',

    no_connections:     'Nessun collegamento trovato.',
    text_no_expl:       'Testo disponibile · nessuna spiegazione',
    mode_by_chapter:    'Per Capitolo',
    mode_by_verse:      'Per Versetto',
    chapter_word:       'Capitolo',
    chapter_abbr:       'Cap.',
    verse_order_badge:  'ord. versetto',
    sort_by:            'Ordina per',
    sort_score_option:  '% Percentuale rilevanza',
    sort_verse_option:  'Ordine versetto (1:1, 1:2…)',

    loading_subtitle:   'Connessioni nella Parola di Dio',
  },

  en: {
    macro_subtitle:     'Select a section to explore',
    old_testament:      'OLD TESTAMENT',
    new_testament:      'NEW TESTAMENT',
    select_section:     'Select a section',
    language:           'Language',

    section_law:        'Law',
    section_history:    'History',
    section_wisdom:     'Wisdom',
    section_prophecy:   'Prophets',
    section_gospel:     'Gospels',
    section_acts:       'Acts',
    section_epistle:    'Epistles',
    section_apocalypse: 'Rev.',

    back_sections:      'Sections',
    books:              'books',
    connections_abbr:   'conn.',
    select_book:        'Select a book to explore connections',

    connections:        'CONNECTIONS',
    arcs:               'arcs',
    chapters:           'Chapters',
    all:                'All',
    loading_arcs:       'Loading arcs…',
    hint:               'Press & drag · Tap to select',
    connections_list:   'CONNECTIONS',
    prev_page:          'Previous',
    next_page:          'Next',
    no_explanation_short: 'No explanation available',

    analysis_title:     'Connection Analysis',
    no_explanation:     'Explanation not yet available for this connection.',
    confidence:         'Conf.',
    of:                 'of',
    links_word:         'connections',

    no_connections:     'No connections found.',
    text_no_expl:       'Text available · no explanation',
    mode_by_chapter:    'By Chapter',
    mode_by_verse:      'By Verse',
    chapter_word:       'Chapter',
    chapter_abbr:       'Ch.',
    verse_order_badge:  'verse order',
    sort_by:            'Sort by',
    sort_score_option:  '% Relevance score',
    sort_verse_option:  'Verse order (1:1, 1:2…)',

    loading_subtitle:   'Connections in the Word of God',
  },

  es: {
    macro_subtitle:     'Selecciona una sección para explorar',
    old_testament:      'ANTIGUO TESTAMENTO',
    new_testament:      'NUEVO TESTAMENTO',
    select_section:     'Selecciona una sección',
    language:           'Idioma',

    section_law:        'Ley',
    section_history:    'Historia',
    section_wisdom:     'Sabiduría',
    section_prophecy:   'Profetas',
    section_gospel:     'Evangelios',
    section_acts:       'Hechos',
    section_epistle:    'Epístolas',
    section_apocalypse: 'Apoc.',

    back_sections:      'Secciones',
    books:              'libros',
    connections_abbr:   'conex.',
    select_book:        'Selecciona un libro para explorar las conexiones',

    connections:        'CONEXIONES',
    arcs:               'arcos',
    chapters:           'Capítulos',
    all:                'Todos',
    loading_arcs:       'Cargando arcos…',
    hint:               'Mantén presionado y desliza · Toca para seleccionar',
    connections_list:   'CONEXIONES',
    prev_page:          'Anteriores',
    next_page:          'Siguientes',
    no_explanation_short: 'Sin explicación disponible',

    analysis_title:     'Análisis de la conexión',
    no_explanation:     'Explicación aún no disponible para esta conexión.',
    confidence:         'Conf.',
    of:                 'de',
    links_word:         'conexiones',

    no_connections:     'No se encontraron conexiones.',
    text_no_expl:       'Texto disponible · sin explicación',
    mode_by_chapter:    'Por Capítulo',
    mode_by_verse:      'Por Versículo',
    chapter_word:       'Capítulo',
    chapter_abbr:       'Cap.',
    verse_order_badge:  'orden versículo',
    sort_by:            'Ordenar por',
    sort_score_option:  '% Puntuación de relevancia',
    sort_verse_option:  'Orden versículo (1:1, 1:2…)',

    loading_subtitle:   'Conexiones en la Palabra de Dios',
  },

  fr: {
    macro_subtitle:     'Sélectionnez une section pour explorer',
    old_testament:      'ANCIEN TESTAMENT',
    new_testament:      'NOUVEAU TESTAMENT',
    select_section:     'Sélectionnez une section',
    language:           'Langue',

    section_law:        'Loi',
    section_history:    'Histoire',
    section_wisdom:     'Sagesse',
    section_prophecy:   'Prophètes',
    section_gospel:     'Évangiles',
    section_acts:       'Actes',
    section_epistle:    'Épîtres',
    section_apocalypse: 'Apoc.',

    back_sections:      'Sections',
    books:              'livres',
    connections_abbr:   'conn.',
    select_book:        'Sélectionnez un livre pour explorer les connexions',

    connections:        'CONNEXIONS',
    arcs:               'arcs',
    chapters:           'Chapitres',
    all:                'Tous',
    loading_arcs:       'Chargement des arcs…',
    hint:               'Appuyez et faites glisser · Appuyez pour sélectionner',
    connections_list:   'CONNEXIONS',
    prev_page:          'Précédents',
    next_page:          'Suivants',
    no_explanation_short: 'Aucune explication disponible',

    analysis_title:     'Analyse de la connexion',
    no_explanation:     'Explication pas encore disponible pour cette connexion.',
    confidence:         'Conf.',
    of:                 'sur',
    links_word:         'connexions',

    no_connections:     'Aucune connexion trouvée.',
    text_no_expl:       'Texte disponible · sans explication',
    mode_by_chapter:    'Par Chapitre',
    mode_by_verse:      'Par Verset',
    chapter_word:       'Chapitre',
    chapter_abbr:       'Ch.',
    verse_order_badge:  'ordre verset',
    sort_by:            'Trier par',
    sort_score_option:  '% Score de pertinence',
    sort_verse_option:  'Ordre du verset (1:1, 1:2…)',

    loading_subtitle:   'Connexions dans la Parole de Dieu',
  },

  ar: {
    macro_subtitle:     'اختر قسمًا للاستكشاف',
    old_testament:      'العهد القديم',
    new_testament:      'العهد الجديد',
    select_section:     'اختر قسمًا',
    language:           'اللغة',

    section_law:        'الشريعة',
    section_history:    'التاريخ',
    section_wisdom:     'الحكمة',
    section_prophecy:   'الأنبياء',
    section_gospel:     'الأناجيل',
    section_acts:       'أعمال',
    section_epistle:    'الرسائل',
    section_apocalypse: 'رؤيا',

    back_sections:      'الأقسام',
    books:              'كتب',
    connections_abbr:   'ارتباط',
    select_book:        'اختر كتابًا لاستكشاف الروابط',

    connections:        'الروابط',
    arcs:               'أقواس',
    chapters:           'فصول',
    all:                'الكل',
    loading_arcs:       'جارٍ تحميل الأقواس…',
    hint:               'اضغط واسحب · اضغط للتحديد',
    connections_list:   'الروابط',
    prev_page:          'السابق',
    next_page:          'التالي',
    no_explanation_short: 'لا يوجد شرح متاح',

    analysis_title:     'تحليل الارتباط',
    no_explanation:     'الشرح غير متاح بعد لهذا الارتباط.',
    confidence:         'ثقة',
    of:                 'من',
    links_word:         'روابط',

    no_connections:     'لم يتم العثور على روابط.',
    text_no_expl:       'النص متاح · لا يوجد شرح',
    mode_by_chapter:    'حسب الإصحاح',
    mode_by_verse:      'حسب الآية',
    chapter_word:       'الإصحاح',
    chapter_abbr:       'إصح.',
    verse_order_badge:  'ترتيب الآية',
    sort_by:            'ترتيب حسب',
    sort_score_option:  '٪ درجة الصلة',
    sort_verse_option:  'ترتيب الآية (1:1، 1:2…)',

    loading_subtitle:   'الروابط في كلمة الله',
  },

  zh: {
    macro_subtitle:     '选择一个章节以探索',
    old_testament:      '旧约',
    new_testament:      '新约',
    select_section:     '选择章节',
    language:           '语言',

    section_law:        '律法',
    section_history:    '历史',
    section_wisdom:     '智慧',
    section_prophecy:   '先知',
    section_gospel:     '福音书',
    section_acts:       '使徒行传',
    section_epistle:    '书信',
    section_apocalypse: '启示录',

    back_sections:      '章节',
    books:              '卷',
    connections_abbr:   '联',
    select_book:        '选择一本书以探索联系',

    connections:        '联系',
    arcs:               '弧',
    chapters:           '章',
    all:                '全部',
    loading_arcs:       '正在加载…',
    hint:               '按住并滑动 · 点击以选择',
    connections_list:   '联系列表',
    prev_page:          '上一页',
    next_page:          '下一页',
    no_explanation_short: '暂无解释',

    analysis_title:     '联系分析',
    no_explanation:     '此联系的解释尚不可用。',
    confidence:         '置信',
    of:                 '/',
    links_word:         '联系',

    no_connections:     '未找到联系。',
    text_no_expl:       '文本可用 · 无解释',
    mode_by_chapter:    '按章',
    mode_by_verse:      '按节',
    chapter_word:       '章',
    chapter_abbr:       '章',
    verse_order_badge:  '按节顺序',
    sort_by:            '排序',
    sort_score_option:  '% 相关度',
    sort_verse_option:  '按节顺序 (1:1, 1:2…)',

    loading_subtitle:   '上帝话语中的联系',
  },

  ja: {
    macro_subtitle:     'セクションを選んで探索する',
    old_testament:      '旧約聖書',
    new_testament:      '新約聖書',
    select_section:     'セクションを選ぶ',
    language:           '言語',

    section_law:        '律法',
    section_history:    '歴史',
    section_wisdom:     '知恵',
    section_prophecy:   '預言者',
    section_gospel:     '福音書',
    section_acts:       '使徒',
    section_epistle:    '書簡',
    section_apocalypse: '黙示録',

    back_sections:      'セクション',
    books:              '書',
    connections_abbr:   '接続',
    select_book:        '書物を選んで接続を探索する',

    connections:        '接続',
    arcs:               '弧',
    chapters:           '章',
    all:                'すべて',
    loading_arcs:       '読み込み中…',
    hint:               '長押しでスライド · タップで選択',
    connections_list:   '接続リスト',
    prev_page:          '前へ',
    next_page:          '次へ',
    no_explanation_short: '解説なし',

    analysis_title:     '接続の分析',
    no_explanation:     'この接続の解説はまだ利用できません。',
    confidence:         '信頼',
    of:                 '/',
    links_word:         '接続',

    no_connections:     '接続が見つかりません。',
    text_no_expl:       'テキストあり · 解説なし',
    mode_by_chapter:    '章ごと',
    mode_by_verse:      '節ごと',
    chapter_word:       '章',
    chapter_abbr:       '章',
    verse_order_badge:  '節順',
    sort_by:            '並び替え',
    sort_score_option:  '% 関連度スコア',
    sort_verse_option:  '節順 (1:1, 1:2…)',

    loading_subtitle:   '神の言葉の中の接続',
  },
};

export default ALL;
