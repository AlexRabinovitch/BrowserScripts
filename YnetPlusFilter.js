// ==UserScript==
// @name         Ynet plus filter
// @namespace    https://tampermonkey.net/
// @version      0.1
// @description  Removes payed items
// @author       Alex Rabinovitch
// @match        https://www.ynet.co.il/home/*
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

var selectors = [];

(function() {
    'use strict';

    fillSelectors();

    findNodesAndClear();

})();

function fillSelectors()
{
    selectors.push({articleSelector:"div.layoutItem.multi-article-images-1280-2", indicatorSelector: ["div:contains('Pplus')"]});
    selectors.push({articleSelector:"div.layoutItem.multi-article-1280-2", indicatorSelector: ["a[href*='ynet.co.il/judaism']"]});
    selectors.push({articleSelector:"div.layoutItem.tab-1280", indicatorSelector: ["a[href*='ynet.co.il/games']",
                                                                                  "div:contains('פוליסע')"]});
    selectors.push({articleSelector:"div.layoutItem.multi-images-1280", indicatorSelector: ["div:contains('תוכן מקודם')",
                                                                                           "div:contains('ועידות וכנסים')",
                                                                                           "div:contains('טיסות במחירים שווים')",
                                                                                           "div:contains('פוליסע')",
                                                                                           "div:contains('אולי פספסתם')"]});
    selectors.push({articleSelector:"div.MultiImagesMagazine", indicatorSelector: ["a[href*='ynet.co.il/laisha']"]});
    selectors.push({articleSelector:"div.layoutItem.multi-article-top-1280", indicatorSelector: ["div:contains('אסטרולוגיה')",
                                                                                                "a[href*='frogi.co.il/']",
                                                                                                "a[href*='ynet.co.il/blazer']"]});
    selectors.push({articleSelector:"div.MultiArticleTopComponenta1280", indicatorSelector: ["div:contains('אופנה')",
                                                                                            "div:contains('מעורבות')"]});
    selectors.push({articleSelector:"div.layoutItem.strip-1150", indicatorSelector: ["div[class='havakIcon onImage']",
                                                                                     "a[href*='z.ynet.co.il']",
                                                                                     "a[href*='ynet.co.il/judaism']",
                                                                                     "a[href*='ynet.co.il/laisha']",
                                                                                     "a[href*='lps.ynet.co.il']"]});
    selectors.push({articleSelector:"div.slotView", indicatorSelector: ["div[class='havakIcon onImage']",
                                                                        "div[class='havakIcon onTextRow']",
                                                                        "div[class*='havakIcon onImage']",
                                                                        "div[class='havakIcon inTextDiv']",
                                                                        "div:contains('בשיתוף')",
                                                                        "div:contains('מייגן')",
                                                                        "div:contains('קרדשיאן')",
                                                                        "a[href*='pplus.ynet.co.il']",
                                                                        "a[href*='xnet.ynet.co.il']",
                                                                        "a[href*='ynet.co.il/judaism']",
                                                                        "a[href*='ynet.co.il/dating']",
                                                                        "a[href*='ynet.co.il/laisha']",
                                                                        "a[href*='lps.ynet.co.il']"]});
    //selectors.push({articleSelector:"div.MultiImagesComponenta.standart", indicatorSelector: ["div:contains('Pplus')"]});
    selectors.push({articleSelector:"div.layoutItem.multi-article-images", indicatorSelector: ["div:contains('Pplus')",
                                                                                               "a[href*='benefits.yedioth.co.il']",
                                                                                               "a[href*='ynet.co.il/activism/category/36572']",
                                                                                               "a[href*='ynet.co.il/laisha']",
                                                                                               "div:contains('+ynet')"]});
    selectors.push({articleSelector:"div.layoutItem.multi-articles-section", indicatorSelector: ["div:contains('לייף סטייל')"]});
    selectors.push({articleSelector:"div.layoutItem.multi-article", indicatorSelector: ["div:contains('אסטרולוגיה')",
                                                                                        "a[href*='xnet.ynet.co.il']",
                                                                                        "a[href*='ynet.co.il/judaism']",
                                                                                        "a[href*='frogi.co.il/']",
                                                                                        "a[href*='ynet.co.il/dating']"]});
    selectors.push({articleSelector:"div.layoutItem.multi-audio-row", indicatorSelector: ["div:contains('פודקאסטים')"]});
    selectors.push({articleSelector:"div.layoutItem.opinions", indicatorSelector: ["div:contains('רלוונט')"]});
}

function findNodesAndClear()
{
    try
    {
        var i;
        for(i = 0; i < selectors.length; i++)
        {
            findItemsAndRemoveByChildrenExistence(document, selectors[i].articleSelector, selectors[i].indicatorSelector);
        }
    }
    catch(e)
    {
        console.log('Error: ' + e.message);
    }
}

function findItemsAndRemoveByChildrenExistence(root, itemsSelector, childrenSelector)
{
    /*var items = root.querySelectorAll(itemsSelector);

    if(!items)
    {
        return;
    }
    for(var i = 0; i < items.length; i++)
    {
        var item = items[i];
        if(item.querySelector(childrenSelector))
        {
            item.remove();
        }
    }*/

    try
    {
        var jroot = $(root);

        var items;
        if(root === document)
        {
            items = $(itemsSelector);
        }
        else
        {
            items = jroot.children(itemsSelector);
        }

        items.each(function(i, item) {
            for(var j = 0; j < childrenSelector.length; j++)
            {
                var indicators = $(item).find(childrenSelector[j]).clone();

                if(indicators.length > 0)
                {
                    $(item).remove();
                    break;
                }
            }
        });
    }
    catch(e)
    {
        console.log('Error: ' + e.message);
    }

}
