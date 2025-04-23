-- CreateTable
CREATE TABLE "Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "age" INTEGER NOT NULL,
    "sexe" TEXT NOT NULL,
    "moyenneLycee" REAL NOT NULL,
    "filiere" TEXT NOT NULL,
    "autresClubs" INTEGER NOT NULL,
    "projetsRealises" INTEGER NOT NULL,
    "evaluationBureau" INTEGER NOT NULL,
    "softSkills" REAL NOT NULL,
    "scoreEntretien" REAL NOT NULL,
    "experienceProfessionnelle" BOOLEAN NOT NULL,
    "indiceEngagement" REAL NOT NULL,
    "cellule" TEXT NOT NULL,
    "formations" TEXT NOT NULL
);
