# puppeteer - craglist

```bash
npm i --save puppeteer cheerio
```

# Example 1, initialize puppeteer and go to website

```jsx
//initialize puppeteer and go to a website
async function example1(){
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    await page.goto('https://www.google.com')
}
```

# Example 2, craglist webscraping

### Data to retrieve

- date it was posted
- job title
- hood
- job description url
- job description text
- compensation

### Avoid being blocked

```jsx
async function sleep(miliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, miliseconds)
    })
}

//looping for retrieving all data 
async function scrapeJobDescriptions(listings, page) {
    for(let i = 0; i < listings.length; i++) { // use fori statement => one by one - foreach => concurrently, not correct data  
        await page.goto(listings[i].url)
        const html = page.content()
        await sleep(1000)
    }
}
```

```jsx
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')

//write demo data in order to clarify your objective
const scrapingResults = [
    {
        title: "Entry Level Software Engineer - C or C++",
        datePosted: new Date("2019-07-26 12:00:00"),
        neighborhood: "(palo alto)",
        url: "https://sfbay.craigslist.org/eby/sof/d/oakland-software-engineer-ii/7269779647.html",
        jobDescription: "Responsible for designing, developing, and maintaining payment platform software and applications. Specific duties include: designing, developing and integrating innovative and complex APIs and payment processing solution",
        compensation: "Up to US$0.00 per year"
    }
]

async function scrapeListings(page) {
    await page.goto('https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof')
    const html = await page.content()
    const $ = cheerio.load(html)

    //example getting title...
    //$(".result-title").each((index, element) => { console.log($(element).text()) }) //get result title
    
    //example getting href...
    //$(".result-title").each((index, element) => { console.log($(element).attr("href")) }) //get href attributes 

    //map returns a new array 
    const listings = $(".result-info").map((index, element) => {
        //find() => find child element 
        const titleElement = $(element).find(".result-title")
        const timeElement = $(element).find(".result-date")
        const hoodElement = $(element).find(".result-hood")
        const title = $(titleElement).text()
        const url = $(titleElement).attr("href")
        const datePosted = $(timeElement).attr("datetime")
        const hood = $(hoodElement).text().trim().replace("(", "").replace(")", "")
        return {
            title,
            url,
            datePosted,
            hood
        }
    }).get() //call `.get()` when you call map function with cheerio 
    return listings
}

//looping for retrieving all data 
async function scrapeJobDescriptions(listings, page) {
    for(let i = 0; i < listings.length; i++) { // use fori statement => one by one - foreach => concurrently, not correct data  
        await page.goto(listings[i].url)
        const html = page.content()
        await sleep(1000)
    }
}

async function sleep(miliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, miliseconds)
    })
}

async function main() {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    const listings = await scrapeListings(page) //get listing
    const listingsWithJobDescription = await scrapeJobDescriptions(listings, page) //go thorugh `listngs.url` one by one  
    console.log(listings) 
}

main()
```

# Finished

```jsx
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const fs = require('fs')

//write demo data in order to clarify your objective
const scrapingResults = [
    {
        title: "Entry Level Software Engineer - C or C++",
        datePosted: new Date("2019-07-26 12:00:00"),
        neighborhood: "(palo alto)",
        url: "https://sfbay.craigslist.org/eby/sof/d/oakland-software-engineer-ii/7269779647.html",
        jobDescription: "Responsible for designing, developing, and maintaining payment platform software and applications. Specific duties include: designing, developing and integrating innovative and complex APIs and payment processing solution",
        compensation: "Up to US$0.00 per year"
    }
]

async function scrapeListings(page) {
    await page.goto('https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof')
    const html = await page.content()
    const $ = cheerio.load(html)

    //example getting title...
    //$(".result-title").each((index, element) => { console.log($(element).text()) }) //get result title
    
    //example getting href...
    //$(".result-title").each((index, element) => { console.log($(element).attr("href")) }) //get href attributes 

    //map returns a new array 
    const listings = $(".result-info").map((index, element) => {
        //find() => find child element 
        const titleElement = $(element).find(".result-title")
        const timeElement = $(element).find(".result-date")
        const hoodElement = $(element).find(".result-hood")
        const title = $(titleElement).text()
        const url = $(titleElement).attr("href")
        const datePosted = $(timeElement).attr("datetime")
        const hood = $(hoodElement).text().trim().replace("(", "").replace(")", "")
        return {
            title,
            url,
            datePosted,
            hood
        }
    }).get() //call `.get()` when you call map function with cheerio 
    return listings
}

//looping for retrieving all data 
async function scrapeJobDescriptions(listings, page) {
    for(let i = 0; i < listings.length; i++) { // use fori statement => one by one - foreach => concurrently, not correct data  
        await page.goto(listings[i].url)
        const html = await page.content()
        const $ = cheerio.load(html)
        const jobDescription = $('#postingbody').text()
        const compensation = $("p.attrgroup > span:nth-child(1) > b").text()
        listings[i].jobDescription = jobDescription
        listings[i].compensation = compensation
        console.log(listings[i].compensation)
        await sleep(1000) //1 second sleep 
        if(i === 10) {
            break
        }
    }
    return listings
}

async function sleep(miliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, miliseconds)
    })
}

async function main() {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    const listings = await scrapeListings(page) //get listing
    const listingsWithJobDescription = await scrapeJobDescriptions(listings, page) //go thorugh `listngs.url` one by one to retreive `description`
    fs.writeFileSync('result.json', JSON.stringify(listingsWithJobDescription))
}

main()
```

# Add Mongoose to save results

```bash
npm i mongoose --save
```

### Mongoose

```jsx
async function connectToMongoDB() {
    await mongoose.connect(`mongodb+srv://test:testpassword@@cluster0.zwpei.mongodb.net/crawling?retryWrites=true&w=majority`)
    console.log("Connected to mongoDB")
}

const listingModel = new Listing(listings[i])
await listingModel.save()
await sleep(1000) //1 second sleep
```

### Schema

```jsx
const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
    title: String, 
    datePosted: Date, 
    neighborhood: String, 
    url: String, 
    jobDescription: String,
    compensiation: String 
})

const Listing = mongoose.model("Listing", listingSchema)

module.exports = Listing
```