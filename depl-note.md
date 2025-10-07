# Depl workflow
    mono-repo: single git repository for all of the services.

    Local Machine
        make changes
        commit code
        push branch to git -> Github
                                Receives upB
                                Create PR
                                GH automatically runs tests
                                After test pass, you merge PR into master
                                because mstr has changed, github builds and deploys


# Create github actions

code pushed
PR create => Event => run github action
PR closed
Repo is forked 

name: tests
on:
  pull_request

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm install
        working-directory: ./auth
      - name: Run tests
        run: npm run test:ci
        working-directory: ./auth
    