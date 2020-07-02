
// Constructor. Takes the current document as a string and optionally the array
// of all operations.
function Server (document, operations) {
  this.document = document;
  this.operations = operations || [];
}

// Call this method whenever you receive an operation from a client.
Server.prototype.receiveOperation = function (revision, operation) {
  const client = operation.client;
  const timestamp = operation.timestamp;

  if (revision < 0 || this.operations.length < revision) {
    throw new Error("operation revision not in history");
  }
  // Find all operations that the client didn't know of when it sent the
  // operation ...
  var concurrentOperations = this.operations.slice(revision);
  // ... and transform the operation against all these operations ...
  var transform = operation.constructor.transform;
  for (var i = 0; i < concurrentOperations.length; i++) {
    operation = transform(operation, concurrentOperations[i])[0];
  }
  
  operation.client = client;
  operation.timestamp = timestamp;

  // ... and apply that on the document.
  this.document = operation.apply(this.document);
  // Store operation in history.
  this.operations.push(operation);

  // It's the caller's responsibility to send the operation to all connected
  // clients and an acknowledgement to the creator.
  return operation;
};

module.exports = Server;
