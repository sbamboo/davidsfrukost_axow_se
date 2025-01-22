let dataManager;
let ui;

async function init() {
    dataManager = new DataManager();
    await dataManager.loadData();
    
    ui = new UI(dataManager);
    
    // Show most common dish initially
    const mostCommonDish = dataManager.getMostCommonDish();
    if (mostCommonDish) {
        ui.updateDashboard(mostCommonDish);
        document.getElementById('defaultText').style.display = 'block';
    }
    
    ui.renderEntryList(dataManager.data.entries);
}

init();