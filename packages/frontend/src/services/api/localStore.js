import {
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_PURCHASES,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
} from '../../data/mockData.js';

export const localStore = {
  categories: JSON.parse(JSON.stringify(INITIAL_CATEGORIES)),
  users: JSON.parse(JSON.stringify(INITIAL_USERS)),
  events: JSON.parse(JSON.stringify(INITIAL_EVENTS)),
  purchases: JSON.parse(JSON.stringify(INITIAL_PURCHASES)),
  reviews: JSON.parse(JSON.stringify(INITIAL_REVIEWS)),
  notificaciones: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),

  reset() {
    this.categories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.events = JSON.parse(JSON.stringify(INITIAL_EVENTS));
    this.purchases = JSON.parse(JSON.stringify(INITIAL_PURCHASES));
    this.reviews = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
    this.notificaciones = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
  },
};
