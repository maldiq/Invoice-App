import { company } from '../config/company';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Set title, description, Open Graph, Twitter, canonical, JSON-LD.
 * Panggil saat landing / login berubah.
 */
export function applySeo({ title, description, path = '/', noindex = false } = {}) {
  const { seo, siteName, appName, siteUrl, contact } = company;
  const pageTitle = title || seo.title;
  const pageDescription = description || seo.description;
  const url = siteUrl ? `${siteUrl.replace(/\/$/, '')}${path}` : undefined;

  document.title = pageTitle;
  upsertMeta('name', 'description', pageDescription);
  upsertMeta('name', 'keywords', seo.keywords);
  upsertMeta('name', 'author', siteName);
  upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:locale', 'id_ID');
  upsertMeta('property', 'og:site_name', siteName);
  upsertMeta('property', 'og:title', pageTitle);
  upsertMeta('property', 'og:description', pageDescription);
  if (url) upsertMeta('property', 'og:url', url);

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', pageTitle);
  upsertMeta('name', 'twitter:description', pageDescription);

  if (url) upsertLink('canonical', url);

  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl || undefined,
    email: contact.email,
    telephone: contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address,
      addressLocality: 'Mojokerto',
      addressCountry: 'ID',
    },
  };

  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: appName,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: pageDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    provider: {
      '@type': 'Organization',
      name: siteName,
    },
  };

  upsertJsonLd('seo-jsonld-org', org);
  upsertJsonLd('seo-jsonld-app', software);
}

export function applyLoginSeo() {
  applySeo({
    title: `Login — ${company.appName}`,
    description: `Masuk atau daftar ${company.appName} untuk mengelola invoice dan klien Anda.`,
    path: '/',
    noindex: true,
  });
}
