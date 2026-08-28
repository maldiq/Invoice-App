import { company } from '../config/company';
import { applySeo } from '../utils/seo';
import { useEffect } from 'react';

const pains = [
  {
    title: 'Invoice tercecer',
    text: 'File Word/Excel tersebar di HP, laptop, dan chat — sulit dilacak mana yang sudah dibayar.',
  },
  {
    title: 'Data klien diketik ulang',
    text: 'Setiap tagihan baru harus menulis alamat dan email lagi. Ribet dan rawan salah.',
  },
  {
    title: 'Tidak tahu status piutang',
    text: 'Draft, terkirim, lunas, atau jatuh tempo? Tanpa laporan, uang macet sulit dipantau.',
  },
];

const benefits = [
  {
    title: 'Tagihan rapi dalam hitungan menit',
    text: 'Dari klien sampai PDF siap kirim — tanpa template yang berantakan.',
  },
  {
    title: 'Piutang selalu terlihat',
    text: 'Laporan per status membantu Anda tahu mana yang perlu ditagih ulang.',
  },
  {
    title: 'Aman untuk banyak pengguna',
    text: 'Setiap akun hanya melihat invoice & klien miliknya. Cocok dipakai tim atau beberapa bisnis.',
  },
  {
    title: 'Siap dipakai di HP',
    text: 'Buat dan cek invoice dari mana saja. Layout sudah mobile-friendly.',
  },
];

const features = [
  { title: 'Login & multi-user', desc: 'Akun terpisah, data terisolasi per user' },
  { title: 'CRUD invoice', desc: 'Buat, edit, hapus, ubah status' },
  { title: 'Nomor otomatis', desc: 'Format INV + tanggal + urut' },
  { title: 'Master klien', desc: 'Pilih klien, data terisi otomatis' },
  { title: 'PDF siap unduh', desc: 'Header brand, rekening, footer profesional' },
  { title: 'Laporan status', desc: 'Draft, terkirim, lunas, jatuh tempo' },
  { title: 'Update password', desc: 'Kelola keamanan akun sendiri' },
  { title: 'Due date 7 hari', desc: 'Default jatuh tempo bisa disesuaikan' },
];

const testimonials = [
  {
    quote:
      'Dulu invoice saya masih di Excel. Sekarang klien tinggal dipilih, PDF langsung jadi, dan saya tahu mana yang belum bayar.',
    name: 'Andi',
    role: 'Pemilik toko komputer',
  },
  {
    quote:
      'Fitur laporan status paling berguna. Overdue langsung kelihatan, jadi follow-up jadi lebih cepat.',
    name: 'Sari',
    role: 'Admin jasa IT',
  },
  {
    quote:
      'Bisa dipakai beberapa orang tanpa saling campur data. Cocok untuk tim kecil kami.',
    name: 'Budi',
    role: 'Freelancer web',
  },
];

function waLink() {
  const phone = company.contact.phone_wa;
  const text = encodeURIComponent(
    `Halo ${company.siteName}, saya tertarik dengan ${company.appName}.`
  );
  return `https://wa.me/${phone}?text=${text}`;
}

function InvoiceMock() {
  return (
    <div className="landing-mock" aria-hidden="true">
      <div className="landing-mock__sheet">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm font-semibold text-slate-800">{company.name}</p>
            <p className="text-xs text-slate-500 italic">{company.tagline}</p>
          </div>
          <p className="text-2xl font-light text-slate-300 tracking-wide">INVOICE</p>
        </div>
        <div className="flex justify-between text-xs text-slate-600 mb-5 gap-4">
          <div>
            <p className="uppercase text-[10px] text-slate-400 mb-1">Bill To</p>
            <p className="font-medium text-slate-800">PT Maju Jaya</p>
            <p>finance@majujaya.co.id</p>
          </div>
          <div className="text-right">
            <p>INV-20260820-0002</p>
            <p className="mt-1 inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
              PAID
            </p>
          </div>
        </div>
        <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
          <div className="flex justify-between text-slate-600">
            <span>Domain .com (1 tahun)</span>
            <span>Rp 200.000</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Hosting SSD 5GB</span>
            <span>Rp 450.000</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-2 mt-2">
            <span>Total</span>
            <span>Rp 650.000</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ onStart }) {
  const { contact, siteName, appName, registerEnabled } = company;

  useEffect(() => {
    applySeo({ path: '/' });
  }, []);

  const scrollTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing">
      <a href="#konten-utama" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:rounded">
        Lewati ke konten
      </a>
      <header className="landing-nav">
        <div className="landing-wrap flex items-center justify-between gap-4 py-4">
          <a
            href="#konten-utama"
            onClick={scrollTop}
            className="text-left hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 rounded"
            aria-label={`${siteName} — ${appName}, kembali ke beranda`}
          >
            <p className="font-display text-lg font-semibold text-white tracking-tight">{siteName}</p>
            <p className="text-xs text-teal-100/80">{appName}</p>
          </a>
          <nav className="flex items-center gap-2" aria-label="Navigasi utama">
            <a href="#fitur" className="hidden sm:inline-flex btn landing-btn-ghost">
              Fitur
            </a>
            <a href="#kontak" className="hidden sm:inline-flex btn landing-btn-ghost">
              Kontak
            </a>
            <button type="button" onClick={onStart} className="btn landing-btn-solid">
              Masuk
            </button>
          </nav>
        </div>
      </header>

      <main id="konten-utama">
      {/* 1. Value Proposition */}
      <section className="landing-hero" aria-labelledby="hero-heading">
        <div className="landing-hero__bg" aria-hidden="true" />
        <div className="landing-wrap relative grid lg:grid-cols-2 gap-10 lg:gap-14 items-center min-h-[calc(100vh-4.5rem)] py-12 lg:py-16">
          <div className="landing-fade-up">
            <p className="font-display text-teal-200 text-sm sm:text-base mb-3 tracking-wide">
              {siteName} · {appName}
            </p>
            <h1 id="hero-heading" className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold text-white leading-[1.1] max-w-xl">
              Tagihan profesional, piutang terkendali.
            </h1>
            <p className="mt-5 text-teal-50/90 text-base sm:text-lg max-w-md leading-relaxed">
              Buat invoice, kelola klien, unduh PDF, dan pantau status pembayaran — semua dari satu aplikasi.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={onStart} className="btn landing-btn-solid landing-btn-lg">
                {registerEnabled ? 'Coba sekarang' : 'Masuk'}
              </button>
              <a href={waLink()} target="_blank" rel="noreferrer" className="btn landing-btn-ghost landing-btn-lg text-center">
                Chat WhatsApp
              </a>
            </div>
            <p className="mt-4 text-xs text-teal-100/60">
              Demo: demo@nizam.id / demo123
            </p>
          </div>
          <div className="landing-fade-up landing-fade-up--delay relative">
            <InvoiceMock />
          </div>
        </div>
      </section>

      {/* 2. Pain Points */}
      <section className="landing-section bg-[#f3f6f5]">
        <div className="landing-wrap">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 max-w-xl">
            Masih ribet menagih seperti ini?
          </h2>
          <p className="mt-3 text-slate-600 max-w-lg">
            Banyak usaha IT dan jasa lokal kehilangan waktu — dan uang — karena proses invoice masih manual.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-8 sm:gap-6">
            {pains.map((p, i) => (
              <div key={p.title} className="landing-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="font-display text-4xl text-teal-700/20 font-semibold">0{i + 1}</span>
                <h3 className="mt-2 font-display text-xl font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Solution */}
      <section className="landing-section bg-white">
        <div className="landing-wrap grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900">
              Satu alur: dari klien sampai PDF.
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              {appName} menyatukan master klien, pembuatan invoice, unduhan PDF berbranding, dan laporan status.
              Setiap user punya data sendiri — aman dipakai bersama tanpa saling campur.
            </p>
            <ol className="mt-8 space-y-4">
              {[
                'Daftar / login akun Anda',
                'Simpan data klien sekali',
                'Buat invoice & unduh PDF',
                'Pantau lunas vs jatuh tempo di laporan',
              ].map((step, i) => (
                <li key={step} className="flex gap-3 items-start text-slate-700">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-teal-800 text-white text-sm flex items-center justify-center font-semibold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="landing-solution-panel">
            <p className="font-display text-lg font-semibold text-white mb-4">Yang Anda dapatkan</p>
            <ul className="space-y-3 text-teal-50/95 text-sm">
              <li className="flex gap-2"><span className="text-amber-300">▸</span> Invoice dengan header brand & rekening transfer</li>
              <li className="flex gap-2"><span className="text-amber-300">▸</span> Multi-user dengan isolasi data</li>
              <li className="flex gap-2"><span className="text-amber-300">▸</span> Laporan draft / sent / paid / overdue</li>
              <li className="flex gap-2"><span className="text-amber-300">▸</span> Tampilan nyaman di desktop & HP</li>
            </ul>
            <button type="button" onClick={onStart} className="btn landing-btn-solid mt-8 w-full sm:w-auto">
              Mulai buat invoice
            </button>
          </div>
        </div>
      </section>

      {/* 4. Benefits */}
      <section className="landing-section bg-[#0f2f2c] text-white">
        <div className="landing-wrap">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold max-w-xl">
            Manfaat yang langsung terasa
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {benefits.map((b) => (
              <div key={b.title} className="border-t border-white/15 pt-5">
                <h3 className="font-display text-xl font-semibold text-amber-200">{b.title}</h3>
                <p className="mt-2 text-teal-50/80 text-sm leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Features */}
      <section className="landing-section bg-[#f3f6f5]" id="fitur">
        <div className="landing-wrap">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900">
            Fitur lengkap
          </h2>
          <p className="mt-3 text-slate-600 max-w-lg">
            Semua yang dibutuhkan untuk operasional invoice harian — tanpa kompleksitas yang berlebihan.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white/80 border border-slate-200/80 rounded-xl p-4 sm:p-5">
                <h3 className="font-display font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="landing-section bg-white">
        <div className="landing-wrap">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900">
            Dipakai untuk menagih dengan lebih tenang
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="border-l-2 border-teal-700 pl-5">
                <p className="text-slate-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4">
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA + Contact */}
      <section className="landing-section landing-cta" id="kontak">
        <div className="landing-wrap">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white">
              Siap merapikan tagihan bisnis Anda?
            </h2>
            <p className="mt-4 text-teal-50/85 leading-relaxed">
              Mulai pakai {appName} sekarang, atau hubungi {siteName} untuk konsultasi dan penyesuaian.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={onStart} className="btn landing-btn-solid landing-btn-lg">
                {registerEnabled ? 'Masuk / Daftar' : 'Masuk'}
              </button>
              <a href={waLink()} target="_blank" rel="noreferrer" className="btn landing-btn-ghost landing-btn-lg text-center">
                WhatsApp {contact.phone}
              </a>
            </div>
          </div>

          <div className="mt-14 grid lg:grid-cols-2 gap-8 items-start">
            <div className="text-teal-50/90 text-sm space-y-3">
              <p className="font-display text-lg font-semibold text-white">{siteName}</p>
              <p>
                <a className="hover:text-amber-200 underline-offset-2 hover:underline" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </p>
              <p>
                <a className="hover:text-amber-200" href={`tel:${contact.phone.replace(/\s/g, '')}`}>
                  {contact.phone}
                </a>
              </p>
              <p className="leading-relaxed max-w-md">{contact.address}</p>
              <a
                href={contact.maps_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-amber-200 hover:text-amber-100"
              >
                Buka di Google Maps →
              </a>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20 aspect-[4/3] min-h-[220px]">
              <iframe
                title="Lokasi Solusiweb"
                src={contact.maps_embed}
                className="w-full h-full min-h-[220px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
      </main>

      <footer className="bg-[#0a1f1d] text-teal-100/50 text-sm py-6">
        <div className="landing-wrap flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} {siteName}. {appName}.</p>
          <button type="button" onClick={onStart} className="text-left sm:text-right hover:text-teal-50">
            Masuk ke aplikasi →
          </button>
        </div>
      </footer>
    </div>
  );
}
