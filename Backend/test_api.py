import requests

payload = {
    "days": 3,
    "people": 2,
    "interests": [
        "Nature",
        "Photography"
    ]
}

response = requests.post(
    "http://127.0.0.1:5000/api/itinerary/generate",
    json=payload
)

print(response.json())