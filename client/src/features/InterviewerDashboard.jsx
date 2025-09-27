// client/src/features/InterviewerDashboard.jsx
import React, { useState } from "react";
import { Table, Input, Card } from "antd";
import { useSelector } from "react-redux";

export default function InterviewerDashboard({ onSelect }) {
  const candidates = useSelector((s) => s.interview.candidates || {});
  const [search, setSearch] = useState("");

  const rows = Object.entries(candidates)
    .map(([id, s]) => ({
      key: id,
      name: s.name || "Unknown",
      email: s.email || "",
      score: s.finalScore || 0,
      summary: s.summary || "",
    }))
    .filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase())
    );

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Score", dataIndex: "score", sorter: (a, b) => a.score - b.score },
    { title: "Summary", dataIndex: "summary" },
  ];

  return (
    <Card title="Interviewer Dashboard">
      <Input.Search
        placeholder="Search candidates..."
        style={{ marginBottom: 12 }}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Table
        columns={columns}
        dataSource={rows}
        onRow={(record) => ({ onClick: () => onSelect(record.key) })}
      />
    </Card>
  );
}
