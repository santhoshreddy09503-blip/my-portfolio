const contactHandler = require("../../api/contact");

exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        headers: {},
        body: ""
    };

    const res = {
        setHeader(name, value) {
            response.headers[name] = value;
        },
        status(statusCode) {
            response.statusCode = statusCode;
            return this;
        },
        json(body) {
            response.headers["Content-Type"] = "application/json";
            response.body = JSON.stringify(body);
            return this;
        },
        end() {
            return this;
        }
    };

    let body = event.body;
    if (event.isBase64Encoded && typeof body === "string") {
        body = Buffer.from(body, "base64").toString("utf8");
    }

    await contactHandler({ method: event.httpMethod, body }, res);

    return response;
};
