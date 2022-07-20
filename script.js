const KEY = 'AIzaSyB2q_o1x_gxm1oQUCVIAcdnhfUzCL7Zgto';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';

// SELECTOR
const input = document.getElementById('input');
const form = document.getElementById('form');
const slide = document.querySelector('.slider');
const cat = document.querySelector('.slider__cat');
const containerResult = document.querySelector('.container__result');
const keyword = document.querySelector('.keyword');
const listSlider = document.querySelector('.list__slider');
const listSlider2 = document.querySelector('.list__slider2');
const uncompleted = document.querySelector('uncompleted-list');
const completed = document.querySelector('completed-list');
const sectList = document.querySelector('.section__list');

const result = [];
const readingList = [];

const fetchBooks = async function (book) {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${book}&key=${KEY}`
  );
  const data = await response.json();
  // console.log(data);
  return data.items;
};

form.addEventListener('submit', e => {
  e.preventDefault();
  slide.innerHTML = '';
  const result = [];
  containerResult.removeAttribute('hidden');
  keyword.innerHTML = `Keyword result of: <strong>${input.value}</strong>`;

  const render = async () => {
    const data = await fetchBooks(input.value);
    // console.log(data);

    data.map(({ id, volumeInfo }) => {
      const {
        title,
        authors,
        imageLinks: { thumbnail },
      } = volumeInfo;

      volumeInfo.id = id;
      volumeInfo.isCompleted = false;
      result.push(volumeInfo);
      const cover = thumbnail ? thumbnail : './assets/logo.svg';

      // console.log(volumeInfo);
      const html = `
      <div class="wrapper" >
        <div class="slider__content" id=${id}>
          <div class="container__img">
            <img
              src=${cover}
              alt="buku"
              class="slider__img"
            />
          </div>
          <div class="desc__wrap">
            <div class="desc-flex">
              <p class="slider__title">${title}</p>
              <p class="slider__author">${authors ? authors[0] : 'unknown'}</p>
            </div>
            <div class="container__btn">
              <button class="slider__btn btn-list" id=${id}>Add to list</button
              ><br />
              <button class="slider__btn btn-details">Details</button>
            </div>
          </div>
        </div>
      </div>
      `;
      slide.insertAdjacentHTML('afterbegin', html);
    });
    // console.log(result);

    let slider = tns({
      container: '.slider',
      items: 4,
      loop: false,
      nav: false,
      controlsContainer: false,
      prevButton: '.ph-caret-left',
      nextButton: '.ph-caret-right',
      arrowKeys: true,
    });

    const btnList = document.querySelectorAll('.btn-list');
    btnList.forEach(btn => {
      btn.addEventListener('click', e => {
        const el = e.target.parentNode.parentNode.parentNode.id;
        result.filter(res => {
          if (el === res.id && !readingList.includes(res))
            readingList.push(res);
        });
        renderList(readingList);
        saveData();
      });
    });
  };

  render();
  input.value = '';
});

const renderList = books => {
  listSlider.innerHTML = '';
  listSlider2.innerHTML = '';
  if (readingList.length !== 0) sectList.removeAttribute('hidden');

  const iconChecked = `
  <div class="completed-wraper">
    <div class="icon-wrap checked">
      <i title="Mark as finish" class="icon checked ph-check"></i>
    </div>
    <div class="icon-wrap trash">
        <i title="Delete" class="icon ph-trash"></i>
      </div>
  </div>
  `;

  const iconCompleted = `
    <div class="completed-wraper">
      <div class="icon-wrap undo">
        <i title="Undo" class="icon undo ph-arrow-counter-clockwise"></i>
      </div>
      <div class="icon-wrap trash">
        <i title="Delete" class="icon ph-trash"></i>
      </div>
    </div>
  `;

  books.map(book => {
    const {
      id,
      title,
      imageLinks: { thumbnail },
    } = book;

    const html = `
      <div class="list__content" id=${id}>
        <div
          class="list__img"
          style="
            background: url(${thumbnail}) no-repeat top;
            background-size: cover;
          "
        >
        <div class="icon-container">
          ${!book.isCompleted ? iconChecked : iconCompleted}
        </div>
        </div>
        <div class"title-wrap">
          <p class="list__title">${title}</p>
        </div>
      </div>
      `;

    if (!book.isCompleted) {
      listSlider.insertAdjacentHTML('afterbegin', html);
    } else {
      listSlider2.insertAdjacentHTML('afterbegin', html);
    }
  });

  // Completed function
  const checked = document.querySelectorAll('.checked');
  checked.forEach(check => {
    check.addEventListener('click', e => {
      const id =
        e.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;
      const book = findBook(id);
      book.isCompleted = true;
      renderList(readingList);
      saveData();
    });
  });

  // Undo function
  const undos = document.querySelectorAll('.undo');
  undos.forEach(undo => {
    undo.addEventListener('click', e => {
      const id =
        e.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;
      const book = findBook(id);
      book.isCompleted = false;
      renderList(readingList);
      saveData();
    });
  });

  // Delete function
  const trashes = document.querySelectorAll('.trash');
  trashes.forEach(trash => {
    trash.addEventListener('click', e => {
      const id =
        e.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;
      const idx = findIdx(id);
      if (confirm('Are you sure want to delete this book?'))
        readingList.splice(idx, 1);
      renderList(readingList);
      saveData();
    });
  });
};

const findBook = id => {
  for (book of readingList) {
    if (book.id === id) {
      return book;
    }
  }
};

const findIdx = id => readingList.findIndex(book => id === book.id);

function saveData() {
  const parsed = JSON.stringify(readingList);
  localStorage.setItem(STORAGE_KEY, parsed);
  // document.dispatchEvent(new Event(SAVED_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      readingList.push(book);
    }
  }
  renderList(readingList);
}

document.addEventListener('DOMContentLoaded', () => loadDataFromStorage());
