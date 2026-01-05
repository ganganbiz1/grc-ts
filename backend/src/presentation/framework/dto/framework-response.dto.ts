import {
  Framework,
  FrameworkVersion,
  VersionStatus,
} from '../../../domain/framework';

/**
 * Framework ID Response
 */
export interface FrameworkIdResponseDto {
  id: string;
}

/**
 * Framework Summary Response（一覧用）
 */
export interface FrameworkSummaryDto {
  id: string;
  name: string;
  description: string | null;
}

/**
 * Framework Version Summary Response
 */
export interface FrameworkVersionSummaryDto {
  id: string;
  versionNumber: string;
  status: VersionStatus;
  effectiveDate: string | null;
}

/**
 * Framework Detail Response（詳細用）
 */
export interface FrameworkDetailDto {
  id: string;
  name: string;
  description: string | null;
  versions: FrameworkVersionSummaryDto[];
}

// ========================================
// Mapper Functions
// ========================================

export function toFrameworkSummaryDto(
  framework: Framework,
): FrameworkSummaryDto {
  return {
    id: framework.id,
    name: framework.name,
    description: framework.description,
  };
}

export function toFrameworkVersionSummaryDto(
  version: FrameworkVersion,
): FrameworkVersionSummaryDto {
  return {
    id: version.id,
    versionNumber: version.versionNumber,
    status: version.status,
    effectiveDate: version.effectiveDate?.toISOString().split('T')[0] ?? null,
  };
}

export function toFrameworkDetailDto(framework: Framework): FrameworkDetailDto {
  return {
    id: framework.id,
    name: framework.name,
    description: framework.description,
    versions: framework.versions.map(toFrameworkVersionSummaryDto),
  };
}
