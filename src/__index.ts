import puppeteer, { ElementHandle } from 'puppeteer';
import dotenv from "dotenv";
dotenv.config();

(async () => {
    const browser = await puppeteer.launch({ headless: true });

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

    // Login

    let emailInput = await page.waitForSelector('#userId');
    await emailInput?.type(`${process.env.EMAIL}`);

    let passwordInput = await page.waitForSelector('[type="password"]');
    await passwordInput?.type(`${process.env.PASS}`);

    let buttonLogIn = await page.waitForSelector('button');
    await buttonLogIn?.click();

    // #Fim Login

    let futebol = await page.waitForSelector('[href="/pt-br/sports/futebol-4"]', { timeout: 0 });
    await futebol?.click();

    // let listaFutebolAmericano = await page.waitForSelector('.grid-six-pack-event', { timeout: 0 });
    let listaDeJogos = await page.waitForSelector('.grid-event.ms-active-highlight.ng-star-inserted>div', { timeout: 0 });

    console.log("Fora", { listaDeJogos });

    await page.screenshot({ path: 'example.png' });

    console.log("fim do jogo")
    // await browser.close();
})();