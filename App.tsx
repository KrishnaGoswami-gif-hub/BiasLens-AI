import React, { useState, useRef } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import MethodologySection from './components/MethodologySection';
import AboutSection from './components/AboutSection';
import ExportPage from './components/ExportPage';
import { analyzeText } from './services/geminiService';
import { analyzeTextWithDeepSeek } from './services/deepseekService';
import { processPDFForAnalysis } from './services/pdfService';
import { AnalysisResult, DeepSeekAnalysisResult, AIModel } from './types';
import { analyzeWithML } from './services/mlService';
import PreprocessingView from './components/PreprocessingView';
import SentimentBiasView from './components/SentimentBiasView';
import AssociationRulesView from './components/AssociationRulesView';
import TopicBiasHeatmap from './components/TopicBiasHeatmap';
import MethodologyExplainer from './components/MethodologyExplainer';
import PipelineVisualizer from './components/PipelineVisualizer';
import TextAnalysisHighlighter from './components/TextAnalysisHighlighter';
import ModelSelector from './components/ModelSelector';
import ReasoningDisplay from './components/ReasoningDisplay';
import DualAnalysisView from './components/DualAnalysisView';
import BiasDistributionChart from './components/BiasDistributionChart';
import ConfidenceRadarChart from './components/ConfidenceRadarChart';
import SentimentGauge from './components/SentimentGauge';
import { Play, RotateCcw, FileText, Lock, Sparkles, BookOpen, Upload, Type } from 'lucide-react';

const SAMPLE_TEXT = `User1: While some argue that climate change is natural, the data undeniably shows human impact. It is a disaster waiting to happen.
User2: I have always believed that renewable energy is the only path forward. We must ban all fossil fuels immediately.
User3: Opponents are strictly motivated by greed and never care about the planet's future. It is horrible to see such negligence.
User4: Economic factors are also important. We cannot destroy the economy for green goals.
User5: That is a lie. Every single scientist agrees with this, and anyone who disagrees is simply wrong.
User6: The policy changes are catastrophic for the working class. This is a complete failure of leadership.`;

const App: React.FC = () => {
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [deepseekResult, setDeepseekResult] = useState<DeepSeekAnalysisResult | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('deepseek');
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'pdf'>('text');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [streamingReasoning, setStreamingReasoning] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setDeepseekResult(null);
    setStreamingReasoning('');

    try {
      if (selectedModel === 'gemini') {
        const data = await analyzeText(inputText);
        setResult(data);
      } else if (selectedModel === 'deepseek') {
        const data = await analyzeTextWithDeepSeek(inputText, (reasoning) => {
          setStreamingReasoning(prev => prev + reasoning);
        });
        setDeepseekResult(data);
      } else if (selectedModel === 'ml') {
        // Call Python ML backend
        const data = await analyzeWithML(inputText);
        setResult(data);
      } else if (selectedModel === 'dual') {
        // Run both analyses in parallel
        const [geminiData, deepseekData] = await Promise.all([
          analyzeText(inputText),
          analyzeTextWithDeepSeek(inputText, (reasoning) => {
            setStreamingReasoning(prev => prev + reasoning);
          })
        ]);
        setResult(geminiData);
        setDeepseekResult(deepseekData);
      }
    } catch (e) {
      setError("Analysis failed. Please try again or check your API key configuration.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setPdfProcessing(true);
    setError(null);
    setUploadedFileName(file.name);

    try {
      const extractedText = await processPDFForAnalysis(file);
      setInputText(extractedText);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process PDF file.');
      setUploadedFileName(null);
      console.error(e);
    } finally {
      setPdfProcessing(false);
    }
  };

  const handleModeSwitch = (mode: 'text' | 'pdf') => {
    setInputMode(mode);
    setError(null);
    if (mode === 'text') {
      setUploadedFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Methodology Section */}
      <MethodologySection />

      <main id="analysis-section" className="flex-grow py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Start Your Analysis</h2>
              <p className="text-slate-600 text-lg">
                  Analyze online discussions for confirmation bias and negativity bias using advanced data mining techniques.
              </p>
          </div>

          <PipelineVisualizer isProcessing={loading} />

          {/* Input Section */}
          <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-white p-1">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                        <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    Discussion Data Source
                </h2>
                <button 
                    onClick={() => setInputText(SAMPLE_TEXT)}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 font-semibold transition-colors"
                >
                    Load Sample Dataset
                </button>
                </div>

                {/* Model Selector */}
                <ModelSelector 
                  selectedModel={selectedModel} 
                  onModelChange={setSelectedModel}
                  disabled={loading}
                />

                {/* Input Mode Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleModeSwitch('text')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      inputMode === 'text'
                        ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    Text Input
                  </button>
                  <button
                    onClick={() => handleModeSwitch('pdf')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      inputMode === 'pdf'
                        ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    PDF Upload
                  </button>
                </div>
                
                {/* Text Input Mode */}
                {inputMode === 'text' && (
                  <div className="relative">
                      <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="w-full h-40 p-4 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm text-slate-700 leading-relaxed shadow-inner"
                          placeholder="Paste social media comments, forum posts, or discussion text here..."
                      />
                  </div>
                )}

                {/* PDF Upload Mode */}
                {inputMode === 'pdf' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="flex flex-col items-center justify-center w-full h-40 px-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all"
                      >
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm font-semibold text-slate-700">
                          {pdfProcessing ? 'Processing PDF...' : 'Click to upload PDF file'}
                        </span>
                        <span className="text-xs text-slate-500 mt-1">
                          PDF files containing discussion comments or text
                        </span>
                      </label>
                    </div>

                    {/* Display uploaded file name */}
                    {uploadedFileName && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700 font-medium flex-1">
                          {uploadedFileName}
                        </span>
                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                          ✓ Loaded
                        </span>
                      </div>
                    )}

                    {/* Preview extracted text */}
                    {inputText && uploadedFileName && (
                      <div className="relative">
                        <label className="text-xs font-semibold text-slate-600 mb-2 block">
                          Extracted Text Preview:
                        </label>
                        <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="w-full h-32 p-4 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-xs text-slate-700 leading-relaxed shadow-inner"
                          placeholder="Extracted text will appear here..."
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <Lock className="w-3 h-3" />
                        Data is processed anonymously. No personal diagnosis.
                    </p>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !inputText.trim()}
                        className={`inline-flex items-center px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200
                        ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:translate-y-[-1px] hover:shadow-xl'}
                        transition-all duration-200`}
                    >
                        {loading ? (
                        <>
                            <RotateCcw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Processing Pipeline...
                        </>
                        ) : (
                        <>
                            <Play className="-ml-1 mr-2 h-4 w-4 fill-white" />
                            Run Analysis
                        </>
                        )}
                    </button>
                </div>
                {error && <div className="mt-4 p-4 bg-red-50 text-red-800 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {error}
                </div>}
            </div>
          </section>

          {/* Results Section */}
          {(result || deepseekResult) && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              <div className="flex items-center justify-center my-8">
                 <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-full max-w-lg"></div>
                 <span className="mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Analysis Results</span>
                 <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-full max-w-lg"></div>
              </div>

              {/* Dual Analysis View */}
              {selectedModel === 'dual' && result && deepseekResult && (
                <DualAnalysisView geminiResult={result} deepseekResult={deepseekResult} />
              )}

              {/* Single Model Results */}
              {selectedModel !== 'dual' && (
                <>
                  {/* DeepSeek Reasoning (if available) */}
                  {deepseekResult && (
                    <ReasoningDisplay reasoning={deepseekResult.reasoning} isStreaming={loading} />
                  )}

                  {/* Executive Summary Card */}
                  <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-8 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-32 bg-white opacity-5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                      <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/10 backdrop-blur rounded-lg">
                                <Sparkles className="w-5 h-5 text-indigo-200" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Executive Summary</h2>
                          </div>
                          <p className="text-indigo-100 text-lg leading-relaxed font-light border-l-4 border-indigo-400 pl-4">
                              {(deepseekResult || result)?.executiveSummary}
                          </p>
                          <div className="mt-6 flex items-center gap-2 text-sm text-indigo-300 font-medium">
                              <BookOpen className="w-4 h-4" />
                              Topic Identified: <span className="text-white bg-white/10 px-2 py-0.5 rounded">{(deepseekResult || result)?.mainTopic}</span>
                          </div>
                      </div>
                  </div>

                  {/* Explainability View - Text Highlighter */}
                  <TextAnalysisHighlighter text={inputText} biasData={(deepseekResult || result)?.bias || []} />

                  {/* Enhanced Visualizations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sentiment Gauge */}
                    <div id="sentiment-chart">
                      <SentimentGauge 
                        sentiment={{
                          positive: (deepseekResult || result)?.sentiment.positiveScore || 0,
                          negative: (deepseekResult || result)?.sentiment.negativeScore || 0,
                          neutral: (deepseekResult || result)?.sentiment.neutralScore || 0
                        }}
                      />
                    </div>

                    {/* Bias Distribution Chart */}
                    <div id="bias-chart">
                      <BiasDistributionChart 
                        biases={[
                          { type: 'Confirmation Bias', count: ((deepseekResult || result)?.bias.filter(b => b.type.toLowerCase().includes('confirmation')).length || 0), color: '#6366f1' },
                          { type: 'Negativity Bias', count: ((deepseekResult || result)?.bias.filter(b => b.type.toLowerCase().includes('negativity')).length || 0), color: '#a855f7' },
                          { type: 'Other Biases', count: ((deepseekResult || result)?.bias.filter(b => !b.type.toLowerCase().includes('confirmation') && !b.type.toLowerCase().includes('negativity')).length || 0), color: '#ec4899' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Confidence Radar Chart */}
                  <div id="confidence-chart">
                    <ConfidenceRadarChart 
                      metrics={[
                        { category: 'Sentiment', score: ((deepseekResult || result)?.sentiment.confidenceScore || 0) * 100 },
                        { category: 'Bias Detection', score: (((deepseekResult || result)?.bias.reduce((sum, b) => sum + b.confidence, 0) || 0) / ((deepseekResult || result)?.bias.length || 1)) * 100 },
                        { category: 'Topic Analysis', score: (((deepseekResult || result)?.topicAnalysis.reduce((sum, t) => sum + t.biasScore, 0) || 0) / ((deepseekResult || result)?.topicAnalysis.length || 1)) * 100 },
                        { category: 'Association Rules', score: (((deepseekResult || result)?.rules.reduce((sum, r) => sum + r.confidence, 0) || 0) / ((deepseekResult || result)?.rules.length || 1)) * 100 },
                        { category: 'Overall', score: 85 }
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PreprocessingView data={(deepseekResult || result)?.preprocessing!} />
                    <SentimentBiasView data={(deepseekResult || result)!} />
                  </div>
                  
                  <TopicBiasHeatmap data={(deepseekResult || result)?.topicAnalysis || []} />
                  
                  <AssociationRulesView data={(deepseekResult || result)!} />

                  {/* Methodology & Ethics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2">
                           <MethodologyExplainer />
                      </div>
                      <div className="md:col-span-1 p-6 bg-slate-100 rounded-2xl border border-slate-200">
                        <h4 className="font-bold text-slate-700 mb-2 text-sm">Ethical Considerations</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            This system analyzes aggregate patterns and does not diagnose individuals. 
                            Algorithms like VADER and Apriori are probabilistic. 
                            Results are for academic research purposes only.
                        </p>
                        <div className="h-1 w-20 bg-slate-300 rounded-full"></div>
                      </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Export Section */}
      <ExportPage analysisResult={deepseekResult || result} inputText={inputText} />

      {/* About Section */}
      <AboutSection />
    </div>
  );
};

export default App;