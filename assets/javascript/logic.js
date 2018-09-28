/* Database Configuration */

var config = {
    apiKey: "AIzaSyAeQkzjpDb3Cc-8AfG_amVR_e_cAEcZ_gY",
    authDomain: "trainscheduler-68fb5.firebaseapp.com",
    databaseURL: "https://trainscheduler-68fb5.firebaseio.com",
    projectId: "trainscheduler-68fb5",
    storageBucket: "trainscheduler-68fb5.appspot.com",
    messagingSenderId: "69591817012"
  };
  firebase.initializeApp(config);
  const database = firebase.database();

  var trains = [], availableID = 0;
  var myTrain, trainID, arrayID;

  function loadDatabase() {
    // When the page loads, or when a user adds a train
    database.ref().on("child_added", function(snapshot) {
        // Get the train
        const train = snapshot.val();

        // Update the array
        trains.push(train);

        // Update the schedule table
        $("tbody").append(displayTrain(train));

        // Set the next available ID
        availableID = Math.max(train.id + 1, availableID);
    });
}


function displayTrain(train) {
    const info = findNextArrival(train);

    return `<tr id="${train.id}">
                <td>${train.name}</td>
                <td>${train.destination}</td>
                <td>${train.frequency}</td>
                <td>${displayTime(info.nextArrival)}</td>
                <td>${info.minutesAway}</td>
            </tr>`;
}

function findNextArrival(train) {
    // Express the departure in minutes
    const h0 = train.departure[1];
    const m0 = train.departure[2];
    const t0 = 60 * h0 + m0;

    // Express the current time in minutes
    const currentTime = new Date();

    const h1 = currentTime.getHours();
    const m1 = currentTime.getMinutes();
    const t1 = 60 * h1 + m1;

    // Number of trips that can be made between t0 and t1
    const numTripsMade = Math.max(Math.floor((t1 - t0) / train.frequency), 0);
    
    // Find the arrival time
    const arrivalTime = t0 + (numTripsMade + 1) * train.frequency;
    
    let d = 0;
    let h = Math.floor(arrivalTime / 60);
    let m = arrivalTime - 60 * h;

    // Account for departure on another day
    if (h >= 24) {
        d = Math.floor(h / 24);
        h = h % 24;
    }
    
    return {
        "nextArrival": [d, h, m],
        "minutesAway": arrivalTime - t1
    };
}


function displayTime(timeArray) {
    // Get the day, hour, and minute
    let d = timeArray[0];
    let h = timeArray[1];
    let m = timeArray[2];

    // Display the period
    const period = (0 <= h && h < 12) ? "AM": "PM";

    // Display the hour
    h = h % 12;

    if (h === 0) {
        h = 12;
    }

    // Display the minute
    if (m < 10) {
        m = "0" + m;
    }

    // Display the day
    if (d === 0) {
        return `${h}:${m} ${period}`

    } else if (d === 1) {
        return `${h}:${m} ${period}, in ${d} day`;

    } else {
        return `${h}:${m} ${period}, in ${d} days`;

    }
}

function addTrain(){
    const departure_string = $("#train-firstTime").val().trim();
    [h, m] = departure_string.split(":").map(x => parseInt(x, 10));

    // Update the database
    const train = {
        "id"         : availableID,
        "name"       : $("#train-name").val().trim(),
        "destination": $("#train-destination").val().trim(),
        "departure"  : [0, h, m],
        "frequency"  : parseInt($("#train-frequency").val().trim())
    };

    database.ref().child(availableID).set(train);
    // Reset
    $("input").val("");
}

$(document).ready(function() {
    loadDatabase();
    $("#addTrain").on("click", addTrain);
});