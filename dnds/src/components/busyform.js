import React from "react";
import "../App.css";

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
    this.handleSubmit = this.handleSubmit.bind(this);
    this.removeBusyBlock = this.removeBusyBlock.bind(this);
    this.validateInput = this.validateInput.bind(this);
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
        curBlock[1] == this.state.date &&
        curBlock[2] == this.state.bstime &&
        curBlock[3] == this.state.betime
      ) {
        alert("This time block already exists!");
        isValid = false;
      }
    }

    return isValid;
  }

  handleSubmit(event) {
    //prevent default form submit behavior (reloading page, etc...)
    event.preventDefault();

    //temp logs
    console.log("submitted");
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
  condenseBusyBlocks() {}

  addBusyBlock(bblock) {
    console.log("gonna add dis");

    //get clone of current block array
    let curBusyBlocks = [...this.state.busyBlocks];

    //temp log to see clone of busy blocks
    console.log(curBusyBlocks);

    //add block to clone array
    curBusyBlocks.push(bblock);

    //update state with updated clone array
    this.setState({
      busyBlocks: curBusyBlocks,
    });
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
              <input type="submit" value="Submit" onClick={this.handleSubmit} />
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
