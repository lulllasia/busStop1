const { kakao } = window;

const Marker = (map, lat, lng, msg, init = false) => {
    var iwContent = `<div class="iwMsg">${msg}</div>`
    var iwPosition = new kakao.maps.LatLng(lat, lng); //인포윈도우 표시 위치입니다

    var infowindow = new kakao.maps.InfoWindow({
        position : iwPosition, 
        content : iwContent 
    });
    

    var marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(lat, lng)
    });
    init && marker.setMap(null);
    marker.setMap(map);
    infowindow.open(map, marker);
    return marker;
}

export default Marker;