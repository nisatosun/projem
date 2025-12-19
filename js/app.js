// ---------- DOM ----------
const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");

const moviesBtn = document.getElementById("moviesBtn");
const seriesBtn = document.getElementById("seriesBtn");

const listSection = document.getElementById("listSection");
const detailSection = document.getElementById("detailSection");
const movieDetail = document.getElementById("movieDetail");
const backBtn = document.getElementById("backBtn");
const listTitle = document.getElementById("listTitle");

const detailModal = document.getElementById("detailModal");
const modalDetail = document.getElementById("modalDetail");
const closeModal = document.getElementById("closeModal");

const favoritesBtn = document.getElementById("favoritesBtn");

// ---------- STATE ----------
let movies = [];
let series = [];
let activeList = [];
let activeType = "movie";
let showOnlyFavorites = false;

// ---------- GENRE MAP ----------
const genreMap = {
  "Action": "Aksiyon",
  "Adventure": "Macera",
  "Animation": "Animasyon",
  "Biography": "Biyografi",
  "Comedy": "Komedi",
  "Crime": "Suç",
  "Drama": "Dram",
  "Fantasy": "Fantastik",
  "History": "Tarih",
  "Horror": "Korku",
  "Mystery": "Gizem",
  "Romance": "Romantik",
  "Sci-Fi": "Bilim Kurgu",
  "Thriller": "Gerilim",
  "War": "Savaş",
  "Western": "Western"
};

// ---------- FAVORİ ----------
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function isFavorite(item) {
  return getFavorites().some(f => f.id === item.id && f.type === item.type);
}

function toggleFavorite(item) {
  let favs = getFavorites();
  const index = favs.findIndex(f => f.id === item.id && f.type === item.type);

  if (index > -1) {
    favs.splice(index, 1);
  } else {
    favs.push({ id: item.id, type: item.type });
  }

  saveFavorites(favs);
  render(activeList);
}

// ---------- FETCH ----------
async function loadData() {
  const movieRes = await fetch("data/media.json");
  movies = await movieRes.json();

  const seriesRes = await fetch("data/series.json");
  series = await seriesRes.json();

  setActive("movie");
}

loadData();

// ---------- AKTİF ----------
function setActive(type) {
    activeType = type;
    activeList = type === "movie" ? movies : series;
  
    moviesBtn.classList.toggle("active", type === "movie");
    seriesBtn.classList.toggle("active", type === "series");
  
    listTitle.textContent = type === "movie" ? "Filmler" : "Diziler";
  
    fillGenres(activeList);
    applyFilters(); // render yerine
  }  

// ---------- GENRE ----------
function fillGenres(list) {
  const genres = new Set();

  list.forEach(item => item.genre.forEach(g => genres.add(g)));

  genreFilter.innerHTML = `<option value="">Tüm Türler</option>`;

  genres.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = genreMap[g] || g;
    genreFilter.appendChild(opt);
  });
}

// ---------- RENDER ----------
function render(list) {
  movieGrid.innerHTML = "";

  list.forEach(item => {
    const fav = isFavorite(item);

    const card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
      <img src="${item.poster}" alt="${item.title}">
      <button class="fav-btn ${fav ? "active" : ""}">
        ${fav ? "⭐" : "☆"}
      </button>
      <h3>${item.title}</h3>
      <p>${item.year} • ⭐ ${item.rating}</p>
    `;

    card.addEventListener("click", () => showDetail(item));

    card.querySelector(".fav-btn").addEventListener("click", e => {
      e.stopPropagation();
      toggleFavorite(item);
    });

    movieGrid.appendChild(card);
  });
}

// ---------- FİLTRE ----------
function applyFilters() {
    const searchText = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;
  
    let list = activeList;
  
    if (showOnlyFavorites) {
      list = getFavoriteItems(list);
    }
  
    let filtered = list.filter(item =>
      item.title.toLowerCase().includes(searchText)
    );
  
    if (selectedGenre) {
      filtered = filtered.filter(item =>
        item.genre.includes(selectedGenre)
      );
    }
  
    render(filtered);
  }  

// ---------- DETAY ----------
function showDetail(item) {
    modalDetail.innerHTML = `
      <img src="${item.poster}" alt="${item.title}">
      <div class="detail-info">
        <h2>${item.title}</h2>
        <p><strong>Yıl:</strong> ${item.year}</p>
        <p><strong>Puan:</strong> ⭐ ${item.rating}</p>
        <p><strong>Tür:</strong> ${item.genre.map(g => genreMap[g] || g).join(", ")}</p>
      </div>
    `;
  
    detailModal.classList.remove("hidden");
  }  

  function getFavoriteItems(list) {
    const favs = getFavorites();
    return list.filter(item =>
      favs.some(f => f.id === item.id && f.type === item.type)
    );
  }  

// ---------- EVENTLER ----------
moviesBtn.addEventListener("click", () => setActive("movie"));
seriesBtn.addEventListener("click", () => setActive("series"));
searchInput.addEventListener("input", applyFilters);
genreFilter.addEventListener("change", applyFilters);

backBtn.addEventListener("click", () => {
  detailSection.classList.add("hidden");
  listSection.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
    detailModal.classList.add("hidden");
  });
  
  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) {
      detailModal.classList.add("hidden");
    }
  });
  
  favoritesBtn.addEventListener("click", () => {
    showOnlyFavorites = !showOnlyFavorites;
  
    favoritesBtn.classList.toggle("active", showOnlyFavorites);
  
    applyFilters();
  });
  