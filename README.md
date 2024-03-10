# TypeScript LeetCode Discord Bot

This Discord bot is built to enhance the coding practice experience by integrating LeetCode challenges directly within your Discord server. It simplifies the process of accessing LeetCode problems, offering hints, and managing discussions through automated features. Developed using TypeScript and Node.js, this bot brings a structured approach to tackling coding problems as a community.

## Features

- **Daily Challenge Retrieval**: Fetches and posts the LeetCode question of the day in a specified channel.
- **Hints on Demand**: Offers hints for LeetCode questions to aid users in finding solutions.
- **Roadmap Discussion Threads**: Automates the creation and management of daily threads for a series of questions following a predefined roadmap, encouraging focused group study sessions.

## Setup Instructions

### Prerequisites

- Node.js must be installed on your system.

### Installation

1. **Clone the Repository**
   - Use `git clone <repository-url>` to clone this project to your local machine.

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
    ```

4. **Start the Development Server**
   - Initiate the bot in development mode with:
     ```
     npm run dev
     ```
   - This launches the bot with hot reload enabled, facilitating immediate feedback during development.

## Usage

Once the bot is operational on your Discord server, it can be interacted with using the following commands:

- **Help**: `!help` — Displays a list of available commands.
- **Daily Challenge**: `!daily` — Retrieves and posts the LeetCode question of the day.
- **Request a Hint**: `!hint <question-id>` — Provides a hint for the specified LeetCode question.

## Contributing

- **Branching**: For new features, bug fixes, or refactors, please create a separate branch prefixed accordingly with `feature/`, `bugfix/`, or `refactor/`, followed by a brief description of your work.
- **Pull Requests (PRs)**: Once your work is ready for review, create a pull request against the main branch.
- **Commit Categorization**: We use Gitmoji to categorize commits.
- **Squashing Commits**: Before merging, squash your commits in your pull request to maintain a clean and linear project history. This practice simplifies reverting changes and understanding project evolution.