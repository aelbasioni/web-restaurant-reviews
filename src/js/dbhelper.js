/**
 * Common database helper functions.
 */
const RESTAURANTS_DBNAME = "restaurants";
const NEIBOURHOUDS_DBNAME = "neighborhoods";
const CUISINE_DBNAME = "cuisines";

// This will rename the database from "localforage"
// to "Hipster PDA App".

if (window.localforage)
    window.localforage.config({
    name: 'Restaurants_App'
});

class DBHelper {

   
    /**
    * Database URL.
    * Change this to restaurants.json file location on your server.
    */
    static get DATABASE_URL() {
        /*const port = 8000 // Change this to your server port
        return `http://localhost:${port}/data/restaurants.json`;*/
        const port = 1337 // Change this to your server port
        return `http://localhost:${port}/restaurants`;
    }

    /**
    * Fetch all restaurants.
    */
    static fetchRestaurants(callback) {
        fetch(DBHelper.DATABASE_URL).then((response) => {
            const result = response.json();
            DBHelper.saveFetchedData(RESTAURANTS_DBNAME, result);
            return result;
        }).then((data) => { callback(null, data); });
    }

    /**
    * Fetch a restaurant by its ID.
    */
    /*static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
        callback(error, null);
        } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
            callback(null, restaurant);
        } else { // Restaurant does not exist in the database
            callback('Restaurant does not exist', null);
        }
        }
    });
    }*/

    static fetchRestaurantById(id, callback) {
        fetch(`${DBHelper.DATABASE_URL}/${id}`).then(function (response) {
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


                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                //callback(null, DBHelper.filterByCuisineAndNeighborhood(restaurants, cuisine, neighborhood));
                callback(null, results);
            } else {
                // Fetch all restaurants
                DBHelper.fetchRestaurants((error, restaurants) => {
                    if (error) {
                        callback(error, null);
                    } else {
        
                        let results = restaurants
                        if (cuisine != 'all') { // filter by cuisine
                            results = results.filter(r => r.cuisine_type == cuisine);
                        }
                        if (neighborhood != 'all') { // filter by neighborhood
                            results = results.filter(r => r.neighborhood == neighborhood);
                        }
                        //callback(null, DBHelper.filterByCuisineAndNeighborhood(restaurants, cuisine, neighborhood));
                        callback(null, results);
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
        return result;
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

    /**********************/
    static saveFetchedData(dbName, data) {
        window.localforage.setItem(dbName, data);
    };

}


