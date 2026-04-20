// middleware/responseFormatter.js

// Format sukses
const success = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    data: data,
    message: message,
  });
};

// Format error
const error = (res, message, statusCode = 500, data = null) => {
  return res.status(statusCode).json({
    status: "error",
    data: data,
    message: message,
  });
};

// Format created (201)
const created = (res, data, message = "Resource created successfully") => {
  return res.status(201).json({
    status: "success",
    data: data,
    message: message,
  });
};

// Format not found (404)
const notFound = (res, message = "Resource not found") => {
  return res.status(404).json({
    status: "error",
    data: null,
    message: message,
  });
};

// Format bad request (400)
const badRequest = (res, message = "Bad request") => {
  return res.status(400).json({
    status: "error",
    data: null,
    message: message,
  });
};

// Format unauthorized (401)
const unauthorized = (res, message = "Unauthorized") => {
  return res.status(401).json({
    status: "error",
    data: null,
    message: message,
  });
};

// Format forbidden (403)
const forbidden = (res, message = "Forbidden") => {
  return res.status(403).json({
    status: "error",
    data: null,
    message: message,
  });
};

module.exports = {
  success,
  error,
  created,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
};
