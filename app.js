// const amount = 12

// if (amount < 10)  {
//     console.log("Small");
// } else {
//     console.log("large");
// }

// console.log(`1st new app`);

// console.log(__dirname);
// setInterval(() => {
//     console.log("hello world")
// }, 1000);

// === MODULES ===
const name = require('./name')
const util = require('./util')
const object = require('./objects')

util.sayHi(name.name);
console.log(object.items[0])
console.log(object.singlePerson.name)