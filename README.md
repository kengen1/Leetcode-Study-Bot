# TypeScript LeetCode Discord Bot

This Discord bot is built to improve the process of preparing for technical interviews by integrating LeetCode challenges directly within your Discord server. It simplifies and automates the retrieval of LeetCode problems, topic tags, solution hints, as well as providing dedicated spaces for discussion and collaboration on problems. Developed using TypeScript and Node.js, this bot brings a structured approach to tackling interview problems as a community.

## Features

- **Daily Challenge Retrieval**: Fetches and posts the LeetCode question of the day in a specified channel.
- **Tags on Demand**: 
- **Hints on Demand**: Offers hints for LeetCode questions to aid users in finding solutions.
- **Roadmap Discussion Threads**: Automates the creation and management of daily threads for a series of questions following a predefined roadmap, encouraging focused group study sessions.

## Setup Instructions

### Prerequisites

- Node.js must be installed on your system.

### Installation

1. **Clone the Repository**
   - Use `git clone https://github.com/kengen1/Leetcode-Study-Bot.git` to clone this project to your local machine.

2. **Install Dependencies**
   - Change to the project directory and execute:
     ```
     npm install
     ```

3. **Set Up Environment Variables**
   - Create a `.env` file in the project's root directory.
   - Populate the file with the following environment variables:
    ```
    DISCORD_TOKEN=<insert token>
    DISCORD_CLIENT_ID=<insert client id>
    DISCORD_CHANNEL_ID=<insert channel id>
    DISCORD_DAILY_CHALLENGE_CHANNEL_ID=<insert daily challenge channel id>
    DISCORD_ROADMAP_CHANNEL_ID=<insert roadmap channel id>
    ```

4. **Start the Development Server**
   - Initiate the bot in development mode with:
     ```
     npm run dev
     ```
   - This launches the bot with hot reload enabled, facilitating immediate feedback during development.

## Usage

Once the bot is operational on your Discord server, it can be interacted with using the following commands:

- **Request a Random Problem to Solve**: `!random` - Creates a dedicated thread for a randomly selected leetcode problem.
- **Request Topic Tags for a Problem**: `!tags` - Provides all available topic tags for a given question (This command can only be called within a question thread).
- **Request a Hint**: `!hint` — Provides all hints for the specified LeetCode question, in hidden message format (This command can only be called within a question thread).
