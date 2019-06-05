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


(function() {
    'use strict';

    try
    {
        var selectors = [];
        selectors.push({articleSelector:"div.element.B3.ghcite.noBottomPadding", indicatorSelector:"span.paywall_art_indicator"});
        selectors.push({articleSelector:"ul.mta_pic_items", indicatorSelector:"img.paywall_img_indicator"});
        selectors.push({articleSelector:"div.pphp_li_items", indicatorSelector:"span.ynet_pay_54x20.article"});
        selectors.push({articleSelector:"div.pphp_li_items", indicatorSelector:"img[src='/images/premium/small_paywall_icon_54x20.png']"});
        selectors.push({articleSelector:"div.pphp_li_items", indicatorSelector:"span.ynet_pay_58x20.article"});
        selectors.push({articleSelector:"li.relative_block", indicatorSelector:"img[src='/images/premium/xsmall_paywall_icon_45x14.png']"});
        selectors.push({articleSelector:"li[data-vr-contentbox]", indicatorSelector:"img[src='/images/premium/xsmall_paywall_icon_45x14.png']"});
        selectors.push({articleSelector:"li.pphp_main_first", indicatorSelector:"a.pplus_pay_54x20"});
        selectors.push({articleSelector:"li.pphp_main_first", indicatorSelector:"span.ynet_pay_58x20.article"});
        selectors.push({articleSelector:"li.pphp_main_first", indicatorSelector:"img[src='/images/premium/left_small_paywall_icon_58x20.png']"});
        selectors.push({articleSelector:"li.MultiImagesLeft_main_first", indicatorSelector:"a.ynet_pay_54x20"});
        selectors.push({articleSelector:"li.multiimagesnews_main_first", indicatorSelector:"img[src='/images/premium/small_paywall_icon_54x20.png']"});
        selectors.push({articleSelector:"li[style='position:relative;']", indicatorSelector:"img[src='/images/premium/small_paywall_icon_54x20.png']"});
        selectors.push({articleSelector:"li[style='position:relative;']", indicatorSelector:"img[src='/images/premium/small_paywall_icon_54x20.png']"});
        selectors.push({articleSelector:"li[style='position:relative;']", indicatorSelector:"img[src='/images/premium/left_small_paywall_icon_58x20.png']"});
        selectors.push({articleSelector:"div.rpphp_main_header", indicatorSelector:"img[src*='/yplus.png']"});
        selectors.push({articleSelector:"li", indicatorSelector:"img[src*='/xsmall_paywall_icon_45x14.png']"});

        var i;
        for(i = 0; i < selectors.length; i++)
        {
            findItemsAndRemoveByChildrenExistence(selectors[i].articleSelector, selectors[i].indicatorSelector);
        }
    }
    catch(e)
    {
        console.log('Error: ' + e.message);
    }
})();

function findItemsAndRemoveByChildrenExistence(itemsSelector, childrenSelector)
{
    var items = $(itemsSelector);

    items.each(function(i, item) {
        var indicators = $(item).find(childrenSelector).clone();

        if(indicators.length > 0)
        {
            $(item).remove();
        }
    });
}
