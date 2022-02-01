// ==UserScript==
// @name         eBay search filter
// @namespace    https://tampermonkey.net/
// @version      0.1
// @description  Removes unwanted items
// @author       Alex Rabinovitch
// @match        https://www.ebay.com/sch/i.html*
// @match        https://www.ebay.de/sch/i.html*
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
        title = titles[0].textContent;//innerText;
        if(title.toUpperCase().startsWith('NEW LISTING'))
        {
            title = title.substring(11);
        }
        console.log('Title found: ' + title);

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

    var inch456 = ['\\b6.?"', '6”', "6''", '6.?inch', 'six inch',
                        '5.?"', '5”', "5''", '5.?inch', 'five inch',
                        '5 1/2.?"', '5 1/2”', "5 1/2''", '5 1/2.?inch', 'five 1/2 inch',
                        '4.?"', '4”', "4''", '4.?inch', 'four inch',
                        '4 1/2.?"', '4 1/2”', "4 1/2''", '4 1/2.?inch', 'four 1/2 inch',
                        ];

    var inch456Exclude = ['crescent', 'payton', 'duck', 'bend', 'Squishmallows', 'drum', 'bendable', '\\bpee', '(doctor|dr) who', 'rescue', 'dime novel', 'taxi', 'leather', 'lanard', 'Space Jam', '1 1/4"', '1.5"', '1 3/4"', '2 1/4', '2.5”', '2 3/4"', '2-1/4', '2 1/4"', '2.5”', '2-3/4"', '2 3/4', '2.75"', '1:12', '8 3/4"', '12.5"'];

    var commonExcludedSellers = ['gtohall', 'bhall0415', ' alamo3636', 'laparkamania', 'softball-1baseball-2', 'jonsmemorabiliamart64', 'picker_picker', 'oldfartcollections', 'annfrei_12', 'luckynickels', 'griff2299', 'sstoys2', 'kvik_567', 'mirthunder', 'brcli_25', 'kerrlindle0', 'crash29', 'janerose2014', 'softviking', 'tbt', 'davenportpm1', 'leopardlover48', 'www.telecoin.bizland.com', 'infernal_devices', '2rosesathome', 'j_byers_24', 'the\\*village\\*idiot', 'vintagestg', 'littletoymaker', 'realbricks', 'goatsonparade17023', 'alysunwonderland', 'tin-toyman', 'jhsmith400', 'cumberlandborn'];
    var commonExcludedTerms = ['(Joh?h?n?ny|Jane|Jamie|Jimmy|Josie|Jay) West', 'Sam Cobra', 'Best of (the )?West', 'BOTW', 'Ready Gang', 'movable', 'Legends of (the )?West', 'cherokee', 'Be[bp]op', 'cap.?gun', '\\bw(ind)?.?up\\b', 'ring.?hand', 'pin.?ball', 'jigsaw', 'puzzle', 'Barclay', 'Manoil', 'pl?ay.?mobil', 'play.?skool', 'play.?people', 'Lincoln.*?log', 'friction', 'ajax', '\\bdolls?\\b', 'ram.?p.?walk', 'Bravo', '\\bH(O|0)\\b', 'HO scale', 'Hasbro', '\\bmarble\\b', 'swirl', 'jabo', 'celluloid', 'harmonica', 'plush', 'navwar', 'giant brand', 'Tonka', 'POST.?CARD', 'swoppet?d?', 'swivel', 'moo mesa', 'marchon', 'little.?people', 'gbpv', 'Popeye', 'Fisc?her.?Price', 'Bonanza', 'clock.?work', '\\bpull.?toy\\b', '\\btin.?plate\\b', 'critter'];
    var marxExcludedTerms = ['fortune', 'Gabriel', 'sleeping beauty', '\\bno Marx\\b', 'nos rare Marx$', ', Marx$', 'Marx!!!$', 'Marx-U', 'marx style', 'Marx.?\\?', 'marx( toys)? \\(\\?\\)', 'good with marx', 'replicants', 'MPC', 'tim.?mee', 'Linemar', 'Karl Marx', 'Engels', 'Spencer', 'Barzso', 'Schaffner'];
    var marxExcludedSellers = ['amawill-3200', 'supersmileygerry', 'lewiq', ' 2010waltb', 'avalerina', 'chrislach1', 'zuber', 'diets-r-us', 'iamthepumpkinking', 'winston49120', 'classic_plastick'];

    var excludeSellersHorsesSaddles = ['apeman28', 'recordsiam7', 'rugbychick12', 'gypwop', 'kandeekane13'];
    var excludeTermssHorsesSaddles = ['Pa?o?ncho', 'Marvel', 'Valou?r', 'joint', 'articulated', 'Valiant', 'Breyer', '13.5"'];

    var filter = new Object();
    filter.searchName = "id-1"; // 4, 5, 6 inch cowboys and indians
    filter.mustTerms = inch456;
    filter.excludeTerms = ['Chap Mei', 'Pail', 'Sesame', 'giraffe', 'clicker', 'donald', 'baby', 'boot', 'subway', 'disney', 'GI Joe', 'my little pony', 'menko', 'cowboy hat', 'Logan', 'Orton', 'Chip Mei', 'Totsy', 'rocking', 'slug', 'NFL', 'Owens', 'chess', 'Posable', 'elephant', 'blanket', 'pocahontas', 'Wolverine', 'McFarlane', 'Skyforce'];
    filter.excludeTerms = filter.excludeTerms.concat(inch456Exclude);
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeSellers = ['jodaug_11', 'cccric-23', 'lostandfoundtreasure'];
    filter.excludeItemIDs = [154246251005];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-2"; // 4, 5, 6 inch indians
    filter.mustTerms = inch456;
    filter.excludeTerms = ['billboard', 'Micro Stars', 'Schleich', 'marchon', 'board game', 'elephant', 'posable'];
    filter.excludeTerms = filter.excludeTerms.concat(inch456Exclude);
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeSellers = ['jodaug_11'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-3"; // mounted cowboys and indians
    filter.excludeTerms = ['Tradition', 'Trophy Miniatures', 'Traditional Models', 'nursery', 'wooden', 'halloween', 'mvp', 'hot wheels', 'Barclay', 'Manoil', 'Geobra', 'motorcycle', 'outfit', 'Safari', 'Schleich', 'paddle', 'elephant', 'token', 'Indian army', 'Woody', 'jacket', 'drum', 'child', 'lionel', 'horseshoe', 'folk art', 'puppet', 'mutiny', 'holster', 'stuffed', 'board game', '\\btin\\b', 'Star Ace', 'Hopalong', 'composition', 'country', 'Atkins', 'Bravestar', 'flock', 'legends', 'stencil', 'ducky', 'Peppa pig', 'hotwheels', 'cowboy hat', 'cowboy boot', 'domino', 'mechanical', 'card', 'yo.?yo', 'W Britain', 'britain\'?s?', 'purse', 'wallet', 'Roll Call', 'velvet', 'blind', 'clip.*?clop', 'stick', 'space', 'Hoefler', 'buckle', 'scarf', 'ponywars', 'frogz', 'roadrider', 'schylling', 'chap mei', 'giant', 'boot hill', 'GMT', 'forged', 'First Legion', 'handcraft', 'master box', 'playmate', 'toy story', 'canteen', 'Kingcast', 'Frontline Figures', 'douglas', 'sikh', '1/48', '1/72', '1/76', '28.?mm', '10”', '1:6', '1/6', '1"', '12”'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeSellers = ['denyakim', 'ourfinds', 'northstate', 'labellesassy', 'happinessfund', 'grg.store', 'yannis1960grvtg', 'mercator_trading'];
    filter.excludeSellers = filter.excludeSellers.concat(commonExcludedSellers);
    filter.complexTerms = [];
    filter.complexTerms.push(buildComplexTermsFilter(['payton', 'ajax', 'mpc', '\\brel\\b', 'bergen', 'beton', 'tim.?mee'], ['marx']));
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-4"; // frontiersmen
    filter.excludeTerms = ['reel', 'mug', 'Bushido', 'ActionMan', 'ActionTeam', 'lead', 'coin', 'Hotwheels', 'Glass', 'teddy.?bear', 'penguin', 'Corvus', 'Loggers', 'Wargame', 'board', 'Malifaux', 'Ninja', 'Time', 'Bombshell', '\bdnd\b', 'ad&d', 'warhammer', 'Bachmann', 'Citadel', 'Skylander', 'Dakin', '25mm', 'Pokémon', 'speed', 'lost world', 'pillow', 'wyrd', 'wallet', '1:6th', 'gloves', 'Mordenkainen', 'Mandalorian', 'stuffed', 'benalish', 'duluth', 'song of ice', 'demigod', 'resin', 'Kilgore', 'Monsters', 'hell.?dorado', 'baseball', 'belt', 'badge', 'paw patrol', 'ruby', 'gator', 'star.?wars', 'pulsecon', 'Buddy.?L', 'alien', 'Artisan', 'Bushiroad', 'Greyjoy', 'pocket knife', 'storm.?trooper', 'ghostbusters', 'goliath', '\\bgame\\b', 'vtes', 'Bofuri', 'hand.?made', 'matchbox', '\\bdnd\\b', 'robot', 'caldor', 'outfit', 'midnight hunt', 'Warriors.*?Warrens', 'just friends', 'Weiss Schwarz', 'Figma', 'ATDT', 'Gomez', 'Kobol', 'truck', '15mm', '20mm', '32mm', '35mm', '1 5/8', '1/6'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeItemIDs = [184583432373, 124617729318];
    filter.excludeSellers = ['gotakola', 'dayspringdays', 'rpols6', 'unlimited_hk_llc', 'justkidsnostalgia', 'rinnys_boutique', 'scarlettosnow', 'koolman44', 'the-kojima-japaneseshop', 'dollyscards', 'dressupgirl', 'anita.colem'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-5"; // Marx knights
    filter.excludeTerms = ['Gordon', 'golden', '\\bgold knight\\b','\\bsilver knight\\b', 'Stuart', 'prince Charles', 'Valour', 'moveable', 'diedhoff', 'MPC', '\\bMego\\b', 'armou?red horse'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeTerms = filter.excludeTerms.concat(marxExcludedTerms);
    filter.excludeSellers = ['owllady77', 'ereggen_0', 'tebur-8', 'jjjjacjon', 'ggminhai', 'ralph316100'];
    filter.excludeSellers = filter.excludeSellers.concat(commonExcludedSellers);
    filter.excludeSellers = filter.excludeSellers.concat(marxExcludedSellers);
    filter.excludeItemIDs = [154243504848, 284118371844, 174573235948];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-7"; // Marx cowboys
    filter.excludeTerms = ['lithographed', 'crazy', 'target', 'Buck Rogers', 'lledo', 'cap gun', 'linemar', 'gijoe', 'reamsa', 'jecsan', 'ride.on', 'johnnie', '1/72', '7.5"', ' 12”', '12"'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeTerms = filter.excludeTerms.concat(marxExcludedTerms);
    filter.excludeSellers = ['jerseycameron', 'hapeste_0'];
    filter.excludeSellers = filter.excludeSellers.concat(commonExcludedSellers);
    filter.excludeSellers = filter.excludeSellers.concat(marxExcludedSellers);
    console.log(filter.excludeSellers);
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-9"; // Auburn
    filter.excludeTerms = ['Kusan', 'hammer', 'motorcycle', 'hatchet'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-10"; // Elastolin
    filter.excludeTerms = ['ground', 'british', '\\bgerman\\b', 'composée', 'composit','compo', '\\bmasse?\\b', 'massesoldat', 'masse.?figur', 'French', '7th', 'Allemand', 'Civil war', 'Zusammensetzung', 'Clairet', 'massebäume', '^elastolin$', 'elfer raus', 'turk', 'ww1', 'revolution', 'pre war', 'not elastolin', 'non elastolin', 'Africa', '1930s', 'trooper', '\\bcow\\b', '\\bband\\b', 'janestkzi', 'prussian', 'railway', 'reamsa', 'jecsan', 'lansquenet', 'landsknecht', '\\bfaro\\b', 'animal', 'military', 'giraffe', 'mercenary?(ies)?', 'doughboy', '\\bdeer', '\\bboa\\b', 'tiger', '\\blion', '\\bzoo\\b', '\\bbear\\b', 'monkey', 'ostrich', 'rhino', 'wolf', 'panther', 'zebra', 'type elastolin', '\\b19[01234]\\d', 'prewar', 'Steckfigur', 'socket', 'regiment', 'grenadier', 'lafredo', 'M[aä]rklin', 'elastolin compatible', 'compatible with elastolin', 'elastolin\\?', '(suitable|matching|fits) (for|to) Elastolin', '\\blead\\b', 'ADVERTISING Brands', 'luftwaffe', 'mussolini', 'diedhoff', 'quiralu', 'blechräder', 'air france', 'advertising', 'plug', '1\\:72', 'CM 4', '\\b1 5\\/8', '\\b1 3\\/4', '1/50', '1.5 Inch'];
    //filter.excludeTerms = ['1930'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeSellers = ['ship0v', 'frichmuthboy', 'el-siluro', 'jskins72', 'oz75', 'brams741', 'dancas3012', 'michaelkinhart', 'karoly558', 'lobster75459', ' fb78', 'vintage_villages'];
    filter.complexTerms = [];
    filter.complexTerms.push(buildComplexTermsFilter(['soldier'], ['Norman', 'Roman', 'cowboy', 'indian', 'native', 'medieval', 'middle', 'castle', 'knight', 'ritter', 'Karl May', 'catapult', 'viking', 'gaul']));
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-11"; // Empire
    filter.excludeTerms = ['Hachette-marshals', 'Spirit of the Empire', 'Sons of the Empire', 'redcoat', 'empire state', 'Sons of Empire', 'Warhammer', 'fire (dept )?chief', 'Roman empire', 'end of empire', 'pullman', 'british', 'Japan'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeSellers = ['oraff_tm', 'libro_di_faccia'];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-12"; // Ideal knights
    filter.excludeTerms = ['ideal stocking', '\\bmetal\\b','ideal for','ideal 4', 'ideal.*gift', 'board game', 'knight rider', '1/62'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeSellers = ['tomson162'];
    filter.excludeSellers = filter.excludeSellers.concat(commonExcludedSellers);
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-13"; // Ideal pirates
    filter.excludeTerms = ['ideal stocking', 'ideal to match', 'Giggle'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-17"; // Marx wagon, buckboard, stagecoach
    filter.excludeTerms = ['pistol', 'dairy', 'Bonnie-Bilt', 'derringer', 'steamer', 'oo gauge', '\\bcar\\b', 'truck', 'caboose', 'tender', 'Pullman', 'Lone Ranger', 'pressed steel', 'hot rod', 'tractor'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeTerms = filter.excludeTerms.concat(marxExcludedTerms);
    filter.excludeSellers = ['fyrtoyboy', 'ceosis', 'fabboss7'];
    filter.excludeSellers = filter.excludeSellers.concat(commonExcludedSellers);
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-18"; // Marx frontiersmen
    filter.excludeTerms = ['action', 'classic recasts', 'ride.on', '2060', '11"'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeTerms = filter.excludeTerms.concat(marxExcludedTerms);
    filter.excludeSellers = ['jeremybradshaw', 'mikes-6216', 'gitteriveramsn.com', 'mikeytoyz'];
    filter.excludeSellers = filter.excludeSellers.concat(commonExcludedSellers);
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-19"; // Marx horses
    filter.excludeTerms = ['Hartland', '\\btin\\b', '\\bcart\\b', 'action', 'noble', 'moving', 'Gordon', 'MCML', 'gold knight', 'Big Jim', 'General Custer', 'Odin', 'Geronimo', 'viking', 'ride.on', 'lone ranger', 'pony tail', 'iron horse', 'comanche', 'Destiny', 'palomino', 'pinto', 'cloud', 'railroad', '8"', '9”', '9"', '12"', '12”', '13”'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeTerms = filter.excludeTerms.concat(marxExcludedTerms);
    filter.excludeTerms = filter.excludeTerms.concat(excludeTermssHorsesSaddles);
    filter.excludeSellers = ['northcedarsigns', 'tebur-8', 'gofigure66', 'woolrite', 'cruiser50', 'jeremiahmaxwell', 'c_beaudin', 'mikglava-0', 'd.c.silver', 'jjjjacjon', 'appanu60', 'spud8mh', 'martha66-2013', 'kong1', 'hmcunnin_123'];
    filter.excludeSellers = filter.excludeSellers.concat(commonExcludedSellers);
    filter.excludeSellers = filter.excludeSellers.concat(excludeSellersHorsesSaddles);
    filter.excludeSellers = filter.excludeSellers.concat(marxExcludedSellers);
    filter.excludeItemIDs = [313345880648, 114578590860, 114578576422, 402611037446, 402611035819, 114578572400, 114578570195, 324423429624];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-20"; // Marx Indians
    filter.excludeTerms = ['lithographed', '\\bcar\\b', 'target', 'tebur-8', 'skate', 'Big Jim', 'Wildflower', 'police', 'whirling', 'Brave Eagle', 'fire (dept )?chief', '12 inch', '12”'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeTerms = filter.excludeTerms.concat(marxExcludedTerms);
    filter.excludeSellers = ['diniowa', 'chiefdocice', 'sixthstreetsales', 'tedpoley1', 'cjc1'];
    filter.excludeSellers = filter.excludeSellers.concat(marxExcludedSellers);
    filter.excludeSellers = filter.excludeSellers.concat(commonExcludedSellers);
    filter.excludeItemIDs = [174564762027, 284120067282, 184586469330, 154251838443, 402614585946, 224407617478, 224407616782, 384071950587];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-22"; // Marx pirates
    filter.excludeTerms = ['sailor queen', 'Goldberg', 'American fighter'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeTerms = filter.excludeTerms.concat(marxExcludedTerms);
    filter.excludeSellers = ['robze_5', 'kayleyrose5', 'takeyouyard', 'vlauro', 'shortyrama', 'naftamost', 'ginapeet'];
    filter.excludeSellers = filter.excludeSellers.concat(commonExcludedSellers);
    filter.excludeSellers = filter.excludeSellers.concat(marxExcludedSellers);
    filter.excludeItemIDs = [284128517199, 174573235948];
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-23"; // Marx saddles
    filter.excludeTerms = ['Custer', 'MCMLXVI', 'howdah', '\\bReinhard?t?\\b', '\\blaig\\b', 'patent', '9”', '9"', '8 inch'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeTerms = filter.excludeTerms.concat(marxExcludedTerms);
    filter.excludeTerms = filter.excludeTerms.concat(excludeTermssHorsesSaddles);
    filter.excludeItemIDs = [114578590860, 114578577961, 114578576422, 402611037446, 402611035819, 114578572400];
    filter.excludeSellers = ['clczzi', 'kris6834', 'beachspiritcha', 'chf897', 'the-ad-store', 'asianstamp'];
    filter.excludeSellers = filter.excludeSellers.concat(commonExcludedSellers);
    filter.excludeSellers = filter.excludeSellers.concat(marxExcludedSellers);
    filter.excludeSellers = filter.excludeSellers.concat(excludeSellersHorsesSaddles);
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-24"; // Marx vikings
    filter.excludeTerms = ['nodding', 'diedhoff', 'Marx brothers', '11 1/4'];
    filter.excludeTerms = filter.excludeTerms.concat(commonExcludedTerms);
    filter.excludeTerms = filter.excludeTerms.concat(marxExcludedTerms);
    filter.excludeItemIDs = [154243504848, 174555319224, 313307344713, 274580309520];
    filter.excludeSellers = ['stanlhardi', 'snookiell-9', 'americantoycollector'];
    filter.excludeSellers = filter.excludeSellers.concat(commonExcludedSellers);
    filter.excludeSellers = filter.excludeSellers.concat(marxExcludedSellers);
    _filters[filter.searchName] = filter;

    filter = new Object();
    filter.searchName = "id-25"; // Preiser
    filter.excludeTerms = ['4\\d{4}','10\\d{3}', '5(6|7)\\d{3}', '541[0-9][0-9]', '\\b(\\d{1})?30\\d{2}', '\\bGerman\\b', 'Wehrmacht', 'Prussian', 'bburago', '45mm'];
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
