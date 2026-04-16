function isFormDataBody(body: RequestInit["body"]) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function buildHeaders(init?: RequestInit) {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
  const headers = new Headers(init?.headers ?? {});

  if (!isFormDataBody(init?.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function ensureOk(response: Response) {
  if (response.ok) {
    return;
  }

  let message = `Request failed: ${response.status}`;

  try {
    const payload = (await response.json()) as { message?: string };
    if (payload.message) {
      message = payload.message;
    }
  } catch {
    // Ignore malformed error payloads and fall back to the status message.
  }

  throw new Error(message);
}

function parseContentDispositionFileName(contentDisposition: string | null) {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) {
    return decodeURIComponent(plainMatch[1]);
  }

  return null;
}

export async function apiRequest<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: buildHeaders(init),
  });

  await ensureOk(response);

  const payload = (await response.json()) as { data: T };
  return payload.data;
}

export async function apiDownload(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: buildHeaders(init),
  });

  await ensureOk(response);

  return {
    blob: await response.blob(),
    fileName: parseContentDispositionFileName(response.headers.get("content-disposition")),
    mimeType: response.headers.get("content-type"),
  };
}
