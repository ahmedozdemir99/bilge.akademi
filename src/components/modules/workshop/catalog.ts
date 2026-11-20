import { AudioWaveform, BookOpen, Feather, Landmark, Map, MoonStar, PieChart } from 'lucide-react';
import type { ComponentType } from 'react';
import { activityTitles, type ActivityId } from './activityTitles';
import type { LabCallbacks } from './workshopControls';
import { FractionLab } from './FractionLab';
import { WaveLab } from './WaveLab';
import { WordArtLab } from './WordArtLab';
import { EnglishMapLab } from './EnglishMapLab';
import type { ModelExercise } from './ModelLab';
import type { Arrangement } from './ArrangeLab';
import type { DecisionRound } from './DecisionLab';
import { lineModel, areaModel, circuitModel, mirrorModel } from './modelExercises';
import { argument, chronology, donationPlan, invitation, paragraph, sourceTypes, worship } from './arrangementExercises';
import { announcements, compareSources, counterexamples, ethicalChoices, fairness, inference } from './decisionExercises';

export type Activity = {
  id: ActivityId;
  title: string;
  instruction: string;
  typeLabel: string;
} & (
  | { kind: 'custom'; Lab: ComponentType<LabCallbacks> }
  | { kind: 'model'; exercise: ModelExercise }
  | { kind: 'arrange'; exercise: Arrangement }
  | { kind: 'decision'; rounds: readonly DecisionRound[] }
);

export const subjectGroups: readonly {
  id: string;
  name: string;
  icon: typeof PieChart;
  color: string;
  activities: readonly Activity[];
}[] = [
  {
    id: 'math', name: 'Matematik', icon: PieChart, color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200',
    activities: [
      { id: 'fractions', title: activityTitles['fractions'], instruction: 'Aynı bütünü farklı sayıda parçaya böl ve denk kesirleri bul.', kind: 'custom', Lab: FractionLab, typeLabel: 'Görsel model' },
      { id: 'line', title: activityTitles['line'], instruction: 'Eğimi ve başlangıç değerini değiştirerek iki hedef koordinata ulaş.', kind: 'model', exercise: lineModel, typeLabel: 'Grafik laboratuvarı' },
      { id: 'area', title: activityTitles['area'], instruction: 'Birim karelerle iki dikdörtgen kur ve alanları karşılaştır.', kind: 'model', exercise: areaModel, typeLabel: 'Geometri modeli' },
    ],
  },
  {
    id: 'science', name: 'Fen Bilimleri', icon: AudioWaveform, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
    activities: [
      { id: 'waves', title: activityTitles['waves'], instruction: 'Dalganın yüksekliğini ve tepeler arasındaki uzaklığı değiştir.', kind: 'custom', Lab: WaveLab, typeLabel: 'Hareketli grafik' },
      { id: 'circuit', title: activityTitles['circuit'], instruction: 'Seri ve paralel bağlantıda ampullerin anahtara nasıl tepki verdiğini gözle.', kind: 'model', exercise: circuitModel, typeLabel: 'Devre modeli' },
      { id: 'mirror', title: activityTitles['mirror'], instruction: 'Geliş açısını ayarla, yansıyan ışının normal ve yüzeyle yaptığı açıları ölç.', kind: 'model', exercise: mirrorModel, typeLabel: 'Optik modeli' },
    ],
  },
  {
    id: 'turkish', name: 'Türkçe ve Edebiyat', icon: Feather, color: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
    activities: [
      { id: 'words', title: activityTitles['words'], instruction: 'Cümledeki ipuçlarını kullan ve seçiminin gerekçesini gör.', kind: 'custom', Lab: WordArtLab, typeLabel: 'Dil incelemesi' },
      { id: 'paragraph', title: activityTitles['paragraph'], instruction: 'Bir öyküyü zaman ve gönderme ipuçlarından yararlanarak sırala.', kind: 'arrange', exercise: paragraph, typeLabel: 'Kart sıralama' },
      { id: 'inference', title: activityTitles['inference'], instruction: 'Metnin söylediğiyle ipuçlarından çıkarılan sonucu birbirinden ayır.', kind: 'decision', rounds: inference, typeLabel: 'Metin çözümleme' },
    ],
  },
  {
    id: 'english', name: 'İngilizce', icon: Map, color: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    activities: [
      { id: 'map', title: activityTitles['map'], instruction: 'Yön tariflerini dinle veya oku, haritada kütüphaneye ulaş.', kind: 'custom', Lab: EnglishMapLab, typeLabel: 'Sesli harita' },
      { id: 'invitation', title: activityTitles['invitation'], instruction: 'Davet, gerekçe, alternatif öneri ve kabulü konuşmadaki yerine koy.', kind: 'arrange', exercise: invitation, typeLabel: 'Diyalog kurma' },
      { id: 'announcements', title: activityTitles['announcements'], instruction: 'Duyuruyu dinle ve değişen zaman, yer veya hazırlıkla ilgili karar ver.', kind: 'decision', rounds: announcements, typeLabel: 'Dinleme anlama' },
    ],
  },
  {
    id: 'history', name: 'Sosyal Bilgiler ve İnkılap Tarihi', icon: Landmark, color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
    activities: [
      { id: 'chronology', title: activityTitles['chronology'], instruction: 'Meclisin açılışından 1924 Anayasası’na uzanan olayları sırala.', kind: 'arrange', exercise: chronology, typeLabel: 'Zaman çizelgesi' },
      { id: 'source-types', title: activityTitles['source-types'], instruction: 'Bir fotoğrafı, günlüğü, hatırayı ve tarih incelemesini ayırt et.', kind: 'arrange', exercise: sourceTypes, typeLabel: 'Kaynak eşleştirme' },
      { id: 'compare-sources', title: activityTitles['compare-sources'], instruction: 'Kurmaca bir kasaba arşivinde hangi iddianın hangi belgeyle desteklendiğini araştır.', kind: 'decision', rounds: compareSources, typeLabel: 'Kanıt sorgulama' },
    ],
  },
  {
    id: 'religion', name: 'Din Kültürü ve Ahlak Bilgisi', icon: MoonStar, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    activities: [
      { id: 'worship', title: activityTitles['worship'], instruction: 'Namaz, oruç, zekât ve gönüllü yardımı örneklerden ayırt et.', kind: 'arrange', exercise: worship, typeLabel: 'Kavram eşleştirme' },
      { id: 'donation-plan', title: activityTitles['donation-plan'], instruction: 'Bir kitap desteğini ihtiyaç dinlemeden değerlendirmeye kadar planla.', kind: 'arrange', exercise: donationPlan, typeLabel: 'Süreç planlama' },
      { id: 'ethical-choices', title: activityTitles['ethical-choices'], instruction: 'Üç sınıf durumunda sorumluluk, mahremiyet ve dürüstlüğü gözet.', kind: 'decision', rounds: ethicalChoices, typeLabel: 'Durum çözümleme' },
    ],
  },
  {
    id: 'philosophy', name: 'Felsefe ve Düşünme', icon: BookOpen, color: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    activities: [
      { id: 'argument', title: activityTitles['argument'], instruction: 'İddiayı, kanıtı, gerekçeyi ve itirazı bir okul önerisi üzerinden ayır.', kind: 'arrange', exercise: argument, typeLabel: 'Argüman haritası' },
      { id: 'counterexamples', title: activityTitles['counterexamples'], instruction: '“Bütün” ve “bazı” ifadelerinin kanıt ölçüsünü nasıl değiştirdiğini incele.', kind: 'decision', rounds: counterexamples, typeLabel: 'Mantık deneyi' },
      { id: 'fairness', title: activityTitles['fairness'], instruction: 'Ortak bir aracı paylaşırken ihtiyaç, süre ve önceliği tart.', kind: 'decision', rounds: fairness, typeLabel: 'Düşünce deneyi' },
    ],
  },
];

export const allActivityIds = new Set<string>(subjectGroups.flatMap(({ activities }) => activities.map(({ id }) => id)));
