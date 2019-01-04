'use strict';

const express = require('express');
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 8080;
const app = express();

const catchAsyncErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  console.error('errorHandler', err);
  res.status(500).send({errors: `Error running your code. ${err}`});
}

app.use(function (req, res, next) {
  // res.header('Access-Control-Allow-Origin', origin);
  // res.header('Content-Type', 'application/json;charset=utf-8');
  // res.header('Cache-Control', 'private, max-age=300');
  next(); 
});

app.use('/', catchAsyncErrors(async function useChrome(req, res, next) {
  let browser;
  const browserWSEndpoint = app.locals.browserWSEndpoint;

  if (browserWSEndpoint) {
    browser = await puppeteer.connect({ browserWSEndpoint });
  } else {
    console.info('Starting new Chrome instance...');
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const pages = await browser.pages();

    if (pages.length) {
      await Promise.all(pages.map(page => page.close()));
    }

    app.locals.browserWSEndpoint = await browser.wsEndpoint();
  }

  app.locals.browser = browser;

  next();
}));

app.get('/', (req, res, next) => {
  res.status(200).send(`HEY!`);
});

app.get('/run', (req, res, next) => {
  require('./puppet')(req, res, next);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
