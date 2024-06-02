const path = require('path');
const fs = require('fs');
const DATA = require('./DATA/Nosun.json');
const DATA2 = require('./DATA/NosunStop.json');
const BSDATA = require('./DATA/BSdata1.json');
const BSDATA2 = require('./DATA/BS.json');
const BSDATA3 = require('./DATA/BSdata2.json');
const BusStop = require('./DATA/BusStop.json');
const TEMPDATA = require('./DATA/TEMPDATA.json');
const TEMPDATA2 = require('./DATA/TEMPDATA2.json');
const TEMPDATA1 = require('./DATA/TEMPDATA1.json');
const Json = require('./temp.json');
const Routes = require('./DATA/Routes.json');
const { dir } = require('console');
const { startTransition } = require('react');
//console.log(DATA);

// fs.readFile(path.join(__dirname, "DATA", "temp2.csv"), "utf-8", (err, data) => {
//     const rows = data.toString().split("\n").slice(1);
//     const Data = {};
//     rows.forEach(e => {
//         const temp = e.split(/,/);
//         //const k = temp.splice(k1, k2-k1, temp.filter((e,i) => i>=k1 && i<=k2).join(",").match(/[^\"]*/g)[0]);
//         if(temp.length > 6){
//             const k = (temp[1]+","+temp[2]).match(/[^"]*/g)[1].trim();
//             console.log(k);
//             temp.splice(1, 2, k)
//             console.log(temp);
//         }
//         Data[temp[0]] = {
//             BSname : temp[1],
//             lat : temp[3],
//             lng : temp[2],
//             around : temp[4],
//         }
//     });
//     fs.writeFile(path.join(__dirname,"DATA",  "BSdata3.json"), JSON.stringify(Data), err => {
//         if(!err) console.log("SUCCESS");
//         else console.log(err);
//     });
// })

fs.readFile(path.join(__dirname, "DATA", "BSDATA3.json"), (err, rData) => {
    const data = JSON.parse(rData.toString());
    const k = {...Routes};
    for(let i in k){
        if(Number.isNaN(Number(k[i].lat))){
            //console.log(data)
            k[i].lat = data[i].lat;
        }
    }
    fs.writeFile(path.join(__dirname, "DATA", "Routes.json"), JSON.stringify(k),ERR);
})

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
else if(0){
    const BS = {...TEMPDATA};
    let DATE = JSON.stringify(new Date()).match(/\d+-\d+-\d+/)[0];
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
        if(DATE !== JSON.stringify(new Date()).match(/\d+-\d+-\d+/)[0]){
            DATE = JSON.stringify(new Date()).match(/\d+-\d+-\d+/)[0];
            Object.keys(BS).forEach(e => {
                Object.keys(BS[e].Route).forEach(E => {
                    if(BS[e].Route[E].arriving[DATE] === undefined) BS[e].Route[E].arriving[DATE] = [];
                    //console.log(BS[e].Route[E].arriving[DATE]);
                });
            });
        }
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
                    if(temp.length === 0 || now - temp.at(-1) > 3 * 60 * 1000) {
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
    }, 2000);
}
else if(0) {
    const BS = {...TEMPDATA1};
    let count = 0;
    for(let i in BS) {
        if(Number.isNaN(Number(BS[i].lat)) || Number.isNaN(Number(BS[i].lng))){
            console.log(BS[i], ++count);
        }
    }
}
else if(0) {
   async function CommendList_by_Data(st, end, nowTime, maxDepth=2, delay=10, tfTime = 0){
        const ret = [];
        const date = "2024-05-19"

        const findRet = (st, end, nowTime, delay, depth, ret) => {
            Object.keys(TEMPDATA1[st].Route).filter(e => TEMPDATA1[st].Route[e].arriving[date].some(e => {
                const k = new Date(e).getHours() * 60 + new Date(e).getMinutes();
                const now = nowTime.getHours() * 60 + nowTime.getMinutes() + tfTime;
                return k <= now+delay && k >= now;
            })).forEach((e,i) => {
                //console.log(e);
                if(depth > 0){
                    const push = {};push[e] = {st : st, end : end, tf : [], depth : depth};

                    const st_Ord = DATA2[e].find(e => e.STATION_ID === st).STATION_ORD;
                    //const end_Ord = DATA2[e].find(e => e.STATION_ID === end).STATION_ORD;
                    //console.log(st_Ord, end_Ord, depth);
                    DATA2[e].filter(e => e.STATION_ORD > st_Ord).map(e => e.STATION_ID).forEach(E => {
                        findRet(E, end, nowTime, delay, depth-1, push[e].tf, nowTime.getHours() * 60 + nowTime.getMinutes() + tfTime + 5);
                    });
                    push[e].tf = push[e].tf.filter(E => Object.keys(E)[0] != e);
                    if(push[e].tf.length > 0){
                        ret.push(push);
                    }
                }
                else {
                    const St = DATA2[e].find(e=> e.STATION_ID===st),
                          End = DATA2[e].find(e=> e.STATION_ID===end);
                    //St && End && console.log("\n", i, e, "\n", St, End, St.STATION_ORD < End.STATION_ORD, "\n");
                    if(St && End && St.STATION_ORD < End.STATION_ORD) {
                        const push = {};
                        push[e] = {st : st, end : end, tf : null, depth : 0};
                        ret.push(push);
                    }
                }
            });
        }
    
        Array(maxDepth+1).fill(0).forEach((e,i) => {
            findRet(st, end, nowTime, delay, i, ret, i);
        })
    

        const getStations = e => {
            const ret = [];
            const func = (e, ret) => {
                if(Object.values(e)[0].depth > 0 ){
                    Object.values(e).forEach(e => e.tf.forEach(e => func(e, ret)));
                }
                ret.push(...Object.values(e).map(e => e.st));
            }
            e.forEach(e => func(e, ret));
            return ret;
        }

        const getRoutes = e => {
            const ret = [];
            const func = (e, ret) => {
                if(Object.values(e)[0].depth > 0 ){
                    Object.values(e).forEach(e => e.tf.forEach(e => func(e, ret)));
                    ret.push(...Object.keys(e));
                }
                ret.push(...Object.keys(e));
            }
            e.forEach(e => func(e, ret));
            return ret;
        }

        const Stations = Array.from(new Set(getStations(ret))).concat([end]);
        const Routes = Array.from(new Set(getRoutes(ret))).map(e => Number(e));
        const stationsArrivedTime = Array(Stations.length);

        for(let i = 0; i < Stations.length; i++){
            const temp = {};
            const k = Stations[i];
            await fetch(`https://bus.jeju.go.kr/api/searchArrivalInfoList.do?station_id=${k}`)
            .then(res => res.json())
            .then(res => {
                console.log(k, " : ", res.map(e => e.ROUTE_ID));
                temp[k] = res.filter(e => Routes.includes(e.ROUTE_ID));
                stationsArrivedTime[i] = temp;
            })
        }

        // const getTimes = ret => {
        //     ret.forEach(e => {
        //         const key = Object.keys(e)[0];
        //         if(e[key].depth > 0){
        //             getTimes(e[key].tf);
        //         }
        //         console.log(key, typeof key);
        //         e[key].arriveTimeInStStation = Object.values(stationsArrivedTime.find(E => Object.keys(E)[0] == e[key].st))[0].filter(E => E.ROUTE_ID == Number(key));
        //         console.log(e[key]);
        //     });
        //     return ret;
        // }
        const getTimes = (ret, vhid = null) => {
            ret.forEach(e => {
                const key = Object.keys(e)[0];
                if(e[key].depth > 0){
                    const  k = Object.values(stationsArrivedTime.find(E => Object.keys(E)[0] == e[key].st))[0];
                    e[key].arriveTimeInStStation = k.filter(E => 
                        E.ROUTE_ID == Number(key) && (!vhid || E.PREDICT_TRAV_TM > k.find(E => E.VH_ID == vhid).PREDICT_TRAV_TM)).sort((a,b) => a.PREDICT_TRAV_TM - b.PREDICT_TRAV_TM);
                    console.log("HEY", e, k, "\n\n");

                    getTimes(e[key].tf, e[key].arriveTimeInStStation[0].VH_ID);
                }
                else {
                    const  k = Object.values(stationsArrivedTime.find(E => Object.keys(E)[0] == e[key].st))[0];
                    e[key].arriveTimeInStStation = k.filter(E => E.ROUTE_ID == Number(key) && (!vhid || E.PREDICT_TRAV_TM > k.find(E => E.VH_ID == vhid).PREDICT_TRAV_TM)).sort((a,b) => a.PREDICT_TRAV_TM - b.PREDICT_TRAV_TM);
                    e[key].arrveTimeInEndStation = Object.values(stationsArrivedTime.find(e => Object.keys(e)[0] == end))[0].filter(E => E.VH_ID == e[key].arriveTimeInStStation[0].VH_ID);
                }
                console.log(e[key]);
            });
            return ret;
        }
        
        getTimes(ret);

        const Return = {
            ret : ret,
            endStation : Object.values(stationsArrivedTime.find(e => Object.keys(e)[0] == end))[0],
            //stationsArrivedTime : stationsArrivedTime,
        };

        return Return;
    }


    //callback함수 재귀함수 비동기 처리 동시 고려   
    async function CommendList_by_API(st, end, maxDepth=2, delay=5){
        const ret = [];
        async function findRet(st, end, delay, depth, ret, tf = false, tfTime = 0) {
            const obj = [];
            await fetch(`https://bus.jeju.go.kr/api/searchArrivalInfoList.do?station_id=${st}`)
            .then(res => res.json())
            .then(res => {
                obj.push(...res.filter(e => tfTime < e.PREDICT_TRAV_TM && e.PREDICT_TRAV_TM < delay + tfTime ).map(e => {return{id : e.ROUTE_ID, remainTime : e.PREDICT_TRAV_TM}}));
            })
            .catch(err => {
                console.log(err);
            })

            //console.log("Obj :",obj, tfTime);
            //console.log("Depth :", depth);
            for(let e of obj) {
                if(depth > 0){
                    const push = {};
                    push[e.id] = {st : st, end : end, tf : [], depth : depth};
                    const st_Ord = DATA2[e.id].find(e => e.STATION_ID === st).STATION_ORD;
                    for(let E of DATA2[e.id].filter(e => e.STATION_ORD > st_Ord).map(e => e.STATION_ID)) {
                        await findRet(E, end, delay, depth-1, push[e.id].tf, true, tfTime + e.remainTime);
                    }
                    push[e.id].tf = push[e.id].tf.filter(E => Object.keys(E)[0] != e.id);
                    if(push[e.id].tf.length > 0){
                        console.log("PUSH@ : ",push);
                        ret.push({...push});
                    }
                }
                else {
                    const push = {},
                        St = DATA2[e.id].find(e=> e.STATION_ID===st),
                        End = DATA2[e.id].find(e=> e.STATION_ID===end);
                    push[e.id] = {st : st, end : end, tf : null, depth : 0};
                    //End && console.log("Push", End, St.STATION_ORD < End.STATION_ORD);
                    if(St && End && St.STATION_ORD < End.STATION_ORD){
                        console.log("Push in depth 0 :", push[e.id], tf);
                        ret.push(push);
                    }
                }
            }

            return ret;
        }

        for(let i = 0; i<=maxDepth; i++){
            await findRet(st, end, delay, i, ret);
        }

        const getStations = e => {
            const ret = [];
            console.log("E : ",e);
            const func = (e, ret) => {
                //console.log(e);
                if(Object.values(e)[0].depth > 0 ){
                    Object.values(e).forEach(e => e.tf.forEach(e => func(e, ret)));
                }
                ret.push(...Object.values(e).map(e => e.st));
            }
            e.forEach(e => func(e, ret));
            return ret;
        }

        const getRoutes = e => {
            const ret = [];
            console.log("E : ",e);
            const func = (e, ret) => {
                if(Object.values(e)[0].depth > 0 ){
                    Object.values(e).forEach(e => e.tf.forEach(e => func(e, ret)));
                }
                ret.push(...Object.keys(e));
            }
            e.forEach(e => func(e, ret));
            return ret;
        }


        const Stations = Array.from(new Set(getStations(ret))).concat([end]);
        const Routes = Array.from(new Set(getRoutes(ret))).map(e => Number(e));
        const stationsArrivedTime = Array(Stations.length);

        for(let i = 0; i < Stations.length; i++){
            const temp = {};
            const k = Stations[i];

            await fetch(`https://bus.jeju.go.kr/api/searchArrivalInfoList.do?station_id=${k}`)
            .then(res => res.json())
            .then(res => {
                console.log(k, " : ", res.map(e => e.ROUTE_ID));
                temp[k] = res.filter(e => Routes.includes(e.ROUTE_ID));
                stationsArrivedTime[i] = temp;
            })
        }
        
        const getTimes = (ret, vhid = null) => {
            ret.forEach(e => {
                const key = Object.keys(e)[0];
                if(e[key].depth > 0){
                    const  k = Object.values(stationsArrivedTime.find(E => Object.keys(E)[0] == e[key].st))[0];
                    e[key].arriveTimeInStStation = k.filter(E => 
                        E.ROUTE_ID == Number(key) && (!vhid || E.PREDICT_TRAV_TM > k.find(E => E.VH_ID == vhid).PREDICT_TRAV_TM)).sort((a,b) => a.PREDICT_TRAV_TM - b.PREDICT_TRAV_TM);
                    console.log("HEY", e, k, "\n\n");

                    getTimes(e[key].tf, e[key].arriveTimeInStStation[0].VH_ID);
                }
                else {
                    const  k = Object.values(stationsArrivedTime.find(E => Object.keys(E)[0] == e[key].st))[0];
                    e[key].arriveTimeInStStation = k.filter(E => E.ROUTE_ID == Number(key) && (!vhid || E.PREDICT_TRAV_TM > k.find(E => E.VH_ID == vhid).PREDICT_TRAV_TM)).sort((a,b) => a.PREDICT_TRAV_TM - b.PREDICT_TRAV_TM);
                    e[key].arrveTimeInEndStation = Object.values(stationsArrivedTime.find(e => Object.keys(e)[0] == end))[0].filter(E => E.VH_ID == e[key].arriveTimeInStStation[0].VH_ID);
                }
                console.log(e[key]);
            });
            return ret;
        }
        
        getTimes(ret);

        const Return = {
            ret : ret,
            endStation : Object.values(stationsArrivedTime.find(e => Object.keys(e)[0] == end))[0],
            stationsArrivedTime : stationsArrivedTime,
        };

        return Return;
    }

    a = () => {const temp = CommendList_by_API(405000315, 405000311, 1, 10).then(res => {
        console.log("COMMEND :", res);
        fs.writeFile(path.join(__dirname, "temp.json"), JSON.stringify(res), ERR);
    })};
    b = () => {
        const temp = CommendList_by_Data(405000315, 405000311, new Date(), 1, 600).then( res => { 
            console.log(res);
            fs.writeFileSync(path.join(__dirname, "temp.json"), JSON.stringify(res));
        });
    };

    b();
}
else if(1) {
    function GetShortestRoute(Data){
        const getShortRoute = e => {
            const getRoute = (e) => {
                const key = Object.keys(e)[0];
                if(e[key].depth == 0){
                    console.log("E :",e[key])
                    return {endTime :  e[key].arrveTimeInEndStation.length > 0 ? e[key].arrveTimeInEndStation[0].PREDICT_TRAV_TM : 1<<15};
                }
                else {
                    const ret = {};
                    e[key].tf.forEach(e => ret[Object.keys(e)[0] + "/" + Object.values(e)[0].depth] = getRoute(e));
                    return ret;
                }
            };
            const Route = {};
            e.forEach(e => {
                console.log(e);
                Route[Object.keys(e)[0]+"/"+Object.values(e)[0].depth] = getRoute(e);
            });

            console.log("ROUTE : ",Route);

            const Transform = (e) => {
                const ret = [];
                const transform = (e, keys = [], ret) => {
                    for(let i in e){
                        const route_id = i.split("/")[0];
                        const depth = i.split("/")[1];

                        if(depth > 0){
                            transform(e[i], [...keys, route_id], ret);
                        }
                        else {
                            ret.push([...keys, route_id, e[i].endTime]);
                        }
                    }
                }
                transform(e, [], ret);
                return ret.sort((a,b) => a.at(-1) - b.at(-1));
            }

            const TransRoute = Transform(Route);
            console.log("Trans :", TransRoute);
            const Shortest = TransRoute[0];
            
            let p = e.find(e => Object.values(e)[0].depth == Shortest.length - 2 && Object.keys(e)[0] == Shortest[0]);

            const ret = [];
            const func = (p) => {
                if(!p) return;
                const depth = Object.values(p)[0].depth;
                if(depth > 0){
                    console.log(p, depth);
                    ret.push(Object.values(p)[0].st);
                    console.log("POP :", Object.values(p)[0].tf.find(e => Object.keys(e)[0] == Shortest[Shortest.length - 1 - depth]));
                    func(Object.values(p)[0].tf.find(e => Object.keys(e)[0] == Shortest[Shortest.length - 1 - depth]))
                }
                else {
                    ret.push(Object.values(p)[0].st, Shortest.at(-1))
                }
            }
            func(p);
            console.log("P :", p);
            console.log("RET :", ret);
            
            return {route : Shortest, station : ret};
        }

        const Route = getShortRoute(Data);

        return Route;
    }

    console.log(GetShortestRoute(Json.ret));
}
else {
    const BS = {...TEMPDATA};
    Object.keys(BS).forEach(e => {
        console.log(BS[e].Route);
        Object.keys(BS[e].Route).forEach(E => {
            Array.from(new Set(Object.keys(BS[e].Route[E].arriving).concat(Object.keys(TEMPDATA2[e].Route[E].arriving)))).sort().map(k => {
                const k1 = TEMPDATA[e].Route[E].arriving[k];
                const k2 = TEMPDATA2[e].Route[E].arriving[k];
                BS[e].Route[E].arriving[k] = (k1 !== undefined ? k1.filter(e => e.match(RegExp(k, 'g')) !== null) : [])
                                        .concat(k2 !== undefined ? k2.filter(e => e.match(RegExp(k, 'g')) !== null) : []);
            });
            console.log(e);
        });
    });
    fs.writeFile(path.join(__dirname, "DATA", "TEMPDATA1.json"), JSON.stringify(BS), ERR);
}
console.log(Object.keys(BSDATA2).length);
console.log(Object.keys(DATA2).length);