import os
import requests
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class BraveSearchClient:
    BASE_URL = "https://api.search.brave.com/res/v1/web/search"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("BRAVE_SEARCH_API_KEY")

    def search(self, query: str, count: int = 5) -> Dict[str, Any]:
        """
        Perform a web search using Brave Search API.
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
        
        response = requests.get(self.BASE_URL, headers=headers, params=params)
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
