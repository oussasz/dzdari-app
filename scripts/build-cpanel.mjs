import { mkdir, rm, cp, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "cpanel");
const standaloneDir = path.join(root, ".next", "standalone");
const staticDir = path.join(root, ".next", "static");
const publicDir = path.join(root, "public");

const exists = async (p) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

const copyDir = async (from, to) => {
  await cp(from, to, { recursive: true });
};

const main = async () => {
  if (!(await exists(standaloneDir))) {
    throw new Error(
      "Missing .next/standalone. Run `npm run build` or `npm run build:cpanel` first.",
    );
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  await copyDir(standaloneDir, outputDir);

  const nextDir = path.join(outputDir, ".next");
  await mkdir(nextDir, { recursive: true });
  await copyDir(staticDir, path.join(nextDir, "static"));

  if (await exists(publicDir)) {
    await copyDir(publicDir, path.join(outputDir, "public"));
  }

  // Copy prisma schema for migrations/inspection if needed
  const prismaDir = path.join(root, "prisma");
  if (await exists(prismaDir)) {
    await copyDir(prismaDir, path.join(outputDir, "prisma"));
  }

  console.log("cPanel build prepared at ./cpanel");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
