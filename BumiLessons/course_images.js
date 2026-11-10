// Static markup and dynamically created art use the same verified CDN edition.
const bumiImageBase = document.querySelector('meta[name="bumi-images"]').content;
function bumiCourseImage(img, name) {
    img.dataset.local = '../assets/' + name;
    img.src = location.protocol === 'file:' ? img.dataset.local : bumiImageBase + name;
}
document.addEventListener('error', event => {
    const img = event.target;
    if (img instanceof HTMLImageElement && img.dataset.local && img.src.startsWith(bumiImageBase)) {
        img.src = img.dataset.local;
    }
}, true);
document.addEventListener('DOMContentLoaded', () => {
    if (location.protocol !== 'file:') return;
    for (const el of document.querySelectorAll('[data-local]')) {
        if (el instanceof HTMLImageElement) el.src = el.dataset.local;
        else if (el instanceof HTMLAnchorElement) el.href = el.dataset.local;
    }
});
