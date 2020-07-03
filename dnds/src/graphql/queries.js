/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUserSchedule = /* GraphQL */ `
  query GetUserSchedule($username: ID!) {
    getUserSchedule(username: $username) {
      username
      schedule
    }
  }
`;
export const listUserSchedules = /* GraphQL */ `
  query ListUserSchedules(
    $filter: TableUserScheduleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUserSchedules(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        username
        schedule
      }
      nextToken
    }
  }
`;
