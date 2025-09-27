import React, { useEffect, useState, useRef } from "react";
import { Button, Progress, Card, Input, Typography, Alert, Space, Statistic, notification } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { Title, Text } = Typography;

const QUESTIONS = [
  { q: "What is React and its key features?", type: "easy", time: 30 },
  { q: "Explain the difference between props and state in React.", type: "easy", time: 30 },
  { q: "What is Virtual DOM and how does React use it?", type: "medium", time: 45 },
  { q: "Explain React component lifecycle methods.", type: "medium", time: 45 },
  { q: "What are React hooks? Provide examples of commonly used hooks.", type: "medium", time: 60 },
  { q: "How would you optimize a React application's performance?", type: "hard", time: 90 },
];

export default function InterviewChat({ sessionId, onFinish }) {
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTIONS[0].time);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (index < QUESTIONS.length) {
      setTimeLeft(QUESTIONS[index].time);
      clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [index]);

  const handleSubmit = async () => {
    const answer = input.trim();
    if (!answer) {
      notification.warning({ message: "Please write an answer before submitting" });
      if (index + 1 < QUESTIONS.length) {
        setIndex(index + 1);
      } else {
        onFinish(results);
      }
      return;
    }

    setLoading(true);
    try {
      const resp = await axios.post(
        `http://localhost:4000/api/gemini/validate`,
        { 
          question: QUESTIONS[index].q, 
          answer,
          role: 'Full Stack (React/Node)'
        }
      );
      
      const result = { 
        question: QUESTIONS[index].q, 
        answer: answer, 
        evaluation: resp.data,
        timestamp: new Date().toISOString()
      };
      
      setResults(prev => [...prev, result]);
      
    } catch (error) {
      console.error('Evaluation error:', error);
      setResults(prev => [...prev, { 
        question: QUESTIONS[index].q, 
        answer: answer, 
        evaluation: { error: true, feedback: "Evaluation failed" },
        timestamp: new Date().toISOString()
      }]);
    }
    
    setInput("");
    setLoading(false);
    
    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1);
    } else {
      clearInterval(timerRef.current);
      onFinish(results);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card 
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Question {index + 1} of {QUESTIONS.length}
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              ({QUESTIONS[index].type} level)
            </Text>
          </Space>
        }
        style={{ marginBottom: 24, borderLeft: '4px solid #1890ff' }}
        extra={
          <Statistic
            value={formatTime(timeLeft)}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: timeLeft < 10 ? '#ff4d4f' : '#1890ff' }}
          />
        }
      >
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
          {QUESTIONS[index].q}
        </Text>
        
        <TextArea
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your detailed answer here..."
          disabled={loading}
          style={{ marginBottom: 16 }}
        />
        
        <Space>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
            icon={<CheckCircleOutlined />}
            size="large"
          >
            Submit Answer
          </Button>
          
          {timeLeft < 10 && (
            <Alert 
              message="Time running out!" 
              type="warning" 
              showIcon 
            />
          )}
        </Space>
      </Card>

      <Progress
        percent={Math.round(((index + 1) / QUESTIONS.length) * 100)}
        status="active"
        style={{ margin: '24px 0' }}
      />

      {results.length > 0 && (
        <Card title="Previous Answers Feedback" style={{ marginTop: 24 }}>
          {results.map((result, i) => (
            <div key={i} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 6 }}>
              <Text strong>Q: {result.question}</Text>
              <br />
              <Text type="secondary">Your Answer: {result.answer}</Text>
              <br />
              {result.evaluation.score && (
                <Text style={{ color: result.evaluation.score >= 7 ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>
                  Score: {result.evaluation.score}/10 - {result.evaluation.feedback}
                </Text>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}