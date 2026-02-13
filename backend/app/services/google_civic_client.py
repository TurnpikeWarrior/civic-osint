import os
import requests
import re
from typing import Optional, Dict, Any, List, Tuple
from dotenv import load_dotenv

load_dotenv()

class GoogleCivicClient:
    BASE_URL = "https://www.googleapis.com/civicinfo/v2"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_CIVIC_API_KEY")

    def get_divisions_by_address(self, address: str) -> Dict[str, Any]:
        """
        Fetch political divisions for a given address using the new divisionsByAddress endpoint.
        Note: The old representativesByAddress endpoint was retired in April 2025.
        """
        if not self.api_key or "your_google_civic_api_key" in self.api_key:
            raise ValueError("GOOGLE_CIVIC_API_KEY is not set or is a placeholder.")

        url = f"{self.BASE_URL}/divisionsByAddress"
        params = {
            "key": self.api_key,
            "address": address
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()

    def extract_district_info(self, data: Dict[str, Any]) -> Tuple[Optional[str], Optional[int]]:
        """
        Extract state and district number from OCD IDs.
        Example OCD ID: ocd-division/country:us/state:nj/cd:8
        """
        divisions = data.get("divisions", {})
        state = None
        district = None

        for ocd_id in divisions.keys():
            # Check for state
            state_match = re.search(r"state:([a-z]{2})", ocd_id)
            if state_match:
                state = state_match.group(1).upper()
            
            # Check for district
            district_match = re.search(r"cd:(\d+)", ocd_id)
            if district_match:
                district = int(district_match.group(1))
            elif "cd:at-large" in ocd_id:
                district = 0 # Convention for at-large
        
        return state, district

    def format_division_info(self, data: Dict[str, Any]) -> str:
        """
        Format the divisions info into a readable string.
        """
        normalized = data.get("normalizedInput", {})
        address_str = f"{normalized.get('line1', '')} {normalized.get('city', '')}, {normalized.get('state', '')} {normalized.get('zip', '')}".strip()
        
        divisions = data.get("divisions", {})
        result = f"Political divisions for: {address_str}\n"
        for ocd_id, info in divisions.items():
            result += f"- {info.get('name')} (ID: {ocd_id})\n"
        
        return result
