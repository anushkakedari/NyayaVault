import { useEffect, useRef, useState } from "react";

import {
  loginUser,
  getCases,
  getCaseDocuments,
  uploadDocument,
  verifyDocument,
  downloadDocument,
} from "./api";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from "@mui/material";

import {
  AssessmentOutlined,
  CloudUploadOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  FolderOutlined,
  GavelOutlined,
  Menu,
  NotificationsNoneOutlined,
  Search,
  SecurityOutlined,
  SettingsOutlined,
  ShieldOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";

import "./App.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563EB",
      dark: "#1D4ED8",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#172033",
      secondary: "#64748B",
    },
    success: {
      main: "#16A34A",
    },
    warning: {
      main: "#F59E0B",
    },
    error: {
      main: "#DC2626",
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
  },
  shape: {
    borderRadius: 14,
  },
});

// ---------------- STAT CARD ----------------

function StatCard({
  icon,
  label,
  value,
  caption,
  accent = false,
}) {
  return (
    <Paper className="stat-card" elevation={0}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box className="stat-icon">{icon}</Box>

        {accent && (
          <Chip
            label="Live"
            size="small"
            className="live-chip"
          />
        )}
      </Stack>

      <Typography className="stat-value">
        {value}
      </Typography>

      <Typography className="stat-label">
        {label}
      </Typography>

      <Typography className="stat-caption">
        {caption}
      </Typography>
    </Paper>
  );
}

// ---------------- LOGIN SCREEN ----------------

// function LoginScreen({ onLogin }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!email || !password) {
//       setError("Please enter your email and password.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const result = await loginUser(email, password);

//       if (!result?.access_token) {
//         throw new Error(
//           "Login succeeded, but no access token was returned."
//         );
//       }

//       localStorage.setItem(
//         "access_token",
//         result.access_token
//       );

//       onLogin(result.access_token);
//     } catch (loginError) {
//       setError(
//         loginError.message || "Login failed."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box className="login-page">
//       <Paper className="login-card" elevation={0}>
//         <Box className="login-brand">
//           <Box className="brand-mark">
//             <ShieldOutlined />
//           </Box>

//           <Typography className="brand-name">
//             NyayaVault
//           </Typography>

//           <Typography className="brand-subtitle">
//             Secure evidence platform
//           </Typography>
//         </Box>

//         <Typography className="login-title">
//           Welcome back
//         </Typography>

//         <Typography className="login-description">
//           Sign in to access your secure evidence vault.
//         </Typography>

//         {error && (
//           <Alert
//             severity="error"
//             className="login-alert"
//           >
//             {error}
//           </Alert>
//         )}

//         <Box
//           component="form"
//           onSubmit={handleSubmit}
//           className="login-form"
//         >
//           <TextField
//             label="Email"
//             type="email"
//             value={email}
//             onChange={(event) =>
//               setEmail(event.target.value)
//             }
//             fullWidth
//             required
//           />

//           <TextField
//             label="Password"
//             type="password"
//             value={password}
//             onChange={(event) =>
//               setPassword(event.target.value)
//             }
//             fullWidth
//             required
//           />

//           <Button
//             type="submit"
//             variant="contained"
//             fullWidth
//             disabled={loading}
//             className="login-button"
//           >
//             {loading ? "Signing in..." : "Login"}
//           </Button>
//         </Box>
//       </Paper>
//     </Box>
//   );
// }

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    try {
      const result = await loginUser(email, password);
      onLogin(result.access_token);
    } catch (error) {
      setLoginError(error.message || "Login failed");
    } 
    finally {
      setLoggingIn(false);
    }
  };

  return (
    <Box className="login-page">
      <Box className="login-card">
        <Box className="login-brand">
          <Box className="login-brand-icon">
            <ShieldOutlined  />
          </Box>

          <Typography className="login-brand-name">
            NyayaVault
          </Typography>
        </Box>

        <Typography className="login-eyebrow">
          SECURE EVIDENCE PLATFORM
        </Typography>

        <Typography className="login-title">
          Welcome back
        </Typography>

        <Typography className="login-description">
          Sign in to access your secure evidence vault.
        </Typography>

        {loginError && (
          <Alert severity="error" className="login-alert">
            {loginError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          className="login-form"
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loggingIn}
            className="login-button"
          >
            {loggingIn ? "LOGGING IN..." : "LOGIN"}
          </Button>
        </Box>

        <Typography className="login-footer">
          Secure access • Protected evidence management
        </Typography>
      </Box>
    </Box>
  );
}

// ---------------- MAIN APP ----------------

function App() {
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [searchValue, setSearchValue] = useState("");

  // Read the token only once when the app starts.
  const [token, setToken] = useState(
    () => localStorage.getItem("access_token")
  );

  const [cases, setCases] = useState([]);
  const [realDocuments, setRealDocuments] = useState([]);

  const [loadingData, setLoadingData] =
    useState(true);

  const [selectedCaseId, setSelectedCaseId] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // ---------------- LOGIN / LOGOUT ----------------

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    setToken(null);
    setCases([]);
    setRealDocuments([]);
    setSelectedCaseId("");
    setMessage("");
    setError("");
  };

  // ---------------- LOAD DASHBOARD DATA ----------------

  useEffect(() => {
    async function loadDashboardData() {
      // Do not call /cases/ without a token.
      if (!token) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        setError("");

        const casesResult = await getCases(token);

        const caseList = Array.isArray(casesResult)
          ? casesResult
          : casesResult?.cases || [];

        setCases(caseList);

        const allDocuments = [];

        for (const caseItem of caseList) {
          try {
            const result = await getCaseDocuments(
              caseItem.id,
              token
            );

            const caseDocuments = Array.isArray(result)
              ? result
              : result?.documents || [];

            allDocuments.push(
              ...caseDocuments.map((document) => ({
                ...document,
                case_id: caseItem.id,
                case_title:
                  caseItem.title ||
                  caseItem.name ||
                  `Case #${caseItem.id}`,
              }))
            );
          } catch (caseError) {
            console.error(
              `Failed to load documents for case ${caseItem.id}`,
              caseError
            );
          }
        }

        setRealDocuments(allDocuments);
      } catch (loadError) {
        setError(
          loadError.message ||
            "Failed to load dashboard data."
        );

        // If the token is expired or invalid,
        // return the user to the login screen.
        if (
          loadError.message?.includes("401") ||
          loadError.message
            ?.toLowerCase()
            .includes("unauthorized") ||
          loadError.message
            ?.toLowerCase()
            .includes("not authenticated")
        ) {
          handleLogout();
        }
      } finally {
        setLoadingData(false);
      }
    }

    loadDashboardData();
  }, [token]);

  // ---------------- SEARCH ----------------

  const filteredDocuments = realDocuments.filter(
    (document) =>
      (document.original_filename || "")
        .toLowerCase()
        .includes(searchValue.toLowerCase())
  );

  // ---------------- UPLOAD ----------------

  const handleUploadClick = () => {
    if (!token) {
      setError("Please login first.");
      return;
    }

    if (cases.length === 0) {
      setError(
        "Create a case before uploading a document."
      );
      return;
    }

    if (!selectedCaseId) {
      setError(
        "Please select a case before uploading."
      );
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError("");

    if (!token) {
      setError(
        "Please login first. JWT token not found."
      );
      event.target.value = "";
      return;
    }

    if (!selectedCaseId) {
      setError(
        "Please select a case before uploading."
      );
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const result = await uploadDocument(
        file,
        token,
        Number(selectedCaseId)
      );

      const uploadedDocument = result?.document;

      if (!uploadedDocument) {
        throw new Error(
          "Upload succeeded, but the backend returned no document."
        );
      }

      const selectedCase = cases.find(
        (caseItem) =>
          Number(caseItem.id) ===
          Number(selectedCaseId)
      );

      const documentWithCase = {
        ...uploadedDocument,
        case_id: Number(selectedCaseId),
        case_title:
          selectedCase?.title ||
          selectedCase?.name ||
          `Case #${selectedCaseId}`,
      };

      setRealDocuments((previousDocuments) => [
        documentWithCase,
        ...previousDocuments,
      ]);

      setMessage(
        `${uploadedDocument.original_filename} uploaded and secured successfully.`
      );
    } catch (uploadError) {
      setError(
        uploadError.message ||
          "Document upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // ---------------- VERIFY ----------------

  const handleVerify = async (documentId) => {
    try {
      setMessage("");
      setError("");

      if (!token) {
        throw new Error("Please login first.");
      }

      const result = await verifyDocument(
        documentId,
        token
      );

      if (result.integrity_status === "VERIFIED") {
        setMessage(
          `Document #${documentId} passed database and blockchain verification.`
        );
      } else {
        setError(
          `Document #${documentId} failed integrity verification.`
        );
      }
    } catch (verifyError) {
      setError(
        verifyError.message ||
          "Document verification failed."
      );
    }
  };

  // ---------------- DOWNLOAD ----------------

  const handleDownload = async (documentId) => {
    try {
      setMessage("");
      setError("");

      if (!token) {
        throw new Error("Please login first.");
      }

      await downloadDocument(documentId, token);

      setMessage(
        "Document downloaded successfully."
      );
    } catch (downloadError) {
      setError(
        downloadError.message ||
          "Document download failed."
      );
    }
  };

  // ---------------- SHOW LOGIN IF NO TOKEN ----------------

  if (!token) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <LoginScreen onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  // ---------------- DASHBOARD ----------------

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="app-shell">
        {/* SIDEBAR */}

        <Box className="sidebar">
          <Box className="brand">
            <Box className="brand-mark">
              <ShieldOutlined />
            </Box>

            <Box>
              <Typography className="brand-name">
                NyayaVault
              </Typography>

              <Typography className="brand-subtitle">
                Secure evidence platform
              </Typography>
            </Box>
          </Box>

          <Typography className="menu-label">
            WORKSPACE
          </Typography>

          <List className="navigation">
            {[
              {
                label: "Dashboard",
                icon: <DashboardOutlined />,
              },
              {
                label: "Document Vault",
                icon: <FolderOutlined />,
              },
              {
                label: "Audit Trail",
                icon: <AssessmentOutlined />,
              },
            ].map((item) => (
              <ListItemButton
                key={item.label}
                className={`nav-item ${
                  activePage === item.label
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActivePage(item.label)
                }
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                />
              </ListItemButton>
            ))}
          </List>

          <Typography className="menu-label">
            SYSTEM
          </Typography>

          <List className="navigation">
            <ListItemButton
              className={`nav-item ${
                activePage === "Security"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage("Security")
              }
            >
              <ListItemIcon>
                <SecurityOutlined />
              </ListItemIcon>

              <ListItemText primary="Security & Integrity" />
            </ListItemButton>

            <ListItemButton
              className={`nav-item ${
                activePage === "Settings"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage("Settings")
              }
            >
              <ListItemIcon>
                <SettingsOutlined />
              </ListItemIcon>

              <ListItemText primary="Settings" />
            </ListItemButton>
          </List>

          <Box className="sidebar-bottom">
            <Box className="secure-card">
              <VerifiedUserOutlined />

              <Box>
                <Typography className="secure-title">
                  Vault protected
                </Typography>

                <Typography className="secure-text">
                  AES-256 encryption active
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <Avatar className="user-avatar">
                AK
              </Avatar>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography className="user-name">
                  Anushka Kedari
                </Typography>

                <Typography className="user-role">
                  Administrator
                </Typography>
              </Box>

              <Button
                size="small"
                variant="outlined"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* MAIN CONTENT */}

        <Box className="main-content">
          <Box className="topbar">
            <IconButton className="mobile-menu">
              <Menu />
            </IconButton>

            <Box className="breadcrumb">
              <Typography className="breadcrumb-muted">
                Workspace
              </Typography>

              <Typography className="breadcrumb-separator">
                /
              </Typography>

              <Typography>
                {activePage}
              </Typography>
            </Box>

            <Box className="topbar-actions">
              <TextField
                size="small"
                placeholder="Search documents..."
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(event.target.value)
                }
                className="search-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Tooltip title="Notifications">
                <IconButton className="notification-button">
                  <NotificationsNoneOutlined />
                  <Box className="notification-dot" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box className="page-content">
            {/* PAGE HEADING */}

            <Box className="page-heading">
              <Box>
                <Typography className="eyebrow">
                  SECURE WORKSPACE
                </Typography>

                <Typography className="page-title">
                  Good evening, Anushka.
                </Typography>

                <Typography className="page-description">
                  Your evidence vault is secure and up to date.
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                flexWrap="wrap"
              >
                {/* CASE SELECTOR */}

                <Select
                  size="small"
                  value={selectedCaseId}
                  onChange={(event) =>
                    setSelectedCaseId(event.target.value)
                  }
                  displayEmpty
                  disabled={
                    uploading ||
                    loadingData ||
                    cases.length === 0
                  }
                  sx={{
                    minWidth: 220,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <MenuItem value="">
                    <em>Select case</em>
                  </MenuItem>

                  {cases.map((caseItem) => (
                    <MenuItem
                      key={caseItem.id}
                      value={caseItem.id}
                    >
                      {caseItem.title ||
                        caseItem.name ||
                        `Case #${caseItem.id}`}
                    </MenuItem>
                  ))}
                </Select>

                <Button
                  variant="contained"
                  startIcon={<CloudUploadOutlined />}
                  onClick={handleUploadClick}
                  disabled={
                    uploading ||
                    loadingData ||
                    cases.length === 0 ||
                    !selectedCaseId
                  }
                  className="upload-button"
                >
                  {uploading
                    ? "Uploading..."
                    : "Upload document"}
                </Button>
              </Stack>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                onChange={handleFileSelected}
              />
            </Box>

            {/* ALERTS */}

            {message && (
              <Alert
                severity="success"
                onClose={() => setMessage("")}
                className="upload-alert"
              >
                {message}
              </Alert>
            )}

            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                className="upload-alert"
              >
                {error}
              </Alert>
            )}

            {/* STATISTICS */}

            <Box className="stats-grid">
              <StatCard
                icon={<DescriptionOutlined />}
                value={realDocuments.length}
                label="Total documents"
                caption="Across your secure vault"
              />

              <StatCard
                icon={<VerifiedUserOutlined />}
                value={realDocuments.length}
                label="Verified documents"
                caption="Integrity checks passed"
                accent
              />

              <StatCard
                icon={<GavelOutlined />}
                value={cases.length}
                label="Active cases"
                caption="Documents linked to cases"
              />

              <StatCard
                icon={<ShieldOutlined />}
                value="100%"
                label="Vault security"
                caption="Encryption status"
              />
            </Box>

            {/* CONTENT GRID */}

            <Box className="content-grid">
              <Paper
                className="documents-panel"
                elevation={0}
              >
                <Box className="panel-header">
                  <Box>
                    <Typography className="panel-title">
                      Recent documents
                    </Typography>

                    <Typography className="panel-subtitle">
                      Your latest evidence and legal records
                    </Typography>
                  </Box>

                  <Button
                    variant="text"
                    className="view-all-button"
                    onClick={() =>
                      setActivePage("Document Vault")
                    }
                  >
                    View all
                  </Button>
                </Box>

                <Divider />

                <Box className="document-list">
                  {loadingData ? (
                    <Typography className="empty-state">
                      Loading documents...
                    </Typography>
                  ) : filteredDocuments.length === 0 ? (
                    <Typography className="empty-state">
                      No documents found.
                    </Typography>
                  ) : (
                    filteredDocuments.map((document) => (
                      <Box
                        className="document-row"
                        key={`real-${document.id}`}
                      >
                        <Box className="document-icon">
                          <DescriptionOutlined />
                        </Box>

                        <Box className="document-info">
                          <Typography className="document-name">
                            {document.original_filename}
                          </Typography>

                          <Typography className="document-meta">
                            {document.case_title
                              ? `${document.case_title} · `
                              : ""}

                            {(
                              Number(
                                document.file_size || 0
                              ) / 1024
                            ).toFixed(1)}{" "}
                            KB
                          </Typography>
                        </Box>

                        <Chip
                          icon={<VerifiedUserOutlined />}
                          label="Verified"
                          className="verified-chip"
                          size="small"
                        />

                        <Stack
                          direction="row"
                          spacing={1}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              handleVerify(document.id)
                            }
                          >
                            Verify
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              handleDownload(document.id)
                            }
                          >
                            Download
                          </Button>
                        </Stack>
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>

              {/* RIGHT COLUMN */}

              <Box className="right-column">
                <Paper
                  className="integrity-card"
                  elevation={0}
                >
                  <Box className="integrity-top">
                    <Box className="integrity-icon">
                      <ShieldOutlined />
                    </Box>

                    <Chip
                      label="All systems secure"
                      className="secure-chip"
                    />
                  </Box>

                  <Typography className="integrity-title">
                    Evidence integrity
                  </Typography>

                  <Typography className="integrity-description">
                    Every document is encrypted and verified
                    against its blockchain integrity record.
                  </Typography>

                  <Box className="integrity-meter">
                    <Box className="meter-header">
                      <Typography>
                        Vault integrity
                      </Typography>

                      <Typography>
                        100%
                      </Typography>
                    </Box>

                    <Box className="meter-track">
                      <Box className="meter-progress" />
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    className="integrity-button"
                    onClick={() =>
                      setActivePage("Security")
                    }
                  >
                    View security details
                  </Button>
                </Paper>

                <Paper
                  className="activity-card"
                  elevation={0}
                >
                  <Typography className="panel-title">
                    Recent activity
                  </Typography>

                  <Typography className="panel-subtitle">
                    Latest actions in your vault
                  </Typography>

                  <Box className="activity-item">
                    <Box className="activity-dot green" />

                    <Box>
                      <Typography className="activity-title">
                        Document verified
                      </Typography>

                      <Typography className="activity-meta">
                        Your latest integrity check
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="activity-item">
                    <Box className="activity-dot gold" />

                    <Box>
                      <Typography className="activity-title">
                        New document uploaded
                      </Typography>

                      <Typography className="activity-meta">
                        Your latest evidence record
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="activity-item">
                    <Box className="activity-dot blue" />

                    <Box>
                      <Typography className="activity-title">
                        Audit record created
                      </Typography>

                      <Typography className="activity-meta">
                        Secure activity tracking enabled
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>

            {/* FOOTER */}

            <Box className="footer-note">
              <Typography>
                NyayaVault · Secure legal evidence management
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Box className="status-dot" />

                <Typography>
                  Backend services connected
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;