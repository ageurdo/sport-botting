import puppeteer, { ElementHandle } from 'puppeteer';
import dotenv from "dotenv";
dotenv.config();

(async () => {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1080,
        height: 762,
        deviceScaleFactor: 1,
    });

    await page.setUserAgent('UA-TEST');
    page.setDefaultNavigationTimeout(90000);

    await page.goto('https://www.sportingbet.com/en/labelhost/login');
    await page.waitForNavigation();

    let emailInput = await page.waitForSelector('#userId');
    await emailInput?.type(`${process.env.EMAIL}`);

    let passwordInput = await page.waitForSelector('[type="password"]');
    await passwordInput?.type(`${process.env.PASS}`);

    let buttonLogIn = await page.waitForSelector('button');
    await buttonLogIn?.click();

    let futebol = await page.waitForSelector('[href="/pt-br/sports/ao-vivo/futebol-americano-11"]', { timeout: 0 });
    await futebol?.click();

    let listaDeJogos = await page.waitForSelector('.grid-six-pack-event', { timeout: 0 });
    await futebol?.click();

    await page.evaluate(() => {
        console.log('teste', document.querySelectorAll('.grid-six-pack-event'));
    });

    console.log({ listaDeJogos });

    await page.screenshot({ path: 'example.png' });
    // await browser.close();
})();