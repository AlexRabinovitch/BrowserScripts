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
        var articlesSelectors = ["div.element.B3.ghcite.noBottomPadding", //0
                                 "ul.mta_pic_items", //1
                                 "div.pphp_li_items", //2
                                 "li.relative_block" ,//3
                                 "li[data-vr-contentbox]", //4
                                 "li.pphp_main_first", //5
                                 "li.MultiImagesLeft_main_first", //6
                                 "div.pphp_li_items", //7
                                 "li.multiimagesnews_main_first" //8
                                ];
        var indicatorsSelectors = ["span.paywall_art_indicator", //0
                                   "img.paywall_img_indicator", //1
                                   "span.ynet_pay_54x20.article", //2
                                   "img[src='/images/premium/xsmall_paywall_icon_45x14.png']", //3
                                   "img[src='/images/premium/xsmall_paywall_icon_45x14.png']", //4
                                   "a.pplus_pay_54x20", //5
                                   "a.ynet_pay_54x20", //6
                                   "img[src='/images/premium/small_paywall_icon_54x20.png']", //7
                                   "img[src='/images/premium/small_paywall_icon_54x20.png']" //8
                                  ];

        var i;
        for(i = 0; i < articlesSelectors.length; i++)
        {
            findItemsAndRemoveByChildrenExistence(articlesSelectors[i], indicatorsSelectors[i]);
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
