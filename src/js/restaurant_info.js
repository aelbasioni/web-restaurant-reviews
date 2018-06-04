let restaurant;
var map;


const observer_config = {
   threshold: [0, 0.50]
};


/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
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
 * Create all reviews HTML and add them to the webpage.
 */
var fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  /*const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);*/

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}


/**
 * Create review HTML and add it to the webpage.
 */
var createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
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

