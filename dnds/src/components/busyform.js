import React from "react";
import "../App.css";
import { Auth, API, graphqlOperation } from "aws-amplify";
import * as mutations from "../graphql/mutations";
import * as queries from "../graphql/queries";
import awsconfig from "../aws-exports";
API.configure(awsconfig);

class BusyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      busyBlocks: [],
      name: "",
      startDate: "",
      bstime: "",
      endDate: "",
      betime: "",
      eMsg: [],
      currentUser: "",
      unsavedChanges: false,
    };
    //binds go here
    this.addBusyBlock = this.addBusyBlock.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.removeBusyBlock = this.removeBusyBlock.bind(this);
    this.validateInput = this.validateInput.bind(this);
    this.sortBusyBlocks = this.sortBusyBlocks.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.isItDST = this.isItDST.bind(this);
  }

  componentDidMount() {
    //Get username from Auth
    Auth.currentAuthenticatedUser().then((data) => {
      this.setState({
        ...this.state,
        currentUser: data.username,
      });

      API.graphql(
        graphqlOperation(queries.getUserSchedule, { username: data.username })
      ).then((data, err) => {
        if (err) {
          console.log("ERROR");
          console.log(err);
        } else {
          let bb = data.data.getUserSchedule;
          if (bb === null) {
            bb = [];
          } else {
            bb = bb.schedule;
          }
          this.setState({
            ...this.state,
            busyBlocks: bb,
          });
        }
      });
    });
  }

  //submit handler
  handleSubmit() {
    //Get username from Auth

    //set up return object
    let retObj = {
      username: this.state.currentUser,
      schedule: this.state.busyBlocks,
    };

    // console.log("Attempting to send object to database");

    //first attempt to add retObj to the database
    API.graphql(
      graphqlOperation(mutations.createUserSchedule, { input: retObj })
    )
      .then((data) => {
        alert("Your schedule has been successfully created.");
        this.setState({
          unsavedChanges: false,
        });
        // console.log("DATA CREATED:");
        // console.log(data);
      })
      .catch((e) => {
        //if there is an error, attempt to update instead of add
        API.graphql(
          graphqlOperation(mutations.updateUserSchedule, { input: retObj })
        )
          .then((data) => {
            alert("Your schedule has been successfully updated.");
            this.setState({
              unsavedChanges: false,
            });
            // console.log("DATA UPDATED:");
            // console.log(data);
          })
          .catch((err) => {
            alert(
              "Error while trying to create or update a schedule. Press f12 to see console for more details."
            );
            console.log("ERROR - Two errors occured: ");
            console.log(e);
            console.log(err);
          });
      });
  }

  //sorts busy blocks
  sortBusyBlocks() {
    //clone busyBlocks
    let clone = [...this.state.busyBlocks];

    //sort function
    clone.sort(function (x, y) {
      if (x[0] !== y[0]) {
        return x[0] < y[0] ? -1 : 1;
      }
      return x[1] < y[1] ? -1 : 1;
    });

    //set new state
    this.setState({
      busyBlocks: clone,
    });
  }

  //updates state on change events
  handleChange(event) {
    const value = event.target.value;
    this.setState({
      ...this.state,
      [event.target.name]: value,
    });
  }

  //input validator
  validateInput() {
    //set bool for return
    let isValid = true;

    let errMsg = [];

    //getting current date
    const date = new Date();
    const yyyy = date.getFullYear();
    let mm = String(date.getMonth() + 1).padStart(2, "0");
    let dd = String(date.getDate()).padStart(2, "0");
    const today = yyyy + "-" + mm + "-" + dd;

    //custom validation checks.

    //Check for empty values
    if (
      !this.state.name ||
      !this.state.startDate ||
      !this.state.bstime ||
      !this.state.endDate ||
      !this.state.betime
    ) {
      errMsg.push("Please fill in all fields.");
      isValid = false;
    }

    //Check that end time is after start time
    if (this.state.startDate === this.state.endDate) {
      if (this.state.bstime >= this.state.betime) {
        errMsg.push("Please make sure your end time is after your start time");
        isValid = false;
      }
    }

    //check to make sure dates are in proper order
    if (this.state.startDate > this.state.endDate) {
      errMsg.push("Please make sure your end date is after your start date.");
      isValid = false;
    }

    //Check that dates are not in the past.
    if (this.state.startDate < today || this.state.endDate < today) {
      errMsg.push("Dates must not be in the past");
      isValid = false;
    }

    //Check for duplicate entry
    for (let i = 0; i < this.state.busyBlocks.length; i++) {
      let curBlock = this.state.busyBlocks[i];
      if (
        curBlock[0] === this.state.startDate &&
        curBlock[1] === this.state.bstime &&
        curBlock[2] === this.state.endDate &&
        curBlock[3] === this.state.betime
      ) {
        errMsg.push("This time block already exists!");
        isValid = false;
      }
    }

    //update error message in state
    this.setState({
      ...this.state,
      eMsg: errMsg,
    });

    return isValid;
  }

  //event handler for adding busy block to state
  handleAdd(event) {
    //prevent default form submit behavior (reloading page, etc...)
    event.preventDefault();

    const data = [
      this.state.startDate,
      this.state.bstime,
      this.state.endDate,
      this.state.betime,
      this.state.name,
    ];

    //Validate the input before adding to state
    const isValid = this.validateInput();
    if (isValid) {
      //add the form data to the current state
      this.addBusyBlock(data);
    } else {
      //NOT FINISHED TODO make actual alerts
      alert("The form was not valid. Please resubmit after fixing the errors.");
    }
  }

  //function to compare order of two date strings
  compareDates(dateString1, dateString2) {
    const d1 = new Date(dateString1);
    const d2 = new Date(dateString2);
    if (d1 < d2) return 1;
    if (d1 === d2) return 0;
    return -1;
  }

  //function to add busy block to current state
  addBusyBlock(bblock) {
    //get clone of current block array
    let curBusyBlocks = [...this.state.busyBlocks];

    //add block to clone array
    curBusyBlocks.push(bblock);

    //update state with updated clone array
    this.setState(
      {
        busyBlocks: curBusyBlocks,
        unsavedChanges: true,
      },
      () => {
        this.sortBusyBlocks();
      }
    );
  }

  //function to remove busy block from state
  removeBusyBlock(data, idx) {
    //get clone of data
    let curBusyBlocks = [...this.state.busyBlocks];

    //remove the data
    curBusyBlocks.splice(idx, 1);

    //update current state
    this.setState({ busyBlocks: curBusyBlocks, unsavedChanges: true });
  }

  isItDST() {
    const today = new Date();
    const jan = new Date(today.getFullYear(), 0, 1);

    if (today.getTimezoneOffset() === jan.getTimezoneOffset()) {
      return false;
    }
    return true;
  }

  //function for rendering component
  render() {
    const busyBlockCards = this.state.busyBlocks.map((data, idx) => (
      <div key={idx + "outermostDiv"}>
        <div className="Card Card-Blue" key={idx}>
          <br></br>
          <label key={idx + "name"}>{data[4]}</label>
          <div className="splitscreen">
            <div className="bleft">
              <li key={idx + "startDate"}>{data[0]}</li>
              <li key={idx + "start"}>{data[1]}</li>
            </div>
            <div className="bright">
              <li key={idx + "endDate"}>{data[2]}</li>
              <li key={idx + "stop"}>{data[3]}</li>
            </div>
          </div>
          <input
            type="button"
            value="Remove"
            onClick={(event) => this.removeBusyBlock(data, idx)}
          />
        </div>
        <br />
      </div>
    ));

    const errorMessages = this.state.eMsg.map((data, idx) => (
      <p key={"eMsg" + idx} className="ErrorMessage">
        {data}
      </p>
    ));

    return (
      <div className="outerMost">
        {" "}
        <div className="splitscreen">
          <div className="aleft">
            <h2>Input Busy Block:</h2>
            <form>
              <label htmlFor="name">Busy Block Name:</label>
              <br />
              <input
                required="required"
                type="text"
                name="name"
                value={this.state.name}
                onChange={this.handleChange}
              />
              <br />
              <label htmlFor="startDate">Busy Start Date:</label>
              <br />
              <input
                type="date"
                name="startDate"
                value={this.state.startDate}
                onChange={this.handleChange}
              />
              <br />
              <label htmlFor="bstime">Busy Start Time (Eastern Time):</label>
              <br />
              <input
                type="time"
                name="bstime"
                value={this.state.bstime}
                onChange={this.handleChange}
              />
              <br />
              <label htmlFor="endDate">Busy End Date:</label>
              <br />
              <input
                type="date"
                name="endDate"
                value={this.state.endDate}
                onChange={this.handleChange}
              />
              <br />
              <label htmlFor="betime">Busy End Time (Eastern Time):</label>
              <br />
              <input
                type="time"
                name="betime"
                value={this.state.betime}
                onChange={this.handleChange}
              />
              <br />
              <div>{errorMessages}</div>
              <input type="button" value="Add" onClick={this.handleAdd} />
              <input
                type="button"
                value="Save Changes"
                onClick={this.handleSubmit}
              />
            </form>
          </div>
          <br />
          <div className="aright">
            <h2>Your Busy Blocks ({this.isItDST() ? "EDT" : "EST"}):</h2>
            {this.state.unsavedChanges ? (
              <p className="unsavedWarning">You have unsaved changes.</p>
            ) : (
              ""
            )}
            <ul>{busyBlockCards}</ul>
          </div>
        </div>
      </div>
    );
  }
}

export default BusyForm;

// USED FOR TESTING
//function to condense the busy blocks
// condenseBusyBlocks() {
//   //get clone of busy blocks
//   let cloneBlocks = [...this.state.busyBlocks];

//   if (cloneBlocks.length < 1) {
//     return [];
//   }

//   //create condensed array, add first item of busyBlocks clone
//   let condensedBlocks = [[...cloneBlocks[0]]];

//   //loop through busy blocks
//   for (let i = 1; i < cloneBlocks.length; i++) {
//     //get previous blocks
//     let currentBlock = cloneBlocks[i];
//     let previousBlock = condensedBlocks[condensedBlocks.length - 1];
//     //destructure into variables
//     let [
//       currentDay,
//       currentStart,
//       currentEndDate,
//       currentEnd,
//       currentReason,
//     ] = currentBlock;
//     let [
//       previousStartDate,
//       previousStart,
//       previousEndDate,
//       previousEnd,
//       previousReason,
//     ] = previousBlock;

//     //check for overlap, if current Day is <= previous End date
//     let isLessThan = currentDay < previousEndDate;
//     let isEqualTo = currentDay === previousEndDate;
//     if (isLessThan || isEqualTo) {
//       if (isLessThan || previousEnd >= currentStart) {
//         //create new merged previous block
//         let newPreviousBlock = [
//           previousStartDate,
//           previousStart,
//           currentEndDate >= previousEndDate
//             ? currentEndDate
//             : previousEndDate,
//           currentEndDate > previousEndDate
//             ? currentEnd
//             : previousEndDate > currentEndDate
//             ? previousEnd
//             : currentEnd >= previousEnd
//             ? currentEnd
//             : previousEnd,
//         ];

//         //replace old previous block with the new merged block
//         condensedBlocks[condensedBlocks.length - 1] = newPreviousBlock;
//       } else {
//         //no overlap. Add to array.
//         condensedBlocks.push([
//           currentDay,
//           currentStart,
//           currentEndDate,
//           currentEnd,
//         ]);
//       }
//     } else {
//       //New day, no overlap possible. Add to array.
//       condensedBlocks.push([
//         currentDay,
//         currentStart,
//         currentEndDate,
//         currentEnd,
//       ]);
//     }
//   }

//   //return result
//   return condensedBlocks;
// }

//debug
// componentDidUpdate() {
//   console.log("updated");
//   console.log(this.state);
// }
