const API_RANDOM = "https://www.themealdb.com/api/json/v1/1/random.php";
const API_SEARCH = "https://www.themealdb.com/api/json/v1/1/filter.php?i=";
const API_CATEGORY = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const API_AREA = "https://www.themealdb.com/api/json/v1/1/filter.php?a=";
const API_LOOKUP = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
const API_LIST_INGREDIENTS = "https://www.themealdb.com/api/json/v1/list.php?i=list";

const mealGrid = document.getElementById('meal-grid');
const randomBtn = document.getElementById('random-btn');
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('suggestions-box');
const modal = document.getElementById('recipe-modal');
const closeModal = document.getElementById('close-modal');
const catButtons = document.querySelectorAll('.btn-cat');
const tutorialModal = document.getElementById('tutorial-modal');
const closeTutorialBtn = document.getElementById('close-tutorial');

const favMenuBtn = document.getElementById('fav-menu-btn');
const favDropdown = document.getElementById('fav-dropdown');
const favListItems = document.getElementById('fav-list-items');
const favCountLabel = document.getElementById('fav-count');
const modalFavBtn = document.getElementById('modal-fav-btn');

const toggleFilterBtn = document.getElementById('toggle-filter');
const advancedFilters = document.getElementById('advanced-filters');

const recentLeftBtn = document.getElementById('recent-left');
const recentRightBtn = document.getElementById('recent-right');
const clearRecentBtn = document.getElementById('clear-recent');

const plannerBtn = document.getElementById("planner-btn");
const plannerPanel = document.getElementById("planner-panel");
const closePlanner = document.getElementById("close-planner");

let allIngredients = [];
let favorites = JSON.parse(localStorage.getItem('mealFavorites')) || [];
let recentMeals = JSON.parse(localStorage.getItem('recentMeals')) || [];
let mealPlan = JSON.parse(localStorage.getItem("mealPlan")) || {};

//  THEMES 
const themes = ['light', 'dark', 'blue'];
let currentThemeIndex = 0;

function setThemeByIndex(index) {
    const themeName = themes[index];
    document.body.classList.remove(...themes);
    document.body.classList.add(themeName);
    localStorage.setItem('theme', themeName);
}

function cycleTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    setThemeByIndex(currentThemeIndex);
}

window.onload = () => {
    updateFavUI();
    getTenRandomMeals();
    fetchIngredientsList();
    updateRecentUI();
    renderPlanner();
    loadMealOfTheDay();
    renderTopRecipes();
    
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme) {
        currentThemeIndex = themes.indexOf(savedTheme);
        setThemeByIndex(currentThemeIndex);
    }

    tutorialModal.classList.remove('hidden');
};

document.querySelector('.theme-icon').onclick = cycleTheme;

closeTutorialBtn.onclick = () => {
    tutorialModal.classList.add('hidden');
    // localStorage.setItem('tutorialShown', 'true'); // Pwede tanggalin kung gusto mo laging lumabas
};

function setLoading(s) {
    const loader = document.getElementById('loader');
    if(loader) loader.classList.toggle('hidden', !s);
}

function getDifficultyDot(meal) {
    let count = 0;
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]?.trim()) count++;
    }
    if (count >= 15) return '<span class="dot dot-hard"></span>';
    if (count >= 8) return '<span class="dot dot-medium"></span>';
    return '<span class="dot dot-easy"></span>';
}

async function fetchIngredientsList() {
    try {
        const res = await fetch(API_LIST_INGREDIENTS);
        const data = await res.json();
        allIngredients = data.meals ? data.meals.map(m => m.strIngredient) : [];
    } catch (err) { console.error(err); }
}

searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (!val) { suggestionsBox.classList.add('hidden'); return; }
    const matches = allIngredients
        .filter(ing => ing.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 8);
    
    if (matches.length > 0) {
        suggestionsBox.innerHTML = matches.map(ing => `<div class="suggestion-item">${ing}</div>`).join('');
        suggestionsBox.classList.remove('hidden');
    } else {
        suggestionsBox.classList.add('hidden');
    }
});

suggestionsBox.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggestion-item')) {
        const selected = e.target.innerText;
        searchInput.value = selected;
        suggestionsBox.classList.add('hidden');
        searchByIngredient(selected);
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-wrapper')) suggestionsBox.classList.add('hidden');
});

function savePlan() {
    localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
}

function renderPlanner() {
    document.querySelectorAll(".planner-day").forEach(day => {
        const key = day.dataset.day;
        day.innerHTML = '';

        if (mealPlan[key]) {

            // FIX OLD FORMAT object - array
            if (!Array.isArray(mealPlan[key])) {
                mealPlan[key] = [mealPlan[key]];
            }

            mealPlan[key].forEach((meal, index) => {
                const item = document.createElement("div");
                item.className = "planner-item";
                item.innerText = meal.name || "Unnamed Meal";

                item.onclick = () => {
                    mealPlan[key].splice(index, 1);

                    if (mealPlan[key].length === 0) {
                        delete mealPlan[key];
                    }

                    savePlan();
                    renderPlanner();
                };

                day.appendChild(item);
            });
        }
    });
}
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('copy-toast');
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2500);
    });
}

function toggleFavorite(id, name, thumb) {
    const index = favorites.findIndex(f => f.id === id);
    if (index > -1) { favorites.splice(index, 1); } 
    else { favorites.push({ id, name, thumb }); }
    localStorage.setItem('mealFavorites', JSON.stringify(favorites));
    updateFavUI();
    if(!modal.classList.contains('hidden')) {
        modalFavBtn.innerText = favorites.some(f => f.id === id) ? "♥️" : "🤍";
    }
}

function updateFavUI() {
    favCountLabel.innerText = favorites.length;
    if (favorites.length === 0) {
        favListItems.innerHTML = '<p style="padding: 20px; text-align: center; color: #94a3b8;">No favorites yet.</p>';
    } else {
        favListItems.innerHTML = favorites.map(f => `
            <div class="fav-item" onclick="openRecipe('${f.id}')">
                <img src="${f.thumb}" alt="${f.name}">
                <span>${f.name}</span>
                <button onclick="event.stopPropagation(); toggleFavorite('${f.id}')" style="color:red; background:none; margin-left:auto;">✕</button>
            </div>
        `).join('');
    }
}

async function getTenRandomMeals() {
    setLoading(true);
    try {
        const requests = Array.from({ length: 10 }, () => fetch(API_RANDOM).then(res => res.json()));
        const results = await Promise.all(requests);
        renderMeals(results.map(d => d.meals[0]));
    } catch (err) { setLoading(false); }
}

async function searchByIngredient(term) {
    setLoading(true);
    try {
        const res = await fetch(`${API_SEARCH}${term}`);
        const data = await res.json();
        if (!data.meals) { alert("No meals found."); setLoading(false); return; }
        renderMeals(data.meals.slice(0, 10));
    } catch (err) { setLoading(false); }
}

async function filterByCategory(cat) {
    setLoading(true);
    try {
        const res = await fetch(`${API_CATEGORY}${cat}`);
        const data = await res.json();
        renderMeals(data.meals.slice(0, 10));
    } catch (err) { setLoading(false); }
}

async function filterByArea(area) {
    setLoading(true);
    try {
        const res = await fetch(`${API_AREA}${area}`);
        const data = await res.json();
        renderMeals(data.meals.slice(0, 10));
    } catch (err) { setLoading(false); }
}

async function renderMeals(meals) {
    if(!meals) {
        alert("No results found.");
        setLoading(false);
        return;
    }

    const detailedRequests = meals.map(m =>
        fetch(`${API_LOOKUP}${m.idMeal}`).then(res => res.json())
    );

    const results = await Promise.all(detailedRequests);
    const fullMeals = results.map(r => r.meals[0]);

    mealGrid.innerHTML = fullMeals.map(meal => `
        <div class="meal-card"
             draggable="true"
             data-id="${meal.idMeal}"
             data-name="${meal.strMeal}">
             
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            
            <div class="card-content">
                <h3>${meal.strMeal}</h3>

                <button class="btn-recipe" onclick="openRecipe('${meal.idMeal}')">
                    View Recipe ${getDifficultyDot(meal)}
                </button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll(".meal-card").forEach(card => {
        card.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("mealId", card.dataset.id);
        });
    });

    setLoading(false);
}

async function openRecipe(id) {
    try {
        const res = await fetch(`${API_LOOKUP}${id}`);
        const data = await res.json();
        const meal = data.meals[0];
        
        document.getElementById('modal-image').style.backgroundImage = `url(${meal.strMealThumb})`;
        document.getElementById('modal-title').innerText = meal.strMeal;

        const isFav = favorites.some(f => f.id === id);
        modalFavBtn.innerText = isFav ? "♥️" : "🤍";
        modalFavBtn.onclick = () => toggleFavorite(meal.idMeal, meal.strMeal, meal.strMealThumb);

        let ingredientsHTML = "";
        let copyText = `List for ${meal.strMeal}:\n`;
        for(let i=1; i<=20; i++) {
            if(meal[`strIngredient${i}`]) {
                ingredientsHTML += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
                copyText += `- ${meal[`strIngredient${i}`]}\n`;
            }
        }

        document.getElementById('modal-details').innerHTML = `
            <div class="action-buttons">
                <button id="copy-btn" class="btn-copy">📋 Copy Ingredients</button>
                ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="btn-youtube">▶ Watch on YouTube</a>` : ""}
            </div>
            <h4>Ingredients</h4>
            <ul class="ingredient-list">${ingredientsHTML}</ul>
            <h4>Instructions</h4>
            <p style="white-space: pre-line;">${meal.strInstructions}</p>
        `;

        setTimeout(() => {
            const copyBtn = document.getElementById('copy-btn');
            if (copyBtn) {
                copyBtn.onclick = () => copyToClipboard(copyText);
            }
        }, 100);

        recentMeals.unshift({
            id: meal.idMeal,
            name: meal.strMeal,
            thumb: meal.strMealThumb
        });
        recentMeals = recentMeals.slice(0, 20);
        localStorage.setItem('recentMeals', JSON.stringify(recentMeals));
        updateRecentUI();
        
        trackClick(meal.idMeal, meal.strMeal, meal.strMealThumb);
        renderTopRecipes();

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error("ERROR:", error);
    }
}

function updateRecentUI() {
    const container = document.getElementById('recent-container');
    if(recentMeals.length === 0) {
        container.innerHTML = `
        <div style="
            width: 100%;
            text-align: center;
            color: gray;
            padding: 40px 0;
        ">
            No recent meals viewed yet.
        </div>
    `;
        return;
    }
    container.innerHTML = recentMeals.map(meal => `
        <div class="meal-card" onclick="openRecipe('${meal.id}')">
            <img src="${meal.thumb}" alt="${meal.name}">
            <div class="card-content">
                <h3>${meal.name}</h3>
            </div>
        </div>
    `).join('');
}

function clearRecentMeals() {
    recentMeals = [];
    localStorage.removeItem('recentMeals');
    updateRecentUI();
}

closeModal.onclick = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
};

favMenuBtn.onclick = (e) => {
    e.stopPropagation();
    favDropdown.classList.toggle('hidden');
};

window.onclick = (e) => {
    if (!e.target.closest('.fav-menu-container')) favDropdown.classList.add('hidden');
};

randomBtn.onclick = getTenRandomMeals;

searchBtn.onclick = () => {
    if(searchInput.value) searchByIngredient(searchInput.value);
};

document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("btn-cat")) return;

    const btn = e.target;

    if (btn.dataset.category) {
        filterByCategory(btn.dataset.category);
    } 
    else if (btn.dataset.country) {
        filterByArea(btn.dataset.country);
    } 
    else if (btn.dataset.mood) {
        const moodMap = {
            happy: "chicken",
            sad: "soup"
        };

        searchByIngredient(moodMap[btn.dataset.mood]);
    }
});

document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("btn-cat")) return;

    const btn = e.target;

    console.log("CLICKED:", btn.dataset);

    if (btn.dataset.category) {
        filterByCategory(btn.dataset.category);
    } 
    else if (btn.dataset.country) {
        filterByArea(btn.dataset.country);
    }
});

document.querySelectorAll(".planner-day").forEach(day => {
    day.addEventListener("dragover", (e) => {
        e.preventDefault();
        day.classList.add("dragover");
    });

    day.addEventListener("dragleave", () => {
        day.classList.remove("dragover");
    });

    day.addEventListener("drop", async (e) => {
        e.preventDefault();
        day.classList.remove("dragover");

        const key = day.dataset.day;
        const id = e.dataTransfer.getData("mealId");

        if (!id) return; // safety

        const res = await fetch(`${API_LOOKUP}${id}`);
        const data = await res.json();
        const meal = data.meals[0];

        if (!meal) return;

        let ingredients = [];

        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`]) {
                ingredients.push(meal[`strIngredient${i}`]);
            }
        }

        if (!mealPlan[key]) {
            mealPlan[key] = [];
        }

        mealPlan[key].push({
            name: meal.strMeal,
            ingredients: ingredients
        });

        savePlan();
        renderPlanner();
    });
});
// Laglag filter js
toggleFilterBtn.onclick = () => {
    advancedFilters.classList.toggle('show');

    if (advancedFilters.classList.contains('show')) {
        toggleFilterBtn.innerText = "Filter By ▲";
    } else {
        toggleFilterBtn.innerText = "Filter By ▼";
    }
};

//image carousel buttons plus yung sa clear button (on-clicks)

recentLeftBtn.onclick = () => {
    document.getElementById('recent-container').scrollBy({
        left: -300,
        behavior: 'smooth'
    });
};

recentRightBtn.onclick = () => {
    document.getElementById('recent-container').scrollBy({
        left: 300,
        behavior: 'smooth'
    });
};

clearRecentBtn.onclick = clearRecentMeals;

plannerBtn.onclick = () => {
    plannerPanel.classList.remove("hidden");
};

closePlanner.onclick = () => {
    plannerPanel.classList.add("hidden");
};