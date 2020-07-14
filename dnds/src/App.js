import React, { Component } from "react";
import logo from "./logo.png";
import "./App.css";
import { Auth, API } from "aws-amplify";
import awsconfig from "./aws-exports";
import { withAuthenticator } from "aws-amplify-react";
import "@aws-amplify/ui/dist/style.css";
import BusyForm from "./components/busyform";
import GlobalSchedule from "./components/globalSchedule";
Auth.configure(awsconfig);
API.configure(awsconfig);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "form",
    };
    //binds go here
    this.loadFormElement = this.loadFormElement.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
  }

  onPageChange() {
    if (this.state.page === "form") {
      this.setState({
        page: "global",
      });
    } else {
      this.setState({
        page: "form",
      });
    }
    return this.loadFormElement();
  }

  loadFormElement() {
    switch (this.state.page) {
      case "form":
        return <BusyForm />;
      case "global":
        return <GlobalSchedule />;
      default:
        return <p>What?</p>;
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <input
            type="button"
            value={
              this.state.page === "form" ? "Global Schedule" : "Schedule Form"
            }
            onClick={this.onPageChange}
          ></input>
        </header>
        <div className="App-body">
          <this.loadFormElement />
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, {
  includeGreetings: true,
  signUpConfig: {
    hiddenDefaults: ["phone_number"],
    signUpFields: [{ key: "phone_number", required: false }],
  },
});
