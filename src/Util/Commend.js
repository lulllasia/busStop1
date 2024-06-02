//import Route from '../Data/Routes.json';
//import BusStop from '../Data/NosunStop.json';
const Route = require("../Data/Routes.json");
const BusStop = require("../Data/NosunStop.json");


// 정류장의 모든 노선에 대하여,
// 시작정류장 -> 도착정류장 있는지 탐색

// 없다면 모든 노선에 대하여,
// 시작정류장 이후의 모든 정류장에 대해서 위를 실행 

// api로 버스 고유번호로 버스 식별 후 도착시간 산출

async function CommendList_by_Data(st, end, nowTime, maxDepth=2, delay=10, tfTime = 0){
    const ret = [];
    const date = "2024-05-28"

    const findRet = (st, end, nowTime, delay, depth, ret) => {
        Object.keys(Route[st].Route).filter(e => Route[st].Route[e].arriving[date].some(e => {
            const k = new Date(e).getHours() * 60 + new Date(e).getMinutes();
            const now = nowTime.getHours() * 60 + nowTime.getMinutes() + tfTime;
            return k <= now+delay && k >= now;
        })).forEach((e,i) => {
            if(depth > 0){
                const push = {};push[e] = {st : st, end : end, tf : [], depth : depth};

                const st_Ord = BusStop[e].find(e => e.STATION_ID === st).STATION_ORD;
                BusStop[e].filter(e => e.STATION_ORD > st_Ord).map(e => e.STATION_ID).forEach(E => {
                    findRet(E, end, nowTime, delay, depth-1, push[e].tf, nowTime.getHours() * 60 + nowTime.getMinutes() + tfTime + 5);
                });
                push[e].tf = push[e].tf.filter(E => Object.keys(E)[0] != e);
                if(push[e].tf.length > 0){
                    ret.push(push);
                }
            }
            else {
                const St = BusStop[e].find(e=> e.STATION_ID===st),
                      End = BusStop[e].find(e=> e.STATION_ID===end);
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

    const getTimes = ret => {
        ret.forEach(e => {
            const key = Object.keys(e)[0];
            if(e[key].depth > 0){
                getTimes(e[key].tf);
            }
            console.log(key, typeof key);
            e[key].arriveTimeInStStation = Object.values(stationsArrivedTime.find(E => Object.keys(E)[0] == e[key].st))[0].filter(E => E.ROUTE_ID == Number(key));
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

        console.log("OBJ :", obj);

        //console.log("Obj :",obj, tfTime);
        //console.log("Depth :", depth);
        for(let e of obj) {
            if(depth > 0){
                const push = {};
                push[e.id] = {st : st, end : end, tf : [], depth : depth};
                const st_Ord = BusStop[e.id].find(e => e.STATION_ID === st) !== undefined ? BusStop[e.id].find(e => e.STATION_ID === st).STATION_ORD : 1<<15;
                for(let E of BusStop[e.id].filter(e => e.STATION_ORD > st_Ord).map(e => e.STATION_ID)) {
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
                    St = BusStop[e.id].find(e=> e.STATION_ID===st),
                    End = BusStop[e.id].find(e=> e.STATION_ID===end);
                push[e.id] = {st : st, end : end, tf : null, depth : 0};
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
        const func = (e, ret) => {;
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
                //console.log("HEY", e, k, "\n\n");

                getTimes(e[key].tf, e[key].arriveTimeInStStation[0].VH_ID);
            }
            else {
                const  k = Object.values(stationsArrivedTime.find(E => Object.keys(E)[0] == e[key].st))[0];
                e[key].arriveTimeInStStation = k.filter(E => E.ROUTE_ID == Number(key) && (!vhid || E.PREDICT_TRAV_TM > k.find(E => E.VH_ID == vhid).PREDICT_TRAV_TM)).sort((a,b) => a.PREDICT_TRAV_TM - b.PREDICT_TRAV_TM);
                e[key].arrveTimeInEndStation = Object.values(stationsArrivedTime.find(e => Object.keys(e)[0] == end))[0].filter(E => E.VH_ID == e[key].arriveTimeInStStation[0].VH_ID);
            }
            //console.log(e[key]);
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



function GetShortestRoute(Data){
    const getShortRoute = e => {
        const getRoute = (e) => {
            const key = Object.keys(e)[0];
            if(e[key].depth == 0){
                //console.log("E :",e[key])
                return {endTime : e[key].arrveTimeInEndStation[0].PREDICT_TRAV_TM};
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
                    if(depth > 0) transform(e[i], [...keys, route_id], ret);
                    else ret.push([...keys, route_id, e[i].endTime]);
                }
            }
            transform(e, [], ret);
            return ret.sort((a,b) => a.at(-1) - b.at(-1));
        }

        const TransRoute = Transform(Route);
        //console.log("Trans :", TransRoute);
        const Shortest = TransRoute[0];
        
        let p = e.find(e => Object.values(e)[0].depth == Shortest.length - 2 && Object.keys(e)[0] == Shortest[0]);

        const ret = [];
        const func = (p) => {
            if(!p) return;
            const depth = Object.values(p)[0].depth;
            if(depth > 0){
                console.log(p, depth);
                ret.push(Object.values(p)[0].st);
                func(Object.values(p)[0].tf.find(e => Object.keys(e)[0] == Shortest[Shortest.length - 1 - depth]))
            }
            else {
                ret.push(Object.values(p)[0].st, Shortest.at(-1))
            }
        }
        func(p);
        // console.log("P :", p);
        // console.log("RET :", ret);
        
        return {route : Shortest, station : ret};
    }

    const Route = getShortRoute(Data);

    return Route;
}

export {CommendList_by_API, CommendList_by_Data, GetShortestRoute };