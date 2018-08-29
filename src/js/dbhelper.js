/**
 * The names of the objectStores in the IndexedDB
 */
const RESTAURANTS_DBNAME = "restaurants";
const NEIBOURHOUDS_DBNAME = "neighborhoods";
const CUISINE_DBNAME = "cuisines";
const OFFLINE_REVIEWS_POST = "review_post";


/*
* Set the name of indexedDB to "Restaurants_App"
*/
if (self.localforage)
    self.localforage.config({
    name: 'Restaurants_App'
});


/**
 * Common database helper functions.
 */
class DBHelper {

    /**
    * Database URL.
    * Change this to restaurants.json file location on your server.
    */
    static get DATABASE_URL() {
        return `https://limitless-harbor-91860.herokuapp.com`;
    }



    /**
    * Fetch all restaurants.
    */
    static fetchRestaurants(callback) {
        fetch(`${DBHelper.DATABASE_URL}/restaurants`).then((response) => {
            const result = response.json();
            //Save the fetched data in indexedDB
            DBHelper.saveFetchedData(RESTAURANTS_DBNAME, result);
            return result;
        }).then((data) => { callback(null, data); });
    }


    /**
    * Fetch a restaurant by its ID.
    */
    static fetchRestaurantById(id, callback) {
        fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}`).then(function (response) {
            return response.json();
        }).then(function (data) {
            callback(null, data);
        })
    }


    /**
    * Fetch restaurants by a cuisine type with proper error handling.
    */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }


    /**
    * Fetch restaurants by a neighborhood with proper error handling.
    */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }


    /**
    * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
    */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {

        window.localforage.getItem(RESTAURANTS_DBNAME, function (err, restaurants) {
            if (restaurants) {
                callback(null, DBHelper.filterByCuisineAndNeighborhood(restaurants, cuisine, neighborhood));
            } else {
                // Fetch all restaurants
                DBHelper.fetchRestaurants((error, restaurants) => {
                    if (error) {
                        callback(error, null);
                    } else {
                        callback(null, DBHelper.filterByCuisineAndNeighborhood(restaurants, cuisine, neighborhood));
                    }
                });
            }
        });
    }


    static filterByCuisineAndNeighborhood (restaurants, cuisine, neighborhood) {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
            results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
            results = results.filter(r => r.neighborhood == neighborhood);
        }
        return results;
    }


    /**
    * Fetch favorite restaurants by a cuisine and a neighborhood with proper error handling.
    */
    static fetchFavoriteRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {

        window.localforage.getItem(RESTAURANTS_DBNAME, function (err, restaurants) {
            if (restaurants) {
                callback(null, DBHelper.filterByFavoriteCuisineAndNeighborhood(restaurants, cuisine, neighborhood));
            } else {
                // Fetch favorite restaurants
                DBHelper.fetchFavoriteRestaurants().then((restaurants) => {                                         
                    callback(null, DBHelper.filterByFavoriteCuisineAndNeighborhood(restaurants, cuisine, neighborhood));                    

                }).catch((error) => { callback(error, null); });
            }
        });
    }

    static filterByFavoriteCuisineAndNeighborhood(restaurants, cuisine, neighborhood) {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine & is_favorite
            results = results.filter(r => r.cuisine_type == cuisine && (r.is_favorite == "true" || r.is_favorite == true));
        } else {
            results = results.filter(r => (r.is_favorite == "true" || r.is_favorite == true));
        }

        if (neighborhood != 'all') { // filter by neighborhood & is_favorite
            results = results.filter(r => r.neighborhood == neighborhood && (r.is_favorite == "true" || r.is_favorite == true));
        } else {
            results = results.filter(r => (r.is_favorite == "true" || r.is_favorite == true));
        }
        return results;
    }


    /**
    * Fetch all neighborhoods with proper error handling.
    */
    static fetchNeighborhoods(callback) {
        window.localforage.getItem(RESTAURANTS_DBNAME, function (err, restaurants) {
            if (restaurants) {

                const uniqueNeighborhoods = DBHelper.getUniqueNeighborhoods(restaurants);
                callback(null, uniqueNeighborhoods);

            } else {
                // Fetch all restaurants
                DBHelper.fetchRestaurants((error, restaurants) => {
                    if (error) {
                        callback(error, null);
                    } else {
                        
                        const uniqueNeighborhoods = DBHelper.getUniqueNeighborhoods(restaurants);
                        DBHelper.saveFetchedData(NEIBOURHOUDS_DBNAME, uniqueNeighborhoods);
                        callback(null, uniqueNeighborhoods);
                    }
                });
            }
        });
    };


    static getUniqueNeighborhoods (restaurants) {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);

    }


    /**
    * Fetch all cuisines with proper error handling.
    */
    static fetchCuisines(callback) {
        window.localforage.getItem(RESTAURANTS_DBNAME, function (err, restaurants) {
            if (restaurants) {

                const uniqueCuisines = DBHelper.getUniqueCuisines(restaurants);
                callback(null, uniqueCuisines);

            } else {
                // Fetch all restaurants
                DBHelper.fetchRestaurants((error, restaurants) => {
                    if (error) {
                        callback(error, null);
                    } else {
                        const uniqueCuisines = DBHelper.getUniqueCuisines(restaurants);
                        DBHelper.saveFetchedData(CUISINE_DBNAME, uniqueCuisines);
                        callback(null, uniqueCuisines);
                    }
                });
            }
        });
        
    }


    static getUniqueCuisines (restaurants) {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        return cuisines.filter((v, i) => cuisines.indexOf(v) == i);
    }


    /**
    * Restaurant page URL.
    */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }


    /**
    * Restaurant image URL.
    */
    static imageUrlForRestaurant(restaurant) {
        if (restaurant.photograph) return (`/img/${restaurant.photograph}`);
    }


    /**
    * Map marker for a restaurant.
    */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP}
        );
        return marker;
    }
   

    /**
    * Fetch restaurant reviews.
    */
    static fetchRestaurantReviews(restaurant_id) {        
        return fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${restaurant_id}`).then((response) => {
            const result = response.json();
            //Save the fetched data in indexedDB
            DBHelper.saveFetchedData(`REVIEWS_R${self.restaurant.id}`, result);
            return result;
        });
    }


    /**
    * save a restaurant review.
    */
    static postRestaurantReview(review) {
        return fetch(`${DBHelper.DATABASE_URL}/reviews/`, { method: 'POST', body: JSON.stringify(review) }).then((response) => {
            return response.json();       
        });
    }


    /**
    * Favorite/Unfavorite a restaurant.
    */
    static toggleFavorite(restaurant_id, is_favorite) {
        return fetch(`${DBHelper.DATABASE_URL}/restaurants/${restaurant_id}/?is_favorite=${is_favorite}`, { method: 'PUT' }).then((response) => {
            return response.json();
        });
    }


    /*
     * update favorite status for the fav button styles & in indexedDB
     */
    static updateFavoriteStatus(el, restaurant) {

        if (restaurant.is_favorite === true) {
            el.value = '\u2726';
            el.classList.add('gold');
            el.setAttribute("title", "Remove from favorites");
            el.setAttribute('aria-label', `remove ${restaurant.name} from favorites`);
        } else {
            el.value = '\u2727';
            el.classList.remove('gold');
            el.setAttribute("title", "Add to favorites");
            el.setAttribute('aria-label', `add ${restaurant.name} to favorites`);
        }

        //update the offline storage appropriately:
        window.localforage.getItem(RESTAURANTS_DBNAME, function (err, restaurants) {
            if (restaurants) {
                const savedRestaurant = restaurants.find(r => r.id == restaurant.id);
                savedRestaurant.is_favorite = restaurant.is_favorite;
                DBHelper.saveFetchedData(RESTAURANTS_DBNAME, restaurants);
            }
        });
    }


    /**
    * Get favorite restaurants.
    */
    static fetchFavoriteRestaurants() {
        return fetch(`${DBHelper.DATABASE_URL}/restaurants/?is_favorite=true`).then((response) => {
            return response.json();
        });
    }


    /**
    * add objectStore to indexDB.
    */
    static saveFetchedData(dbName, data) {
        return window.localforage.setItem(dbName, data);
    };
}
