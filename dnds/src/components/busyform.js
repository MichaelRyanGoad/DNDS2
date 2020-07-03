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

  handleSubmit(event) {
    event.preventDefault();
    this.addBusyBlock([0, 100]);
  }

  addBusyBlock(bblock) {
    let curBusyBlocks = [...this.state.busyBlocks];
    console.log(curBusyBlocks);
    curBusyBlocks.push(bblock);
    this.setState({
      busyBlocks: curBusyBlocks,
    });
  }

  render() {
    const busyBlockCards = this.state.busyBlocks.map((start, stop) => (
      <div className="Card" key={stop}>
        <li key={stop + "start"}>{start[0]}</li>
        <li key={stop + "stop"}>{start[1]}</li>
      </div>
    ));

    return (
      <div>
        {" "}
        <form>
          <label htmlFor="name">Name:</label>
          <br />
          <input
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
        <br />
        <ul>{busyBlockCards}</ul>
      </div>
    );
  }
}

export default BusyForm;
