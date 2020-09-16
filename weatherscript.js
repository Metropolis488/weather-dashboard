
var historyEl = $("#left-rail");
var currentWeather = $("#current");
var foreCast = $("#forecast");
var submitEl = $("#submit")

var searchHist = JSON.parse(localStorage.getItem("citySearch")) || []

init()

submitEl.on("click", () => {
    var city = $("#input").val()
    cityRtn(city)
    historyList()
});


function runBtn() {
    var clickedBtn = $(this).text();
    cityRtn(clickedBtn);
}

function cityRtn(city) {

    // This is the function to build the "Current Day" weather div
    $.ajax({
        url: openWeatherURL("weather", city),
        method: "GET"
    }).then(function (response) {
        currentWeather.empty();
        var city = $(`<div>`);
        var icon = response.weather[0].icon;
        city.append(`<h1>${response.name} (${moment().format('M/D/YYYY')})<img src="http://openweathermap.org/img/wn/${icon}@2x.png"></h1>`);
        city.append(`<h5>Temperature: ${response.main.temp}&#8457;</h5>`);
        city.append(`<h5>Humidity: ${response.main.humidity}%</h5>`);
        city.append(`<h5>Wind Speed: ${response.wind.speed} MPH</h5>`);
        currentWeather.append(city);
        uvIndex(response.coord);
    });
    // this function builds the forecast cards        
    $.ajax({
        url: openWeatherURL("forecast", city),
        method: "GET"
    }).then(function ({list}) {
        foreCast.empty();
        list
            .filter(entry => entry.dt_txt.includes("12:00:00"))
            .forEach(entry => {
                var dayCard = $(`<div class="card bg-primary"><div class="card-body text-left">`);
                dayCard.append(`<h5>${moment(entry.dt_txt).format('M/D/YYYY')}</h5>`);
                dayCard.append(`<img src="http://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png">`)
                dayCard.append(`<p>Temperature: ${entry.main.temp}&#8457;</p>`);
                dayCard.append(`<p>Humidity: ${entry.main.humidity}%</p>`);
                foreCast.append(dayCard);
            })

        $("#input").val("");
    });
};

function openWeatherURL(type, val) {
    var API_KEY = "&appid=23911dd86712254cc5b8430fb2b752dd";
    var BASE_URL = "http://api.openweathermap.org/data/2.5/";
    var query;

    switch (type) {
        case "weather":
            query = "?q=" + val + "&units=imperial"
            break;
        case "forecast":
            query = "?q=" + val + "&units=imperial"
            break;
        case "uvi":
            query = "?lat=" + val.lat + "&lon=" + val.lon
            break;
    }
    return BASE_URL + type + query + API_KEY;
}

//This gets the UV Index and appends it to the "Current Day" weather div
function uvIndex(coords) {

    $.ajax({
        url: openWeatherURL("uvi", coords),
        method: "GET"
    }).then(function ({value:uvI}) {
        // var response === { value: int }
        // var ({value:uvI}) = response; -- creates alias of value named 'uvI'

        var line = $("<h5>").text("UV Index: ")
        var badge = $("<span>")
            .addClass("badge")
            .text(uvI)

        if (uvI <= 2) {
            badge.addClass("badge-success")
        }
        else if (uvI <= 6) {
            badge.addClass("badge-warning")
        }
        else {
            badge.addClass("badge-danger")
        }

        line.append(badge)
        currentWeather.append(line)
    });
};

function historyList() {
    var city = $("#input").val();

    if(!city) return;

    if(searchHist.includes(city)){
        var index = searchHist.indexOf(city)
        searchHist.splice(index, 1)
    }  

    searchHist.unshift(city)
    localStorage.setItem("citySearch", JSON.stringify(searchHist));

    createBtns()
};

function createBtns() {
    historyEl.empty();

    searchHist.forEach(city => {
        var btn = $('<button>')
            .addClass("btn btn-primary my-2")
            .attr("data-name", city)
            .text(city);
        historyEl.append(btn);
    })
};

function init() {
    if (Array.isArray(searchHist) && searchHist.length)
        cityRtn(searchHist[0]);

    createBtns();
}
$(document).on("click", ".btn", runBtn);

