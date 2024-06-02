import React, {useEffect, useState, useContext, useCallback, useRef} from "react";
import { useNavigate, Link } from "react-router-dom";
import '../App.css';
import Context from '../context/Context.js';
import {Modal, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import Routes from '../Data/Routes.json';
import NosunStop from '../Data/NosunStop.json';

export default function Navbar() {
    const inputStartRef = useRef(null);
    const inputEndRef = useRef(null);
    const { shortest, setShortest, startingPoint, setStartingPoint, endPoint, setEndPoint } = useContext(Context);
    const [show, setShow] = useState(false);
    const [tempPoints, setTempPoints] = useState({start:'', end:''});

    const handleClose = () => setShow(!show);

    const CallModal = () => setShow(!show);

    const handler = useCallback(e => {
        //console.log(e.key, tempPoints, show);
        if(e.key === 'Control'){
            CallModal();
        }
    }, [show]);

    const getPoints = useCallback(() => {
        if(!(tempPoints.start && tempPoints.end)){
            console.log('enter the hole inputs');
        }
        else if(!(Object.values(Routes).filter(e => tempPoints.start === e.stationName).length && Object.values(Routes).filter(e => tempPoints.end === e.stationName).length)) {
            console.log("Invalid Station is included");
            console.log("start :", Object.values(Routes).filter(e => tempPoints.start === e.stationName));
            console.log("end :", Object.values(Routes).filter(e => tempPoints.end === e.stationName))
            inputStartRef.current.value = "";
            inputEndRef.current.value = "";
            setTempPoints(() => {return{}});
        }
        else {
            console.log("Success", Object.values(Routes).filter(e => tempPoints.end === e.stationName));
            console.log(Object.values(Routes).filter(e => tempPoints.start === e.stationName).length && Object.values(Routes).filter(e => tempPoints.end === e.stationName).length);
            const temp = Object.keys(Routes).filter(e => Object.values(tempPoints).includes(Routes[e].stationName));
            const start = temp.filter(e => Routes[e].stationName === tempPoints.start)[0];
            const end = temp.filter(e => Routes[e].stationName === tempPoints.end)[0];
            setStartingPoint(() => start);
            setEndPoint(() => end);
            setShow(() => false);
        }
    }, [tempPoints]);

    useEffect(() => {
        //console.log(show);
        if(inputStartRef.current !== null){
            inputStartRef.current.focus();
            inputStartRef.current.value = "";
            //console.log(inputStartRef.current.value);
        }
        
    }, [show]);

    useEffect(() => {
        //console.log(tempPoints, Object.keys(Routes).filter(e => Object.values(tempPoints).includes(Routes[e].stationName)));
    }, [tempPoints])

    useEffect(() =>{
       document.addEventListener('keydown', handler);
       return () => {document.removeEventListener('keydown', handler);};
    }, []);

    useEffect(() => {
        if(startingPoint == '' || endPoint == '') return;
        console.log("1");
        const delay = 10;
        fetch(`http://localhost:8080/getRoutebyAPI?start=${startingPoint}&end=${endPoint}&delay=15`)
        .then(res => res.json())
        .then(async res => {
            console.log(res);
            if(res.station.length > 0) {
                const k = res.route;
                const p = res.station;
                p.push(endPoint);

                setShortest(() => {
                    const temp = k.concat(p);
                    const a = [...k];
                    const b = [...p];
                    const Temp = [];
                    console.log(a,b);
                    temp.forEach((e,i) => { 
                        i % 2 == 0 ? Temp.push(Routes[b.splice(0, 1)[0]].stationName) : Temp.push(a.splice(0, 1)[0]);
                    })
                    return {Route : k, Station : p, EndTime : res.endTime, Temp : Temp};
                });
            } else {
                
            }
        })
        .catch(e => {
            console.log(e);
        })
    }, [startingPoint, endPoint]);

    return <nav className="navbar"  style={{height : shortest !== null && shortest.Station.length > 0 ? "180px" : ""}}>
        <div className="navlist" onClick={CallModal}>
            CallBack
        </div>
        {/*<div className="navlist">
            {startingPoint}
        </div>

        <div className="navlist">
            {endPoint}
</div>*/}

        {
            shortest != null && shortest.Station.length > 0 ? 
            <div className="navlist" id="temp">
                <div>{shortest.Temp.join("    ->     ")}</div>
                <div>{`예상 도착 시간 : ${shortest.EndTime}분 후`}</div>
            </div>
            :
            <></>
        }

        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header>
                <Modal.Title> 출발지 및 도착지 입력 </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className = "modalChild">
                    <label style={{display : "flex", gap : "10px"}}>
                        <div> 출발 : </div>
                        <input ref={inputStartRef} onChange={e=>setTempPoints(()=>{return{...tempPoints, start : e.target.value}})} style={{width : "80%"}} placeholder="ex : 제주버스터미널"/>
                    </label>
                    <br/>
                    <label style={{display : "flex", gap : "10px"}}>
                        <div> 도착 : </div>
                        <input ref={inputEndRef} onChange={e=>setTempPoints(()=>{return{...tempPoints, end : e.target.value}})} style={{width : "80%"}} placeholder="ex : 제주대학교"/>
                    </label>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={getPoints}> 입력 </Button>
            </Modal.Footer>
        </Modal>
    </nav>
}