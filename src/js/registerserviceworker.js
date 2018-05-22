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