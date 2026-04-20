import puppeteer from 'puppeteer';

const BASE = 'https://retail-inventory-platform-gamma.vercel.app';

const credentials = [
  { email: 'inv-admin@surtibolivia.bo', pass: 'admin123', role: 'admin' },
  { email: 'inv-gestor@surtibolivia.bo', pass: 'manager123', role: 'manager' },
  { email: 'inv-empleado@surtibolivia.bo', pass: 'employee123', role: 'employee' },
  { email: 'empleado@surtibolivia.bo', pass: 'emp123', role: 'employee' },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  console.log(`\n=== Prueba Manual UI - ${BASE}/login ===\n`);

  for (const cred of credentials) {
    // Fresh browser context per user (clean cookies)
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    let authError = null;

    page.on('response', async resp => {
      if (resp.url().includes('/api/auth/callback/credentials')) {
        if (resp.status() >= 400) {
          authError = `HTTP ${resp.status()}`;
        }
      }
    });

    try {
      console.log(`--- ${cred.email} (${cred.role}) ---`);
      
      await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2', timeout: 30000 });

      // Fill form
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.type('input[type="email"]', cred.email);
      await page.type('input[type="password"]', cred.pass);

      // Click submit and wait for network response
      await Promise.all([
        page.waitForResponse(
          resp => resp.url().includes('/api/auth/callback/credentials'),
          { timeout: 20000 }
        ),
        page.click('button[type="submit"]'),
      ]);

      // Give the SPA time to process the response and update
      await new Promise(r => setTimeout(r, 3000));

      // Check if session was created by looking at the header
      const sessionInfo = await page.evaluate(() => {
        const body = document.body.innerText;
        // Look for signs of authenticated state in the header
        const hasLogout = body.includes('Salir');
        const hasUserInfo = body.includes('Admin') || body.includes('Gestor') || body.includes('Empleado');
        const headerText = document.querySelector('header')?.innerText || '';
        return { hasLogout, hasUserInfo, headerText: headerText.substring(0, 150) };
      });

      await page.screenshot({ path: `screenshot-${cred.role}.png` });

      if (authError) {
        console.log(`  [FALLO] ${authError}`);
      } else if (sessionInfo.hasLogout) {
        console.log(`  [OK] Login exitoso - Header: ${sessionInfo.headerText.replace(/\n/g, ' | ')}`);
      } else {
        console.log(`  [?] Sin confirmacion clara. Header: ${sessionInfo.headerText}`);
      }

    } catch (err) {
      console.log(`  [FALLO] ${err.message}`);
    } finally {
      await page.close();
      await context.close();
    }
  }

  await browser.close();
  console.log('=== Fin de prueba UI ===');
})();
