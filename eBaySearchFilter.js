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
        if(filter.excludeSellers)
        {
            var sellers = node.querySelectorAll('span.s-item__seller-info-text');
            var seller = '';
            if(sellers && sellers.length > 0)
            {
                seller = sellers[0].innerText;
                console.log('Seller found: ' + seller);

                regex = new RegExp(filter.excludeSellers.join("|"), "i");
                if(regex.test(seller))
                {
                    console.log('Seller match found: ' + seller);
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
                    console.log('Item ID match found: ' + itemID);
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

    var inch456 = ['6"', '6”', '6 "', "6''", '6inch', '6 inch', 'six inch',
                        '5"', '5”', '5 "', "5''", '5inch', '5 inch', 'five inch',
                        '5 1/2"', '5 1/2”', '5 1/2 "', "5 1/2''", '5 1/2inch', '5 1/2 inch', 'five 1/2 inch',
                        '4"', '4”', '4 "', "4''", '4inch', '4 inch', 'four inch',
                        ];

    var filter = new Object();
    filter.searchName = "id-1"; // 4, 5, 6 inch cowboys
    filter.mustTerms = inch456;
    filter.excludeTerms = ['Chap Mei', 'bendable', 'Tonka', 'Pails', 'drum', 'Sesame', 'giraffe', 'clicker', 'donald', 'baby', 'boot', 'subway', 'disney', 'POST CARD', 'Playskool', '\\bdoll\\b', 'GI Joe', 'wind up', 'my little pony', 'menko', '2 3/4"', '2-1/4"', '2-3/4"', '2 3/4', '2 1/4"', '2.75"', '1.5"', '1:12', '1 3/4"', '2 1/4', '12"'];
    filter.excludeSellers = ['jodaug_11', 'cccric-23'];
    filter.excludeItemIDs = [154246251005];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-2"; // 4, 5, 6 inch indians
    filter.mustTerms = inch456;
    filter.excludeTerms = ['plush', 'drum', 'billboard', 'Micro Stars', 'Schleich', 'wind up', 'Tonka', 'swirl', 'bendable', 'Legends of the West', 'marchon', '2 3/4"', '2-1/4"', '2-3/4"', '2 1/4"', '8 3/4"', '1.5"', '2.75"', '12.5"', '2.5”', '2 1/4', '1 3/4"'];
    filter.excludeSellers = ['jodaug_11'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-3"; // mounted cowboys and indians
    filter.excludeTerms = ['swoppet', 'Tradition', 'Trophy Miniatures', 'Traditional Models', 'Tonka', 'nursery', 'wooden', 'halloween', 'mvp', '\\bramp\\b', 'hot wheels', 'Barclay', 'Manoil', 'Geobra', 'wind up', '\\baction\\b', 'windup', 'puzzle', 'motorcycle', 'outfit', 'Safari', 'Schleich', 'paddle', 'elephant', 'token', 'Indian army', 'Woody', 'jacket', 'drum', 'child', 'lionel', 'horseshoe', 'marble', 'folk art', 'playmobil', 'puppet', 'doll', '\\ho\\b', 'mutiny', 'Jane West', 'holster', ', Marx$', 'stuffed', 'board game', 'Lincoln log', 'Bebop', '\\btin\\b', 'Star Ace', 'Hopalong', 'composition', 'country', 'Atkins', 'Bravestar', 'flock', 'legends', 'stencil', 'ducky', '12"', '1:6', '1/6'];
    filter.excludeSellers = ['denyakim', 'gtohall', 'bhall0415', 'laparkamania', 'ourfinds', 'northstate', 'labellesassy', 'happinessfund', 'grg.store', 'yannis1960grvtg'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-4"; // frontiersmen
    filter.excludeTerms = ['reel', 'mug', 'Bushido', 'ActionMan', 'ActionTeam', 'lead', 'coin', 'Hotwheels', 'Glass', 'teddy bear', 'penguin', 'Corvus', 'Loggers', 'Wargame', 'board', 'Malifaux', 'Ninja', 'Time', 'Bombshell', '\bdnd\b', 'puzzle', 'ad&d', 'warhammer', 'Bachmann', 'Citadel', 'Skylander', 'Lincoln log', 'Dakin', 'Johnny West', '25mm', 'Pokémon', 'speed', 'lost world', 'pillow', 'wyrd', 'Legends of the West', 'wallet', '1:6th', 'gloves', 'Mordenkainen', 'Mandalorian', 'stuffed', 'benalish', 'duluth', 'song of ice', 'demigod', 'resin', '1 5/8', '1/6'];
    filter.excludeItemIDs = [184583432373, 124617729318];
    filter.excludeSellers = ['gotakola', 'dayspringdays', 'rpols6', 'unlimited_hk_llc', 'justkidsnostalgia', 'rinnys_boutique', 'scarlettosnow', 'koolman44'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-5"; // Marx knights
    filter.excludeTerms = ['Gordon', 'golden', '\\bgold knight\\b','\\bsilver knight\\b', 'Stuart', 'prince Charles', 'Valour', 'sleeping beauty', 'moveable', '\\bno Marx\\b'];
    filter.excludeSellers = ['owllady77', 'ereggen_0', 'tebur-8', 'jjjjacjon'];
    filter.excludeItemIDs = [154243504848, 284118371844, 174573235948];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-7"; // Marx cowboys
    filter.excludeTerms = ['Jonny West', 'lithographed', 'crazy', 'Gabriel', 'target', 'Buck Rogers', 'windup', '\\bno Marx\\b', 'lledo', 'cap gun', 'linemar', 'nos rare Marx$', '12"', ' 12”', '1/72'];
    filter.excludeSellers = ['brcli_25', 'james_pears', ' jodaug_11', 'fivestateshopper', 'jopu_2645', 'laparkamania', 'acuriouscache', 'old_five_and_dimers', 'cruiser50', 'jeremiahmaxwell', 'pezdudewelch'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-9"; // Auburn
    filter.excludeTerms = ['Kusan', 'hammer'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-10"; // Elastolin
    filter.excludeTerms = ['ground', 'compound', 'british', '\\bgerman\\b', 'composée', 'composite', 'French', '7th', 'Allemand', 'Civil war', 'Zusammensetzung', 'Clairet', 'massebäume', '^elastolin$', 'elfer raus', 'turk', 'ww1', 'revolution', 'pre war', 'not elastolin', 'non elastolin', 'Africa', '1930s', 'trooper', '\\bcow\\b', '\\bband\\b', 'composition', 'janestkzi', 'prussian', '1 5/8', '1/50'];
    filter.excludeSellers = ['ship0v', 'frichmuthboy', 'el-siluro', 'jskins72', 'oz75', 'brams741', 'dancas3012', 'michaelkinhart'];
    filter.complexTerms = [];
    filter.complexTerms.push(buildComplexTermsFilter(['soldier'], ['Norman', 'Roman', 'cowboy', 'indian', 'medieval', 'middle', 'castle', 'knight', 'ritter']));
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-11"; // Empire
    filter.excludeTerms = ['Hachette-marshals', 'Spirit of the Empire', 'Sons of the Empire', 'redcoat', 'empire state', 'Sons of Empire', 'Legends of the West', 'Warhammer', 'fire chief', 'Roman empire', 'end of empire'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-12"; // Ideal knights
    filter.excludeTerms = ['ideal stocking', '\\bmetal\\b','ideal for','ideal 4', 'ideal.*gift', 'board game'];
    filter.excludeSellers = ['laparkamania', 'tomson162'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-13"; // Ideal pirates
    filter.excludeTerms = ['ideal stocking', 'ideal to match', 'puzzle'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-17"; // Marx wagon, buckboard, stagecoach
    filter.excludeTerms = ['pistol', 'Jonny West', 'dairy', 'Bonnie-Bilt', 'derringer', 'steamer', 'oo gauge', '\\bcar\\b', 'nos rare Marx$', 'truck'];
    filter.excludeSellers = ['gtohall', 'bhall0415', 'fyrtoyboy', 'ceosis'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-18"; // Marx frontiersmen
    filter.excludeTerms = ['action', 'classic recasts', 'ajax', 'ride-on', 'ride on', 'nos rare Marx$'];
    filter.excludeSellers = ['jeremybradshaw', 'mikes-6216'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-19"; // Marx horses
    filter.excludeTerms = ['Jonny West', '8"', 'Bonanza', 'Hartland', '\\btin\\b', 'ramp walker', '\\bcart\\b', 'action', 'noble', 'Marvel', 'Jane', 'Josie', 'joint', 'moving', 'Gordon', 'MCML', 'gold knight', '\\bno Marx\\b', 'Big Jim', 'General Custer', '9”', ', Marx$', 'nos rare Marx$', 'Odin', 'movable', 'pancho', 'Geronimo', 'viking', 'Valour', 'ride on', 'articulated', 'lone ranger', 'sleeping beauty', '12"', '12”'];
    filter.excludeSellers = ['northcedarsigns', 'tebur-8', 'gtohall', 'bhall0415', 'gofigure66', 'woolrite', 'cruiser50', 'jeremiahmaxwell', 'c_beaudin', 'mikglava-0', 'd.c.silver', 'jjjjacjon'];
    filter.excludeItemIDs = [313345880648, 114578590860, 114578576422, 402611037446, 402611035819, 114578572400, 114578570195, 324423429624];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-20"; // Marx Indians
    filter.excludeTerms = ['lithographed', 'ramp', '\\bcar\\b', 'target', 'tebur-8', '\\bno Marx\\b', 'ajax', '12"', '12”', 'skate', 'Big Jim', 'nos rare Marx$', 'Jane West', 'Best of the West', 'Wildflower', 'police', 'whirling', 'windup', '12 inch'];
    filter.excludeSellers = ['tebur-8', ' jess-8440', 'loveourprices2', 'brcli_25', 'mustang2388', 'scrabbletime', ' jodaug_11', 'jopu_2645', 'laparkamania', 'greatdealsman', 'acuriouscache', 'mayet32', 'jeremiahmaxwell', 'c_beaudin'];
    filter.excludeItemIDs = [174564762027, 284120067282, 184586469330, 154251838443, 402614585946];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-22"; // Marx pirates
    filter.excludeTerms = ['sailor queen', 'pinball', 'Popeye', ', Marx$', 'Rube Goldberg', 'ring hand', 'nos rare Marx$'];
    filter.excludeSellers = ['robze_5', 'kayleyrose5', 'takeyouyard', 'vlauro'];
    filter.excludeItemIDs = [284128517199, 174573235948];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-23"; // Marx saddles
    filter.excludeTerms = ['Custer', 'joint', 'movable', '\\bno Marx\\b', 'MCMLXVI', 'articulated', '9”', '9"', '8 inch'];
    filter.excludeItemIDs = [114578590860, 114578577961, 114578576422, 402611037446, 402611035819, 114578572400];
    filter.excludeSellers = ['clczzi', 'kris6834', 'laparkamania'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-24"; // Marx vikings
    filter.excludeTerms = ['\\bno Marx\\b', 'nodding', 'best of the west', '11 1/4'];
    filter.excludeItemIDs = [154243504848, 174555319224, 313307344713, 274580309520];
    filter.excludeSellers = ['stanlhardi', 'snookiell-9', 'laparkamania', 'americantoycollector'];
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
