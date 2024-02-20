const puppeteer = require('puppeteer');
const fs = require('fs');

const url = process.argv[2];
const region = process.argv[3];

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    const dictionary = {
        "Москва и область": '#screenPortal-screen > div > div.FeatureHeaderHorizontalBase_mobile__oN3jb > div > div > div.UiRegionListBase_root__Z4_yT > div.UiRegionListBase_listWrapper__Iqbd5 > ul > li:nth-child(1)',
        "Санкт-Петербург и область": '#screenPortal-screen > div > div.FeatureHeaderHorizontalBase_mobile__oN3jb > div > div > div.UiRegionListBase_root__Z4_yT > div.UiRegionListBase_listWrapper__Iqbd5 > ul > li:nth-child(2)',
        "Владимирская обл.": '#screenPortal-screen > div > div.FeatureHeaderHorizontalBase_mobile__oN3jb > div > div > div.UiRegionListBase_root__Z4_yT > div.UiRegionListBase_listWrapper__Iqbd5 > ul > li:nth-child(3)',
        "Калужская обл.": '#screenPortal-screen > div > div.FeatureHeaderHorizontalBase_mobile__oN3jb > div > div > div.UiRegionListBase_root__Z4_yT > div.UiRegionListBase_listWrapper__Iqbd5 > ul > li:nth-child(4)',
        "Рязанская обл.": '#screenPortal-screen > div > div.FeatureHeaderHorizontalBase_mobile__oN3jb > div > div > div.UiRegionListBase_root__Z4_yT > div.UiRegionListBase_listWrapper__Iqbd5 > ul > li:nth-child(5)',
        "Тверская обл.": '#screenPortal-screen > div > div.FeatureHeaderHorizontalBase_mobile__oN3jb > div > div > div.UiRegionListBase_root__Z4_yT > div.UiRegionListBase_listWrapper__Iqbd5 > ul > li:nth-child(6)',
        "Тульская обл.": '#screenPortal-screen > div > div.FeatureHeaderHorizontalBase_mobile__oN3jb > div > div > div.UiRegionListBase_root__Z4_yT > div.UiRegionListBase_listWrapper__Iqbd5 > ul > li:nth-child(7)',
    }

    await page.goto(url, {
        waitUntil: 'load'
    });
    await page.waitForTimeout(3000);

    await page.waitForSelector('#__next > div.Modal_root__kPoVQ.Modal_open__PaUmT > div')
    await page.click('#__next > div.Modal_root__kPoVQ.Modal_open__PaUmT > div > div > div.Content_root__7DKIP.Content_modal__gAOHB > button')
    await page.waitForTimeout(2000)

    await page.click('#headerFirstRow > div.UiLayoutContainer_container__Kve37.UiHeaderHorizontalBase_container__luPJr > div.UiHeaderHorizontalBase_isTablet__pWXTU > div.UiHeaderHorizontalBase_burger__xPtTl > button')
    await page.waitForTimeout(3000)

    await page.waitForSelector('#screenPortal-screen > div > div.FeatureHeaderHorizontalBase_mobile__oN3jb > div > div > div.FeatureAddressSettingMobile_root__cHi3q > div.FeatureAddressSettingMobile_regionWrapper__PVKLR');
    await page.click('#screenPortal-screen > div > div.FeatureHeaderHorizontalBase_mobile__oN3jb > div > div > div.FeatureAddressSettingMobile_root__cHi3q > div.FeatureAddressSettingMobile_regionWrapper__PVKLR')
    await page.waitForTimeout(3000)

    await page.waitForSelector('#screenPortal-screen > div > div.FeatureHeaderHorizontalBase_mobile__oN3jb > div > div > div.UiRegionListBase_root__Z4_yT > div.UiRegionListBase_listWrapper__Iqbd5');
    await page.click(dictionary[region])
    await page.waitForTimeout(3000)

    await page.screenshot({path: 'screenshot.jpg', fullPage: true});

    const priceHandles = await page.$$('.ProductPage_informationBlock__vDYCH')
    const reviewsHandles = await page.$$('.ProductPage_actionsRow__KE_23')

    let price, priceOld, rating, reviewCount

    for (let item of reviewsHandles) {
        rating = await page.evaluate(el => el.querySelector("div.ActionsRow_stars__EKt42 > div > span").textContent, item)
        reviewCount = await page.evaluate(el => el.querySelector("div.ActionsRow_reviews__AfSj_ > button").textContent, item)
    }

    for (const item of priceHandles) {
        price = await page.evaluate(el => el.querySelector('div.ProductPage_desktopBuy__cyRrC > div > div').textContent, item)
        if(!price.match(/(Временно отсутствует)|(Недоступен для заказа)/)){
            price = await page.evaluate(el => el.querySelector("div.PriceInfo_root__GX9Xp > span").textContent, item)
            priceOld = await page.evaluate(el => el.querySelector("span.Price_price__QzA8L.Price_size_XS__ESEhJ.Price_role_old__r1uT1").textContent, item)
        }
    }

    let productInfo = `price=${price}\npriceOld=${priceOld}\nrating=${rating}\nreviewCount=${reviewCount}\n`
    console.log(productInfo)

    fs.writeFileSync('product.txt', productInfo);
    await browser.close();

})();


