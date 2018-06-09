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
    if (navigator.serviceWorker) {

        navigator.serviceWorker.register('/sw.js').then((reg) => {
            if (!navigator.serviceWorker.controller) {
                return;
            }
            console.log("SW registered");

            //start registering Background Sync if supported by the browser:
            if (window.SyncManager) {
                navigator.serviceWorker.ready.then((swReg) => {
                    document.getElementById('add_review').onclick = () => {
                        const rPost = validateReviewFormValues();
                        console.log("rPost", rPost);
                        if (rPost) {
                            DBHelper.saveFetchedData(OFFLINE_REVIEWS_POST, rPost);
                            swReg.sync.register('post-review').then(() => {
                                console.log('Sync registered');
                                clearReviewFormFields();
                            });
                        }
                    }
                }).catch(() => {
                    // system was unable to register for a sync,
                    // this could be an OS-level restriction
                    console.log('Fail to sync registeration');
                    getReadyToPostReview();
                });
            } else {
                // serviceworker/sync not supported
                console.log('Sync registeration not supported');
                getReadyToPostReview();
            }
        });

        navigator.serviceWorker.addEventListener('message', event => {
            console.log(event.data.msg);
        });

    } else {
        //failed to register SW
        console.log('failed to register SW');
        getReadyToPostReview();
    }
}


function getReadyToPostReview() {
    const addReviewBTN = document.getElementById('add_review');
    addReviewBTN.onclick = function () {
        if (validateReviewFormValues()) {
            saveReview();
        }        
    }
}


var validateReviewFormValues = () => {
    console.log("btn");

    const userName = document.getElementById('user_name');
    if (userName.value === "") {
        alert("Please, enter your name");
        userName.focus();
        return;
    }

    if (rating === 0) {
        alert(`Please, enter a rating for "${restaurant.name}"`);
        return;
    }

    const reviewComment = document.getElementById('review_comment');
    if (reviewComment.value === "" || reviewComment.value.length < 10) {
        alert(`Please, type a valid comment about "${restaurant.name}"`);
        reviewComment.focus();
        return;
    }

    const myReview = {
        "restaurant_id": restaurant.id,
        "name": userName.value,
        "rating": rating,
        "comments": reviewComment.value
    }

    return myReview;
}

var clearReviewFormFields = () => {

    rating = 0;
    document.getElementById('user_name').value= "";
    const ratingStars = document.querySelectorAll('.rating-block > .rating');
    if (ratingStars) {
        ratingStars.forEach((ratingStar) => {
            ratingStar.classList.remove("gold");
            ratingStar.value = '\u2606';
        });
    }
    document.getElementById('review_comment').value = "";    
}


var saveReview = function () {
    console.log("save rev");

    //DBHelper.postRestaurantReview(myReview).then((data) =>{console.log("saved",data)});
}

document.addEventListener('DOMContentLoaded', (event) => {
    registerServiceWorker();
});


