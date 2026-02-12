import os
from typing import Type
from pydantic import BaseModel, Field
from langchain.tools import BaseTool
from langchain_openai import ChatOpenAI
from langchain_classic.agents import AgentExecutor
from langchain_classic.agents.openai_tools.base import create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from dotenv import load_dotenv
from .api_client import CongressAPIClient

load_dotenv()

class MemberSearchInput(BaseModel):
    name: str = Field(description="The name of the Congress member to search for")

class MemberDetailsInput(BaseModel):
    bioguide_id: str = Field(description="The Bioguide ID of the Congress member")

class MemberStateSearchInput(BaseModel):
    state_code: str = Field(description="The 2-letter state code (e.g., 'NJ', 'NY', 'CA')")

class MemberSearchTool(BaseTool):
    name: str = "search_congress_member_by_name"
    description: str = "Search for a Congress member by name to get their Bioguide ID and basic info"
    args_schema: Type[BaseModel] = MemberSearchInput
    client: CongressAPIClient = Field(default_factory=CongressAPIClient)

    def _run(self, name: str):
        member = self.client.search_member_by_name(name)
        if member:
            return member
        return f"No member found with name: {name}"

class MemberStateSearchTool(BaseTool):
    name: str = "search_congress_members_by_state"
    description: str = "Get a list of Congress members representing a specific state using its 2-letter code"
    args_schema: Type[BaseModel] = MemberStateSearchInput
    client: CongressAPIClient = Field(default_factory=CongressAPIClient)

    def _run(self, state_code: str):
        members = self.client.get_members(state=state_code, limit=100)
        if members:
            # Return a concise list to avoid overwhelming the LLM
            return [{"name": m.get("name"), "bioguideId": m.get("bioguideId"), "party": m.get("partyName")} for m in members]
        return f"No members found for state: {state_code}"

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

class MemberLegislationTool(BaseTool):
    name: str = "get_member_sponsored_legislation"
    description: str = "Get a list of legislation sponsored by a Congress member using their Bioguide ID"
    args_schema: Type[BaseModel] = MemberDetailsInput
    client: CongressAPIClient = Field(default_factory=CongressAPIClient)

    def _run(self, bioguide_id: str):
        legislation = self.client.get_sponsored_legislation(bioguide_id, limit=5)
        if legislation:
            return legislation
        return f"No sponsored legislation found for Bioguide ID: {bioguide_id}"

def get_cosint_agent():
    llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0)
    tools = [MemberSearchTool(), MemberStateSearchTool(), MemberDetailsTool(), MemberLegislationTool()]
    
    # Define the prompt locally to avoid dependency on LangSmith Hub
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant specialized in US Congress information. "
                   "Use the provided tools to search for and retrieve member details. "
                   "- Use 'search_congress_members_by_state' when asked about members from a specific state or region. "
                   "- Use 'search_congress_member_by_name' when you have a specific person's name. "
                   "- Use 'get_congress_member_details' to get full info once you have a Bioguide ID. "
                   "If you cannot find a member, explain why or suggest alternative names."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])
    
    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=False)
    
    return agent_executor
