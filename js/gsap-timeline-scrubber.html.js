console.clear();

// "<25%" (use recent), "<+=25%" (use inserting)

gsap.registerPlugin(Draggable, CustomEase, CustomWiggle);

CustomWiggle.create("wiggle", { wiggles: 5, type: "easeInOut" });

new Vue({
    el: "#app",
    data() {
        return {
            labelPosition: 1,
            paused: false,
            roundedMilliseconds: 0,
            percentRange: 200,
            secondsRange: 5,
            useRecent: false,
            referencePoint: "timelineStart",
            offsetType: "seconds",
            offsetNumber: 1,
            position: 0,
            hidePosition: false,
            lastSecond: 1,
            lastPercent: 50,
            endX: 500,
            timelineItems: [],
            timelineData: [
                { class: "purple" },
                { class: "red" },
                { class: "green" },
                { class: "blue" },
            ]
        };
    },
    mounted() {

        this.setScrubber = gsap.quickSetter(this.$refs.scrubber, "x", "px");
        this.clampSeconds = gsap.utils.clamp(-this.secondsRange, this.secondsRange);
        this.clampPercent = gsap.utils.clamp(-this.percentRange, this.percentRange);
        this.mapSize = gsap.utils.mapRange(30, 90, 1.1, 0.65);

        this.timeline = gsap.timeline();

        this.createScrubber();
        this.renderTimeline();

        window.addEventListener("resize", this.onResize);

        this.$nextTick(() => {
            this.onResize();
            this.timeline.eventCallback("onUpdate", this.updateScrubber);

            // get browser to repaint scaling
            gsap.set(".position-text", { rotation: 0.001, force3D: false });
            gsap.to("#app", { opacity: 1 });
        });
    },
    computed: {
        formattedPosition() {
            if (this.hidePosition) {
                return "";
            }
            if (this.referencePoint !== "timelineStart") {
                return `"${this.position}"`;
            }
            return this.position;
        },
        range() {
            return this.offsetType === "percent" ? this.percentRange : this.secondsRange;
        },
        usePrevious() {
            return this.referencePoint.includes("previous") && this.offsetType === "percent";
        }
    },
    watch: {
        formattedPosition: "animatePosition",
        useRecent: "renderTimeline",
        referencePoint(value) {
            if (value === "timelineStart") {
                this.offsetType = "seconds";
            }

            this.renderTimeline();
        },
        offsetNumber(value) {
            value = parseFloat(value);
            if (isNaN(value)) return;

            if (this.offsetType === "percent") {
                this.offsetNumber = this.clampPercent(value);
            } else {
                this.offsetNumber = this.clampSeconds(value);
            }

            this.renderTimeline();
        },
        offsetType(value) {

            if (value === "percent") {
                this.lastSecond = this.offsetNumber;
                this.offsetNumber = this.lastPercent;
            } else {
                this.lastPercent = this.offsetNumber;
                this.offsetNumber = this.lastSecond;
            }

            this.renderTimeline();
        }
    },
    methods: {
        renderTimeline() {

            this.position = this.getPosition();
            this.endX = this.scrubber.maxX - 56;

            let tl = this.timeline;

            tl.progress(0)
                .clear(true)
                .addLabel("myLabel", this.labelPosition)
                .to(this.$refs.purple, {
                    ease: "none",
                    duration: 2,
                    x: this.endX,
                    data: this.timelineData[ 0 ]
                }, 0)
                .to(this.$refs.red, {
                    ease: "none",
                    duration: 0.5,
                    x: this.endX,
                    delay: 0.5,
                    data: this.timelineData[ 1 ]
                }, 2)
                .to(this.$refs.green, {
                    ease: "none",
                    duration: 1.5,
                    x: this.endX,
                    data: this.timelineData[ 2 ]
                }, this.position)
                .to(this.$refs.blue, {
                    ease: "none",
                    duration: 1,
                    x: this.endX,
                    data: this.timelineData[ 3 ]
                }, 3);


            let timelineItems = [];
            let time = tl.duration();
            let children = tl.getChildren();
            let milliseconds = time * 10;
            this.roundedMilliseconds = Math.floor(milliseconds) + 1;

            let fontSize = this.mapSize(this.roundedMilliseconds);
            document.documentElement.style.setProperty('--number-size', fontSize + "rem");

            children.forEach((child, index) => {
                let duration = child.totalDuration();
                let startTime = child.startTime();
                let width = (duration / time) * 100;
                let startPosition = (startTime / time) * 100;

                timelineItems[ index ] = {
                    ...child.data,
                    style: {
                        width: `${width}%`,
                        marginLeft: `${startPosition}%`
                    }
                };
            });

            // trigger render
            this.timelineItems = timelineItems;
        },
        getPosition() {

            this.hidePosition = false;
            let value = parseFloat(this.offsetNumber);

            let isNegative = value < 0;
            let isPercent = this.offsetType === "percent";

            if (this.referencePoint !== "timelineStart") {
                value = Math.abs(value);
            }

            let isZero = value === 0;
            let offset = isPercent ? `${value}%` : value;

            switch (this.referencePoint) {
                case "timelineStart": return value;

                case "timelineEnd":
                    if (isZero) {
                        this.hidePosition = false; // true;
                        return undefined; // "";
                    }
                    return (isNegative ? "-=" : "+=") + offset;

                case "previousStart":
                    if (isZero) {
                        return "<";
                    }
                    if (isPercent && !this.useRecent) {
                        return (isNegative ? "<-=" : "<+=") + offset;
                    }
                    return (isNegative ? "<-" : "<") + offset;

                case "previousEnd":
                    if (isZero) {
                        return ">";
                    }
                    if (isPercent && !this.useRecent) {
                        return (isNegative ? ">-=" : ">+=") + offset;
                    }
                    return (isNegative ? ">-" : ">") + offset;

                case "label":
                    if (isZero) return "myLabel";
                    return "myLabel" + (isNegative ? "-=" : "+=") + offset;

                default: return 0;
            }
        },
        createScrubber() {

            this.scrubber = new Draggable(this.$refs.scrubber, {
                type: "x",
                cursor: "pointer",
                bounds: this.$refs.timeline,
                zIndexBoost: false,
                onPress: () => {
                    this.timeline.pause();
                    this.paused = true;
                },
                onDrag: () => {
                    let progress = this.normalize(this.scrubber.x);
                    this.timeline.progress(progress);
                }
            });
        },
        togglePlayback() {
            if (this.timeline.progress() > 0.98) {
                this.paused = false;
                return this.timeline.restart();
            }
            this.paused = !this.paused;
            this.timeline.paused(this.paused);
        },
        onResize() {
            this.scrubber.update(true);
            this.normalize = gsap.utils.normalize(this.scrubber.minX, this.scrubber.maxX);
            this.interpolate = gsap.utils.interpolate(this.scrubber.minX, this.scrubber.maxX);
            this.updateScrubber();
            this.renderTimeline();
        },
        updateScrubber() {
            let x = this.interpolate(this.timeline.progress());
            this.setScrubber(x);
        },
        animatePosition() {

            gsap.fromTo(".position-text", {
                scale: 1,
                yPercent: -5,
            }, {
                overwrite: true,
                duration: 0.6,
                scale: 1.05,
                yPercent: -10,
                ease: 'wiggle',
            });
        }
    }
});
