/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Upload, 
  Zap, 
  AlertCircle, 
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Info,
  Activity,
  Database,
  Smartphone,
  Coins,
  ArrowUpRight,
  Scan
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { analyzeLedger, AnalysisResult } from "@/lib/gemini";
import { fetchMarketData, MarketData } from "@/lib/market";

export default function App() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [vouchCount, setVouchCount] = useState<number>(0);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    const data = await fetchMarketData();
    if (data) {
      setMarketData(data);
    } else {
      // Fallback to demo data if fetch fails
      setMarketData({
        risk_level: "Medium (Demo)",
        base_rate: "15% (Demo)"
      });
    }
  };

  const isConfigMissing = !(import.meta as any).env.VITE_APPS_SCRIPT_URL || 
                          (import.meta as any).env.VITE_APPS_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

  const enableDemoMode = () => {
    setMarketData({
      risk_level: "Medium (Demo)",
      base_rate: "12.5% (Demo)"
    });
    setError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!image || !marketData) {
      setError("Please upload a ledger image first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeLedger(
        image,
        marketData.risk_level,
        marketData.base_rate,
        vouchCount
      );
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#022c22] text-slate-100 font-sans selection:bg-solar/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-forest/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-solar/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-solar p-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <ShieldCheck className="w-6 h-6 text-forest" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase">
                Beyond the <span className="text-solar">Wallet</span>
              </h1>
              <p className="text-[10px] font-bold text-forest-light uppercase tracking-[0.2em] opacity-60">TrustPulse Engine v2.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${marketData ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-xs font-bold text-white">{marketData ? 'Connected' : 'Offline'}</span>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 bg-white/10" />
              {marketData && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Risk</p>
                    <p className={`text-xs font-black ${marketData.risk_level.includes('High') ? 'text-red-400' : 'text-emerald-400'}`}>{marketData.risk_level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Rate</p>
                    <p className="text-xs font-black text-solar">{marketData.base_rate}</p>
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={loadMarketData} className="text-slate-400 hover:text-solar hover:bg-white/5 transition-all">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
          {isConfigMissing && !result && (
            <Alert className="mb-8 glass border-solar/20 bg-solar/5 text-solar flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <AlertTitle className="font-black uppercase tracking-widest text-sm">Configuration Notice</AlertTitle>
                  <AlertDescription className="text-sm opacity-90">
                    Live Back-Office is not configured. Using internal fallback for demo purposes.
                  </AlertDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                className="border-solar/30 text-solar hover:bg-solar hover:text-forest font-bold text-[10px] uppercase tracking-widest shrink-0"
              >
                Start Analysis
              </Button>
            </Alert>
          )}

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. Trust Pulse Card (Large Center) */}
          <Card className="md:col-span-8 md:row-span-3 glass-forest border-forest/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-64 h-64 text-solar" />
            </div>
            
            <CardContent className="h-full p-10 flex flex-col items-center justify-center relative z-10">
              <AnimatePresence mode="wait">
                {!result && !isAnalyzing ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-6"
                  >
                    <div className="w-24 h-24 bg-forest/30 rounded-full flex items-center justify-center mx-auto border border-forest/50 shadow-[0_0_40px_rgba(6,78,59,0.3)]">
                      <Zap className="w-10 h-10 text-solar animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter text-white mb-2">Initialize TrustPulse</h2>
                      <p className="text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
                        Upload your financial data to generate a premium alternative credit score for the informal economy.
                      </p>
                    </div>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-solar hover:bg-solar-light text-forest font-black px-8 py-6 rounded-2xl shadow-xl shadow-solar/20 transition-all hover:scale-105"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Ledger / MoMo
                    </Button>
                  </motion.div>
                ) : isAnalyzing ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-8"
                  >
                    {/* Scanning Animation Placeholder */}
                    <div className="relative w-64 h-64">
                      <div className="absolute inset-0 border-4 border-solar/20 rounded-full" />
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-t-solar rounded-full"
                      />
                      <div className="absolute inset-4 border-2 border-forest/30 rounded-full flex items-center justify-center overflow-hidden">
                        {image && <img src={image} className="w-full h-full object-cover opacity-40 grayscale" />}
                        <motion.div 
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute left-0 right-0 h-1 bg-solar shadow-[0_0_15px_rgba(245,158,11,0.8)] z-20"
                        />
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-solar text-forest text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        Scanning...
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2">Analyzing Invisible Data</h3>
                      <p className="text-slate-300 text-xs uppercase tracking-[0.3em]">Extracting Payment Frequency</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                  >
                    {/* Gauge */}
                    <div className="flex flex-col items-center justify-center relative">
                      <div className="relative w-64 h-64">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle className="text-forest/30 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                          <motion.circle 
                            initial={{ strokeDasharray: "0 251.2" }}
                            animate={{ strokeDasharray: `${(result.trust_score / 100) * 251.2} 251.2` }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className={`${result.status_color === 'Gold' ? 'text-solar' : 'text-emerald-400'} stroke-current`} 
                            strokeWidth="8" 
                            strokeLinecap="round" 
                            fill="transparent" 
                            r="40" 
                            cx="50" 
                            cy="50" 
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-6xl font-black tracking-tighter text-white">{result.trust_score}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trust Index</span>
                        </div>
                      </div>
                      <div className={`mt-6 px-4 py-1 rounded-full border ${result.status_color === 'Gold' ? 'bg-solar/10 border-solar/20 text-solar' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} text-[10px] font-black uppercase tracking-widest`}>
                        {result.status_color === 'Gold' ? 'Premium Tier' : 'Growth Tier'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 text-left">
                      <div>
                        <h4 className="text-[10px] font-black text-solar uppercase tracking-[0.3em] mb-3 opacity-80">The Verdict</h4>
                        <p className="text-xl font-bold text-white leading-tight italic">"{result.verdict}"</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 glass rounded-2xl border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="w-3 h-3 text-solar" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Mentor Advice</span>
                          </div>
                          <p className="text-sm font-medium text-white">{result.advice}</p>
                        </div>
                        <div className="p-4 glass rounded-2xl border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Recommended Action</span>
                          </div>
                          <p className="text-sm font-medium text-white">{result.action}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* 2. Data Ingestion Card (Small Top Right) */}
          <Card className="md:col-span-4 md:row-span-2 glass border-white/10 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-300">Data Source</CardTitle>
                <Smartphone className="w-4 h-4 text-solar" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
                  flex flex-col items-center justify-center gap-2
                  ${image ? 'border-solar/50 bg-solar/5' : 'border-white/20 hover:border-solar/30 hover:bg-white/5'}
                `}
              >
                {image ? (
                  <img src={image} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Drop Evidence</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase">
                  <span>Community Vouching</span>
                  <span>{vouchCount} Members</span>
                </div>
                <Input 
                  type="number" 
                  value={vouchCount} 
                  onChange={(e) => setVouchCount(parseInt(e.target.value) || 0)}
                  className="bg-black/20 border-white/10 text-white h-10 text-sm focus:ring-solar"
                />
              </div>

              <Button 
                onClick={runAnalysis} 
                disabled={isAnalyzing || !image}
                className="w-full bg-forest hover:bg-forest-light text-white font-black uppercase text-[10px] tracking-widest h-10 shadow-lg"
              >
                {isAnalyzing ? 'Processing...' : 'Analyze Data'}
              </Button>
            </CardContent>
          </Card>

          {/* 3. Live Feed Card (Bottom Right) */}
          <Card className="md:col-span-4 md:row-span-2 glass border-white/10 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-300">Live Vouch Feed</CardTitle>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[240px] pr-4">
                <div className="space-y-4">
                  {[
                    { name: "Oga Ben", time: "2m ago", type: "Trade Vouch" },
                    { name: "Mama T", time: "15m ago", type: "Community Vouch" },
                    { name: "Kofi A.", time: "1h ago", type: "Payment Vouch" },
                    { name: "Sister Rose", time: "3h ago", type: "Trade Vouch" },
                    { name: "Baba J", time: "5h ago", type: "Community Vouch" },
                  ].map((vouch, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-forest/40 flex items-center justify-center text-[10px] font-bold text-white">
                          {vouch.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{vouch.name}</p>
                          <p className="text-[10px] text-slate-400">{vouch.type}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{vouch.time}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 4. Market Insights (Small Bottom Left) */}
          <Card className="md:col-span-4 md:row-span-1 glass border-white/10 overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Market Liquidity</p>
                <p className="text-xl font-black text-white">Stable</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          {/* 5. Vision Log (Small Bottom Left) */}
          <Card className="md:col-span-4 md:row-span-1 glass border-white/10 overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between h-full">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Vision Log</p>
                <p className="text-xs font-mono text-slate-200 truncate max-w-[180px]">
                  {result?.incomeConsistency || 'Awaiting Data...'}
                </p>
              </div>
              <div className="w-12 h-12 bg-solar/10 rounded-xl flex items-center justify-center">
                <Scan className="w-6 h-6 text-solar" />
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-solar" />
            <span className="text-sm font-black tracking-tighter uppercase">Beyond the Wallet v2.0</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
            <span>Organic Fintech</span>
            <span>West African Informal Economy</span>
            <span>Powered by Gemini 3</span>
          </div>
        </div>
      </footer>

      {error && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4">
          <Alert variant="destructive" className="glass border-red-500/50 bg-red-500/10 text-red-400 w-80">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-black uppercase tracking-widest text-xs">System Error</AlertTitle>
            <AlertDescription className="text-xs">{error}</AlertDescription>
            <Button variant="ghost" size="icon" onClick={() => setError(null)} className="absolute top-2 right-2 h-6 w-6">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </Alert>
        </div>
      )}
    </div>
  );
}
