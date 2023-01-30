// For reference purpose
   // 'id', 'city', 'date', 'player_of_match', 'venue', 'neutral_venue', 'team1', 'team2', 
   // 'toss_winner', 'toss_decision', 'winner', 'result', 'result_margin', 'eliminator', 'method', 'umpire1','umpire2'

// For Reference:
   // 'id', 'inning', 'over', 'ball', 'batsman', 'non_striker', 'bowler', 'batsman_runs', 'extra_runs', 'total_runs', 
   // 'non_boundary', 'is_wicket', 'dismissal_kind', 'player_dismissed', 'fielder', 'extras_type', 'batting_team', 'bowling_team'

// For reference:
   // 'NA', 'byes', 'wides', 'legbyes', 'noballs', 'penalty'

const fs = require('fs') // Importing file system module

function sortTenBallers(bowlerStat) {
   let sortBowlers = []; // An empty array perform the sorting function ahead
   for (let baller in bowlerStat) {
      sortBowlers.push([baller, bowlerStat[baller]['economy']])
   } // Pushing the name of the baller and respective economy onto the empty array

   sortBowlers.sort(function(a,b) {return a[1] - b[1]}) // Sorting the array from lowest to highest economoy

   sortBowlers.splice(10); // Only keeping the first 10 bowlers after sorting (Best 10)

   for (let i in sortBowlers) { // Denormalizing the economy where it was normalized earlier
      sortBowlers[i][1] /= 1000000;
   }

   answer = {} // An object to store the results
   for (let i in sortBowlers) {
      answer[sortBowlers[i][0]] = {
         runs: bowlerStat[sortBowlers[i][0]].runs,
         balls: bowlerStat[sortBowlers[i][0]].balls,
         economy: sortBowlers[i][1]
      }
   } // Strong the results with required data in JS Object format

   return answer; // Returns the top 10 bowler with best economy (lowest economy rate)
}

function writeToFile(name,data) {
   fs.writeFile(name, JSON.stringify(data), (error) => { // Writing the given data onto a JSON file with give name
      if (error) throw error;
    });
}

function removeEmpty(taskObj) {
   for (let opropt in taskObj) { // Removing the properties of the result which has 0 as thier value
      for (let ipropt in taskObj[opropt]) {
         if (taskObj[opropt][ipropt] === 0) {
            delete taskObj[opropt][ipropt];
         }
      }
   }
}

function formatData(inputData) {
   const columns = [... inputData[0]]; // Obtaining all the names of Columns in the dataset
   
   dataObj = {}; // creating an object to store the values in an object in columnar format
   for (let i=0; i<columns.length; i++) {
      dataObj[columns[i]] = []
   }

   for (let i=1; i<inputData.length; i++) { // Pushing the data values of each row into their respective columns
      for(let j=0; j<inputData[i].length; j++) {
         dataObj[columns[j]].push(inputData[i][j])
      }
   }

   return dataObj; // Returning the final data object
}

// Task 1: To obtain the number of matches played by each team in every year respectively
function taskOne(dataObj) {

   const allYears = [... new Set(dataObj.date)]; // Obtaining all the unique years

   const allTeams = [... new Set(dataObj.team1.concat(dataObj.team2))] // Obtaining all the unique Team Names

   taskObj = {} //creating an Object to store the answer
   for (let i=0; i<allYears.length; i++) { // Intializing the values of each team in each year to 0
      taskObj[allYears[i]] = {};
      for (let j=0; j<allTeams.length; j++) {
         taskObj[allYears[i]][allTeams[j]] = 0;
      }
   } 

   // Increasing the count of each team played indexed through played year
   for (let i=0; i<dataObj.date.length; i++) { // Adding the count for each
      taskObj[dataObj.date[i]][dataObj.team1[i]] ++;
      taskObj[dataObj.date[i]][dataObj.team2[i]] ++;
   }

   removeEmpty(taskObj); // Removing the data with 0 as values

   writeToFile('taskOne.json',taskObj); // Writing answer onto a file in JSON Format
} 

// Task 2: To obtain the number of matches won by each team in every year respectively
function taskTwo(dataObj) {

   const allYears = [... new Set(dataObj.date)]; // Obtaining all the unique years

   const allTeams = [... new Set(dataObj.team1.concat(dataObj.team2)),'Draws'] // Obtaining all the unique Team Names

   taskObj = {} //creating an Object to store the answer
   for (let i=0; i<allYears.length; i++) { // Intializing the values of each team in each year to 0
      taskObj[allYears[i]] = {};
      for (let j=0; j<allTeams.length; j++) {
         taskObj[allYears[i]][allTeams[j]] = 0;
      }
   }

   // Inreasing the count of each team won indexed through played year
   for (let i=0; i<dataObj.winner.length; i++) {
      if (dataObj.winner[i] === 'NA') { // Handling the Draw result scenario
         taskObj[dataObj.date[i]]['Draws'] ++;
         continue;
      }
      taskObj[dataObj.date[i]][dataObj.winner[i]] ++; 
   }

   removeEmpty(taskObj); // Removing the data with 0 as values

   writeToFile('taskTwo.json',taskObj); // Writing answer onto a file in JSON Format
}

// Task 3: To obtain the number of extra runs conceded by each team in the year 2016
function taskThree(dataObj,matchIds) {
   const bowlTeams = [... new Set(dataObj.bowling_team)]; // Obtaining the names of all the teams that have bowled
   // It can be noted that for two matches, the stats of bowling team is unavailable (501265, 829763)

   taskObj = {};
   taskObj['2016'] = {}; // An empty object to store the results
   for (let i=0; i<bowlTeams.length; i++) { // Initializing the value of each teams to 0
      taskObj['2016'][bowlTeams[i]] = 0;
   }

   for (let i=0; i<dataObj.id.length; i++) { // Increasing the count extra runs of respective team whenever the matchID matches with the passed match IDs
      if (matchIds['2016'].includes(dataObj.id[i])) { // 
         taskObj['2016'][dataObj.bowling_team[i]] += parseInt(dataObj.extra_runs[i])
      }
   }

   removeEmpty(taskObj);    // Removing the data with 0 as values

   writeToFile('taskThree.json',taskObj) // Writing answer onto a file in JSON Format
}

// Task 4: To obtain the bowler statistics of top 10 bowlers in terms of economy
function taskFour(dataObj,matchIds) {
   const allBowlers = [... new Set(dataObj.bowler)] // Obtaining the names of all the Bowlers ever bowled

   bowlerStat = {};
   for (let i=0; i<allBowlers.length; i++) { // Intialzing the values to 
      bowlerStat[allBowlers[i]] = { runs: 0, balls: 0 }
   }

   for (let i=0; i<dataObj.extras_type.length; i++) {
      if (matchIds['2015'].includes(dataObj.id[i])) {
         if (dataObj.extras_type[i] == 'NA' || dataObj.extras_type[i] == 'penalty') {
            bowlerStat[dataObj.bowler[i]].runs += parseInt(dataObj.total_runs[i]);
            bowlerStat[dataObj.bowler[i]].balls ++;
         } else if (dataObj.extras_type[i] == 'legbyes' || dataObj.extras_type[i] == 'byes') {
            bowlerStat[dataObj.bowler[i]].balls ++;
         } else if (dataObj.extras_type[i] == 'wides' || dataObj.extras_type[i] == 'noballs') {
            bowlerStat[dataObj.bowler[i]].runs += parseInt(dataObj.total_runs[i]);
         }
      }
   }

   for (bowler in bowlerStat) { // Removing the properties of the result which has 0 as thier value
      if (bowlerStat[bowler]['balls'] === 0) {
         delete bowlerStat[bowler];
      }
   }

   for (let propt in bowlerStat) { // Calculating economy and normalizing
      bowlerStat[propt]['economy'] = (bowlerStat[propt].runs / bowlerStat[propt].balls) * 1000000;
   }

   const topEconomyAbsolute = sortTenBallers(bowlerStat); // Obtaining the best 10 players in terms of economy
   writeToFile('taskFour1.json',topEconomyAbsolute); // Writing the results onto a file

   for (let propt in bowlerStat) { // Removing all the bowlers with less than 50 bowlers bowled
      if (bowlerStat[propt].balls < 50) {
         delete bowlerStat[propt];
      }
   }

   const topEconomyRelative = sortTenBallers(bowlerStat); // Obtaining the top 10 players in terms of economy and number of bowls greater than 100
   writeToFile('taskFour2.json',topEconomyRelative); // // Writing the results onto a file
}

// Function to read the data and assign Task 3 and Task 4
function otherTwo(matchIds) { 
   fs.readFile('IPL Ball-by-Ball 2008-2020.csv', (err, inputData) => { // Reading the data from Matches File

      if (err) throw err;
   
      inputData = inputData.toString().replaceAll('"','').replaceAll('Rising Pune Supergiants','Rising Pune Supergiant').split('\n');
      inputData.pop(); // Removing onle last empty data column
   
      for (let i=0; i< inputData.length; i++) { // Splitting the data through ',' seperation
         inputData[i] = inputData[i].slice(0,inputData[i].length-1).split(",")
      }
   
      for (let i=0; i<inputData.length; i++) { // Removing extra fielder which doesn't fit the format
         if (inputData[i].length == 20) {
            inputData[i].splice(14,2);
         } else if (inputData[i].length == 19) {
            inputData[i].splice(14,1);
         }
      }

      const dataObj = formatData(inputData); // From the inputData, get the dataset in Columna format

      taskThree(dataObj,matchIds); // Function call to perform Task 3
      taskFour(dataObj,matchIds); // Function call to perform Task 4
   })
}
 // This is the first function to be called upon execution and this reads and formats the data from Matches dataset
fs.readFile('IPL Matches 2008-2020.csv', (err, inputData) => { // Reading the data from Matches File

   if (err) throw err;

   inputData =inputData.toString().replaceAll('Rising Pune Supergiants','Rising Pune Supergiant').split("\n"); 
   //converting the data from Object to string and to an array with each line as an array element and correcting the typo in one of the teamname
   inputData.pop(); //popping as the last item was empty string

   //removing the redundant \r character from all array elements and splitting to distinct values throug ',' seperation
   for (let i=0; i< inputData.length; i++) {
      inputData[i] = inputData[i].slice(0,inputData[i].length-1).split(",")
   }

   // Since certain rows had one extra column due to the presence of City name with the stadium, we shall remove that extra column
   for (let i=1; i<inputData.length; i++) {
      if(inputData[i].length === 18) {
         inputData[i].splice(5,1)
      }
   }

   const dataObj = formatData(inputData); // From the inputData, get the dataset in Columna format

   // As only the year of match played is relevant to the given objectives, we shall only keep the played years instead of whole date
   for (let i=0; i<dataObj.date.length; i++) {
      dataObj.date[i] = dataObj.date[i].slice(0,4);
   }

   taskOne(dataObj); // Calling the Function to perform First Task
   taskTwo(dataObj); // Calling the Function to perform Second Task

   const allYears = [... new Set(dataObj.date)]; // Obtaining all the unique years
   let matchIdsYearwise = {}; // Obtaining the match IDs of all the matches played in each year respetively
   for (let i in allYears) { // Creating an empty array to store matchIds for every year
      matchIdsYearwise[allYears[i]] = [];
   }
   for (let i in dataObj.date) { // Adding the match IDs for each year and adding it to them respectively
      matchIdsYearwise[dataObj.date[i]].push(dataObj.id[i]);
   }

   otherTwo(matchIdsYearwise); // Passing the match IDs to the respective function
})