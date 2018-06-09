let restaurant;
let rating = 0;
var map;


const observer_config = {
   threshold: [0, 0.50]
};


document.addEventListener('DOMContentLoaded', (event) => {    
    attachClickEvents();
    window.addEventListener('online', checkForOfflineDataToPost);
    window.addEventListener('offline', isOffline);    
});


/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    //Check if some review needs to be sent to the server after losing connectivity:
    checkForOfflineDataToPost();
    isOffline();

    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            
            const map_c = document.getElementById('map-container'); 
            map_c.setAttribute('aria-label', `map of ${restaurant.name}`);
            //start observing the map to enter the view:
            var observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    //show a STATIC map if a small part of it is in the view
                    if (entry.intersectionRatio > 0 && entry.intersectionRatio < 0.5 ) {
                        showStaticMap();
                    }else if (entry.intersectionRatio >= 0.5) { //show an INTERACTIVE map if a big part of it is in the view
                     
                        showMap();
                        observer.unobserve(entry.target);
                    }
                });
            },observer_config);    
            observer.observe(map_c);
            
            fillBreadcrumb();
        }
    });
  
};


/**
 * Fetch a STATIC map if a small part of it is in the view
 */
var showStaticMap = function(){
  const static_map = document.getElementById('static_map'); 
  if(self.restaurant && self.restaurant.latlng){
     const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
     const src =`https://maps.googleapis.com/maps/api/staticmap?center=${self.restaurant.latlng.lat},${self.restaurant.latlng.lng}&zoom=14&size=${w}x400&format=jpg&maptype=roadmap&markers=color:red&key=AIzaSyDATtgo5EH-AGMQUgVipe74zk6kfOsiDaA`;                
     static_map.setAttribute('alt', `map of ${self.restaurant.name} restaurant`);
     static_map.setAttribute("src",src);
     static_map.style.display = 'block';
     const m = document.getElementById('map'); 
     m.style.display = 'none';
      //window.onscroll = function(){setTimeout(function(){ showMap();}, 200);window.onscroll=null;}              
  }
};


/**
 * Fetch an INTERACTIVE map if a small part of it is in the view
 */
var showMap = function(){

  const static_map = document.getElementById('static_map'); 
  const m = document.getElementById('map'); 
  if(self.restaurant && self.restaurant.latlng){
     self.map = new google.maps.Map(m, {
         zoom: 16,
         center: restaurant.latlng,
         scrollwheel: false
     });
        
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);

      static_map.style.display = 'none';
      m.style.display = 'block';
   }
};


/**
 * Get current restaurant from page URL.
 */
var fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
      //Search for the required restaurant in indexedDB first
    window.localforage.getItem(RESTAURANTS_DBNAME, function (err, restaurants) {
        if (restaurants) {
            const restaurant = restaurants.find(r => r.id == id);
            handleFoundRestaurant(restaurant,callback);

        } else {
            // Fetch restaurant by its id if not exist in indexedDB 
            DBHelper.fetchRestaurantById(id, (error, restaurant) => {                
                handleFoundRestaurant(restaurant,callback);
            });
        }
    });    
  }
}


var handleFoundRestaurant = function(restaurant,callback){
    self.restaurant = restaurant;
    if (!restaurant) {
        console.error(error);
        return;
    }
    fillRestaurantHTML();
    callback(null, restaurant)
}


/**
 * Create restaurant HTML and add it to the webpage
 */
var fillRestaurantHTML = (restaurant = self.restaurant) => {
   const map = document.getElementById('map-container');
   map.setAttribute('aria-label', `location of ${restaurant.name} on the map`);

   const name = document.getElementById('restaurant-name');
   name.innerHTML = restaurant.name;  
  
   const favBTN = document.createElement('input');
   favBTN.setAttribute("type","button");
   favBTN.className = 'rating fav';
   //convert is_favorite from string, if it's, to boolean:
   restaurant.is_favorite = ((restaurant.is_favorite == "true") || restaurant.is_favorite == true);
   //set the star appropriately:
   if(restaurant.is_favorite === true){
      favBTN.value = '\u2726';
      favBTN.classList.add('gold');
      favBTN.setAttribute("title","Remove from favorites");
      favBTN.setAttribute('aria-label',`remove ${restaurant.name} from favorites`);

   }else{
      favBTN.value = '\u2727';
      favBTN.setAttribute("title","Add to favorites");
      favBTN.setAttribute('aria-label',`add ${restaurant.name} to favorites`);
   }    
   favBTN.onclick = function(){
      restaurant.is_favorite = !restaurant.is_favorite;
      DBHelper.toggleFavorite(restaurant.id,restaurant.is_favorite).then((data) => {
          DBHelper.updateFavoriteStatus(favBTN,restaurant);
      });
  }
  name.append(favBTN)

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  const picture = image.parentElement;
  const source1 = picture.querySelector('source[type="image/webp"]');
  const source2 = picture.querySelector('source[type="image/jpeg"]');
 
  let imageSrc = DBHelper.imageUrlForRestaurant(restaurant);
  if(imageSrc !== undefined){
      imageSrc = imageSrc.replace(/\.jpg$/, '');  
      source1.setAttribute('srcset', `${imageSrc}-300px.jpg 300w, ${imageSrc}-420px.webp 400w, ${imageSrc}-650px.webp 600w`);
      source2.setAttribute('srcset', `${imageSrc}-300px.jpg 300w, ${imageSrc}-420px.jpg 400w, ${imageSrc}-650px.jpg 600w`);
      const sizes = '(max-width: 667px) 70vw, (min-width: 667px) 30vw';
      source1.setAttribute('sizes', sizes);
      source2.setAttribute('sizes', sizes);
      image.setAttribute('sizes', sizes);
      image.setAttribute('alt', `photo of ${restaurant.name} restaurant`);
      image.src = `${imageSrc}-420px.jpg`;
  }else{
      image.setAttribute('alt', 'photo not available');
      image.src = '/img/icon-no-image.png';
  }
  
  image.className = 'restaurant-img'
  

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // fill reviews
  fillReviewsHTML();
}


/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
var fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}


/**
 * Add restaurant name to the breadcrumb navigation menu
 */
var fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}


/**
 * Get a parameter by name from page URL.
 */
var getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


/*
 * add click listeners to post review button & to the rating buttons:
 */
var attachClickEvents = () => {

    self.getReadyToPostReview();

    const ratingStars = document.querySelectorAll('.rating-block > .rating');
    if (ratingStars) {
        ratingStars.forEach((ratingStar) => {
            ratingStar.onclick = function () {
                rating = ratingStar.getAttribute("data-value");
                setRating(rating, ratingStars);
            }
        });
    }

};


/*
 * Style the rating buttons according to the selected rating value:
 */
function setRating(ratingValue, ratingStarsElements) {

    ratingValue = ratingValue - 1;
    let starsCount = 0;
    while (starsCount < 5) {
        //color all the stars starting from the rating value to 1
        if (starsCount <= ratingValue && !ratingStarsElements[starsCount].classList.contains("gold")) {
            ratingStarsElements[starsCount].classList.add("gold");
            ratingStarsElements[starsCount].value = '\u2605';
        }

        //uncolor the rest of the stars
        if (starsCount > ratingValue && ratingStarsElements[starsCount].classList.contains("gold")) {
            ratingStarsElements[starsCount].classList.remove("gold");
            ratingStarsElements[starsCount].value = '\u2606';
        }

        starsCount++;
    }
}


/*
 * click listeners of the post review button
 */
var getReadyToPostReview =() =>{
    const addReviewBTN = document.getElementById('add_review');
    addReviewBTN.onclick = function () {
        const myReview = validateReviewFormValues();
        if (myReview) {
            saveReview(myReview);
        }
    }
}


/*
 * validate the post review fields:
 */
function validateReviewFormValues (){
    const userName = document.getElementById('user_name');
    if (userName.value === "") {
        showAlert("Please, enter your name");
        userName.setAttribute("aria-invalid", true);
        userName.focus();
        return;
    }else {
        userName.setAttribute("aria-invalid", false);
    }

    if (rating === 0) {
        showAlert(`Please, enter a rating for "${restaurant.name}"`);
        document.querySelectorAll('.rating-block > .rating')[0].focus();
        return;
    }

    const reviewComment = document.getElementById('review_comment');
    if (reviewComment.value === "" || reviewComment.value.length < 10) {
        showAlert(`Please, type a valid comment about "${restaurant.name}"`);
        reviewComment.setAttribute("aria-invalid", true);
        reviewComment.focus();
        return;
    }else{
        reviewComment.setAttribute("aria-invalid", false);
    }

    const myReview = {
        "restaurant_id": restaurant.id,
        "name": userName.value,
        "rating": rating,
        "comments": reviewComment.value
    }

    return myReview;
}


/*
 * clear form fileds
 */
function clearReviewFormFields (){

    rating = 0;
    document.getElementById('user_name').value = "";
    //uncolor all the rating stars:
    const ratingStars = document.querySelectorAll('.rating-block > .rating');
    if (ratingStars) {
        ratingStars.forEach((ratingStar) => {
            ratingStar.classList.remove("gold");
            ratingStar.value = '\u2606';
        });
    }
    document.getElementById('review_comment').value = "";
}


/**
* send my review to the server, or to indexedDB if no connectivity:
*/
function  saveReview (myReview) {
    if (navigator.onLine) { //it's online, send to the server
        DBHelper.postRestaurantReview(myReview).then((data) => {
            clearReviewFormFields();
            //push the new review to restaurant reviews in indexedDB if exists
            updateOfflineStorgae(true,data);

        }).catch((err) => { console.log("error in saving review", err); });
    
    } else if (navigator.onLine === false) { //it's offline, save in indexedDB
        showAlert("Internet connection is lost");
        DBHelper.saveFetchedData(OFFLINE_REVIEWS_POST, myReview).then(() => {
            clearReviewFormFields();
            createOfflineReviewHTML(myReview);
        });
        
    } else { //online feature is not supported, send to the server anyway
        DBHelper.postRestaurantReview(myReview).then((data) => {
            clearReviewFormFields();
            //push the new review to restaurant reviews in indexedDB if exists
            updateOfflineStorgae(true,data);

        }).catch((err) => { console.log("error in saving review", err); });
    }
}


/**
* Create all reviews HTML and add them to the webpage.
*/
var fillReviewsHTML = () => {

    const container = document.getElementById('reviews-container');
    //start observing map to enter the view:
    var observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                //show loading gif:
                const loadingIcon = document.getElementById('loading-icon');
                loadingIcon.setAttribute("src",loadingIcon.getAttribute("data-src"));
                loadingIcon.style.display = "block";

                //ge fetch reviews:
                fetchReiews(container,loadingIcon);
                observer.unobserve(entry.target);
            }
        });
    });    
    observer.observe(container);
}

var fetchReiews = (container,loadingIcon) => {
    //get reviews from indexedDB if exist:
    window.localforage.getItem(`REVIEWS_R${self.restaurant.id}`, function (err, reviews) {
        if (reviews) {
            doFillReviewsHTML(container,loadingIcon,reviews);

        } else {
            //fetch revires from network if not exist in indexedDB:
            DBHelper.fetchRestaurantReviews(self.restaurant.id).then((reviews) => {    
                doFillReviewsHTML(container,loadingIcon,reviews);

            }).catch((error) => {
                loadingIcon.style.display = "none";
                console.log("error in fetching reviews: ",error);
            })
        }
    });
}

var doFillReviewsHTML = (container,loadingIcon,reviews) => {

    /*const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);*/
    loadingIcon.style.display = "none";

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    ul.innerHTML = "";
    reviews.sort(compare).reverse().forEach(review => {
        ul.appendChild(createReviewHTML(review,false));
    });
    container.appendChild(ul);    
};


/**
* Create review HTML and add it to the webpage.
*/
var createReviewHTML = (review, isOfflineReview) => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    if(isOfflineReview)
        date.innerHTML = "Pending";
    else
        date.innerHTML = (new Date(review.updatedAt)).toLocaleDateString();
    li.appendChild(date);

    const rating = document.createElement('p');
    //rating.innerHTML = `Rating: ${review.rating}`;
    //Add five stars and give them a gold class accordig to the rating value
    let ratingStars = '';
    let starsCount = 1;
    while(starsCount <= 5) {
        ratingStars = `${ratingStars} ${(starsCount<=review.rating)?'<span class="rating gold">&#9733;</span>':'<span class="rating">&#9734</span>'}`;     
        starsCount++;
    }
    rating.innerHTML = `Rating: ${ratingStars}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}


/**
* Create review HTML for my pending review, and add it to the webpage.
*/
function createOfflineReviewHTML(review){
    const container = document.getElementById('reviews-container');
    const ul = document.getElementById('reviews-list');
    ul.insertBefore(createReviewHTML(review,true), ul.firstChild);
    container.appendChild(ul);    
}


/*
 * Check if there is some data need to be posted, but the offline state prevented it
 */
function checkForOfflineDataToPost() {
   
    self.localforage.getItem(OFFLINE_REVIEWS_POST, function (err, myReview) {
        if (myReview) { //a not posted review is found in indexedDB
            if (navigator.onLine) {
                //re-post it if online
                DBHelper.postRestaurantReview(myReview).then((data) => {
                
                    //clear the item because it's posted successfully
                    self.localforage.removeItem("review_post");

                    //push the new review to restaurant reviews in indexedDB if exists
                    updateOfflineStorgae(true,data);

                }).catch((err) => { console.log("error in saving review", err); });
            }
        } else {
            console.log("no offline data");
        }
    });    
}


/*
 * append the newly added review to the rest of reviews in indexedDB
 */
function updateOfflineStorgae(isNewReview,myReview){
    window.localforage.getItem(`REVIEWS_R${self.restaurant.id}`, function (err, reviews) {
        if (reviews) {
            if(isNewReview){ //for new review
                reviews.push(myReview);                
            }else { // for updating existing review
                const review = reviews.find(r => r.id == myReview.id);
                Object.assign(review, myReview);
            }
            DBHelper.saveFetchedData(`REVIEWS_R${self.restaurant.id}`, reviews);
        }
    }).then(() => {
        // fill reviews
        fillReviewsHTML();
    });
}


/*
 * to sort reviews by id: 
 */
function compare(a, b) {
    if (a.id < b.id)
        return -1;
    if (a.id > b.id)
        return 1;
    return 0;
}


/*
 * show message if connectivity is lost
 */
function isOffline(){
    if (navigator.onLine === false) 
        showAlert("Internet connection is lost");
}


/*
 * show alert message
 */
function showAlert(msg){
    const alertBox = document.getElementById('alert');
    alertBox.getElementsByClassName('msg')[0].innerText = msg;
    alertBox.style.display = "inline-block";
    setTimeout(() => { closeAlert(); }, 5000);
}


/*
 * close alert message; 
 */
function closeAlert(){
    const alertBox = document.getElementById('alert');
    alertBox.getElementsByClassName('msg')[0].innerText = "";
    alertBox.style.display = "none";
}


