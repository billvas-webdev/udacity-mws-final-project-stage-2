/* eslint max-len: ["error", { "code": 100 }]*/
/* eslint no-unused-vars: ["error", { "vars": "local" }]*/


let restaurant;
let map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false,
      });
      document.getElementById('map').setAttribute('role', 'application');

      fillBreadcrumb();

      /*
      document.getElementById('map').setAttribute('role','application');
      document.getElementById('map').setAttribute('tabindex','4');
      document.getElementById('map').setAttribute('aria-hidden','true');
      */
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */

fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */

fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  /* unique alt-arialabel */
  image.setAttribute('aria-label', name.innerHTML+' restaurant');
  image.setAttribute('alt', name.innerHTML+' restaurant');

  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */

fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.style.color='#525252';
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.style.color='#525252';

    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */

fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach((review) => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */

createReviewHTML = (review) => {
  const li = document.createElement('li');
  /* screener settings */
  li.setAttribute('tabindex', '13');
  li.setAttribute('role', 'listitem');

  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.style.textAlign='left';
  name.style.width='50%';
  name.style.order='0';
  name.style.fontWeight='bold';
  name.style.fontSize='16px';
  name.style.color='#932C2A';


  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.style.textAlign='right';
  date.style.width='50%';
  date.style.fontSize='16px';
  date.style.fontStyle='oblique';
  date.style.textDecoration='underline';
  date.style.order='0';

  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  /* Rating settings */
  rating.style.backgroundColor='#333333';
  rating.style.borderRadius='5px 5px';
  rating.style.textAlign='center';
  rating.style.fontWeight='bold';
  rating.style.fontSize='17px';
  rating.style.height='25px';
  rating.style.width='100px';
  rating.style.color='#FFB52E';
  rating.style.order='1';

  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.style.order='2';
  comments.style.lineHeight='1.6';
  comments.style.textAlign='justify';

  li.appendChild(comments);


  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */

fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */

getParameterByName = (name, url) => {
  if (!url) {
url = window.location.href;
}
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) {
return null;
}
  if (!results[2]) {
return '';
}
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};


/*
Screen Reader SETTINGS for the reviews
*/
