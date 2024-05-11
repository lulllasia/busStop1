const path = require('path');
const fs = require('fs');
const DATA = require('./Nosun.json');
const DATA2 = require('./NosunStop.json');
const BSDATA = require('./BSdata.json');
//console.log(DATA);

// fs.readFile(path.join(__dirname, "temp.csv"), "utf-8", (err, data) => {

//     const rows = data.toString().split("\n").slice(1);
//     const Data = {};
//     rows.forEach(e => {
//         const temp = e.split(",");
//         Data[temp[0]] = {
//             BSname : temp[1],
//             lat : temp[2],
//             lng : temp[3],
//             address : temp[8],
//         }
//     });

//     fs.writeFile(path.join(__dirname, "BSdata.json"), JSON.stringify(Data), err => {
//         if(!err) console.log("SUCCESS");
//         else console.log(err);
//     });
// })

const ERR = err => {
    if(!err) {
        console.log("SUCCESS");
    }
    else console.log(err);
}

function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
    console.log('waked up');
}


if(!fs.existsSync(path.join(__dirname, "Nosun.json"))){
    fetch("http://bus.jeju.go.kr/api/searchBusRouteList.do")
    .then(res => res.json())
    .then(res => {
        fs.writeFile(path.join(__dirname, "Nosun.json"), JSON.stringify(res), err => ERR(err))
    });
}
else if(!fs.existsSync(path.join(__dirname, "NosunStop.json"))) {
    console.log(1);
    const RES = {...DATA2};
    const Err = [];
    
    const temp = async () => {
        DATA.filter(e => DATA2[e.ROUTE_ID] === null).filter((e,i) => i<100).forEach(async (e, i) => {
            //if(i%100 === 0 && i !== 0) sleep(10000);
            //sleep(1000);
            console.log(e.ROUTE_ID, DATA2[e.ROUTE_ID] === null);
            await fetch(`http://bus.jeju.go.kr/api/searchBusRouteStationList.do?route_id=${e.ROUTE_ID}`)
            .then(res => res.json())
            .then(res => {
                //console.log(res);
                sleep(1000);
                if(DATA2[e.ROUTE_ID] === null) RES[e.ROUTE_ID] = res;
                const enter = fs.writeFileSync(path.join(__dirname, "NosunStop.json"), JSON.stringify(RES));
                console.log("None Err", "Hello World");
            })
            .catch(err => {
                RES[e.ROUTE_ID] = null;
                Err.push(0);
                console.log("get Err", err, Err.length, err);
            });
        });
    };

    temp().then(() => {
        //console.log(RES);
        //fs.writeFileSync(path.join(__dirname, "NosunStop.json"), JSON.stringify(RES));
        console.log(DATA.length);
        console.log(Object.values(DATA2).filter(e => !e).length);
    })
}
else if(!fs.existsSync(path.join(__dirname, 'BusStop.json'))){
    let temp1 = [], temp2 = [], temp3;
    Object.values(DATA2).map(e => e.map(e => {return {BSid : e.STATION_ID, BSname : e.STATION_NM, }})).forEach(e => {
        temp1 = temp1.concat(e);
    });
    Object.values(DATA2).map(e => e.map(e => {return e.STATION_ID})).forEach(e => {
        temp2 = temp2.concat(e);
    });

    temp2 = Array.from(new Set(temp2.sort((a,b) => b-a))).map(E => temp1.find(e => e.BSid === E));
    const stationData = temp2;

    let n = 0;
    let intvl = 10;

    // setInterval(() => {
    //     stationData.filter((_,i) => i < intvl+n && i >= n).forEach((e,i) => {
    //         fetch(`https://bus.jeju.go.kr/api/searchArrivalInfoList.do?station_id=${e}`)
    //         .then( res => res.json())
    //         .then(res => console.log(res.filter(e => e.REMAIN_STATION <= 1)))
    //         .catch(err => console.log(err));
    //     })
    //     n+=intvl%4147;
    // }, 100);

    //stationData.forEach(e => console.log(e));
    const Temp = Object.keys(BSDATA).filter(e => BSDATA[e].address === "제주\r");
    const TEMP = Temp.map(e => Number(e.match(/\d+/g))).sort();
    const remain = stationData.filter(e => !TEMP.includes(e.BSid));
    const remain2 = TEMP.filter(e => !stationData.map(e => e.BSid).includes(e));
    const k = remain2.map(e => BSDATA["JEB"+e]);
    //console.log(remain);
    Array.from(new Set(remain.map(e => e.BSname))).sort().forEach(e => console.log(e));
    //console.log(k);
    console.log("\n\n")
    k.sort((a,b) => (a.BSname > b.BSname) - 0.5).forEach(e => console.log(e.BSname));
    console.log("All len :", temp1.length, "Set len :", stationData.length, "BSDATA len :", TEMP.length, remain.length);
}
else {
    console.log(Object.keys(DATA2).length);
}
console.log(Object.keys(DATA2).length);
console.log(Object.keys(DATA).map(e => DATA[e].ROUTE_ID).sort().at(-1));
//console.log(new Set(Object.keys(DATA).map(e => DATA[e].ROUTE_ID)));