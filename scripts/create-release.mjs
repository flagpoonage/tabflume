import { execSync } from "child_process";
import pkg from "../package.json" assert { type: "json" };
import build_params from "../environment/build-params.json" assert { type: "json" };

const args = process.argv;

const target = (() => {
  const target_arg = args.find((a) => a.startsWith("--target="));
  return target_arg ? target_arg.split("--target=")[1] : null;
})();

try {
  execSync("zip --help && unzip --help");
} catch (ex) {
  console.error(
    "You need to install the zip and unzip cli tools to create releases"
  );
  process.exit(1);
}

// These only need to be run once because they aren't different between builds.
try {
  execSync("npm run make-build", { stdio: [0, 1, 2] });
} catch (ex) {
  console.error("Release exited with non-zero code");
}

const envs = Object.keys(build_params);
const time = new Date();

const zpad = (v) => (v <= 9 ? `0${v}` : v.toString());

const time_string = `${time.getFullYear()}${zpad(time.getMonth() + 1)}${zpad(
  time.getDate()
)}_${zpad(time.getHours())}${zpad(time.getMinutes())}`;

try {
  for (const env of envs) {
    const artifact_name = `ext_${
      pkg.version
    }_${env.toUpperCase()}_${time_string}.zip`;
    execSync(`NODE_ENV=production node ./.build/build.js --env=${env}`, {
      stdio: [0, 1, 2],
    });
    execSync(`cd ./build && zip -r ../.build/releases/${artifact_name} *`);
    console.log("Packed release:", `./.build/releases/${artifact_name}`);
  }
} catch (ex) {
  console.error("Release exited with non-zero code", ex);
}
