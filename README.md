# COSINT - Congress Open Source Intelligence Tool

COSINT is a terminal-based application that utilizes LangChain and the Congress.gov API to provide information about Congress representatives.

## Setup

1. **Clone the repository** (if applicable).
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your API keys:
   ```env
   CONGRESS_API_KEY=your_congress_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   * Get a Congress API key at [api.congress.gov](https://api.congress.gov/).
   * Get an OpenAI API key at [platform.openai.com](https://platform.openai.com/).

## Usage

Run the application:
```bash
python main.py
```

## Features

* **Natural Language Queries**: Ask about representatives by name or state.
* **Detailed Biographies**: Retrieve specific member details.
* **Interactive CLI**: Easy-to-use terminal interface with `rich` formatting.
