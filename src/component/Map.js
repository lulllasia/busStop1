import { useEffect } from "react";
import Marker from './Marker';
const { kakao } = window;

export default function Map() {

    useEffect(()=>{
        let container = document.getElementById('map');
        let lat = 33.513424, lng = 126.508846;

        let options = {
            center: new kakao.maps.LatLng(lat, lng),
            level: 3
        };
        let map = new kakao.maps.Map(container, options);

        let mk = Marker(map, lat, lng, '');
    }, [])
    
    
    return (
        <div>
            <div id="map" style={{width:"100vw", height:"100vh"}}></div>
        </div>
    )
}