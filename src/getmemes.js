const axios = require('axios');
const cheerio = require('cheerio');
const pageUrl = 'https://www.reddit.com/r/memes/';


async function getMemes(){
    const { data } = await axios.get(pageUrl);
    const $ = cheerio.load(data);
    const div = $('.rpBJOHq2PR60pnwJlUyP0');
    const memes = [];
    
    div.find('._3JgI-GOrkmyIeDeyzXdyUD _2CSlKHjH7lsjx0IpjORx14').each((i, element) =>{
        const $element = $(element);
        console.log($element)
    })
}

getMemes();

