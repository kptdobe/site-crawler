const Crawler = require("crawler");
const jsdom = require("jsdom");
 
const c = new Crawler({
    maxConnections : 10,
    jQuery: jsdom
});

const FOLLOW_MAX_LINK_PER_PAGE = 5;

const crawl = function(host, path, follow, referer) {
    console.log(`Crawling ${host + path} from referer ${referer}. Continue to follow: ${follow}`);
    c.queue([{
        uri: host + path,
        jquery: true, 
        referer: referer,   
    
        callback: function (error, res, done) {
            if (error) {
                console.log(`Error while crawling page ${url}`, error);
            } else {

                if (follow && res.$) {
                    const $ = res.$;
                    const paths = [];
                    $('a').each((i, a) => {
                        let path = $(a).attr('href');
                        path = path ? path.replace(host, '/') : '';
                        if (path.indexOf('.html') > 0 && path.indexOf('/') === 0 && path !== host) {
                            console.debug(`Found a path in the page: ${path}`);
                            paths.push(path);
                        }
                    });
                    
                    if (paths.length > 0) {
                        const randomNbOfLinksToFollow = Math.min(Math.floor(Math.random() * FOLLOW_MAX_LINK_PER_PAGE), paths.length);
                        console.log(`Will follow ${randomNbOfLinksToFollow} links`);
                        for(let i=0; i<randomNbOfLinksToFollow; i++) {
                            const followNext = !!Math.floor(Math.random() * 2);
                            const index = Math.floor(Math.random() * paths.length);
                            crawl(host, paths[index], followNext, host + path);
                        }
                    }
                }
            }
            done();
        }
    }]);
}

// crawl from the root
crawl('https://adobedevsite.helix-demo.xyz', '/', true, '');