/* eslint "require-jsdoc": ["error", {
    "require": {
        "FunctionDeclaration": true,
        "MethodDefinition": false,
        "ClassDeclaration": false,
        "ArrowFunctionExpression": false,
        "FunctionExpression": false
    }
}]*/
/* eslint valid-jsdoc: "error"*/
/* eslint max-len: ["error", { "code": 100 }]*/
/* eslint no-unused-vars: ["error", { "vars": "local" }]*/
// import idb from "idb";

/**
 * Common database helper functions.
 */
let dbpromise;
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    /**
    * const port = 8000 // Change this to your server port
    * return `http://localhost:${port}/data/restaurants.json`;
    */
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Create Database
   */

  static openDatabase() {
    // if (!navigator.serviceWorker){
    //  return Promise.resolve();
    // }

    return idb.open('restaurantDb', 1, function (upgradeDb) {
      upgradeDb.createObjectStore('restaurantDb', {
        keyPath: 'id' });
      // store.createIndex('by-id','id');
    });
  }
  /*
  *Saving on database
  */
  static saveDatabase(data) {
    return DBHelper.openDatabase().then(function (db) {
      if (!db) return;
      let tx = db.transaction('restaurantDb', 'readwrite');
      let store = tx.objectStore('restaurantDb');
      data.forEach(function (restaurant) {
        store.put(restaurant);
      });
      return tx.complete;
    });
  }

  /*
  *Getting data from DB
  */
  static getCachedDb() {
    dbpromise = DBHelper.openDatabase();
    return dbpromise.then(function (db) {
      if (!db) return;
      let tx = db.transaction('restaurantDb');
      let store = tx.objectStore('restaurantDb');
      return store.getAll();
    });
  }

  static fromApi() {
    return fetch(DBHelper.DATABASE_URL).then(function (response) {
      return response.json();
    }).then(restaurants => {
      DBHelper.saveDatabase(restaurants);
      return restaurants;
    });
  }

  /**
   * Fetch all restaurants.
   */

  static fetchRestaurants(callback) {
    /** stage1
    *let xhr = new XMLHttpRequest();
    *xhr.open('GET', DBHelper.DATABASE_URL);
    *xhr.onload = () => {
    *  if (xhr.status === 200) { // Got a success response from server!
    *    const json = JSON.parse(xhr.responseText);
    *    const restaurants = json.restaurants;
    *    callback(null, restaurants);
    *  } else { // Oops!. Got an error from server.
    *    const error = (`Request failed. Returned status of ${xhr.status}`);
    *    callback(error, null);
    *  }
    *};
    *xhr.send();
    **/

    /** Testing fetch from dummy server
     *fetch(DBHelper.DATABASE_URL)
     *  .then(respond => {
     *    if (!respond.ok){
     *      throw "Unable to fetch from server!";
     *    }
     *    return respond.json();
     *  })
     *  .then(restaurants => callback(null, restaurants))
     *  .catch(e => callback(e,null))
     **/

    return DBHelper.getCachedDb().then(restaurants => {
      if (restaurants.length) {
        return Promise.resolve(restaurants);
      } else {
        return DBHelper.fromApi();
      }
    }).then(restaurants => {
      callback(null, restaurants);
    }).catch(er => {
      callback(er, null);
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */

  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
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
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */

  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */

  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */

  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */

  static imageUrlForRestaurant(restaurant) {
    // return (`/img/${restaurant.photograph}`
    return `/dist/img/${restaurant.photograph}.jpg`;
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
      animation: google.maps.Animation.DROP });
    return marker;
  }
}