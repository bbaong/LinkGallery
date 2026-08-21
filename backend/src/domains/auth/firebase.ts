import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "../../config/env";
import { ApiError } from "../../shared/ApiError";

let initialized = false;

function ensureFirebaseAdmin() {
  if (initialized) return;

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw ApiError.internal(
      "Google 로그인이 설정되지 않았습니다. FIREBASE_* 환경변수를 확인해주세요.",
      "FIREBASE_NOT_CONFIGURED"
    );
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }

  initialized = true;
}

export async function verifyFirebaseIdToken(idToken: string) {
  ensureFirebaseAdmin();

  try {
    return await getAuth().verifyIdToken(idToken);
  } catch {
    throw ApiError.unauthorized("Google 인증에 실패했습니다. 다시 시도해주세요.", "INVALID_GOOGLE_TOKEN");
  }
}
