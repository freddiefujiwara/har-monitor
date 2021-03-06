var server = require('webserver').create(),
    system = require('system'),
    fs     = require('fs'),
    page   = undefined,
    port   = system.env.PORT || 8080;

var service = server.listen(port, function(request, response) {

    var url = 'http://www.rakuten.co.jp/';
    var callback = undefined;
    page   = require('webpage').create();
    page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
    var pairs = {};
    if("GET" == request.method && 2 < request.url.length ){
        pairs = getQueryVariable(request.url.substring(2));
        if(typeof pairs.callback !== "undefined" ){
            callback = pairs.callback;
        }
        if(typeof pairs.url !== "undefined" ){
            url = pairs.url;
        }
        if(typeof pairs.ua !== "undefined"){
            page.settings.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3';
            if("tb" === pairs.ua){
                page.settings.userAgent = 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10';
            }
        }
    }

    render_har(url, function(har){
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        if(typeof callback !== "undefined" ){
            response.write(callback +"(");
        }
        response.write(JSON.stringify(har, undefined, 4));
        if(typeof callback !== "undefined" ){
            response.write(");");
        }
        response.close();
    });
});

if(service) console.log("server started - http://localhost:" + server.port);

function render_har(url, callback){
    page.address = url;
    page.resources = [];

    page.onLoadStarted = function () {
        page.startTime = new Date();
    };

    page.onResourceRequested = function (req) {
        page.resources[req.id] = {
            request: req,
            startReply: null,
            endReply: null
        };
    };

    page.onResourceReceived = function (res) {
        if (res.stage === 'start') {
            page.resources[res.id].startReply = res;
        }
        if (res.stage === 'end') {
            page.resources[res.id].endReply = res;
        }
    };

    page.clearMemoryCache();
    page.open(page.address, function (status) {
        var har;
        if (status !== 'success') {
            console.log('FAIL to load the address');
            page.close();
        } else {
            page.endTime = new Date();
            page.title = page.evaluate(function () {
                return document.title;
            });
            callback(createHAR(page.address, page.title, page.startTime, page.resources));
            page.close();
        }
    });
}
if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
        function pad(n) { return n < 10 ? '0' + n : n; }
        function ms(n) { return n < 10 ? '00'+ n : n < 100 ? '0' + n : n }
        return this.getFullYear() + '-' +
            pad(this.getMonth() + 1) + '-' +
            pad(this.getDate()) + 'T' +
            pad(this.getHours()) + ':' +
            pad(this.getMinutes()) + ':' +
            pad(this.getSeconds()) + '.' +
            ms(this.getMilliseconds()) + 'Z';
    }
}

function createHAR(address, title, startTime, resources)
{
    var entries = [];

    resources.forEach(function (resource) {
        var request = resource.request,
            startReply = resource.startReply,
            endReply = resource.endReply;

        if (!request || !startReply || !endReply) {
            return;
        }

        if(!endReply.statusText){
            endReply.statusText = "";
        }

        entries.push({
            startedDateTime: request.time.toISOString(),
            time: endReply.time - request.time,
            request: {
                method: request.method,
                url: request.url,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: request.headers,
                queryString: [],
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: endReply.status,
                statusText: endReply.statusText,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: endReply.headers,
                redirectURL: "",
                headersSize: -1,
                bodySize: startReply.bodySize,
                content: {
                    size: startReply.bodySize,
                    mimeType: endReply.contentType
                }
            },
            cache: {},
            timings: {
                blocked: 0,
                dns: -1,
                connect: -1,
                send: 0,
                wait: startReply.time - request.time,
                receive: endReply.time - startReply.time,
                ssl: -1
            },
            pageref: address
        });
    });

    return {
        log: {
            version: '1.2',
            creator: {
                name: "PhantomJS",
                version: phantom.version.major + '.' + phantom.version.minor +
                    '.' + phantom.version.patch
            },
            pages: [{
                startedDateTime: startTime.toISOString(),
                id: address,
                title: title,
                pageTimings: {
                    onLoad: page.endTime - page.startTime
                }
            }],
            entries: entries
        }
    };
}

function getQueryVariable(query) {
    var vars = query.split('&');
    var pairs = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        pairs[pair[0]] = pair[1];
    }     
    return pairs;
}
