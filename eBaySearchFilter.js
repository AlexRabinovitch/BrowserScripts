// ==UserScript==
// @name         eBay search filter
// @namespace    https://tampermonkey.net/
// @version      0.1
// @description  Removes unwanted items
// @author       Alex Rabinovitch
// @match        https://www.ebay.com/sch/i.html*
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

var _doFiltering = true;
var _searchID = "";
var _filters = new Object();

(function() {
    'use strict';

    try
    {
        fillFilters();

        checkURL();
    }
    catch(e)
    {
        console.log('eBay filter error: ' + e.message);
    }
})();

new MutationObserver(function(mutations)
{
    console.log('Mutations detected: ' + mutations.length);

    var filter = getFilter(this);

    for (var i = 0; i < mutations.length; i++)
    {
        var mutationAddedNodes = mutations[i].addedNodes;
        for (var j = 0; j < mutationAddedNodes.length; j++)
        {
            var node = mutationAddedNodes[j];
            if (node.tagName && node.tagName.toUpperCase() == "LI" && node.classList && node.classList.contains("s-item"))
            {
                console.log('Node found');
                processNode(node, filter);
            }
        }
    }

}).observe(document, {childList: true, subtree: true});

document.onreadystatechange = () =>
{
    if (document.readyState === 'complete')
    {
        console.log('Document ready');

        var filter = getFilter(this);

        var nodes = document.querySelectorAll('li.s-item.s-item--watch-at-corner');

        for(var i = 0; i < nodes.length; i++)
        {
            processNode(nodes[i], filter);
        }
    }
};

function getFilter(observer)
{
    if(!_doFiltering)
    {
        if(observer)
        {
            observer.disconnect();
        }
        return null;
    }
    if(_searchID == "")
    {
        console.log('No recognized search ID.');
        return null;
    }

    var filter = _filters[_searchID];

    if(filter == null)
    {
        console.log('No filter defined for search ID.');
        return null;
    }

    return filter;
}

function processNode(node, filter)
{
    var titles = node.querySelectorAll('h3.s-item__title');
    var title = '';
    if(titles && titles.length > 0)
    {
        title = titles[0].innerText;
        //console.log('Title found: ' + title);

        if(filter.mustTerms)
        {
            var regex = new RegExp("^((?!" + filter.mustTerms.join("|") + ").)*$", "i");
            if(regex.test(title))
            {
                console.log('Title match found: ' + title);
                node.remove();
                return;
            }
        }
        if(filter.excludeTerms)
        {
            regex = new RegExp(filter.excludeTerms.join("|"), "i");
            if(regex.test(title))
            {
                console.log('Title match found: ' + title);
                node.remove();
                return;
            }
        }
        if(filter.complexTerms)
        {
            for(var i = 0; i < filter.complexTerms.length; i++)
            {
                regex = new RegExp(filter.complexTerms[i], "i");
                if(regex.test(title))
                {
                    console.log('Title match found: ' + title);
                    node.remove();
                    return;
                }
            }
        }
        if(filter.excludeItemIDs)
        {
            var itemIDs = node.querySelectorAll('span.s-item__item-id.s-item__itemID');
            var itemID = '';
            if(itemIDs && itemIDs.length > 0)
            {
                itemID = itemIDs[0].innerText;

                regex = new RegExp(filter.excludeItemIDs.join("|"), "i");
                if(regex.test(itemID))
                {
                    console.log('Item ID match found: ' + title);
                    node.remove();
                    return;
                }
            }
        }
    }
}

function fillFilters()
{
    console.log('Filling filters...');

    var inch456 = ['6"', '6”', '6 "', "6''", '6inch', '6 inch', '6inches', '6 inches',
                        '5"', '5”', '5 "', "5''", '5inch', '5 inch', '5inches', '5 inches',
                        '5 1/2"', '5 1/2”', '5 1/2 "', "5 1/2''", '5 1/2inch', '5 1/2 inch', '5  1/2inches', '5 1/2 inches',
                        '4"', '4”', '4 "', "4''", '4inch', '4 inch', '4inches', '4 inches',
                        '4 1/2"', '4 1/2”', '4 1/2 "', "4 1/2''", '4 1/2inch', '4 1/2 inch', '4 1/2inches', '4 1/2 inches'
                        ];

    var filter = new Object();
    filter.searchName = "id-1"; // 4, 5, 6 inch cowboys
    filter.mustTerms = inch456;
    filter.excludeTerms = ['Chap Mei', 'bendable', 'Tonka', 'Pails', 'drum', 'Sesame', 'giraffe', 'clicker', 'donald'];
    filter.excludeItemIDs = [154246251005];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-2"; // 4, 5, 6 inch indians
    filter.mustTerms = inch456;
    filter.excludeTerms = ['plush', 'drum', 'billboard', 'Micro Stars'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-3"; // mounted cowboys and indians
    filter.excludeTerms = ['swoppet', 'Tradition', 'Trophy Miniatures', 'Traditional Models', 'Tonka', 'nursery', 'wooden', 'halloween', 'mvp'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-4"; // frontiersmen
    filter.excludeTerms = ['reel', 'mug', 'Bushido', 'ActionMan', 'ActionTeam', 'lead', 'coin', 'Hotwheels', 'Glass', 'teddy bear', 'penguin', 'Corvus', 'Loggers', 'Wargame', 'board', 'Malifaux', 'Ninja', 'Time', 'Bombshell', '\bdnd\b'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-5"; // Marx knights
    filter.excludeItemIDs = [154243504848];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-7"; // Marx cowboys
    filter.excludeTerms = ['Jonny West', 'lithographed'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-10"; // Elastolin
    filter.excludeTerms = ['ground', 'compound', 'british', '\\bgerman\\b', 'composée', 'composite', 'French', '7th', 'Allemand', 'Civil war'];
    filter.complexTerms = [];
    filter.complexTerms.push(buildComplexTermsFilter(['soldier'], ['Norman', 'Roman', 'cowboy', 'indian', 'medieval', 'middle', 'castle', 'knight', 'ritter']));
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-12"; // Ideal knights
    filter.excludeTerms = ['ideal stocking filler', '\\bmetal\\b','ideal for','ideal 4'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-17"; // Marx wagon, buckboard, stagecoach
    filter.excludeTerms = ['pistol', 'Jonny West', 'dairy'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-18"; // Marx frontiersmen
    filter.excludeTerms = ['action'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-19"; // Marx horses
    filter.excludeTerms = ['Jonny West', '8"', 'Bonanza', 'Hartland', '\\btin\\b', 'ramp walker', '\\bcart\\b', 'action'];
    filter.excludeItemIDs = [313345880648, 114578590860, 114578576422, 402611037446, 402611035819, 114578572400, 114578570195];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-20"; // Marx Indians
    filter.excludeTerms = ['lithographed'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-24"; // Marx vikings
    filter.excludeItemIDs = [154243504848, 174555319224, 313307344713, 274580309520];
    _filters[filter.searchName] = filter;

    console.log('Done filling filters.');
}

function buildComplexTermsFilter(exclude, exceptions)
{
    return "^(?=.*(?:" + exclude.join("|") + "))(?!.*(?:" + exceptions.join("|") + "))";
}

function checkURL()
{
    console.log('Checking URL...');
    var url = window.location.href;
    console.log('Page URL: ' + url);
    var regexp = new RegExp(/%22id-\d+%22/, "i");
    var res = regexp.exec(url);
    if(!res)
    {
        console.log('Page URL does not contain filter id.');
        _doFiltering = false;
    }
    else
    {
        _searchID = res[0].replace(/%22/g, "");
        console.log('Search id: ' + _searchID);
    }
}
