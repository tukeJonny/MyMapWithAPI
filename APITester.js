var lat = 35.6581;
var lng = 139.7414;
var panoramioPlace = new Array(10);
var panoramioLat = new Array(10);
var panoramioLng = new Array(10);
var placeIndex = 0;
var markers = [];
var latTemp = 0;
var lngTemp = 0;

function addOnLoad(func) {
	try {
		window.addEventListener("load", func, false);
	} catch(e) { //IE用
		window.attachEvent("onload", func);
	}
}

addOnLoad(Main);
window.onload = readData;

function Main() {
	var latlng = new google.maps.LatLng(lat, lng);
	var myOptions = {
		zoom: 14,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	var panoramioLayer=new google.maps.panoramio.PanoramioLayer();
	panoramioLayer.setMap(map);
		
	var marker = new google.maps.Marker({
		position: latlng,
		map: map,
		title: "日本の緯度経度原点"
	});
}

function readData() {

	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	
	//通信状態が更新される度にチェック
	xmlhttp.onreadystatechange = function() {
		//通信が正常に完了したら
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			//alert('Success');
			//alert(xmlhttp.responseXML);
			createSelect(xmlhttp.responseXML);
		}
		//alert('Failed..');
	}
	//GETメソッドを用いてCountry.xmlに通信を行う
	xmlhttp.open("GET", "Country.xml", true);
	xmlhttp.send();
}

function createSelect(xml) {
	alert('get ' + xml);
	//xmlファイルの<Country>タグを参照
	var countryList = xml.getElementsByTagName("Country");
	var nameList, codeList;
	//HTMLファイルのidがxmlselectである<select>タグを参照
	var selecter = document.getElementById('xmlselect');
    for(var r = 0; r < countryList.length; r++) {
	//国名を取得
	nameList = countryList[r].getElementsByTagName("Name");
	//国コードを取得
	codeList = countryList[r].getElementsByTagName("Code");
	//optionタグを生成
	var option = document.createElement('option');
	//optionタグにvalue属性を設定し、値を国コードに設定
	option.setAttribute('value', codeList[0].firstChild.nodeValue);
	//optionタグのinnerHTMLに国名を設定
	option.innerHTML = nameList[0].firstChild.nodeValue;
	//<select>タグにoptionタグを追加
	selecter.appendChild(option);
    }
}

function getDataFromRecruit(obj) {
	var h4 = document.getElementById('h4');
	h4.innerHTML = "☆この国について、観光地をご紹介</br></br>";
	var spot = obj.results.spot;
	if (spot[0] === undefined) {
		h4.innerHTML = "申し訳ございません。観光地が登録されていないため、データ取得が出来ません。";
		return;
	}
	h4.innerHTML += "◆ 国や都市、街について</br>";
	h4.innerHTML += "-------------------------------------</br>";
	h4.innerHTML += "国名：" + spot[0].country.name + "</br>";
	h4.innerHTML += "国名コード：" + spot[0].country.code + "</br>";
	h4.innerHTML += "都市：" + spot[0].area.name + "</br>";
	h4.innerHTML += "都市コード：" + spot[0].area.code  + "</br>";
	h4.innerHTML += "街：" + spot[0].city.name + "</br>";
	h4.innerHTML += "街コード：" + spot[0].city.code + "</br>";
	h4.innerHTML += "-------------------------------------</br></br>";
	
	var latitude, longitude;
	var maxx = spot[0].lng, minx = spot[0].lng, maxy = spot[0].lat, miny = spot[0].lat;
	h4.innerHTML += "◆ 観光地について</br>";
	for(var r = 0; r < spot.length; r++) {
		if (r == 0) h4.innerHTML += "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SightseeingPlace" + (r + 1) + "</br>";
		h4.innerHTML += "タイトル：" + "~" + spot[r].title + "~</br>";
		h4.innerHTML += "観光地名：" + spot[r].name + "</br>";
		h4.innerHTML += "説明：</br>" + spot[r].description + "</br></br>";
		if(r < spot.length - 1) h4.innerHTML += "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SightseeingPlace" + (r + 2) + "</br>";
		else                    h4.innerHTML += "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~</br>";
		longitude = spot[r].lng;
		latitude = spot[r].lat;
		markers[r] = [spot[r].name, spot[r].lat, spot[r].lng];
		panoramioPlace[r] = spot[r].title;
		panoramioLng[r] = spot[r].lng;
		panoramioLat[r] = spot[r].lat;
	}
	initialize();
	callPAPI();
}

function callRAPI() {
	if (document.getElementById('coverflow') != null) {
		deleteDiv();	
	}
    var country = document.fm.xmlselect;
    var getCountry;                                                                       
    for(var r = 0 ; r < country.options.length ; r++){        
        if(country.options[r].selected){                  
           getCountry = country.options[r].value;                     
        }
    }
    
    script_element = document.createElement('script');
    script_element.setAttribute('type', "text/javascript");
    var url = "http://webservice.recruit.co.jp/ab-road/spot/v1/?country=" + getCountry + "&key=51941cd9128f0b78&format=jsonp&callback=getDataFromRecruit";
    script_element.setAttribute('src', url);
    document.getElementsByTagName('head')[0].appendChild(script_element);
}

function callPAPI() {
    var range = 1;
    for(var r = 0; r < 10; r++) {
	maxx = panoramioLng[r] + range;
	minx = panoramioLng[r] - range;
	maxy = panoramioLat[r] + range;
	miny = panoramioLat[r] - range;
	script_element = document.createElement('script');
	script_element.setAttribute('type', "text/javascript");
	var url = "http://www.panoramio.com/map/get_panoramas.php?set=public&from=0&to=5&minx=" + minx + "&miny=" + miny + "&maxx=" + maxx + "&maxy=" + maxy + "&size=medium&mapfilter=true&callback=getDataFromPanoramio";
	script_element.setAttribute('src', url);
	document.getElementsByTagName('head')[0].appendChild(script_element);
    }
}

function getDataFromPanoramio(obj) {
	var div = document.getElementById('coverflow');
	var h1 = document.createElement('h1');
	if (panoramioPlace[placeIndex] !== undefined) {
		h1.innerHTML = panoramioPlace[placeIndex] + "、近辺の写真</br>";
		placeIndex++;
		div.appendChild(h1);
		var img = new Array(obj.photos.length);
		for(var r in obj.photos){
			img[r] = document.createElement('img');
			img[r].setAttribute('src', obj.photos[r].photo_file_url);
			img[r].setAttribute('width', 400);
			img[r].setAttribute('height', 400);
		        //img[r].setAttribute('class', "item");
			
			var label = document.createElement('h4');
			var photograph = document.createElement('h5');
			var next = document.createElement('h5');
		        label.innerHTML = "title：" + obj.photos[r].photo_title + "</br>";
			photograph.innerHTML = "投稿日：" + obj.photos[r].upload_date + "</br>";
			next.innerHTML = "</br></br>";
			
		        console.log(label.innerHTML);
			div.appendChild(label);
			div.appendChild(photograph);
			
			latTemp = obj.photos[r].latitude;
			lngTemp = obj.photos[r].longitude;
			
			img[r].addEventListener('click', (function(latTemp, lngTemp){
				return function() {
					pictureMethod(latTemp, lngTemp);
				}
			})(latTemp, lngTemp), false);
			
			div.appendChild(img[r]);
		}
	}
}

function deleteDiv() {
	placeIndex = 0;
	var div = document.getElementById('coverflow');
	while(div.hasChildNodes()) {
		div.removeChild(div.lastChild);
	}
}

function pictureMethod(newLat, newLng) {
	lat = newLat;
	lng = newLng;
	alert("Please look at GoogleMap. GoogleMap's point has changed.");
	index = 0;
	Main();
}

function initialize() {
	var myOptions = {
		zoom: 50,
		center: new google.maps.LatLng(markers[0][1], markers[0][2]),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
	for (var r = 0; r < markers.length; r++) {
		var name = markers[r][0];
		var latlng = new google.maps.LatLng(markers[r][1],markers[r][2]);
		createMarker(latlng,name,map)
	}
	markers = [];
}
	
function createMarker(latlng,name,map){
	var infoWindow = new google.maps.InfoWindow();
	var marker = new google.maps.Marker({position: latlng,map: map});
	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.setContent(name);
		infoWindow.open(map,marker);  
	});
	google.maps.event.addDomListener(window, 'load', initialize);
}
	


