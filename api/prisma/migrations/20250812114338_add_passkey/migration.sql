-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_fido2_active" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Passkey" (
    "id" VARCHAR(255) NOT NULL,
    "public_key" BYTEA NOT NULL,
    "user_id" INTEGER NOT NULL,
    "web_authn_user_id" VARCHAR(255) NOT NULL,
    "counter" INTEGER NOT NULL,
    "backup_eligible" BOOLEAN NOT NULL DEFAULT false,
    "backup_status" BOOLEAN NOT NULL DEFAULT false,
    "transports" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used" TIMESTAMP(3),

    CONSTRAINT "Passkey_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Passkey" ADD CONSTRAINT "Passkey_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
