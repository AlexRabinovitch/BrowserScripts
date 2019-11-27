// ==UserScript==
// @name         iXBT news filter
// @namespace    https://tampermonkey.net/
// @version      0.1
// @description  Removes annoying news and comments
// @author       Alex Rabinovitch
// @match        https://www.ixbt.com/news*
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var bannedHeaderItems = ["Xiaomi", "Oukitel", "Leagoo"];
    var bannedContentItems = ["инсайдер", "рендер"];

    // Remove by wrong headers
    filterArticlesByContent('h2', bannedHeaderItems);
    //Remove by wrong article text
    filterArticlesByContent('.item__text', bannedContentItems);

})();

function filterArticlesByContent(selector, bannedItems)
{
    try
    {
        var articles = $('div.item.no-padding');

        articles.each(function(i, article) {
            var headers = $(article).find(selector).clone();

            headers.each(function(j, header) {
                var headerText = header.innerText;
                if (new RegExp(bannedItems.join("|")).test(headerText))
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
}

waitForKeyElements ("section.comment", filterComments);

function filterComments(jnode)
{
    console.log('filterComments');

    var bannedItems = ["Вызов девушек", "подтянуть живот", "Кому нужны проститутки", "­", "Качественный секс", "Кaчеcтвенный сeкc", "Всем приветик", "❤️"];

    try
    {
        var comments = jnode.find('div.comment-content.text');
        comments.each(function(i, comment)
        {
            var commentText = comment.innerText;
            if (new RegExp(bannedItems.join("|")).test(commentText))
            {
                jnode.remove();
            }
        });
    }
    catch(e)
    {
        console.log('Error: ' + e.message);
    }
}
