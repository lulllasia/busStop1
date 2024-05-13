const path = require('path');
const fs = require('fs');
const DATA = require('./DATA/Nosun.json');
const DATA2 = require('./DATA/NosunStop.json');
const BSDATA = require('./DATA/BSdata1.json');
const BSDATA2 = require('./DATA/BS.json');
const BSDATA3 = require('./DATA/BSdata2.json');
const BusStop = require('./DATA/BusStop.json');
//console.log(DATA);

// fs.readFile(path.join(__dirname, "temp2.csv"), "utf-8", (err, data) => {
//     const rows = data.toString().split("\n").slice(1);
//     const Data = {};
//     rows.forEach(e => {
//         const temp = e.split(",");
//         Data[temp[0]] = {
//             BSname : temp[1],
//             lat : temp[2],
//             lng : temp[3],
//             around : temp[4],
//         }
//     });
//     fs.writeFile(path.join(__dirname, "BSdata2.json"), JSON.stringify(Data), err => {
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

if(!fs.existsSync(path.join(__dirname,"DATA", "Nosun.json"))){
    fetch("http://bus.jeju.go.kr/api/searchBusRouteList.do")
    .then(res => res.json())
    .then(res => {
        //fs.writeFile(path.join(__dirname, "Nosun.json"), JSON.stringify(res), err => ERR(err))
    });
}
else if(!fs.existsSync(path.join(__dirname, "DATA",  "NosunStop.json"))) {
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
                //const enter = fs.writeFileSync(path.join(__dirname, "NosunStop.json"), JSON.stringify(RES));
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
else if( 0 || !fs.existsSync(path.join(__dirname, "DATA", 'BS.json'))){
    let temp = [];
    //Object.values(BSDATA2).map(e => e.map(E => E.STATION_ID)).forEach(e => temp = Array.from(new Set(temp.concat(e))));
    temp = Array.from(new Set(Object.keys(BSDATA2).map(e => Number(e))));
    let temp2 = [];
    temp2 = Array.from(new Set(Object.keys(BSDATA3).map(e => Number(e))));
    let temp3 = [];
    temp3 = Array.from(new Set(Object.keys(BSDATA).filter(e => BSDATA[e].address === "제주\r").map(e => Number(e.match(/\d+/)))));

    const remain = temp.filter(e => !temp2.includes(e));
    const remain2 = temp2.filter(e => !temp.includes(e));
    const remain3 = temp3.filter(e => !temp2.includes(e));
    const remain4 = temp2.filter(e => !temp3.includes(e));
    const remain5 = temp.filter(e => !temp2.includes(e) && !temp3.includes(e));
    remain.forEach(e => console.log(e));
    console.log("\n\n");
    remain2.forEach(e => {if(e == 0) console.log(e)});
    //console.log("BS.json Len :", temp.length, "\nBSdata2.json Len :", temp2.length, "\nBS - BSdata2 Len :", remain.length, "\nBsdata2 - BS Len :", remain2.length); 
    console.log("BSdata - BSdata2 :", remain4.length, "\nBSdata2 - BSdata :", remain3.length, "\nBS - BSdata - BSdata1 :", remain5.length);
    //console.log(remain5);
    remain5.map(e => BSDATA2[e.toString()][0].STATION_NM).forEach((e,i) => console.log(remain[i], e));

    let n = 0;
    let intvl = 10;

    setInterval(() => {
        temp.filter((_,i) => i < intvl+n && i >= n).forEach((e,i) => {
            console.log(e);
            fetch(`http://bus.jeju.go.kr/api/searchRouteByStationList.do?station_id=${e}`)
            .then( res => res.json())
            .then(res => console.log(res.filter(e => e.REMAIN_STATION <= 1)))
            .catch(err => console.log(err));
        })
        n += intvl % 4147;
    }, 100);

    //stationData.forEach(e => console.log(e));

}
else if(0 && !fs.existsSync(path.join(__dirname, "DATA", "BusStopArriving.json"))){
    const BS = {};
    Object.keys(BSDATA2).forEach(e => {
        console.log(e);
        BS[e] = {Route : {}};
        BS[e].stationName = BSDATA2[e][0].STATION_NM;
        BSDATA2[e].forEach(E => {
            BS[e].Route[E.ROUTE_ID] = {
                routeName : E.ROUTE_NUM,
                arriving : {}
            };
        });
        const LatLng= BSDATA["JEB"+e] !== undefined ? BSDATA["JEB"+e] : BSDATA3[e];
        console.log(LatLng);
        if(LatLng !== undefined){
            BS[e].lat = LatLng.lat;
            BS[e].lng = LatLng.lng;
        }
    });
    console.log(BS);
    
    //fs.writeFile(path.join(__dirname, "DATA", "BusStop.json"), JSON.stringify(BS), ERR);
}
else {
    const BS = {...BusStop};
    const DATE = JSON.stringify(new Date()).match(/\d+-\d+-\d+/)[0];
    console.log(DATE);
    let n = 0;
    let intvl = 29;
    Object.keys(BS).forEach(e => {
        Object.keys(BS[e].Route).forEach(E => {
            if(BS[e].Route[E].arriving[DATE] === undefined) BS[e].Route[E].arriving[DATE] = [];
            //console.log(BS[e].Route[E].arriving[DATE]);
        });
    });
    setInterval(() => {
        Object.keys(BS).filter((_,i) => i < intvl+n && i >= n).forEach((e,i) => {
            console.log(e);
            fetch(`https://bus.jeju.go.kr/api/searchArrivalInfoList.do?station_id=${e}`)
            .then( res => res.json())
            .then(res => {
                const arriving = res.filter(E => E.REMAIN_STATION <= 1 && E.PREDICT_TRAV_TM <= 3);
                console.log(arriving);
                arriving.map(e=>e.ROUTE_ID).forEach(E => {
                    let temp = BS[e].Route[E].arriving[DATE];
                    const now = new Date();
                    if(temp.length === 0 || now - temp.at(-1) > 5 * 60 * 1000) {
                        BS[e].Route[E].arriving[DATE].push(now);
                        console.log(now);
                    }
                });
            })
            .catch(err => console.log(err));
        })
        n = (n+intvl) % 4147;
        //console.log(BS);
        fs.writeFile(path.join(__dirname, "DATA", "TEMPDATA.json"), JSON.stringify(BS), ERR);
    }, 1500);
}
console.log(Object.keys(BSDATA2).length);
console.log(Object.keys(DATA2).length);
//console.log(Object.keys(DATA).map(e => DATA[e].ROUTE_ID).sort().at(-1));
//console.log(new Set(Object.keys(DATA).map(e => DATA[e].ROUTE_ID)));