import sys
import base64
import json
output = {}
for file in sys.argv[1:]:
    with open(file, 'rb') as f:
        data = f.read()
        output[file] = base64.b64encode(data).decode('utf-8')
json.dump(output, sys.stdout)
