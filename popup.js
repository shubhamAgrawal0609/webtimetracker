window.onload = function () {
  updateBlockedWebsitesSection();
  var blockButton = document.getElementById("blockButton");
  blockButton.onclick = function () {
    getWebsiteInput();
  };
};

function getDateString(nDate){
  let nDateDate=nDate.getDate();
  let nDateMonth=nDate.getMonth()+1;
  let nDateYear=nDate.getFullYear();
  if(nDateDate<10){nDateDate="0"+nDateDate;};
  if(nDateMonth<10){nDateMonth="0"+nDateMonth;};
  let presentDate = ""+nDateYear+"-"+nDateMonth+"-"+nDateDate;
  return presentDate;
}
function getDomain(tablink){
    let url =  tablink[0].url;
    return url.split("/")[2];
};

function secondsToString(seconds,compressed=false){
  let hours = parseInt(seconds/3600);
  seconds = seconds%3600;
  let minutes= parseInt(seconds/60);
  seconds = seconds%60;
  let timeString = "";
  if(hours){
    timeString += hours + " hrs ";
  }
  if(minutes){
    timeString += minutes + " min ";
  }
  if(seconds){
    timeString += seconds+ " sec "
  }
  if(!compressed){
    return timeString;
  }
  else{
    if(hours){
      return(`${hours}h`);
    }
    if(minutes){
      return(`${minutes}m`);
    }
    if(seconds){
      return(`${seconds}s`);
    }
  }
};
var allKeys, timeSpent, totalTimeSpent,sortedTimeList,topCount,topDataSet,topLabels,dateChart;
var color = ["rgba(255, 0, 0, 1)","rgb(255, 51, 0)","rgb(255, 102, 0)","rgb(255, 153, 0)","rgb(255, 204, 0)","rgb(255, 255, 0)","rgb(204, 255, 0)","rgb(153, 255, 0)","rgb(102, 255, 0)","rgb(51, 255, 0)"];
totalTimeSpent = 0;
var today = getDateString(new Date())
chrome.storage.local.get(today,function(storedItems){
  allKeys = Object.keys(storedItems[today]);
  timeSpent = [];
  sortedTimeList = [];
  for (let i = 0; i<allKeys.length;i++ ){
    let webURL = allKeys[i];
    timeSpent.push(storedItems[today][webURL]);
    totalTimeSpent+= storedItems[today][webURL];
    sortedTimeList.push([webURL,storedItems[today][webURL]]);
  }
  sortedTimeList.sort((a,b)=>b[1]-a[1]);
  console.log(sortedTimeList);

  topCount = allKeys.length>10 ? 10 : allKeys.length;
  console.log(topCount);

  document.getElementById("totalTimeToday").innerText = secondsToString(totalTimeSpent);
  topDataSet= [];
  topLabels= [];
  for(let j=0;j<topCount;j++){
    topDataSet.push(sortedTimeList[j][1]);
    topLabels.push(sortedTimeList[j][0]);
  }
  

    const webTable = document.getElementById('webList');
    for(let i = 0; i<allKeys.length;i++){
        let webURL = sortedTimeList[i][0];
        let row = document.createElement('tr');
        let serialNumber = document.createElement('td');
        serialNumber.innerText = i+1;
        let siteURL = document.createElement('td');
        siteURL.innerText= webURL;
        let siteTime = document.createElement('td');
        siteTime.innerText = secondsToString(sortedTimeList[i][1]);
        row.appendChild(serialNumber);
        row.appendChild(siteURL);
        row.appendChild(siteTime);
        webTable.appendChild(row);
        console.log(row);
    }

    new Chart(document.getElementById("pie-chart"), {
      type: 'doughnut',
      data: {
        labels: topLabels,
        datasets: [{
          label: "Time Spent",
          backgroundColor: color,
          data: topDataSet
        }]
      },
      options: {
        title: {
          display: true,
          text: "Top Visited Sites Today"
        },
        legend:{
            display:true
        },
        circumference : Math.PI,
        rotation: Math.PI
      }
  });

});

chrome.storage.local.get(null,function(items){
  let datesStored = Object.keys(items);
  datesStored.sort();
  const calendar = document.getElementById("dateValue");
  let minDate = datesStored[0];
  let maxDate = datesStored[datesStored.length-1];
  calendar.min = minDate;
  calendar.max = maxDate;
});


document.getElementById("dateSubmit").addEventListener('click',function(){
  const calendar = document.getElementById("dateValue");
  if(calendar.value===""){
    document.getElementById("tryAgain").innerText = "Invalid date! Please try again.";
    document.getElementById("tryAgain").classList.remove("d-none");
  }
  else{
    document.getElementById("tryAgain").classList.add("d-none");
    let givenDate = calendar.value;
    chrome.storage.local.get(givenDate,function(thatDay){
      if(thatDay[givenDate] == null){
        document.getElementById("tryAgain").innerText = "No records exist for this day!";
        document.getElementById("tryAgain").classList.remove("d-none");
      }
      else{
        let sites = Object.keys(thatDay[givenDate]);
        let times=[];
        for(let i=0;i<sites.length;i++){
          times.push([sites[i],thatDay[givenDate][sites[i]]]);
        }
        times.sort(function(a,b){return b[1]-a[1]});
        let topTen = times.length>10? 10:times.length;
        let dataSet = [];
        let thatDayTotal = 0;
        let dataSetLabels = [];
        for(let i=0;i<topTen;i++){
          dataSet.push(times[i][1]);
          dataSetLabels.push(times[i][0]);
          thatDayTotal+= times[i][1];
        }
        let chartTitle = "Top Visited Sites on "+givenDate;
        if(dateChart){
          dateChart.destroy()
        }
         dateChart = new Chart(document.getElementById("differentDayChart"), {
          type: 'doughnut',
          data: {
            labels: dataSetLabels,
            datasets: [{
              label: "Time Spent",
              backgroundColor: color,
              data: dataSet
            }]
          },
          options: {
            title: {
              display: true,
              text: chartTitle
            },
            legend:{
                display:true
            },
            circumference : Math.PI,
            rotation: Math.PI
          }
      });
      document.getElementById("statsRow").classList.remove("d-none");
      document.getElementById("totalTimeThatDay").innerText = secondsToString(thatDayTotal);
      const webList2 = document.getElementById("webList2");
      while (webList2.firstChild) {
        webList2.removeChild(webList2.lastChild);
      }
      for(let i=0;i<times.length;i++){
        let row = document.createElement('tr');
        let col1 = document.createElement('td');
        col1.innerText = i+1;
        row.appendChild(col1);
        let col2 = document.createElement('td');
        col2.innerText = times[i][0];
        row.appendChild(col2);
        let col3 = document.createElement('td');
        col3.innerText = secondsToString(times[i][1]);
        row.appendChild(col3);
        webList2.appendChild(row);
      }   
      }
     
    });
  }
});

function getDateTotalTime(storedObject,date){
  let websiteLinks = Object.keys(storedObject[date]);
  let noOfWebsites = websiteLinks.length;
  let totalTime = 0;
  for(let i = 0 ; i<noOfWebsites;i++){
    totalTime+= storedObject[date][websiteLinks[i]];
  }
  return totalTime;
};
var monthNames = ["","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
document.getElementById('weekTab').addEventListener('click',function(){
  chrome.storage.local.get(null,function(storedItems){
    let datesList = Object.keys(storedItems);
    let noOfDays = datesList.length>=7 ? 7 : datesList.length;
    let timeEachDay= [];
    let dateLabels = [];
    let weeksTotalTime= 0;
    datesList.sort();
    for(let i = datesList.length-noOfDays;i<datesList.length;i++){
      let month = parseInt(datesList[i][5]+datesList[i][6]);
      let label = datesList[i][8]+datesList[i][9]+" "+monthNames[month];
      //0123-56-89
      dateLabels.push(label);
      let dayTime = getDateTotalTime(storedItems,datesList[i]);
      timeEachDay.push(dayTime);
      weeksTotalTime += dayTime;
    }
    let weeklyAverage = parseInt(weeksTotalTime/noOfDays);
    weeklyAverage = secondsToString(weeklyAverage);
    let weeklyMax = Math.max.apply(Math,timeEachDay);
    weeklyMax = secondsToString(weeklyMax);
    document.getElementById("weekAvg").innerText = weeklyAverage;
    document.getElementById("weekMax").innerText = weeklyMax;
    const weeklyChart = document.getElementById("pastWeek");
    let weeklyChartDetails = {};
    weeklyChartDetails["type"]= 'line';
    let dataObj= {};
    dataObj["labels"] = dateLabels;
    dataObj["datasets"] = [{label:"Time Spent",
    fill:true,
    backgroundColor: "rgba(75,192,192,0.4)",
    lineTension:0.2,
    borderColor: "rgba(75,192,192,0.8)",
    pointBackgroundColor:"rgba(75,192,192,1)",
    data: timeEachDay
  }]
    weeklyChartDetails["data"] = dataObj;
    weeklyChartDetails["options"] = {
      legend:{display:false},
      title:{display:true,text:"Time Spent Online in the Recent Past"},
      scales:{yAxes:[{scaleLabel:{display:true,labelString:"Time in Seconds"}}]}
    };
    new Chart(weeklyChart,weeklyChartDetails);
  });
});

// popup scripts control the behavior of the extension's popup window



function getWebsiteInput() {
  var websiteInput = document.getElementById("websiteInput").value;
  // If user clicks the -Block- button without entering input -> Alert Error
  if (!websiteInput) {
    alert("Error: please enter a website URL");
  } else {
    // Retrieve the blockedWebsitesArray from Chrome browser, or initialize a new one
    chrome.storage.sync.get("blockedWebsitesArray", function (data) {
      var blockedWebsitesArray = data.blockedWebsitesArray || [];
      // If: there is data in the array
      // Then: Alert Error
      // Else: Add the new input to the array
      const isInputInArray = blockedWebsitesArray.some(
        (item) => item === websiteInput
      );
      if (isInputInArray === true) {
        alert("Error: URL is already blocked");
      } else {
        blockedWebsitesArray.push(websiteInput);
         blockedWebsitesArray = JSON.stringify(blockedWebsitesArray);
         var data = blockedWebsitesArray;
        localStorage.setItem("data",data);
        chrome.storage.sync.set(
          { blockedWebsitesArray: blockedWebsitesArray },
          function () {
            // Update the UI after the storage operation is complete
            updateBlockedWebsitesSection();
            document.getElementById("websiteInput").value = "";
            document.getElementById("websiteInput").focus();
          }
        );
      }
    });
  }
}

// Update the Popup's 'Blocked Websites' Section to current state
function updateBlockedWebsitesSection() {
  // Retrieve the blockedWebsitesDiv
  const blockedWebsitesDiv = document.getElementById("blockedWebsitesDiv");
  // Clear the blockedWebsitesDiv by removing all its child elements
  while (blockedWebsitesDiv.firstChild) {
    blockedWebsitesDiv.removeChild(blockedWebsitesDiv.firstChild);
  }
  // Get the stored array of blocked websites
  chrome.storage.sync.get("blockedWebsitesArray", function (data) {
    const blockedWebsitesArray = data.blockedWebsitesArray;
    // Check if the array is empty
    if (blockedWebsitesArray && blockedWebsitesArray.length > 0) {
      // If the array is not empty, remove the message that says 'No websites have been blocked' (if it exists)
      const nothingBlockedDiv = document.querySelector(".nothingBlocked");
      if (nothingBlockedDiv != null) {
        blockedWebsitesDiv.removeChild(nothingBlockedDiv);
      }
      // then iterate through each item in the stored array of Blocked Websites
      blockedWebsitesArray.forEach((website, index) => {
        // Create a new div for each URL
        const websiteDiv = document.createElement("div");
        // Add class (for styling) to websiteDiv block
        websiteDiv.classList.add("websiteDiv");
        // Create div for 'website text'
        const websiteDivText = document.createElement("div");
        websiteDivText.classList.add("websiteDivText");
        websiteDivText.textContent = website;
        // Append the websiteDivText to websiteDiv
        websiteDiv.appendChild(websiteDivText);
        // Create the unblock button
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete"); // Add your CSS class for styling the red button
        // Create an id value for the array item
        deleteButton.setAttribute("id", index);
        // Create the trash icon (using Font Awesome)
        const trashIcon = document.createElement("i");
        trashIcon.classList.add("fas", "fa-trash");
        trashIcon.setAttribute("id", index);
        // Append the trash icon to the delete button
        deleteButton.appendChild(trashIcon);
        // Add onClick function to each delete button
        deleteButton.addEventListener("click", unblockURL);
        // Append the red button to the websiteDiv
        websiteDiv.appendChild(deleteButton);
        // Append the websiteDiv to the blockedWebsitesDiv
        blockedWebsitesDiv.appendChild(websiteDiv);
      });
    } else {
      // If the array is empty, create the message element
      const nothingBlocked = document.createElement("div");
      nothingBlocked.textContent = "No websites have been blocked";
      nothingBlocked.classList.add("nothingBlocked");
      blockedWebsitesDiv.appendChild(nothingBlocked);
    }
  });
}

function unblockURL(event) {
  const clickedButtonId = event.target.id;
  // Get the blockedWebsitesArray
  chrome.storage.sync.get("blockedWebsitesArray", function (data) {
    let blockedWebsitesArray = data.blockedWebsitesArray;
    for (let i = 0; i < blockedWebsitesArray.length; i++) {
      if (clickedButtonId == i) {
        blockedWebsitesArray.splice(i, 1);
        break; // Exit the loop after removing the element
      }
    }
    // Save the updated array back to Chrome storage
    chrome.storage.sync.set({ blockedWebsitesArray: blockedWebsitesArray });
    updateBlockedWebsitesSection();
  });
}


const restricted_sites = new Set();

// Retrieve the blockedWebsitesArray from Chrome storage
chrome.storage.sync.get("blockedWebsitesArray", function (data) {
  const blockedWebsitesArray = data.blockedWebsitesArray || [];
  if (blockedWebsitesArray && blockedWebsitesArray.length > 0) {
    // Add the items from blockedWebsitesArray to the set restricted_sites to avoid duplicates
    blockedWebsitesArray.forEach((item) => {
      // Convert to lowercase and add both versions of the URL
      restricted_sites.add(item.toLowerCase());
      restricted_sites.add(normalizeURL(item.toLowerCase()));
    });

    // Call the function to check if the website should be blocked
    check_if_restricted();
  }
});

// Normalize URL by removing 'www.' from the beginning
function normalizeURL(url) {
  return url.replace(/^www\./i, "");
}

// Check if the current website should be blocked
function shouldBlockWebsite() {
  const currentHostname = normalizeURL(window.location.hostname);
  return restricted_sites.has(currentHostname);
}

// Create the blocked page dynamically
function createBlockedPage() {
  const blockedPage = generateHTML();
  const style = generateSTYLING();
  // Inject the styles and blocked page into the current document
  const head = document.head || document.getElementsByTagName("head")[0];
  head.insertAdjacentHTML("beforeend", style);
  document.body.innerHTML = blockedPage;
}

// Check if the website should be blocked and take appropriate action
function check_if_restricted() {
  if (shouldBlockWebsite()) {
    createBlockedPage();
  }
}

function generateSTYLING() {
  return `
    <style>
    body {
      display: flex !important;
      justify-content: center !important;
      height: 100vh !important;
      margin: 0 !important;
      background-color: #174b42 !important;
      font-family: 'Noto Serif', serif !important;
    }
    h1 {
      font-size: 3em !important;
      margin-top: 20vh !important;
      color: white !important;
    }
    </style>
  `;
}

function generateHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Site Blocked</title>
      <link href="https://fonts.googleapis.com/css2?family=YourSelectedFont&display=swap" rel="stylesheet">
    </head>
    <body>
      <h1>Site Blocked</h1>
    </body>
    </html>
  `;
}

