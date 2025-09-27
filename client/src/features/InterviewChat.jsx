// client/src/features/InterviewChat.jsx
import React, { useEffect, useState, useRef } from "react";
import { Button, Progress, Card, Input } from "antd";
import axios from "axios";

const { TextArea } = Input;

const QUESTIONS = [
  { q: "What is React?", type: "easy", time: 20 },
  { q: "Explain props vs state.", type: "easy", time: 20 },
  { q: "Explain reconciliation and keys.", type: "medium", time: 60 },
  { q: "Design login API with security.", type: "medium", time: 60 },
  { q: "Explain event loop with async/await.", type: "hard", time: 120 },
  { q: "Design caching layer for DB queries.", type: "hard", time: 120 },
];

export default function InterviewChat({ sessionId, onFinish }) {
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTIONS[0].time);
  const [answers, setAnswers] = useState([]);
  const [input, setInput] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
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
    return () => clearInterval(timerRef.current);
  }, [index]);

  const handleSubmit = async () => {
    const answer = input.trim();
    try {
      const resp = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/gemini/validate`,
        { question: QUESTIONS[index].q, answer }
      );
      setAnswers((prev) => [...prev, { q: QUESTIONS[index].q, a: answer, r: resp.data }]);
    } catch {
      setAnswers((prev) => [...prev, { q: QUESTIONS[index].q, a: answer, r: { error: true } }]);
    }
    setInput("");
    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1);
    } else {
      onFinish(answers);
    }
  };

  return (
    <Card
      title={`Question ${index + 1} (${QUESTIONS[index].type})`}
      style={{ marginTop: 20 }}
    >
      <p>{QUESTIONS[index].q}</p>
      <p><b>Time Left:</b> {timeLeft}s</p>
      <TextArea
        rows={5}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your answer here..."
      />
      <Button type="primary" style={{ marginTop: 10 }} onClick={handleSubmit}>
        Submit
      </Button>
      <Progress
        percent={((index + 1) / QUESTIONS.length) * 100}
        style={{ marginTop: 15 }}
      />
    </Card>
  );
}
