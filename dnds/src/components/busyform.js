import React from "react";
import "../App.css";
import { Auth, API, graphqlOperation } from "aws-amplify";
import * as mutations from "../graphql/mutations";
import awsconfig from "../aws-exports";
API.configure(awsconfig);

class BusyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      busyBlocks: [],
      name: "",
      date: "",
      bstime: "",
      betime: "",
    };
    //binds go here
    this.addBusyBlock = this.addBusyBlock.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.removeBusyBlock = this.removeBusyBlock.bind(this);
    this.validateInput = this.validateInput.bind(this);
    this.condenseBusyBlocks = this.condenseBusyBlocks.bind(this);
    this.sortBusyBlocks = this.sortBusyBlocks.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  //unfinished todo
  handleSubmit() {
    //Get username from Auth
    Auth.currentAuthenticatedUser().then((data) => {
      //set up return object
      let retObj = {
        username: data.username,
        schedule: this.condenseBusyBlocks(),
      };

      //temp log
      console.log(retObj);

      console.log("Attempting to send object to database");

      //todo send retObj to database
      API.graphql(
        graphqlOperation(mutations.createUserSchedule, { input: retObj })
      )
        .then((data) => {
          console.log(data);
          console.log("DATA CREATED ABOVE!");
        })
        .catch((e) => {
          API.graphql(
            graphqlOperation(mutations.updateUserSchedule, { input: retObj })
          )
            .then((data) => {
              console.log(data);
              console.log("DATA UPDATED ABOVE!");
            })
            .catch((err) => {
              console.log("ERROR");
              console.log(e);
              console.log(err);
            });
        });
    });
  }

  sortBusyBlocks() {
    console.log("SORT BUSY BLOCKS FIRED");

    //clone busyBlocks
    let clone = [...this.state.busyBlocks];

    //sort function
    clone.sort(function (x, y) {
      if (x[1] !== y[1]) {
        return x[1] < y[1] ? -1 : 1;
      }
      return x[2] < y[2] ? -1 : 1;
    });

    //set new state
    this.setState({
      busyBlocks: clone,
    });
  }

  componentDidMount() {
    console.log("mounted");
    console.log(this.state);
  }

  componentDidUpdate() {
    console.log("updated");
    console.log(this.state);
  }

  handleChange(event) {
    const value = event.target.value;
    this.setState({
      ...this.state,
      [event.target.name]: value,
    });
  }

  validateInput(data) {
    let isValid = true;

    //getting current date
    const date = new Date();
    const yyyy = date.getFullYear();
    let mm = String(date.getMonth() + 1).padStart(2, "0");
    let dd = String(date.getDate()).padStart(2, "0");
    const today = yyyy + "-" + mm + "-" + dd;

    if (!this.state.name) {
      alert("Please enter a name");
      isValid = false;
    }
    if (!this.state.date) {
      alert("Please enter a date");
      isValid = false;
    }
    if (!this.state.bstime) {
      alert("Please enter a busy start time");
      isValid = false;
    }
    if (!this.state.betime) {
      alert("Please enter a busy end time");
      isValid = false;
    }
    if (this.state.bstime >= this.state.betime) {
      alert("Please make sure your end time is after your start time");
      isValid = false;
    }
    if (this.state.date < today) {
      console.log(this.state.date);
      console.log(today);
      alert("Dates must not be in the past");
      isValid = false;
    }
    //TEMP TODO
    for (let i = 0; i < this.state.busyBlocks.length; i++) {
      let curBlock = this.state.busyBlocks[i];
      console.log("CUR BLOCK");
      console.log(curBlock);
      if (
        curBlock[1] === this.state.date &&
        curBlock[2] === this.state.bstime &&
        curBlock[3] === this.state.betime
      ) {
        alert("This time block already exists!");
        isValid = false;
      }
    }

    return isValid;
  }

  handleAdd(event) {
    //prevent default form submit behavior (reloading page, etc...)
    event.preventDefault();

    //temp logs
    console.log("HANDLE ADD FIRED");
    console.log(event);

    const data = [
      this.state.name,
      this.state.date,
      this.state.bstime,
      this.state.betime,
    ];

    const isValid = this.validateInput(data);
    if (isValid) {
      //add the form data to the current state
      this.addBusyBlock(data);
    } else {
      //NOT FINISHED TODO
      console.log("FORM WAS NOT VALID");
    }
  }

  //function to condense the busy blocks
  condenseBusyBlocks() {
    //get clone of busy blocks
    let cloneBlocks = [...this.state.busyBlocks];

    console.log("CLONE");
    console.log(cloneBlocks);

    //create condensed array, add first item of busyBlocks clone
    let condensedBlocks = [[...cloneBlocks[0]]];
    condensedBlocks[0].splice(0, 1);

    console.log("CONDENSED BLOCKS");
    console.log(condensedBlocks);

    //loop through busy blocks
    for (let i = 1; i < cloneBlocks.length; i++) {
      //get previous blocks
      let currentBlock = cloneBlocks[i];
      let previousBlock = condensedBlocks[condensedBlocks.length - 1];
      //destructure into variables
      let [currentName, currentDay, currentStart, currentEnd] = currentBlock;
      let [previousDay, previousStart, previousEnd] = previousBlock;

      if (previousDay === currentDay) {
        if (previousEnd >= currentStart) {
          console.log("MERGE REACHED");
          console.log(currentEnd);
          console.log(previousEnd);
          console.log(Math.max(currentEnd, previousEnd));
          //create new merged previous block
          let newPreviousBlock = [
            currentDay,
            previousStart,
            currentEnd >= previousEnd ? currentEnd : previousEnd,
          ];
          //replace old previous block
          console.log("Ending overlap - merge happening");
          console.log(currentName);
          condensedBlocks[condensedBlocks.length - 1] = newPreviousBlock;
        } else {
          console.log("Ending - same day, no overlap");
          console.log(currentName);
          condensedBlocks.push([currentDay, currentStart, currentEnd]);
        }
      } else {
        console.log("Ending - Different day");
        console.log(currentName);
        condensedBlocks.push([currentDay, currentStart, currentEnd]);
      }
    }

    //temp log
    console.log(condensedBlocks);

    //return result
    return condensedBlocks;
  }

  addBusyBlock(bblock) {
    console.log("gonna add dis");

    //get clone of current block array
    let curBusyBlocks = [...this.state.busyBlocks];

    //temp log to see clone of busy blocks
    console.log(curBusyBlocks);

    //add block to clone array
    curBusyBlocks.push(bblock);

    //update state with updated clone array
    this.setState(
      {
        busyBlocks: curBusyBlocks,
      },
      () => {
        this.sortBusyBlocks();
      }
    );
  }

  removeBusyBlock(data, idx) {
    //temp logs
    console.log("gonna remove dis");
    console.log(data);
    console.log(idx);

    //get clone of data
    let curBusyBlocks = [...this.state.busyBlocks];

    //remove the data
    curBusyBlocks.splice(idx, 1);

    //update current state
    this.setState({ busyBlocks: curBusyBlocks });
  }

  render() {
    const busyBlockCards = this.state.busyBlocks.map((data, idx) => (
      <div className="Card" key={idx}>
        <li key={idx + "name"}>{data[0]}</li>
        <li key={idx + "date"}>{data[1]}</li>
        <li key={idx + "start"}>{data[2]}</li>
        <li key={idx + "stop"}>{data[3]}</li>
        <button onClick={(event) => this.removeBusyBlock(data, idx)}>
          remove
        </button>
      </div>
    ));

    return (
      <div className="outerMost">
        {" "}
        <div className="splitscreen">
          <div className="left">
            <form>
              <label htmlFor="name">Name:</label>
              <br />
              <input
                required="required"
                type="text"
                name="name"
                value={this.state.name}
                onChange={this.handleChange}
              />
              <br />
              <label htmlFor="date">Date:</label>
              <br />
              <input
                type="date"
                name="date"
                value={this.state.date}
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
              <label htmlFor="betime">Busy End Time:</label>
              <br />
              <input
                type="time"
                name="betime"
                value={this.state.betime}
                onChange={this.handleChange}
              />
              <br />
              <br />
              <input type="button" value="Add" onClick={this.handleAdd} />
              <input type="button" value="Submit" onClick={this.handleSubmit} />
            </form>
          </div>
          <br />
          <div className="right">
            <ul>{busyBlockCards}</ul>
          </div>
        </div>
      </div>
    );
  }
}

export default BusyForm;
