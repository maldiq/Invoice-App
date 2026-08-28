export const company = {
  appName: 'Tagihanku',
  name: 'SolusiWeb',
  tagline: 'Your IT Partner',
  bank: {
    name: 'BNI',
    accountNumber: '1409061757',
    accountHolder: 'Moh Aly Shodiqin',
  },
  footerMessage: 'THANK YOU FOR YOUR BUSINESS!',
  dueDays: 7,

  /**
   * true  = tampilkan landing page sebelum login
   * false = langsung ke halaman login
   */
  landingEnabled: true,

  /**
   * true  = tampilkan tab/tombol Daftar (register)
   * false = hanya login (akun dibuat manual / admin)
   */
  registerEnabled: false,

  /** Branding situs / landing (bisa beda dari nama di invoice) */
  siteName: 'SolusiWeb',

  /**
   * URL publik situs (tanpa slash di akhir).
   * Isi domain production agar canonical / Open Graph benar.
   * Contoh: 'https://invoice.solusiweb.net'
   */
  siteUrl: '',

  seo: {
    title: 'Tagihanku — Aplikasi Invoice Online | SolusiWeb',
    description:
      'Buat invoice profesional, kelola klien, unduh PDF, dan pantau piutang (draft, terkirim, lunas, jatuh tempo). Multi-user, aman, siap dipakai di HP. Oleh Solusiweb Mojokerto.',
    keywords:
      'aplikasi invoice, invoice online, Tagihanku, buat invoice PDF, software tagihan, kelola piutang, SolusiWeb, Mojokerto',
  },

  contact: {
    email: 'info@solusiweb.net',
    phone: '0859 3011 6494',
    phone_wa: '6285930116494',
    address:
      'Dsn Panggreman RT/RW 02/01 Ds Tunggalpager Kec Pungging Mojokerto, 61384',
    maps_url:
      'https://www.google.com/maps/place/Jasa+Pembuatan+Website+Profesional+-+SolusiWeb/@-7.5145548,112.5764628,17z/data=!3m1!4b1!4m6!3m5!1s0x2e780bd925d003c3:0x10ac3ed7343d9299!8m2!3d-7.5145548!4d112.5764628!16s%2Fg%2F11vb5vdf50?hl=id',
    maps_embed:
      'https://maps.google.com/maps?q=-7.5145548,112.5764628&hl=id&z=17&output=embed',
  },
};
