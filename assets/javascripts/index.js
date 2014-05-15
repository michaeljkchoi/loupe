// Changes XML to JSON
// Thank you David Walsh (http://davidwalsh.name/convert-xml-json)
function xmlToJson(xml) {
  // Create the return object
  var obj = {};
  if (xml.nodeType == 1) { // element
    // do attributes
    if (xml.attributes.length > 0) {
    obj['@attributes'] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) { // text
    obj = xml.nodeValue;
  }
  // do children
  if (xml.hasChildNodes()) {
    for(var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof(obj[nodeName]) == 'undefined') {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof(obj[nodeName].push) == 'undefined') {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

function shuffle(source) {
  // Fisher-Yates-Durstenfeld shuffle
  // http://stackoverflow.com/a/3718452/1459488
  for ( var n = 0; n < source.length - 1; n++ ) {
    var k = n + Math.floor( Math.random() * ( source.length - n ));
    var temp = source[k];
    source[k] = source[n];
    source[n] = temp;
  }
  return source
}

function tileClick(photoURL, photoID) {
  $('#lightbox').fadeIn(500);
  $('#lightbox-image').attr({
    'src': photoURL,
    'max-height': $(window).height()*0.8
  });
  var dataRequest = { method: 'flickr.photos.getInfo', 
                      api_key: '181747ad9af6cc125a5c7c034463129a',
                      photo_id: photoID
                    };
  var flickr = flickrRequest(dataRequest);
  flickr.done(function(response) {
    infoCallback(response);
  });
  flickr.fail(function(jqXHR, textStatus, errorThrown) {
    console.log('fail: '+textStatus);
  });
}

function flickrRequest(dataRequest) {
  return $.ajax({
    type: 'GET',
    url: 'http://api.flickr.com/services/rest',
    data: dataRequest
  });
}

function intCallback(successReturn) {
  jsonReturn = xmlToJson(successReturn);
  photos = shuffle(jsonReturn.rsp.photos.photo);
  photos.forEach(function(photo) {
    var photoThumbURL = 
      "http://farm" + 
      photo["@attributes"]["farm"] + ".staticflickr.com/" + 
      photo["@attributes"]["server"] + "/" + 
      photo["@attributes"]["id"] + "_" + 
      photo["@attributes"]["secret"] + "_m.jpg";
    var photoURL = 
      "http://farm" + 
      photo["@attributes"]["farm"] + ".staticflickr.com/" + 
      photo["@attributes"]["server"] + "/" + 
      photo["@attributes"]["id"] + "_" + 
      photo["@attributes"]["secret"] + "_b.jpg";

    $(".tile").first().clone().appendTo("body");
    $(".tile").last().css("background-image", "url(" + photoThumbURL + ")")
                     .attr({"data-url": photoURL,
                            "data-photo-id": photo["@attributes"].id
                           });
    $(".tile").last().fadeIn(500);
  });
  $(".tile").click(function(){
    var photoURL = $(this).data('url');
    var photoID = $(this).data('photo-id');
    tileClick(photoURL, photoID);
  });
}

function infoCallback(successReturn) {
  jsonReturn = xmlToJson(successReturn);
  var info = jsonReturn["rsp"]["photo"];
  var title = info["title"]["#text"];
  var description = info["description"]["#text"];
  var username = info["owner"]["@attributes"]["username"];
  var realname = info["owner"]["@attributes"]["realname"];
  var url = info["urls"]["url"]["#text"];
  var views = info["@attributes"]["views"];
  
  $('#title').html('').attr('href', url).html(title);
  $('#username').html('').html(username);
  $('#description').html('').html(description);
  
  $('#lightbox').fadeIn(500);

  $('#lightbox').click(function(){
    $('#lightbox').hide();
  });

  $(window).keyup(function(){
    var keypress = event.keyCode;
    if ( keypress == 27 ) {
      $('#lightbox').hide();
    }
  });
}

function perpDate() { // perpetually checks and displays the system date
  var today = new Date();
  var year = today.getFullYear();
  var date = today.getDate();

  var dayArray = new Array(7);
  dayArray[0] = "Sunday";
  dayArray[1] = "Monday";
  dayArray[2] = "Tuesday";
  dayArray[3] = "Wednesday";
  dayArray[4] = "Thursday";
  dayArray[5] = "Friday";
  dayArray[6] = "Saturday";
  var day = dayArray[today.getDay()];

  var monthArray = new Array(12);
  monthArray[0] = "January";
  monthArray[1] = "February";
  monthArray[2] = "March";
  monthArray[3] = "April";
  monthArray[4] = "May";
  monthArray[5] = "June";
  monthArray[6] = "July";
  monthArray[7] = "August";
  monthArray[8] = "September";
  monthArray[9] = "October";
  monthArray[10] = "November";
  monthArray[11] = "December";
  var month = monthArray[today.getMonth()];

  if ( month == "December" && date == 25 ) { // Merry Christmas!
    $("#date").html("Merry Christmas!");
  } else {
    $("#date").html(day + ", " + month + " " + date + ", " + year);
  };

  t = setTimeout(function() {
    perpDate()
  }, 500);

}

function perpClock() { // perpetually checks and displays the system time
  var today = new Date();
  var hour = today.getHours();
  var minute = today.getMinutes();
  var second = today.getSeconds();

  if (hour > 12) {
    hour = hour-12;
    var ap = "PM";
  } else {
    var ap = "AM";
  };

  hour = checkTime(hour);
  minute = checkTime(minute);
  second = checkTime(second);

  $("#time").html(hour + ":" + minute + ":" + second + "<span id='time-ap'> " + ap + "</span>");

  t = setTimeout(function() {
    perpClock()
  }, 500);
}

function checkTime(i) { 
  // adds "0" in front of single digit numbers (e.g. 7 => 07, 19 => 19) and changes 0 to 12.
  if ( i == 0 ) { i = 12; } 
  else if ( i < 10 ) { i = "0" + i; }
  return i;
}

function dynamicTileHeight() {
  // Sets the height of the tile equal to the width.
  // The width of the tile is goverened by Bootstrap grid.
  var tileDimension = $('.tile').first().width();
  var timeHeight = (tileDimension * 0.8);
  var dateHeight = (tileDimension * 0.2);

  $(".tile").height(tileDimension);
  $(".time-strip").css("margin-top", tileDimension);
  $("#time").height(timeHeight).css("font-size", timeHeight);
  $("#date").height(dateHeight).css("font-size", dateHeight);
}

$(document).ready(function() {
  $(".tile").first().hide();
  $('#lightbox').hide();

  dynamicTileHeight();
  perpClock();
  perpDate();
  
  var whichPage = Math.floor( ( Math.random() * 5 ) + 1 );

  var dataRequest = { method: "flickr.interestingness.getList", 
                      api_key: "181747ad9af6cc125a5c7c034463129a",
                      per_page: 96,
                      page: whichPage
                    };  
  var flickr = flickrRequest(dataRequest);

  flickr.done(function(response) {
    intCallback(response);
  });
  flickr.fail(function(jqXHR, textStatus, errorThrown) {
    console.log("fail: "+textStatus);
  });
});
