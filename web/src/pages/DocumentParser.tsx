import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Upload, FileText, CheckCircle, RefreshCw, Copy, PlusCircle, AlertCircle, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { documentService, getFullUrl } from '../services/api';
import { Card, Button, Progress, Tabs } from 'antd';

export const DocumentParser: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [markdown, setMarkdown] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [dragActive, setDragActive] = useState(false);

  // Step simulation configuration
  const steps = [
    t('parsing_progress_step1') || 'Uploading file to server...',
    t('parsing_progress_step2') || 'Running MinerU layout analysis (CPU)...',
    t('parsing_progress_step3') || 'Extracting text structure and tables...',
    t('parsing_progress_step4') || 'Saving and linking extracted images...',
  ];

  // Simulated progress stepper since PDF layout parsing is long
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (parsing) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 7000); // Shift step every 7s
    } else {
      setCurrentStep(0);
    }
    return () => clearInterval(interval);
  }, [parsing, steps.length]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile: File): boolean => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      showError(t('parser_error_invalid_type') || 'Unsupported file format! Only PDF or DOCX files are allowed.');
      return false;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      showError(t('parser_error_too_large') || 'File is too large! Please choose a file smaller than 50MB.');
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const triggerParse = async () => {
    if (!file) return;
    setParsing(true);
    setMarkdown('');
    setCurrentStep(0);

    try {
      const res = await documentService.parse(file);
      if (res.success && res.data) {
        setMarkdown(res.data.markdown);
        showSuccess(t('success') || 'Parsed successfully!');
      } else {
        showError(res.message || 'Failed to parse document');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Error occurred during parsing service call.');
    } finally {
      setParsing(false);
    }
  };

  const cleanMetadata = (md: string): string => {
    let clean = md;

    // Remove copyright boilerplate lines
    clean = clean.replace(/^[©\(\)0-9a-zA-Z\s]+Quan Huynh.*$/gim, '');
    
    // Remove isolated single-page numbers (e.g. lone number on a line)
    clean = clean.replace(/^\s*\d+\s*$/gm, '');

    // Clean up duplicate linebreaks
    clean = clean.replace(/\n{3,}/g, '\n\n');

    return clean.trim();
  };

  const copyToClipboard = () => {
    const cleanedMd = cleanMetadata(markdown);
    navigator.clipboard.writeText(cleanedMd);
    showSuccess(t('copied') || 'Copied cleaned Markdown to clipboard!');
  };

  // Convert raw Markdown elements to standard HTML for Tiptap RichTextEditor compatibility
  const mdToHtml = (md: string): string => {
    let html = md.replace(/\r\n/g, '\n');
    
    // Replace Headings
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    
    // Replace Bold / Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace Images - Use getFullUrl to ensure relative /uploads paths become fully accessible
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, src) => {
      return `<img src="${getFullUrl(src)}" alt="${alt}" />`;
    });
    
    // Replace Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Replace Lists (simple line-based)
    html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    
    // Wrap paragraph blocks
    const paragraphs = html.split('\n\n');
    const wrapped = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<li>') || p.startsWith('<img') || p.startsWith('<table')) {
        return p;
      }
      return `<p>${p}</p>`;
    });
    
    return wrapped.join('\n');
  };

  const createPostFromParsed = () => {
    const cleanedMd = cleanMetadata(markdown);
    const htmlContent = mdToHtml(cleanedMd);
    localStorage.setItem('imported_content', htmlContent);
    showSuccess(t('success') || 'Import state set! Redirecting to post editor...');
    navigate('/admin/posts/new');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-850 dark:text-gray-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-accentBlue" />
            {t('parser_title') || 'Document Parsing & Import'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-sans max-w-2xl">
            {t('parser_subtitle') || 'Convert PDF/DOCX documents to high-quality Markdown blog content using MinerU'}
          </p>
        </div>
      </div>

      {/* Main Parser Panel */}
      {!markdown && (
        <Card className="glass-panel border-slate-200 dark:border-slate-800/80 shadow-lg rounded-2xl p-6">
          <div className="max-w-xl mx-auto space-y-6">
            {/* Upload Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
                dragActive
                  ? 'border-accentBlue bg-accentBlue/5 scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-850 hover:border-accentBlue/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
              }`}
              onClick={() => document.getElementById('file-upload-input')?.click()}
            >
              <input
                id="file-upload-input"
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileInput}
              />
              <Upload className="w-12 h-12 text-slate-400 mb-4 animate-pulse" />
              <h3 className="font-semibold text-base text-slate-800 dark:text-gray-250">
                {file ? file.name : (t('upload_zone_title') || 'Drag & drop a file here or click to select file')}
              </h3>
              <p className="text-xs text-gray-500 mt-2 font-sans">
                {file 
                  ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
                  : (t('upload_zone_hint') || 'Supports PDF and DOCX formats. Max file size is 50MB.')}
              </p>
            </div>

            {/* Parsing State Visualizer */}
            {parsing && (
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/50 dark:border-slate-900">
                <Progress
                  percent={Math.min(99, Math.round(((currentStep + 1) / steps.length) * 100))}
                  status="active"
                  strokeColor={{ '0%': '#10B981', '100%': '#3B82F6' }}
                  showInfo={false}
                />
                
                {/* Stepper details */}
                <div className="space-y-3 pt-2">
                  {steps.map((stepText, idx) => {
                    const isDone = idx < currentStep;
                    const isActive = idx === currentStep;
                    return (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : isActive ? (
                          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-350 dark:border-slate-800 shrink-0" />
                        )}
                        <span className={`font-sans ${isDone ? 'text-slate-400 line-through' : isActive ? 'text-blue-500 font-medium' : 'text-slate-500'}`}>
                          {stepText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Run Button */}
            <div className="flex justify-end gap-3 pt-2">
              {file && !parsing && (
                <Button
                  onClick={() => setFile(null)}
                  className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900"
                >
                  {t('clear') || 'Clear'}
                </Button>
              )}
              <Button
                type="primary"
                onClick={triggerParse}
                disabled={!file || parsing}
                className="bg-accentBlue border-accentBlue hover:brightness-110 h-10 px-6 rounded-xl font-semibold flex items-center gap-2"
              >
                {parsing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t('loading') || 'Processing...'}
                  </>
                ) : (
                  t('parser_create_post_btn') || 'Parse Document'
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Editor & Preview Area */}
      {markdown && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-wrap justify-between items-center bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 border border-slate-250 dark:border-slate-800 rounded-xl">
              <Button 
                type={activeTab === 'split' ? 'primary' : 'text'}
                onClick={() => setActiveTab('split')}
                className="rounded-lg text-xs"
              >
                Split View
              </Button>
              <Button 
                type={activeTab === 'editor' ? 'primary' : 'text'}
                onClick={() => setActiveTab('editor')}
                className="rounded-lg text-xs"
              >
                {t('parser_edit_content') || 'Edit Markdown'}
              </Button>
              <Button 
                type={activeTab === 'preview' ? 'primary' : 'text'}
                onClick={() => setActiveTab('preview')}
                className="rounded-lg text-xs"
              >
                {t('parser_preview_content') || 'Preview'}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setMarkdown('');
                  setFile(null);
                }}
                className="rounded-xl border-slate-200 dark:border-slate-800"
              >
                Parse Another File
              </Button>
              <Button
                onClick={copyToClipboard}
                icon={<Copy className="w-3.5 h-3.5" />}
                className="rounded-xl flex items-center gap-1.5 border-slate-200 dark:border-slate-800"
              >
                {t('parser_copy_btn') || 'Copy Markdown'}
              </Button>
              <Button
                type="primary"
                onClick={createPostFromParsed}
                icon={<PlusCircle className="w-3.5 h-3.5" />}
                className="bg-accentBlue border-accentBlue hover:brightness-110 rounded-xl flex items-center gap-1.5"
              >
                {t('parser_create_post_btn') || 'Create Blog Post'}
              </Button>
            </div>
          </div>

          {/* Split / Editor / Preview screen */}
          <div className="grid grid-cols-1 gap-6 min-h-[500px]">
            {activeTab === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Markdown Editor */}
                <div className="flex flex-col border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-accentBlue" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">Raw Markdown Editor</span>
                  </div>
                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    className="flex-1 w-full p-4 font-mono text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 outline-none resize-none min-h-[500px] border-none leading-relaxed"
                  />
                </div>

                {/* Markdown Preview */}
                <div className="flex flex-col border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-accentPurple" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">Live HTML Preview</span>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto max-h-[580px] prose dark:prose-invert font-sans leading-relaxed text-slate-800 dark:text-gray-250">
                    <ReactMarkdown>{markdown}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="flex flex-col border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full p-6 font-mono text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 outline-none resize-none min-h-[600px] border-none leading-relaxed"
                />
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="border border-slate-200 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm overflow-y-auto max-h-[700px] prose dark:prose-invert font-sans leading-relaxed text-slate-800 dark:text-gray-250">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentParser;
