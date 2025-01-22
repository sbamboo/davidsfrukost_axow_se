class UI {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.occurrenceMeter = new Meter(document.getElementById('occurrenceMeter'));
        this.ratingMeter = new Meter(document.getElementById('ratingMeter'), 10);
        this.setupEventListeners();
        this.setupDateFilters();
    }

    setupEventListeners() {
        document.getElementById('dishFilter').addEventListener('input', () => this.applyFilters());
        document.getElementById('yearFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('monthFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dayFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('favoriteFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('sortOrder').addEventListener('change', () => this.applyFilters());
    }

    setupDateFilters() {
        const years = new Set();
        const dayFilter = document.getElementById('dayFilter');
        
        // Add days to day filter
        for (let i = 1; i <= 31; i++) {
            const day = i.toString().padStart(2, '0');
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            dayFilter.appendChild(option);
        }

        // Get unique years from entries
        Object.keys(this.dataManager.data.entries).forEach(date => {
            const year = date.split('-')[0];
            years.add(year);
        });

        // Add years to year filter
        const yearFilter = document.getElementById('yearFilter');
        Array.from(years).sort().forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }

    updateDashboard(dish) {
        const info = this.dataManager.getAdditionalInfo(dish);
        const img = document.getElementById('dishImage');
        
        img.src = info.image || '/placeholder_breakfast.svg';
        img.onerror = () => {
            img.src = '/placeholder_breakfast.svg';
        };
        
        document.getElementById('dishName').textContent = dish;
        document.getElementById('dishDescription').textContent = info.description;
        
        const wikiLink = document.getElementById('wikiLink');
        if (info.wikipedia_url) {
            wikiLink.href = info.wikipedia_url;
            wikiLink.style.display = 'inline-block';
        } else {
            wikiLink.style.display = 'none';
        }

        document.getElementById('favoritestar').classList.toggle('hidden', !info.is_favorite);
        document.getElementById('defaultText').style.display = 'none';

        this.occurrenceMeter.setValue(this.dataManager.calculateOccurrence(dish));
        if (info.rating) {
            this.ratingMeter.setValue(info.rating);
        } else {
            this.ratingMeter.setSplitValue(0,"?");
        }
    }

    renderEntryList(entries) {
        const entryList = document.getElementById('entryList');
        entryList.innerHTML = '';

        Object.entries(entries).forEach(([date, dishes]) => {
            const entry = document.createElement('div');
            entry.className = 'entry theme_text';
            
            const dateSpan = document.createElement('span');
            dateSpan.textContent = date;
            
            const dishesDiv = document.createElement('div');
            dishesDiv.className = 'entry-dishes';
            
            dishes.split(';').forEach((dish, index, array) => {
                const trimmedDish = dish.trim();
                const info = this.dataManager.getAdditionalInfo(trimmedDish);
                
                const dishSpan = document.createElement('span');
                dishSpan.className = 'entry-info';
                
                const dishLink = document.createElement('span');
                dishLink.className = 'dish-link';
                dishLink.textContent = trimmedDish;
                dishLink.onclick = () => this.updateDashboard(trimmedDish);
                
                dishSpan.appendChild(dishLink);
                
                if (info.is_favorite) {
                    const star = document.createElement('span');
                    star.textContent = '★';
                    star.style.color = 'gold';
                    dishSpan.appendChild(star);
                }
                
                const rating = document.createElement('span');
                rating.className = 'rating-text';
                rating.textContent = `${info.rating || '?'}/10`;
                dishSpan.appendChild(rating);
                
                dishesDiv.appendChild(dishSpan);
                
                if (index < array.length - 1) {
                    const separator = document.createElement('span');
                    separator.textContent = ', ';
                    dishesDiv.appendChild(separator);
                }
            });
            
            entry.appendChild(dateSpan);
            entry.appendChild(dishesDiv);
            entryList.appendChild(entry);
        });
    }

    applyFilters() {
        const dishFilter = document.getElementById('dishFilter').value.toLowerCase();
        const yearFilter = document.getElementById('yearFilter').value;
        const monthFilter = document.getElementById('monthFilter').value;
        const dayFilter = document.getElementById('dayFilter').value;
        const favoriteFilter = document.getElementById('favoriteFilter').checked;
        const sortOrder = document.getElementById('sortOrder').value;

        let entries = { ...this.dataManager.data.entries };

        // Apply filters
        if (dishFilter) {
            entries = Object.fromEntries(
                Object.entries(entries).filter(([, dishes]) =>
                    dishes.toLowerCase().includes(dishFilter)
                )
            );
        }

        // Apply date filters
        if (yearFilter || monthFilter || dayFilter) {
            entries = Object.fromEntries(
                Object.entries(entries).filter(([date]) => {
                    const [year, month, day] = date.split('-');
                    return (!yearFilter || year === yearFilter) &&
                           (!monthFilter || month === monthFilter) &&
                           (!dayFilter || day === dayFilter);
                })
            );
        }

        if (favoriteFilter) {
            entries = Object.fromEntries(
                Object.entries(entries).filter(([, dishes]) =>
                    dishes.split(';').some(dish => 
                        this.dataManager.getAdditionalInfo(dish.trim()).is_favorite
                    )
                )
            );
        }

        // Apply sorting
        const sortedEntries = Object.entries(entries).sort(([dateA, dishesA], [dateB, dishesB]) => {
            switch (sortOrder) {
                case 'date-desc':
                    return dateB.localeCompare(dateA);
                case 'date-asc':
                    return dateA.localeCompare(dateB);
                case 'rating-desc':
                case 'rating-asc':
                    const ratingA = Math.max(...dishesA.split(';')
                        .map(dish => Number(this.dataManager.getAdditionalInfo(dish.trim()).rating) || '?'));
                    const ratingB = Math.max(...dishesB.split(';')
                        .map(dish => Number(this.dataManager.getAdditionalInfo(dish.trim()).rating) || '?'));
                    return sortOrder === 'rating-desc' ? ratingB - ratingA : ratingA - ratingB;
            }
        });

        this.renderEntryList(Object.fromEntries(sortedEntries));
    }
}