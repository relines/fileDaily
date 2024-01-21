const fs = require('fs');
const path = require('path');

const { dialog } = require('electron');

export default {
  chooseFolder() {
    dialog
      .showOpenDialog({ properties: ['openDirectory'] })
      .then((result) => {
        console.log(1234, result.filePaths);
        return result.filePaths[0];
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
