# BİLGE AKADEMİ — Güvenlik ve Firestore Kuralları Şartnamesi (Phase 0)

## 1. Veri Değişmezleri (Data Invariants)
1. **Öğretmen İzolasyonu**: `classes`, `students`, `subjects`, `exams`, `grades`, `attendance` koleksiyonlarındaki her belge `teacherId == request.auth.uid` koşulunu sağlamalıdır; hiçbir öğretmen başka bir öğretmenin öğrencilerine erişemez.
2. **İlişkisel Bütünlük (Master Gate)**:
   - Bir `student` oluşturulurken `classId` belgesi Firestore'da var olmalı ve `teacherId == request.auth.uid` olmalıdır.
   - Bir `grade` veya `attendance` oluşturulurken hem `studentId` hem de `classId` belgeleri var olmalı ve her ikisinin `teacherId` alanı `request.auth.uid` olmalıdır.
3. **Kendi Kendine Rol Yükseltme Yasağı**: Kullanıcılar kendi `/users/{userId}` belgelerini oluştururken yalnızca `role: "student"` (veya doğrulanmış önyüklü yönetici için `"admin"`) atayabilir; güncelleme sırasında `role` alanı değiştirilemez.
4. **PII İzolasyonu**: Kullanıcı e-posta bilgisi `/users/{userId}/private/contact` altında tutulur ve yalnızca `request.auth.uid == userId` veya `isAdmin()` tarafından okunabilir.
5. **Doğrulanmış E-posta ve Sunucu Zaman Damgası**: Tüm yazma işlemlerinde `request.auth.token.email_verified == true`, oluşturmada `createdAt == request.time`, güncellemede `updatedAt == request.time` zorunludur.

## 2. "Dirty Dozen" Saldırı Yükleri (Red Team Test Senaryoları)
1. **Gölge Alan Enjeksiyonu (`students`)**: Geçerli alanlara ek olarak `isAdmin: true` eklenmesi → `hasOnly()` ile `PERMISSION_DENIED`.
2. **Kimlik Taklidi (`students`)**: `teacherId` alanına başka bir öğretmenin UID'sinin yazılması → `PERMISSION_DENIED`.
3. **Yetkisiz Rol Yükseltme (`users`)**: Kullanıcının kendi profilinde `role: "admin"` göndermesi → `PERMISSION_DENIED`.
4. **Yetkisiz Profil Güncellemesi (`users`)**: Kullanıcının güncelleme sırasında `role` alanını `"teacher"` yapması → `affectedKeys().hasOnly(...)` ile `PERMISSION_DENIED`.
5. **Yetim Öğrenci Kaydı (`students`)**: Var olmayan `classId` ile öğrenci oluşturulması → `exists()` kontrolü ile `PERMISSION_DENIED`.
6. **Başka Öğretmenin Sınıfına Öğrenci Ekleme (`students`)**: Başka öğretmene ait `classId` verilmesi → `get(class).data.teacherId == request.auth.uid` ile `PERMISSION_DENIED`.
7. **PII Sızıntısı (`users/{other}/private/contact`)**: Oturum açmış başka bir kullanıcının iletişim belgesini okuması → `PERMISSION_DENIED`.
8. **İstemciye Bırakılmış Liste Sorgusu (`students`)**: Filtresiz `getDocs(collection(db, 'students'))` çağrısı → `resource.data.teacherId == request.auth.uid` ile `PERMISSION_DENIED`.
9. **Belge ID Zehirlenmesi (`classes/{200-char-junk}`)**: 128 karakterden uzun veya geçersiz karakterli belge ID'si → `isValidId()` ile `PERMISSION_DENIED`.
10. **Sahte Zaman Damgası (`grades`)**: `createdAt` alanına geçmiş bir istemci tarihi gönderilmesi → `incoming().createdAt == request.time` ile `PERMISSION_DENIED`.
11. **Değer Zehirlenmesi (`grades`)**: `score` alanına `-50` veya `999` gönderilmesi ya da metin gönderilmesi → `isValidGrade()` ile `PERMISSION_DENIED`.
12. **Doğrulanmamış E-posta ile Yönetici Taklidi**: `email_verified: false` olan bir token ile yönetici e-postasının kullanılması → `email_verified == true` şartı ile `PERMISSION_DENIED`.
