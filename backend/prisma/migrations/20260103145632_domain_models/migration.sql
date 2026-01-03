/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "frameworks" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "framework_versions" (
    "id" TEXT NOT NULL,
    "framework_id" TEXT NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "effective_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "framework_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_categories" (
    "id" TEXT NOT NULL,
    "framework_version_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" VARCHAR(200) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirement_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirements" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "text" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "framework_controls" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "framework_version_id" TEXT NOT NULL,
    "canonical_key" VARCHAR(100) NOT NULL,
    "display_code" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "text" TEXT,
    "content_hash" VARCHAR(64),
    "mapping_policy" VARCHAR(20) NOT NULL DEFAULT 'MANUAL_REVIEW',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "framework_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "framework_control_predecessors" (
    "id" TEXT NOT NULL,
    "framework_control_id" TEXT NOT NULL,
    "predecessor_id" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'SUGGESTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "framework_control_predecessors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controls" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    "owner_id" TEXT,
    "note" TEXT,
    "custom_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_framework_mappings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "framework_control_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_framework_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_evidence_mappings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "evidence_id" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_evidence_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_test_mappings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_test_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_policy_mappings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_policy_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidences" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_artifacts" (
    "id" TEXT NOT NULL,
    "evidence_id" TEXT NOT NULL,
    "artifact_type" VARCHAR(20) NOT NULL,
    "file_path" VARCHAR(500),
    "url" VARCHAR(2000),
    "hash" VARCHAR(64),
    "size_bytes" BIGINT,
    "collected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_revisions" (
    "id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "effective_date" DATE,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_sections" (
    "id" TEXT NOT NULL,
    "policy_revision_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "section_number" VARCHAR(20) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "framework_controls_canonical_key_key" ON "framework_controls"("canonical_key");

-- CreateIndex
CREATE UNIQUE INDEX "framework_control_predecessors_framework_control_id_predece_key" ON "framework_control_predecessors"("framework_control_id", "predecessor_id");

-- CreateIndex
CREATE INDEX "controls_tenant_id_idx" ON "controls"("tenant_id");

-- CreateIndex
CREATE INDEX "controls_tenant_id_status_idx" ON "controls"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "control_framework_mappings_tenant_id_idx" ON "control_framework_mappings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_framework_mappings_control_id_framework_control_id_key" ON "control_framework_mappings"("control_id", "framework_control_id");

-- CreateIndex
CREATE INDEX "control_evidence_mappings_tenant_id_idx" ON "control_evidence_mappings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_evidence_mappings_control_id_evidence_id_key" ON "control_evidence_mappings"("control_id", "evidence_id");

-- CreateIndex
CREATE INDEX "control_test_mappings_tenant_id_idx" ON "control_test_mappings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_test_mappings_control_id_test_id_key" ON "control_test_mappings"("control_id", "test_id");

-- CreateIndex
CREATE INDEX "control_policy_mappings_tenant_id_idx" ON "control_policy_mappings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "control_policy_mappings_control_id_policy_id_key" ON "control_policy_mappings"("control_id", "policy_id");

-- CreateIndex
CREATE INDEX "evidences_tenant_id_idx" ON "evidences"("tenant_id");

-- CreateIndex
CREATE INDEX "policies_tenant_id_idx" ON "policies"("tenant_id");

-- AddForeignKey
ALTER TABLE "framework_versions" ADD CONSTRAINT "framework_versions_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "frameworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_categories" ADD CONSTRAINT "requirement_categories_framework_version_id_fkey" FOREIGN KEY ("framework_version_id") REFERENCES "framework_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_categories" ADD CONSTRAINT "requirement_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "requirement_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "requirement_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "framework_controls" ADD CONSTRAINT "framework_controls_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "framework_controls" ADD CONSTRAINT "framework_controls_framework_version_id_fkey" FOREIGN KEY ("framework_version_id") REFERENCES "framework_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "framework_control_predecessors" ADD CONSTRAINT "framework_control_predecessors_framework_control_id_fkey" FOREIGN KEY ("framework_control_id") REFERENCES "framework_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "framework_control_predecessors" ADD CONSTRAINT "framework_control_predecessors_predecessor_id_fkey" FOREIGN KEY ("predecessor_id") REFERENCES "framework_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_framework_mappings" ADD CONSTRAINT "control_framework_mappings_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_framework_mappings" ADD CONSTRAINT "control_framework_mappings_framework_control_id_fkey" FOREIGN KEY ("framework_control_id") REFERENCES "framework_controls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_evidence_mappings" ADD CONSTRAINT "control_evidence_mappings_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_evidence_mappings" ADD CONSTRAINT "control_evidence_mappings_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "evidences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_test_mappings" ADD CONSTRAINT "control_test_mappings_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_policy_mappings" ADD CONSTRAINT "control_policy_mappings_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_policy_mappings" ADD CONSTRAINT "control_policy_mappings_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_artifacts" ADD CONSTRAINT "evidence_artifacts_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "evidences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_revisions" ADD CONSTRAINT "policy_revisions_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_sections" ADD CONSTRAINT "policy_sections_policy_revision_id_fkey" FOREIGN KEY ("policy_revision_id") REFERENCES "policy_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_sections" ADD CONSTRAINT "policy_sections_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "policy_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
