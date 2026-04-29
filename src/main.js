import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreBtn, // Додано обов'язковий імпорт
  hideLoadMoreBtn, // Додано обов'язковий імпорт
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
  hideLoadMoreBtn(); 
  clearGallery();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    
    if (data.hits.length === 0) {
      iziToast.error({ 
        message: 'Sorry, there are no images matching your search query. Please try again!' 
      });
      return;
    }

    createGallery(data.hits);

    const totalPages = Math.ceil(data.totalHits / 15);

    if (totalPages > 1) {
      showLoadMoreBtn();
    } else {
      iziToast.info({ message: "You've reached the end of search results." });
    }
  } catch (error) {
    iziToast.error({ message: 'Something went wrong. Please try again later.' });
    console.error(error);
  } finally {
    hideLoader();
    form.reset();
  }
});

// ЗАЛИШАЄМО ТІЛЬКИ ОДИН ОБРОБНИК ДЛЯ КНОПКИ
loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  showLoader();
  hideLoadMoreBtn(); 

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    createGallery(data.hits);

    const totalPages = Math.ceil(data.totalHits / 15);
    
    if (currentPage >= totalPages) {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
      // Кнопка не показується, бо ми не викликаємо showLoadMoreBtn()
    } else {
      showLoadMoreBtn(); 
    }

    // Плавний скрол після додавання нових фото
    const galleryItem = document.querySelector('.gallery-item');
    if (galleryItem) {
      const cardHeight = galleryItem.getBoundingClientRect().height;
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
