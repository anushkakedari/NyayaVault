const API_BASE_URL = "http://127.0.0.1:8001";

export async function uploadDocument(file, token) {
  const formData = new FormData();
  formData.append("file", file);

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
    throw new Error(data.detail || "Document upload failed");
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Integrity verification failed");
  }

  return data;
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
    const data = await response.json();
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