/*
* Project: Milestone 1
* File Name: IOhandler.js
* Description: Collection of functions for files input/output related operations
*
* Created Date:
* Author:
*
*/

const { error } = require("console")

const yauzl = require("yauzl-promise"),
  fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path"),
  {pipeline} = require('stream/promises')

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */

const unzip = async (pathIn, pathOut) => {
  const zip = await yauzl.open(pathIn)
  try {
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        await fs.promises.mkdir(`${pathOut}/${entry.filename}`)
      } else {
        const readStream = await entry.openReadStream()
        const writeStream = fs.createWriteStream(`${pathOut}/${entry.filename}`)
        // await this stream finishes before do anything else
        await pipeline(readStream, writeStream)
      }
    }
  } finally {
    await zip.close()
    console.log("Extraction operation complete!")
  }
}

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */

const readDir = async (dir) => {
  return new Promise((resolve,reject) => {
    fs.readdir(dir, "utf8", (err,data) => {
      if (err) {
          reject(err)
      }
      else {
        let imagesList = []
        data.forEach(img => {
          if(path.extname(img) == '.png') {
            imagesList.push(img)
          }
        });
        resolve(imagesList)
      }
    })
  })
}

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */

const grayScale = async (pathIn, pathOut, choice) => {
  const imagesList = await readDir(pathIn)
  console.log(imagesList)

  imagesList.forEach(img => {
    fs.createReadStream(`${pathIn}/${img}`)

      .pipe(
        new PNG({ filterType: 4 })
      )

      .on("parsed", function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            let idx = (this.width * y + x) << 2

            if (choice == 1) {
              let newColor = 0.2126*this.data[idx] + 0.7152*this.data[idx+1] + 0.0722*this.data[idx+2]
              this.data[idx] = newColor
              this.data[idx+1] = newColor
              this.data[idx+2] = newColor
            }

            if (choice == 2) {
              this.data[idx] = Math.min(0.393*this.data[idx] + 0.769*this.data[idx+1] + 0.189*this.data[idx+2], 255)
              this.data[idx+1] = Math.min(0.349*this.data[idx] + 0.686*this.data[idx+1] + 0.168*this.data[idx+2], 255)
              this.data[idx+2] = Math.min(0.272*this.data[idx] + 0.534*this.data[idx+1] + 0.131*this.data[idx+2], 255)
            }

            if (choice == 3) {
              this.data[idx] = 255 - this.data[idx]
              this.data[idx+1] = 255 - this.data[idx+1]
              this.data[idx+2] = 255 - this.data[idx+2]
            }
          }
        }

        this.pack().pipe(fs.createWriteStream(`${pathOut}/${img}`))
      })

      .on('error', err => {
        console.error('Error:', err)
    })
  })
}

module.exports = {
  unzip,
  readDir,
  grayScale,
};