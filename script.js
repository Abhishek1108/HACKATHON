const puppeteer=require("puppeteer");
let cheerio=require("cheerio");
let request=require("request");
let nodeMailer=require("nodemailer");
let cronJob=require('cron').CronJob;

let browser;

async function loadBrowser(){
  
    browser=await puppeteer.launch({
        headless:false,
        defaultViewport:null,
        args: ["--start-maximized"],
     
     })
     let tab= await browser.newPage();
      
      await  tab.goto("https://www.amazon.in/SS-Acc0400-Josh-Mens-Shoes/dp/B0822Z9BSC/");
  
      return tab;
};
// .a-size-medium.a-color-price.priceBlockDealPriceString

async function getPriceDetails(tab){
  // await tab.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
   await tab.waitForSelector(".a-size-medium.a-color-price.priceBlockDealPriceString",{visible:true});
 let obj= await tab.$(".a-size-medium.a-color-price.priceBlockDealPriceString");

let price= await tab.evaluate(function(element){
  return element.textContent;
},obj);
 
handlePriceDetails(price,tab);

}

async function handlePriceDetails(price,tab){
   let priceinMunber= price.split("");
   let priceString="";
   for(let i=2;i<priceinMunber.length;i++){
    
     priceString+=priceinMunber[i];
   }
 if(parseInt(priceString)<60000){
    addProductTocart(tab);
 }else{
   browser.close();
 }
}


async function addProductTocart(tab){
   
 // await  tab.waitForNavigation(),
  await tab.waitForSelector(".nav-line-1-container",{visible:true})
  await tab.click(".nav-line-1-container");
  await tab.waitForSelector(".a-input-text.a-span12.auth-autofocus.auth-required-field",{visible:true})
  await tab.type(".a-input-text.a-span12.auth-autofocus.auth-required-field","9306625880")
  await tab.click(".a-button-input");
  await tab.waitForSelector('.a-input-text.a-span12.auth-autofocus.auth-required-field',{visible:true});
  await tab.type(".a-input-text.a-span12.auth-autofocus.auth-required-field","Erabhishek@1108");
  await  tab.click(".a-button-input");
  await tab.waitForSelector('#add-to-cart-button',{visible:true});
  await tab.click("#add-to-cart-button");
  await tab.waitForSelector('.a-button.a-button-primary.hlb-checkout-button.huc-v2-primary-button.huc-button-large',{visible:true});
  await tab.click(".a-button.a-button-primary.hlb-checkout-button.huc-v2-primary-button.huc-button-large");


 // document.querySelectorAll('[data-action="page-spinner-show"]')[0].getAttribute("href");
  await tab.waitForSelector('[data-action="page-spinner-show"]',{visible:true});
  let allArress=await tab.$$('[data-action="page-spinner-show"]');//$$=quesryselector
let selectedAdressLink=allArress[0];


let addressLink= await tab.evaluate(function(element){
  return element.getAttribute("href");
},selectedAdressLink);
addressLink="https://www.amazon.in"+addressLink;
browser.close();
sendNotificationMail(addressLink);

}


async function sendNotificationMail(link){
   
  let transpoter= nodeMailer.createTransport({
    service:'gmail',
    port:587,
    secure:false,
    requireTLS:true,
    auth :{
      user:'',
      pass:'',
    }
    
  });

  let textTosend= link;

  await transpoter.sendMail({
       from:'',
       to:'',
       subject: "Price Dropped",
       text:textTosend,
      
  });

}

async function startTrcking(){

let page= await loadBrowser();
  let job=new cronJob('0 */2 * * *',function(){
  console.log("aaaaaaaaaaaaaaaa");
    getPriceDetails(page);

  },null,true,null,null,true);
job.start();
  
}

startTrcking();
