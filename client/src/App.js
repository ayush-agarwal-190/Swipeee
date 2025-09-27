// client/src/App.jsx
import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Modal, notification } from "antd";
import { auth, onAuthStateChanged, signOut } from "./firebase";
import { useDispatch, useSelector } from "react-redux";
import { saveSession, setCurrentSession } from "./store";
import ResumeUpload from "./features/ResumeUpload";
import InterviewChat from "./features/InterviewChat";
import InterviewerDashboard from "./features/InterviewerDashboard";
import AuthModal from "./components/AuthModal";

const { Header, Content, Sider } = Layout;

function App() {
  const [tab, setTab] = useState("interviewee");
  const [user, setUser] = useState(null);
  const [authVisible, setAuthVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const dispatch = useDispatch();
  const { currentSession } = useSelector((s) => s.interview);

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  useEffect(() => {
    // Example unfinished session detection
    if (currentSession) setShowWelcome(true);
  }, [currentSession]);

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
    };
    dispatch(saveSession({ id, session }));
    dispatch(setCurrentSession(id));
    notification.success({ message: "Resume uploaded successfully" });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          color: "#fff",
          fontSize: 18,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        AI Interview Assistant
        <div>
          {user ? (
            <>
              <span style={{ marginRight: 10 }}>
                Welcome, {user.displayName || user.email}
              </span>
              <Button size="small" onClick={() => signOut(auth)}>
                Logout
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => setAuthVisible(true)}
            >
              Login
            </Button>
          )}
        </div>
      </Header>
      <Layout>
        <Sider width={200}>
          <Menu
            mode="inline"
            selectedKeys={[tab]}
            onClick={({ key }) => setTab(key)}
            items={[
              { key: "interviewee", label: "Interviewee" },
              { key: "interviewer", label: "Interviewer" },
            ]}
          />
        </Sider>
        <Content style={{ padding: 20 }}>
          {tab === "interviewee" && (
            <>
              <ResumeUpload onExtracted={handleExtracted} />
              {currentSession && (
                <InterviewChat sessionId={currentSession} onFinish={() => {}} />
              )}
            </>
          )}
          {tab === "interviewer" && (
            <InterviewerDashboard onSelect={(id) => console.log("open", id)} />
          )}
        </Content>
      </Layout>

      {/* Welcome Back Modal */}
      <Modal
        open={showWelcome}
        onCancel={() => setShowWelcome(false)}
        onOk={() => setShowWelcome(false)}
        title="Welcome Back"
      >
        <p>You have an unfinished interview. Would you like to resume?</p>
      </Modal>

      {/* Auth Modal */}
      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} />
    </Layout>
  );
}

export default App;
