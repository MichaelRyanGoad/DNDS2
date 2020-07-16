import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../graphql/queries";
import awsconfig from "../aws-exports";
API.configure(awsconfig);

class GlobalSchedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bschedule: [],
      fschedule: [],
      sessionLength: 60,
    };
    this.generateFreeSchedule = this.generateFreeSchedule.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidUpdate() {
    console.log("updated");
    console.log(this.state);
  }

  componentDidMount() {
    console.log("mounted");
    console.log(this.state);
    //query database for global schedule and set state
    API.graphql(
      graphqlOperation(queries.getUserSchedule, { username: "global" })
    ).then((data, err) => {
      if (err) {
        console.log(err);
      }
      this.setState({
        ...this.state,
        bschedule: data.data.getUserSchedule.schedule,
      });
      this.generateFreeSchedule();
    });
  }

  generateFreeSchedule() {
    if (this.state.bschedule.length < 1) {
      this.setState({
        ...this.state,
        fschedule: [
          [
            ["This is where a schedule would go...", "...IF I HAD ONE!"],
            ["Maybe it's a bug...", "...Or maybe you are the bug, Kafka."],
          ],
        ],
      });
      return;
    }

    //schedule of free blocks
    let fsched = [];

    //set iterating variables
    let block1 = [];
    let block2 = [];
    const sessionLength = this.state.sessionLength;

    //todo does not currently take care of cases where bschedule has < 2 elements.

    for (let x = 1; x < this.state.bschedule.length; x++) {
      //get blocks
      block1 = this.state.bschedule[x - 1];
      block2 = this.state.bschedule[x];

      //format date objects from blocks
      let d1 = new Date(block1[0] + " " + block1[2]);
      let d2 = new Date(block2[0] + " " + block2[1]);

      //if block between dates is >= minimum session length, add it to the list of free blocks.
      if (this.getDifferenceInMinutes(d1, d2) >= sessionLength) {
        fsched.push([
          [block1[0], block1[2]],
          [block2[0], block2[1]],
        ]);
      }
    }

    //padding start and end of week

    //getting current date
    const date = new Date();
    let yyyy = date.getFullYear();
    let mm = String(date.getMonth() + 1).padStart(2, "0");
    let dd = String(date.getDate()).padStart(2, "0");
    let today = yyyy + "-" + mm + "-" + dd;

    //get date and times variables for start padding
    let startTime =
      (date.getHours() + "").padStart(2, "0") +
      ":" +
      (date.getMinutes() + "").padStart(2, "0");
    let endDate = this.state.bschedule[0][0];
    let endTime = this.state.bschedule[0][1];
    let d2 = new Date(endDate + " " + endTime);

    console.log(d2);

    //check if starting pad meets session length and add to fsched if so
    if (this.getDifferenceInMinutes(date, d2) >= sessionLength) {
      const startPadding = [
        [today, startTime],
        [endDate, endTime],
      ];
      fsched.splice(0, 0, startPadding);
    }

    //todo pad end

    //get date 2 weeks from now
    let nextWeek = new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000);
    //set cap to end of day
    nextWeek.setHours(23, 59, 59);
    yyyy = nextWeek.getFullYear();
    mm = String(nextWeek.getMonth() + 1).padStart(2, "0");
    dd = String(nextWeek.getDate()).padStart(2, "0");
    endDate = yyyy + "-" + mm + "-" + dd;

    //get date and times variables for end padding
    startTime = this.state.bschedule[this.state.bschedule.length - 1][3];
    let startDate = this.state.bschedule[this.state.bschedule.length - 1][2];

    endTime =
      (nextWeek.getHours() + "").padStart(2, "0") +
      ":" +
      (nextWeek.getMinutes() + "").padStart(2, "0");
    d2 = new Date(startDate + " " + startTime);

    //check if ending pad meets session length and add to fsched if so
    if (this.getDifferenceInMinutes(d2, nextWeek) >= sessionLength) {
      const endPadding = [
        [startDate, startTime],
        [endDate, endTime],
      ];
      fsched.push(endPadding);
    }

    //
    if (fsched.length < 1) {
      fsched = [
        [
          [
            "Nobody's schedule aligned...",
            "...it's probably because you are adults...",
          ],
          [
            "...maybe your session length is too long...",
            "...maybe lower your expectations?",
          ],
        ],
      ];
    }

    //update state
    this.setState({
      ...this.state,
      fschedule: fsched,
    });

    //temp logs
    console.log("TESTER2");
    console.log(fsched);
  }

  //format to get the number of minutes between two date objects
  getDifferenceInMinutes(date1, date2) {
    const diffInMs = date2 - date1;
    return diffInMs / (1000 * 60);
  }

  //change handler
  handleChange(event) {
    const value = event.target.value;
    this.setState({
      ...this.state,
      [event.target.name]: value,
    });
  }

  render() {
    //

    let scheduleCards = this.state.bschedule.map((data, idx) => (
      <div key={idx + "div"} className="Card">
        <div className="splitscreen">
          <div className="left">
            <p key={idx + "startDate"}>{data[0]}</p>
            <li key={idx + "startTime"}>{data[1]}</li>
          </div>
          <div className="right">
            <p key={idx + "endDate"}>{data[2]}</p>
            <li key={idx + "endTime"}>{data[3]}</li>
          </div>
        </div>
      </div>
    ));

    let fScheduleCards = this.state.fschedule.map((data, idx) => (
      <div key={idx + "div"} className="Card">
        <div className="splitscreen">
          <div className="left">
            <p key={idx + "startDate"}>{data[0][0]}</p>
            <li key={idx + "startTime"}>{data[0][1]}</li>
          </div>
          <div className="right">
            <p key={idx + "endDate"}>{data[1][0]}</p>
            <li key={idx + "endTime"}>{data[1][1]}</li>
          </div>
        </div>
      </div>
    ));

    return (
      <div>
        <label>Minimum session length (minutes):</label>
        <input
          type="text"
          name="sessionLength"
          onChange={this.handleChange}
          value={this.state.sessionLength}
        />
        <br />
        <input
          type="button"
          value="Generate Schedule"
          onClick={this.generateFreeSchedule}
        />
        <div className="splitscreen">
          <div className="left">
            <p>Busy Blocks</p>
            {scheduleCards}
          </div>
          <div className="right">
            <p>Free Blocks</p>
            {fScheduleCards}
          </div>
        </div>
      </div>
    );
  }
}
export default GlobalSchedule;
