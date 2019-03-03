// ==UserScript==
// @name         iXBT articles filter
// @namespace    https://tampermonkey.net/
// @version      0.1
// @description  Removes annoying articles
// @author       Alex Rabinovitch
// @match        https://www.ixbt.com
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    var bannedURLs = ["/home/", "/live/"];
    var urlsRegEx = new RegExp(bannedURLs.join("|"));

    try
    {
        var $, jQuery;
        $ = jQuery = window.jQuery;
        var articles = $('li.item.item-big');

        articles.each(function(i, article) {
            var links = $(article).find('a').clone();

            links.each(function(j, link) {
                var linkURL = link.href;
                if (urlsRegEx.test(linkURL))
                {
                    $(article).remove();
                }
            });
        });
    }
    catch(e)
    {
        console.log('Error: ' + e.message);
    }
})();
