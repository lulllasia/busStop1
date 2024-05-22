import React, {useEffect, useState, useContext, useCallback, useRef} from "react";
import { useNavigate, Link } from "react-router-dom";
import '../App.css';
import Context from '../context/Context.js';
import {Modal, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import TEMPDATA from '../Data/TEMPDATA1.json';

export default function Navbar() {
    const inputStartRef = useRef(null);
    const inputEndRef = useRef(null);
    const { callModal, setCallModal, startingPoint, setStartingPoint, endPoint, setEndPoint } = useContext(Context);
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
        else if(!(Object.values(TEMPDATA).filter(e => tempPoints.start === e.stationName).length && Object.values(TEMPDATA).filter(e => tempPoints.end === e.stationName).length)) {
            console.log("Invalid Station is included");
            console.log("start :", Object.values(TEMPDATA).filter(e => tempPoints.start === e.stationName));
            console.log("end :", Object.values(TEMPDATA).filter(e => tempPoints.end === e.stationName))
            inputStartRef.current.value = "";
            inputEndRef.current.value = "";
            setTempPoints(() => {return{}});
        }
        else {
            console.log("Success", Object.values(TEMPDATA).filter(e => tempPoints.end === e.stationName));
            console.log(Object.values(TEMPDATA).filter(e => tempPoints.start === e.stationName).length && Object.values(TEMPDATA).filter(e => tempPoints.end === e.stationName).length);
            const temp = Object.keys(TEMPDATA).filter(e => Object.values(tempPoints).includes(TEMPDATA[e].stationName));
            const start = temp.filter(e => TEMPDATA[e].stationName === tempPoints.start)[0];
            const end = temp.filter(e => TEMPDATA[e].stationName === tempPoints.end)[0];
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
        //console.log(tempPoints, Object.keys(TEMPDATA).filter(e => Object.values(tempPoints).includes(TEMPDATA[e].stationName)));
    }, [tempPoints])

    useEffect(() =>{
       document.addEventListener('keydown', handler);
       return () => {document.removeEventListener('keydown', handler);};
    }, []);

    return <nav className="navbar" >
        <div className="navlist" onClick={CallModal}>
            CallBack
        </div>
        <div className="navlist">
            {startingPoint}
        </div>

        <div className="navlist">
            {endPoint}
        </div>

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