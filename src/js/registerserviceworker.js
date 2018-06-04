/*
 * use polyfills if necessary
 */
const polyfillsNeeded = [];

if (!('Promise' in self)) polyfillsNeeded.push('/js/polyfills/promise.js');
if (!('fetch' in self)) polyfillsNeeded.push('/js/polyfills/fetch.js');
if (!('IntersectionObserver' in self)) polyfillsNeeded.push('/js/polyfills/intersection-observer.js');

polyfillsNeeded.forEach(function (polyfill) {
    var script = document.createElement('script');   
    script.src = polyfill;
    document.head.insertBefore(script, document.head.firstChild);
});


/*
* Register service worker for offline support
*/
window.registerServiceWorker = () => {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.register('/sw.js').then(function (reg) {
        if (!navigator.serviceWorker.controller) {
            return;
        }

        console.log("SW registered");
    });
}
registerServiceWorker();