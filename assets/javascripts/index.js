// Changes XML to JSON
// Thank you David Walsh (http://davidwalsh.name/convert-xml-json)
function xmlToJson(xml) {
  // Create the return object
  var obj = {};
  if (xml.nodeType == 1) { // element
    // do attributes
    if (xml.attributes.length > 0) {
    obj["@attributes"] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
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
      if (typeof(obj[nodeName]) == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof(obj[nodeName].push) == "undefined") {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
};

function tileClick(photoURL, photoID) {
  $("#lightbox-bg").fadeIn(500);
  $("body").append("<div class=lightbox/>");
  $(".lightbox").html($("#lightbox-template").html());
  $(".image-panel").attr("src", photoURL);
  var dataRequest = { method: "flickr.photos.getInfo", 
                      api_key: "181747ad9af6cc125a5c7c034463129a",
                      photo_id: photoID
                    };
  var flickr = flickrRequest(dataRequest);
  flickr.done(function(response) {
    infoCallback(response);
  });
  flickr.fail(function(jqXHR, textStatus, errorThrown) {
    console.log("fail: "+textStatus);
  });
};

function flickrRequest(dataRequest) {
  return $.ajax({
    type: "GET",
    url: "http://api.flickr.com/services/rest",
    data: dataRequest
  });
};

function randomizeJson(json) {
  
}

function intCallback(successReturn) {
  jsonReturn = xmlToJson(successReturn);
  photos = jsonReturn.rsp.photos.photo;
  photos.forEach(function(photo) {
    var photoThumbURL = "http://farm" + 
                        photo["@attributes"]["farm"] + ".staticflickr.com/" + 
                        photo["@attributes"]["server"] + "/" + 
                        photo["@attributes"]["id"] + "_" + 
                        photo["@attributes"]["secret"] + "_m.jpg";
    var photoURL = "http://farm" + 
                   photo["@attributes"]["farm"] + ".staticflickr.com/" + 
                   photo["@attributes"]["server"] + "/" + 
                   photo["@attributes"]["id"] + "_" + 
                   photo["@attributes"]["secret"] + ".jpg";

    $(".tile").first().clone().appendTo("body");
    $(".tile").last().css("background-image", "url(" + photoThumbURL + ")")
                     .attr({"data-url": photoURL,
                            "data-photo-id": photo["@attributes"].id
                           });
    $(".tile").last().fadeIn(500);
  });
  $(".tile").click(function(){
    var photoURL = $(this).attr("data-url");
    var photoID = $(this).attr("data-photo-id");
    tileClick(photoURL, photoID);
  });
};

function infoCallback(successReturn) {
  jsonReturn = xmlToJson(successReturn);
  var info = jsonReturn["rsp"]["photo"];
  var title = info["title"]["#text"];
  var description = info["description"]["#text"];
  var username = info["owner"]["@attributes"]["username"];
  var realname = info["owner"]["@attributes"]["realname"];
  var url = info["urls"]["url"]["#text"];
  var views = info["@attributes"]["views"];
  
  $(".text-panel .title").text(title).wrapInner("<a href=" + url + ">");
  $(".text-panel .username").text(username);
  $(".text-panel .description").html(description).hide(); 
  // hides the description until the 
  // lightbox height has been calculated
  
  var lbWidth = $(".lightbox").width();
  var lbHeight = $(".lightbox").height();
  var lrMargin = ($(window).width()-lbWidth)/2; // left right margin
  var tbMargin = ($(window).height()-lbHeight)/2; // top bottom margin
  var lbMargin = tbMargin + " " + lrMargin; // lightbox shorthand css margins
  $(".lightbox").css("margin", lbMargin);

  $(".text-panel .description").show();
  $(".text-panel").height(lbHeight); // shows the description panel
  
  $(".lightbox").fadeIn(500);

  $("#lightbox-bg").click(function(){
    $("#lightbox-bg").hide();
    $(".lightbox").remove();
  });

  $(window).keyup(function(){
    var keypress = event.keyCode;
    if ( keypress == 27 ) {
      $("#lightbox-bg").hide();
      $(".lightbox").remove();
    }
  });
};

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

};

function perpClock(timeStripHeight) { // perpetually checks and displays the system time
  $("#time").css("font-size", timeStripHeight/2);
  $("#time-ap").css("font-size", timeStripHeight/3);
  
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

  $("#time").html( hour + ":" + minute + ":" + second + "<span id='time-ap'> " + ap + "</span>");

  t = setTimeout(function() {
    perpClock()
  }, 500);
};

function checkTime(i) { // adds "0" in front of single digit numbers (e.g. 7 => 07, 19 => 19) and changes 0 to 12.
  if (i == 0) {
    i = 12;
  } else if ( i < 10 ) {
    i = "0" + i;
  }
  return i;
};

$(document).ready(function() {
  var pageWidth = $(window).width();
  var pageHeight = $(window).height();
  var tileBorderWidth = 1;

  var targetTileWidth = 150;
  if ( (pageWidth/targetTileWidth) < 5 ) {
    var numCols = 10;
  } else {
    var numCols = Math.floor(pageWidth/targetTileWidth);
  }
  var tileWidth = pageWidth/numCols-2*tileBorderWidth;
  var tileHeight = tileWidth;

  if ( (pageHeight%tileHeight) == 0 ) {
    var numRows = pageHeight/tileHeight;
  } else {
    var numRows = Math.floor(pageHeight/tileHeight) + 1;
  };
  var numTiles = numCols*numRows;
  var timeStripHeight = tileHeight*2;

  $(".tile").first().hide();
  $(".tile").width(tileWidth).height(tileWidth);
  $(".time-strip").css("top", tileHeight);

  var dataRequest = { method: "flickr.interestingness.getList", 
                      api_key: "181747ad9af6cc125a5c7c034463129a", 
                      per_page: numTiles
                    };  
  var flickr = flickrRequest(dataRequest);
  flickr.done(function(response) {
    intCallback(response);
  });
  flickr.fail(function(jqXHR, textStatus, errorThrown) {
    console.log("fail: "+textStatus);
  });
  perpClock(timeStripHeight);
  perpDate(timeStripHeight);
});
