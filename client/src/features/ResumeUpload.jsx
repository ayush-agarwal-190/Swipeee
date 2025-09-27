import React, { useState } from 'react';
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import mammoth from 'mammoth';
import { Card, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

// Set up PDF.js worker - using version-specific CDN or local build
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Alternative: If CDN issues persist, use this local approach:
// pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.js',
//   import.meta.url
// ).toString();

export default function ResumeUpload({ onExtracted }) {
  const [loading, setLoading] = useState(false);

  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        fullText += content.items.map((i) => i.str).join(" ") + "\n";
      }
      return fullText;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const extractFromDocx = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Error extracting DOCX text:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  };

  const parseFields = (text) => {
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const nameCandidate = lines.length > 0 ? lines[0].split(" ").slice(0, 3).join(" ") : "";
    
    return {
      name: nameCandidate,
      email: emailMatch ? emailMatch[0] : "",
      phone: phoneMatch ? phoneMatch[0] : "",
    };
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    
    try {
      let text = "";
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        text = await extractTextFromPDF(file);
      } else if (file.name.endsWith(".docx")) {
        text = await extractFromDocx(file);
      } else {
        message.error("Only PDF or DOCX files are allowed");
        setLoading(false);
        return false;
      }
      
      const fields = parseFields(text);
      onExtracted(fields, text);
      message.success("Resume uploaded successfully!");
      
    } catch (error) {
      console.error('Upload error:', error);
      message.error("Failed to parse resume file");
    }
    
    setLoading(false);
    return false;
  };

  const uploadProps = {
    beforeUpload: handleFileUpload,
    accept: ".pdf,.docx",
    showUploadList: false,
    multiple: false,
  };

  return (
    <Card title="Upload Resume" style={{ marginBottom: 20 }}>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} loading={loading} type="primary">
          {loading ? "Processing..." : "Upload Resume"}
        </Button>
      </Upload>
      <p style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
        Supported formats: PDF, DOCX
      </p>
    </Card>
  );
}