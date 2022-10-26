from flask import Flask, request
from flask_cors import CORS
import json


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:*", "http://127.0.0.1:*"]}})

@app.route("/api/save", methods=['POST'])
def save_data():
  """ Serializes and writes the JSON business object passed in from an Angular
  application POST request. """

  # Print to console.
  # print('Text', file=sys.stderr)

  # Serialize the JSON passed in from the request. The `application/json`
  # `Content-Type` header was set in the Angular application.
  json_object = json.dumps(request.json, indent=2)
  # Write the serialized JSON to a file. The 'with' keyword will close the file.
  with open("app-config.json", "w") as outfile:
    outfile.write(json_object)

  return json_response({'Saved to file': 'true'})

def json_response(payload, status=200):
  """ Returns the response with the serialized payload, status, and type. """
  return (json.dumps(payload), status, {'content-type':'application/json'})