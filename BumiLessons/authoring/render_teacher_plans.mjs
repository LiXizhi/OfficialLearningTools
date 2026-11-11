import {mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const h5 = new URL('../../BumiLessons-H5/', import.meta.url);
const qa = new URL('../../../../.test-runtime/node/package.json', import.meta.url);
const {chromium} = createRequire(process.argv[2] || qa)('playwright');
const browser = await chromium.launch({channel:process.env.TEST_BROWSER_CHANNEL || 'chrome'});
try {
    const page = await browser.newPage();
    await page.emulateMedia({media:'print'});
    await mkdir(new URL('teacher-plans/', h5), {recursive:true});
    for (let n = 1; n <= 16; n++) {
        const id = 'l' + String(n).padStart(2, '0');
        await page.goto(new URL('teacher.html#' + id, h5).href);
        await page.locator('#' + id + '.on [data-pane="t"].pane.on').waitFor();
        await page.evaluate(async () => {
            await Promise.all(Array.from(document.querySelectorAll('.view.on img'), img => {
                img.loading = 'eager';
                return img.decode();
            }));
            await document.fonts.ready;
        });
        await page.pdf({path:fileURLToPath(new URL('teacher-plans/' + id + '.pdf', h5)),
            preferCSSPageSize:true, printBackground:true});
    }
} finally {
    await browser.close();
}
