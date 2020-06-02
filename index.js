const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");

var _ = require('lodash');
var fuzzy = require('fuzzy');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

let repos = [];
let repoUrl = "";
let userChoices = {};
let badge = "";

function searchRepos(answers, input) {
    input = input || '';
    return new Promise(function (resolve) {
        setTimeout(function () {
            var fuzzyResult = fuzzy.filter(input, repos);
            resolve(
                fuzzyResult.map(function (element) {
                    return element.original;
                })
            );
        }, _.random(30, 500));
    });
}

inquirer.prompt([
    {
        type: "input",
        message: "What is your Github username?",
        name: "username"
    },
    {
        type: "input",
        message: "What is the title of your project?",
        name: "title"
    },
    {
        type: "input",
        message: "What is the description for your project?",
        name: "description"
    },
    {
        type: "input",
        message: "How do you install the project?",
        name: "installation"
    },
    {
        type: "input",
        message: "Explain the usage",
        name: "usage"
    },
    {
        type: "confirm",
        message: "Is there a licence?",
        name: "licenceConfirm"
    },
    {
        type: "input",
        message: "Input licence name",
        name: "licenceInput",
        when: (answers) => answers.licenceConfirm === true,
    },
    {
        type: "confirm",
        message: "Do you want a credits section?",
        name: "creditsConfirm"
    },
    {
        type: "input",
        message: "Input the credits",
        name: "creditsInput",
        when: (answers) => answers.creditsConfirm === true,
    }
])
    .then((response) => {
        // SETTING VALUE IF NO INPUT FROM USER
        !response.creditsInput ? response.creditsInput = "N/A" : response.creditsInput;
        !response.licenceInput ? response.licenceInput = "N/A" : response.licenceInput;

        userChoices = response
        return response

    })
    // CREATING INITIAL README FILE WITH FIRST SECTIONS
    .then((response) => {
        fs.writeFile(`README.md`, `# ${response.title}
${response.description}
# Table of content
- [Installation](#installation)
- [Usage](#usage)
- [Licence](#licence)
- [Contributing](#contributing)
- [Questions](#questions)
# Installation
${response.installation}
# Usage
${response.usage}
# Licence
${response.licenceInput}
# Credits
${response.creditsInput}
`
            , (error) => {
                if (error) {
                    console.log(error);
                }
            })
        return response.username
    })

    .then((response) => axios
        .get(`https://api.github.com/users/${userChoices.username}`)
        .then((response) => {
            repoUrl = response.data.repos_url
            return repoUrl
        }))
    .then((response) => axios
        .get(response)
        .then((response) => {
            const allRepos = response.data
            allRepos.forEach((element) => {
                repos.push(element.name)
            });
        }
        ))
    .then((response) => {
        asyncInq(response)
        asyncAppend()
    }).catch((err) => console.log(err))
