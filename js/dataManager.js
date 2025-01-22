class DataManager {
    constructor() {
        this.data = null;
    }

    async loadData() {
        const response = await fetch('db.json');
        this.data = await response.json();
        return this.data;
    }

    getAdditionalInfo(dish) {
        const info = this.data.additional[dish] || {};
        return {
            image: info.image || '',
            description: info.description || '',
            wikipedia_url: info.wikipedia_url || '',
            rating: info.rating || '',
            is_favorite: info.is_favorite || false
        };
    }

    calculateOccurrence(dish) {
        const totalEntries = Object.keys(this.data.entries).length;
        if (totalEntries === 0) return 0;

        const occurrences = Object.values(this.data.entries)
            .filter(entry => entry.split(';').map(d => d.trim()).includes(dish))
            .length;

        return (occurrences / totalEntries) * 100;
    }

    getMonthlyStats(dish) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        // Get entries for current month
        const currentMonthEntries = Object.entries(this.data.entries).filter(([date]) => {
            const [year, month] = date.split('-').map(Number);
            return year === currentYear && month === currentMonth;
        });

        // Get entries for last month
        const lastMonthEntries = Object.entries(this.data.entries).filter(([date]) => {
            const [year, month] = date.split('-').map(Number);
            return year === lastMonthYear && month === lastMonth;
        });

        // Calculate occurrences
        const currentMonthOccurrences = currentMonthEntries.filter(([, dishes]) => 
            dishes.split(';').map(d => d.trim()).includes(dish)
        ).length;

        const lastMonthOccurrences = lastMonthEntries.filter(([, dishes]) => 
            dishes.split(';').map(d => d.trim()).includes(dish)
        ).length;

        // Calculate percentages
        const currentMonthPercentage = currentMonthEntries.length > 0 
            ? (currentMonthOccurrences / currentMonthEntries.length) * 100 
            : 0;

        const lastMonthPercentage = lastMonthEntries.length > 0 
            ? (lastMonthOccurrences / lastMonthEntries.length) * 100 
            : 0;

        // Calculate trend
        const trend = currentMonthPercentage - lastMonthPercentage;

        return {
            occurrences: currentMonthOccurrences,
            percentage: currentMonthPercentage,
            trend: trend
        };
    }

    getEntryMonthStats(dish, date) {
        const [year, month] = date.split('-').map(Number);
        
        // Get entries for the specific month
        const monthEntries = Object.entries(this.data.entries).filter(([entryDate]) => {
            const [entryYear, entryMonth] = entryDate.split('-').map(Number);
            return entryYear === year && entryMonth === month;
        });

        // Calculate occurrences
        const monthOccurrences = monthEntries.filter(([, dishes]) => 
            dishes.split(';').map(d => d.trim()).includes(dish)
        ).length;

        // Calculate percentage
        const monthPercentage = monthEntries.length > 0 
            ? (monthOccurrences / monthEntries.length) * 100 
            : 0;

        return {
            occurrences: monthOccurrences,
            percentage: monthPercentage,
            year,
            month
        };
    }

    getMostCommonDish() {
        const dishCounts = {};
        Object.values(this.data.entries).forEach(entry => {
            entry.split(';').map(d => d.trim()).forEach(dish => {
                dishCounts[dish] = (dishCounts[dish] || 0) + 1;
            });
        });

        return Object.entries(dishCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
    }

    getAllDishes() {
        const dishes = new Set();
        Object.values(this.data.entries).forEach(entry => {
            entry.split(';').map(d => d.trim()).forEach(dish => dishes.add(dish));
        });
        return Array.from(dishes);
    }
}