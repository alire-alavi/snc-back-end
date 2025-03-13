module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v3.0! Your function executed successfully!",
        input: event,
      },
      null,
      2,
    ),
  };
};

module.exports.authorize = async (event) => {};
module.exports.jwks = async (event) => {};
module.exports.token = async (event) => {};
