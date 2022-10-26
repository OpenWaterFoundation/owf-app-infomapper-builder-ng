from flask import Flask, json, request
import sys

app = Flask(__name__)

@app.route("/api/build", methods=['POST'])
def save_data():
  print('It actually worked!', file=sys.stderr)

  data = request.get_data()
  print(data, file=sys.stderr)

  return json_response({'test': 'test'})

def json_response(payload, status=200):
  return (json.dumps(payload), status, {'content-type':'application/json'})