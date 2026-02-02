-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Grievance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grievanceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "subStatus" TEXT,
    "isEscalated" BOOLEAN NOT NULL DEFAULT false,
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "hearingDate" TEXT,
    "hearingTime" TEXT,
    "hearingLink" TEXT,
    "assignedOfficer" TEXT,
    "assignedSection" TEXT,
    "assignedZone" TEXT,
    "expectedDate" TEXT,
    "remarks" TEXT,
    "attachmentPath" TEXT,
    "source" TEXT NOT NULL DEFAULT 'WEB_PORTAL',
    "eeRemarks" TEXT,
    "eeStatus" TEXT,
    "eeActionDate" DATETIME,
    "directorNote" TEXT,
    "isReopened" BOOLEAN NOT NULL DEFAULT false,
    "reopenedBy" TEXT,
    "reopenReason" TEXT,
    "assignedToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "satisfactionStatus" TEXT,
    "citizenFeedback" TEXT,
    "vcScheduledDate" DATETIME,
    "vcMeetingLink" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Grievance_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Grievance" ("address", "assignedOfficer", "assignedSection", "assignedToId", "assignedZone", "attachmentPath", "category", "createdAt", "description", "directorNote", "eeActionDate", "eeRemarks", "eeStatus", "escalationLevel", "expectedDate", "grievanceId", "hearingDate", "hearingLink", "hearingTime", "id", "isEscalated", "mobile", "name", "remarks", "source", "status", "subStatus", "updatedAt") SELECT "address", "assignedOfficer", "assignedSection", "assignedToId", "assignedZone", "attachmentPath", "category", "createdAt", "description", "directorNote", "eeActionDate", "eeRemarks", "eeStatus", "escalationLevel", "expectedDate", "grievanceId", "hearingDate", "hearingLink", "hearingTime", "id", "isEscalated", "mobile", "name", "remarks", "source", "status", "subStatus", "updatedAt" FROM "Grievance";
DROP TABLE "Grievance";
ALTER TABLE "new_Grievance" RENAME TO "Grievance";
CREATE UNIQUE INDEX "Grievance_grievanceId_key" ON "Grievance"("grievanceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
