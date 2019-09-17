 

const Crawler = require("crawler");
const jsdom = require("jsdom");

const argv = require('yargs')
    .usage('Usage: $0 --nbVisits [num] --root [https://www.domain.com]')
    .demandOption(['nbVisits','root'])
    .argv;

const crawler = new Crawler({
    maxConnections : 10,
    jQuery: jsdom
});

const FOLLOW_MAX_LINK_PER_PAGE = 5;
const visited = [];

const crawl = function(host, path, follow, referer) {
    const uri = host + path;
    console.log(`Crawling ${uri} from referer ${referer}. Continue to follow: ${follow}`);
    crawler.queue([{
        uri: uri,
        jquery: true, 
        referer: referer,   
    
        callback: function (error, res, done) {
            visited.push(path);
            if (error) {
                console.log(`Error while crawling page ${uri}`, error);
            } else {
                if (follow && res.$) {
                    console.log(`Looking for links inside ${uri}.`);
                    const $ = res.$;
                    const links = [];
                    $('a').each((i, a) => {
                        let p = $(a).attr('href');
                        p = p ? p.replace(host, '/') : '';
                        if (p.indexOf('.html') > 0 && p.indexOf('/') === 0 && p !== host && !visited.includes(p) && !links.includes(p)) {
                            console.debug(`Found a path in the page: ${p}`);
                            links.push(p);
                        }
                    });
                    
                    if (links.length > 0) {
                        const randomNbOfLinksToFollow = Math.min(Math.floor(Math.random() * FOLLOW_MAX_LINK_PER_PAGE), links.length);
                        console.log(`Will follow ${randomNbOfLinksToFollow} links`);
                        for(let i=0; i<randomNbOfLinksToFollow; i++) {
                            const followNext = !!Math.floor(Math.random() * 2);
                            const index = Math.floor(Math.random() * links.length);
                            crawl(host, links[index], followNext, uri);
                        }
                    } else {
                        console.log('No more links to follow.');
                    }
                }
            }
            done();
        }
    }]);
}

for(let i=0;i<argv.nbVisits;i++) {
    // crawl from the root
    crawl(argv.root, '/', true, '');
}