Scripts that I wrote mostly to remove annoying (me) contents from Web sites that I visit frequently.
Tested with Chrome and Tampermonkey extension.

- iXBTNewsFilter.js - removes from iXBT.com news tape:
   1. Annoying news (for me - about phones by specific manufacturers like Xiaomi etc.) Filtering is by key words in the news' headers. You can adjust the list in the script.
   2. Annoying spam comments like ads of sexual services, meeting sites etc. Filtering is by key fragments in the body of the comments.

- iXBTArticlesFilter.js - removes from iXBT.com main page links to articles/reviews by the link URL. I personally do not want to see on a high tech resource reviews of kitchen appliances and also "reviews" from iXBT.com/live (their junky blogging platform). Controlled by the URL components in an array (/live and /home currently).

- YnetPlusFilter.js - removes paid/registered users content from ynet.co.il home page. This one is a bit complicated. There is an array that contains objects with two properties: one is the selector for the elements that actually should be removed. Those are links to the articles. The second is the selector for the small "paid" indicator. There are so many variants because Ynet's layout is a total mess, just like its junky programmers.


Yes, I know, my javascript sucks. This is not a sample of good code, this is a fast and dirty way to get rid of tons of junk that editors of Web sites fill the limitless Web with. 
