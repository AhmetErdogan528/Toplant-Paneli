

export const DEPARTMENTS = [
  {
    id: "d1",
    name: "Bilgi İşlem Daire Başkanlığı",
    people: [
      { id: "p1", name: "Emre Kaya", title: "Sistem Yöneticisi" },
      { id: "p2", name: "Sena Yıldız", title: "Yazılım Geliştirici" },
      { id: "p3", name: "Onur Demir", title: "Ağ Sorumlusu" },
    ],
  },
  {
    id: "d2",
    name: "Öğrenci İşleri Daire Başkanlığı",
    people: [
      { id: "p4", name: "Elif Arslan", title: "Şube Müdürü" },
      { id: "p5", name: "Burak Şahin", title: "Uzman" },
      { id: "p6", name: "Merve Aydın", title: "Memur" },
    ],
  },
  {
    id: "d3",
    name: "Kütüphane ve Dokümantasyon",
    people: [
      { id: "p7", name: "Deniz Koç", title: "Kütüphaneci" },
      { id: "p8", name: "Ayşe Çelik", title: "Dokümantasyon Uzmanı" },
    ],
  },
  {
    id: "d4",
    name: "İnsan Kaynakları Daire Başkanlığı",
    people: [
      { id: "p9", name: "Caner Öztürk", title: "Daire Başkanı" },
      { id: "p10", name: "Zeynep Aksoy", title: "Personel Uzmanı" },
      { id: "p11", name: "Kemal Er", title: "Uzman Yardımcısı" },
    ],
  },
  {
    id: "d5",
    name: "Mali İşler Daire Başkanlığı",
    people: [
      { id: "p12", name: "Gül Turan", title: "Muhasebe Uzmanı" },
      { id: "p13", name: "Tolga Kurt", title: "Bütçe Sorumlusu" },
    ],
  },
  {
    id: "d6",
    name: "Halkla İlişkiler ve Tanıtım",
    people: [
      { id: "p14", name: "İrem Polat", title: "Tanıtım Sorumlusu" },
      { id: "p15", name: "Barış Yalçın", title: "Sosyal Medya Uzmanı" },
    ],
  },
];
export const ALL_PEOPLE = DEPARTMENTS.flatMap((d) =>
  d.people.map((p) => ({
    ...p,
    departmentId: d.id,
    departmentName: d.name,
  }))
);
