let dataManager;
let ui;

async function init() {
    dataManager = new DataManager();
    await dataManager.loadData();
    
    ui = new UI(dataManager);
    
    // Show most common dish initially with current date
    const mostCommonDish = dataManager.getMostCommonDish();
    if (mostCommonDish) {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        ui.updateDashboard(mostCommonDish, formattedDate);
        document.getElementById('defaultText').style.display = 'block';
    }
    
    ui.applyFilters(dataManager.data.entries);
}

init();