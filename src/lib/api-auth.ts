import { NextRequest } from "next/server";
import { authenticateApiKey } from "@/lib/data";

function extractApiKey(request: NextRequest) {
  const directHeader = request.headers.get("x-api-key");

  if (directHeader) {
    return directHeader.trim();
  }

  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return null;
}

export async function requireServiceApiKey(request: NextRequest, requiredScopes: string[] = []) {
  const rawApiKey = extractApiKey(request);

  if (!rawApiKey) {
    throw new Error("Missing API key");
  }

  const apiKey = await authenticateApiKey(rawApiKey);

  if (!apiKey) {
    throw new Error("Invalid API key");
  }

  const scopes = Array.isArray(apiKey.scopes) ? apiKey.scopes.map(String) : [];
  const hasRequiredScopes = requiredScopes.every((scope) => scopes.includes(scope));

  if (!hasRequiredScopes) {
    throw new Error("API key does not have the required scopes");
  }

  if (!apiKey.service.isActive) {
    throw new Error("Service is inactive");
  }

  return apiKey;
}
