const puppeteer = require('puppeteer');
const express = require('express');

const app = express();
app.use(express.static('.'));
const server = app.listen(8080, async () => {
    try {
        const browser = await puppeteer.launch({headless: 'new'});
        const page = await browser.newPage();
        await page.goto('http://localhost:8080/index.html');
        
        await new Promise(r => setTimeout(r, 2000));
        
        await page.click('button[data-tab="profile"]');
        await new Promise(r => setTimeout(r, 1000));
        
        const profileBox = await page.$('#view-profile');
        const box = await profileBox.boundingBox();
        console.log('Profile bounding box:', box);
        
        const html = await page.evaluate(() => {
            const el = document.getElementById('view-profile');
            return {
                isHidden: el.classList.contains('hidden'),
                isActive: el.classList.contains('active'),
                offsetWidth: el.offsetWidth,
                offsetHeight: el.offsetHeight,
                display: window.getComputedStyle(el).display
            };
        });
        console.log('Profile element status:', html);
        
        await browser.close();
    } catch (e) {
        console.error(e);
    } finally {
        server.close();
    }
});
