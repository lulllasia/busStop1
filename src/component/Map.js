import { useEffect } from "react";
const { kakao } = window;

export default function Map() {

    useEffect(()=>{
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                let lat = position.coords.latitude,
                    lon = position.coords.longitude;

                let container = document.getElementById('map');

                let options = {
                    center: new kakao.maps.LatLng(lat, lon),
                    level: 3
                };

                let map = new kakao.maps.Map(container, options);

                var marker = new kakao.maps.Marker({
                    map: map, 
                    position: options.center,
                });

                var infowindow = new kakao.maps.InfoWindow({
                    content : "현위치",
                    removable : true
                });

                infowindow.open(map, marker);
            })
        }
    }, [])
    
    
    return (
        <div>
            <div id="map" style={{width:"500px", height:"400px"}}></div> 
        </div>
    )
}