export interface EnglishVocabCard {
  id: string;
  unit: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  turkish: string;
  exampleEn: string;
  exampleTr: string;
}

export interface ListeningLine {
  speaker: string;
  en: string;
  tr: string;
}

export interface ListeningQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface EnglishListeningTrack {
  id: string;
  trackNumber: number;
  unit: string;
  title: string;
  subtitle: string;
  level: '5–6. Sınıf' | '7. Sınıf' | '8. Sınıf / LGS';
  durationLabel: string;
  lines: ListeningLine[];
  questions: ListeningQuestion[];
}

export interface GrammarTopicGuide {
  id: string;
  title: string;
  unitFocus: string;
  formula: string;
  explanationTr: string;
  examples: { en: string; tr: string }[];
  tipTr: string;
}

export interface SentenceBuilderChallenge {
  id: string;
  unit: string;
  turkishPrompt: string;
  correctSentence: string;
  scrambledWords: string[];
  hint: string;
}

export const ENGLISH_VOCAB_CARDS: EnglishVocabCard[] = [
  // Unit 1: Friendship
  {
    id: 'v1',
    unit: 'Unit 1: Friendship',
    word: 'count on',
    phonetic: '/kaʊnt ɒn/',
    partOfSpeech: 'phrasal verb',
    turkish: 'güvenmek, bel bağlamak',
    exampleEn: 'I always count on my best friend because she never tells my secrets.',
    exampleTr: 'En yakın arkadaşıma her zaman güvenirim çünkü sırlarımı asla söylemez.',
  },
  {
    id: 'v2',
    unit: 'Unit 1: Friendship',
    word: 'get on well',
    phonetic: '/ɡet ɒn wel/',
    partOfSpeech: 'phrasal verb',
    turkish: 'iyi geçinmek, iyi anlaşmak',
    exampleEn: 'Kerem and I get on well with each other; we share the same hobbies.',
    exampleTr: 'Kerem ve ben birbirimizle iyi anlaşırız; aynı hobileri paylaşıyoruz.',
  },
  {
    id: 'v3',
    unit: 'Unit 1: Friendship',
    word: 'back up',
    phonetic: '/bæk ʌp/',
    partOfSpeech: 'phrasal verb',
    turkish: 'desteklemek, arka çıkmak',
    exampleEn: 'True friends always back you up when you have a problem.',
    exampleTr: 'Gerçek arkadaşlar bir sorunun olduğunda seni her zaman destekler.',
  },
  {
    id: 'v4',
    unit: 'Unit 1: Friendship',
    word: 'laid-back',
    phonetic: '/ˌleɪdˈbæk/',
    partOfSpeech: 'adjective',
    turkish: 'rahat, kaygısız, sakin',
    exampleEn: 'My cousin is very laid-back; he rarely worries about small things.',
    exampleTr: 'Kuzenim çok rahattır; küçük şeyler için nadiren endişelenir.',
  },
  {
    id: 'v5',
    unit: 'Unit 1: Friendship',
    word: 'apologize',
    phonetic: '/əˈpɒlədʒaɪz/',
    partOfSpeech: 'verb',
    turkish: 'özür dilemek',
    exampleEn: 'I must apologize for missing your birthday party yesterday.',
    exampleTr: 'Dün doğum günü partini kaçırdığım için özür dilemeliyim.',
  },
  {
    id: 'v6',
    unit: 'Unit 1: Friendship',
    word: 'awesome',
    phonetic: '/ˈɔːsəm/',
    partOfSpeech: 'adjective',
    turkish: 'harika, müthiş',
    exampleEn: 'A picnic by the lake sounds awesome! Count me in.',
    exampleTr: 'Göl kenarında piknik kulağa harika geliyor! Beni de yaz.',
  },

  // Unit 2: Teen Life
  {
    id: 'v7',
    unit: 'Unit 2: Teen Life',
    word: 'fond of',
    phonetic: '/fɒnd əv/',
    partOfSpeech: 'adjective phrase',
    turkish: 'düşkün olmak, çok sevmek',
    exampleEn: 'Elif is fond of reading science fiction novels in the evenings.',
    exampleTr: 'Elif akşamları bilim kurgu romanları okumaya çok düşkündür.',
  },
  {
    id: 'v8',
    unit: 'Unit 2: Teen Life',
    word: 'unbearable',
    phonetic: '/ʌnˈbeərəbl/',
    partOfSpeech: 'adjective',
    turkish: 'katlanılmaz, dayanılmaz',
    exampleEn: 'I never listen to heavy metal music because I think it is unbearable.',
    exampleTr: 'Asla heavy metal müzik dinlemem çünkü bence katlanılmaz.',
  },
  {
    id: 'v9',
    unit: 'Unit 2: Teen Life',
    word: 'casual',
    phonetic: '/ˈkæʒuəl/',
    partOfSpeech: 'adjective',
    turkish: 'günlük, spor (giyim)',
    exampleEn: 'Teenagers usually prefer wearing casual clothes like hoodies and jeans.',
    exampleTr: 'Gençler genellikle kapüşonlu ve kot gibi günlük kıyafetler giymeyi tercih eder.',
  },
  {
    id: 'v10',
    unit: 'Unit 2: Teen Life',
    word: 'impressive',
    phonetic: '/ɪmˈpresɪv/',
    partOfSpeech: 'adjective',
    turkish: 'etkileyici',
    exampleEn: 'The violin concert at the school hall was truly impressive.',
    exampleTr: 'Okul salonundaki keman konseri gerçekten etkileyiciydi.',
  },
  {
    id: 'v11',
    unit: 'Unit 2: Teen Life',
    word: 'ridiculous',
    phonetic: '/rɪˈdɪkjələs/',
    partOfSpeech: 'adjective',
    turkish: 'saçma, gülünç',
    exampleEn: 'He finds fashion magazines ridiculous and prefers sports articles.',
    exampleTr: 'Moda dergilerini saçma buluyor ve spor makalelerini tercih ediyor.',
  },
  {
    id: 'v12',
    unit: 'Unit 2: Teen Life',
    word: 'daily routine',
    phonetic: '/ˈdeɪli ruːˈtiːn/',
    partOfSpeech: 'noun phrase',
    turkish: 'günlük rutin',
    exampleEn: 'Waking up early and going for a walk is part of my daily routine.',
    exampleTr: 'Erken uyanmak ve yürüyüşe çıkmak günlük rutinimin bir parçasıdır.',
  },

  // Unit 3: In the Kitchen
  {
    id: 'v13',
    unit: 'Unit 3: In the Kitchen',
    word: 'ingredients',
    phonetic: '/ɪnˈɡriːdiənts/',
    partOfSpeech: 'noun (plural)',
    turkish: 'malzemeler, içindekiler',
    exampleEn: 'First, put all the ingredients for the pancake on the kitchen table.',
    exampleTr: 'Önce krep için tüm malzemeleri mutfak masasına koy.',
  },
  {
    id: 'v14',
    unit: 'Unit 3: In the Kitchen',
    word: 'chop',
    phonetic: '/tʃɒp/',
    partOfSpeech: 'verb',
    turkish: 'doğramak, kıymak',
    exampleEn: 'Wash the onions carefully and chop them into small pieces.',
    exampleTr: 'Soğanları dikkatlice yıka ve küçük parçalara doğra.',
  },
  {
    id: 'v15',
    unit: 'Unit 3: In the Kitchen',
    word: 'peel',
    phonetic: '/piːl/',
    partOfSpeech: 'verb',
    turkish: 'kabuğunu soymak',
    exampleEn: 'You should peel the potatoes before you boil them.',
    exampleTr: 'Patatesleri haşlamadan önce kabuklarını soymalısın.',
  },
  {
    id: 'v16',
    unit: 'Unit 3: In the Kitchen',
    word: 'preheat',
    phonetic: '/ˌpriːˈhiːt/',
    partOfSpeech: 'verb',
    turkish: 'önceden ısıtmak',
    exampleEn: 'Preheat the oven to 180 degrees Celsius before baking the cake.',
    exampleTr: 'Keki pişirmeden önce fırını 180 santigrat dereceye önceden ısıt.',
  },
  {
    id: 'v17',
    unit: 'Unit 3: In the Kitchen',
    word: 'spicy',
    phonetic: '/ˈspaɪsi/',
    partOfSpeech: 'adjective',
    turkish: 'baharatlı, acılı',
    exampleEn: 'I love Gaziantep cuisine, especially spicy dishes with red pepper.',
    exampleTr: 'Gaziantep mutfağını, özellikle kırmızı biberli baharatlı yemekleri çok severim.',
  },
  {
    id: 'v18',
    unit: 'Unit 3: In the Kitchen',
    word: 'stir',
    phonetic: '/stɜːr/',
    partOfSpeech: 'verb',
    turkish: 'karıştırmak (kaşıkla)',
    exampleEn: 'Add two spoons of flour and stir the soup slowly for five minutes.',
    exampleTr: 'İki kaşık un ekle ve çorbayı beş dakika boyunca yavaşça karıştır.',
  },

  // Unit 4: On the Phone
  {
    id: 'v19',
    unit: 'Unit 4: On the Phone',
    word: 'hold on',
    phonetic: '/həʊld ɒn/',
    partOfSpeech: 'phrasal verb',
    turkish: 'beklemek (telefonda hatta kalmak)',
    exampleEn: 'Could you hold on a moment? I will get my brother.',
    exampleTr: 'Bir dakika hatta kalabilir misiniz? Kardeşimi çağıracağım.',
  },
  {
    id: 'v20',
    unit: 'Unit 4: On the Phone',
    word: 'put through',
    phonetic: '/pʊt θruː/',
    partOfSpeech: 'phrasal verb',
    turkish: 'telefonu bağlamak',
    exampleEn: 'Please wait a second, I am putting you through to the principal.',
    exampleTr: 'Lütfen bir saniye bekleyin, sizi müdüre bağlıyorum.',
  },
  {
    id: 'v21',
    unit: 'Unit 4: On the Phone',
    word: 'engaged',
    phonetic: '/ɪnˈɡeɪdʒd/',
    partOfSpeech: 'adjective',
    turkish: 'meşgul (telefon hattı)',
    exampleEn: 'I tried to call the clinic twice, but the line was engaged.',
    exampleTr: 'Kliniği iki kez aramaya çalıştım ama hat meşguldü.',
  },
  {
    id: 'v22',
    unit: 'Unit 4: On the Phone',
    word: 'leave a message',
    phonetic: '/liːv ə ˈmesɪdʒ/',
    partOfSpeech: 'verb phrase',
    turkish: 'mesaj bırakmak',
    exampleEn: 'She is not available right now. Would you like to leave a message?',
    exampleTr: 'Şu an müsait değil. Mesaj bırakmak ister misiniz?',
  },
  {
    id: 'v23',
    unit: 'Unit 4: On the Phone',
    word: 'pick up',
    phonetic: '/pɪk ʌp/',
    partOfSpeech: 'phrasal verb',
    turkish: 'telefonu açmak',
    exampleEn: 'The phone is ringing in the hall; can you pick it up?',
    exampleTr: 'Holden telefon çalıyor; açabilir misin?',
  },
  {
    id: 'v24',
    unit: 'Unit 4: On the Phone',
    word: 'keep in touch',
    phonetic: '/kiːp ɪn tʌtʃ/',
    partOfSpeech: 'idiom',
    turkish: 'iletişimde kalmak',
    exampleEn: 'We use video calls to keep in touch with our grandparents.',
    exampleTr: 'Büyükannemiz ve büyükbabamızla iletişimde kalmak için görüntülü arama kullanırız.',
  },

  // Unit 5: Internet & Adventures
  {
    id: 'v25',
    unit: 'Unit 5: Internet & Adventures',
    word: 'attachment',
    phonetic: '/əˈtætʃmənt/',
    partOfSpeech: 'noun',
    turkish: 'e-posta eki (dosya)',
    exampleEn: 'Do not open an email attachment from someone you do not know.',
    exampleTr: 'Tanımadığın birinden gelen e-posta ekini açma.',
  },
  {
    id: 'v26',
    unit: 'Unit 5: Internet & Adventures',
    word: 'log in',
    phonetic: '/lɒɡ ɪn/',
    partOfSpeech: 'phrasal verb',
    turkish: 'oturum açmak, giriş yapmak',
    exampleEn: 'You need a strong password to log in to your school account safely.',
    exampleTr: 'Okul hesabına güvenle giriş yapmak için güçlü bir şifreye ihtiyacın var.',
  },
  {
    id: 'v27',
    unit: 'Unit 5: Internet & Adventures',
    word: 'fascinating',
    phonetic: '/ˈfæsɪneɪtɪŋ/',
    partOfSpeech: 'adjective',
    turkish: 'büyüleyici, çok ilgi çekici',
    exampleEn: 'Watching the sunrise from a hot air balloon in Cappadocia is fascinating.',
    exampleTr: 'Kapadokya’da sıcak hava balonundan gün doğumunu izlemek büyüleyicidir.',
  },
  {
    id: 'v28',
    unit: 'Unit 5: Internet & Adventures',
    word: 'courageous',
    phonetic: '/kəˈreɪdʒəs/',
    partOfSpeech: 'adjective',
    turkish: 'cesur, yürekli',
    exampleEn: 'Only courageous climbers try to reach the snowy peak in winter.',
    exampleTr: 'Kışın karlı zirveye ulaşmayı yalnızca cesur dağcılar dener.',
  },
  {
    id: 'v29',
    unit: 'Unit 5: Internet & Adventures',
    word: 'equipment',
    phonetic: '/ɪˈkwɪpmənt/',
    partOfSpeech: 'noun',
    turkish: 'ekipman, donanım',
    exampleEn: 'Always check your helmet and safety equipment before cycling.',
    exampleTr: 'Bisiklet sürmeden önce kaskını ve güvenlik ekipmanlarını her zaman kontrol et.',
  },
  {
    id: 'v30',
    unit: 'Unit 5: Internet & Adventures',
    word: 'challenging',
    phonetic: '/ˈtʃælɪndʒɪŋ/',
    partOfSpeech: 'adjective',
    turkish: 'zorlu, mücadele gerektiren',
    exampleEn: 'Rafting on the Çoruh River is exciting, but it can be very challenging.',
    exampleTr: 'Çoruh Nehri’nde rafting heyecan vericidir ama oldukça zorlu olabilir.',
  },

  // Unit 6: Science, Tourism & Nature
  {
    id: 'v31',
    unit: 'Unit 6: Science & Nature',
    word: 'invention',
    phonetic: '/ɪnˈvenʃn/',
    partOfSpeech: 'noun',
    turkish: 'icat, buluş',
    exampleEn: 'The printing press is considered one of the greatest inventions in history.',
    exampleTr: 'Matbaa tarihteki en büyük icatlardan biri olarak kabul edilir.',
  },
  {
    id: 'v32',
    unit: 'Unit 6: Science & Nature',
    word: 'experiment',
    phonetic: '/ɪkˈsperɪmənt/',
    partOfSpeech: 'noun',
    turkish: 'deney',
    exampleEn: 'Our class is conducting a chemistry experiment in the science lab today.',
    exampleTr: 'Sınıfımız bugün fen laboratuvarında bir kimya deneyi yapıyor.',
  },
  {
    id: 'v33',
    unit: 'Unit 6: Science & Nature',
    word: 'ancient',
    phonetic: '/ˈeɪnʃənt/',
    partOfSpeech: 'adjective',
    turkish: 'antik, çok eski',
    exampleEn: 'Ephesus is an ancient city visited by thousands of tourists every year.',
    exampleTr: 'Efes, her yıl binlerce turistin ziyaret ettiği antik bir şehirdir.',
  },
  {
    id: 'v34',
    unit: 'Unit 6: Science & Nature',
    word: 'destination',
    phonetic: '/ˌdestɪˈneɪʃn/',
    partOfSpeech: 'noun',
    turkish: 'varış noktası, gezi rotası',
    exampleEn: 'Antalya is a popular holiday destination with sunny beaches and history.',
    exampleTr: 'Antalya, güneşli plajları ve tarihiyle popüler bir tatil rotasıdır.',
  },
  {
    id: 'v35',
    unit: 'Unit 6: Science & Nature',
    word: 'precaution',
    phonetic: '/prɪˈkɔːʃn/',
    partOfSpeech: 'noun',
    turkish: 'önlem, tedbir',
    exampleEn: 'We must take precautions against water shortages and global warming.',
    exampleTr: 'Su kıtlığına ve küresel ısınmaya karşı önlemler almalıyız.',
  },
  {
    id: 'v36',
    unit: 'Unit 6: Science & Nature',
    word: 'earthquake',
    phonetic: '/ˈɜːθkweɪk/',
    partOfSpeech: 'noun',
    turkish: 'deprem',
    exampleEn: 'During an earthquake, drop, cover, and hold on until the shaking stops.',
    exampleTr: 'Deprem sırasında sarsıntı durana kadar çök, kapan ve tutun.',
  },
];

export const ENGLISH_LISTENING_TRACKS: EnglishListeningTrack[] = [
  {
    id: 'track-1',
    trackNumber: 1,
    unit: 'Unit 1: Friendship',
    title: 'Planning a Weekend Picnic',
    subtitle: 'Davet etme, kabul etme ve mazeret bildirerek kibarca reddetme diyaloğu',
    level: '8. Sınıf / LGS',
    durationLabel: '~35 sn',
    lines: [
      {
        speaker: 'Zeynep',
        en: 'Hi Mert! Our classmates are organizing a picnic at Emirgan Park this Sunday morning. Would you like to join us?',
        tr: 'Selam Mert! Sınıf arkadaşlarımız bu pazar sabahı Emirgan Parkı’nda piknik düzenliyor. Bize katılmak ister misin?',
      },
      {
        speaker: 'Mert',
        en: 'That sounds awesome, Zeynep! I would love to, but my grandparents are visiting us on Sunday.',
        tr: 'Kulağa harika geliyor Zeynep! Çok isterdim ama pazar günü büyükannem ve büyükbabam bizi ziyaret ediyor.',
      },
      {
        speaker: 'Zeynep',
        en: 'Oh, I understand. Family comes first! What about coming for just an hour in the afternoon?',
        tr: 'Ah, anlıyorum. Aile önce gelir! Öğleden sonra sadece bir saatliğine gelmeye ne dersin?',
      },
      {
        speaker: 'Mert',
        en: 'Great idea! I can drop by around three o’clock and bring some homemade lemonade.',
        tr: 'Harika fikir! Saat üç civarı uğrayabilir ve biraz ev yapımı limonata getirebilirim.',
      },
    ],
    questions: [
      {
        id: 't1-q1',
        question: 'Where is the picnic taking place?',
        options: ['At the school garden', 'At Emirgan Park', 'At Mert’s house', 'By the sea in Antalya'],
        correctIndex: 1,
        explanation: 'Zeynep pikniğin Emirgan Parkı’nda ("at Emirgan Park") yapılacağını söylüyor.',
      },
      {
        id: 't1-q2',
        question: 'Why does Mert hesitate to join in the morning?',
        options: [
          'He has a math exam.',
          'He feels ill.',
          'His grandparents are visiting his family.',
          'He does not like picnics.',
        ],
        correctIndex: 2,
        explanation: 'Mert, pazar günü büyükanne ve büyükbabasının ziyaretine geleceğini belirtiyor.',
      },
      {
        id: 't1-q3',
        question: 'What is Mert going to bring in the afternoon?',
        options: ['Sandwiches', 'A guitar', 'Board games', 'Homemade lemonade'],
        correctIndex: 3,
        explanation: 'Mert saat üçte uğrayıp ev yapımı limonata ("homemade lemonade") getireceğini söylüyor.',
      },
    ],
  },
  {
    id: 'track-2',
    trackNumber: 2,
    unit: 'Unit 3: In the Kitchen',
    title: 'How to Make Turkish Lentil Soup',
    subtitle: 'Sıralama bağlaçları (First, Next, Then, Finally) ile mutfak tarifi dinleme parçası',
    level: '8. Sınıf / LGS',
    durationLabel: '~40 sn',
    lines: [
      {
        speaker: 'Chef Ali',
        en: 'Welcome to our cooking class! Today we are making traditional red lentil soup.',
        tr: 'Yemek kursumuza hoş geldiniz! Bugün geleneksel kırmızı mercimek çorbası yapıyoruz.',
      },
      {
        speaker: 'Chef Ali',
        en: 'First, peel and chop one onion and one carrot. Heat two tablespoons of olive oil in a large pot.',
        tr: 'İlk olarak bir soğanı ve bir havucu soyup doğrayın. Büyük bir tencerede iki yemek kaşığı zeytinyağını ısıtın.',
      },
      {
        speaker: 'Chef Ali',
        en: 'Next, add the washed red lentils and five glasses of hot water. Boil everything for twenty minutes.',
        tr: 'Sonra yıkanmış kırmızı mercimekleri ve beş bardak sıcak suyu ekleyin. Her şeyi yirmi dakika kaynatın.',
      },
      {
        speaker: 'Chef Ali',
        en: 'Finally, blend the soup until it is smooth and serve it hot with fresh lemon juice and mint.',
        tr: 'Son olarak çorbayı pürüzsüz olana kadar blenderdan geçirin ve taze limon suyu ile nane eşliğinde sıcak servis edin.',
      },
    ],
    questions: [
      {
        id: 't2-q1',
        question: 'What should you do FIRST in this recipe?',
        options: [
          'Blend the soup',
          'Add five glasses of cold milk',
          'Peel and chop an onion and a carrot',
          'Serve with mint',
        ],
        correctIndex: 2,
        explanation: 'İlk adımda ("First") soğan ve havucu soyup doğramak gerekiyor.',
      },
      {
        id: 't2-q2',
        question: 'How long should the soup boil?',
        options: ['Ten minutes', 'Twenty minutes', 'One hour', 'Five minutes'],
        correctIndex: 1,
        explanation: 'Parçada "Boil everything for twenty minutes" (20 dakika kaynatın) deniyor.',
      },
      {
        id: 't2-q3',
        question: 'Which two items are used when serving the soup?',
        options: ['Lemon juice and mint', 'Sugar and cinnamon', 'Butter and garlic', 'Cheese and parsley'],
        correctIndex: 0,
        explanation: 'Çorba taze limon suyu ve nane ("fresh lemon juice and mint") ile servis ediliyor.',
      },
    ],
  },
  {
    id: 'track-3',
    trackNumber: 3,
    unit: 'Unit 4: On the Phone',
    title: 'Calling the Science Museum',
    subtitle: 'Telefon görüşmesi kalıpları, not bırakma ve bilgi alma pratiği',
    level: '8. Sınıf / LGS',
    durationLabel: '~35 sn',
    lines: [
      {
        speaker: 'Receptionist',
        en: 'Good morning, Konya Science Center. How may I help you?',
        tr: 'Günaydın, Konya Bilim Merkezi. Size nasıl yardımcı olabilirim?',
      },
      {
        speaker: 'Selin',
        en: 'Hello, this is Selin calling from Atatürk Middle School. Could I speak to the tour coordinator, please?',
        tr: 'Merhaba, ben Atatürk Ortaokulu’ndan Selin. Gezi koordinatörüyle görüşebilir miyim lütfen?',
      },
      {
        speaker: 'Receptionist',
        en: 'Hold on a minute, please. I am afraid he is in a meeting right now. Would you like to leave a message?',
        tr: 'Lütfen bir dakika hatta kalın. Korkarım şu an toplantıda. Mesaj bırakmak ister misiniz?',
      },
      {
        speaker: 'Selin',
        en: 'Yes, please. Tell him we want to book a group tour for thirty students next Friday at ten o’clock.',
        tr: 'Evet lütfen. Ona gelecek cuma saat onda otuz öğrenci için grup turu ayırtmak istediğimizi söyleyin.',
      },
    ],
    questions: [
      {
        id: 't3-q1',
        question: 'Why cannot Selin speak to the tour coordinator?',
        options: [
          'The museum is closed.',
          'The coordinator is in a meeting.',
          'The phone line is broken.',
          'He is on holiday.',
        ],
        correctIndex: 1,
        explanation: 'Resepsiyonist koordinatörün şu an toplantıda olduğunu ("in a meeting") söylüyor.',
      },
      {
        id: 't3-q2',
        question: 'How many students are joining the group tour?',
        options: ['Fifteen', 'Twenty', 'Thirty', 'Fifty'],
        correctIndex: 2,
        explanation: 'Selin otuz öğrenci ("thirty students") için rezervasyon talep ediyor.',
      },
      {
        id: 't3-q3',
        question: 'Which phrase means "wait on the phone"?',
        options: ['Good morning', 'Hold on a minute', 'Book a tour', 'Next Friday'],
        correctIndex: 1,
        explanation: '"Hold on a minute" telefonda bir dakika beklemek / hatta kalmak anlamına gelir.',
      },
    ],
  },
  {
    id: 'track-4',
    trackNumber: 4,
    unit: 'Unit 5: The Internet',
    title: 'Smart Internet Safety Rules',
    subtitle: 'Güvenli internet kullanımı ve dijital vatandaşlık dinleme metni',
    level: '7. Sınıf',
    durationLabel: '~35 sn',
    lines: [
      {
        speaker: 'Teacher',
        en: 'The Internet is a wonderful tool for learning English, doing research, and sharing projects.',
        tr: 'İnternet; İngilizce öğrenmek, araştırma yapmak ve proje paylaşmak için harika bir araçtır.',
      },
      {
        speaker: 'Teacher',
        en: 'However, every student should follow basic safety rules. Never share your password or home address online.',
        tr: 'Ancak her öğrenci temel güvenlik kurallarına uymalıdır. Şifreni veya ev adresini çevrimiçi olarak asla paylaşma.',
      },
      {
        speaker: 'Teacher',
        en: 'Always ask your parents before downloading files or clicking on unknown email attachments.',
        tr: 'Dosya indirmeden veya bilinmeyen e-posta eklerine tıklamadan önce mutlaka anne-babana sor.',
      },
    ],
    questions: [
      {
        id: 't4-q1',
        question: 'What should you NEVER share online according to the teacher?',
        options: [
          'Your favorite book',
          'Your password and home address',
          'Your school project topic',
          'An English dictionary link',
        ],
        correctIndex: 1,
        explanation: 'Öğretmen şifre ve ev adresinin asla paylaşılmaması gerektiğini vurguluyor.',
      },
      {
        id: 't4-q2',
        question: 'Who should you ask before downloading files?',
        options: ['Strangers online', 'Your parents', 'Nobody', 'A shop assistant'],
        correctIndex: 1,
        explanation: '"Always ask your parents" ifadesiyle ebeveynlere danışılması gerektiği belirtiliyor.',
      },
      {
        id: 't4-q3',
        question: 'What is the main topic of this audio track?',
        options: ['Cooking recipes', 'Outdoor sports', 'Internet safety rules', 'Holiday hotels'],
        correctIndex: 2,
        explanation: 'Metin temel internet güvenliği kurallarını ("basic safety rules") anlatıyor.',
      },
    ],
  },
  {
    id: 'track-5',
    trackNumber: 5,
    unit: 'Unit 6: Tourism & Adventures',
    title: 'Exploring Cappadocia',
    subtitle: 'Karşılaştırmalar (Comparatives) ve seyahat deneyimi dinleme parçası',
    level: '8. Sınıf / LGS',
    durationLabel: '~40 sn',
    lines: [
      {
        speaker: 'Guide',
        en: 'Last spring, I visited Cappadocia in Central Anatolia, and it was the most fascinating trip of my life.',
        tr: 'Geçen bahar İç Anadolu’daki Kapadokya’yı ziyaret ettim ve hayatımın en büyüleyici gezisiydi.',
      },
      {
        speaker: 'Guide',
        en: 'We stayed in a historic cave hotel, which was cooler and quieter than modern city hotels.',
        tr: 'Modern şehir otellerinden daha serin ve daha sessiz olan tarihî bir mağara otelde kaldık.',
      },
      {
        speaker: 'Guide',
        en: 'Early in the morning, we tried a hot air balloon ride over the fairy chimneys. It was safer than I expected!',
        tr: 'Sabah erkenden peri bacalarının üzerinde sıcak hava balonu turu denedik. Beklediğimden daha güvenliydi!',
      },
    ],
    questions: [
      {
        id: 't5-q1',
        question: 'When did the speaker visit Cappadocia?',
        options: ['Last winter', 'Last spring', 'Two weeks ago', 'Next summer'],
        correctIndex: 1,
        explanation: 'Konuşmacı geçen bahar ("Last spring") ziyaret ettiğini belirtiyor.',
      },
      {
        id: 't5-q2',
        question: 'How does the speaker compare the cave hotel to modern city hotels?',
        options: [
          'More expensive and noisier',
          'Smaller and hotter',
          'Cooler and quieter',
          'Older and darker',
        ],
        correctIndex: 2,
        explanation: 'Mağara otelin modern şehir otellerinden daha serin ve daha sessiz ("cooler and quieter") olduğu söyleniyor.',
      },
      {
        id: 't5-q3',
        question: 'What activity did they do early in the morning?',
        options: ['Scuba diving', 'Skiing', 'A hot air balloon ride', 'Surfing'],
        correctIndex: 2,
        explanation: 'Sabah erkenden peri bacaları üzerinde sıcak hava balonu ("hot air balloon ride") yaptılar.',
      },
    ],
  },
  {
    id: 'track-6',
    trackNumber: 6,
    unit: 'Unit 6: Science & Natural Forces',
    title: 'Protecting Our Planet',
    subtitle: 'Doğa olayları, geri dönüşüm ve gelecek zaman (will / should) dinleme parçası',
    level: '8. Sınıf / LGS',
    durationLabel: '~38 sn',
    lines: [
      {
        speaker: 'Dr. Deniz',
        en: 'Climate change is causing more droughts and floods around the world every decade.',
        tr: 'İklim değişikliği her on yılda dünya genelinde daha fazla kuraklık ve sele yol açıyor.',
      },
      {
        speaker: 'Dr. Deniz',
        en: 'If we plant more trees, recycle paper, and use renewable solar energy, we will protect future generations.',
        tr: 'Daha fazla ağaç diker, kâğıdı geri dönüştürür ve yenilenebilir güneş enerjisi kullanırsak gelecek nesilleri koruyacağız.',
      },
      {
        speaker: 'Dr. Deniz',
        en: 'Remember: turning off unused lights and saving water at home makes a real difference!',
        tr: 'Unutmayın: kullanılmayan ışıkları kapatmak ve evde su tasarrufu yapmak gerçek bir fark yaratır!',
      },
    ],
    questions: [
      {
        id: 't6-q1',
        question: 'Which two natural disasters are mentioned as effects of climate change?',
        options: ['Earthquakes and avalanches', 'Droughts and floods', 'Tsunamis and volcanoes', 'Landslides and tornadoes'],
        correctIndex: 1,
        explanation: 'Dr. Deniz kuraklık ve sellerden ("droughts and floods") bahsediyor.',
      },
      {
        id: 't6-q2',
        question: 'Which renewable energy source is mentioned?',
        options: ['Coal', 'Natural gas', 'Solar energy', 'Nuclear energy'],
        correctIndex: 2,
        explanation: 'Yenilenebilir güneş enerjisi ("renewable solar energy") öneriliyor.',
      },
      {
        id: 't6-q3',
        question: 'What simple actions at home make a difference?',
        options: [
          'Buying new phones',
          'Turning off unused lights and saving water',
          'Driving faster cars',
          'Leaving taps open',
        ],
        correctIndex: 1,
        explanation: 'Kullanılmayan ışıkları kapatmak ve su tasarrufu yapmak vurgulanıyor.',
      },
    ],
  },
];

export const ENGLISH_GRAMMAR_GUIDES: GrammarTopicGuide[] = [
  {
    id: 'g1',
    title: 'Making Invitations, Accepting & Refusing',
    unitFocus: 'Unit 1: Friendship (LGS)',
    formula: 'Would you like to + V1? | Shall we + V1? | How about + V-ing?',
    explanationTr:
      'Birini bir etkinliğe davet ederken "Would you like to..." ve "Shall we..." yapılarından sonra fiil yalın (V1), "How about / What about..." yapılarından sonra ise fiil -ing (V-ing) alır.',
    examples: [
      { en: 'Would you like to come to my slumber party?', tr: 'Pijama partime gelmek ister misin?' },
      { en: 'How about watching a comedy movie tonight?', tr: 'Bu akşam bir komedi filmi izlemeye ne dersin?' },
      { en: 'I would love to, but I have to finish my project.', tr: 'Çok isterdim ama projemi bitirmem gerekiyor.' },
    ],
    tipTr: 'LGS sorularında reddetme cümleleri genellikle "I’d love to, but..." kalıbıyla başlar ve devamında mazeret (excuse) verir.',
  },
  {
    id: 'g2',
    title: 'Expressing Preferences (Prefer)',
    unitFocus: 'Unit 2: Teen Life & Unit 6: Adventures',
    formula: 'Subject + prefer(s) + V-ing / Noun + to + V-ing / Noun',
    explanationTr:
      'Bir şeyi başka bir şeye tercih ederken "prefer ... to ..." kalıbı kullanılır. Arada "than" DEĞİL her zaman "to" bulunur; fiil gelirse "-ing" takısı alır.',
    examples: [
      { en: 'I prefer reading detective books to watching TV.', tr: 'Dedektif kitapları okumayı televizyon izlemeye tercih ederim.' },
      { en: 'She prefers trekking to rock climbing because it is safer.', tr: 'O, doğa yürüyüşünü kaya tırmanışına tercih eder çünkü daha güvenlidir.' },
    ],
    tipTr: '"Would rather" kalıbında ise fiil yalın kullanılır ve arada "than" bulunur: I would rather read than watch TV.',
  },
  {
    id: 'g3',
    title: 'Imperatives & Sequence Linkers (Cooking)',
    unitFocus: 'Unit 3: In the Kitchen',
    formula: 'First, ... → Second / Next, ... → Then, ... → After that, ... → Finally, ...',
    explanationTr:
      'Yemek tariflerinde özne kullanmadan doğrudan fiille başlayan emir cümleleri (Chop, Boil, Mix, Bake) ve işlem sırasını gösteren bağlaçlar kullanılır.',
    examples: [
      { en: 'First, crack two eggs into a bowl and whisk them.', tr: 'İlk olarak bir kâseye iki yumurta kırın ve çırpın.' },
      { en: 'Finally, sprinkle some cheese on top and serve warm.', tr: 'Son olarak üzerine biraz peynir serpin ve ılık servis edin.' },
    ],
    tipTr: 'Sıralama sorularında "First" daima ilk adımı, "Finally" ise son adımı işaret eder.',
  },
  {
    id: 'g4',
    title: 'Future Predictions & Instant Decisions (Will)',
    unitFocus: 'Unit 4: On the Phone & Unit 10: Natural Forces',
    formula: 'Subject + will / won’t + V1',
    explanationTr:
      'Konuşma anında verilen kararlarda ("I will get him"), geleceğe yönelik tahminlerde ("I think there will be more droughts") "will + yalın fiil" kullanılır.',
    examples: [
      { en: 'Hold on a second, I will put you through to Mr. Kaya.', tr: 'Bir saniye bekleyin, sizi Kaya Bey’e bağlayacağım.' },
      { en: 'I believe scientists will find a cure for many diseases.', tr: 'Bilim insanlarının birçok hastalığa çare bulacağına inanıyorum.' },
    ],
    tipTr: 'Planlanmış niyetler için "be going to + V1", anlık karar ve tahminler için "will + V1" tercih edilir.',
  },
  {
    id: 'g5',
    title: 'Comparatives & Superlatives',
    unitFocus: 'Unit 6: Adventures & Unit 7: Tourism',
    formula: 'short adj + -er than / more + long adj + than | the + -est / the most + long adj',
    explanationTr:
      'İki varlığı karşılaştırırken kısa sıfatlara -er (faster, safer), uzun sıfatların başına "more" (more exciting) gelir. Üç veya daha fazla öğe arasında en üstünlük için "the + -est / the most" kullanılır.',
    examples: [
      { en: 'Bungee jumping is more dangerous than cycling.', tr: 'Bungee jumping bisiklet sürmekten daha tehlikelidir.' },
      { en: 'Istanbul is one of the most historic cities in the world.', tr: 'İstanbul dünyadaki en tarihî şehirlerden biridir.' },
    ],
    tipTr: 'Düzensiz sıfatları unutma: good → better → the best | bad → worse → the worst.',
  },
  {
    id: 'g6',
    title: 'Obligations & Rules (Must / Have to / Should)',
    unitFocus: 'Unit 8: Chores & Unit 10: Natural Forces',
    formula: 'Subject + must / have to / should + V1',
    explanationTr:
      'Sorumluluk ve zorunluluklar için "must / have to", yasaklar için "mustn’t", tavsiye ve öneriler için "should / shouldn’t" kullanılır.',
    examples: [
      { en: 'I have to tidy up my room and take out the garbage on Saturdays.', tr: 'Cumartesileri odamı toplamak ve çöpü çıkarmak zorundayım.' },
      { en: 'We should recycle plastic bottles to protect nature.', tr: 'Doğayı korumak için plastik şişeleri geri dönüştürmeliyiz.' },
    ],
    tipTr: 'Modal fiillerden (must, should, can, will) sonra fiile hiçbir ek (-s, -ed, -ing) getirilmez.',
  },
];

export const SENTENCE_BUILDER_CHALLENGES: SentenceBuilderChallenge[] = [
  {
    id: 'sb1',
    unit: 'Unit 1: Friendship',
    turkishPrompt: 'Cumartesi günü bizimle bowling oynamaya gelmek ister misin?',
    correctSentence: 'Would you like to go bowling with us on Saturday?',
    scrambledWords: ['go', 'Saturday?', 'like', 'Would', 'bowling', 'you', 'on', 'to', 'us', 'with'],
    hint: '"Would you like to..." soru kalıbıyla başla.',
  },
  {
    id: 'sb2',
    unit: 'Unit 2: Teen Life',
    turkishPrompt: 'Boş zamanlarımda kitap okumayı televizyon izlemeye tercih ederim.',
    correctSentence: 'I prefer reading books to watching TV in my free time.',
    scrambledWords: ['to', 'reading', 'in', 'prefer', 'watching', 'I', 'books', 'TV', 'free', 'my', 'time.'],
    hint: 'Özne + prefer + V-ing + to + V-ing yapısını kullan.',
  },
  {
    id: 'sb3',
    unit: 'Unit 3: In the Kitchen',
    turkishPrompt: 'İlk olarak domatesleri yıka ve küçük parçalara doğra.',
    correctSentence: 'First, wash the tomatoes and chop them into small pieces.',
    scrambledWords: ['chop', 'First,', 'small', 'the', 'wash', 'and', 'pieces.', 'tomatoes', 'into', 'them'],
    hint: 'Sıralama bağlacı "First," ile başla, emir kipi fiilleri yerleştir.',
  },
  {
    id: 'sb4',
    unit: 'Unit 4: On the Phone',
    turkishPrompt: 'Bir saniye bekler misiniz? Sizi müdüre bağlıyorum.',
    correctSentence: 'Could you hold on a second? I will put you through.',
    scrambledWords: ['hold', 'Could', 'put', 'you', 'second?', 'on', 'I', 'through.', 'a', 'will', 'you'],
    hint: 'Rica sorusu "Could you hold on..." ile başlar.',
  },
  {
    id: 'sb5',
    unit: 'Unit 6: Adventures',
    turkishPrompt: 'Bence yamaç paraşütü kaya tırmanışından daha heyecan verici.',
    correctSentence: 'I think paragliding is more exciting than rock climbing.',
    scrambledWords: ['exciting', 'is', 'I', 'rock', 'more', 'paragliding', 'think', 'climbing.', 'than'],
    hint: 'Karşılaştırma yapısında "more + sıfat + than" sırasını takip et.',
  },
  {
    id: 'sb6',
    unit: 'Unit 10: Natural Forces',
    turkishPrompt: 'Doğayı korumak için daha fazla ağaç dikmeli ve su tasarrufu yapmalıyız.',
    correctSentence: 'We should plant more trees and save water to protect nature.',
    scrambledWords: ['more', 'save', 'We', 'trees', 'plant', 'to', 'should', 'water', 'nature.', 'and', 'protect'],
    hint: '"We should..." öneri yapısıyla cümleyi kur.',
  },
];
