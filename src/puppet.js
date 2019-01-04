'use strict';

const puppeteer = require('puppeteer');


module.exports = async (req, res, next) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://cowcamo.jp/');

  await page.type('#q', '猫');

  await page.click('#q + button');

  const resultsSelector = '.p-searchResult__body .p-entries__list > .p-entries__item .c-item';

  await page.waitForSelector(resultsSelector);

  // get titles from the page.
  const links = await page.evaluate(resultsSelector => {
    const anchors = Array.from(document.querySelectorAll(resultsSelector));
  
    return anchors.map(anchor => {
      const title = anchor.querySelector('.c-item__title').textContent.trim();
      return `${title} - ${anchor.href}`;
    });
  }, resultsSelector);

  res.status(200).send(links.join('\n'));

  await browser.close();
};
