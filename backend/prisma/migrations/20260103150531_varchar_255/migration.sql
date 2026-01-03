-- AlterTable
ALTER TABLE "controls" ALTER COLUMN "status" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "evidence_artifacts" ALTER COLUMN "artifact_type" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "framework_control_predecessors" ALTER COLUMN "status" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "framework_controls" ALTER COLUMN "mapping_policy" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "framework_versions" ALTER COLUMN "status" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "policy_revisions" ALTER COLUMN "status" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "policy_sections" ALTER COLUMN "section_number" SET DATA TYPE VARCHAR(255);
