const favoritesKey = "newsweb-favorites";

function getFavorites() {
return JSON.parse(localStorage.getItem(favoritesKey) || "[]");
}

function saveFavorites(favorites) {
localStorage.setItem(favoritesKey, JSON.stringify(favorites));
}

function renderNews(news, onlyFavorites = false) {
const grid = document.getElementById("news-grid");
if (!grid) return;

const favorites = getFavorites();
const visibleNews = onlyFavorites
? news.filter((item) => favorites.includes(item.id))
: news;

grid.innerHTML = visibleNews.length
? visibleNews.map((item) => `
<article class="news-card">
<img src="${item.img}" alt="${item.tag}">
<div class="news-content">
<span class="tag">${item.tag}</span>
<h3>${item.titulo}</h3>
<p>${item.resumen}</p>
<div class="card-actions">
<a href="detalle.html?id=${item.id}" class="read-more">Leer más &rarr;</a>
<button class="favorite-button ${favorites.includes(item.id) ? "is-favorite" : ""}" data-id="${item.id}" type="button" aria-label="${favorites.includes(item.id) ? "Quitar de favoritos" : "Agregar a favoritos"}">
${favorites.includes(item.id) ? "★" : "☆"}
</button>
</div>
</div>
</article>`).join(""): "<p>No tienes noticias favoritas aun.</p>";
}
async function loadNews() {
const response = await fetch("data/noticias.json");
if (!response.ok) throw new Error("No se lograron cargar las noticias");

const news = await response.json();
let onlyFavorites = false;
renderNews(news);

document.getElementById("show-favorites")?.addEventListener("click", (event) => {
onlyFavorites = !onlyFavorites;
event.currentTarget.textContent = onlyFavorites ? "★ Ver todas" : "☆ Ver favoritos";
renderNews(news, onlyFavorites);
});

document.getElementById("news-grid")?.addEventListener("click", (event) => {
const button = event.target.closest(".favorite-button");
if (!button) return;

const favorites = getFavorites();
const id = button.dataset.id;
const nextFavorites = favorites.includes(id)
? favorites.filter((favoriteId) => favoriteId !== id)
: [...favorites, id];
saveFavorites(nextFavorites);
renderNews(news, onlyFavorites);
});
} 

async function loadDetail() {
const title = document.getElementById("titulo-detalle");
if (!title) return;

const response = await fetch("data/noticias.json");
const news = await response.json();
const id = new URLSearchParams(window.location.search).get("id");
const item = news.find((article) => article.id === id) || news[0];

document.getElementById("tag-detalle").textContent = item.tag;
title.textContent = item.titulo;
document.getElementById("img-detalle").src = item.img;
document.getElementById("texto-detalle").innerHTML = `<p><strong>Últimos avances:</strong> ${item.texto}</p>`;
}

function setupContactForm() {
const form = document.getElementById("contact-form");
if (!form) return;
form.addEventListener("submit", (event) => {
event.preventDefault();
const status = document.getElementById("form-status");
if (!form.checkValidity()) {
form.reportValidity();
return;
}

status.textContent = "Mensaje enviado correctamente.";
status.className = "form-success";
form.reset();
});
}

loadNews().catch((error) => {
const grid = document.getElementById("news-grid");
if (grid) grid.innerHTML = `<p>${error.message}</p>`;
});
loadDetail().catch(() => {
const title = document.getElementById("titulo-detalle");
if (title) title.textContent = "lastimosamente no se pudo cargar la noticia.";
});setupContactForm();