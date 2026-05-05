let clickCounts = JSON.parse(localStorage.getItem('clickCounts')) || {};

async function loadMealOfTheDay() {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('mealOfTheDay'));

    if (saved && saved.date === today) {  //alisin to pag gusto every refresh bagong recipe
        displayMealOfTheDay(saved.meal);
        return;
    }

    const res = await fetch(API_RANDOM);
    const data = await res.json();
    const meal = data.meals[0];

    localStorage.setItem('mealOfTheDay', JSON.stringify({ date: today, meal }));
    displayMealOfTheDay(meal);
}

function displayMealOfTheDay(meal) {
    let section = document.getElementById('meal-of-day');

    if (!section) {
        section = document.createElement('section');
        section.id = 'meal-of-day';
        section.className = 'meal-day-section';

        const searchNav = document.querySelector('.search-nav');
        searchNav.insertAdjacentElement('afterend', section);
    }

    section.innerHTML = `
        <h2 class="meal-day-title">Recipe of the Day</h2>
        <div class="meal-day-card" onclick="openRecipe('${meal.idMeal}')">
            <img src="${meal.strMealThumb}">
            <div class="meal-day-info">
                <h3>${meal.strMeal}</h3>
                <p>Try something new today!</p>
            </div>
        </div>
    `;
}

function trackClick(id, name, thumb) {
    if (!clickCounts[id]) {
        clickCounts[id] = { count: 0, name, thumb };
    }
    clickCounts[id].count++;
    localStorage.setItem('clickCounts', JSON.stringify(clickCounts));
}
function renderTopRecipes() {
    const entries = Object.entries(clickCounts);

    if (entries.length === 0) return;

    let section = document.getElementById('top-recipes');

    if (!section) {
        section = document.createElement('section');
        section.id = 'top-recipes';
        section.className = 'top-recipes';

        const mealDay = document.getElementById('meal-of-day');
        mealDay.insertAdjacentElement('afterend', section);
    }

    const topMeals = entries
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([id, data]) => ({
            id,
            name: data.name,
            thumb: data.thumb
        }));

    section.innerHTML = `
    <h2 class="top-title">Popular Recipes</h2>

        <div class="top-collage">
            <div class="left">
                ${topMeals.slice(0,2).map(meal => `
                    <div class="collage-item" onclick="openRecipe('${meal.id}')">
                        <img src="${meal.thumb}">
                        <div class="overlay"><span>${meal.name}</span></div>
                    </div> 
                `).join('')}
            </div>
            

            <div class="right">
                ${topMeals.slice(2,5).map(meal => `
                    <div class="collage-item" onclick="openRecipe('${meal.id}')">
                        <img src="${meal.thumb}">
                        <div class="overlay"><span>${meal.name}</span></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

