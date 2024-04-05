require("dotenv").config();
const https = require("https");
const fs = require("fs");
const path = require("path");
const filterIrrelevantFiles = require("./filters/irrelevant-files.js");

const token = process.env.GITHUB_TOKEN;
const repoPath = process.env.REPO_PATH;

function getRepoContents(
  apiPath,
  callback,
  parentPath = "",
  currentResults = [],
  dirCount = { active: 1 }
) {
  const options = {
    hostname: "api.github.com",
    path: `/repos/${repoPath}/contents/${apiPath}`,
    method: "GET",
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "Node.js",
    },
  };

  https
    .get(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        let items = JSON.parse(data);
        items.forEach((item) => {
          if (item.type === "dir") {
            dirCount.active++;
            getRepoContents(
              item.path,
              callback,
              `${parentPath}/${item.name}`,
              currentResults,
              dirCount
            );
          } else {
            currentResults.push({
              name: item.name,
              type: item.type,
              path: `${parentPath}/${item.name}`,
            });
          }
        });
        dirCount.active--;
        if (dirCount.active === 0) {
          callback(currentResults);
        }
      });
    })
    .on("error", (e) => {
      console.error(`Erro ao obter conteúdo: ${e.message}`);
    });
}

function getLatestRelease(callback) {
  const options = {
    hostname: "api.github.com",
    path: `/repos/${repoPath}/releases/latest`,
    method: "GET",
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "Node.js",
    },
  };

  https
    .get(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const release = JSON.parse(data);
        callback(release.tag_name); // Usa a tag da última release como a "versão" do repositório
      });
    })
    .on("error", (e) => {
      console.error(`Erro ao obter a última versão: ${e.message}`);
    });
}

function checkAndSaveContents(version) {
  const jsonDir = path.join(__dirname, "JSON");
  if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir);
  }

  const repoName = repoPath.split("/").pop(); // Obtém o nome do repositório a partir do caminho
  const filePath = path.join(jsonDir, `${repoName}-v${version}.json`);

  if (fs.existsSync(filePath)) {
    console.log("A última versão já foi consultada. Operação abortada.");
    return;
  }

  getRepoContents("", (results) => {
    const filteredResults = filterIrrelevantFiles(results);
    const jsonContent = JSON.stringify(filteredResults, null, 2);
    fs.writeFileSync(filePath, jsonContent, "utf8");
    console.log(`Arquivo salvo: ${filePath}`);
  });
}

// Inicia o processo
getLatestRelease((version) => {
  checkAndSaveContents(version);
});
