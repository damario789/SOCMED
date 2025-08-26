-- CreateIndex
CREATE INDEX "Comment_postId_createdAt_idx" ON "SOCMED"."Comment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "SOCMED"."Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "SOCMED"."Comment"("userId");

-- CreateIndex
CREATE INDEX "CommentLike_commentId_createdAt_idx" ON "SOCMED"."CommentLike"("commentId", "createdAt");

-- CreateIndex
CREATE INDEX "Follow_userId_idx" ON "SOCMED"."Follow"("userId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "SOCMED"."Follow"("followingId");

-- CreateIndex
CREATE INDEX "Like_postId_createdAt_idx" ON "SOCMED"."Like"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "SOCMED"."Post"("userId");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "SOCMED"."Post"("createdAt");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "SOCMED"."User"("username");
