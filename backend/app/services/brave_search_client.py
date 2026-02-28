import os
import httpx
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class BraveSearchClient:
    BASE_URL = "https://api.search.brave.com/res/v1/web/search"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("BRAVE_SEARCH_API_KEY")
        if not self.api_key:
            print("[BraveSearch] WARNING: BRAVE_SEARCH_API_KEY not found in environment")

    def search(self, query: str, count: int = 5) -> Dict[str, Any]:
        """
        Perform a web search using Brave Search API (sync).
        """
        if not self.api_key or "your_brave_search_api_key" in self.api_key:
            raise ValueError("BRAVE_SEARCH_API_KEY is not set or is a placeholder.")

        headers = {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": self.api_key
        }
        params = {
            "q": query,
            "count": count
        }

        with httpx.Client(timeout=15) as client:
            response = client.get(self.BASE_URL, headers=headers, params=params)
            response.raise_for_status()
            return response.json()

    async def async_search(self, query: str, count: int = 5) -> Dict[str, Any]:
        """
        Perform a web search using Brave Search API (async).
        """
        if not self.api_key or "your_brave_search_api_key" in self.api_key:
            raise ValueError("BRAVE_SEARCH_API_KEY is not set or is a placeholder.")

        headers = {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": self.api_key
        }
        params = {
            "q": query,
            "count": count
        }

        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(self.BASE_URL, headers=headers, params=params)
            response.raise_for_status()
            return response.json()

    def format_search_results(self, data: Dict[str, Any]) -> str:
        """
        Format search results into a readable string for the LLM.
        """
        web_results = data.get("web", {}).get("results", [])

        if not web_results:
            return "No web search results found."

        result = "Web Search Results:\n"
        for i, res in enumerate(web_results):
            title = res.get("title", "No Title")
            url = res.get("url", "No URL")
            description = res.get("description", "No Description")
            result += f"\n{i+1}. {title}\n   URL: {url}\n   Summary: {description}\n"

        return result
