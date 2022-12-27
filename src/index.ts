import puppeteer, { ElementHandle } from 'puppeteer';
import dotenv from "dotenv";
import fs from 'fs';
dotenv.config();

const Run = async () => {
    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1440,
        height: 800,
        deviceScaleFactor: 1,
    });

    await page.setUserAgent('UA-TEST');
    page.setDefaultNavigationTimeout(90000);

    await page.goto('https://www.sportingbet.com/en/labelhost/login');
    await page.waitForNavigation();

    //Login
    let emailInput = await page.waitForSelector('#userId');
    await emailInput?.type(`${process.env.EMAIL}`);

    let passwordInput = await page.waitForSelector('[type="password"]');
    await passwordInput?.type(`${process.env.PASS}`);

    let buttonLogIn = await page.waitForSelector('button');
    await buttonLogIn?.click();
    // #Fim Login

    const soccerButton = await page.$(`button[href="/pt-br/sports/futebol-4"]`);
    await soccerButton?.click();
    await page.waitForNavigation();


    await page.waitForSelector('.grid-event.ms-active-highlight > div');
    let listaDeJogos = await page.$$('.grid-event.ms-active-highlight > div');

    listaDeJogos.map(async (gameItem: ElementHandle<HTMLDivElement>, index) => {
        const innerText = await (await gameItem.getProperty('innerText')).jsonValue();
        // console.log(`Item[${index}]:`, innerText);

        //Verificar se há odds disponíveis para apostar
        let hasOdds = !innerText.toLocaleLowerCase().includes('aposte agora');
        //Verifica se tem jogo ao vivo
        let hasLive = innerText.toLocaleLowerCase().includes("ao vivo");

        if (hasOdds && hasLive) {
            //Verificar o placar do jogo favorável para o dono da casa, dois gols de diferença
            let scoreboardGameItem = await listaDeJogos[index].asElement();

            let scoreTeam1 = await scoreboardGameItem?.$('.column.score.show-score-right>div:nth-of-type(1)>div>div').then(a => a?.getProperty('innerText').then(b => b.jsonValue()));
            let scoreTeam2 = await scoreboardGameItem?.$('.column.score.show-score-right>div:nth-of-type(2)>div>div').then(a => a?.getProperty('innerText').then(b => b.jsonValue()));

            let team1 = await scoreboardGameItem?.$('.participants-pair-game>div:nth-of-type(1)>div>div').then(c => c?.getProperty('innerText').then(d => d.jsonValue()));
            let team2 = await scoreboardGameItem?.$('.participants-pair-game>div:nth-of-type(1)>div>div').then(f => f?.getProperty('innerText').then(g => g.jsonValue()));

            let odd1Value = await scoreboardGameItem?.$('div>ms-option-group>ms-option:nth-of-type(1)').then(h => h?.getProperty('innerText').then(j => j.jsonValue()));
            let odd1Element = await scoreboardGameItem?.$('div>ms-option-group>ms-option:nth-of-type(1)');
            let odd2 = await scoreboardGameItem?.$('div>ms-option-group>ms-option:nth-of-type(3)').then(k => k?.getProperty('innerText').then(l => l.jsonValue()));
            let timeGame = await scoreboardGameItem?.$('ms-live-timer').then(k => k?.getProperty('innerText').then(l => l.jsonValue().then()));
            let timeGameInNumber = Number(String(timeGame).slice(5, 7));

            // Pega a data atual para adicionar no jogo que será salvo no .txt    
            const date = new Date();
            let formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

            let game = { Partida: `${team1} ${scoreTeam1} x ${scoreTeam2} ${team2} || ${timeGame} = ${timeGameInNumber} - ${formattedDate}` };

            let score1 = Number(scoreTeam1);
            let score2 = Number(scoreTeam2);

            //Verificar se to time da casa ganha de 2x0, 3x0 ou 3x1;
            let leoStrategy =
                score1 === 1 && score2 === 0 ||
                score1 === 2 && score2 === 0 ||
                score1 === 3 && score2 === 0 ||
                score1 === 3 && score2 === 1 &&
                timeGameInNumber >= 60;

            if (leoStrategy) {
                odd1Element?.click();
                let confirmBetButton = await scoreboardGameItem?.$('.betslip-place-button.btn.btn-success.btn-unfocused');
                await confirmBetButton?.click().then(async () => {
                    const date = new Date();
                    // formata a data e hora no formato dd/mm/aaaa hh:mm:ss

                    // converte o objeto em uma string JSON
                    const json = JSON.stringify(game);

                    // adiciona a string JSON ao final do arquivo "output.txt"
                    fs.appendFile('bets.txt', `${json}\n`, (err) => {
                        if (err) throw err;
                        console.log('---------- Bet confirmed! ----------');
                    });

                    console.log(game); // imprime os dados do jogo
                    await page.screenshot({ path: 'example.png' });
                });
            }

        }
    });

    setInterval(Run, 60000);

    // console.log('Quantidade de selecionados || ', listaDeJogos?.length);
    // console.log(`Array || ${listaDeJogos.length}`, listaDeJogos);
    //#endregion

    // await browser.close();
};
