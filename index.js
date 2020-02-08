const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const axios = require('axios');
const cheerio = require('cheerio');

const csvWriter = createCsvWriter({
    path: './csv/out.csv',
    header: [
        { id: 'title', title: 'Title' },
        { id: 'link', title: 'Link' },
        { id: 'star', title: 'Star' },
    ],
});

const records = [];

fs.createReadStream('./csv/data.csv')
    .pipe(csv())
    .on('data', (row) => {
        records.push({
            title: row.Title,
            link: row.Link,
            star: '',
        });
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        crawler(records);
    });

const crawler = async (records) => {
    await Promise.all(
        records.map(async (record) => {
            const response = await axios.get(record.link);

            if (response.status === 200) {
                const html = response.data;
                const $ = cheerio.load(html);
                const text = $('.score.score_left .star_score').text();
                console.log(`${record.title.trim()}의 평점: ${text.trim()}`);
                record['star'] = text.trim();
            }
        }),
    );
    csvWriter
        .writeRecords(records)
        .then(() => console.log('The CSV file was written successfully'))
        .catch(() => console.log('write error'));
};
