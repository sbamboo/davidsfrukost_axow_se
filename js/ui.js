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

    updateDashboard(dish, date = null) {
        const info = this.dataManager.getAdditionalInfo(dish, date);
        const monthlyStats = this.dataManager.getMonthlyStats(dish);
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

        // Update meters and stats
        this.occurrenceMeter.setValue(this.dataManager.calculateOccurrence(dish));
        if (info.rating) {
            this.ratingMeter.setValue(info.rating, info.rating_label ? info.rating_label : null , info.rating_no_max);
        } else {
            this.ratingMeter.setSplitValue(0, "?", info.rating_label ? info.rating_label : null , info.rating_no_max);
        }

        // Update monthly stats
        const occurrenceCountEl = document.querySelector('.theme_monthly_dish_stat_occurence_count');
        const trendEl = document.querySelector('.theme_monthly_dish_stat_trend');
        const entryMonthEl = document.querySelector('.theme_monthly_dish_stat_occurence_in_own_month');

        occurrenceCountEl.textContent = `Ätit denna månad: ${monthlyStats.occurrences}st (${Math.round(monthlyStats.percentage)}%)`;

        // Update trend with colored value only
        const trendSign = monthlyStats.trend >= 0 ? '+' : '';
        const trendValue = `${trendSign}${Math.round(monthlyStats.trend)}%`;
        trendEl.innerHTML = `Trend: <span class="${monthlyStats.trend > 0 ? 'positive' : monthlyStats.trend < 0 ? 'negative' : ''}">${trendValue}</span>`;

        // Add entry month stats if a date is provided
        if (date) {
            const entryMonthStats = this.dataManager.getEntryMonthStats(dish, date);
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;

            // Only show entry month stats if it's different from the current month
            if (entryMonthStats.year !== currentYear || entryMonthStats.month !== currentMonth) {
                entryMonthEl.textContent = `Ätit månaden ${entryMonthStats.year}-${String(entryMonthStats.month).padStart(2, '0')}: ${entryMonthStats.occurrences}st (${Math.round(entryMonthStats.percentage)}%)`;
            } else {
                entryMonthEl.textContent = '';
            }
        } else {
            entryMonthEl.textContent = '';
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
                const info = this.dataManager.getAdditionalInfo(trimmedDish, date);
                
                const dishSpan = document.createElement('span');
                dishSpan.className = 'entry-info';
                
                const dishLink = document.createElement('span');
                dishLink.className = 'dish-link';
                dishLink.textContent = trimmedDish;
                dishLink.onclick = () => this.updateDashboard(trimmedDish, date);
                
                dishSpan.appendChild(dishLink);
                
                if (info.is_favorite) {
                    const star = document.createElement('span');
                    star.textContent = '★';
                    star.style.color = 'gold';
                    dishSpan.appendChild(star);
                }
                
                const rating = document.createElement('span');
                rating.className = 'rating-text';
                if (info.rating_label) {
                    rating.textContent = `${info.rating_label == "$e" ? '' : info.rating_label}`;
                } else {
                    rating.textContent = `${info.rating ? info.rating : '?'}`;
                }
                if (info.rating_no_max && info.rating_no_max == true ) {} else {
                    rating.textContent += "/10";
                }
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
        const sortOrder = document.getElementById('sortOrder').value ?? 'date-desc';

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
                Object.entries(entries).filter(([date, dishes]) =>
                    dishes.split(';').some(dish => 
                        this.dataManager.getAdditionalInfo(dish.trim(),date).is_favorite
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
                        .map(dish => Number(this.dataManager.getAdditionalInfo(dish.trim(),dateA).rating) || 0));
                    const ratingB = Math.max(...dishesB.split(';')
                        .map(dish => Number(this.dataManager.getAdditionalInfo(dish.trim(),dateB).rating) || 0));
                    return sortOrder === 'rating-desc' ? ratingB - ratingA : ratingA - ratingB;
            }
        });

        this.renderEntryList(Object.fromEntries(sortedEntries));
    }
}