$(document).ready(() => {
  // for google map input
  var parkLatitude;
  var parklngtitude;
  var parkFullName = "";
  // after fetch data for specific park, store data about this park
  var parkInfoList = [];
  // list of park full name and park state code list
  var parkStates = [];
  // List of all USA state names
  var stateNames = [];
  // USA state name and state code list
  var stateNameCodePairs = [];
  // the parks list in a specific state
  var parksInState = [];
  //List of all park names
  var allParkNames = [];
  // selected park code
  var choice = "";
  // list of park full name and park code 
  var parkNameCodes = [];
  // list of photos of a specific park
  var photos = [];
  // operating hours of a specific park 
  var hoursInfo = [];
  // array with all state names and codes 
  getStateNameCode(stateNameCodePairs, stateNames);

  //fetch data for parks infomation: parks full name +parks code , parks full name+code+pictures, all park state codes names,
  fetch("https://developer.nps.gov/api/v1/parks/?limit=497&api_key=mGA5zsl3Ry9yUPRazfJodeaWx4sPUCaA8wgkclNW").
  then(response => {
    if (response.status != 200) {
      throw response.statusText;
    } else
    return response.json();
  }).
  then(data => {
    var info = data.data;
    for (let i = 0; i < info.length; i++)
    {
      let parkNameCode = { name: info[i].fullName, code: info[i].parkCode, pictures: info[i].images };
      let parkState = { name: info[i].fullName, state: info[i].states };
      parkNameCodes.push(parkNameCode);
      allParkNames.push(info[i].fullName);
      parkStates.push(parkState);

    } // append options to auto complete input box including all park names
    $.each(parkNameCodes, function (i, item) {
      $("#parkChoices").append($("<option>").attr('value', item.name).text(item.name));
    });
    // append options to auto complete input box including all state names
    $.each(stateNameCodePairs, function (i, item) {
      $("#stateChoices").append($("<option>").attr('value', item.stateName).text(item.stateName));
    });

  }).
  catch(err => {
    console.log("Error" + err);

  }); // end fetch info 

  // confirm search ways button got clicked, invoke function to check selected radio choice 
  $("#confirmWay").click(function () {
    // clear up previous displays, get ready for new displays
    $('#stateParks').empty();
    $("#activities").empty();
    $("#weather").empty();
    $("#map").empty();
    $("#describe").empty();
    $("#photo").empty();
    $("#hours").empty();
    // check which button is selected
    if ($("input[name='searchWay']:checked").val() == "parkName")
    {
      $("#confirm").attr("disabled", false);
      $("#confirmState").attr("disabled", true);
      $("#confirmPark").attr("disabled", true);
      $("#checkHours").attr("disabled", true);

    } else

    if ($("input[name='searchWay']:checked").val() == "stateName")
    {
      $("#confirmState").attr("disabled", false);
      $("#confirm").attr("disabled", true);
    }
    $("#search").attr("disabled", true);
    $("#checkmap").attr("disabled", true);
    $("#checkactivities").attr("disabled", true);
    $("#checkWeather").attr("disabled", true);

  });

  // when confirm park button is click, invoke function to check park name validation, pass the valid park name 
  $("#confirm").click(function () {

    if ($('#park').val() == "" || !allParkNames.includes($('#park').val()))
    {
      $("#describe").append("<p> choose a valid park name </p>");
      $("#search").attr("disabled", true);
    } else


    {
      $("#activities").empty();
      $("#weather").empty();
      $("#map").empty();
      $("#describe").empty();
      $("#hours").empty();
      $("#photo").empty();
      $('#stateParks').empty();

      $("#search").attr("disabled", false);
      $("#checkmap").attr("disabled", true);
      $("#checkactivities").attr("disabled", true);
      $("#checkWeather").attr("disabled", true);
      $("#checkHours").attr("disabled", true);
      // got park code for the valid park name , pass it to choice variable 
      choice = checkParkCode(parkNameCodes, $('#park').val());

    }

  }); // end confirm  


  // when confirm state button is click, invoke function to check state name validation, pass the valid state name 
  $("#confirmState").click(function () {
    // the park name exists
    if (stateNames.includes($('#state').val()))
    {// pass the valid state name, got the parks list in the state
      parksInState = checkParkState($('#state').val(), parkStates, stateNameCodePairs);
      // if there are parks in the state,set up to display the parks
      if (parksInState.length != 0)

      {
        $("#confirmPark").attr("disabled", false);
        $("#checkmap").attr("disabled", true);
        $("#checkactivities").attr("disabled", true);
        $("#checkWeather").attr("disabled", true);
        $("#checkHours").attr("disabled", true);
        $('#stateParks').empty();
        $("#activities").empty();
        $("#weather").empty();
        $("#map").empty();
        $("#describe").empty();
        $("#hours").empty();

        for (let i = 0; i < parksInState.length; i++)
        {// append radio buttons of park names ,show parks full name. set value as parks code
          let radioParkCode = checkParkCode(parkNameCodes, parksInState[i]);
          $('#stateParks').append(" <input type= 'radio'  name= 'parkState' value= " + radioParkCode + ">" + parksInState[i] + "<br/>");
        }
      } // end if no parkes in state
      else
        {// no parks in the state, give a meeeage
          $('#stateParks').append("<p> no national parks in this state </p>");
        }

    } //end if includes state
    else
      // the park name doesn't exist, give a message
      {
        $('#stateParks').append("<p> choose a valid state name </p>");
      }

  }); // end confirmState

  //  when confirm park button is click, invoke function to check if one of the radio buttons is checked, 
  $("#confirmPark").click(function () {
    // get the selected park code
    choice = $("input[name='parkState']:checked").val();
    // if a park code is selected , set up to display information
    if (choice != undefined)
    {

      $("#search").attr("disabled", false);
      $("#checkmap").attr("disabled", true);
      $("#checkactivities").attr("disabled", true);
      $("#checkWeather").attr("disabled", true);
      $("#checkHours").attr("disabled", true);
      $("#activities").empty();
      $("#weather").empty();
      $("#map").empty();
      $("#describe").empty();
      $("#hours").empty();
      $("#photo").empty();
    } else
      // if no park code is selected , give a message
      {
        $("#describe").append("<p>Select a Park </p>");
      }

  }); // end confirm park 

  // when search button is click, invoke function to display photos and description of the park
  $("#search").click(function () {

    $('#park').val("");
    $('#state').val("");
    $('#stateParks').empty();


    photos = checkParkPictures(parkNameCodes, choice);
    for (let i = 0; i < photos.length; i++)
    {$("#photo").append(`
     <div class="gallery">
     <a target="_blank" href=" ` + photos[i].url + ` ">
         <img src= "` + photos[i].url + `" >
      </a>    
         <div class="desc"> ` + photos[i].title + "-     credit:" + photos[i].credit + `</div>
     </div> `);

    }

    // enable some buttons to show details of the park 
    $("#confirmPark").attr("disabled", true);
    $("#checkmap").attr("disabled", false);
    $("#checkactivities").attr("disabled", false);
    $("#checkWeather").attr("disabled", false);
    $("#checkHours").attr("disabled", false);
    $("#add").attr("disabled", false);
    // pass the confirmed park code input, fetch data for searched park 
    fetch("https://developer.nps.gov/api/v1/parks?parkCode=" + choice + "&api_key=mGA5zsl3Ry9yUPRazfJodeaWx4sPUCaA8wgkclNW").
    then(response => {
      if (response.status != 200) {
        throw response.statusText;
      } else
      return response.json();
    }).
    then(data => {
      // store the fetched data 
      let parkinfo = data.data[0];
      parkLatitude = parseFloat(parkinfo.latitude);
      parklngtitude = parseFloat(parkinfo.longitude);
      parkFullName = parkinfo.fullName;
      parkInfoList = parkinfo;
      $("#activities").empty();
      $("#weather").empty();
      $("#map").empty();
      $("#describe").empty();
      $("#hours").empty();
      $("#describe").append("<p>" + parkInfoList.description + "</p>");

    }).
    catch(err => {
      console.log("Error" + err);
    });

  }); // end search  

  // When check activities button clicked, display activities information about the park 
  $("#checkactivities").click(function () {
    $("#search").attr("disabled", true);
    $("#activities").empty();
    $("#weather").empty();
    $("#describe").empty();
    $("#map").empty();
    $("#photo").empty();
    $("#hours").empty();
    if (parkInfoList.activities.length == 0)
    {
      $("#activities").append("<li>no activities on list </li>");
    } else

    {
      for (let i = 0; i < parkInfoList.activities.length; i++)
      {// $("#activities").fadeIn();
        $("#activities").append("<li>" + parkInfoList.activities[i].name + "</li>");
      }
    }
  }); // end check activities

  // When check weather button clicked, display weather information about the park 
  $("#checkWeather").click(function () {
    $("#search").attr("disabled", true);
    $("#activities").empty();
    $("#weather").empty();
    $("#describe").empty();
    $("#map").empty();
    $("#photo").empty();
    $("#hours").empty();
    $("#weather").append("<p>" + parkInfoList.weatherInfo + "</p>");
  }); // end checkWeather

  // When check map button clicked, display a map about the park 
  $("#checkmap").click(function () {
    $("#describe").empty();
    $("#photo").empty();
    $("#activities").empty();
    $("#weather").empty();
    $("#hours").empty();
    $("#search").attr("disabled", true);

    checkParkMap({ lat: parkLatitude, long: parklngtitude });
  }); // end CheckMap 

  // When check operating hours button clicked, display information about the park operating hours
  $("#checkHours").click(function () {
    $("#search").attr("disabled", true);
    $("#activities").empty();
    $("#weather").empty();
    $("#describe").empty();
    $("#map").empty();
    $("#photo").empty();
    $("#hours").empty();
    let hours = "";
    for (let i = 0; i < parkInfoList.operatingHours.length; i++)
    {
      hours = hours + parkInfoList.operatingHours[i].description + "<br> <br>";
    }
    if (hours == "")
    {
      $("#hours").append("<div> no description </div>");
    } else

    {
      $("#hours").append("<div>" + hours + "</div>");
    }
  }); // end checkHours


  // When add button clicked,add the park name and state code to the page 
  $("#add").click(function () {
    $("#list").append("<li id=" + parkInfoList.fullName + ">" + parkInfoList.fullName + " , " + parkInfoList.states + "</li>");

    $("#add").attr("disabled", true);
  });

}); // end document 

// helper function to draw a map 
function checkParkMap(parkLocation) {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8 });

  map.setCenter({ lat: parkLocation.lat, lng: parkLocation.long });
  const marker = new google.maps.Marker({
    position: { lat: parkLocation.lat, lng: parkLocation.long },
    map: map });


} // end checkParkMap

// helper function 
//by passing park name and an array with park name and code pairs
//to check the park code 
function checkParkCode(parkArray, name) {
  let code = "";
  for (let i = 0; i < parkArray.length; i++)
  {
    let park = parkArray[i];
    if (park.name == name)
    code = park.code;
  }
  return code;
}

// helper function 
//by passing park code and an array with park codes and photos
//to get the park photos by 
function checkParkPictures(parkArray, code)
{let photos = [];
  for (let i = 0; i < parkArray.length; i++)
  {
    let park = parkArray[i];
    if (park.code == code)
    photos = park.pictures;
  }
  return photos;
}

// helper function 
//by passing the state name and an array with state name and code pairs
//to get the state code 
function checkParkCodeByName(name, parksNameCodesArray)
{

  for (let i = 0; i < parksNameCodesArray.length; i++)
  {// get the statecode by searching for a state name 
    if (parksNameCodesArray[i].stateName == name)
    return parksNameCodesArray[i].stateCode;
  }
}

// helper function 
//by passing the state name, array of park names, an array with state name and state code pairs
//to get the array of park names in the state 
function checkParkState(stateName, parks, parksNameCodePairs)
{
  let stateCode = checkParkCodeByName(stateName, parksNameCodePairs);
  let parkNames = [];
  // loop throgh all parks 
  for (let i = 0; i < parks.length; i++)
  {// if the state code string include the searched park code 
    if (parks[i].state.includes(stateCode))
    parkNames.push(parks[i].name);

  }

  return parkNames;
}

// helper function
// by passing two empty array
// add all state name and state code pairs to one array; add all state names to the other array 
function getStateNameCode(stateNameCodes, stateNames)
{
  const stateLabelValues = [
  { 'label': 'Alabama', 'value': 'AL' },
  { 'label': 'Alaska', 'value': 'AK' },
  { 'label': 'American Samoa', 'value': 'AS' },
  { 'label': 'Arizona', 'value': 'AZ' },
  { 'label': 'Arkansas', 'value': 'AR' },
  { 'label': 'California', 'value': 'CA' },
  { 'label': 'Colorado', 'value': 'CO' },
  { 'label': 'Connecticut', 'value': 'CT' },
  { 'label': 'Delaware', 'value': 'DE' },
  { 'label': 'District of Columbia', 'value': 'DC' },
  { 'label': 'States of Micronesia', 'value': 'FM' },
  { 'label': 'Florida', 'value': 'FL' },
  { 'label': 'Georgia', 'value': 'GA' },
  { 'label': 'Guam', 'value': 'GU' },
  { 'label': 'Hawaii', 'value': 'HI' },
  { 'label': 'Idaho', 'value': 'ID' },
  { 'label': 'Illinois', 'value': 'IL' },
  { 'label': 'Indiana', 'value': 'IN' },
  { 'label': 'Iowa', 'value': 'IA' },
  { 'label': 'Kansas', 'value': 'KS' },
  { 'label': 'Kentucky', 'value': 'KY' },
  { 'label': 'Louisiana', 'value': 'LA' },
  { 'label': 'Maine', 'value': 'ME' },
  { 'label': 'Marshall Islands', 'value': 'MH' },
  { 'label': 'Maryland', 'value': 'MD' },
  { 'label': 'Massachusetts', 'value': 'MA' },
  { 'label': 'Michigan', 'value': 'MI' },
  { 'label': 'Minnesota', 'value': 'MN' },
  { 'label': 'Mississippi', 'value': 'MS' },
  { 'label': 'Missouri', 'value': 'MO' },
  { 'label': 'Montana', 'value': 'MT' },
  { 'label': 'Nebraska', 'value': 'NE' },
  { 'label': 'Nevada', 'value': 'NV' },
  { 'label': 'New Hampshire', 'value': 'NH' },
  { 'label': 'New Jersey', 'value': 'NJ' },
  { 'label': 'New Mexico', 'value': 'NM' },
  { 'label': 'New York', 'value': 'NY' },
  { 'label': 'North Carolina', 'value': 'NC' },
  { 'label': 'North Dakota', 'value': 'ND' },
  { 'label': 'Northern Mariana Islands', 'value': 'MP' },
  { 'label': 'Ohio', 'value': 'OH' },
  { 'label': 'Oklahoma', 'value': 'OK' },
  { 'label': 'Oregan', 'value': 'OR' },
  { 'label': 'Palau', 'value': 'PW' },
  { 'label': 'Pennsilvania', 'value': 'PA' },
  { 'label': 'Puerto Rico', 'value': 'PR' },
  { 'label': 'Rhode Island', 'value': 'RI' },
  { 'label': 'South Carolina', 'value': 'SC' },
  { 'label': 'South Dakota', 'value': 'SD' },
  { 'label': 'Tennessee', 'value': 'TN' },
  { 'label': 'Texas', 'value': 'TX' },
  { 'label': 'Utah', 'value': 'UT' },
  { 'label': 'Vermont', 'value': 'VT' },
  { 'label': 'Virgin Islands', 'value': 'VI' },
  { 'label': 'Virginia', 'value': 'VA' },
  { 'label': 'Washington', 'value': 'WA' },
  { 'label': 'West Virginia', 'value': 'WV' },
  { 'label': 'Wisconsin', 'value': 'WI' },
  { 'label': 'Wyoming', 'value': 'WY' }];


  for (let i = 0; i < stateLabelValues.length; i++)
  {
    let name = stateLabelValues[i].label;
    let code = stateLabelValues[i].value;
    let nameCodePair = { stateName: name, stateCode: code };
    stateNameCodes.push(nameCodePair);
    stateNames.push(name);
  }

}