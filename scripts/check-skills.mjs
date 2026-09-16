import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const skillsRoot = "skills";

if (!existsSync(skillsRoot)) {
  console.error(`Missing ${skillsRoot}/ directory.`);
  process.exit(1);
}

const failures = [];
const skillDirectories = readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const directory of skillDirectories) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(directory)) {
    failures.push(`${directory}: directory names must be lower-case kebab-case`);
    continue;
  }

  const skillPath = join(skillsRoot, directory, "SKILL.md");
  if (!existsSync(skillPath)) {
    failures.push(`${directory}: missing SKILL.md`);
    continue;
  }

  const contents = readFileSync(skillPath, "utf8");
  const match = contents.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    failures.push(`${directory}: SKILL.md must begin with YAML front matter`);
    continue;
  }

  const frontMatter = match[1];
  const name = frontMatter.match(/^name:\s*["']?([^\n"']+)["']?\s*$/m)?.[1]?.trim();
  const description = frontMatter.match(/^description:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim();

  if (name !== directory) failures.push(`${directory}: front-matter name must equal directory name`);
  if (!description) failures.push(`${directory}: front matter requires a description`);
}

if (failures.length) {
  console.error("Skill validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validated ${skillDirectories.length} skill package(s).`);
