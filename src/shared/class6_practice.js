const course = '/english/klasse6/';
const practiceHome = course + 'uebungen/';
const modeParam = 'uebungen';
const sections = ['test-1', 'test-1-login', 'grammar-trainer', 'vocabulary-unit1', 'describing-people', 'irregular-verbs'];

function isIndex(path, directory) {
  return path === directory || path === directory.slice(0, -1) ||
    path === directory + 'index' || path === directory + 'index.html';
}

function isExerciseOrLogin(path) {
  return isIndex(path, '/student/') ||
    sections.some(section => path === course + section || path.startsWith(course + section + '/'));
}

function inPracticeMode() {
  return isIndex(location.pathname, practiceHome) ||
    (isExerciseOrLogin(location.pathname) && new URLSearchParams(location.search).get(modeParam) === '1');
}

export function class6PracticeHref(href) {
  if (!inPracticeMode()) return href;

  const url = new URL(href, location.href);
  if (url.origin !== location.origin) return null;
  if (isIndex(url.pathname, course) || isIndex(url.pathname, practiceHome) ||
      (isIndex(location.pathname, '/student/') && isIndex(url.pathname, '/'))) {
    return practiceHome + url.hash;
  }
  if (!isExerciseOrLogin(url.pathname)) return null;

  url.searchParams.set(modeParam, '1');
  return url.pathname + url.search + url.hash;
}

export function scopeClass6PracticeLinks(root = document) {
  if (!inPracticeMode()) return;

  for (const link of root.querySelectorAll('a[href]')) {
    const href = class6PracticeHref(link.getAttribute('href'));
    if (href === null) {
      link.hidden = true;
      link.removeAttribute('href');
    } else {
      link.setAttribute('href', href);
      if (href === practiceHome && link.textContent.trim().startsWith('←')) {
        link.textContent = '← Zurück zur Übungsauswahl';
      }
    }
  }
  for (const back of root.querySelectorAll('[data-class6-back]')) back.hidden = false;
}
