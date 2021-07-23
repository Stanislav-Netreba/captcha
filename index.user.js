// ==UserScript==
// @name hcaptcha
// @description автокапча
// @author Stas Netreba
// @license MIT
// @version 1.0
// @include https://lessons.zennolab.com/captchas/hcaptcha/*
// @exclude https://lessons.zennolab.com/captchas/hcaptcha/verify.php?*
// @connect rucaptcha.com
// @grant GM_xmlhttpRequest
// ==/UserScript==

const siteDetails = {
  sitekey: '9730e4be-0997-4abd-aef3-bbdd241d211c',
  pageurl: 'https://lessons.zennolab.com/captchas/hcaptcha/?level=easy'
}

const apiKey = '6db9972030b51a3f3e82094878592bb0';

(async () => {
      console.log('start')
      const requestId = await initiateCaptchaRequest(apiKey);
      console.log(requestId)


      const response = await pollForRequestResults(apiKey, requestId);

      Array.from(await document.querySelector('.h-captcha').childNodes).splice(1, 2)[0].innerHTML=response
      Array.from(await document.querySelector('.h-captcha').childNodes).splice(1, 2)[1].innerHTML=response
      document.querySelector('.submit').click();


  })()

function GM_get(url){
  return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
          method: 'GET',
          url,
          onload: resolve,
          onerror: reject
      } );
  });
}

async function initiateCaptchaRequest(apiKey) {
  const formData = {
      method: 'hcaptcha',
      sitekey: siteDetails.sitekey,
      key: apiKey,
      pageurl: siteDetails.pageurl,
      json: 1
  };
  let response = await GM_get(`https://rucaptcha.com/in.php?key=${apiKey}&method=hcaptcha&sitekey=${siteDetails.sitekey}&pageurl=${siteDetails.pageurl}$json=1`);
  return response.responseText.split('|')[1];
}

async function pollForRequestResults(key, id, retries = 30, interval = 1500, delay = 15000) {
  await sleep(delay);
  let token = await requestCaptchaResults(key, id);
  while (token == 'CAPCHA_NOT_READY') {
      await sleep(delay);
      token = await requestCaptchaResults(key, id);
  };
  return token;
}

async function requestCaptchaResults(apiKey, requestId) {
  const url = `https://rucaptcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
  const res = await GM_get(url);
  return JSON.parse(res.responseText).request;
}

function sleep(time){
  return new Promise(r => setTimeout(r, time));
};