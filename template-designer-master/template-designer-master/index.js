const { spawn } = require("child_process");
const { bold } = require("chalk");
let colorCount = 1;
const startProcesses = async (processList) =>
  [...processList].forEach(async (processItem) => {
    const processSrvCmdSplit = `${processItem}`.split("--proc");
    const processSrvName = processSrvCmdSplit[1].trim();
    const processCmdSplit = `${processSrvCmdSplit[0]}`.trim().split(" ");
    let processMainCmd = `${processCmdSplit[0]}`;
    const processCmdArgs = processCmdSplit.slice(1);
    const isWinPlatform = new RegExp("win").test(process.platform);
    const processCmdColor = generateColor();
    const chalk = bold.rgb(
      processCmdColor.r,
      processCmdColor.g,
      processCmdColor.b
    );

    if (processMainCmd === "npm" && isWinPlatform) processMainCmd = "npm.cmd";

    const proc = spawn(processMainCmd, processCmdArgs);
    proc.stdout.on(
      "data",
      (dC) =>
        `${processSrvName} : ${console.log(chalk(Buffer.from(dC).toString()))}`
    );

    proc.stderr.on(
      "data",
      (dC) =>
        `${processSrvName} Error : ${console.log(
          chalk(Buffer.from(dC).toString())
        )}`
    );

    proc.on(
      "error",
      (error) =>
        `${processSrvName} Error : ${console.log(chalk(error.message))}`
    );
  });
const processCmdColor = [
  {
    r: 255,
    g: 215,
    b: 0,
  },

  {
    r: 127,
    g: 255,
    b: 0,
  },
  {
    r: 255,
    g: 255,
    b: 0,
  },
  {
    r: 0,
    g: 255,
    b: 255,
  },
  {
    r: 245,
    g: 245,
    b: 220,
  },
];
const generateColor = () => {
  if (colorCount > processCmdColor.length) colorCount = 1;
  count = colorCount - 1;

  colorCount++;

  return {
    r: processCmdColor[count].r,
    g: processCmdColor[count].g,
    b: processCmdColor[count].b,
  };
};

async function callProcess() {
  startProcesses([
    "arangod -c=F:/ArangoDB3-3.8.2/etc/arangodb3/arangod.conf --proc arangodb",
  ]);

  setTimeout(function () {
    console.log("calling nats...");
    startProcesses(["nats-server.exe --proc nats"]);
  }, 4000);

  setTimeout(function () {
    console.log("calling paython...")
    startProcesses([
      "python ./svn/svn-server.py -c config/config.json --proc svn",
    ]);
  }, 8000);

  setTimeout(function () {
    console.log("calling backend...");
    startProcesses(["npm --prefix backend run dev --proc backend"]);
  }, 20000);

  setTimeout(function () {
    startProcesses(["npm --prefix frontend run serve --proc frontend"]);
  }, 30000);
}
callProcess();
