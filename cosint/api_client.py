import os
import requests
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class CongressAPIClient:
    BASE_URL = "https://api.congress.gov/v3"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("CONGRESS_API_KEY")
        if not self.api_key:
            raise ValueError("CONGRESS_API_KEY not found. Please set it in your environment or .env file.")

    def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.BASE_URL}/{endpoint.lstrip('/')}"
        default_params = {"api_key": self.api_key, "format": "json"}
        if params:
            default_params.update(params)
        
        response = requests.get(url, params=default_params)
        response.raise_for_status()
        return response.json()

    def get_members(self, current_member: bool = True, limit: int = 20, state: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetch a list of members, optionally filtered by state.
        """
        params = {"limit": limit}
        if current_member:
            params["currentMember"] = "true"
        if state:
            params["state"] = state
        
        data = self._get("member", params=params)
        return data.get("members", [])

    def get_member_details(self, bioguide_id: str) -> Dict[str, Any]:
        """
        Fetch details for a specific member by their Bioguide ID.
        """
        data = self._get(f"member/{bioguide_id}")
        return data.get("member", {})

    def get_sponsored_legislation(self, bioguide_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Fetch legislation sponsored by a specific member.
        """
        params = {"limit": limit}
        data = self._get(f"member/{bioguide_id}/sponsored-legislation", params=params)
        return data.get("sponsoredLegislation", [])

    def search_member_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """
        A helper to find a member by name. 
        Splits the search query into parts and ensures all parts are present in the member name.
        """
        members = self.get_members(limit=250)
        search_parts = name.lower().split()
        
        for m in members:
            member_name_lower = m.get("name", "").lower()
            if all(part in member_name_lower for part in search_parts):
                return m
        return None
