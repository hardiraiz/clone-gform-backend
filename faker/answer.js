import { faker } from '@faker-js/faker';
import Answer from '../models/Answer.js';

const run = async (limit) => {
    try {
        let data = [];
        for(let i = 0; i < limit; i++) {
            data.push({
                '63725a3fbf03809930fbbd5f': faker.name.fullName(),
                '63725a44bf03809930fbbd63': faker.helpers.arrayElement(['Option 1', 'Option 2', 'Option 3']),
                '63725a43bf03809930fbbd61': faker.helpers.arrayElements(['Checkbox 1', 'Checkbox 2', 'Checkbox 3']),
                'formId': '636fdf14b6472915e32e65ff',
                'userId': '636fb440bdcc6d6e6d8c9d2f'
            });
        }
        
        // process add data and exit after finish
        const fakeData = await Answer.insertMany(data);
        if(fakeData) {
            console.log(`${limit} data berhasil ditambahkan!`);
            process.exit();
        }

    } catch (error) {
        console.log(error);
    }
}

export { run };
