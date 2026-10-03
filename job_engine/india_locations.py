"""
Job Engine - All-India Location Normalizer & Registry (india_locations.py)
Normalizes city names, states, and regional corridors across Pan-India technology and consulting hubs.
"""

import re
from typing import List, Dict, Optional, Tuple, Any

# Canonical Pan-India Tech & Consulting Locations
INDIA_LOCATION_REGISTRY: List[Dict[str, Any]] = [
    {
        "id": "all_india",
        "name": "All India (Remote & Nationwide)",
        "aliases": ["all india", "india", "pan india", "remote india", "work from home", "wfh", "anywhere in india", "remote"],
        "region": "Pan-India",
        "tier": "National",
    },
    {
        "id": "bengaluru",
        "name": "Bengaluru, Karnataka",
        "aliases": ["bengaluru", "bangalore", "karnataka", "whitefield", "electronic city", "bellandur", "koramangala", "indiranagar", "manyata"],
        "region": "South",
        "tier": "Tier 1",
    },
    {
        "id": "pune",
        "name": "Pune, Maharashtra",
        "aliases": ["pune", "hinjawadi", "magarpatta", "kharadi", "vimannagar", "baner", "wakad", "hadapsar", "maharashtra"],
        "region": "West",
        "tier": "Tier 1",
    },
    {
        "id": "hyderabad",
        "name": "Hyderabad, Telangana",
        "aliases": ["hyderabad", "secunderabad", "telangana", "hitec city", "gachibowli", "madhapur", "kondapur", "financial district"],
        "region": "South",
        "tier": "Tier 1",
    },
    {
        "id": "delhi_ncr",
        "name": "Delhi NCR (Gurgaon / Noida / New Delhi)",
        "aliases": ["delhi", "new delhi", "delhi ncr", "ncr", "gurgaon", "gurugram", "noida", "greater noida", "faridabad", "cyber city"],
        "region": "North",
        "tier": "Tier 1",
    },
    {
        "id": "mumbai",
        "name": "Mumbai / Navi Mumbai / Thane",
        "aliases": ["mumbai", "navi mumbai", "thane", "bkc", "bandra", "andheri", "powai", "airoli", "goregaon", "lower parel"],
        "region": "West",
        "tier": "Tier 1",
    },
    {
        "id": "chennai",
        "name": "Chennai, Tamil Nadu",
        "aliases": ["chennai", "madras", "tamil nadu", "omr", "sholinganallur", "guindy", "tidel park", "siruseri"],
        "region": "South",
        "tier": "Tier 1",
    },
    {
        "id": "kolkata",
        "name": "Kolkata, West Bengal",
        "aliases": ["kolkata", "calcutta", "west bengal", "salt lake", "sector v", "new town", "rajarhat"],
        "region": "East",
        "tier": "Tier 2",
    },
    {
        "id": "ahmedabad",
        "name": "Ahmedabad / Gandhinagar, Gujarat",
        "aliases": ["ahmedabad", "gandhinagar", "gujarat", "gift city", "sg highway", "prahlad nagar"],
        "region": "West",
        "tier": "Tier 2",
    },
    {
        "id": "kochi",
        "name": "Kochi / Cochin, Kerala",
        "aliases": ["kochi", "cochin", "kerala", "infopark", "kakkanad", "technopark", "trivandrum", "thiruvananthapuram"],
        "region": "South",
        "tier": "Tier 2",
    },
    {
        "id": "jaipur",
        "name": "Jaipur, Rajasthan",
        "aliases": ["jaipur", "rajasthan", "sitapura", "mahindra world city"],
        "region": "North",
        "tier": "Tier 2",
    },
    {
        "id": "indore",
        "name": "Indore, Madhya Pradesh",
        "aliases": ["indore", "madhya pradesh", "crystal it park", "super corridor"],
        "region": "Central",
        "tier": "Tier 2",
    },
    {
        "id": "chandigarh",
        "name": "Chandigarh / Mohali",
        "aliases": ["chandigarh", "mohali", "panchkula", "tricity", "punjab", "haryana"],
        "region": "North",
        "tier": "Tier 2",
    },
    # Secondary: Global / International Options
    {
        "id": "worldwide_remote",
        "name": "Worldwide / Global Remote",
        "aliases": ["worldwide", "global", "anywhere in the world", "remote worldwide", "international remote", "global remote"],
        "region": "Global",
        "tier": "International",
    },
    {
        "id": "us_north_america",
        "name": "US / North America (Remote / Relocation)",
        "aliases": ["united states", "usa", "us", "san francisco", "new york", "seattle", "austin", "canada", "toronto", "vancouver"],
        "region": "North America",
        "tier": "International",
    },
    {
        "id": "europe_uk",
        "name": "Europe & UK (Remote / Relocation)",
        "aliases": ["uk", "united kingdom", "london", "germany", "berlin", "amsterdam", "netherlands", "ireland", "dublin", "france", "paris"],
        "region": "Europe",
        "tier": "International",
    },
    {
        "id": "singapore_apac",
        "name": "Singapore & APAC (Remote / Relocation)",
        "aliases": ["singapore", "australia", "sydney", "melbourne", "tokyo", "japan", "apac", "dubai", "uae"],
        "region": "APAC",
        "tier": "International",
    },
]

# Quick lookup dropdown list for frontend (India First -> Worldwide Second)
INDIA_LOCATION_DROPDOWN_OPTIONS = [
    # --- Top Priority: India Metro & National Corridors ---
    "All India (Remote & Nationwide)",
    "Bengaluru, Karnataka",
    "Pune, Maharashtra",
    "Hyderabad, Telangana",
    "Delhi NCR (Gurgaon / Noida)",
    "Mumbai / Navi Mumbai",
    "Chennai, Tamil Nadu",
    "Kolkata, West Bengal",
    "Ahmedabad / GIFT City, Gujarat",
    "Kochi / Trivandrum, Kerala",
    "Jaipur, Rajasthan",
    "Indore, Madhya Pradesh",
    "Chandigarh / Mohali",
    # --- Secondary: International & Worldwide Remote ---
    "Worldwide / Global Remote",
    "US / North America (Remote / Relocation)",
    "Europe & UK (Remote / Relocation)",
    "Singapore & APAC (Remote / Relocation)",
]


def is_india_job(raw_location: str) -> bool:
    """Returns True if the location is within India or is Pan-India/Remote."""
    if not raw_location:
        return True
    text = raw_location.lower().strip()
    if any(k in text for k in ["india", "bengaluru", "bangalore", "pune", "hyderabad", "delhi", "ncr", "gurgaon", "gurugram", "noida", "mumbai", "chennai", "kolkata", "ahmedabad", "kochi", "jaipur", "indore", "chandigarh", "mohali", "remote", "wfh"]):
        return True
    return False


def normalize_location(raw_location: str) -> str:
    """
    Normalizes arbitrary location string to standard Indian metro, region, or Global hub.
    """
    if not raw_location or not raw_location.strip():
        return "All India (Remote & Nationwide)"

    text = raw_location.lower().strip()

    # Direct match against registry aliases
    for item in INDIA_LOCATION_REGISTRY:
        if item["id"] in ("all_india", "worldwide_remote"):
            continue
        for alias in item["aliases"]:
            pattern = rf"\b{re.escape(alias)}\b"
            if re.search(pattern, text):
                return item["name"]

    # Remote checks
    if any(k in text for k in ["remote", "wfh", "anywhere", "flexible", "virtual", "distributed"]):
        if any(k in text for k in ["global", "worldwide", "international", "anywhere in the world"]):
            return "Worldwide / Global Remote"
        return "All India (Remote & Nationwide)"

    # Default to All India if India mentioned
    if "india" in text or "in" in text.split():
        return "All India (Remote & Nationwide)"

    return raw_location.strip()


def matches_location_filter(job_location: str, filter_location: str) -> bool:
    """
    Determines if a job's location matches the user's selected location filter.
    'All India' matches everything located in India or Remote.
    'Worldwide' matches any job.
    """
    if not filter_location or filter_location.startswith("All India") or filter_location.lower() in ("remote", "all"):
        # For All India filter, prioritize India jobs and general Remote jobs
        return True

    if "worldwide" in filter_location.lower() or "global" in filter_location.lower():
        return True

    filter_norm = normalize_location(filter_location).lower()
    job_norm = normalize_location(job_location).lower()

    if filter_norm in job_norm or job_norm in filter_norm:
        return True

    # Check alias keywords
    for item in INDIA_LOCATION_REGISTRY:
        if item["name"].lower() == filter_norm or item["id"] in filter_norm:
            for alias in item["aliases"]:
                if alias in job_location.lower():
                    return True

    # If job is remote or all-india, it matches any city filter
    if "remote" in job_location.lower() or "all india" in job_norm or "all india" in job_location.lower():
        return True

    return False


PAN_INDIA_HUBS = INDIA_LOCATION_DROPDOWN_OPTIONS


def is_valid_india_location(raw_location: str) -> bool:
    """
    Checks if raw_location corresponds to a recognized Indian city, state, hub or Pan-India/Remote.
    """
    if not raw_location:
        return False
    text = raw_location.lower().strip()
    if any(k in text for k in ["remote", "wfh", "anywhere", "india"]):
        return True
    for item in INDIA_LOCATION_REGISTRY:
        for alias in item["aliases"]:
            if alias in text:
                return True
    return False
