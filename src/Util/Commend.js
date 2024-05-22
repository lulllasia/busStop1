import BusStop from '../Data/TEMPDATA1.json';
import Nosun from '../Data/NosunStop.json';

const date = "2024-05-19";


// 정류장의 모든 노선에 대하여,
// 시작정류장 -> 도착정류장 있는지 탐색

// 없다면 모든 노선에 대하여,
// 시작정류장 이후의 모든 정류장에 대해서 위를 실행 

// api로 버스 고유번호로 버스 식별 후 도착시간 산출


const findRet = (st, end, nowTime, depth, ret) => {
    if(depth > 0) {
        Object.keys(st.Route.filter(e => st[e].arriving[date].some(e => e <= nowTime+delay*60*1000 && e >= nowTime)).filter(e => {}))
    }

    Object.keys(st.Route).filter(e => st[e].arriving[date].some(e => e <= nowTime+delay*60*1000 && e >= nowTime)).forEach(e => {
        if(depth > 0){
            Nosun[e].map(e => e.STATION_ID).forEach(e => {
                findRet(e, end, nowTime, depth-1, ret);
            })
        }
        else {
            const St = Nosun[e].find(e=> e.STATION_ID===st), End = Nosun[e].find(e=> e.STATION_ID===end);
            St && End && St.STATION_ORD < St.STATION_ORD && ret.push(e);
        }
    });
}

export default function Commend(st, end, nowTime){
    const stPoint = BusStop[st];
    const endPoint = BusStop[end];
    const ret = [];
    let delay = 10;
    Object.keys(stPoint.Route).filter(e => stPoint[e].arriving[date].some(e => e <= nowTime+delay*60*1000 && e >= nowTime)).filter(e => {
        const n = Nosun[e].findIndex(e => e.STATION_ID === st);
        const m = Nosun[e].findIndex(e => e.STATION_ID === end);
        
        if(n && m){
            ret.push(e);
        }
    });
    if(ret.length) {
        let depth = 1;

    }
}