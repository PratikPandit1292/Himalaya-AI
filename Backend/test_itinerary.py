from services.itinerary_service import *

result = generate_complete_itinerary(
    days=3,
    people=2,
    interests=["Nature", "Photography"]
)

print("\nTraveler Profile:")
print(result["traveler_profile"])

print("\nEstimated Cost:")
print(f"₹{result['estimated_cost']}")

if result["hidden_gem"]:
    print("\n🌟 Hidden Gem:")
    print(result["hidden_gem"]["place_name"])

print("\n========== ITINERARY ==========")

for day, details in result["itinerary"].items():

    print(f"\n{day}")
    print("Region:", details["region"])

    for place in details["places"]:
        print("-", place["place_name"])