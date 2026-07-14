const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

// Đọc toàn bộ db (đồng bộ)
const readDb = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [], products: [], carts: {}, orders: [] };
    }
};

// Ghi toàn bộ db (đồng bộ)
const writeDb = (db) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
};

// Đọc dữ liệu từ file JSON (bất đồng bộ - tương thích ngược)
const readData = async (collectionName) => {
    try {
        const data = await fs.promises.readFile(DB_PATH, 'utf8');
        const parsedData = JSON.parse(data);
        return parsedData[collectionName] || [];
    } catch (error) {
        return [];
    }
};

// Ghi đè dữ liệu vào file JSON (bất đồng bộ - tương thích ngược)
const writeData = async (collectionName, dataArray) => {
    let parsedData = {};
    try {
        const data = await fs.promises.readFile(DB_PATH, 'utf8');
        parsedData = JSON.parse(data);
    } catch (error) {
        // Bỏ qua lỗi
    }

    parsedData[collectionName] = dataArray;
    await fs.promises.writeFile(DB_PATH, JSON.stringify(parsedData, null, 2), 'utf8');
};

module.exports = {
    readDb,
    writeDb,
    readData,
    writeData
};