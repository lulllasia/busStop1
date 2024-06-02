import { useEffect, useContext } from "react";
import Marker from './Marker';
import Routes from '../Data/Routes.json';
import Context from '../context/Context.js';
const { kakao } = window;

export default function Map() {
    const { shortest, setShortest, startingPoint, setStartingPoint, endPoint, setEndPoint } = useContext(Context);

    useEffect(()=>{
        let lat = 33.513424, lng = 126.508846;

        let container = document.getElementById('map');

        let options = {
            center: new kakao.maps.LatLng(lat, lng),
            level: 3
        };
        let map = new kakao.maps.Map(container, options);



        console.log(shortest);
        if(shortest && shortest.Station.length > 0){
            let lats = [], lngs = [], mk = [];
            shortest.Station.forEach((e,i) => {
                console.log(e);
                console.log(Routes[e].lat)
                lats.push(Routes[e].lat);
                lngs.push(Routes[e].lng);
                mk[i] = Marker(map, lats[i], lngs[i], e.toString());
            })
            
        }

        //let mk = Marker(map, lat, lng, '');
    }, [shortest])
    
    
    return (
        <div>
            <div id="map" style={{width:"100vw", height:"100vh"}}></div>
        </div>
    )
}