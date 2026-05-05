# Everyday Meal - Recipe Discovery & Planner

Everyday Meal is a feature-rich web application designed to help users discover new recipes, plan their weekly meals, and organize their kitchen inspiration. 
This project was developed by Manabat, Pangilinan, and Tiamzon.

## Key Features

### 1. Recipe Discovery
* **Search by Ingredient:** Real-time search with an auto-suggestion box to find recipes based on what's in your pantry.
* **Categorized Browsing:** Filter recipes by Category (Beef, Chicken, Dessert, Seafood, Veggie) or by Cuisine (Filipino, Italian, American).
* **Random Inspiration:** Use the "More Meals" button to generate a fresh set of 10 random recipes.
* **Recipe of the Day:** A curated daily recommendation to encourage culinary exploration.

### 2. Interactive Recipe View
* **Difficulty Indicators:** Recipes are tagged with Easy (green), Medium (orange), or Hard (red) dots based on the number of ingredients.
* **Full Instructions:** Detailed step-by-step guides and ingredient lists.
* **Media Integration:** Quick access to YouTube video tutorials for visual learners.
* **Clipboard Tool:** One-click button to copy the ingredient list to your clipboard.

### 3. Personalization & Planning
* **Favorites System:** Save your preferred recipes to a local favorites list for quick access.
* **Weekly Meal Planner:** A drag-and-drop enabled sidebar that allows users to assign recipes to specific days of the week.
* **Recently Viewed:** A carousel tracking your last 20 viewed recipes so you never lose a great find.
* **Popular Recipes:** A "Most Clicked" collage section that tracks and displays the community's trending meals.

### 4. User Experience
* **Theme Switching:** Support for Light, Dark, and Blue color modes.
* **Tutorial Overlay:** A built-in legend to help new users understand the recipe difficulty system.
* **Responsive Design:** A modern grid layout optimized for various screen sizes.

## Technology Stack
* **Frontend:** HTML5, CSS3, JavaScript.
* **API:** Powered by TheMealDB API.
* **Persistence:** Uses `localStorage` to save your Favorites, Theme settings, Meal Plan, and Recently Viewed history without needing a database.

## File Structure
* `index.html`: The main structural framework.
* `css/style.css`: Core layout, themes, and modal styling.
* `css/style2.css`: Specialized styling for the "Meal of the Day" and "Popular Recipes" sections.
* `javascript/script.js`: Core logic for API calls, search, favorites, and the meal planner.
* `javascript/script2.js`: Logic for tracking popular recipes and managing the daily meal feature.

## Authors
* Manabat
* Pangilinan
* Tiamzon
