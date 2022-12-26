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

    // await page.goto('https://www.sportingbet.com/en/labelhost/login');
    // await page.waitForNavigation();

    // Login

    // let emailInput = await page.waitForSelector('#userId');
    // await emailInput?.type(`${process.env.EMAIL}`);

    // let passwordInput = await page.waitForSelector('[type="password"]');
    // await passwordInput?.type(`${process.env.PASS}`);

    // let buttonLogIn = await page.waitForSelector('button');
    // await buttonLogIn?.click();

    // #Fim Login
    await page.goto('https://sports.sportingbet.com/pt-br/sports/futebol-4');
    await page.waitForNavigation();

    console.log("Antes do WaitForSelector");
    await page.waitForSelector('.grid-event.ms-active-highlight > div');

    let listaDeJogos = await page.$$('.grid-event.ms-active-highlight > div');

    listaDeJogos.map(async (e: ElementHandle<HTMLDivElement>, i) => {
        const innerText = await (await e.getProperty('innerText')).jsonValue();
        console.log(`Item[${i}]:`, innerText);
    });

    //#region 
    // console.log('Quantidade de selecionados || ', listaDeJogos?.length);
    // console.log(`Array || ${listaDeJogos.length}`, listaDeJogos);
    //#endregion

    // await page.screenshot({ path: 'example.png' });
    // await browser.close();
})();