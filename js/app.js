// ---------- DOM ----------
const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const sortSelect = document.getElementById("sortSelect");

const moviesBtn = document.getElementById("moviesBtn");
const seriesBtn = document.getElementById("seriesBtn");
const favoritesBtn = document.getElementById("favoritesBtn");

const listTitle = document.getElementById("listTitle");

const detailModal = document.getElementById("detailModal");
const modalDetail = document.getElementById("modalDetail");
const closeModal = document.getElementById("closeModal");

// ---------- STATE ----------
let movies = [];
let series = [];
let activeList = [];
let activeType = "movie";
let showOnlyFavorites = false;

// ---------- GENRE MAP ----------
const genreMap = {
  Action: "Aksiyon",
  Adventure: "Macera",
  Animation: "Animasyon",
  Biography: "Biyografi",
  Comedy: "Komedi",
  Crime: "Suç",
  Drama: "Dram",
  Fantasy: "Fantastik",
  History: "Tarih",
  Horror: "Korku",
  Mystery: "Gizem",
  Romance: "Romantik",
  "Sci-Fi": "Bilim Kurgu",
  Thriller: "Gerilim",
  War: "Savaş",
  Western: "Western"
};

// ---------- FAVORİ ----------
const getFavorites = () =>
  JSON.parse(localStorage.getItem("favorites")) || [];

const saveFavorites = favs =>
  localStorage.setItem("favorites", JSON.stringify(favs));

const isFavorite = item =>
  getFavorites().some(f => f.id === item.id && f.type === item.type);

function toggleFavorite(item) {
  let favs = getFavorites();
  const index = favs.findIndex(f => f.id === item.id && f.type === item.type);

  index > -1
    ? favs.splice(index, 1)
    : favs.push({ id: item.id, type: item.type });

  saveFavorites(favs);
  applyFilters();
}

// ---------- FETCH ----------
async function loadData() {
  movies = await fetch("data/media.json").then(r => r.json());
  series = await fetch("data/series.json").then(r => r.json());
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

  showOnlyFavorites = false;
  favoritesBtn.classList.remove("active");

  fillGenres(activeList);
  applyFilters();
}

// ---------- GENRE ----------
function fillGenres(list) {
  const genres = new Set();
  list.forEach(i => i.genre.forEach(g => genres.add(g)));

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

  if (list.length === 0) {
    movieGrid.innerHTML = `<p style="opacity:.7">Sonuç bulunamadı.</p>`;
    return;
  }

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
      <img src="${item.poster}">
      <button class="fav-btn ${isFavorite(item) ? "active" : ""}">
        ${isFavorite(item) ? "⭐" : "Favorilere ekle"}
      </button>
      <h3>${item.title}</h3>
      <p>${item.year} • ⭐ ${item.rating}</p>
    `;

    card.querySelector(".fav-btn").onclick = e => {
      e.stopPropagation();
      toggleFavorite(item);
    };

    card.onclick = () => showDetail(item);
    movieGrid.appendChild(card);
  });
}

// ---------- FİLTRE + SIRALAMA ----------
function applyFilters() {
  let list = [...activeList];

  if (showOnlyFavorites) {
    const favs = getFavorites();
    list = list.filter(i => favs.some(f => f.id === i.id && f.type === i.type));
  }

  if (searchInput.value) {
    list = list.filter(i =>
      i.title.toLowerCase().includes(searchInput.value.toLowerCase())
    );
  }

  if (genreFilter.value) {
    list = list.filter(i => i.genre.includes(genreFilter.value));
  }

  list = sortList(list);
  render(list);
}

// ---------- SIRALAMA ----------
function sortList(list) {
  const type = sortSelect.value;
  const sorted = [...list];

  switch (type) {
    case "rating-desc":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "rating-asc":
      return sorted.sort((a, b) => a.rating - b.rating);
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "year-desc":
      return sorted.sort((a, b) => b.year - a.year);
    case "year-asc":
      return sorted.sort((a, b) => a.year - b.year);
    default:
      return sorted;
  }
}

// ---------- MODAL ----------
function showDetail(item) {
  modalDetail.innerHTML = `
    <img src="${item.poster}" alt="${item.title}">
    
    <div class="detail-info">
      <h2>${item.title}</h2>

      <p><strong>Yıl:</strong> ${item.year}</p>
      <p><strong>Puan:</strong> ⭐ ${item.rating}</p>
      <p><strong>Tür:</strong> ${item.genre.map(g => genreMap[g]).join(", ")}</p>

      <!-- ✅ ÖZET -->
      <p><strong>Özet:</strong> ${item.overview}</p>

      <!-- ✅ FAVORİ -->
      <button id="detailFavBtn" class="detail-fav-btn">
        ${isFavorite(item) ? "⭐ Favorilerde" : "Favorilere ekle"}
      </button>
    </div>
  `;

  detailModal.classList.remove("hidden");

  document.getElementById("detailFavBtn").onclick = () => {
    toggleFavorite(item);
    document.getElementById("detailFavBtn").textContent =
      isFavorite(item) ? "⭐ Favorilerde" : "Favorilere ekle";
  };
}

// ---------- EVENTLER ----------
moviesBtn.onclick = () => setActive("movie");
seriesBtn.onclick = () => setActive("series");

favoritesBtn.onclick = () => {
  showOnlyFavorites = !showOnlyFavorites;
  favoritesBtn.classList.toggle("active", showOnlyFavorites);
  applyFilters();
};

searchInput.oninput = applyFilters;
genreFilter.onchange = applyFilters;
sortSelect.onchange = applyFilters;

closeModal.onclick = () => detailModal.classList.add("hidden");
detailModal.onclick = e => {
  if (e.target === detailModal) detailModal.classList.add("hidden");
};
