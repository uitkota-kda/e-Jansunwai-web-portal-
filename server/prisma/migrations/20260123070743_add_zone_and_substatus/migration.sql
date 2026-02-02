/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
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
    "assignedToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Grievance_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Grievance" ("address", "assignedOfficer", "assignedSection", "assignedToId", "attachmentPath", "category", "createdAt", "description", "escalationLevel", "expectedDate", "grievanceId", "hearingDate", "hearingLink", "hearingTime", "id", "isEscalated", "mobile", "name", "remarks", "status", "updatedAt") SELECT "address", "assignedOfficer", "assignedSection", "assignedToId", "attachmentPath", "category", "createdAt", "description", "escalationLevel", "expectedDate", "grievanceId", "hearingDate", "hearingLink", "hearingTime", "id", "isEscalated", "mobile", "name", "remarks", "status", "updatedAt" FROM "Grievance";
DROP TABLE "Grievance";
ALTER TABLE "new_Grievance" RENAME TO "Grievance";
CREATE UNIQUE INDEX "Grievance_grievanceId_key" ON "Grievance"("grievanceId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL,
    "section" TEXT,
    "zone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
