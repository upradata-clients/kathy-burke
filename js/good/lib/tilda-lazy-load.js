function t_lazyload__init() {
    t_lazyload__detectwebp();
    var elAllRecs = document.querySelector("#allrecords");
    elAllRecs && "yes" === elAllRecs.getAttribute("data-tilda-imgoptimoff") ? window.lazy_imgoptimoff = "yes" : window.lazy_imgoptimoff = "";
    for (var elstoSkip = document.querySelectorAll(".t156 .t-img"), i = 0; i < elstoSkip.length; i++)
        elstoSkip[ i ].setAttribute("data-lazy-rule", "skip");
    var elstoRound = document.querySelectorAll(".t492,.t552,.t251,.t603,.t660,.t661,.t662,.t680,.t827,.t909,.t218,.t740,.t132,.t694,.t762,.t786,.t546");
    Array.prototype.forEach.call(elstoRound, (function (el) {
        var bars = el.querySelectorAll(".t-bgimg");
        Array.prototype.forEach.call(bars, (function (bar) {
            bar.setAttribute("data-lazy-rule", "comm:resize,round:100");
        }
        ));
    }
    )),
        setTimeout((function () {
            window.lazyload_cover = new window.LazyLoad({
                elements_selector: ".t-cover__carrier",
                show_while_loading: !1,
                data_src: "content-cover-bg",
                placeholder: "",
                threshold: 700
            });
        }
        ), 100),
        setTimeout((function () {
            var $;
            if (window.lazyload_img = new window.LazyLoad({
                elements_selector: ".t-img",
                threshold: 800
            }),
                window.lazyload_bgimg = new window.LazyLoad({
                    elements_selector: ".t-bgimg",
                    show_while_loading: !1,
                    placeholder: "",
                    threshold: 800
                }),
                window.lazyload_iframe = new window.LazyLoad({
                    elements_selector: ".t-iframe"
                }),
                window.jQuery && ($ = jQuery)(document).bind("slide.bs.carousel", (function () {
                    setTimeout((function () {
                        t_lazyload_update();
                    }
                    ), 500);
                }
                )),
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && document.body && "object" == typeof document.body && document.body.classList) {
                if (document.querySelector(".t-mbfix"))
                    return;
                var elmbfix = document.createElement("div");
                elmbfix.classList.add("t-mbfix"),
                    document.body.appendChild(elmbfix),
                    setTimeout((function () {
                        elmbfix.classList.add("t-mbfix_hide");
                    }
                    ), 50),
                    setTimeout((function () {
                        elmbfix && elmbfix.parentNode && elmbfix.parentNode.removeChild(elmbfix);
                    }
                    ), 1e3);
            }
        }
        ), 500),
        window.addEventListener("resize", (function () {
            clearTimeout(window.t_lazyload_resize_timerid),
                window.t_lazyload_resize_timerid = setTimeout(t_lazyload__onWindowResize, 1e3);
        }
        )),
        setTimeout((function () {
            "object" == typeof performance && "object" == typeof performance.timing && (window.t_lazyload_domloaded = 1 * window.performance.timing.domContentLoadedEventEnd - 1 * window.performance.timing.navigationStart);
        }
        ), 0);
}
function t_lazyload_update() {
    "undefined" != typeof lazyload_cover && window.lazyload_cover.update(),
        "undefined" != typeof lazyload_img && window.lazyload_img.update(),
        "undefined" != typeof lazyload_bgimg && window.lazyload_bgimg.update(),
        "undefined" != typeof lazyload_iframe && window.lazyload_iframe.update();
}
function t_lazyload__onWindowResize() {
    if (t_lazyload_update(),
        "yes" !== window.lazy_imgoptimoff) {
        var els = document.querySelectorAll(".t-cover__carrier, .t-bgimg, .t-img");
        Array.prototype.forEach.call(els, (function (elem) {
            window.t_lazyload_updateResize_elem(elem);
        }
        ));
    }
}
function t_lazyload__detectwebp() {
    var WebP = new Image;
    WebP.onload = WebP.onerror = function () {
        2 != WebP.height || (window.lazy_webp = "y");
    }
        ,
        WebP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}
function t_lazyLoad__appendImgStatToArr(img, startTime) {
    if (void 0 !== navigator.sendBeacon) {
        var now = (new Date).getTime()
            , imgSrc = img.getAttribute("src");
        if (imgSrc) {
            var imgLoadingTime = {
                time: now - startTime
            };
            0 === imgSrc.indexOf("https://" + t_lazyload__getThumbDomainName()) && (imgLoadingTime.th = "y"),
                0 === imgSrc.indexOf("https://static.tildacdn") && (imgLoadingTime.st = "y"),
                (imgLoadingTime.th || imgLoadingTime.st) && window.t_loadImgStats.push(imgLoadingTime);
        }
    }
}
function t_lazyload__ping(type) {
    var domain = "https://" + type + ".tildacdn.com";
    if ("static" == type) {
        var cs = document.currentScript;
        if ("object" == typeof cs && "string" == typeof cs.src && 0 === cs.src.indexOf(domain))
            return;
        if (null === document.head.querySelector('script[src^="' + domain + '"]'))
            return;
    }
    var img = new Image;
    img.src = domain + "/pixel.png",
        img.onload = function () {
            window[ "lazy_ok_" + type ] = "y";
        }
        ,
        setTimeout((function () {
            if ("y" !== window[ "lazy_ok_" + type ]) {
                window[ "lazy_err_" + type ] = "y",
                    console.log(type + " ping error");
                var els = document.querySelectorAll(".loading");
                Array.prototype.forEach.call(els, (function (el) {
                    var src = "";
                    src = el.lazy_loading_src,
                        "string" == typeof str && 0 === src.indexOf(domain) && (el.classList.remove("loading"),
                            el.wasProcessed = !1);
                }
                )),
                    t_lazyload_update();
            }
        }
        ), 1e4);
}
function t_lazyload__getThumbDomainName() {
    return "optim.tildacdn";
}
!function (root, factory) {
    "function" == typeof define && define.amd ? define([], factory) : "object" == typeof exports ? module.exports = factory() : root.LazyLoad = factory();
}(this, (function () {
    var _defaultSettings, _supportsClassList, _isInitialized = !1, _popularResolutions, _popularResolutionsOther, _supportsObserver = !1, _staticUrlRegex = /\/static\.tildacdn\.(info|.{1,3})\//, _staticUrlReplaces = {};
    function _init() {
        _isInitialized || (_defaultSettings = {
            elements_selector: "img",
            container: window,
            threshold: 300,
            throttle: 50,
            data_src: "original",
            data_srcset: "original-set",
            class_loading: "loading",
            class_loaded: "loaded",
            skip_invisible: !0,
            show_while_loading: !0,
            callback_load: null,
            callback_error: null,
            callback_set: null,
            callback_processed: null,
            placeholder: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        },
            document.body && "object" == typeof document.body && (_supportsClassList = !!document.body.classList),
            _supportsObserver = "IntersectionObserver" in window,
            _isInitialized = !0,
            _popularResolutions = [ "200x151", "640x712", "320x356", "670x744", "335x372", "300x225", "500x375", "400x301", "748x832", "374x416", "670x502", "335x251", "360x234", "560x622", "280x311", "640x416" ],
            _popularResolutionsOther = [ "353x245", "155x151", "158x164", "372x495", "280x272", "117x117", "291x280", "280x269", "335x241", "283x283", "150x156", "353x233", "414x730", "372x362", "275x206", "290x322", "248x207", "177x136", "173x173", "280x308", "195x214", "248x191", "155x196", "163x203", "320x444", "158x162", "176x203", "412x700", "360x88", "360x616", "167x167", "130x144", "280x233", "560x314", "320x299", "372x275", "320x178", "372x242", "360x352", "353x294", "260x182", "372x310", "335x344", "374x432", "414x500", "374x360", "220x338", "150x146", "335x239", "176x176", "320x302", "374x260", "360x568", "191x221", "192x192", "372x558", "335x188", "320x358", "335x258", "374x575", "26x26", "353x360", "360x206", "335x248", "335x322", "167x256", "560x364", "155x172", "163x216", "163x181", "360x257", "374x561", "374x243", "220x212", "177x148", "291x324", "167x160", "375x749", "335x387", "172x172", "260x302", "414x700", "220x254", "177x172", "374x519", "176x169", "320x352", "335x233", "150x203", "360x207", "158x121", "360x396", "158x131", "150x98", "220x169", "182x202", "320x179", "372x413", "181x226", "353x200", "158x153", "375x628", "176x271", "374x364", "320x492", "374x247", "414x833", "353x393", "335x218", "560x399", "412x264", "293x164", "56x56", "177x204", "248x382", "181x181", "118x118", "260x346", "374x497", "260x202", "393x251", "158x158", "372x200", "373x414", "320x229", "177x177", "312x175", "374x312", "84x84", "320x329", "177x194", "353x350", "335x503", "335x446", "335x326", "374x200", "158x182", "320x237", "335x221", "176x196", "150x229", "320x224", "248x276", "360x299", "260x289", "196x216", "335x279", "177x272", "320x426", "260x172", "155x194", "320x369", "372x350", "360x302", "360x402", "169x186", "158x242", "173x199", "167x185", "360x238", "220x123", "320x308", "414x265", "374x350", "300x333", "177x170", "320x222", "320x311", "260x169", "150x173", "320x246", "353x265", "192x222", "158x151", "372x414", "150x144", "760x502", "314x176", "320x208", "182x182", "320x211", "163x163", "372x279", "360x202", "360x252", "260x252", "260x286", "353x392", "160x104", "374x281", "353x353", "150x231", "320x267", "372x372", "177x197", "275x154", "158x175", "374x374", "150x167", "260x146" ],
            _staticUrlReplaces = {
                com: "com",
                info: "pub",
                pub: "pub",
                ink: "ink",
                pro: "pro",
                biz: "biz",
                net: "net",
                one: "one"
            });
    }
    function _now() {
        var d;
        return (new Date).getTime();
    }
    function _merge_objects(obj1, obj2) {
        var obj3 = {}, propertyName;
        for (propertyName in obj1)
            Object.prototype.hasOwnProperty.call(obj1, propertyName) && (obj3[ propertyName ] = obj1[ propertyName ]);
        for (propertyName in obj2)
            Object.prototype.hasOwnProperty.call(obj2, propertyName) && (obj3[ propertyName ] = obj2[ propertyName ]);
        return obj3;
    }
    function _convertToArray(nodeSet) {
        var elsArray;
        try {
            elsArray = Array.prototype.slice.call(nodeSet);
        } catch (e) {
            var array = [], i, l = nodeSet.length;
            for (i = 0; i < l; i++)
                array.push(nodeSet[ i ]);
            elsArray = array;
        }
        return elsArray.forEach((function (element) {
            element.isSkipByPosition = null === element.offsetParent && !1 === _isExist(_getParent(element, "t396__carrier-wrapper")) && "fixed" !== element.getAttribute("data-content-cover-parallax");
            var elRec = _getParent(element, "t-rec");
            _isExist(elRec) && (element.isNotUnderScreenRange = !1 === elRec.hasAttribute("data-screen-max") && !1 === elRec.hasAttribute("data-screen-min"));
        }
        )),
            elsArray;
    }
    function _addClass(element, className) {
        _supportsClassList ? element.classList.add(className) : element.className += (element.className ? " " : "") + className;
    }
    function _removeClass(element, className) {
        _supportsClassList ? element.classList.remove(className) : element.className = element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), " ").replace(/^\s+/, "").replace(/\s+$/, "");
    }
    function _hasClass(element, className) {
        return _supportsClassList ? element.classList.contains(className) : new RegExp(" " + className + " ").test(" " + element.className + " ");
    }
    function _getParent(element, className) {
        for (var p = element.parentNode; p && p !== document;) {
            if (!0 === _hasClass(p, className))
                return p;
            p = p.parentNode;
        }
        return null;
    }
    function _isExist(element) {
        return null != element;
    }
    function _getOffset(element) {
        var rect = element.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    }
    function _isStaticUrl(url) {
        return _staticUrlRegex.test(url);
    }
    function _getThumbUrl(staticUrl) {
        return staticUrl.replace(_staticUrlRegex, (function (_, domain) {
            return "/" + t_lazyload__getThumbDomainName() + "." + (_staticUrlReplaces[ domain ] || "com") + "/";
        }
        ));
    }
    function _setSources(target, source, srcsetDataAttribute, srcDataAttribute) {
        var src = source.getAttribute("data-" + srcDataAttribute);
        if (src) {
            var width = source.clientWidth, height = source.clientHeight, wrp, wrp;
            if ((_hasClass(source, "t-slds__bgimg") || _hasClass(source, "t-slds__img")) && !_hasClass(source, "t827__image"))
                (wrp = _getParent(source, "t-slds__wrapper")) || (wrp = _getParent(source, "t-slds__container")),
                    !1 === _isExist(wrp) && (wrp = _getParent(source, "t-slds__thumbsbullet")),
                    _isExist(wrp) && (width = wrp.clientWidth,
                        height = wrp.clientHeight);
            if (_hasClass(source, "tn-atom") && _hasClass(source, "t-bgimg"))
                if (_isExist(wrp = _getParent(source, "tn-atom__scale-wrapper"))) {
                    var rect = wrp.getBoundingClientRect(), foo;
                    width = (foo = t_lazyload__round("round", rect.width, rect.height, 10))[ 0 ],
                        height = foo[ 1 ];
                }
            var x = "", y = "", bgsize = "", bgatt = "", comm = "", rule = "", round = 1, doo = !0, skip = !1, foo;
            if ("yes" == window.lazy_imgoptimoff && (doo = !1),
                "y" !== window.lazy_err_thumb && "y" !== window.lazy_err_static || (doo = !1),
                "IMG" === source.tagName)
                comm = "resize";
            else if ("undefined" != typeof getComputedStyle) {
                var sourceStyles = getComputedStyle(source), bgPos = sourceStyles.backgroundPosition, foo;
                if (bgPos)
                    "50%" == (x = (foo = bgPos.split(" "))[ 0 ]) ? x = "center" : "0%" == x ? x = "left" : "100%" == x && (x = "right"),
                        "50%" == (y = foo[ 1 ]) ? y = "center" : "0%" == y ? y = "top" : "100%" == y && (y = "bottom");
                comm = "contain" == (bgsize = sourceStyles.backgroundSize) ? "contain" : "cover",
                    "fixed" == (bgatt = sourceStyles.backgroundAttachment) && (skip = !0);
            } else
                skip = !0;
            if (rule = source.getAttribute("data-lazy-rule")) {
                var a = rule.split(","), i;
                for (i = 0; i < a.length; i++)
                    a[ i ].indexOf("round:") > -1 && (round = 1 * a[ i ].split(":")[ 1 ]),
                        a[ i ].indexOf("comm:") > -1 && "resize" != (comm = a[ i ].split(":")[ 1 ]) && "cover" != comm && "contain" != comm && (doo = !1),
                        a[ i ].indexOf("skip") > -1 && (skip = !0),
                        a[ i ].indexOf("optimoff") > -1 && (doo = !1);
            }
            if (round > 1)
                width = (foo = t_lazyload__round(comm, width, height, round))[ 0 ],
                    height = foo[ 1 ];
            if ("cover" == comm && width > 0 && height > 0 && width <= 1e3)
                if (width === 5 * Math.ceil(width / 5) && height === 5 * Math.ceil(height / 5))
                    ;
                else if (_popularResolutions.indexOf(width + "x" + height) > -1)
                    ;
                else if (_popularResolutionsOther.indexOf(width + "x" + height) > -1)
                    ;
                else if (_hasClass(source, "tn-atom") || _hasClass(source, "tn-atom__img"))
                    ;
                else {
                    var foo;
                    _hasClass(source, "t-cover__carrier") || (comm = "resize"),
                        width = (foo = t_lazyload__round(comm, width, height, 100))[ 0 ],
                        height = foo[ 1 ];
                }
            if ("resize" == comm && width < 30 && (skip = !0),
                !0 === doo && (src = !0 === skip || width > 1e3 || height > 1e3 || 0 == width || "IMG" != source.tagName && 0 == height ? t_lazyload__getWebPUrl(src) : t_lazyload__getResizeUrl(source.tagName, comm, src, width, height, x, y, bgsize)),
                "y" === window.lazy_err_static && _isStaticUrl(src) && (src = src.replace(_staticUrlRegex, "/static3.tildacdn.com/")),
                src) {
                if ("IMG" === target.tagName)
                    target.setAttribute("src", src);
                else if ("IFRAME" === target.tagName)
                    target.setAttribute("src", src);
                else if ("OBJECT" === target.tagName)
                    target.setAttribute("data", src);
                else {
                    var gradient, split;
                    if (-1 !== target.style.backgroundImage.indexOf("-gradient("))
                        gradient = target.style.backgroundImage.split("), ")[ 1 ];
                    gradient ? target.style.backgroundImage = "url(" + src + "), " + gradient : (target.style.backgroundImage = "url(" + src + ")",
                        t_lazyload__checkParentBackground(target, src));
                }
                source.lazy_loading_src = src;
            }
        } else
            _removeClass(source, "loading");
    }
    function t_lazyload__checkParentBackground(el, imageUrl) {
        var coverId = el.getAttribute("data-content-cover-id");
        if (coverId) {
            var srcType = imageUrl.split(".");
            srcType = srcType[ srcType.length - 1 ];
            var parentEl = document.getElementById("recorddiv" + coverId);
            "svg" === srcType && (parentEl.style.backgroundImage = "");
        }
    }
    function t_lazyload__round(comm, width, height, round) {
        if ("cover" == comm && width > 0 && height > 0) {
            var rr = width / height
                , ratio = 1;
            rr <= 1 ? (rr <= .8 && (ratio = .8),
                rr <= .751 && (ratio = .75),
                rr <= .667 && (ratio = .667),
                rr <= .563 && (ratio = .562),
                rr <= .501 && (ratio = .5),
                height = Math.ceil(height / round) * round,
                width = Math.ceil(height * ratio),
                width = 10 * Math.ceil(width / 10)) : (rr >= 1.25 && (ratio = 1.25),
                    rr >= 1.332 && (ratio = 1.333),
                    rr >= 1.5 && (ratio = 1.5),
                    rr >= 1.777 && (ratio = 1.777),
                    rr >= 2 && (ratio = 2),
                    width = Math.ceil(width / round) * round,
                    height = Math.ceil(width / ratio),
                    height = 10 * Math.ceil(height / 10));
        } else
            width > 0 && (width = Math.ceil(width / round) * round),
                height > 0 && (height = Math.ceil(height / round) * round);
        return [ width, height ];
    }
    function t_lazyload__getResizeUrl(tagName, comm, str, width, height, x, y) {
        if ("undefined" == str || null == str)
            return str;
        if (str.indexOf(".svg") > 0 || str.indexOf(".gif") > 0 || str.indexOf(".ico") > 0 || -1 === str.indexOf("static.tildacdn.") || str.indexOf("-/empty/") > 0 || str.indexOf("-/resizeb/") > 0)
            return str;
        if (str.indexOf("/-/") > -1)
            return str;
        if (0 == width && 0 == height)
            return str;
        if ("y" == window.lazy_err_thumb)
            return str;
        if (str.indexOf("lib") > -1)
            return str;
        if ("IMG" !== tagName && "DIV" !== tagName && "TD" !== tagName && "A" !== tagName)
            return str;
        var k = 1, newstr;
        if (1 === window.devicePixelRatio && Math.max(width, height) <= 400 && (k = 1.2),
            window.devicePixelRatio > 1 && (k = 2),
            width > 0 && (width = parseInt(k * width)),
            height > 0 && (height = parseInt(k * height)),
            width > 1e3 || height > 1800)
            return newstr = t_lazyload__getWebPUrl(str);
        if ("resize" == comm) {
            var arrr;
            (arrr = str.split("/")).splice(str.split("/").length - 1, 0, "-/resize/" + width + "x" + ("DIV" == tagName && height > 0 ? height : "") + "/" + ("y" == window.lazy_webp ? "-/format/webp" : ""));
            var newstr = _getThumbUrl(arrr.join("/"));
        } else {
            if (width <= 0 && height <= 0)
                return str;
            var arrr;
            "left" !== x && "right" !== x && (x = "center"),
                "top" !== y && "bottom" !== y && (y = "center"),
                (arrr = str.split("/")).splice(str.split("/").length - 1, 0, "-/" + comm + "/" + width + "x" + height + "/" + x + "/" + y + "/" + ("y" == window.lazy_webp ? "-/format/webp" : ""));
            var newstr = _getThumbUrl(arrr.join("/"));
        }
        return newstr;
    }
    function t_lazyload__getWebPUrl(str) {
        if ("undefined" == str || null == str)
            return str;
        if (str.indexOf(".svg") > 0 || str.indexOf(".gif") > 0 || str.indexOf(".ico") > 0 || -1 === str.indexOf("static.tildacdn.") || str.indexOf("-/empty/") > 0 || str.indexOf("-/resizeb/") > 0)
            return str;
        if (str.indexOf("/-/") > -1)
            return str;
        if (str.indexOf("lib") > -1)
            return str;
        if ("y" !== window.lazy_webp)
            return str;
        if ("y" === window.lazy_err_thumb)
            return str;
        var arrr = str.split("/"), newstr;
        return arrr.splice(str.split("/").length - 1, 0, "-/format/webp"),
            _getThumbUrl(arrr.join("/"));
    }
    function t_lazyload__reloadonError(element, src, startTime) {
        if ("string" == typeof src && null != src && "" != src) {
            var newsrc;
            if (console.log("lazy loading err"),
                _isStaticUrl(src))
                return window.lazy_err_static = "y",
                    void t_lazyload__reloadonError__reload(element, newsrc = src.replace(_staticUrlRegex, "/static3.tildacdn.com/"));
            if (-1 !== src.indexOf(t_lazyload__getThumbDomainName()) && -1 !== src.indexOf("/-/")) {
                window.lazy_err_thumb = "y";
                var arrr = src.split("/"), uid = "", name = "", newsrc;
                if (arrr.length > 3)
                    for (var i = 0; i < arrr.length; i++)
                        "" !== arrr[ i ] && ("til" == arrr[ i ].substring(0, 3) && 36 == arrr[ i ].length && 4 == (arrr[ i ].match(/-/g) || []).length && (uid = arrr[ i ]),
                            i == arrr.length - 1 && (name = arrr[ i ]));
                if ("" !== uid && "" !== name)
                    t_lazyload__reloadonError__reload(element, newsrc = "https://static3.tildacdn.com/" + uid + "/" + name);
                if ("function" != typeof t_errors__sendCDNErrors) {
                    var s = document.createElement("script");
                    s.src = "https://static.tildacdn.com/js/tilda-errors-1.0.min.js",
                        s.type = "text/javascript",
                        s.async = !0,
                        document.body.appendChild(s);
                }
                var qTime = startTime > 1 ? _now() - startTime : "";
                "object" != typeof window.t_cdnerrors && (window.t_cdnerrors = []),
                    window.t_cdnerrors.push({
                        url: src,
                        time: qTime,
                        debug: {
                            domloaded: window.t_lazyload_domloaded
                        }
                    });
            }
        }
    }
    function t_lazyload__reloadonError__reload(element, src) {
        console.log("try reload: " + src),
            "IMG" === element.tagName ? src && element.setAttribute("src", src) : src && (element.style.backgroundImage = "url(" + src + ")");
    }
    function LazyLoad(instanceSettings) {
        _init(),
            this._settings = _merge_objects(_defaultSettings, instanceSettings),
            this._queryOriginNode = this._settings.container === window ? document : this._settings.container,
            this._previousLoopTime = 0,
            this._loopTimeout = null,
            _supportsObserver && this._initializeObserver(),
            this.update(),
            this.loadAnimatedImages();
    }
    return LazyLoad.prototype._showOnLoad = function (element) {
        var fakeImg, settings = this._settings, startTime;
        function loadCallback() {
            null !== settings && (t_lazyLoad__appendImgStatToArr(fakeImg, startTime),
                settings.callback_load && settings.callback_load(element),
                _setSources(element, element, settings.data_srcset, settings.data_src),
                settings.callback_set && settings.callback_set(element),
                _removeClass(element, settings.class_loading),
                _addClass(element, settings.class_loaded),
                fakeImg.removeEventListener("load", loadCallback));
        }
        !element.getAttribute("src") && settings.placeholder && element.setAttribute("src", settings.placeholder),
            (fakeImg = document.createElement("img")).addEventListener("load", loadCallback),
            fakeImg.addEventListener("error", (function (ev) {
                _removeClass(element, settings.class_loading),
                    settings.callback_error && settings.callback_error(element),
                    void 0 !== ev.path ? t_lazyload__reloadonError(element, ev.path[ 0 ].currentSrc, startTime) : void 0 !== ev.target && t_lazyload__reloadonError(element, ev.target.currentSrc, startTime);
            }
            )),
            _addClass(element, settings.class_loading),
            startTime = _now(),
            _setSources(fakeImg, element, settings.data_srcset, settings.data_src);
    }
        ,
        LazyLoad.prototype._showOnAppear = function (element) {
            var settings = this._settings, startTime;
            function loadCallback() {
                null !== settings && (t_lazyLoad__appendImgStatToArr(element, startTime),
                    settings.callback_load && settings.callback_load(element),
                    _removeClass(element, settings.class_loading),
                    _addClass(element, settings.class_loaded),
                    element.removeEventListener("load", loadCallback));
            }
            "IMG" !== element.tagName && "IFRAME" !== element.tagName || (element.addEventListener("load", loadCallback),
                element.addEventListener("error", (function (ev) {
                    element.removeEventListener("load", loadCallback),
                        _removeClass(element, settings.class_loading),
                        settings.callback_error && settings.callback_error(element),
                        void 0 !== ev.path ? t_lazyload__reloadonError(element, ev.path[ 0 ].currentSrc, startTime) : void 0 !== ev.target && t_lazyload__reloadonError(element, ev.target.currentSrc, startTime);
                }
                )),
                _addClass(element, settings.class_loading)),
                startTime = _now(),
                _setSources(element, element, settings.data_srcset, settings.data_src),
                settings.callback_set && settings.callback_set(element);
        }
        ,
        LazyLoad.prototype._show = function (element) {
            this._settings.show_while_loading ? this._showOnAppear(element) : this._showOnLoad(element);
        }
        ,
        LazyLoad.prototype._initializeObserver = function () {
            var self = this;
            this._intersectionObserver = new IntersectionObserver((function (entries) {
                var scrollY = window.scrollY;
                entries.forEach((function (entry) {
                    var element = entry.target;
                    if (!(self._settings.skip_invisible && element.isSkipByPosition && element.isNotUnderScreenRange)) {
                        var isAboveViewport = entry.boundingClientRect.top + scrollY < 0
                            , parentZeroElem = element.closest(".t396__elem")
                            , isAboveInnerViewport = parentZeroElem && 0 === parentZeroElem.style.top.indexOf("-");
                        if (element.wasProcessed)
                            return self._intersectionObserver.unobserve(element),
                                void (self._settings.callback_processed && self._settings.callback_processed(self._elements.length));
                        (entry.isIntersecting || isAboveViewport || isAboveInnerViewport) && (self._show(element),
                            element.wasProcessed = !0);
                    }
                }
                ));
            }
            ), {
                rootMargin: this._settings.threshold + "px",
                threshold: [ 0 ]
            });
        }
        ,
        LazyLoad.prototype.loadAnimatedImages = function () {
            var i, element, settings = this._settings, elements = this._elements, elementsLength = elements ? elements.length : 0;
            function getTriggerElementOffset(element, type) {
                var trgEl;
                if ("trigger" === type) {
                    var trgId = element.getAttribute("data-animate-sbs-trgels");
                    trgId && (trgEl = document.querySelector('[data-elem-id="' + trgId + '"]'));
                } else
                    "viewport" === type && (trgEl = _getParent(element, "t396"));
                return _isExist(trgEl) ? _getOffset(trgEl) : null;
            }
            function isFarAway(element, type) {
                var trgOffset = getTriggerElementOffset(element, type);
                if (!trgOffset)
                    return !1;
                var elemOffset = _getOffset(element)
                    , distanceTopBottomBetween = Math.abs(trgOffset.top - elemOffset.top)
                    , distanceRightLeftBetween = Math.abs(trgOffset.left - elemOffset.left);
                return distanceTopBottomBetween > settings.threshold || distanceRightLeftBetween > settings.threshold;
            }
            for (i = 0; i < elementsLength; i++)
                if (_hasClass(element = elements[ i ], "tn-atom__img") || _hasClass(element, "tn-atom")) {
                    var elContainer = _getParent(element, "tn-elem"), isAnimated = elContainer.getAttribute("data-animate-sbs-opts"), animEvent = elContainer.getAttribute("data-animate-sbs-event"), animTrgEls, animType;
                    "intoview" !== animEvent && "blockintoview" !== animEvent || (animType = "viewport"),
                        elContainer.getAttribute("data-animate-sbs-trgels") || (animType = "trigger"),
                        settings.skip_invisible && null === element.offsetParent || !isAnimated || isFarAway(elContainer, animType) && (settings.show_while_loading ? this._showOnAppear(element) : this._showOnLoad(element),
                            element.wasProcessed = !0,
                            settings.callback_processed && settings.callback_processed(elements.length));
                }
        }
        ,
        LazyLoad.prototype.update = function () {
            var self = this;
            if (this._elements = _convertToArray(this._queryOriginNode.querySelectorAll(this._settings.elements_selector)),
                _supportsObserver && this._intersectionObserver)
                return this._intersectionObserver.disconnect(),
                    this._elements.forEach((function (element) {
                        self._intersectionObserver.observe(element);
                    }
                    ));
            this._elements.forEach((function (element) {
                self._show(element),
                    self._settings.callback_processed && self._settings.callback_processed(self._elements.length),
                    element.wasProcessed = !0;
            }
            ));
        }
        ,
        LazyLoad.prototype.destroy = function () {
            this._intersectionObserver.disconnect(),
                this._elements = null,
                this._queryOriginNode = null,
                this._settings = null;
        }
        ,
        LazyLoad;
}
)),
    window.lazy = "y",
    "loading" != document.readyState ? t_lazyload__init() : document.addEventListener("DOMContentLoaded", t_lazyload__init),
    window.t_lazyload_updateResize_elem = function (elem) {
        if (window.jQuery && elem instanceof jQuery) {
            if (0 == elem.length)
                return;
            elem = elem.get(0);
        }
        if (null != elem) {
            var tagName = elem.tagName;
            if ("IMG" == tagName)
                var str = elem.getAttribute("src")
                    , prefix = "-/resize/";
            else if ("undefined" != typeof getComputedStyle) {
                var elemStyles = getComputedStyle(elem)
                    , str = elemStyles.backgroundImage.replace("url(", "").replace(")", "").replace(/"/gi, "");
                if ("contain" === elemStyles.backgroundSize)
                    var prefix = "-/contain/";
                else
                    var prefix = "-/cover/";
            } else
                var prefix = "-/cover/";
            if (!(null == str || -1 === str.indexOf(prefix) || str.indexOf(".svg") > 0 || str.indexOf(".gif") > 0 || str.indexOf(".ico") > 0 || -1 === str.indexOf(t_lazyload__getThumbDomainName()) || str.indexOf("-/empty/") > 0 && str.indexOf("-/resizeb/") > 0)) {
                var pos = str.indexOf(prefix) + prefix.length
                    , pos2 = str.indexOf("/", pos);
                if (pos > 0 && pos2 > 0) {
                    var modWH = str.slice(pos, pos2).split("x")
                        , width = elem.clientWidth
                        , height = elem.clientHeight;
                    if (width > 0 && height > 0 && (modWH[ 0 ] > 0 || modWH[ 1 ] > 0) && (modWH[ 0 ] > 0 && width > modWH[ 0 ] || modWH[ 1 ] > 0 && height > modWH[ 1 ]) && (modWH[ 0 ] > 0 && width - modWH[ 0 ] > 100 || modWH[ 1 ] > 0 && height - modWH[ 1 ] > 100)) {
                        var newstr = str.slice(0, pos) + (modWH[ 0 ] > 0 ? width : "") + "x" + (modWH[ 1 ] > 0 ? height : "") + str.substring(pos2);
                        "IMG" == tagName ? elem.setAttribute("src", newstr) : elem.style.backgroundImage = "url('" + newstr + "')";
                    }
                }
            }
        }
    }
    ,
    window.t_loadImgStats = [];
