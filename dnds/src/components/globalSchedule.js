import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../graphql/queries";
import awsconfig from "../aws-exports";
API.configure(awsconfig);

class GlobalSchedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gsched: "",
    };
  }

  componentDidMount() {
    //query database for global schedule and set state
    API.graphql(
      graphqlOperation(queries.getUserSchedule, { username: "global" })
    ).then((data, err) => {
      if (err) {
        console.log(err);
      }
      this.setState({ gsched: data.data.getUserSchedule.schedule });
    });
  }

  render() {
    //
    return <div>{this.state.gsched}</div>;
  }
}
export default GlobalSchedule;
