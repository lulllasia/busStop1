const path = require('path');
const fs = require('fs');

fs.readFile(path.join(__dirname, "temp.csv"), "utf-8", (err, data) => {

    const rows = data.toString().split("\n").slice(1);
    const Data = {};
    rows.forEach(e => {
        const temp = e.split(",");
        Data[temp[0]] = {
            BSname : temp[1],
            lat : temp[2],
            lng : temp[3],
            address : temp[8],
        }
    });

    fs.writeFile(path.join(__dirname, "BSdata.json"), JSON.stringify(Data), err => {
        if(!err) console.log("SUCCESS");
        else console.log(err);
    });
})