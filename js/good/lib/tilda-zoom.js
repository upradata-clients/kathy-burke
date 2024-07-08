// @ts-nocheck


function t_initZoom(images = undefined) {
    var t;
    var e;
    var o;
    var r;
    var n;
    if (!document.querySelector(".t-zoomer__wrapper")) {
        window.tzoominited = true;
        window.tzoomopenonce = false;
        window.isDoubletapScaleAdded = false;
        t = images || document.querySelectorAll("[data-zoomable]");
        t = Array.prototype.slice.call(t).filter(function (t) {
            return t.getAttribute("data-zoomable") !== undefined && !t.classList.contains("t-slds__thumbs_gallery") && t.getAttribute("data-img-zoom-url") !== "";
        });
        Array.prototype.forEach.call(t, function (t) {
            t.classList.add("t-zoomable");
        });
        (t = document.createElement("div")).classList.add("t-zoomer__wrapper");
        (e = document.createElement("div")).classList.add("t-zoomer__container");
        (o = document.createElement("div")).classList.add("t-zoomer__bg");
        r = t_zoom__createCloseBtn();
        n = t_zoom__createScaleBtn();
        t.appendChild(e);
        t.appendChild(o);
        t.appendChild(r);
        t.appendChild(n);
        if (document.body) {
            document.body.insertAdjacentElement("beforeend", t);
        }
        t_zoom__initFullScreenImgOnClick();
        t_zoom__closeAndSlideCarousel();
    }
}
function t_zoom__createCloseBtn() {
    var t = document.createElement("div");
    t.classList.add("t-zoomer__close");
    t.style.display = "none";
    t.insertAdjacentHTML("beforeend", '<svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.41421 -0.000151038L0 1.41406L21.2132 22.6273L22.6274 21.2131L1.41421 -0.000151038Z" fill="black"/><path d="M22.6291 1.41421L21.2148 0L0.00164068 21.2132L1.41585 22.6274L22.6291 1.41421Z" fill="black"/></svg>');
    return t;
}
function t_zoom__createScaleBtn() {
    var t = document.createElement("div");
    t.classList.add("t-zoomer__scale");
    t.classList.add("showed");
    var e = "";
    e += '<svg class="icon-increase" width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">';
    t.insertAdjacentHTML("beforeend", '<svg class="icon-increase" width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.832 22L17.8592 17.0273" stroke="black" stroke-width="2" stroke-linecap="square"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.58591 3.7511C0.917768 7.41924 0.917768 13.367 4.58591 17.0352C8.25405 20.7033 14.2019 20.7033 17.87 17.0352C21.5381 13.367 21.5381 7.41924 17.87 3.7511C14.2019 0.0829653 8.25405 0.0829653 4.58591 3.7511Z" stroke="black" stroke-width="2"/><path d="M6.25781 10.3931H16.2035" stroke="black" stroke-width="2"/><path d="M11.2305 15.3662V5.42053" stroke="black" stroke-width="2"/></svg><svg class="icon-decrease" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.9961 22L17.0233 17.0273" stroke="black" stroke-width="2" stroke-linecap="square"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3.74997 3.7511C0.0818308 7.41924 0.0818308 13.367 3.74997 17.0352C7.41811 20.7033 13.3659 20.7033 17.0341 17.0352C20.7022 13.367 20.7022 7.41924 17.0341 3.7511C13.3659 0.0829653 7.41811 0.0829653 3.74997 3.7511Z" stroke="black" stroke-width="2"/><path d="M5.41797 10.3931H15.3637" stroke="black" stroke-width="2"/></svg>');
    return t;
}
function t_zoom__initFullScreenImgOnClick() {
    document.addEventListener("click", function (t) {
        t = t.target.closest('.t-zoomable:not([data-img-zoom-url=""]), .t-slds__thumbs_gallery-zoomable');
        if (t) {
            t_zoomHandler(t);
        }
    });
    var t = window.t_zoom__isMobile ? "orientationchange" : "resize";
    window.addEventListener(t, function () {
        if (document.body.classList.contains("t-zoomer__show")) {
            t_zoom_checkForScale();
        }
    });
}
function t_zoom__closeAndSlideCarousel() {
    var t = document.querySelector(".t-zoomer__close");
    if (t) {
        t.addEventListener("click", function () {
            t_zoom_close();
        });
        document.addEventListener("keydown", function (t) {
            if (document.body.classList.contains("t-zoomer__show")) {
                switch (t.keyCode) {
                    case 27:
                        t.preventDefault();
                        t_zoom_close();
                        break;
                    case 37:
                        t_zoom__setEventOnBtn("prev");
                        break;
                    case 39:
                        t_zoom__setEventOnBtn("next");
                }
            }
        });
    }
}
function t_zoomHandler(t) {
    var card = t.closest('[data-zoom-state]');

    if (card.dataset.zoomState === "off") {
        return;
    }
    document.body.classList.add("t-zoomer__show");
    if (document.querySelector(".t-popup_show")) {
        document.body.classList.add("t-zoomer__active");
    }
    var e = document.querySelector(".t-zoomer__container");
    var o = document.createElement("div");
    o.classList.add("t-carousel__zoomed");
    var r = document.createElement("div");
    r.classList.add("t-carousel__zoomer__slides");
    var n = document.createElement("div");
    n.classList.add("t-carousel__zoomer__inner");
    var i = document.createElement("div");
    i.classList.add("t-carousel__zoomer__track");
    n.appendChild(i);
    var i = t_zoom_createSliderArrow("left");
    var a = t_zoom_createSliderArrow("right");
    r.appendChild(i);
    r.appendChild(a);
    r.appendChild(n);
    o.appendChild(r);
    if (e) {
        e.innerHTML = "";
    }
    if (e) {
        e.appendChild(o);
    }
    var i = t.closest(".r");
    if (!document.querySelector(".t-carousel__zoomer__track") || !i) {
        return false;
    }
    t_zoom__addingImgsIntoCarousel(t);
    a = document.querySelector(".t-zoomer__close");
    if (a) {
        a.style.display = "flex";
    }
    t_zoom_setModalColor(i);
    t_zoom__createAndLoopSlider(t);
    t_zoom__getEventOnBtn();
    t_zoom_lockScroll();
    document.querySelector(".t-zoomer__wrapper").classList.add("t-zoomer__show_fixed");
    t_zoom__initSingleZoom();
    t_zoom_checkForScale();
    if (window.t_zoom__isMobile) {
        t_zoom_initSwipe();
        t_zoom_initCloseSwipe();
        window.addEventListener("orientationchange", t_zoom__updateActiveSlidePos);
    } else {
        window.addEventListener("resize", t_zoom__updateActiveSlidePos);
    }
    window.tzoomopenonce = true;
    t_zoom__initEventsonMobile();
}
function t_zoom__updateActiveSlidePos() {
    setTimeout(function () {
        var t;
        var e = document.querySelector(".t-carousel__zoomer__track");
        if (e) {
            t = e.querySelector(".t-carousel__zoomer__item.active").offsetLeft;
            e.style.transform = "translateX(" + -t + "px)";
        }
    }, 300);
}
function t_zoom_createSliderArrow(t) {
    var e = document.createElement("div");
    e.classList.add("t-carousel__zoomer__control");
    e.classList.add("t-carousel__zoomer__control_" + t);
    e.setAttribute("data-zoomer-slide", t === "left" ? "prev" : "next");
    var o = document.createElement("div");
    o.classList.add("t-carousel__zoomer__arrow__wrapper");
    o.classList.add("t-carousel__zoomer__arrow__wrapper_" + t);
    var r = document.createElement("div");
    r.classList.add("t-carousel__zoomer__arrow");
    r.classList.add("t-carousel__zoomer__arrow_" + t);
    r.classList.add("t-carousel__zoomer__arrow_small");
    o.appendChild(r);
    e.appendChild(o);
    return e;
}
function t_zoom_initSwipe() {
    var t;
    var n;
    var a;
    var l = document.querySelectorAll(".t-carousel__zoomer__item");
    var c = document.querySelector(".t-zoomer__wrapper");
    if (1 < l.length) {
        t = new Hammer(c, { domEvents: true, inputClass: Hammer.TouchInput, cssProps: { touchCollout: "default" }, recognizers: [ [ Hammer.Pan, { direction: Hammer.DIRECTION_HORIZONTAL } ] ] });
        n = null;
        a = false;
        if (!window.tzoomopenonce) {
            t.on("panstart", function () {
                var t = document.querySelector(".t-carousel__zoomer__track");
                if (t.getAttribute("data-on-transition") === "y") {
                    n = null;
                } else if (t) {
                    n = t.getBoundingClientRect().left;
                    t.style.transition = "none";
                }
                a = t_zoom__isScaled(c);
            });
            t.on("panmove", function (t) {
                var e = document.querySelector(".t-carousel__zoomer__track");
                var o = e.getAttribute("data-on-transition");
                var r = c.getAttribute("data-on-drag");
                if (o !== "y" && r !== "y" && t.maxPointers === 1 && !a) {
                    if (40 < Math.abs(t.deltaX)) {
                        e.setAttribute("data-on-drag", "y");
                    }
                    if (n) {
                        o = n + t.deltaX;
                        e.style.transform = "translateX(" + o + "px)";
                    }
                }
            });
            t.on("panend", function (t) {
                var e;
                var o;
                var r = document.querySelector(".t-carousel__zoomer__track");
                r.setAttribute("data-on-drag", "");
                var n = r.getAttribute("data-on-transition");
                var i = c.getAttribute("data-on-drag");
                if (n !== "y" && i !== "y" && t.maxPointers === 1 && !a) {
                    r.style.transition = "";
                    n = Math.abs(t.velocityX);
                    i = r.offsetLeft;
                    o = l[ 0 ].offsetWidth;
                    e = r.querySelector(".t-carousel__zoomer__item.active").offsetLeft;
                    if (.6 < (o = (o - Math.abs(i + e)) / n / 1e3)) {
                        o = .6;
                    } else if (o < .2) {
                        o = .2;
                    }
                    r.style.transitionDuration = o + "s";
                    if (t.velocityX < -.5 || t.deltaX < -80) {
                        t_zoom_unscale();
                        t_zoom_showSlide("next");
                        t_zoom_checkForScale();
                    } else if (.5 < t.velocityX || 80 < t.deltaX) {
                        t_zoom_unscale();
                        t_zoom_showSlide("prev");
                        t_zoom_checkForScale();
                    } else {
                        t_zoom_showSlide();
                    }
                }
            });
        }
    }
}
function t_zoom__initEventsonMobile() {
    var e;
    if (window.t_zoom__isMobile) {
        t_zoom_setHideControlsTimer();
        e = document.querySelector(".t-zoomer__wrapper");
        [ "touchstart", "touchmove", "touchend", "mousemove" ].forEach(function (t) {
            e.addEventListener(t, t_zoom_setHideControlsTimer);
        });
        window.addEventListener("orientationchange", t_zoom__updateSlidesHeight);
    }
}
function t_zoom__updateSlidesHeight() {
    var o;
    var r = document.querySelectorAll(".t-carousel__zoomer__item .t-carousel__zoomer__img");
    var n = document.querySelector(".t-zoomer__wrapper");
    if (n && r.length) {
        o = n.getAttribute("data-max-comment-height");
        o = parseInt(o, 10);
        if (!isNaN(o)) {
            setTimeout(function () {
                var e;
                var t = document.querySelector(".t-carousel__zoomer__item.active");
                if (t) {
                    t = n.offsetHeight - t.offsetHeight;
                    e = document.documentElement.clientHeight - (t + o);
                    Array.prototype.forEach.call(r, function (t) {
                        t.style.maxHeight = e + "px";
                    });
                }
            }, 300);
        }
    }
}
function t_zoom__initSingleZoom() {
    var t;
    if (document.querySelectorAll(".t-carousel__zoomer__item").length === 1) {
        t = document.querySelectorAll(".t-carousel__zoomer__control");
        Array.prototype.forEach.call(t, function (t) {
            t.style.display = "none";
        });
    }
}
function t_zoom__getEventOnBtn() {
    [ { name: "right", direction: "next" }, { name: "left", direction: "prev" } ].forEach(function (t) {
        document.querySelector(".t-carousel__zoomer__control_" + t.name).addEventListener("click", function () {
            t_zoom__setEventOnBtn(t.direction);
        });
    });
}
function t_zoom__setEventOnBtn(t) {
    var e = document.querySelector(".t-carousel__zoomer__track");
    var o = document.querySelector(".t-zoomer__wrapper");
    var e = e.getAttribute("data-on-transition");
    var o = o.getAttribute("data-on-drag");
    if (e !== "y" && o !== "y") {
        t_zoom_unscale();
        setTimeout(function () {
            t_zoom_showSlide(t);
            t_zoom_checkForScale();
        });
    }
}
function t_zoom__addingImgsIntoCarousel(t) {
    var e = t.closest(".slide-img-zoom-wrapper");
    var s = e ? e.querySelectorAll(".t-zoomable:not(.t-slds__thumbs_gallery):not(.tn-atom__slds-img)") : [];
    if (e ? e.querySelector(".t-slds") : null) {
        if (t = t.closest(".t-slds")) {
            s = t.querySelectorAll(".t-zoomable:not(.t-slds__thumbs_gallery)");
        }
        if (t && t.querySelector(".tn-elem__gallery__video-wrapper")) {
            (s = Array.prototype.slice.call(s)).splice(-1, 1);
        }
    }
    var _ = t_zoom__getZoomDescriptionFontFamily(e);
    var d = document.querySelector(".t-carousel__zoomer__track");
    var m = window.lazy === "y";
    Array.prototype.forEach.call(s, function (t, e) {
        var o;
        var r;
        var n = t.getAttribute("data-img-zoom-url");
        var i = "";
        var a = "";
        var n = n ? n.split(",") : "";
        if (t.nodeName === "IMG" || t.nodeName === "DIV") {
            i = t.getAttribute("title") || "";
            a = t.getAttribute("data-img-zoom-descr") || "";
        }
        if (i) {
            (o = document.createElement("div")).classList.add("t-zoomer__title");
            o.classList.add("t-descr");
            o.classList.add("t-descr_xxs");
            o.textContent = i;
            if (_ && _.titleFontFamily) {
                o.style.fontFamily = _.titleFontFamily;
            }
        }
        if (a) {
            (r = document.createElement("div")).classList.add("t-zoomer__descr");
            r.classList.add("t-descr");
            r.classList.add("t-descr_xxs");
            r.textContent = a;
            if (_ && _.descrFontFamily) {
                r.style.fontFamily = _.descrFontFamily;
            }
        }
        var t = document.createElement("div");
        t.classList.add("t-carousel__zoomer__item");
        var l = document.createElement("div");
        l.classList.add("t-carousel__zoomer__wrapper");
        var c = document.createElement("img");
        c.classList.add("t-carousel__zoomer__img");
        if (m) {
            c.classList.add("t-img");
            c.setAttribute("data-original", n);
            if (e === 0 || e === s.length - 1) {
                c.setAttribute("data-lazy-rule", "skip");
            }
        } else {
            c.src = n;
        }
        t.appendChild(l);
        l.appendChild(c);
        if (i || a || window.t_zoom__isMobile) {
            (e = document.createElement("div")).classList.add("t-zoomer__comments");
            if (i) {
                e.appendChild(o);
            }
            if (a) {
                e.appendChild(r);
            }
            t.appendChild(e);
        }
        d.appendChild(t);
    });
}
function t_zoom__getZoomDescriptionFontFamily(t) {
    var e = t.querySelector('.t827__overlay-title, .t979__overlay-title, .t-slds__title, .t603__title, [itemprop="name"]');
    var t = t.querySelector('.t827__overlay-descr, .t979__overlay-descr, .t-slds__descr, .t603__descr, [itemprop="description"]');
    return { titleFontFamily: e && getComputedStyle(e).fontFamily || "", descrFontFamily: t && getComputedStyle(t).fontFamily || "" };
}
function t_zoom__createAndLoopSlider(t) {
    var i;
    var a;
    var l;
    var e = document.querySelector(".t-carousel__zoomer__track");
    var o = document.querySelector(".t-zoomer__wrapper");
    var r = document.querySelectorAll(".t-carousel__zoomer__item");
    if (o && r.length) {
        i = o.offsetHeight - r[ 0 ].offsetHeight;
        if (window.t_zoom__isMobile) {
            a = Array.prototype.reduce.call(r, function (t, e) {
                e = e.querySelector(".t-zoomer__comments");
                e = e ? e.offsetHeight : 0;
                return t = t < e ? e : t;
            }, 0);
            o.setAttribute("data-max-comment-height", a);
        }
        l = window.lazy === "y";
        Array.prototype.forEach.call(r, function (t) {
            var e = t.querySelector(".t-carousel__zoomer__img");
            var o = e.getAttribute(l ? "data-original" : "src");
            var t = t.querySelector(".t-zoomer__comments");
            var r = t ? t.offsetHeight : 0;
            if (window.t_zoom__isMobile) {
                r = a;
            }
            var n = i + r;
            if (t) {
                t.style.height = r + "px";
            }
            e.style.maxHeight = document.documentElement.clientHeight - n + "px";
            if (o && o.indexOf(".svg") !== -1) {
                e.style.width = window.innerWidth + "px";
            }
            var t = document.querySelectorAll(".t-carousel__zoomer__arrow__wrapper");
            Array.prototype.forEach.call(t, function (t) {
                t.style.top = r ? "calc(50% - " + r / 2 + "px)" : "50%";
            });
        });
        Array.prototype.forEach.call(r, function (t, e) {
            t.setAttribute("data-zoomer-slide-number", e);
        });
        if (1 < r.length) {
            t_zoom_loopSlider();
        }
        if (t = (r = (o = t.getAttribute("data-img-zoom-url")) ? document.querySelector(".t-carousel__zoomer__img[" + (l ? "data-original" : "src") + '="' + o + '"]') : null) ? r.closest(".t-carousel__zoomer__item") : null) {
            o = !!t && t.offsetLeft;
            t.classList.add("active");
            t_zoom__hideInnactiveSlides(t, e);
            e.style.transition = "none";
            e.style.transform = "translateX(" + -o + "px)";
            setTimeout(function () {
                e.style.transition = "";
            }, 200);
        }
        if (l) {
            t_onFuncLoad("t_lazyload_update", t_lazyload_update);
        }
    }
}
function t_zoom__hideInnactiveSlides(t, e) {
    var o;
    if (!!t && !((e = Array.prototype.slice.call(e.querySelectorAll(".t-carousel__zoomer__item:not(:first-child):not(:last-child)"))).length <= 6)) {
        t = t_zoom__getCurrentSlideIndex(t);
        (o = [ t ]).push(t === 0 ? e.length : t - 1);
        o.push(t === e.length ? 0 : t + 1);
        e.forEach(function (t) {
            var e = t_zoom__getCurrentSlideIndex(t);
            var e = o.indexOf(e) !== -1 ? "remove" : "add";
            t.classList[ e ]("t-carousel__zoomer__item-innactive");
        });
    }
}
function t_zoom__getCurrentSlideIndex(t) {
    return t && parseInt(t.getAttribute("data-zoomer-slide-number"), 10) || 0;
}
function t_zoom_showSlide(t) {
    var e = document.querySelector(".t-carousel__zoomer__track");
    var o = e.querySelectorAll(".t-carousel__zoomer__item");
    var r = e.querySelector(".t-carousel__zoomer__item.active");
    var n = 0;
    var i = e.getAttribute("data-cached-zoom") === "y";
    Array.prototype.forEach.call(o, function (t, e) {
        if (t === r) {
            n = e;
        }
    });
    if (t === "next" || t === "prev") {
        n = (t === "next" ? n + 1 : o.length + (n - 1)) % o.length;
        e.setAttribute("data-on-transition", "y");
        if (window.t_zoom__isMobile && getComputedStyle(e).transitionDuration === "0s" && !i) {
            e.style.transition = "";
        }
    }
    var t = o[ n ].offsetLeft;
    r.classList.remove("active");
    o[ n ].classList.add("active");
    e.style.transform = "translateX(" + -t + "px)";
    t_zoom__hideInnactiveSlides(o[ n ], e);
    if (i) {
        e.removeAttribute("data-cached-zoom");
        t = new Event("transitionend");
        e.dispatchEvent(t);
    }
    if (window.lazy === "y") {
        t_onFuncLoad("t_lazyload_update", t_lazyload_update);
        if ((i = o[ n ].querySelector("img")) && !i.src) {
            setTimeout(function () {
                t_onFuncLoad("t_lazyload_update", t_lazyload_update);
            }, 200);
        }
    }
}
function t_zoom_transitForLoop(t) {
    var o;
    var e = document.querySelector(".t-carousel__zoomer__track");
    var r = document.querySelectorAll(".t-carousel__zoomer__item");
    if (!t) {
        return 1;
    }
    if (t === "start") {
        o = r.length - 2;
    }
    t = r[ o = t === "end" ? 1 : o ].offsetLeft;
    Array.prototype.forEach.call(r, function (t, e) {
        if (e === o) {
            t.classList.add("active");
        } else {
            t.classList.remove("active");
        }
    });
    e.style.transition = "none";
    e.style.transform = "translateX(" + -t + "px)";
    setTimeout(function () {
        e.style.transition = "";
        if (window.lazy === "y") {
            t_onFuncLoad("t_lazyload_update", t_lazyload_update);
        }
    });
}
function t_zoom_loopSlider() {
    var e = document.querySelector(".t-carousel__zoomer__track");
    var r = e.querySelectorAll(".t-carousel__zoomer__item");
    var t = r[ 0 ].cloneNode(true);
    var o = r[ r.length - 1 ].cloneNode(true);
    t.classList.remove("active");
    o.classList.remove("active");
    t_zoom__updateClonedImgSrc(r[ 0 ], r[ r.length - 1 ], t, o);
    e.insertBefore(o, e.firstChild);
    e.appendChild(t);
    var n = (r = e.querySelectorAll(".t-carousel__zoomer__item")).length;
    [ "transitionend", "webkitTransitionEnd", "oTransitionEnd" ].forEach(function (t) {
        e.addEventListener(t, function () {
            var o = 0;
            Array.prototype.forEach.call(r, function (t, e) {
                if (t.classList.contains("active")) {
                    o = e;
                }
            });
            if (o === 0) {
                t_zoom_transitForLoop("start");
            }
            if (o === n - 1) {
                t_zoom_transitForLoop("end");
            }
            e.setAttribute("data-on-transition", "");
        });
    });
}
function t_zoom__updateClonedImgSrc(t, e, o, r) {
    var n;
    var i;
    var a;
    var l;
    var c;
    if (window.lazy === "y") {
        n = t.querySelector("img");
        i = e.querySelector("img");
        a = o.querySelector("img");
        l = r.querySelector("img");
        if (!(t = [ n, i, a, l ]).some(function (t) {
            return !t;
        })) {
            if ("MutationObserver" in window) {
                c = new MutationObserver(function (t) {
                    t.forEach(function (t) {
                        var e;
                        if (t.type === "attributes" && t.attributeName === "src") {
                            if (t.target === n) {
                                e = a;
                            }
                            if (t.target === i) {
                                e = l;
                            }
                            if (t.target === a) {
                                e = n;
                            }
                            if (t.target === l) {
                                e = i;
                            }
                            if (t.target.src && !e.src) {
                                e.src = t.target.src;
                            }
                        }
                    });
                });
                t.forEach(function (t) {
                    c.observe(t, { attributes: true });
                });
            }
        }
    }
}
function t_zoom_initCloseSwipe() {
    var o;
    var r = document.querySelector(".t-zoomer__wrapper");
    var n = document.querySelector(".t-carousel__zoomer__track");
    var i = false;
    var t = new Hammer(r, { domEvents: true, inputClass: Hammer.TouchInput, cssProps: { touchCollout: "default" }, recognizers: [ [ Hammer.Pan, { direction: Hammer.DIRECTION_VERTICAL } ] ] });
    t.on("panstart", function () {
        o = r.offsetTop;
        r.style.position = "none";
        i = t_zoom__isScaled(r);
    });
    t.on("panmove", function (t) {
        var e = Math.abs(t.deltaY);
        if ((n.getAttribute("data-on-drag") !== "y" || r.getAttribute("data-on-drag") === "y") && (!!(-120 < t.angle) && !!(t.angle < -60) || !!(t.angle < 120) && !!(60 < t.angle)) && t.maxPointers === 1 && !i) {
            if (40 < e) {
                r.setAttribute("data-on-drag", "y");
            }
            e = o + t.deltaY;
            r.style.transform = "translateY(" + e + "px)";
        }
    });
    t.on("panend", t_zoom_closeSwipeHandler);
}
function t_zoom_closeSwipeHandler(t) {
    var e = document.querySelector(".t-zoomer__wrapper");
    var o = t_zoom__isScaled(e);
    e.style.transition = "transform 300ms ease-out";
    if (Math.abs(t.deltaY) < 40) {
        e.style.transform = "";
    }
    if (e.getAttribute("data-on-drag") === "y" && t.maxPointers === 1 && !o) {
        if (t.deltaY < -200 || t.velocityY < -.3) {
            e.style.transform = "translateY(-100vh)";
            setTimeout(function () {
                t_zoom_close();
                e.style.transform = "";
            }, 300);
        } else if (200 < t.deltaY || .3 < t.velocityY) {
            e.style.transform = "translateY(100vh)";
            setTimeout(function () {
                t_zoom_close();
                e.style.transform = "";
            }, 300);
        } else {
            e.style.transform = "";
        }
    }
    e.setAttribute("data-on-drag", "");
}
function t_zoom_checkForScale() {
    var t;
    var e = document.querySelector(".t-carousel__zoomer__item.active .t-carousel__zoomer__img:not(.loaded)");
    if (e) {
        t = !!(t = document.getElementById("allrecords")) && t.getAttribute("data-tilda-lazy") === "yes";
        if (window.lazy === "y" || t) {
            t = Date.now();
            t_zoom__waitImgForScale(e, t, function () {
                t_zoom_checkToScaleInit(e);
            });
        } else if (e.complete) {
            t_zoom_checkToScaleInit(e);
        } else {
            e.onload = function () {
                t_zoom_checkToScaleInit(e);
            };
        }
    }
}
function t_zoom__waitImgForScale(t, e, o) {
    if (t.src && t.naturalWidth && t.naturalHeight) {
        o();
    } else if (Date.now() - e < 3e3) {
        setTimeout(function () {
            t_zoom__waitImgForScale(t, e, o);
        }, 500);
    } else {
        console.warn("zoomed image isn't complete, natural width: " + t.naturalWidth + ", natural height: " + t.naturalHeight);
        o();
    }
}
function t_zoom_checkToScaleInit(t) {
    var e = window.innerWidth;
    var o = window.innerHeight;
    var r = document.querySelector(".t-zoomer__wrapper");
    r.classList.remove("zoomer-no-scale");
    var n = t.hasAttribute("data-original-svg-height") || t.hasAttribute("data-original-svg-width");
    var i = parseInt(t.getAttribute("data-original-svg-height"), 10) || t.naturalHeight;
    var a = parseInt(t.getAttribute("data-original-svg-width"), 10) || t.naturalWidth;
    if (t.src.indexOf(".svg") === -1 || window.isIE || n) {
        if (o < i || e < a) {
            if (!window.isDoubletapScaleAdded && window.t_zoom__isMobile) {
                t_zoom_doubletapScaleInit();
            }
            t_zoom_scale_init();
        } else {
            document.querySelector(".t-zoomer__scale").style.display = "";
            r.classList.add("zoomer-no-scale");
        }
    } else {
        t_zoom_fetchSVG(t, o, e);
    }
}
function t_zoom_fetchSVG(n, i, a) {
    var t = n.src;
    fetch(t).then(function (t) {
        return t.text();
    }).then(function (t) {
        var e = document.createElement("div");
        document.body.insertAdjacentElement("beforeend", e);
        e.innerHTML = t;
        var t = e.querySelector("svg");
        var o = Math.round(t.getBBox().width);
        var t = Math.round(t.getBBox().height);
        var r = o / t;
        if (5e3 < o) {
            o = 5e3;
            t = Math.round(o / r);
        }
        n.setAttribute("data-original-svg-width", o);
        n.setAttribute("data-original-svg-height", t);
        n.style.width = o + "px";
        n.style.height = t + "px";
        if (i < t || a < o) {
            if (!window.isDoubletapScaleAdded && window.t_zoom__isMobile) {
                t_zoom_doubletapScaleInit();
            }
            t_zoom_scale_init();
        } else {
            document.querySelector(".t-zoomer__scale").style.display = "";
        }
        document.body.removeChild(e);
    });
}
function t_zoom_scale_init() {
    var i = document.querySelector(".t-zoomer__wrapper");
    var t = document.querySelector(".t-zoomer__scale");
    t.style.display = "block";
    if (t.getAttribute("data-zoom-scale-init") !== "y") {
        t.setAttribute("data-zoom-scale-init", "y");
        i.addEventListener("click", function (t) {
            return;
            var e = document.querySelector(".t-carousel__zoomer__item.active .t-carousel__zoomer__img");
            var o = document.querySelector(".t-carousel__zoomer__track");
            var r = document.querySelector(".t-carousel__zoomer__inner");
            var n = !i.classList.contains("zoomer-no-scale");
            if (window.t_zoom__isMobile && t.target.closest(".t-zoomer__scale") && n || !window.t_zoom__isMobile && n && !t.target.closest(".t-zoomer__close, .t-carousel__zoomer__control")) {
                o.setAttribute("data-on-transition", "");
                o.style.transition = "none";
                o.style.transform = "none";
                e.style.maxHeight = "";
                if (i.classList.contains("scale-active")) {
                    t_zoom_unscale();
                } else {
                    i.classList.add("scale-active");
                    r.classList.add("scale-active");
                    if (window.t_zoom__isMobile) {
                        t_zoom_mobileZoomPositioningInit(e);
                    } else {
                        t_zoom_desktopZoomPositioningInit(e, t);
                    }
                }
            }
        }, false);
    }
}
function t_zoom_doubletapScaleInit() {
    window.isDoubletapScaleAdded = true;
    var r = document.querySelector(".t-zoomer__wrapper");
    new Hammer(r, { domEvents: true, inputClass: Hammer.TouchInput, cssProps: { touchCollout: "default" }, recognizers: [ [ Hammer.Tap ] ] }).on("tap", function (t) {
        return;
        var e;
        var o;
        if (t.tapCount === 2 && document.body.classList.contains("t-zoomer__show") && !t.target.closest(".t-carousel__zoomer__control")) {
            t = document.querySelector(".t-carousel__zoomer__item.active .t-carousel__zoomer__img");
            e = document.querySelector(".t-carousel__zoomer__inner");
            o = document.querySelector(".t-carousel__zoomer__track");
            t.style.maxHeight = "";
            o.style.transition = "none";
            o.style.transform = "none";
            if (r.classList.contains("scale-active")) {
                t_zoom_unscale();
            } else {
                r.classList.add("scale-active");
                e.classList.add("scale-active");
                t_zoom_mobileZoomPositioningInit(t);
            }
        }
    });
}
function t_zoom_desktopZoomPositioningInit(e, t) {
    function _(t, e) {
        n = 100 * (t.touches !== void 0 ? t.touches[ 0 ] : t).clientX / window.innerWidth;
        i = -(n * (e.offsetWidth - window.innerWidth)) / 100;
        e.style.left = i + "px";
    }
    function d(t, e) {
        o = 100 * (t.touches !== void 0 ? t.touches[ 0 ] : t).clientY / window.innerHeight;
        r = -(o * (e.offsetHeight - window.innerHeight)) / 100;
        e.style.top = r + "px";
    }
    var o;
    var r;
    var n;
    var i;
    var a = (window.innerWidth - e.offsetWidth) / 2;
    var l = (window.innerHeight - e.offsetHeight) / 2;
    var c = e.getAttribute("data-original-svg-width") || e.naturalWidth;
    var s = e.getAttribute("data-original-svg-height") || e.naturalHeight;
    e.style.left = a + "px";
    e.style.top = l + "px";
    if (window.innerWidth < c && window.innerHeight < s) {
        n = 100 * t.clientX / window.innerWidth;
        i = -(n * (c - window.innerWidth)) / 100;
        o = 100 * t.clientY / window.innerHeight;
        r = -(o * (s - window.innerHeight)) / 100;
        e.style.left = i + "px";
        e.style.top = r + "px";
        if (window.t_zoom__isMobile) {
            e.ontouchmove = function (t) {
                _(t, e);
                d(t, e);
            };
        } else {
            e.onmousemove = function (t) {
                _(t, e);
                d(t, e);
            };
        }
    } else if (window.innerWidth < c) {
        n = 100 * t.clientX / window.innerWidth;
        i = -(n * (c - window.innerWidth)) / 100;
        e.style.left = i + "px";
        if (window.t_zoom__isMobile) {
            e.ontouchmove = function (t) {
                _(t, e);
            };
        } else {
            e.onmousemove = function (t) {
                _(t, e);
            };
        }
    } else if (window.innerHeight < s) {
        o = 100 * t.clientY / window.innerHeight;
        r = -(o * (s - window.innerHeight)) / 100;
        e.style.top = r + "px";
        if (window.t_zoom__isMobile) {
            e.ontouchmove = function (t) {
                d(t, e);
            };
        } else {
            e.onmousemove = function (t) {
                d(t, e);
            };
        }
    }
}
function t_zoom_mobileZoomPositioningInit(o) {
    var r = (window.innerWidth - o.offsetWidth) / 2;
    var n = (window.innerHeight - o.offsetHeight) / 2;
    o.style.left = r + "px";
    o.style.top = n + "px";
    var i = { x: 0, y: 0 };
    var a = {};
    var l = {};
    o.ontouchstart = function (t) {
        a = t_zoom_getTouchEventXY(t);
    };
    o.ontouchmove = function (t) {
        var t = t_zoom_getTouchEventXY(t);
        var e = 1.5 * (t.x - a.x);
        var t = 1.5 * (t.y - a.y);
        l.x = i.x + e;
        l.y = i.y + t;
        if (l.x > -r) {
            l.x = -r;
        }
        if (l.x < r) {
            l.x = r;
        }
        if (l.y > -n) {
            l.y = -n;
        }
        if (l.y < n) {
            l.y = n;
        }
        if (o.offsetHeight < window.innerHeight) {
            l.y = 0;
        }
        o.style.transform = "translate(" + l.x + "px, " + l.y + "px)";
    };
    o.ontouchend = function () {
        i.x = l.x;
        i.y = l.y;
    };
    o.ontouchcancel = function () {
        i.x = l.x;
        i.y = l.y;
    };
}
function t_zoom_getTouchEventXY(t) {
    var e = { x: 0, y: 0 };
    if (t.type === "touchstart" || t.type === "touchmove" || t.type === "touchend" || t.type === "touchcancel") {
        t = t.touches[ 0 ] || t.changedTouches[ 0 ];
        e.x = t.pageX;
        e.y = t.pageY;
    }
    return e;
}
function t_zoom_close() {
    t_zoom_unscale();
    document.body.classList.remove("t-zoomer__show");
    document.querySelector(".t-zoomer__wrapper").classList.remove("t-zoomer__show_fixed");
    var t = document.querySelector(".t-zoomer__container");
    if (t) {
        t.innerHTML = "";
    }
    setTimeout(function () {
        document.body.classList.remove("t-zoomer__active");
    }, 200);
    t_zoom_unlockScroll();
    if (window.t_zoom__isMobile) {
        window.removeEventListener("orientationchange", t_zoom__updateSlidesHeight);
        window.removeEventListener("orientationchange", t_zoom__updateActiveSlidePos);
    } else {
        window.removeEventListener("resize", t_zoom__updateActiveSlidePos);
    }
}
function t_zoom_unscale() {
    var t;
    var e;
    var o;
    var r = document.querySelectorAll(".t-zoomer__wrapper.scale-active, .t-carousel__zoomer__inner.scale-active");
    Array.prototype.forEach.call(r, function (t) {
        t.classList.remove("scale-active");
    });
    var n = document.querySelector(".t-carousel__zoomer__item.active");
    var i = document.querySelector(".t-carousel__zoomer__track");
    var a = document.querySelector(".t-zoomer__wrapper");
    if (n) {
        t = n.querySelector(".t-carousel__zoomer__img");
        e = n.querySelector(".t-zoomer__comments");
        if (a) {
            o = a.offsetHeight - n.offsetHeight;
            e = e ? e.offsetHeight : 0;
            o = o + (e = window.t_zoom__isMobile ? a.getAttribute("data-max-comment-height") || e : e);
            t.onmousemove = null;
            t.ontouchmove = null;
            t.style.transform = "";
            t.style.left = "";
            t.style.top = "";
            t.style.maxHeight = document.documentElement.clientHeight - o + "px";
        }
    }
    if (n.offsetLeft !== void 0 && n.offsetTop !== void 0) {
        a = n.offsetLeft;
        i.style.transform = "translateX(" + -a + "px)";
    }
    if (r.length) {
        i.setAttribute("data-cached-zoom", "y");
    }
    setTimeout(function () {
        i.style.transition = "";
    }, 100);
}
function t_zoom_lockScroll() {
    var t = /(android)/i.test(navigator.userAgent);
    const a = window.t_zoom__isiOS && window.t_zoom__iOSMajorVersion === 11 && !window.MSStream || t;
    const b = !document.body.classList.contains("t-body_scroll-locked");
    if (a && b) {
        t = window.pageYOffset;
        document.body.classList.add("t-body_scroll-locked");
        document.body.style.top = "-" + t + "px";
        document.body.setAttribute("data-popup-scrolltop", t.toString());
    }
}
function t_zoom_unlockScroll() {
    var t = /(android)/i.test(navigator.userAgent);
    const a = window.t_zoom__isiOS && window.t_zoom__iOSMajorVersion === 11 && !window.MSStream || t;
    const b = !document.body.classList.contains("t-body_scroll-locked");
    if (a && b) {
        t = document.body.getAttribute("data-popup-scrolltop");
        document.body.classList.remove("t-body_scroll-locked");
        document.body.style.top = "";
        document.body.removeAttribute("data-popup-scrolltop");
        window.scrollTo({ top: Number(t), behavior: "instant" });
    }
}
function t_zoom_setModalColor(t) {
    var e;
    var o;
    var r = "#ffffff";
    var n = "#000000";
    var i = t.getAttribute("data-bg-color");
    var i = ((i = i || r).indexOf("-gradient(") !== -1 ? t_zoom_getFirstColorFromGradient : t_zoom_hexToRgb)(i);
    if (document.getElementById("allrecords") !== document.querySelector(".t-store__product-snippet") && document.getElementById("allrecords").contains(document.querySelector(".t-store__product-snippet")) && t) {
        i = t.style.backgroundColor;
    }
    var t = document.querySelector(".t-zoomer__container");
    var a = document.querySelectorAll(".t-zoomer__wrapper svg");
    var l = document.querySelectorAll(".t-zoomer__close, .t-zoomer__scale");
    var c = t.querySelectorAll(".t-carousel__zoomer__arrow__wrapper");
    var s = document.querySelectorAll(".t-zoomer__title, .t-zoomer__descr");
    var i = t_zoom_luma_rgb(i) === "black" ? n : r;
    if (i == n) {
        e = r;
        o = "rgba(1, 1, 1, 0.3)";
        Array.prototype.forEach.call(c, function (t) {
            t.classList.add("t-carousel__zoomer__arrow__wrapper_dark");
        });
    } else {
        e = n;
        o = "rgba(255, 255, 255, 0.3)";
        Array.prototype.forEach.call(c, function (t) {
            t.classList.remove("t-carousel__zoomer__arrow__wrapper_dark");
        });
    }
    Array.prototype.forEach.call(l, function (t) {
        t.style.background = o;
    });
    t.style.backgroundColor = i;
    t.style.color = e;
    Array.prototype.forEach.call(a, function (t) {
        if (t.getAttribute("fill") === "none") {
            t.setAttribute("fill", "none");
        } else {
            t.setAttribute("fill", e);
        }
        t = t.querySelectorAll("path");
        if (0 < t.length) {
            Array.prototype.forEach.call(t, function (t) {
                if (t.getAttribute("stroke")) {
                    t.setAttribute("stroke", e);
                }
                if (t.getAttribute("fill")) {
                    t.setAttribute("fill", e);
                }
            });
        }
    });
    Array.prototype.forEach.call(s, function (t) {
        t.style.color = e;
    });
}
function t_zoom_luma_rgb(t) {
    if (t) {
        var e = Array.isArray(t);
        if (t === void 0) {
            return "black";
        }
        if (t.indexOf("rgb") !== 0 && !e) {
            return "black";
        }
        e = e ? t : t.split("(")[ 1 ].split(")")[ 0 ].split(",");
        if (e.length < 3 || .2126 * e[ 0 ] + .7152 * e[ 1 ] + .0722 * e[ 2 ] < 128) {
            return "black";
        } else {
            return "white";
        }
    }
}
function t_zoom_hexToRgb(t) {
    t = t.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (t, e, o, r) {
        return e + e + o + o + r + r;
    });
    var t = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);
    var e = t ? { r: parseInt(t[ 1 ], 16), g: parseInt(t[ 2 ], 16), b: parseInt(t[ 3 ], 16) } : null;
    if (t) {
        return [ e.r, e.g, e.b ];
    } else {
        return null;
    }
}
function t_zoom_getFirstColorFromGradient(t) {
    var t = t.match(/rgba\(\d+,\d+,\d+,\d+\)/gi);
    var t = t ? t[ 0 ] : null;
    var t = /(\d+),(\d+),(\d+)/i.exec(t);
    var e = t ? { r: t[ 1 ], g: t[ 2 ], b: t[ 3 ] } : null;
    if (t) {
        return [ e.r, e.g, e.b ];
    } else {
        return null;
    }
}
function t_zoom_setHideControlsTimer() {
    var t = document.querySelectorAll(".t-carousel__zoomer__arrow__wrapper, .t-zoomer__scale");
    Array.prototype.forEach.call(t, function (t) {
        t.classList.remove("t-zoomer__hide-animation");
    });
    setTimeout(function () {
        Array.prototype.forEach.call(t, function (t) {
            t.classList.add("t-zoomer__hide-animation");
        });
    });
}
function t_zoom__isScaled(t) {
    return window.visualViewport && window.visualViewport.scale !== 1 || t.classList.contains("scale-active");
}
window.t_zoom__isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (!window.t_zoom__isMobile) {
    window.t_zoom__isMobile = navigator.userAgent.indexOf("Macintosh") && "ontouchend" in document;
}
window.t_zoom__isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
window.t_zoom__iOSMajorVersion = 0;
if (window.t_zoom__isiOS && (version = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/)) !== null) {
    window.t_zoom__iOSMajorVersion = parseInt(version[ 1 ], 10);
}

