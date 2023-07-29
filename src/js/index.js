import { fetchImages } from './pixabay-api';
import { createGalleryMarkup } from './gallery';
import { Report } from 'notiflix/build/notiflix-report-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const formEl = document.querySelector(".search-form");
const galleryEl = document.querySelector(".gallery");
const scrollUpBtn = document.querySelector(".scroll-button");
const guardJs = document.querySelector(".js-guard");

let page = 1;
let searchValue;

scrollUpBtn.addEventListener("click", onScrollUpBtnClick);

formEl.addEventListener("submit", onFormSubmit);
const lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: '250' });

scrollUpBtn.hidden = true;

async function onFormSubmit(evt) {
    try {
        evt.preventDefault();
        observer.unobserve(guardJs);
      galleryEl.innerHTML = "";
      page = 1;
        Loading.circle();
      searchValue = formEl.elements.searchQuery.value.trim();
      const validInput = /^[a-zA-Z0-9\s]+$/.test(searchValue);
      if (!validInput || searchValue === "") {
        Report.failure("invalid input", "Please enter a valid search query");
        Loading.remove();
        return;
      } else {
        const { hits, totalHits } = await fetchImages(searchValue);

        if (totalHits === 0) {
          evt.target.reset();
          Report.failure("Nothing found", "Sorry, there are no images matching your search query. Please try again.");
          return;
        } 
        Notify.success(`Hooray! We found ${totalHits} images`);
      galleryEl.innerHTML = createGalleryMarkup(hits);
      lightbox.refresh();
      evt.target.reset();
        observer.observe(guardJs);
      }
    }
    catch (error) {
        Report.failure("Nothing found", "Sorry, there are no images matching your search query. Please try again.");
        console.log(error);
      }
     finally {
        Loading.remove();
    }
}

function onScrollUpBtnClick() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })
    scrollUpBtn.hidden = true;
}

let options = {
    root: null,
    rootMargin: "10px",
    threshold: 0,
};

let observer = new IntersectionObserver(handlerPagination, options);


async function handlerPagination(entries, observer) {
  for (let entry of entries) {
   if(entry.isIntersecting){
  try {
    Loading.circle()
    page +=1;

    const { hits, totalHits } = await fetchImages(searchValue, page);
    galleryEl.insertAdjacentHTML('beforeend', createGalleryMarkup(hits));

    if (hits.length < 40){
      observer.unobserve(entry.guardJs)
    }
    lightbox.refresh();

    if (page > Math.round((totalHits / 40))) {
      setTimeout(() => {
        scrollUpBtn.hidden = false;
        Notify.warning("We're sorry, but you've reached the end of search results.");
      return;
      }, 1000);
  }
    } catch(error) {
      console.log(error);
        scrollUpBtn.hidden = false;
    Notify.warning("We're sorry, but you've reached the end of search results.");
      }
      finally {
      Loading.remove();
    }
  }
 };
}