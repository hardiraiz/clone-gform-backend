import connection from "./connection.js";

connection();

const args = process.argv;

let limit = 10 // default

// check if args 3 is defined
if(args[3]) {
    limit = parseInt(args[3]); 
}

// check if limit is a integer number
if (!Number.isInteger(limit)){ 
    console.log(`limit is not a number!`);
    process.exit();
}

const fakerFile = args[2];
const faker = await import(`./faker/${fakerFile}.js`); // answer.js
faker.run(limit); // run add fake data answer 
