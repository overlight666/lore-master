-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "username" TEXT NOT NULL,
    "energy" INTEGER NOT NULL DEFAULT 6,
    "energy_updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" TEXT,
    "permissions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalSubtopics" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT,
    "estimatedTime" INTEGER,
    "tags" JSONB,
    "requirements" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtopic" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalLevels" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT,
    "estimatedTime" INTEGER,
    "tags" JSONB,
    "requirements" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "subtopic_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "color" TEXT,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "subtopic_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "difficulty" TEXT,
    "estimatedTime" INTEGER,
    "totalQuestions" INTEGER NOT NULL DEFAULT 10,
    "passingScore" INTEGER NOT NULL DEFAULT 80,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requirements" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT,
    "subtopic_id" TEXT,
    "category_id" TEXT,
    "level_id" TEXT,
    "level" INTEGER,
    "difficulty" INTEGER,
    "difficulty_word" TEXT,
    "text" TEXT,
    "question" TEXT,
    "option_a" TEXT,
    "option_b" TEXT,
    "option_c" TEXT,
    "option_d" TEXT,
    "correct_option" TEXT,
    "choices" JSONB,
    "correct_answer" TEXT,
    "explanation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" JSONB,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "time_taken" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "used_5050" BOOLEAN NOT NULL,
    "used_ai_hint" BOOLEAN NOT NULL,
    "energy_consumed" BOOLEAN NOT NULL,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnswer" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdsWatched" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "watched_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdsWatched_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLifeline" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLifeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "purchased_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT,
    "user_id" TEXT,
    "resource" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Topic_isActive_order_idx" ON "Topic"("isActive", "order");

-- CreateIndex
CREATE INDEX "Subtopic_topic_id_isActive_idx" ON "Subtopic"("topic_id", "isActive");

-- CreateIndex
CREATE INDEX "Category_subtopic_id_isActive_idx" ON "Category"("subtopic_id", "isActive");

-- CreateIndex
CREATE INDEX "Level_category_id_level_isActive_idx" ON "Level"("category_id", "level", "isActive");

-- CreateIndex
CREATE INDEX "Level_subtopic_id_isActive_idx" ON "Level"("subtopic_id", "isActive");

-- CreateIndex
CREATE INDEX "Question_subtopic_id_difficulty_word_idx" ON "Question"("subtopic_id", "difficulty_word");

-- CreateIndex
CREATE INDEX "Question_category_id_level_idx" ON "Question"("category_id", "level");

-- CreateIndex
CREATE INDEX "QuizAttempt_user_id_completed_at_idx" ON "QuizAttempt"("user_id", "completed_at");

-- CreateIndex
CREATE INDEX "QuizAttempt_level_id_idx" ON "QuizAttempt"("level_id");

-- CreateIndex
CREATE INDEX "UserAnswer_attempt_id_idx" ON "UserAnswer"("attempt_id");

-- CreateIndex
CREATE INDEX "AdsWatched_user_id_idx" ON "AdsWatched"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserLifeline_user_id_type_key" ON "UserLifeline"("user_id", "type");

-- CreateIndex
CREATE INDEX "Purchase_user_id_purchased_at_idx" ON "Purchase"("user_id", "purchased_at");

-- CreateIndex
CREATE INDEX "AdminAuditLog_created_at_idx" ON "AdminAuditLog"("created_at");

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdsWatched" ADD CONSTRAINT "AdsWatched_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLifeline" ADD CONSTRAINT "UserLifeline_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

