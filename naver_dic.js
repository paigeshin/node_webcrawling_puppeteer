const puppeteer = require('puppeteer')
const cheerio = require('cheerio')


async function main() {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    await page.goto('https://en.dict.naver.com/#/search?range=all&query=sophisticated')
    const html = await page.content()
    const $ = cheerio.load(html)
    
    console.log(html)
    console.log("getting naver data....")
    console.log($(".u_word_dic").text())
}

main()