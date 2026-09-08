const API_BASE_URL = "http://127.0.0.1:8001";

// async function handleResponse(response, defaultMessage) {
//   const data = await response.json().catch(() => ({}));

//   if (!response.ok) {
//     throw new Error(data.detail || defaultMessage);
//   }

//   return data;
// }

async function handleResponse(response, defaultMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = defaultMessage;

    if (typeof data.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data.detail)) {
      message = data.detail
        .map((item) => item.msg || "Invalid input")
        .join(", ");
    } else if (data.detail && typeof data.detail === "object") {
      message = data.detail.message || defaultMessage;
    }

    throw new Error(message);
  }

  return data;
}
// ---------------- AUTHENTICATION ----------------

// export async function loginUser(email, password) {
//   const formData = new URLSearchParams();
//   formData.append("username", email);
//   formData.append("password", password);

//   const response = await fetch(`${API_BASE_URL}/auth/login`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: formData,
//   });

//   return handleResponse(response, "Login failed");
// }

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return handleResponse(response, "Login failed");
}

export async function registerUser(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  return handleResponse(response, "Registration failed");
}

export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response, "Failed to load user");
}

// ---------------- CASES ----------------

export async function getCases(token) {
  const response = await fetch(`${API_BASE_URL}/cases/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response, "Failed to load cases");
}

export async function getCaseDocuments(caseId, token) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}/documents`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return handleResponse(response, "Failed to load case documents");
}

// ---------------- DOCUMENTS ----------------

// export async function uploadDocument(file, token, caseId = null) {
//   const formData = new FormData();
//   formData.append("file", file);

//   if (caseId !== null) {
//     formData.append("case_id", caseId);
//   }

//   const response = await fetch(
//     `${API_BASE_URL}/documents/upload`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: formData,
//     }
//   );

//   return handleResponse(response, "Document upload failed");
// }

export async function uploadDocument(file, token, caseId) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("case_id", String(caseId));

  const response = await fetch(
    `${API_BASE_URL}/documents/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Document upload failed."
    );
  }

  return data;
}



export async function verifyDocument(documentId, token) {
  const response = await fetch(
    `${API_BASE_URL}/documents/${documentId}/verify-integrity`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return handleResponse(response, "Integrity verification failed");
}

export async function downloadDocument(documentId, token) {
  const response = await fetch(
    `${API_BASE_URL}/documents/${documentId}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Document download failed");
  }

  const blob = await response.blob();

  const contentDisposition = response.headers.get(
    "Content-Disposition"
  );

  let filename = "document";

  if (contentDisposition) {
    const match = contentDisposition.match(
      /filename="(.+)"/
    );

    if (match) {
      filename = match[1];
    }
  }

  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}