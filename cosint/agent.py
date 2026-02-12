import os
from typing import Type
from pydantic import BaseModel, Field
from langchain.tools import BaseTool
from langchain_openai import ChatOpenAI
from langchain_classic.agents import AgentExecutor
from langchain_classic.agents.openai_tools.base import create_openai_tools_agent
from langchain_classic import hub
from dotenv import load_dotenv
from .api_client import CongressAPIClient

load_dotenv()

class MemberSearchInput(BaseModel):
    name: str = Field(description="The name of the Congress member to search for")

class MemberDetailsInput(BaseModel):
    bioguide_id: str = Field(description="The Bioguide ID of the Congress member")

class MemberSearchTool(BaseTool):
    name: str = "search_congress_member"
    description: str = "Search for a Congress member by name to get their Bioguide ID and basic info"
    args_schema: Type[BaseModel] = MemberSearchInput
    client: CongressAPIClient = Field(default_factory=CongressAPIClient)

    def _run(self, name: str):
        member = self.client.search_member_by_name(name)
        if member:
            return member
        return f"No member found with name: {name}"

class MemberDetailsTool(BaseTool):
    name: str = "get_congress_member_details"
    description: str = "Get detailed information about a Congress member using their Bioguide ID"
    args_schema: Type[BaseModel] = MemberDetailsInput
    client: CongressAPIClient = Field(default_factory=CongressAPIClient)

    def _run(self, bioguide_id: str):
        details = self.client.get_member_details(bioguide_id)
        if details:
            return details
        return f"No details found for Bioguide ID: {bioguide_id}"

def get_cosint_agent():
    llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0)
    tools = [MemberSearchTool(), MemberDetailsTool()]
    
    # Get the prompt to use - you can modify this!
    prompt = hub.pull("hwchase17/openai-tools-agent")
    
    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    
    return agent_executor
