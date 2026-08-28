const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:3000/ ...');
  await page.context().addCookies([{
    name: 'auth_token',
    value: 'dummy',
    domain: 'localhost',
    path: '/'
  }]);

  await page.goto('http://localhost:3000/');
  console.log('Page loaded');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
