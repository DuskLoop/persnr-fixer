const fs = require("fs");
const inquirer = require("inquirer");

const openTag = '<cbc:CompanyID schemeID="SE:PERSNR">';
const closingTag = "</cbc:CompanyID>";

const getRegex = () => new RegExp(`${openTag}(\\d*)${closingTag}`, "g");

const dirPath = process.cwd();

const readFile = fileName => fs.readFileSync(fileName, { encoding: "utf8" });

const fileIsXml = fileName => fileName.endsWith(".xml");

const fileIsFixable = fileName => {
  const fileContent = readFile(fileName);

  const [fullMatch, persnr] = getRegex().exec(fileContent);

  return persnr.length === 10;
};

const getFixableFilesNumber = () => getFixableFileNames().length;

const getFixableFileNames = () => {
  const filesInDirectory = fs.readdirSync(dirPath, { encoding: "utf8" });

  const xmlFilesInDirectory = filesInDirectory.filter(fileIsXml);
  const fixableXmlFiles = xmlFilesInDirectory.filter(fileIsFixable);

  return fixableXmlFiles;
};

const fixFile = fileName => {
  const fileContent = readFile(fileName);

  const fixedContent = fileContent.replace(getRegex(), (fullMatch, persnr) => {
    return `${openTag}19${persnr}${closingTag}`;
  });

  fs.writeFileSync(fileName, fixedContent, { encoding: "utf8" });
};

const fixFiles = () => {
  const fixableFileNames = getFixableFileNames();
  fixableFileNames.forEach(fixFile);
};

const promt = () => {
  const numberFilesTofix = getFixableFilesNumber();
  let questions;
  if (numberFilesTofix === 0) {
    questions = [
      {
        type: "list",
        name: "action",
        message: `${numberFilesTofix} filer som går att fixa hittade`,
        choices: ["sök igen", "avsluta"]
      }
    ];
  } else {
    questions = [
      {
        type: "list",
        name: "action",
        message: `${numberFilesTofix} filer som går att fixa hittade, vad vill du göra?`,
        choices: ["fixa", "sök igen", "avsluta"]
      }
    ];
  }

  inquirer.prompt(questions).then(answers => {
    if (answers.action === "fixa") {
      fixFiles();
      console.log(`${numberFilesTofix} filer fixade`);
      promt();
    } else if (answers.action === "sök igen") {
      promt();
    } else if (answers.action === "fixa") {
    }
  });
};

promt();
