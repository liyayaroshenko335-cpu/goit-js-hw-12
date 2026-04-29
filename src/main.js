import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
} from './js/render-functions.js';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

let currentPage = 1;
let currentQuery = '';
const loadMoreBtn = document.querySelector('.load-more');
const form = document.querySelector('.form');

form.addEventListener('submit', async event => {
  event.preventDefault();

  currentQuery = event.currentTarget.elements['search-text'].value.trim();

  if (currentQuery === '') {
    iziToast.warning({ message: 'Please fill in the search field!' });
    return;
  }

  currentPage = 1;
  loadMoreBtn.classList.add('hidden');
  clearGallery();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);

    if (data.hits.length === 0) {
      iziToast.error({ message: 'Sorry, no images found!' });
      return;
    }

    createGallery(data.hits);

    if (data.totalHits > 15) {
      loadMoreBtn.classList.remove('hidden');
    }
  } catch (error) {
    iziToast.error({ message: 'Error fetching images!' });
  } finally {
    hideLoader();
    form.reset();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  showLoader();
  loadMoreBtn.classList.add('hidden');

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    createGallery(data.hits);

    const totalPages = Math.ceil(data.totalHits / 15);
    if (currentPage >= totalPages) {
      iziToast.info({ message: "You've reached the end of search results." });
    } else {
      loadMoreBtn.classList.remove('hidden');
    }

    // Плавний скрол після додавання нових фото
    const galleryItem = document.querySelector('.gallery-item');
    if (galleryItem) {
      // Отримуємо висоту ОДНІЄЇ картки
      const cardHeight = galleryItem.getBoundingClientRect().height;

      // Прокручуємо на ДВІ висоти картки
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    iziToast.error({ message: 'Error loading more images!' });
  } finally {
    hideLoader();
  }
});
