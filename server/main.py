from flask import Flask, request

app = Flask(__name__)

@app.route("/api/build", method=['POST'])
def hello_world():
  print('It actually worked!')
  print(request)