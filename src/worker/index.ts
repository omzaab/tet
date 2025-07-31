import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { cors } from "hono/cors";
import { getCookie, setCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import {
  CreateUserSchema,
  UpdateUserSchema,
  CreatePropertySchema,
  CreateReviewSchema,
} from "@/shared/types";
import { AIService } from "@/shared/ai-service";
import { z } from "zod";

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Auth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const mochaUser = c.get("user");
  
  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }
  
  // Check if user exists in our database
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();

  if (results.length === 0) {
    return c.json({ mochaUser, user: null }, 200);
  }

  return c.json({ mochaUser, user: results[0] }, 200);
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// User management
app.post("/api/users", authMiddleware, zValidator("json", CreateUserSchema), async (c) => {
  const mochaUser = c.get("user");
  const userData = c.req.valid("json");

  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  // Check if user already exists
  const { results: existingUsers } = await c.env.DB.prepare(
    "SELECT * FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();

  if (existingUsers.length > 0) {
    return c.json({ error: "User already exists" }, 400);
  }

  const { success } = await c.env.DB.prepare(`
    INSERT INTO users (mocha_user_id, full_name, bio, user_type, avatar_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(
    mochaUser.id,
    userData.full_name,
    userData.bio || null,
    userData.user_type,
    mochaUser.google_user_data.picture || null
  ).run();

  if (!success) {
    return c.json({ error: "Failed to create user" }, 500);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();

  return c.json(results[0], 201);
});

app.put("/api/users/me", authMiddleware, zValidator("json", UpdateUserSchema), async (c) => {
  const mochaUser = c.get("user");
  const userData = c.req.valid("json");

  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  const updateFields = [];
  const values = [];

  if (userData.full_name !== undefined) {
    updateFields.push("full_name = ?");
    values.push(userData.full_name);
  }
  if (userData.bio !== undefined) {
    updateFields.push("bio = ?");
    values.push(userData.bio);
  }
  if (userData.user_type !== undefined) {
    updateFields.push("user_type = ?");
    values.push(userData.user_type);
  }

  updateFields.push("updated_at = datetime('now')");
  values.push(mochaUser.id);

  const { success } = await c.env.DB.prepare(`
    UPDATE users SET ${updateFields.join(", ")} WHERE mocha_user_id = ?
  `).bind(...values).run();

  if (!success) {
    return c.json({ error: "Failed to update user" }, 500);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();

  return c.json(results[0], 200);
});

app.get("/api/users/:id", async (c) => {
  const userId = c.req.param("id");
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(userId).all();

  if (results.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(results[0], 200);
});

// Properties
app.get("/api/properties", authMiddleware, async (c) => {
  const mochaUser = c.get("user");

  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }
  
  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();

  if (userResults.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC"
  ).bind(userResults[0].id).all();

  return c.json(results, 200);
});

app.post("/api/properties", authMiddleware, zValidator("json", CreatePropertySchema), async (c) => {
  const mochaUser = c.get("user");
  const propertyData = c.req.valid("json");

  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();

  if (userResults.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  const { success } = await c.env.DB.prepare(`
    INSERT INTO properties (owner_id, name, address, description, property_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(
    userResults[0].id,
    propertyData.name,
    propertyData.address,
    propertyData.description || null,
    propertyData.property_type || null
  ).run();

  if (!success) {
    return c.json({ error: "Failed to create property" }, 500);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC LIMIT 1"
  ).bind(userResults[0].id).all();

  return c.json(results[0], 201);
});

// Reviews
app.get("/api/reviews/received", authMiddleware, async (c) => {
  const mochaUser = c.get("user");

  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }
  
  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();

  if (userResults.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(`
    SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar,
           p.name as property_name, p.address as property_address
    FROM reviews r
    LEFT JOIN users u ON r.reviewer_id = u.id
    LEFT JOIN properties p ON r.property_id = p.id
    WHERE r.reviewee_id = ? AND r.is_valid = 1
    ORDER BY r.created_at DESC
  `).bind(userResults[0].id).all();

  return c.json(results, 200);
});

app.get("/api/reviews/given", authMiddleware, async (c) => {
  const mochaUser = c.get("user");

  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }
  
  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();

  if (userResults.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(`
    SELECT r.*, u.full_name as reviewee_name, u.avatar_url as reviewee_avatar,
           p.name as property_name, p.address as property_address
    FROM reviews r
    LEFT JOIN users u ON r.reviewee_id = u.id
    LEFT JOIN properties p ON r.property_id = p.id
    WHERE r.reviewer_id = ?
    ORDER BY r.created_at DESC
  `).bind(userResults[0].id).all();

  return c.json(results, 200);
});

app.post("/api/reviews", authMiddleware, zValidator("json", CreateReviewSchema), async (c) => {
  const mochaUser = c.get("user");
  const reviewData = c.req.valid("json");

  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  const { results: userResults } = await c.env.DB.prepare(
    "SELECT id FROM users WHERE mocha_user_id = ?"
  ).bind(mochaUser.id).all();

  if (userResults.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  // AI-powered review analysis
  const aiAnalysis = await AIService.analyzeReviewSubmission(
    reviewData.review_text,
    reviewData.rating,
    reviewData.issue_types || [],
    reviewData.evidence_image_url
  );

  const issueTypesStr = reviewData.issue_types ? JSON.stringify(reviewData.issue_types) : null;

  const { success } = await c.env.DB.prepare(`
    INSERT INTO reviews (reviewer_id, reviewee_id, property_id, rating, review_text, issue_types, 
                        evidence_image_url, trust_score_impact, is_valid, ai_validation_reason, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(
    userResults[0].id,
    reviewData.reviewee_id,
    reviewData.property_id || null,
    reviewData.rating,
    reviewData.review_text,
    issueTypesStr,
    reviewData.evidence_image_url || null,
    aiAnalysis.trustScoreImpact,
    aiAnalysis.isValid,
    aiAnalysis.reason
  ).run();

  if (!success) {
    return c.json({ error: "Failed to create review" }, 500);
  }

  // Update reviewee's trust score and stats (only if review is valid)
  if (aiAnalysis.isValid) {
    await c.env.DB.prepare(`
      UPDATE users 
      SET trust_score = trust_score + ?,
          total_reviews = total_reviews + 1,
          average_rating = (
            SELECT AVG(rating) FROM reviews 
            WHERE reviewee_id = ? AND is_valid = 1
          ),
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(aiAnalysis.trustScoreImpact, reviewData.reviewee_id, reviewData.reviewee_id).run();
  }

  return c.json({ 
    success: true, 
    aiAnalysis: {
      isValid: aiAnalysis.isValid,
      reason: aiAnalysis.reason,
      trustScoreImpact: aiAnalysis.trustScoreImpact
    }
  }, 201);
});

// Search users for reviews
app.get("/api/users/search", zValidator("query", z.object({ q: z.string().min(1) })), async (c) => {
  const { q } = c.req.valid("query");
  
  const { results } = await c.env.DB.prepare(`
    SELECT id, full_name, avatar_url, user_type, trust_score, average_rating, total_reviews
    FROM users 
    WHERE full_name LIKE ? 
    ORDER BY full_name ASC 
    LIMIT 10
  `).bind(`%${q}%`).all();

  return c.json(results, 200);
});

// AI-powered aggregate review analysis
app.get("/api/reviews/analysis/:userId", async (c) => {
  const userId = c.req.param("userId");
  
  const { results } = await c.env.DB.prepare(`
    SELECT rating, review_text, issue_types
    FROM reviews 
    WHERE reviewee_id = ? AND is_valid = 1
    ORDER BY created_at DESC
  `).bind(userId).all();

  if (results.length === 0) {
    return c.json({ 
      summary: "No reviews available for analysis",
      identifiedIssues: [],
      fairnessAssessment: "neutral"
    }, 200);
  }

  const reviews = results.map(review => ({
    rating: review.rating,
    reviewText: review.review_text,
    issueTypes: review.issue_types ? JSON.parse(review.issue_types) : []
  }));

  const analysis = await AIService.analyzeAggregateReviews(reviews);
  
  return c.json(analysis, 200);
});

// AI-powered avatar verification
app.post("/api/users/verify-avatar", authMiddleware, zValidator("json", z.object({
  imageUrl: z.string().url()
})), async (c) => {
  const mochaUser = c.get("user");
  const { imageUrl } = c.req.valid("json");

  if (!mochaUser) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  const verification = await AIService.verifyAvatar(imageUrl);
  
  return c.json(verification, 200);
});

export default app;
