-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "poliId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_poliId_fkey" FOREIGN KEY ("poliId") REFERENCES "polis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "polis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "patients" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mrn" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "poliId" INTEGER NOT NULL,
    "visitDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentType" TEXT NOT NULL,
    "complaint" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "queueNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "registrations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "registrations_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "registrations_poliId_fkey" FOREIGN KEY ("poliId") REFERENCES "polis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "registrationId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "subjective" TEXT NOT NULL,
    "bp" TEXT NOT NULL,
    "temp" REAL NOT NULL,
    "weight" REAL NOT NULL,
    "height" REAL NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "therapy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medical_records_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "medical_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "medical_records_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medical_actions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicalRecordId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "cost" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "medical_actions_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicalRecordId" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "prescriptions_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prescriptionId" INTEGER NOT NULL,
    "medicine" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prescription_items_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "polis_name_key" ON "polis"("name");

-- CreateIndex
CREATE UNIQUE INDEX "polis_code_key" ON "polis"("code");

-- CreateIndex
CREATE UNIQUE INDEX "patients_mrn_key" ON "patients"("mrn");

-- CreateIndex
CREATE UNIQUE INDEX "patients_nik_key" ON "patients"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_registrationId_key" ON "medical_records"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_medicalRecordId_key" ON "prescriptions"("medicalRecordId");
