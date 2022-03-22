'use strict';
exports.handler = async (event) => {
  console.log('Event: ', JSON.stringify(event, null, 2));
  return event.Records[0].cf.response;
};