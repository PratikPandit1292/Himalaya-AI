import requests

base = "http://localhost:5000"

print("=== NLP SEARCH ===")
r1 = requests.get(base + "/api/recommend/search?q=peaceful+monastery+mountain", timeout=10)
d1 = r1.json()
print("Status:", r1.status_code)
for res in d1.get("results", [])[:3]:
    name = res["place_name"]
    pct = res["similarity_pct"]
    print(f"  {name} -- {pct}% match")

print("\n=== BEST DATES ===")
r2 = requests.get(base + "/api/recommend/best-dates?destination=Tsomgo Lake", timeout=15)
d2 = r2.json()
print("Status:", r2.status_code)
print("Recommendation:", str(d2.get("recommendation", ""))[:80])
for d in d2.get("best_dates", [])[:3]:
    print(f"  {d['date']} ({d['day_of_week']}) -- {d['crowd_level']}")

print("\n=== K-MEANS CIRCUITS ===")
r3 = requests.get(base + "/api/recommend/circuits", timeout=10)
d3 = r3.json()
print("Status:", r3.status_code)
for cid, c in d3.get("circuits", {}).items():
    print(f"  Circuit {cid}: {c['name']} ({c['place_count']} places)")
