/*
* Project: Milestone 1
* File Name: main.js
* Description:
*
* Created Date:
* Author:
*
*/

const path = require("path")
const IOhandler = require("./IOhandler")
const zipFilePath = path.join(__dirname, "myfile.zip")
const pathUnzipped = path.join(__dirname, "unzipped")
const pathProcessed = path.join(__dirname, "grayscaled")
const readline = require('readline-sync')

async function main(){
    try {
        let choice = readline.question("Convert options:\n1. Grayscale\n2. Sepia\n3. Invert\n>> ")
        await IOhandler.unzip(zipFilePath, pathUnzipped)
        IOhandler.grayScale(pathUnzipped, pathProcessed, choice)
    } catch (error) {
        console.error(error)
    }
}

main()