// @ts-nocheck


const registerDrawSvgPlugin = () => {
    !function (e, t) {
        "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define([ "exports" ], t) : t((e = e || self).window = e.window || {});
    }(this, function (e) {
        "use strict";
        function l() {
            return "undefined" != typeof window;
        }
        function m() {
            return o || l() && (o = window.gsap) && o.registerPlugin && o;
        }
        function p(e) {
            return Math.round(1e4 * e) / 1e4;
        }
        function q(e) {
            return parseFloat(e) || 0;
        }
        function r(e, t) {
            var n = q(e);
            return ~e.indexOf("%") ? n / 100 * t : n;
        }
        function s(e, t) {
            return q(e.getAttribute(t));
        }
        function u(e, t, n, r, i, o) {
            return M(Math.pow((q(n) - q(e)) * i, 2) + Math.pow((q(r) - q(t)) * o, 2));
        }
        function v(e) {
            return console.warn(e);
        }
        function w(e) {
            return "non-scaling-stroke" === e.getAttribute("vector-effect");
        }
        function z() {
            return String.fromCharCode.apply(null, arguments);
        }
        function F(e) {
            if (!(e = x(e)[ 0 ]))
                return 0;
            var t, n, r, i, o, a, f, d = e.tagName.toLowerCase(), l = e.style, h = 1, c = 1;
            w(e) && (c = e.getScreenCTM(),
                h = M(c.a * c.a + c.b * c.b),
                c = M(c.d * c.d + c.c * c.c));
            try {
                n = e.getBBox();
            } catch (e) {
                v("Some browsers won't measure invisible elements (like display:none or masks inside defs).");
            }
            var g = n || {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            }
                , z = g.x
                , y = g.y
                , _ = g.width
                , m = g.height;
            if (n && (_ || m) || !P[ d ] || (_ = s(e, P[ d ][ 0 ]),
                m = s(e, P[ d ][ 1 ]),
                "rect" !== d && "line" !== d && (_ *= 2,
                    m *= 2),
                "line" === d && (z = s(e, "x1"),
                    y = s(e, "y1"),
                    _ = Math.abs(_ - z),
                    m = Math.abs(m - y))),
                "path" === d)
                i = l.strokeDasharray,
                    l.strokeDasharray = "none",
                    t = e.getTotalLength() || 0,
                    p(h) !== p(c) && !k && (k = 1) && v("Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke and the element isn't proportionally scaled."),
                    t *= (h + c) / 2,
                    l.strokeDasharray = i;
            else if ("rect" === d)
                t = 2 * _ * h + 2 * m * c;
            else if ("line" === d)
                t = u(z, y, z + _, y + m, h, c);
            else if ("polyline" === d || "polygon" === d)
                for (r = e.getAttribute("points").match(b) || [],
                    "polygon" === d && r.push(r[ 0 ], r[ 1 ]),
                    t = 0,
                    o = 2; o < r.length; o += 2)
                    t += u(r[ o - 2 ], r[ o - 1 ], r[ o ], r[ o + 1 ], h, c) || 0;
            else
                "circle" !== d && "ellipse" !== d || (a = _ / 2 * h,
                    f = m / 2 * c,
                    t = Math.PI * (3 * (a + f) - M((3 * a + f) * (a + 3 * f))));
            return t || 0;
        }
        function G(e, t) {
            if (!(e = x(e)[ 0 ]))
                return [ 0, 0 ];
            t = t || F(e) + 1;
            var n = f.getComputedStyle(e)
                , r = n.strokeDasharray || ""
                , i = q(n.strokeDashoffset)
                , o = r.indexOf(",");
            return o < 0 && (o = r.indexOf(" ")),
                t < (r = o < 0 ? t : q(r.substr(0, o))) && (r = t),
                [ -i || 0, r - i || 0 ];
        }
        function H() {
            l() && (f = window,
                h = o = m(),
                x = o.utils.toArray,
                c = o.core.getStyleSaver,
                g = o.core.reverting || function () {}
                ,
                d = -1 !== ((f.navigator || {}).userAgent || "").indexOf("Edge"));
        }
        var o, x, f, d, h, k, c, g, b = /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi, P = {
            rect: [ "width", "height" ],
            circle: [ "r", "r" ],
            ellipse: [ "rx", "ry" ],
            line: [ "x2", "y2" ]
        }, M = Math.sqrt, a = "DrawSVGPlugin", y = z(103, 114, 101, 101, 110, 115, 111, 99, 107, 46, 99, 111, 109), _ = z(103, 115, 97, 112, 46, 99, 111, 109), S = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}:?\d*$/,
            t = {
                version: "3.12.3",
                name: "drawSVG",
                register: function register(e) {
                    o = e,
                        H();
                },
                init: function init(e, t, n) {
                    if (!e.getBBox)
                        return !1;
                    h || H();
                    var i, o, s, a = F(e);
                    return this.styles = c && c(e, "strokeDashoffset,strokeDasharray,strokeMiterlimit"),
                        this.tween = n,
                        this._style = e.style,
                        this._target = e,
                        t + "" == "true" ? t = "0 100%" : t ? -1 === (t + "").indexOf(" ") && (t = "0 " + t) : t = "0 0",
                        o = function _parse(e, t, n) {
                            var i, o, s = e.indexOf(" ");
                            return o = s < 0 ? (i = void 0 !== n ? n + "" : e,
                                e) : (i = e.substr(0, s),
                                    e.substr(s + 1)),
                                i = r(i, t),
                                (o = r(o, t)) < i ? [ o, i ] : [ i, o ];
                        }(t, a, (i = G(e, a))[ 0 ]),
                        this._length = p(a),
                        this._dash = p(i[ 1 ] - i[ 0 ]),
                        this._offset = p(-i[ 0 ]),
                        this._dashPT = this.add(this, "_dash", this._dash, p(o[ 1 ] - o[ 0 ]), 0, 0, 0, 0, 0, 1),
                        this._offsetPT = this.add(this, "_offset", this._offset, p(-o[ 0 ]), 0, 0, 0, 0, 0, 1),
                        d && (s = f.getComputedStyle(e)).strokeLinecap !== s.strokeLinejoin && (o = q(s.strokeMiterlimit),
                            this.add(e.style, "strokeMiterlimit", o, o + .01)),
                        this._live = w(e) || ~(t + "").indexOf("live"),
                        this._nowrap = ~(t + "").indexOf("nowrap"),
                        this._props.push("drawSVG");/*,
                            O;*/
                },
                render: function render(e, t) {
                    if (t.tween._time || !g()) {
                        var n, r, i, o, s = t._pt, a = t._style;
                        if (s) {
                            for (t._live && (n = F(t._target)) !== t._length && (r = n / t._length,
                                t._length = n,
                                t._offsetPT && (t._offsetPT.s *= r,
                                    t._offsetPT.c *= r),
                                t._dashPT ? (t._dashPT.s *= r,
                                    t._dashPT.c *= r) : t._dash *= r); s;)
                                s.r(e, s.d),
                                    s = s._next;
                            i = t._dash || e && 1 !== e && 1e-4 || 0,
                                n = t._length - i + .1,
                                o = t._offset,
                                i && o && i + Math.abs(o % t._length) > t._length - .2 && (o += o < 0 ? .1 : -.1) && (n += .1),
                                a.strokeDashoffset = i ? o : o + .001,
                                a.strokeDasharray = n < .2 ? "none" : i ? i + "px," + (t._nowrap ? 999999 : n) + "px" : "0px, 999999px";
                        }
                    } else
                        t.styles.revert();
                },
                getLength: F,
                getPosition: G
            };
        m() && o.registerPlugin(t),
            e.DrawSVGPlugin = t,
            e.default = t;
        if (typeof (window) === "undefined" || window !== e) {
            Object.defineProperty(e, "__esModule", {
                value: !0
            });
        } else {
            delete e.default;
        }
    });
};



const registerSplitText = () => {
    ! function (D, u) {
        "object" == typeof exports && "undefined" != typeof module ? u(exports) : "function" == typeof define && define.amd ? define([ "exports" ], u) : u((D = D || self).window = D.window || {});
    }(this, function (u) {
        "use strict";
        var b = /([\uD800-\uDBFF][\uDC00-\uDFFF](?:[\u200D\uFE0F][\uD800-\uDBFF][\uDC00-\uDFFF]){2,}|\uD83D\uDC69(?:\u200D(?:(?:\uD83D\uDC69\u200D)?\uD83D\uDC67|(?:\uD83D\uDC69\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]\uFE0F|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC6F\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3C-\uDD3E\uDDD6-\uDDDF])\u200D[\u2640\u2642]\uFE0F|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])\uFE0F|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC69\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708]))\uFE0F|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83D\uDC69\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]))|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\u200D(?:(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F)/;

        function n(D) {
            U = document, e = window, (i = i || D || e.gsap || console.warn("Please gsap.registerPlugin(SplitText)")) && (r = i.utils.toArray, s = i.core.context || function () {}, t = 1);
        }

        function q() {
            return String.fromCharCode.apply(null, arguments);
        }

        function v(D) {
            return e.getComputedStyle(D);
        }

        function w(D) {
            return "absolute" === D.position || !0 === D.absolute;
        }

        function x(D, u) {
            for (var e, t = u.length; - 1 < --t;)
                if (e = u[ t ], D.substr(0, e.length) === e) return e.length;
        }

        function z(D, u) {
            void 0 === D && (D = "");
            var e = ~D.indexOf("++"),
                t = 1;
            return e && (D = D.split("++").join("")),
                function () {
                    return "<" + u + " style='position:relative;display:inline-block;'" + (D ? " class='" + D + (e ? t++ : "") + "'>" : ">");
                };
        }

        function A(D, u, e) {
            var t = D.nodeType;
            if (1 === t || 9 === t || 11 === t)
                for (D = D.firstChild; D; D = D.nextSibling) A(D, u, e);
            else 3 !== t && 4 !== t || (D.nodeValue = D.nodeValue.split(u).join(e));
        }

        function B(D, u) {
            for (var e = u.length; - 1 < --e;) D.push(u[ e ]);
        }

        function C(D, u, e) {
            for (var t; D && D !== u;) {
                if (t = D._next || D.nextSibling) return t.textContent.charAt(0) === e;
                D = D.parentNode || D._parent;
            }
        }

        function D(u) {
            var e, t, F = r(u.childNodes),
                i = F.length;
            for (e = 0; e < i; e++)(t = F[ e ])._isSplit ? D(t) : e && t.previousSibling && 3 === t.previousSibling.nodeType ? (t.previousSibling.nodeValue += 3 === t.nodeType ? t.nodeValue : t.firstChild.nodeValue, u.removeChild(t)) : 3 !== t.nodeType && (u.insertBefore(t.firstChild, t), u.removeChild(t));
        }

        function E(D, u) {
            return parseFloat(u[ D ]) || 0;
        }

        function F(u, e, t, F, i, n, s) {
            var r, o, l, d, a, p, h, f, c, g, x, y, b = v(u),
                S = E("paddingLeft", b),
                _ = -999,
                m = E("borderBottomWidth", b) + E("borderTopWidth", b),
                q = E("borderLeftWidth", b) + E("borderRightWidth", b),
                T = E("paddingTop", b) + E("paddingBottom", b),
                N = E("paddingLeft", b) + E("paddingRight", b),
                L = E("fontSize", b) * (e.lineThreshold || .2),
                W = b.textAlign,
                H = [],
                O = [],
                j = [],
                k = e.wordDelimiter || " ",
                V = e.tag ? e.tag : e.span ? "span" : "div",
                M = e.type || e.split || "chars,words,lines",
                R = i && ~M.indexOf("lines") ? [] : null,
                P = ~M.indexOf("words"),
                z = ~M.indexOf("chars"),
                G = w(e),
                $ = e.linesClass,
                I = ~($ || "").indexOf("++"),
                J = [],
                K = "flex" === b.display,
                Q = u.style.display;
            for (I && ($ = $.split("++").join("")), K && (u.style.display = "block"), l = (o = u.getElementsByTagName("*")).length, a = [], r = 0; r < l; r++) a[ r ] = o[ r ];
            if (R || G)
                for (r = 0; r < l; r++)((p = (d = a[ r ]).parentNode === u) || G || z && !P) && (y = d.offsetTop, R && p && Math.abs(y - _) > L && ("BR" !== d.nodeName || 0 === r) && (h = [], R.push(h), _ = y), G && (d._x = d.offsetLeft, d._y = y, d._w = d.offsetWidth, d._h = d.offsetHeight), R && ((d._isSplit && p || !z && p || P && p || !P && d.parentNode.parentNode === u && !d.parentNode._isSplit) && (h.push(d), d._x -= S, C(d, u, k) && (d._wordEnd = !0)), "BR" === d.nodeName && (d.nextSibling && "BR" === d.nextSibling.nodeName || 0 === r) && R.push([])));
            for (r = 0; r < l; r++)
                if (p = (d = a[ r ]).parentNode === u, "BR" !== d.nodeName)
                    if (G && (c = d.style, P || p || (d._x += d.parentNode._x, d._y += d.parentNode._y), c.left = d._x + "px", c.top = d._y + "px", c.position = "absolute", c.display = "block", c.width = d._w + 1 + "px", c.height = d._h + "px"), !P && z)
                        if (d._isSplit)
                            for (d._next = o = d.nextSibling, d.parentNode.appendChild(d); o && 3 === o.nodeType && " " === o.textContent;) d._next = o.nextSibling, d.parentNode.appendChild(o), o = o.nextSibling;
                        else d.parentNode._isSplit ? (d._parent = d.parentNode, !d.previousSibling && d.firstChild && (d.firstChild._isFirst = !0), d.nextSibling && " " === d.nextSibling.textContent && !d.nextSibling.nextSibling && J.push(d.nextSibling), d._next = d.nextSibling && d.nextSibling._isFirst ? null : d.nextSibling, d.parentNode.removeChild(d), a.splice(r--, 1), l--) : p || (y = !d.nextSibling && C(d.parentNode, u, k), d.parentNode._parent && d.parentNode._parent.appendChild(d), y && d.parentNode.appendChild(U.createTextNode(" ")), "span" === V && (d.style.display = "inline"), H.push(d));
                    else d.parentNode._isSplit && !d._isSplit && "" !== d.innerHTML ? O.push(d) : z && !d._isSplit && ("span" === V && (d.style.display = "inline"), H.push(d));
                else R || G ? (d.parentNode && d.parentNode.removeChild(d), a.splice(r--, 1), l--) : P || u.appendChild(d);
            for (r = J.length; - 1 < --r;) J[ r ].parentNode.removeChild(J[ r ]);
            if (R) {
                for (G && (g = U.createElement(V), u.appendChild(g), x = g.offsetWidth + "px", y = g.offsetParent === u ? 0 : u.offsetLeft, u.removeChild(g)), c = u.style.cssText, u.style.cssText = "display:none;"; u.firstChild;) u.removeChild(u.firstChild);
                for (f = " " === k && (!G || !P && !z), r = 0; r < R.length; r++) {
                    for (h = R[ r ], (g = U.createElement(V)).style.cssText = "display:block;text-align:" + W + ";position:" + (G ? "absolute;" : "relative;"), $ && (g.className = $ + (I ? r + 1 : "")), j.push(g), l = h.length, o = 0; o < l; o++) "BR" !== h[ o ].nodeName && (d = h[ o ], g.appendChild(d), f && d._wordEnd && g.appendChild(U.createTextNode(" ")), G && (0 === o && (g.style.top = d._y + "px", g.style.left = S + y + "px"), d.style.top = "0px", y && (d.style.left = d._x - y + "px")));
                    0 === l ? g.innerHTML = "&nbsp;" : P || z || (D(g), A(g, String.fromCharCode(160), " ")), G && (g.style.width = x, g.style.height = d._h + "px"), u.appendChild(g);
                }
                u.style.cssText = c;
            }
            G && (s > u.clientHeight && (u.style.height = s - T + "px", u.clientHeight < s && (u.style.height = s + m + "px")), n > u.clientWidth && (u.style.width = n - N + "px", u.clientWidth < n && (u.style.width = n + q + "px"))), K && (Q ? u.style.display = Q : u.style.removeProperty("display")), B(t, H), P && B(F, O), B(i, j);
        }

        function G(D, u, e, t) {
            function sb(D) {
                return D === p || D === m && " " === p;
            }
            var F, i, n, C, s, E, r, o, l = u.tag ? u.tag : u.span ? "span" : "div",
                d = ~(u.type || u.split || "chars,words,lines").indexOf("chars"),
                a = w(u),
                p = u.wordDelimiter || " ",
                h = " " !== p ? "" : a ? "&#173; " : " ",
                f = "</" + l + ">",
                B = 1,
                c = u.specialChars ? "function" == typeof u.specialChars ? u.specialChars : x : null,
                g = U.createElement("div"),
                y = D.parentNode;
            for (y.insertBefore(g, D), g.textContent = D.nodeValue, y.removeChild(D), r = -1 !== (F = function getText(D) {
                var u = D.nodeType,
                    e = "";
                if (1 === u || 9 === u || 11 === u) {
                    if ("string" == typeof D.textContent) return D.textContent;
                    for (D = D.firstChild; D; D = D.nextSibling) e += getText(D);
                } else if (3 === u || 4 === u) return D.nodeValue;
                return e;
            }(D = g)).indexOf("<"), !1 !== u.reduceWhiteSpace && (F = F.replace(_, " ").replace(S, "")), r && (F = F.split("<").join("{{LT}}")), s = F.length, i = (" " === F.charAt(0) ? h : "") + e(), n = 0; n < s; n++)
                if (E = F.charAt(n), c && (o = c(F.substr(n), u.specialChars))) E = F.substr(n, o || 1), i += d && " " !== E ? t() + E + "</" + l + ">" : E, n += o - 1;
                else if (sb(E) && !sb(F.charAt(n - 1)) && n) {
                    for (i += B ? f : "", B = 0; sb(F.charAt(n + 1));) i += h, n++;
                    n === s - 1 ? i += h : ")" !== F.charAt(n + 1) && (i += h + e(), B = 1);
                } else "{" === E && "{{LT}}" === F.substr(n, 6) ? (i += d ? t() + "{{LT}}</" + l + ">" : "{{LT}}", n += 5) : 55296 <= E.charCodeAt(0) && E.charCodeAt(0) <= 56319 || 65024 <= F.charCodeAt(n + 1) && F.charCodeAt(n + 1) <= 65039 ? (C = ((F.substr(n, 12).split(b) || [])[ 1 ] || "").length || 2, i += d && " " !== E ? t() + F.substr(n, C) + "</" + l + ">" : F.substr(n, C), n += C - 1) : i += d && " " !== E ? t() + E + "</" + l + ">" : E;
            D.outerHTML = i + (B ? f : ""), r && A(y, "{{LT}}", "<");
        }

        function H(D, u, e, t) {
            var F, i, n = r(D.childNodes),
                C = n.length,
                s = w(u);
            if (3 !== D.nodeType || 1 < C) {
                for (u.absolute = !1, F = 0; F < C; F++)(i = n[ F ])._next = i._isFirst = i._parent = i._wordEnd = null, 3 === i.nodeType && !/\S+/.test(i.nodeValue) || (s && 3 !== i.nodeType && "inline" === v(i).display && (i.style.display = "inline-block", i.style.position = "relative"), i._isSplit = !0, H(i, u, e, t));
                return u.absolute = s, void (D._isSplit = !0);
            }
            G(D, u, e, t);
        }
        var U, e, t, i, s, r, o, S = /(?:\r|\n|\t\t)/g,
            _ = /(?:\s\s+)/g,
            m = String.fromCharCode(160),
            l = "SplitText",
            d = q(103, 114, 101, 101, 110, 115, 111, 99, 107, 46, 99, 111, 109),
            a = q(103, 115, 97, 112, 46, 99, 111, 109),
            p = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}:?\d*$/,
            f = ((o = SplitText.prototype).split = function split(D) {
                this.isSplit && this.revert(), this.vars = D = D || this.vars, this._originals.length = this.chars.length = this.words.length = this.lines.length = 0;
                for (var u, e, t, i = this.elements.length, n = D.tag ? D.tag : D.span ? "span" : "div", C = z(D.wordsClass, n), s = z(D.charsClass, n); - 1 < --i;) t = this.elements[ i ], this._originals[ i ] = {
                    html: t.innerHTML,
                    style: t.getAttribute("style")
                }, u = t.clientHeight, e = t.clientWidth, H(t, D, C, s), F(t, D, this.chars, this.words, this.lines, e, u);
                return this.chars.reverse(), this.words.reverse(), this.lines.reverse(), this.isSplit = !0, this;
            }, o.revert = function revert() {
                var e = this._originals;
                if (!e) throw "revert() call wasn't scoped properly.";
                return this.elements.forEach(function (D, u) {
                    D.innerHTML = e[ u ].html, D.setAttribute("style", e[ u ].style);
                }), this.chars = [], this.words = [], this.lines = [], this.isSplit = !1, this;
            }, SplitText.create = function create(D, u) {
                return new SplitText(D, u);
            }, SplitText);

        function SplitText(D, u) {
            t || n(), this.elements = r(D), this.chars = [], this.words = [], this.lines = [], this._originals = [], this.vars = u || {}, s(this), /*h &&*/ this.split(u);
        }
        f.version = "3.12.3", f.register = n, u.SplitText = f, u.default = f;
        if (typeof (window) === "undefined" || window !== u) {
            Object.defineProperty(u, "__esModule", {
                value: !0
            });
        } else {
            delete u.default;
        }
    });
};


const registerScrollSmoothPlugin = () => {
    ! function (e, t) {
        "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define([ "exports" ], t) : t((e = e || self).window = e.window || {});
    }(this, function (e) {
        "use strict";

        function _defineProperties(e, t) {
            for (var r = 0; r < t.length; r++) {
                var n = t[ r ];
                n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
            }
        }

        function s() {
            return "undefined" != typeof window;
        }

        function t() {
            return B || s() && (B = window.gsap) && B.registerPlugin && B;
        }

        function w() {
            return String.fromCharCode.apply(null, arguments);
        }

        function D(e) {
            return Z.maxScroll(e || L);
        }
        var B, F, L, I, j, q, W, Y, Z, K, $, G, J, Q, X, i = "ScrollSmoother",
            a = w(103, 114, 101, 101, 110, 115, 111, 99, 107, 46, 99, 111, 109),
            l = w(103, 115, 97, 112, 46, 99, 111, 109),
            c = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}:?\d*$/,
            r = (
                ScrollSmoother.register = function register(e) {
                    return F || (B = e || t(), s() && window.document && (L = window, I = document, j = I.documentElement, q = I.body), B && (W = B.utils.toArray, Y = B.utils.clamp, $ = B.parseEase("expo"), Q = B.core.context || function () {}, Z = B.core.globals().ScrollTrigger, B.core.globals("ScrollSmoother", ScrollSmoother), q && Z && (X = B.delayedCall(.2, function () {
                        return Z.isRefreshing || K && K.refresh();
                    }).pause(), G = Z.core._getVelocityProp, J = Z.core._inputObserver, ScrollSmoother.refresh = Z.refresh, F = 1))), F;
                }, function _createClass(e, t, r) {
                    return t && _defineProperties(e.prototype, t), r && _defineProperties(e, r), e;
                }(ScrollSmoother, [ {
                    key: "progress",
                    get: function get() {
                        return this.scrollTrigger ? this.scrollTrigger.animation._time / 100 : 0;
                    }
                } ]), ScrollSmoother
            );

        function ScrollSmoother(t) {
            var o = this;
            F || ScrollSmoother.register(B) || console.warn("Please gsap.registerPlugin(ScrollSmoother)"), t = this.vars = t || {}, K && K.kill(), Q(K = this);

            function Pa() {
                return U.update(-H);
            }

            function Ra() {
                return n.style.overflow = "visible";
            }

            function Ta(e) {
                e.update();
                var t = e.getTween();
                t && (t.pause(), t._time = t._dur, t._tTime = t._tDur), g = !1, e.animation.progress(e.progress, !0);
            }

            function Ua(e, t) {
                (e !== H && !f || t) && (x && (e = Math.round(e)), k && (n.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " + e + ", 0, 1)", n._gsap.y = e + "px"), M = e - H, H = e, Z.isUpdating || ScrollSmoother.isRefreshing || Z.update());
            }

            function Va(e) {
                return arguments.length ? (e < 0 && (e = 0), z.y = -e, g = !0, f ? H = -e : Ua(-e), Z.isRefreshing ? i.update() : E(e / A), this) : -H;
            }

            function Ya(e) {
                w.scrollTop = 0, e.target.contains && e.target.contains(w) || _ && !1 === _(o, e) || (Z.isInViewport(e.target) || e.target === p || o.scrollTo(e.target, !1, "center center"), p = e.target);
            }

            function Za(t, e) {
                if (t < e.start) return t;
                var r = isNaN(e.ratio) ? 1 : e.ratio,
                    n = e.end - e.start,
                    o = t - e.start,
                    i = e.offset || 0,
                    s = e.pins || [],
                    a = s.offset || 0,
                    l = e._startClamp && e.start <= 0 || e.pins && e.pins.offset ? 0 : e._endClamp && e.end === D() ? 1 : .5;
                return s.forEach(function (e) {
                    n -= e.distance, e.nativeStart <= t && (o -= e.distance);
                }), a && (o *= (n - a / r) / n), t + (o - i * l) / r - o;
            }

            function _a(t, r) {
                b.forEach(function (e) {
                    return function adjustEffectRelatedTriggers(e, t, r) {
                        r || (e.pins.length = e.pins.offset = 0);
                        var n, o, i, s, a, l, c, f, u = e.pins,
                            d = e.markers;
                        for (c = 0; c < t.length; c++)
                            if (f = t[ c ], e.trigger && f.trigger && e !== f && (f.trigger === e.trigger || f.pinnedContainer === e.trigger || e.trigger.contains(f.trigger)) && (a = f._startNative || f._startClamp || f.start, l = f._endNative || f._endClamp || f.end, i = Za(a, e), s = f.pin && 0 < l ? i + (l - a) : Za(l, e), f.setPositions(i, s, !0, (f._startClamp ? Math.max(0, i) : i) - a), f.markerStart && d.push(B.quickSetter([ f.markerStart, f.markerEnd ], "y", "px")), f.pin && 0 < f.end && !r)) {
                                if (n = f.end - f.start, o = e._startClamp && f.start < 0) {
                                    if (0 < e.start) return e.setPositions(0, e.end + (e._startNative - e.start), !0), void adjustEffectRelatedTriggers(e, t);
                                    n += f.start, u.offset = -f.start;
                                }
                                u.push({
                                    start: f.start,
                                    nativeStart: a,
                                    end: f.end,
                                    distance: n,
                                    trig: f
                                }), e.setPositions(e.start, e.end + (o ? -f.start : n), !0);
                            }
                    }(e, t, r);
                });
            }

            function ab() {
                Ra(), requestAnimationFrame(Ra), b && (Z.getAll().forEach(function (e) {
                    e._startNative = e.start, e._endNative = e.end;
                }), b.forEach(function (e) {
                    var t = e._startClamp || e.start,
                        r = e.autoSpeed ? Math.min(D(), e.end) : t + Math.abs((e.end - t) / e.ratio),
                        n = r - e.end;
                    if ((r -= n / 2) < (t -= n / 2)) {
                        var o = t;
                        t = r, r = o;
                    }
                    e._startClamp && t < 0 ? (n = (r = e.ratio < 0 ? D() : e.end / e.ratio) - e.end, t = 0) : (e.ratio < 0 || e._endClamp && r >= D()) && (n = ((r = D()) - (t = e.ratio < 0 || 1 < e.ratio ? 0 : r - (r - e.start) / e.ratio)) * e.ratio - (e.end - e.start)), e.offset = n || 1e-4, e.pins.length = e.pins.offset = 0, e.setPositions(t, r, !0);
                }), _a(Z.sort())), U.reset();
            }

            function bb() {
                return Z.addEventListener("refresh", ab);
            }

            function cb() {
                return b && b.forEach(function (e) {
                    return e.vars.onRefresh(e);
                });
            }

            function db() {
                return b && b.forEach(function (e) {
                    return e.vars.onRefreshInit(e);
                }), cb;
            }

            function eb(r, n, o, i) {
                return function () {
                    var e = "function" == typeof n ? n(o, i) : n;
                    e || 0 === e || (e = i.getAttribute("data-" + R + r) || ("speed" === r ? 1 : 0)), i.setAttribute("data-" + R + r, e);
                    var t = "clamp(" === (e + "").substr(0, 6);
                    return {
                        clamp: t,
                        value: t ? e.substr(6, e.length - 7) : e
                    };
                };
            }

            function fb(r, e, t, n, o) {
                function qc() {
                    e = u(), t = parseFloat(d().value), i = parseFloat(e.value) || 1, a = "auto" === e.value, c = a || s && s._startClamp && s.start <= 0 || p.offset ? 0 : s && s._endClamp && s.end === D() ? 1 : .5, l && l.kill(), l = t && B.to(r, {
                        ease: $,
                        overwrite: !1,
                        y: "+=0",
                        duration: t
                    }), s && (s.ratio = i, s.autoSpeed = a);
                }

                function rc() {
                    g.y = h + "px", g.renderTransform(1), qc();
                }

                function uc(e) {
                    if (a) {
                        rc();
                        var t = function _autoDistance(e, t) {
                            var r, n, o = e.parentNode || j,
                                i = e.getBoundingClientRect(),
                                s = o.getBoundingClientRect(),
                                a = s.top - i.top,
                                l = s.bottom - i.bottom,
                                c = (Math.abs(a) > Math.abs(l) ? a : l) / (1 - t),
                                f = -c * t;
                            return 0 < c && (n = .5 == (r = s.height / (L.innerHeight + s.height)) ? 2 * s.height : 2 * Math.min(s.height, Math.abs(-c * r / (2 * r - 1))) * (t || 1), f += t ? -n * t : -n / 2, c += n), {
                                change: c,
                                offset: f
                            };
                        }(r, Y(0, 1, -e.start / (e.end - e.start)));
                        v = t.change, f = t.offset;
                    } else f = p.offset || 0, v = (e.end - e.start - f) * (1 - i);
                    p.forEach(function (e) {
                        return v -= e.distance * (1 - i);
                    }), e.offset = v || .001, e.vars.onUpdate(e), l && l.progress(1);
                }
                o = ("function" == typeof o ? o(n, r) : o) || 0;
                var i, s, a, l, c, f, u = eb("speed", e, n, r),
                    d = eb("lag", t, n, r),
                    h = B.getProperty(r, "y"),
                    g = r._gsap,
                    p = [],
                    m = [],
                    v = 0;
                return qc(), (1 !== i || a || l) && (uc(s = Z.create({
                    trigger: a ? r.parentNode : r,
                    start: function start() {
                        return e.clamp ? "clamp(top bottom+=" + o + ")" : "top bottom+=" + o;
                    },
                    end: function end() {
                        return e.value < 0 ? "max" : e.clamp ? "clamp(bottom top-=" + o + ")" : "bottom top-=" + o;
                    },
                    scroller: w,
                    scrub: !0,
                    refreshPriority: -999,
                    onRefreshInit: rc,
                    onRefresh: uc,
                    onKill: function onKill(e) {
                        var t = b.indexOf(e);
                        0 <= t && b.splice(t, 1), rc();
                    },
                    onUpdate: function onUpdate(e) {
                        var t, r, n, o = h + v * (e.progress - c),
                            i = p.length,
                            s = 0;
                        if (e.offset) {
                            if (i) {
                                for (r = -H, n = e.end; i--;) {
                                    if ((t = p[ i ]).trig.isActive || r >= t.start && r <= t.end) return void (l && (t.trig.progress += t.trig.direction < 0 ? .001 : -.001, t.trig.update(0, 0, 1), l.resetTo("y", parseFloat(g.y), -M, !0), N && l.progress(1)));
                                    r > t.end && (s += t.distance), n -= t.distance;
                                }
                                o = h + s + v * ((B.utils.clamp(e.start, e.end, r) - e.start - s) / (n - e.start) - c);
                            }
                            m.length && !a && m.forEach(function (e) {
                                return e(o - s);
                            }), o = function _round(e) {
                                return Math.round(1e5 * e) / 1e5 || 0;
                            }(o + f), l ? (l.resetTo("y", o, -M, !0), N && l.progress(1)) : (g.y = o + "px", g.renderTransform(1));
                        }
                    }
                })), B.core.getCache(s.trigger).stRevert = db, s.startY = h, s.pins = p, s.markers = m, s.ratio = i, s.autoSpeed = a, r.style.willChange = "transform"), s;
            }
            var n, w, e, i, b, s, a, l, c, f, r, u, d, h, g, p, m = t.smoothTouch,
                v = t.onUpdate,
                S = t.onStop,
                T = t.smooth,
                _ = t.onFocusIn,
                C = t.normalizeScroll,
                x = t.wholePixels,
                P = this,
                R = t.effectsPrefix || "",
                E = Z.getScrollFunc(L),
                k = 1 === Z.isTouch ? !0 === m ? .8 : parseFloat(m) || 0 : 0 === T || !1 === T ? 0 : parseFloat(T) || .8,
                A = k && +t.speed || 1,
                H = 0,
                M = 0,
                N = 1,
                U = G(0),
                z = {
                    y: 0
                },
                O = "undefined" != typeof ResizeObserver && !1 !== t.autoResize && new ResizeObserver(function () {
                    if (!Z.isRefreshing) {
                        var e = D(w) * A;
                        e < -H && Va(e), X.restart(!0);
                    }
                });

            function refreshHeight() {
                return e = n.clientHeight, n.style.overflow = "visible", q.style.height = L.innerHeight + (e - L.innerHeight) / A + "px", e - L.innerHeight;
            }
            bb(), Z.addEventListener("killAll", bb), B.delayedCall(.5, function () {
                return N = 0;
            }), this.scrollTop = Va, this.scrollTo = function (e, t, r) {
                var n = B.utils.clamp(0, D(), isNaN(e) ? o.offset(e, r, !!t && !f) : +e);
                t ? f ? B.to(o, {
                    duration: k,
                    scrollTop: n,
                    overwrite: "auto",
                    ease: $
                }) : E(n) : Va(n);
            }, this.offset = function (e, t, r) {
                var n, o = (e = W(e)[ 0 ]).style.cssText,
                    i = Z.create({
                        trigger: e,
                        start: t || "top top"
                    });
                return b && (N ? Z.refresh() : _a([ i ], !0)), n = i.start / (r ? A : 1), i.kill(!1), e.style.cssText = o, B.core.getCache(e).uncache = 1, n;
            }, this.content = function (e) {
                if (arguments.length) {
                    var t = W(e || "#smooth-content")[ 0 ] || console.warn("ScrollSmoother needs a valid content element.") || q.children[ 0 ];
                    return t !== n && (c = (n = t).getAttribute("style") || "", O && O.observe(n), B.set(n, {
                        overflow: "visible",
                        width: "100%",
                        boxSizing: "border-box",
                        y: "+=0"
                    }), k || B.set(n, {
                        clearProps: "transform"
                    })), this;
                }
                return n;
            }, this.wrapper = function (e) {
                return arguments.length ? (w = W(e || "#smooth-wrapper")[ 0 ] || function _wrap(e) {
                    var t = I.querySelector(".ScrollSmoother-wrapper");
                    return t || ((t = I.createElement("div")).classList.add("ScrollSmoother-wrapper"), e.parentNode.insertBefore(t, e), t.appendChild(e)), t;
                }(n), l = w.getAttribute("style") || "", refreshHeight(), B.set(w, k ? {
                    overflow: "hidden",
                    position: "fixed",
                    height: "100%",
                    width: "100%",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                } : {
                    overflow: "visible",
                    position: "relative",
                    width: "100%",
                    height: "auto",
                    top: "auto",
                    bottom: "auto",
                    left: "auto",
                    right: "auto"
                }), this) : w;
            }, this.effects = function (e, t) {
                if (b = b || [], !e) return b.slice(0);
                (e = W(e)).forEach(function (e) {
                    for (var t = b.length; t--;) b[ t ].trigger === e && b[ t ].kill();
                });
                t = t || {};
                var r, n, o = t.speed,
                    i = t.lag,
                    s = t.effectsPadding,
                    a = [];
                for (r = 0; r < e.length; r++)(n = fb(e[ r ], o, i, r, s)) && a.push(n);
                return b.push.apply(b, a), !1 !== t.refresh && Z.refresh(), a;
            }, this.sections = function (e, t) {
                if (s = s || [], !e) return s.slice(0);
                var r = W(e).map(function (t) {
                    return Z.create({
                        trigger: t,
                        start: "top 120%",
                        end: "bottom -20%",
                        onToggle: function onToggle(e) {
                            t.style.opacity = e.isActive ? "1" : "0", t.style.pointerEvents = e.isActive ? "all" : "none";
                        }
                    });
                });
                return t && t.add ? s.push.apply(s, r) : s = r.slice(0), r;
            }, this.content(t.content), this.wrapper(t.wrapper), this.render = function (e) {
                return Ua(e || 0 === e ? e : H);
            }, this.getVelocity = function () {
                return U.getVelocity(-H);
            }, Z.scrollerProxy(w, {
                scrollTop: Va,
                scrollHeight: function scrollHeight() {
                    return refreshHeight() && q.scrollHeight;
                },
                fixedMarkers: !1 !== t.fixedMarkers && !!k,
                content: n,
                getBoundingClientRect: function getBoundingClientRect() {
                    return {
                        top: 0,
                        left: 0,
                        width: L.innerWidth,
                        height: L.innerHeight
                    };
                }
            }), Z.defaults({
                scroller: w
            });
            var V = Z.getAll().filter(function (e) {
                return e.scroller === L || e.scroller === w;
            });
            V.forEach(function (e) {
                return e.revert(!0, !0);
            }), i = Z.create({
                animation: B.fromTo(z, {
                    y: function y() {
                        return h = 0;
                    }
                }, {
                    y: function y() {
                        return h = 1, -refreshHeight();
                    },
                    immediateRender: !1,
                    ease: "none",
                    data: "ScrollSmoother",
                    duration: 100,
                    onUpdate: function onUpdate() {
                        if (h) {
                            var e = g;
                            e && (Ta(i), z.y = H), Ua(z.y, e), Pa(), v && !f && v(P);
                        }
                    }
                }),
                onRefreshInit: function onRefreshInit(e) {
                    if (!ScrollSmoother.isRefreshing) {
                        if (ScrollSmoother.isRefreshing = !0, b) {
                            var t = Z.getAll().filter(function (e) {
                                return !!e.pin;
                            });
                            b.forEach(function (r) {
                                r.vars.pinnedContainer || t.forEach(function (e) {
                                    if (e.pin.contains(r.trigger)) {
                                        var t = r.vars;
                                        t.pinnedContainer = e.pin, r.vars = null, r.init(t, r.animation);
                                    }
                                });
                            });
                        }
                        var r = e.getTween();
                        d = r && r._end > r._dp._time, u = H, z.y = 0, k && (1 === Z.isTouch && (w.style.position = "absolute"), w.scrollTop = 0, 1 === Z.isTouch && (w.style.position = "fixed"));
                    }
                },
                onRefresh: function onRefresh(e) {
                    e.animation.invalidate(), e.setPositions(e.start, refreshHeight() / A), d || Ta(e), z.y = -E() * A, Ua(z.y), N || (d && (g = !1), e.animation.progress(B.utils.clamp(0, 1, u / A / -e.end))), d && (e.progress -= .001, e.update()), ScrollSmoother.isRefreshing = !1;
                },
                id: "ScrollSmoother",
                scroller: L,
                invalidateOnRefresh: !0,
                start: 0,
                refreshPriority: -9999,
                end: function end() {
                    return refreshHeight() / A;
                },
                onScrubComplete: function onScrubComplete() {
                    U.reset(), S && S(o);
                },
                scrub: k || !0
            }), this.smooth = function (e) {
                return arguments.length && (A = (k = e || 0) && +t.speed || 1, i.scrubDuration(e)), i.getTween() ? i.getTween().duration() : 0;
            }, i.getTween() && (i.getTween().vars.ease = t.ease || $), this.scrollTrigger = i, t.effects && this.effects(!0 === t.effects ? "[data-" + R + "speed], [data-" + R + "lag]" : t.effects, {
                effectsPadding: t.effectsPadding,
                refresh: !1
            }), t.sections && this.sections(!0 === t.sections ? "[data-section]" : t.sections), V.forEach(function (e) {
                e.vars.scroller = w, e.revert(!1, !0), e.init(e.vars, e.animation);
            }), this.paused = function (e, t) {
                return arguments.length ? (!!f !== e && (e ? (i.getTween() && i.getTween().pause(), E(-H / A), U.reset(), (r = Z.normalizeScroll()) && r.disable(), (f = Z.observe({
                    preventDefault: !0,
                    type: "wheel,touch,scroll",
                    debounce: !1,
                    allowClicks: !0,
                    onChangeY: function onChangeY() {
                        return Va(-H);
                    }
                })).nested = J(j, "wheel,touch,scroll", !0, !1 !== t)) : (f.nested.kill(), f.kill(), f = 0, r && r.enable(), i.progress = (-H / A - i.start) / (i.end - i.start), Ta(i))), this) : !!f;
            }, this.kill = this.revert = function () {
                o.paused(!1), Ta(i), i.kill();
                for (var e = (b || []).concat(s || []), t = e.length; t--;) e[ t ].kill();
                Z.scrollerProxy(w), Z.removeEventListener("killAll", bb), Z.removeEventListener("refresh", ab), w.style.cssText = l, n.style.cssText = c;
                var r = Z.defaults({});
                r && r.scroller === w && Z.defaults({
                    scroller: L
                }), o.normalizer && Z.normalizeScroll(!1), clearInterval(a), K = null, O && O.disconnect(), q.style.removeProperty("height"), L.removeEventListener("focusin", Ya);
            }, this.refresh = function (e, t) {
                return i.refresh(e, t);
            }, C && (this.normalizer = Z.normalizeScroll(!0 === C ? {
                debounce: !0,
                content: !k && n
            } : C)), Z.config(t), "overscrollBehavior" in L.getComputedStyle(q) && B.set([ q, j ], {
                overscrollBehavior: "none"
            }), "scrollBehavior" in L.getComputedStyle(q) && B.set([ q, j ], {
                scrollBehavior: "auto"
            }), L.addEventListener("focusin", Ya), a = setInterval(Pa, 250), "loading" === I.readyState || requestAnimationFrame(function () {
                return Z.refresh();
            });
        }
        r.version = "3.12.5", r.create = function (e) {
            return K && e && K.content() === W(e.content)[ 0 ] ? K : new r(e);
        }, r.get = function () {
            return K;
        }, t() && B.registerPlugin(r), e.ScrollSmoother = r, e.default = r;
        if (typeof (window) === "undefined" || window !== e) {
            Object.defineProperty(e, "__esModule", {
                value: !0
            });
        } else {
            delete e.default;
        }
    });
};


const registerGsapPlugins = () => {
    registerDrawSvgPlugin();
    registerSplitText();
    registerScrollSmoothPlugin();

    gsap.registerPlugin(Flip);
    gsap.registerPlugin(CustomEase);
    gsap.registerPlugin(ScrollTrigger);
    gsap.registerPlugin(ScrollToPlugin);
};

export { registerGsapPlugins };
