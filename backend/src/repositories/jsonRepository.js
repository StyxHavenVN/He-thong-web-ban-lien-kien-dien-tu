const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

// Đọc dữ liệu từ file JSON
const readData = async (collectionName) => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        const parsedData = JSON.parse(data);
        return parsedData[collectionName] || [];
    } catch (error) {
        // Nếu file chưa có dữ liệu, trả về mảng rỗng
        return [];
    }
};

// Ghi đè dữ liệu vào file JSON
const writeData = async (collectionName, dataArray) => {
    let parsedData = {};
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        parsedData = JSON.parse(data);
    } catch (error) {
        // Bỏ qua lỗi nếu file chưa tồn tại
    }

    parsedData[collectionName] = dataArray;
    await fs.writeFile(DB_PATH, JSON.stringify(parsedData, null, 2), 'utf8');
};

module.exports = {
    readData,
    writeData
};