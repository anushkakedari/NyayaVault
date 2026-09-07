import { useRef, useState } from "react";
import {
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
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from "@mui/material";

import {
  Add,
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
    mode: "dark",
    primary: {
      main: "#D6B77A",
    },
    background: {
      default: "#0B111C",
      paper: "#111A28",
    },
    text: {
      primary: "#F5F7FA",
      secondary: "#8E9AAF",
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
  },
  shape: {
    borderRadius: 14,
  },
});

const documents = [
  {
    name: "Orchid College Syllabus",
    type: "PDF",
    category: "Academic Record",
    date: "03 Sep 2026",
    status: "Verified",
    size: "1.2 MB",
  },
  {
    name: "Investigation Report — Case 024",
    type: "PDF",
    category: "Case Evidence",
    date: "02 Sep 2026",
    status: "Verified",
    size: "3.8 MB",
  },
  {
    name: "Identity Verification Document",
    type: "JPG",
    category: "Identity",
    date: "01 Sep 2026",
    status: "Verified",
    size: "842 KB",
  },
  {
    name: "Evidence Photograph — Exhibit A",
    type: "PNG",
    category: "Digital Evidence",
    date: "31 Aug 2026",
    status: "Verified",
    size: "2.4 MB",
  },
];

function StatCard({ icon, label, value, caption, accent = false }) {
  return (
    <Paper className="stat-card" elevation={0}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box className="stat-icon">{icon}</Box>

        {accent && (
          <Chip label="Live" size="small" className="live-chip" />
        )}
      </Stack>

      <Typography className="stat-value">{value}</Typography>
      <Typography className="stat-label">{label}</Typography>
      <Typography className="stat-caption">{caption}</Typography>
    </Paper>
  );
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [searchValue, setSearchValue] = useState("");

  const fileInputRef = useRef(null);

  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const filteredDocuments = documents.filter((document) =>
    document.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setMessage("");
    setError("");
    setUploading(true);

    try {
      if (!token) {
        throw new Error("Please login first. JWT token not found.");
      }

      const result = await uploadDocument(file, token);

      const uploadedDocument = result.document;

      setUploadedDocuments((previousDocuments) => [
        uploadedDocument,
        ...previousDocuments,
      ]);

      setMessage(
        `${uploadedDocument.original_filename} uploaded and secured successfully.`
      );
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleVerify = async (documentId) => {
    try {
      setMessage("");
      setError("");

      if (!token) {
        throw new Error("Please login first.");
      }

      const result = await verifyDocument(documentId, token);

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
      setError(verifyError.message);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      setMessage("");
      setError("");

      if (!token) {
        throw new Error("Please login first.");
      }

      await downloadDocument(documentId, token);

      setMessage("Document downloaded successfully.");
    } catch (downloadError) {
      setError(downloadError.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box className="app-shell">
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
                  activePage === item.label ? "active" : ""
                }`}
                onClick={() => setActivePage(item.label)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>

                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>

          <Typography className="menu-label">
            SYSTEM
          </Typography>

          <List className="navigation">
            <ListItemButton
              className={`nav-item ${
                activePage === "Security" ? "active" : ""
              }`}
              onClick={() => setActivePage("Security")}
            >
              <ListItemIcon>
                <SecurityOutlined />
              </ListItemIcon>

              <ListItemText primary="Security & Integrity" />
            </ListItemButton>

            <ListItemButton
              className={`nav-item ${
                activePage === "Settings" ? "active" : ""
              }`}
              onClick={() => setActivePage("Settings")}
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

              <Box sx={{ minWidth: 0 }}>
                <Typography className="user-name">
                  Anushka Kedari
                </Typography>

                <Typography className="user-role">
                  Administrator
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

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

              <Button
                variant="contained"
                startIcon={<CloudUploadOutlined />}
                onClick={handleUploadClick}
                disabled={uploading}
                className="upload-button"
              >
                {uploading
                  ? "Uploading..."
                  : "Upload document"}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                onChange={handleFileSelected}
              />
            </Box>

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

            <Box className="stats-grid">
              <StatCard
                icon={<DescriptionOutlined />}
                value="24"
                label="Total documents"
                caption="Across your secure vault"
              />

              <StatCard
                icon={<VerifiedUserOutlined />}
                value="24"
                label="Verified documents"
                caption="Integrity checks passed"
                accent
              />

              <StatCard
                icon={<GavelOutlined />}
                value="08"
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
                    endIcon={<Add />}
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

                  {/* REAL UPLOADED DOCUMENTS */}

                  {uploadedDocuments.map((document) => (
                    <Box
                      className="document-row"
                      key={`uploaded-${document.id}`}
                    >
                      <Box className="document-icon">
                        <DescriptionOutlined />
                      </Box>

                      <Box className="document-info">
                        <Typography className="document-name">
                          {document.original_filename}
                        </Typography>

                        <Typography className="document-meta">
                          Uploaded document ·{" "}
                          {(document.file_size / 1024).toFixed(1)} KB
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
                  ))}

                  {/* DEMO DOCUMENTS */}

                  {filteredDocuments.length === 0 &&
                  uploadedDocuments.length === 0 ? (
                    <Typography className="empty-state">
                      No documents found.
                    </Typography>
                  ) : (
                    filteredDocuments.map((document) => (
                      <Box
                        className="document-row"
                        key={document.name}
                      >
                        <Box className="document-icon">
                          <DescriptionOutlined />
                        </Box>

                        <Box className="document-info">
                          <Typography className="document-name">
                            {document.name}
                          </Typography>

                          <Typography className="document-meta">
                            {document.category} ·{" "}
                            {document.size}
                          </Typography>
                        </Box>

                        <Typography className="document-date">
                          {document.date}
                        </Typography>

                        <Chip
                          icon={
                            <VerifiedUserOutlined />
                          }
                          label={document.status}
                          className="verified-chip"
                          size="small"
                        />

                        <IconButton className="document-more">
                          <span>•••</span>
                        </IconButton>
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>

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
                        Orchid College Syllabus · 12 min ago
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
                        Investigation Report · 1 hour ago
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
                        Case 024 · 3 hours ago
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>

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