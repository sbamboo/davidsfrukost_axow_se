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