const express = require("express");
const cors = require('cors');
const app  = express();
const {CommendList_by_Data, CommendList_by_API, GetShortestRoute} = require("./Util/Commend.js");
const fs = require("fs");
const path = require('path');

app.use(cors());

app.get("/getRoutebyAPI", (req, res) => {
    try{
        const start = req.query.start; 
        const end = req.query.end;
        const delay = req.query.delay
        CommendList_by_API(Number(start), Number(end), 2, delay ? Number(delay) : 10)
        .then(async ret => {
            const k = GetShortestRoute(ret.ret);
            console.log(k);
            if(!k.station.length){
                res.json({...ret, station : [], endTime : 1<<15});
                return;
            }
            const endTime = k.station.at(-1);
            const p = k.route.slice(0, k.route.length-1);
            for(let i = 0; i<p.length; i++) {
                await fetch(`https://bus.jeju.go.kr/api/searchBusRouteStationList.do?route_id=${p[i]}`)
                .then(res => res.json())
                .then(res => {
                    p[i] = res[0].ROUTE_NUM;
                })
                .catch(err => {
                    console.log(err);
                })
            }
            fs.writeFile(path.join(__dirname, "temp.json"), JSON.stringify(ret), (err) => {if(err) console.log(err); else console.log("success")})
            console.log("RET :", ret);
            res.json({...ret, station : k.station.slice(0, k.station.length-1), route : p, endTime : endTime})
            console.log(endTime);
        });
    }
    catch(e){
        console.log(e);
        res.json(e);
    }
})

app.get("/getRoutebyData", (req, res) => {
    try{
        const start = req.query.start; 
        const end = req.query.end;
        const delay = req.query.delay
        const depth = req.query.depth;
        CommendList_by_Data(Number(start), Number(end), new Date(), depth ? Number(depth) : 1, delay ? Number(delay) : 10).then(ret => {
            console.log(ret);
            res.json({...ret, ...GetShortestRoute(ret.ret)})
        })
        .catch(e => {
            console.log(e);
        })
    }
    catch(e){
        console.log("ERR :",e);
        res.json(e);
    }
})

app.listen(8080, () => {
    console.log("Server is Listening");
});