//const express = require('express');
const cheerio=require('cheerio');
const axios=require('axios');


const url ='http://quotes.toscrape.com/';

const quotes=[];
axios.get(url)
.then((response)=>{

    const $=cheerio.load(response.data);
    $('.quote').each((index, element) => {
        const quoteText = $(element).find('.text').text();
        const author = $(element).find('.author').text();
        const authorUrl = $(element).find('.quote a').attr('href');
        quotes.push({ Quote: quoteText, author:author , authorUrl:authorUrl });
      });
  
      console.log(quotes);
    })
    .catch((error) => {
      console.log(error);
    });
