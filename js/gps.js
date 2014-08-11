var currentLat = 0;
var currentLong = 0;
var accuracy = 0;

var currentMarker = null;
var circle = null;
var savedMarker = null;

var savedLat = 0;
var savedLong = 0;

var map = null;

domready(function () {
  console.log("DOM Ready");
  init();
});

function init() {

  var mapholder = document.getElementById('mapholder');
  mapholder.style.height='250px';
  mapholder.style.width='250px';

  var myOptions={
    zoom:18,
    mapTypeId:google.maps.MapTypeId.ROADMAP,
    mapTypeControl:false,
    navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
  }

  map = new google.maps.Map(document.getElementById('mapholder'),myOptions);

  savedLat = getCookie("savedLat");
  savedLong = getCookie("savedLong");

  if (savedLat == "") {
    savedLat = 0;
  }

  if (savedLong == "") {
    savedLong = 0;
  }

  console.log("Saved Lat: " + savedLat + ", Saved Long: " + savedLong);

  if (savedLat != 0 && savedLong != 0) {
    console.log("Mapping saved point");
    var savedPoint = new google.maps.LatLng(savedLat, savedLong);
    savedMarker = new google.maps.Marker({
      position: savedPoint,
      map: map,
      animation: google.maps.Animation.DROP,
      zIndex: 999,
    });
  }

  getLocation();
}

/* Modified code from Daniel Vassallo, http://stackoverflow.com/questions/3305225/
      real-time-gps-tracker-on-just-html-js-and-google-maps-to-be-run-on-a-handphone */
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition);
    } else {
        alert("Error getting location, must allow location to be used.");
    }
};

function showPosition(position) {
  currentLat = position.coords.latitude;
  currentLong = position.coords.longitude;
  accuracy = position.coords.accuracy;
  //$("#coordinates").html("Latitude: " + currentLat + "<br>Longitude: " +
  //  currentLong + "<br>Accuracy: " + accuracy + "<br>SavedLat: " + savedLat +
  //  "<br>SavedLong: " + savedLong);
console.log(position);

  var newPoint = new google.maps.LatLng(currentLat, currentLong);

  var image = {
    url: 'http://i203.photobucket.com/albums/aa149/computerguy509/dot_zps254d9fec.png',
    anchor: new google.maps.Point(8, 8)
  };

  if (currentMarker) {
    // Markers already created - Move them
    currentMarker.setPosition(newPoint);
    circle.setCenter(newPoint);
    circle.setRadius(accuracy);
  }
  else {
    // Markers do not exist - Create them
    currentMarker = new google.maps.Marker({
      position: newPoint,
      map: map,
      icon: image,
      animation: google.maps.Animation.DROP,
    });

    circle = new google.maps.Circle({
      center: newPoint,
      radius: accuracy,
      map: map,
      fillColor: '#4285e1',
      fillOpacity: 0.3,
      strokeColor: '#4285e1',
      strokeOpacity: 0.5,
    });
  }

  var rotationImg = document.getElementById("rotation");
  var clearButton = document.getElementById("clear");

  var deltaX = savedLong - currentLong;
  var deltaY = savedLat - currentLat;
  var angle = Math.atan2(deltaX, deltaY) * 180 / Math.PI;

  if (savedLong == 0 || savedLat == 0 || (Math.abs(deltaY) < 0.00001 && Math.abs(deltaX < 0.00001))) {
    rotationImg.style.display = "none";
  } else {
    rotationImg.style.display = "block";

    if (position.coords.heading) {
      rotationImg.style.webkitTransform = 'rotate('+ (angle - position.coords.heading) + 'deg)';
    } else {
      rotationImg.style.webkitTransform = 'rotate(' + angle + 'deg)';
    }
  }

if (savedLong == 0 || savedLat == 0) {
  clearButton.style.display = "none";
} else {
  clearButton.style.display = "inline-block";
}

  map.setCenter(newPoint);
};

function saveLocation() {
  savedLat = currentLat;
  savedLong = currentLong;

  setCookie("savedLat", savedLat, 365);
  setCookie("savedLong", savedLong, 365);

  var savedPoint = new google.maps.LatLng(savedLat, savedLong);

  if (savedMarker) {
    savedMarker.setPosition(savedPoint);
  } else {
    savedMarker = new google.maps.Marker({
      position: savedPoint,
      map: map,
      animation: google.maps.Animation.DROP,
    });
  }

  var deltaX = savedLong - currentLong;
  var deltaY = savedLat - currentLat;
  if (Math.abs(deltaY) > 0.00001 && Math.abs(deltaX > 0.00001)) {
    var rotationImg = document.getElementById("rotation");
    rotationImg.style.display = "block";
  }

  var clearButton = document.getElementById("clear");
  clearButton.style.display = "inline-block";

  var alert = document.getElementById("savedAlert");
  alert.style.visibility = "visible";
  alert.className = "alert alert-info fade-in col-xs-10 col-xs-offset-1";

  setTimeout(function(){
    alert.className = "alert alert-info fade-out col-xs-10 col-xs-offset-1";
  },2000);

};

function clearLocation() {
  savedLat = 0;
  savedLong = 0;
  setCookie("savedLat", savedLat, 365);
  setCookie("savedLong", savedLong, 365);
  if (savedMarker) {
    savedMarker.setMap(null);
    savedMarker = null;

    var rotationImg = document.getElementById("rotation");
    rotationImg.style.display = "none";

    var clearButton = document.getElementById("clear");
    clearButton.style.display = "none";

    var alert = document.getElementById("clearedAlert");
    alert.style.visibility = "visible";
    alert.className = "alert alert-danger fade-in col-xs-10 col-xs-offset-1";

    setTimeout(function(){
    //where we can also call foo
      alert.className = "alert alert-danger fade-out col-xs-10 col-xs-offset-1";
    },2000);

  }

};


function setCookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime()+(exdays*24*60*60*1000));
  var expires = "expires="+d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires + ";";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name)==0) {
      return c.substring(name.length,c.length);
    }
  }
  return "";
}

function listCookies() {
    var theCookies = document.cookie.split(';');
    var aString = '';
    for (var i = 1 ; i <= theCookies.length; i++) {
        aString += i + ' ' + theCookies[i-1] + "\n";
    }
    return aString;
}

function deleteAllCookies() {
  var cookies = document.cookie.split(";");
  for(var i=0; i < cookies.length; i++) {
    var equals = cookies[i].indexOf("=");
    var name = equals > -1 ? cookies[i].substr(0, equals) : cookies[i];
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}