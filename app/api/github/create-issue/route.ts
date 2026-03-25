import { NextResponse } from "next/server";

const ALLOWED_LABELS = ["contact", "bug"];
const MAX_TITLE_LENGTH = 256;
const MAX_BODY_LENGTH = 65000;

interface CreateIssueBody {
  title: string;
  body: string;
  labels: string[];
}

/** Neutralize GitHub @-mentions by inserting a zero-width space */
function neutralizeMentions(text: string): string {
  return text.replace(/@(\w)/g, "@\u200B$1");
}

export async function POST(request: Request) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return NextResponse.json(
      { error: "GitHub integration is not configured" },
      { status: 500 }
    );
  }

  let payload: CreateIssueBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { title, body, labels } = payload;

  if (
    !title ||
    !body ||
    !Array.isArray(labels) ||
    !title.trim() ||
    !body.trim()
  ) {
    return NextResponse.json(
      { error: "Missing required fields: title, body, labels" },
      { status: 400 }
    );
  }

  // Validate labels against allowed list
  const validLabels = labels.filter(
    (l): l is string => typeof l === "string" && ALLOWED_LABELS.includes(l)
  );

  // Sanitize: trim, limit length, neutralize @-mentions
  const sanitizedTitle = neutralizeMentions(title.trim()).slice(
    0,
    MAX_TITLE_LENGTH
  );
  const sanitizedBody = neutralizeMentions(body.trim()).slice(
    0,
    MAX_BODY_LENGTH
  );

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: sanitizedTitle,
          body: sanitizedBody,
          labels: validLabels,
        }),
      }
    );

    if (response.status === 403) {
      const isRateLimit =
        response.headers.get("x-ratelimit-remaining") === "0";
      return NextResponse.json(
        {
          error: isRateLimit
            ? "Rate limit exceeded. Please try again later."
            : "Access denied by GitHub",
        },
        { status: isRateLimit ? 429 : 502 }
      );
    }

    if (response.status === 401) {
      return NextResponse.json(
        { error: "GitHub authentication failed" },
        { status: 502 }
      );
    }

    if (response.status === 422) {
      return NextResponse.json(
        { error: "Validation error from GitHub" },
        { status: 400 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create GitHub issue" },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { issueNumber: data.number, issueUrl: data.html_url },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to GitHub" },
      { status: 502 }
    );
  }
}
