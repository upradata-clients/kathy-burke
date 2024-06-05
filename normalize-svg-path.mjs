import normalize from 'normalize-svg-coords';

const normalizedPath = normalize({
    viewBox: '0 0 195.06 163.14',
    path: 'm157.61 11.416c-118.06-23.125-148.36-12.304-157.1 43.378-6.1845 96.857 45.223 120.25 96.193 103.26 72.137-24.043 144.49-121.98 60.906-146.64z',
    min: 0,
    max: 1,
    asList: false
});

console.log(normalizedPath);
