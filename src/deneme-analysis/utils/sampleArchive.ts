import { SUBJECT_LIST, type ParsedExamBundle, type SubjectKey, type SubjectScore } from '../types/exam';

const topics: Record<SubjectKey, string> = {
  turkce: 'Paragrafta ana düşünce',
  tarih: 'Millî Mücadele kronolojisi',
  din: 'Zekât ve dayanışma',
  ingilizce: 'In the Kitchen',
  matematik: 'Üslü ifadeler',
  fen: 'Mevsimler ve iklim',
};

export const sampleBundles: ParsedExamBundle[] = [1, 2, 3].map((examOrder) => {
  const id = 'bilge-ornek-' + examOrder;
  const examDate = `2026-10-${10 + examOrder * 4}`;
  const uploadedAt = examDate + 'T09:00:00Z';
  const name = 'Örnek Deneme ' + examOrder;
  return {
    examMeta: { id, name, fileName: id, schoolName: 'Bilge Akademi Örnek Sınıfları', location: '', examDate, uploadedAt, examOrder, studentCount: 12, isSample: true },
    records: Array.from({ length: 12 }, (_, student) => {
      const numara = String(99001 + student);
      const studentName = 'Örnek Öğrenci ' + (student + 1);
      const sinif = student < 6 ? '8-A' : '8-B';
      const subjects = {} as Record<SubjectKey, SubjectScore>;
      const toplam: SubjectScore = { soru: 0, dogru: 0, yanlis: 0, bos: 0, net: 0, basariYuzdesi: 0 };
      for (const [index, { key, questionCount }] of SUBJECT_LIST.entries()) {
        const dogru = Math.max(2, Math.min(questionCount - 1, Math.round(questionCount * 0.55) + (student + index * 2) % 5 + examOrder - 2));
        const yanlis = Math.min(questionCount - dogru, (student + index + 2) % 4 + 1);
        const bos = questionCount - dogru - yanlis;
        const net = dogru - yanlis / 3;
        subjects[key] = { soru: questionCount, dogru, yanlis, bos, net, basariYuzdesi: dogru / questionCount * 100 };
        toplam.soru += questionCount;
        toplam.dogru += dogru;
        toplam.yanlis += yanlis;
        toplam.bos += bos;
        toplam.net += net;
      }
      toplam.basariYuzdesi = toplam.dogru / toplam.soru * 100;
      return {
        studentKey: 'bilge-ornek-ogrenci-' + numara,
        numara,
        name: studentName,
        sinif,
        record: {
          examId: id, examName: name, examOrder, examDate, uploadedAt, toplam, subjects,
          lgsPuan: Math.round(100 + toplam.net / 90 * 400), dereceler: {},
          kazanimlar: SUBJECT_LIST.map(({ key }) => {
            const dogru = (student + examOrder + SUBJECT_LIST.findIndex((item) => item.key === key)) % 4;
            return { subject: key, text: topics[key], soru: 3, dogru, yanlis: 3 - dogru, bos: 0, basariYuzdesi: dogru / 3 * 100 };
          }),
        },
      };
    }),
  };
});
