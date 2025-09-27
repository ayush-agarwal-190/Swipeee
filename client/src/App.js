// client/src/App.js - Enhanced UI and Google Sign-in
import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, notification, theme, Avatar, Typography } from "antd";
import { UserOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { auth, onAuthStateChanged, signOut, signInWithPopup, googleProvider } from "./firebase";
import { useDispatch, useSelector } from "react-redux";
import { saveSession, setCurrentSession } from "./store";
import ResumeUpload from "./features/ResumeUpload";
import InterviewChat from "./features/InterviewChat";
import InterviewerDashboard from "./features/InterviewerDashboard";
import AuthModal from "./components/AuthModal";
import "./App.css";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

function App() {
  const [tab, setTab] = useState("interviewee");
  const [user, setUser] = useState(null);
  const [authVisible, setAuthVisible] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const dispatch = useDispatch();
  const { currentSession, candidates } = useSelector((s) => s.interview);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setAuthVisible(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentSession && candidates[currentSession]?.status === "completed") {
      setInterviewFinished(true);
    }
  }, [currentSession, candidates]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      notification.success({ message: "Signed in with Google successfully!" });
    } catch (error) {
      notification.error({
        message: "Google sign-in failed",
        description: error.message,
      });
    }
  };

  const handleExtracted = (fields, rawText) => {
    const id = "candidate_" + Date.now();
    const session = {
      id,
      name: fields.name || "",
      email: fields.email || "",
      phone: fields.phone || "",
      rawText,
      createdAt: new Date().toISOString(),
      progress: "ready",
      status: "in-progress",
      answers: [],
    };
    dispatch(saveSession({ id, session }));
    dispatch(setCurrentSession(id));
    notification.success({ message: "Resume uploaded successfully!" });
    setInterviewFinished(false);
  };

  const handleInterviewFinish = () => {
    setInterviewFinished(true);
    notification.success({
      message: "Interview Completed!",
      description: "Your answers have been submitted for evaluation.",
    });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: colorBgContainer,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
            🤖 AI Interview Assistant
          </Title>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <>
              <Avatar
                src={user.photoURL}
                icon={!user.photoURL && <UserOutlined />}
                style={{ marginRight: 8 }}
              />
              <Text strong>{user.displayName || user.email}</Text>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={() => signOut(auth)}
                style={{ color: "#ff4d4f" }}
              >
                Logout
              </Button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={handleGoogleSignIn}
              >
                Sign in with Google
              </Button>
              <Button onClick={() => setAuthVisible(true)}>Email Login</Button>
            </div>
          )}
        </div>
      </Header>

      {/* Body */}
      <Layout>
        <Sider width={250} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            selectedKeys={[tab]}
            onClick={({ key }) => setTab(key)}
            style={{ height: "100%", borderRight: 0, paddingTop: 16 }}
            items={[
              {
                key: "interviewee",
                label: "🎯 Candidate Portal",
                style: { marginBottom: 8, fontWeight: "bold" },
              },
              {
                key: "interviewer",
                label: "📊 Interviewer Dashboard",
                style: { fontWeight: "bold" },
              },
            ]}
          />
        </Sider>

        <Layout style={{ padding: "24px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {tab === "interviewee" && (
              <div style={{ maxWidth: 800, margin: "0 auto" }}>
                {interviewFinished ? (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                    <Title level={2} style={{ color: "#52c41a" }}>
                      Interview Completed!
                    </Title>
                    <Text style={{ fontSize: 16 }}>
                      Thank you for completing the interview. Your responses
                      have been evaluated.
                      <br />
                      The interviewer will review your results shortly.
                    </Text>
                    <div style={{ marginTop: 24 }}>
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => setInterviewFinished(false)}
                      >
                        Start New Interview
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <ResumeUpload onExtracted={handleExtracted} />
                    {currentSession && (
                      <InterviewChat
                        sessionId={currentSession}
                        onFinish={handleInterviewFinish}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {tab === "interviewer" && (
              <InterviewerDashboard
                onSelect={(id) => console.log("open", id)}
              />
            )}
          </Content>
        </Layout>
      </Layout>

      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} />
    </Layout>
  );
}

export default App;
