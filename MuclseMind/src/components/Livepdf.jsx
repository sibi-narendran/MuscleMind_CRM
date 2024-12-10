import React, { useRef, useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFEditor = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const canvasRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (pdfFile) renderPage(currentPage);
  }, [pdfFile, currentPage]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileData = await file.arrayBuffer();
      setPdfFile(fileData);
      loadPDF(fileData);
    }
  };

  const loadPDF = async (fileData) => {
    const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
    setNumPages(pdf.numPages);
    renderPage(1); // Render the first page initially
  };

  const renderPage = async (pageNumber) => {
    const pdf = await pdfjsLib.getDocument({ data: pdfFile }).promise;
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
  };

  const addText = (text, x, y) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.font = "16px Arial";
    context.fillStyle = "blue";
    context.fillText(text, x, y);
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const text = inputRef.current.value || "Sample Text";
    addText(text, x, y);
  };

  const savePDF = async () => {
    if (!pdfFile) return;

    const pdfDoc = await PDFDocument.load(pdfFile);
    const page = pdfDoc.getPage(currentPage - 1);

    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    const pngImage = await pdfDoc.embedPng(imageData);

    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    });

    const editedPdfBytes = await pdfDoc.save();
    saveAs(new Blob([editedPdfBytes]), "edited.pdf");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Live PDF Editor</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        style={{ marginBottom: "10px" }}
      />
      <div>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage <= 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {numPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, numPages))
          }
          disabled={currentPage >= numPages}
        >
          Next
        </button>
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter text"
        style={{ marginTop: "10px", marginBottom: "10px" }}
      />
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black", cursor: "text" }}
        onClick={handleCanvasClick}
      ></canvas>
      <button
        onClick={savePDF}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Save Edited PDF
      </button>
    </div>
  );
};

export default PDFEditor;
